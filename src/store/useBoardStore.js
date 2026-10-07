import { create } from 'zustand';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  arrayUnion,
  arrayRemove,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// Voici notre store global Zustand !
// Il ne sauvegarde plus en local, il sert de "pont" entre nos composants React et Firebase Firestore.
const useBoardStore = create((set, get) => ({
  boards: [],
  tickets: [],
  
  // Fonctions pour stocker les unsubscribe afin de pouvoir couper l'écoute quand on change de page
  unsubscribeBoards: null,
  unsubscribeTickets: null,

  // ==========================================
  // ÉCOUTEURS TEMPS RÉEL (onSnapshot)
  // ==========================================
  
  // Écoute tous les boards où l'utilisateur est propriétaire OU membre
  listenToBoards: (userEmail) => {
    // Si on écoutait déjà, on coupe le flux pour pas faire de doublons
    if (get().unsubscribeBoards) get().unsubscribeBoards(); 

    // On crée la requête : on veut les documents de 'boards' où userEmail est dans le tableau 'members'
    const q = query(
      collection(db, 'boards'), 
      where('members', 'array-contains', userEmail)
    );

    // onSnapshot s'active à chaque fois que la BDD change en temps réel
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // On fusionne les données et on attache l'ID du document à la fin pour pas qu'il soit écrasé
      const boardsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      set({ boards: boardsData });
    }, (error) => {
      console.error("Erreur d'écoute des boards:", error);
    });

    set({ unsubscribeBoards: unsubscribe });
  },

  // Écoute uniquement les tickets du board actuel
  listenToTickets: (boardId) => {
    if (get().unsubscribeTickets) get().unsubscribeTickets();

    const q = query(
      collection(db, 'tickets'), 
      where('boardId', '==', boardId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      set({ tickets: ticketsData });
    }, (error) => {
      console.error("Erreur d'écoute des tickets:", error);
    });

    set({ unsubscribeTickets: unsubscribe });
  },

  // ==========================================
  // GESTION DES BOARDS (Écriture Firestore)
  // ==========================================
  
  addBoard: async (boardData) => {
    try {
      // addDoc génère l'ID automatiquement côté Firebase
      const docRef = await addDoc(collection(db, 'boards'), boardData);
      return docRef.id; // On retourne l'ID pour pouvoir naviguer direct dessus
    } catch (error) {
      console.error("Erreur addBoard:", error);
      alert("Impossible de créer le projet. Vérifie que tu as bien créé la base de données Firestore dans ta console Firebase (en mode test). Erreur : " + error.message);
      return null;
    }
  },
  
  deleteBoard: async (boardId) => {
    try {
      // 1. On supprime d'abord tous les tickets liés à ce projet
      // pour pas laisser de "déchets" (tickets fantômes) dans la base de données.
      const q = query(collection(db, 'tickets'), where('boardId', '==', boardId));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });
      await batch.commit(); // Exécute toutes les suppressions de tickets d'un coup

      // 2. Ensuite on supprime le projet lui-même
      await deleteDoc(doc(db, 'boards', boardId));
    } catch (error) {
      console.error("Erreur deleteBoard:", error);
    }
  },
  
  inviteMemberToBoard: async (boardId, email, role = 'editor') => {
    try {
      const boardRef = doc(db, 'boards', boardId);
      // arrayUnion ajoute l'élément seulement s'il n'y est pas déjà (super pratique !)
      await updateDoc(boardRef, {
        members: arrayUnion(email),
        [`roles.${email}`]: role
      });
    } catch (error) {
      console.error("Erreur inviteMember:", error);
    }
  },

  updateMemberRole: async (boardId, email, role) => {
    try {
      const boardRef = doc(db, 'boards', boardId);
      await updateDoc(boardRef, {
        [`roles.${email}`]: role
      });
    } catch (error) {
      console.error("Erreur updateMemberRole:", error);
    }
  },

  removeMemberFromBoard: async (boardId, email) => {
    try {
      const boardRef = doc(db, 'boards', boardId);
      // On utilise arrayRemove pour enlever du tableau, et deleteField pour supprimer la clé de l'objet roles
      const { deleteField } = await import('firebase/firestore');
      await updateDoc(boardRef, {
        members: arrayRemove(email),
        [`roles.${email}`]: deleteField()
      });
    } catch (error) {
      console.error("Erreur removeMember:", error);
    }
  },

  // ==========================================
  // GESTION DES TICKETS (Écriture Firestore)
  // ==========================================
  
  addTicket: async (ticketData) => {
    try {
      // On retire 'id' si jamais il y a un null ou un ancien ID qui traîne, pour laisser Firebase gérer
      const { id, ...data } = ticketData;
      await addDoc(collection(db, 'tickets'), data);
    } catch (error) {
      console.error("Erreur addTicket:", error);
    }
  },
  
  updateTicket: async (updatedTicket) => {
    try {
      const { id, ...data } = updatedTicket;
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, data);
    } catch (error) {
      console.error("Erreur updateTicket:", error);
    }
  },
  
  deleteTicket: async (ticketId) => {
    try {
      await deleteDoc(doc(db, 'tickets', ticketId));
    } catch (error) {
      console.error("Erreur deleteTicket:", error);
    }
  },
  
  // C'est ça qui est appelé au Drag and Drop
  moveTicket: async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, { status: newStatus });
    } catch (error) {
      console.error("Erreur moveTicket:", error);
    }
  }
}));

export default useBoardStore;
