import { create } from 'zustand';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

// On se crée un p'tit store Zustand pour garder en mémoire les profils des utilisateurs
// Ça évite de refaire des requêtes Firestore partout dans l'appli !
const useUserStore = create((set) => ({
  userProfile: null, // Le profil du mec connecté
  users: {}, // Un gros dico qui stocke tous les profils avec l'email comme clé

  // On écoute les changements sur la collection "users" en temps réel
  // Comme ça, si un mec change sa couleur de profil, ça se met à jour direct sur nos tickets
  listenToUsers: () => {
    const q = collection(db, "users");
    return onSnapshot(q, (snapshot) => {
      const newUsers = {};
      snapshot.forEach(doc => { newUsers[doc.id] = doc.data(); });
      set({ users: newUsers });
    });
  },
  
  // Fonction pour charger le propre profil de l'utilisateur quand il se connecte
  loadUserProfile: async (email) => {
    if (!email) return;
    try {
      const userRef = doc(db, 'users', email);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // C'est bon, on a trouvé son profil, on le met dans le state
        set({ userProfile: userSnap.data() });
      } else {
        // Le mec n'a pas encore de profil, on lui en crée un par défaut
        // On prend la première partie de son email comme pseudo pour commencer
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

  // Pour sauvegarder les modifications (quand le mec change sa photo, sa couleur...)
  updateUserProfile: async (email, updates) => {
    try {
      const userRef = doc(db, 'users', email);
      await updateDoc(userRef, updates);
      // On met à jour le state local direct pour pas attendre le rechargement
      set((state) => ({ userProfile: { ...state.userProfile, ...updates } }));
    } catch (error) {
      console.error("Erreur en voulant sauvegarder le profil :", error);
    }
  }
}));

export default useUserStore;
