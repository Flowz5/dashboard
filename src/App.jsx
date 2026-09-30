import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar/Navbar';
import Column from './components/Column/Column';
import Login from './pages/Login/Login';
import './App.css';

import useBoardStore from './store/useBoardStore';
import Ticket from './components/Ticket/Ticket';

// Ce composant représente le tableau de bord (notre ancienne App)
const Dashboard = () => {
  // on récupère tous les tickets depuis notre store global
  const tickets = useBoardStore(state => state.tickets);

  // petite fonction pour filtrer les tickets selon la colonne
  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status).map(ticket => (
      <Ticket key={ticket.id} ticket={ticket} />
    ));
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="board-container">
        <Column title="To do" headerColor="var(--color-primary)">
          {getTicketsByStatus('To do')}
        </Column>
        <Column title="Doing" headerColor="var(--color-primary)">
          {getTicketsByStatus('Doing')}
        </Column>
        <Column title="Done" headerColor="var(--color-primary)">
          {getTicketsByStatus('Done')}
        </Column>
        <Column title="Mis en Dev" headerColor="var(--color-dark)">
          {getTicketsByStatus('Mis en Dev')}
        </Column>
        <Column title="A mettre en Prod" headerColor="var(--color-dark)">
          {getTicketsByStatus('A mettre en Prod')}
        </Column>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase écoute si un utilisateur est connecté ou non
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Cleanup de l'écouteur quand le composant est démonté
    return () => unsubscribe();
  }, []);

  // Pendant que Firebase vérifie la connexion, on affiche rien (ou un petit loader)
  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Chargement...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Si l'utilisateur est déjà connecté, on l'empêche de voir la page de login et on le renvoie au dashboard */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        
        {/* Si l'utilisateur n'est pas connecté, on l'empêche de voir le dashboard et on le renvoie au login */}
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        
        {/* On redirige tout ce qui n'existe pas vers le dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
