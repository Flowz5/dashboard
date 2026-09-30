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

// BoardView est le composant principal du kanban, il affiche les colonnes et gère la modale
const BoardView = () => {
  // On chope l'ID du projet direct depuis l'URL (ex: /board/123)
  const { id } = useParams();
  
  // On récupère le projet actuel depuis notre store pour l'afficher (titre, membres)
  const boards = useBoardStore(state => state.boards);
  const currentBoard = boards.find(b => b.id === id);

  // Toutes les méthodes pour manipuler les tickets et les membres
  const tickets = useBoardStore(state => state.tickets);
  const addTicket = useBoardStore(state => state.addTicket);
  const updateTicket = useBoardStore(state => state.updateTicket);
  const deleteTicket = useBoardStore(state => state.deleteTicket);
  const inviteMember = useBoardStore(state => state.inviteMemberToBoard);
  const listenToTickets = useBoardStore(state => state.listenToTickets);
  const removeMember = useBoardStore(state => state.removeMemberFromBoard);
  
  // On branche l'écouteur Firestore pour recevoir les tickets en temps réel dès qu'on arrive sur le board !
  useEffect(() => {
    if (id) {
      listenToTickets(id);
    }
  }, [id, listenToTickets]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // <-- État pour la barre de recherche

  // Redirection de sécurité si l'URL est bidon (projet introuvable)
  if (!currentBoard) {
    return <Navigate to="/" replace />;
  }

  // --- GESTION DE LA MODALE DES TICKETS ---
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
      // Pour les nouveaux tickets, on n'oublie pas de les attacher au bon board !
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

  // Petite fonction utilitaire pour répartir les tickets dans les bonnes colonnes
  // On filtre bien par boardId pour pas mélanger les tickets des différents projets !
  // ET on filtre par la recherche si l'utilisateur a tapé quelque chose
  const getTicketsByStatus = (status) => {
    return tickets
      .filter(ticket => ticket.boardId === id && ticket.status === status)
      .filter(ticket => {
        if (!searchQuery.trim()) return true; // Si recherche vide, on garde tout
        const lowerQuery = searchQuery.toLowerCase();
        return (
          ticket.title?.toLowerCase().includes(lowerQuery) ||
          ticket.description?.toLowerCase().includes(lowerQuery) ||
          ticket.assignee?.toLowerCase().includes(lowerQuery)
        );
      })
      .map(ticket => (
        <Ticket 
          key={ticket.id} 
          ticket={ticket} 
          onClick={() => handleOpenEditModal(ticket)}
        />
      ));
  };

  // --- GESTION DES MEMBRES ---
  const handleRemoveMember = (email) => {
    // Seul le propriétaire (owner) a le droit de virer quelqu'un !
    if (currentBoard.owner === auth.currentUser?.email && email !== currentBoard.owner) {
      if (window.confirm(`Voulez-vous vraiment retirer ${email} de ce projet ?`)) {
        removeMember(id, email);
      }
    } else if (email !== currentBoard.owner) {
       alert("Seul le propriétaire du projet peut retirer des membres.");
    }
  };

  return (
    <div className="app-container">
      {/* On passe le projet courant à la Navbar pour qu'elle affiche le titre et les membres */}
      <Navbar 
        board={currentBoard} 
        onInviteClick={() => setIsInviteModalOpen(true)}
        onRemoveMember={handleRemoveMember} 
        currentUser={auth.currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Le corps du Kanban, avec nos 5 colonnes */}
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

      {/* Modale pour créer/éditer un ticket */}
      {isModalOpen && (
        <TicketModal 
          ticket={selectedTicket}
          boardMembers={currentBoard.members}
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSubmitModal}
          onDelete={handleDeleteTicket}
        />
      )}
      
      {/* Modale pour inviter un collaborateur */}
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
