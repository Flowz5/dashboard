import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import useBoardStore from '../../store/useBoardStore';
import Button from '../../components/Button/Button';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  const boards = useBoardStore(state => state.boards);
  const addBoard = useBoardStore(state => state.addBoard);
  
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // On récupère les boards qui m'appartiennent
  const myBoards = boards.filter(b => b.owner === user?.email);
  
  // On récupère les boards où j'ai été invité
  const invitedBoards = boards.filter(b => b.owner !== user?.email && b.members.includes(user?.email));

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !user) return;
    
    const newBoard = {
      id: Date.now().toString(),
      title: newBoardTitle.trim(),
      owner: user.email,
      members: [user.email], // Le créateur est toujours membre
      createdAt: new Date().toLocaleDateString()
    };
    
    addBoard(newBoard);
    setNewBoardTitle('');
    setIsCreating(false);
    
    // On redirige direct vers le nouveau board !
    navigate(`/board/${newBoard.id}`);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error);
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
                  <h3>{board.title}</h3>
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
