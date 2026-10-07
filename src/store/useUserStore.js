import { create } from 'zustand';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

const useUserStore = create((set) => ({
  userProfile: null,
  users: {}, // Dictionnaire des profils par email
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
        // Init par défaut
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
      console.error("Erreur loadUserProfile:", error);
    }
  },

  updateUserProfile: async (email, updates) => {
    try {
      const userRef = doc(db, 'users', email);
      await updateDoc(userRef, updates);
      set((state) => ({ userProfile: { ...state.userProfile, ...updates } }));
    } catch (error) {
      console.error("Erreur updateUserProfile:", error);
    }
  }
}));

export default useUserStore;
