import './Navbar.css';
import Button from '../Button/Button';

const Navbar = () => {
  return (
    /* J'ai fusionné la balise nav avec le container principal, c'est plus propre sémantiquement */
    <nav className="Navbar">
      <div className="Navbar-logo">
        <a id="logo" href="/">DevBoard</a>
      </div>

      <div className="Navbar-search">
        <input id="search-bar" name="search" type="text" placeholder="Search..." />
        {/* J'ai viré le composant Button pour l'icône de recherche, un simple button HTML suffit pour une icône */}
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
            {/* on utilise notre vrai bouton pour le compte */}
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