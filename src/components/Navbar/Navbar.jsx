import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';
import Button from '../Button/Button';
import searchIcon from '../../assets/search.png';
import calendarIcon from '../../assets/calendar.png';
import notifIcon from '../../assets/notif.png';

const Navbar = ({ board, onInviteClick, onRemoveMember, currentUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <nav className="Navbar">
      <div className="Navbar-logo">
        <span id="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          Dashboard Dev
        </span>
        {board && (
          <span className="navbar-board-title">
            <span className="separator">/</span> {board.title}
          </span>
        )}
      </div>

      <div className="Navbar-search">
        <input id="search-bar" name="search" type="text" placeholder="Search tasks..." />
        <button id="search-button">
          <img src={searchIcon} alt="Search" />
        </button>
      </div>

      <div className="Navbar-links">
        {board && (
          <div className="navbar-members">
            <div className="members-avatars">
              {board.members.map((email, idx) => (
                <div 
                  key={idx} 
                  className="member-avatar" 
                  title={`${email} (cliquer pour retirer)`}
                  style={{ 
                    zIndex: 10 - idx, 
                    cursor: currentUser?.email === board.owner && email !== board.owner ? 'pointer' : 'default'
                  }} 
                  onClick={() => {
                    if (onRemoveMember) {
                      onRemoveMember(email);
                    }
                  }}
                >
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