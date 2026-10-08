import { create } from 'zustand';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where } from 'firebase/firestore';

const useUserStore = create((set, get) => ({
  userProfile: null,
  users: {},
  myTickets: [],
  unsubscribeMyTickets: null,

  listenToMyTickets: (email) => {
    const state = get();
    if (state.unsubscribeMyTickets) state.unsubscribeMyTickets();
    if (!email) return;
    const q = query(collection(db, 'tickets'), where('assignee', '==', email));
    const unsub = onSnapshot(q, (snapshot) => {
      const t = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      set({ myTickets: t });
    });
    set({ unsubscribeMyTickets: unsub });
  },

  listenToUsers: () => {
    const q = collection(db, "users");
    return onSnapshot(q, (snapshot) => {
      const newUsers = {};
      snapshot.forEach(doc => { newUsers[doc.id] = doc.data(); });
      set({ users: newUsers });
    });
  },
  
  loadUserProfile: async (email) => {
    if (!email) return;
    try {
      const userRef = doc(db, 'users', email);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        set({ userProfile: userSnap.data() });
      } else {
        const initialProfile = { 
          email, 
          displayName: email.split('@')[0], 
          photoURL: '', 
          color: 'var(--color-primary)' 
        };
        await setDoc(userRef, initialProfile);
        set({ userProfile: initialProfile });
      }
    } catch (error) {
      console.error("Oops, galère pour charger le profil :", error);
    }
  },

  updateUserProfile: async (email, updates) => {
    try {
      const userRef = doc(db, 'users', email);
      await updateDoc(userRef, updates);
      set((state) => ({ userProfile: { ...state.userProfile, ...updates } }));
    } catch (error) {
      console.error("Erreur en voulant sauvegarder le profil :", error);
    }
  },
  
  // -- GESTION DES WORKSPACES (DOSSIERS) --
  createFolder: async (email, folderName) => {
    const state = get();
    const currentFolders = state.userProfile?.folders || [];
    const newFolder = {
      id: 'folder_' + Date.now().toString(),
      name: folderName
    };
    await state.updateUserProfile(email, {
      folders: [...currentFolders, newFolder]
    });
  },

  deleteFolder: async (email, folderId) => {
    const state = get();
    const currentFolders = state.userProfile?.folders || [];
    const currentBoardFolders = state.userProfile?.boardFolders || {};
    
    const newFolders = currentFolders.filter(f => f.id !== folderId);
    
    const newBoardFolders = { ...currentBoardFolders };
    Object.keys(newBoardFolders).forEach(boardId => {
      if (newBoardFolders[boardId] === folderId) {
        delete newBoardFolders[boardId];
      }
    });

    await state.updateUserProfile(email, {
      folders: newFolders,
      boardFolders: newBoardFolders
    });
  },

  moveBoardToFolder: async (email, boardId, folderId) => {
    const state = get();
    const currentBoardFolders = state.userProfile?.boardFolders || {};
    
    const newBoardFolders = { ...currentBoardFolders };
    if (folderId === null) {
      delete newBoardFolders[boardId];
    } else {
      newBoardFolders[boardId] = folderId;
    }

    await state.updateUserProfile(email, {
      boardFolders: newBoardFolders
    });
  }
}));

export default useUserStore;
