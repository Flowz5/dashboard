import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import useBoardStore from '../../store/useBoardStore';
import useUserStore from '../../store/useUserStore';
import Button from '../../components/Button/Button';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  const boards = useBoardStore(state => state.boards);
  const addBoard = useBoardStore(state => state.addBoard);
  const listenToBoards = useBoardStore(state => state.listenToBoards);
  const deleteBoard = useBoardStore(state => state.deleteBoard);
  
  const userProfile = useUserStore(state => state.userProfile);
  const createFolder = useUserStore(state => state.createFolder);
  const deleteFolder = useUserStore(state => state.deleteFolder);
  const moveBoardToFolder = useUserStore(state => state.moveBoardToFolder);
  
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // "all" | "unassigned" | folderId
  const [activeFolderId, setActiveFolderId] = useState('all');
  const [draggedBoardId, setDraggedBoardId] = useState(null);

  useEffect(() => {
    if (user?.email) {
      listenToBoards(user.email);
    }
  }, [user, listenToBoards]);

  const folders = userProfile?.folders || [];
  const boardFolders = userProfile?.boardFolders || {};

  // --- FILTRES DE PROJETS ---
  const myBoards = boards.filter(b => b.owner === user?.email);
  const invitedBoards = boards.filter(b => b.owner !== user?.email && b.members.includes(user?.email));
  const allAccessibleBoards = [...myBoards, ...invitedBoards];
  
  // On filtre selon le dossier sélectionné dans la sidebar
  const displayedBoards = allAccessibleBoards.filter(board => {
    const folderOfBoard = boardFolders[board.id];
    if (activeFolderId === 'all') return true;
    if (activeFolderId === 'unassigned') return !folderOfBoard;
    return folderOfBoard === activeFolderId;
  });

  // --- ACTIONS PROJETS ---
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !user) return;
    
    const newBoard = {
      title: newBoardTitle.trim(),
      owner: user.email,
      members: [user.email],
      roles: {},
      createdAt: new Date().toLocaleDateString()
    };
    
    const boardId = await addBoard(newBoard);
    
    // Si on est dans un dossier spécifique, on met le projet dedans !
    if (boardId && activeFolderId !== 'all' && activeFolderId !== 'unassigned') {
      await moveBoardToFolder(user.email, boardId, activeFolderId);
    }
    
    setNewBoardTitle('');
    setIsCreating(false);
    
    if (boardId) {
      navigate(`/board/${boardId}`);
    }
  };

  const handleDeleteBoard = async (e, boardId, boardTitle) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le projet "${boardTitle}" ?`)) {
      await deleteBoard(boardId);
      await moveBoardToFolder(user.email, boardId, null); // nettoyage
    }
  };

  // --- ACTIONS DOSSIERS (WORKSPACES) ---
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !user) return;
    await createFolder(user.email, newFolderName.trim());
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleDeleteFolder = async (e, folderId, folderName) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer le workspace "${folderName}" ? Les projets à l'intérieur ne seront PAS supprimés.`)) {
      await deleteFolder(user.email, folderId);
      if (activeFolderId === folderId) setActiveFolderId('all');
    }
  };

  // --- DRAG & DROP DES BOARDS ---
  const handleDragStart = (e, boardId) => {
    setDraggedBoardId(boardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnFolder = async (e, targetFolderId) => {
    e.preventDefault();
    if (!draggedBoardId || !user) return;
    
    // targetFolderId = "unassigned" -> on le sort des dossiers (folderId = null)
    const finalFolderId = targetFolderId === 'unassigned' ? null : targetFolderId;
    await moveBoardToFolder(user.email, draggedBoardId, finalFolderId);
    setDraggedBoardId(null);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  const getFolderName = () => {
    if (activeFolderId === 'all') return 'Tous mes projets';
    if (activeFolderId === 'unassigned') return 'Projets non classés';
    const f = folders.find(f => f.id === activeFolderId);
    return f ? f.name : 'Workspace';
  };

  return (
    <div className="home-layout">
      {/* -- SIDEBAR (WORKSPACES) -- */}
      <aside className="home-sidebar">
        <div className="home-logo">Dashboard Dev</div>
        
        <div className="sidebar-section">
          <div 
            className={`sidebar-item ${activeFolderId === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFolderId('all')}
          >
            🏠 Tous les projets
          </div>
          <div 
            className={`sidebar-item ${activeFolderId === 'unassigned' ? 'active' : ''}`}
            onClick={() => setActiveFolderId('unassigned')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnFolder(e, 'unassigned')}
          >
            📥 Non classés
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">
            <span>🗂️ Workspaces</span>
            <button className="btn-add-folder" onClick={() => setIsCreatingFolder(true)}>+</button>
          </div>
          
          {isCreatingFolder && (
            <form onSubmit={handleCreateFolder} className="create-folder-form">
              <input 
                type="text" 
                placeholder="Nom du workspace..." 
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
              />
              <div className="create-folder-actions">
                <button type="submit" disabled={!newFolderName.trim()}>✓</button>
                <button type="button" onClick={() => setIsCreatingFolder(false)}>✕</button>
              </div>
            </form>
          )}

          <div className="folders-list">
            {folders.map(folder => (
              <div 
                key={folder.id}
                className={`sidebar-item folder-item ${activeFolderId === folder.id ? 'active' : ''}`}
                onClick={() => setActiveFolderId(folder.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnFolder(e, folder.id)}
              >
                <span className="folder-name">📁 {folder.name}</span>
                <button 
                  className="btn-delete-folder"
                  onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                  title="Supprimer le workspace"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <span className="user-email" title={user?.email}>{user?.email}</span>
          <button className="btn-logout-small" onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>
      
      {/* -- MAIN CONTENT -- */}
      <main className="home-main-content">
        <header className="main-header">
          <h1>{getFolderName()}</h1>
          
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
        </header>

        {displayedBoards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            <p>Aucun projet dans ce Workspace.</p>
            <p className="empty-subtext">Créez un nouveau projet, ou glissez-en un ici depuis le menu de gauche.</p>
          </div>
        ) : (
          <div className="boards-grid">
            {displayedBoards.map(board => (
              <div 
                key={board.id} 
                className={`board-card ${board.owner !== user?.email ? 'invited-card' : ''}`}
                onClick={() => navigate(`/board/${board.id}`)}
                draggable
                onDragStart={(e) => handleDragStart(e, board.id)}
                title="Vous pouvez glisser ce projet dans un Workspace à gauche"
              >
                <div className="board-card-header">
                  <h3>{board.title}</h3>
                  {board.owner === user?.email && (
                    <button 
                      className="btn-delete-board" 
                      onClick={(e) => handleDeleteBoard(e, board.id, board.title)}
                      title="Supprimer le projet"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <p>{board.owner === user?.email ? `Créé le ${board.createdAt}` : `Propriétaire: ${board.owner}`}</p>
                <div className="board-card-footer">
                  <span>{board.members.length} membre(s)</span>
                  <span className="go-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
