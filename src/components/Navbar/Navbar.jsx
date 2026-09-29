import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';
import Button from '../Button/Button';
import searchIcon from '../../assets/search.png';
import calendarIcon from '../../assets/calendar.png';
import notifIcon from '../../assets/notif.png';

const Navbar = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Pas besoin de navigate('/login') ici car App.jsx écoute l'état de connexion 
      // et redirigera automatiquement vers /login quand l'utilisateur passera à null !
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <nav className="Navbar">
      <div className="Navbar-logo">
        <a id="logo" href="/">Dashboard Dev</a>
      </div>

      <div className="Navbar-search">
        <input id="search-bar" name="search" type="text" placeholder="Search tasks..." />
        <button id="search-button">
          <img src={searchIcon} alt="Search" />
        </button>
      </div>

      <div className="Navbar-links">
        <ul>
          <li>
            <a href="/">
              <img src={calendarIcon} alt="Calendar" />
            </a>
          </li>
          <li>
            <a href="/">
              <img src={notifIcon} alt="Notification" />
            </a>
          </li>
          <li>
            {/* on remplace le petit alert par une vraie fonction de déconnexion */}
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