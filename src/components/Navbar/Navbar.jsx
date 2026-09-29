import './Navbar.css';
import Button from '../Button/Button';

const Navbar = () => {
  return (
    <nav className="Navbar">
      <div className="Navbar-logo">
        <a id="logo" href="/">Kanban Board</a>
      </div>

      <div className="Navbar-search">
        <input id="search-bar" name="search" type="text" placeholder="Search tasks..." />
        {/* j'ai remis le bouton loupe à l'intérieur de la search bar comme sur ton image */}
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