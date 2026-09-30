import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import useBoardStore from '../../store/useBoardStore';
import Button from '../../components/Button/Button';
import './Home.css';

// Composant de la page d'accueil (Home)
// C'est le carrefour où l'utilisateur arrive après la connexion.
// Il permet de voir ses projets et ceux où il est invité.
const Home = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  // Récupération des données et des méthodes du store
  const boards = useBoardStore(state => state.boards);
  const addBoard = useBoardStore(state => state.addBoard);
  const listenToBoards = useBoardStore(state => state.listenToBoards);
  const unsubscribeBoards = useBoardStore(state => state.unsubscribeBoards);
  const deleteBoard = useBoardStore(state => state.deleteBoard);
  
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // On lance l'écoute temps réel (Firestore) des boards dès qu'on arrive sur la page d'accueil.
  useEffect(() => {
    if (user?.email) {
      listenToBoards(user.email);
    }
    // On garde l'écouteur actif pour que tout se mette à jour direct
  }, [user, listenToBoards]);

  // Tri automatique des projets :
  // D'un côté "Mes boards" (ceux que j'ai créés)
  const myBoards = boards.filter(b => b.owner === user?.email);
  
  // De l'autre "Mes invitations" (le owner n'est pas moi, mais je suis dans les members)
  const invitedBoards = boards.filter(b => b.owner !== user?.email && b.members.includes(user?.email));

  // --- CRÉATION DE PROJET ---
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !user) return;
    
    // On prépare le nouveau document projet
    const newBoard = {
      title: newBoardTitle.trim(),
      owner: user.email,
      members: [user.email], // Le créateur est toujours membre d'office !
      createdAt: new Date().toLocaleDateString()
    };
    
    // On enregistre dans Firestore, et on attend le retour de l'ID généré par Firebase
    const boardId = await addBoard(newBoard);
    
    setNewBoardTitle('');
    setIsCreating(false);
    
    // Si la création a réussi (ID reçu), on redirige tout de suite vers le nouveau Kanban
    if (boardId) {
      navigate(`/board/${boardId}`);
    }
  };

  // --- SUPPRESSION DE PROJET ---
  const handleDeleteBoard = async (e, boardId, boardTitle) => {
    e.stopPropagation(); // Empêche le clic d'ouvrir le dashboard
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le projet "${boardTitle}" et tous ses tickets ?`)) {
      await deleteBoard(boardId);
    }
  };

  // --- DÉCONNEXION ---
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-logo">Dashboard Dev</div>
        <div className="home-user-actions">
          <span className="user-email">{user?.email}</span>
          <Button onClick={handleLogout}>Déconnexion</Button>
        </div>
      </header>
      
      <main className="home-main">
        <div className="home-top-section">
          <h1>Bienvenue sur vos projets</h1>
          
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)}>+ Nouveau Dashboard</Button>
          ) : (
            <form onSubmit={handleCreateBoard} className="create-board-form">
              <input 
                type="text" 
                placeholder="Nom du projet..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                autoFocus
              />
              <Button type="submit" disabled={!newBoardTitle.trim()}>Créer</Button>
              <button type="button" className="btn-cancel" onClick={() => setIsCreating(false)}>Annuler</button>
            </form>
          )}
        </div>

        <section className="boards-section">
          <h2>Mes Dashboards</h2>
          {myBoards.length === 0 ? (
            <p className="empty-state">Vous n'avez pas encore créé de dashboard.</p>
          ) : (
            <div className="boards-grid">
              {myBoards.map(board => (
                <div key={board.id} className="board-card" onClick={() => navigate(`/board/${board.id}`)}>
                  <div className="board-card-header">
                    <h3>{board.title}</h3>
                    <button 
                      className="btn-delete-board" 
                      onClick={(e) => handleDeleteBoard(e, board.id, board.title)}
                      title="Supprimer le projet"
                    >
                      &times;
                    </button>
                  </div>
                  <p>Créé le {board.createdAt}</p>
                  <div className="board-card-footer">
                    <span>{board.members.length} membre(s)</span>
                    <span className="go-arrow">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="boards-section">
          <h2>Dashboards où je suis invité(e)</h2>
          {invitedBoards.length === 0 ? (
            <p className="empty-state">Vous n'avez pas encore d'invitation.</p>
          ) : (
            <div className="boards-grid">
              {invitedBoards.map(board => (
                <div key={board.id} className="board-card invited-card" onClick={() => navigate(`/board/${board.id}`)}>
                  <h3>{board.title}</h3>
                  <p>Propriétaire : {board.owner}</p>
                  <div className="board-card-footer">
                    <span>{board.members.length} membre(s)</span>
                    <span className="go-arrow">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
