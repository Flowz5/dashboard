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

import { useParams } from 'react-router-dom';
import Home from './pages/Home/Home';
import InviteModal from './components/InviteModal/InviteModal';

const BoardView = () => {
  const { id } = useParams();
  const boards = useBoardStore(state => state.boards);
  const currentBoard = boards.find(b => b.id === id);

  const tickets = useBoardStore(state => state.tickets);
  const addTicket = useBoardStore(state => state.addTicket);
  const updateTicket = useBoardStore(state => state.updateTicket);
  const deleteTicket = useBoardStore(state => state.deleteTicket);
  const inviteMember = useBoardStore(state => state.inviteMemberToBoard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Redirection de sécurité si l'URL est bidon
  if (!currentBoard) {
    return <Navigate to="/" replace />;
  }

  const handleOpenCreateModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleSubmitModal = (ticketData) => {
    if (selectedTicket) {
      updateTicket(ticketData);
    } else {
      // On attache bien le ticket au board actuel !
      addTicket({ ...ticketData, boardId: id });
    }
    setIsModalOpen(false);
  };

  const handleDeleteTicket = (ticketId) => {
    deleteTicket(ticketId);
    setIsModalOpen(false);
  };

  const handleInvite = (email) => {
    inviteMember(id, email);
  };

  // On filtre par boardId ET par status
  const getTicketsByStatus = (status) => {
    return tickets
      .filter(ticket => ticket.boardId === id && ticket.status === status)
      .map(ticket => (
        <Ticket 
          key={ticket.id} 
          ticket={ticket} 
          onClick={() => handleOpenEditModal(ticket)}
        />
      ));
  };

  return (
    <div className="app-container">
      {/* On passe le board courant à la Navbar */}
      <Navbar board={currentBoard} onInviteClick={() => setIsInviteModalOpen(true)} />

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
      
      {isInviteModalOpen && (
        <InviteModal 
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleInvite}
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
        {/* La racine pointe maintenant sur la Home */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
        {/* Le kanban pointe sur /board/:id */}
        <Route path="/board/:id" element={user ? <BoardView /> : <Navigate to="/login" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
