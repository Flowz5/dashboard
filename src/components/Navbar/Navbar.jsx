import './Navbar.css';
import Button from '../Button/Button';

const Navbar = () => {
  return (
    <nav className="Navbar">
      <div className="Navbar-logo">
        {/* le titre définitif du projet */}
        <a id="logo" href="/">Dashboard Dev</a>
      </div>

      <div className="Navbar-search">
        <input id="search-bar" name="search" type="text" placeholder="Search tasks..." />
        {/* bouton loupe intégré dans la barre de recherche */}
        <button id="search-button">
          <img src="/src/assets/search.png" alt="Search" />
        </button>
      </div>

      <div className="Navbar-links">
        <ul>
          <li>
            <a href="/">
              <img src="/src/assets/calendar.png" alt="Calendar" />
            </a>
          </li>
          <li>
            <a href="/">
              <img src="/src/assets/notif.png" alt="Notification" />
            </a>
          </li>
          <li>
            <Button onClick={() => alert('Bouton cliqué !')}>
              Mon compte
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;