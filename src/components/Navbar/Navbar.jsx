import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';
import Button from '../Button/Button';
import searchIcon from '../../assets/search.png';
import calendarIcon from '../../assets/calendar.png';
import notifIcon from '../../assets/notif.png';
import useThemeStore from '../../store/useThemeStore';
import useUserStore from '../../store/useUserStore';

// La barre de navigation du haut (Logo, Recherche, Membres, Déconnexion)
const Navbar = ({ board, onInviteClick, onRemoveMember, currentUser, searchQuery, onSearchChange, sortOption, onSortChange, onStatsClick, userRole, onProfileClick }) => {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  // -- CALCUL DES NOTIFICATIONS POUR LE BADGE --
  const boards = useBoardStore(state => state.boards);
  const unreadNotifsCount = React.useMemo(() => {
    if (!currentUser) return 0;
    const now = new Date();
    let count = 0;
    const dismissedNotifs = userProfile?.dismissedNotifs || [];

    boards.forEach(board => {
      board.columns.forEach(col => {
        const isDone = col.title.toLowerCase().includes('terminé') || col.title.toLowerCase().includes('done') || col.title.toLowerCase().includes('fini');
        col.tickets.forEach(ticket => {
          if (ticket.assignee === currentUser.email && !isDone) {
            let notifId = 'assigned-' + ticket.id;
            if (ticket.dueDate) {
              const diffTime = new Date(ticket.dueDate).getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays < 0) notifId = 'overdue-' + ticket.id;
              else if (diffDays <= 2) notifId = 'due-soon-' + ticket.id;
            }
            if (!dismissedNotifs.includes(notifId)) {
              count++;
            }
          }
        });
      });
    });
    return count;
  }, [boards, currentUser, userProfile?.dismissedNotifs]);

  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const userProfile = useUserStore(state => state.userProfile);

  // -- DÉCONNEXION --
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <nav className="Navbar">
      {/* Clic sur le logo = Retour à la page d'accueil */}
      <div className="Navbar-logo">
        <span id="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          Dashboard Dev
        </span>
        {/* On affiche le nom du projet uniquement si on est dans un board */}
        {board && (
          <span className="navbar-board-title">
            <span className="separator">/</span> {board.title}
          </span>
        )}
      </div>

      <div className="Navbar-controls-center">
        <div className="Navbar-search">
          {board && onSearchChange ? (
            <input 
              id="search-bar" 
              name="search" 
              type="text" 
              placeholder="Chercher un ticket, assigné..." 
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          ) : (
            <input id="search-bar" name="search" type="text" placeholder="Rechercher..." disabled />
          )}
          <button id="search-button">
            <img src={searchIcon} alt="Search" />
          </button>
        </div>

        {/* Menu de tri uniquement si on est dans un projet */}
        {board && onSortChange && (
          <select 
            className="Navbar-sort" 
            value={sortOption || 'created_desc'}
            onChange={(e) => onSortChange(e.target.value)}
            title="Trier les tickets"
          >
            <option value="created_desc">Le plus récent</option>
            <option value="created_asc">Le plus ancien</option>
            <option value="priority_desc">Priorité (Haute → Basse)</option>
            <option value="dueDate_asc">Date butoire</option>
            <option value="title_asc">De A à Z</option>
          </select>
        )}

        {board && (
          <button 
            className="btn-stats" 
            onClick={onStatsClick} 
            title="Voir les statistiques du projet"
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--color-border)', 
              color: 'var(--color-text)', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontSize: '13px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Stats
          </button>
        )}
        
        {/* On affiche les membres et le bouton "Inviter" seulement dans un board */}
        {board && (
          <div className="navbar-members">
            <div className="members-avatars">
              {/* On boucle sur les adresses email pour créer les p'tits ronds */}
              {board.members.map((email, idx) => {
                const isOwner = email === board.owner;
                const roleLabel = isOwner ? 'Propriétaire' : (board.roles?.[email] === 'viewer' ? 'Lecteur' : 'Éditeur');
                
                // On récupère le profil de ce membre (s'il existe en base)
                const memberProfile = useUserStore.getState().users?.[email];
                const displayName = memberProfile?.displayName || email;
                const initial = (displayName || "?").charAt(0).toUpperCase();
                const bgColor = memberProfile?.color || 'var(--color-primary)';
                const photoURL = memberProfile?.photoURL || '';

                return (
                <div 
                  key={idx} 
                  className="member-avatar" 
                  title={`${displayName} - ${roleLabel}${currentUser?.email === board.owner && !isOwner ? ' (cliquer pour retirer)' : ''}`}
                  style={{ 
                    // zIndex pour que le premier rond soit devant le deuxième
                    zIndex: 10 - idx, 
                    // Le curseur passe en main uniquement si c'est le propriétaire qui survole les AUTRES membres
                    cursor: currentUser?.email === board.owner && email !== board.owner ? 'pointer' : 'default',
                    backgroundColor: bgColor,
                    backgroundImage: photoURL ? `url(${photoURL})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '2px solid var(--color-navbar)'
                  }} 
                  onClick={() => {
                    // Au clic, on demande à App.jsx de s'en occuper
                    if (onRemoveMember) {
                      onRemoveMember(email);
                    }
                  }}
                >
                  {/* On affiche la 1ère lettre du pseudo/email, sauf s'il y a une photo */}
                  {!photoURL && initial}
                </div>
                );
              })}
            </div>
            {userRole !== "viewer" && (
              <button className="invite-nav-btn" onClick={onInviteClick}>
                + Inviter
              </button>
            )}
          </div>
        )}
      </div>

      <div className="Navbar-links">

        <ul>
          <li>
            <button className="theme-toggle-btn" onClick={toggleTheme} title={isDarkMode ? "Passer au thème clair" : "Passer au thème sombre"}>
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </li>
          <li>
            <div 
              className="navbar-calendar-btn"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
              title="Calendrier (Bientôt disponible)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </li>
          <li>
            <div 
              className="navbar-notif-btn" 
              onClick={() => setIsNotifModalOpen(true)}
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {unreadNotifsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                </span>
              )}
            </div>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button onClick={handleLogout}>
              Déconnexion
            </Button>
            <div 
              className="navbar-profile-btn" 
              onClick={onProfileClick}
              title="Mon profil"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: userProfile?.color || 'var(--color-primary)',
                backgroundImage: userProfile?.photoURL ? `url(${userProfile.photoURL})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '2px solid var(--color-border)'
              }}
            >
              {!userProfile?.photoURL && (userProfile?.displayName ? String(userProfile.displayName).charAt(0).toUpperCase() : (currentUser?.email ? String(currentUser.email).charAt(0).toUpperCase() : '?'))}
            </div>
          </li>
        </ul>
      </div>

      {isNotifModalOpen && (
        <NotificationsModal onClose={() => setIsNotifModalOpen(false)} />
      )}
    </nav>

  );
};

export default Navbar;