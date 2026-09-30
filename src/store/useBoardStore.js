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
  arrayRemove
} from 'firebase/firestore';

// On n'utilise plus persist, c'est Firestore la source de vérité !
const useBoardStore = create((set, get) => ({
  boards: [],
  tickets: [],
  
  // Fonctions pour stocker les unsubscribe afin de pouvoir couper l'écoute quand on change de page
  unsubscribeBoards: null,
  unsubscribeTickets: null,

  // -- ÉCOUTEURS TEMPS RÉEL --
  
  // Écoute tous les boards où l'utilisateur est propriétaire OU membre
  listenToBoards: (userEmail) => {
    if (get().unsubscribeBoards) get().unsubscribeBoards(); // nettoie l'ancien écouteur

    const q = query(
      collection(db, 'boards'), 
      where('members', 'array-contains', userEmail)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ boards: boardsData });
    }, (error) => {
      console.error("Erreur d'écoute des boards:", error);
    });

    set({ unsubscribeBoards: unsubscribe });
  },

  // Écoute les tickets d'un board spécifique
  listenToTickets: (boardId) => {
    if (get().unsubscribeTickets) get().unsubscribeTickets();

    const q = query(
      collection(db, 'tickets'), 
      where('boardId', '==', boardId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ tickets: ticketsData });
    }, (error) => {
      console.error("Erreur d'écoute des tickets:", error);
    });

    set({ unsubscribeTickets: unsubscribe });
  },

  // -- GESTION DES BOARDS (Écriture Firestore) --
  
  addBoard: async (boardData) => {
    try {
      // addDoc génère l'ID automatiquement, donc on n'a plus besoin de passer un ID généré au pif
      const docRef = await addDoc(collection(db, 'boards'), boardData);
      return docRef.id; // On retourne l'ID pour pouvoir naviguer direct dessus
    } catch (error) {
      console.error("Erreur addBoard:", error);
      alert("Impossible de créer le projet. Vérifie que tu as bien créé la base de données Firestore dans ta console Firebase (en mode test). Erreur : " + error.message);
      return null;
    }
  },
  
  inviteMemberToBoard: async (boardId, email) => {
    try {
      const boardRef = doc(db, 'boards', boardId);
      // arrayUnion ajoute l'élément seulement s'il n'y est pas déjà
      await updateDoc(boardRef, {
        members: arrayUnion(email)
      });
    } catch (error) {
      console.error("Erreur inviteMember:", error);
    }
  },

  removeMemberFromBoard: async (boardId, email) => {
    try {
      const boardRef = doc(db, 'boards', boardId);
      await updateDoc(boardRef, {
        members: arrayRemove(email)
      });
    } catch (error) {
      console.error("Erreur removeMember:", error);
    }
  },

  // -- GESTION DES TICKETS (Écriture Firestore) --
  
  addTicket: async (ticketData) => {
    try {
      await addDoc(collection(db, 'tickets'), ticketData);
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
