import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';
import Button from '../Button/Button';
import searchIcon from '../../assets/search.png';
import calendarIcon from '../../assets/calendar.png';
import notifIcon from '../../assets/notif.png';
import useThemeStore from '../../store/useThemeStore';

// La barre de navigation du haut (Logo, Recherche, Membres, Déconnexion)
const Navbar = ({ board, onInviteClick, onRemoveMember, currentUser, searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

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

      <div className="Navbar-links">
        {/* On affiche les membres et le bouton "Inviter" seulement dans un board */}
        {board && (
          <div className="navbar-members">
            <div className="members-avatars">
              {/* On boucle sur les adresses email pour créer les p'tits ronds */}
              {board.members.map((email, idx) => (
                <div 
                  key={idx} 
                  className="member-avatar" 
                  title={`${email} (cliquer pour retirer)`}
                  style={{ 
                    // zIndex pour que le premier rond soit devant le deuxième
                    zIndex: 10 - idx, 
                    // Le curseur passe en main uniquement si c'est le propriétaire qui survole les AUTRES membres
                    cursor: currentUser?.email === board.owner && email !== board.owner ? 'pointer' : 'default'
                  }} 
                  onClick={() => {
                    // Au clic, on demande à App.jsx de s'en occuper
                    if (onRemoveMember) {
                      onRemoveMember(email);
                    }
                  }}
                >
                  {/* On affiche la 1ère lettre de l'email en majuscule */}
                  {email.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <button className="invite-nav-btn" onClick={onInviteClick}>
              + Inviter
            </button>
          </div>
        )}

        <ul>
          <li>
            <button className="theme-toggle-btn" onClick={toggleTheme} title={isDarkMode ? "Passer au thème clair" : "Passer au thème sombre"}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </li>
          <li>
            <a href="#">
              <img src={calendarIcon} alt="Calendar" />
            </a>
          </li>
          <li>
            <a href="#">
              <img src={notifIcon} alt="Notification" />
            </a>
          </li>
          <li>
            <Button onClick={handleLogout}>
              Déconnexion
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;