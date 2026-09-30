import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar/Navbar';
import Column from './components/Column/Column';
import Login from './pages/Login/Login';
import Ticket from './components/Ticket/Ticket';
import TicketModal from './components/TicketModal/TicketModal';
import useBoardStore from './store/useBoardStore';
import './App.css';

const Dashboard = () => {
  const tickets = useBoardStore(state => state.tickets);
  const addTicket = useBoardStore(state => state.addTicket);
  const updateTicket = useBoardStore(state => state.updateTicket);
  const deleteTicket = useBoardStore(state => state.deleteTicket);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Ouvre la modale pour créer un nouveau ticket
  const handleOpenCreateModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(true);
  };

  // Ouvre la modale pour éditer un ticket existant
  const handleOpenEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleSubmitModal = (ticketData) => {
    if (selectedTicket) {
      updateTicket(ticketData);
    } else {
      addTicket(ticketData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTicket = (ticketId) => {
    deleteTicket(ticketId);
    setIsModalOpen(false);
  };

  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status).map(ticket => (
      <Ticket 
        key={ticket.id} 
        ticket={ticket} 
        onClick={() => handleOpenEditModal(ticket)}
      />
    ));
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="board-container">
        <Column title="To do" headerColor="var(--color-primary)" onAddClick={handleOpenCreateModal}>
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

      {isModalOpen && (
        <TicketModal 
          ticket={selectedTicket}
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSubmitModal}
          onDelete={handleDeleteTicket}
        />
      )}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Chargement...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
