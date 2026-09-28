import './Navbar.css';
import Button from '../Button/Button';

const Navbar = () => {
  return (
    <div className="Navbar">
      <nav>
        <div className="Navbar-logo">
          <a id="logo" href="/">DevBoard</a>
        </div>

        <div className="Navbar-search">
          <input id="search-bar" name="search" type="text" placeholder="Search..." />
          <Button id="search-button">
            <img src="/../src/assets/search.png" height={28} alt="Search" />
          </Button>
        </div>

        <div className="Navbar-links">
          <ul>
            <li>
              <a href="/">
                <img src="/../src/assets/calendar.png" height={28} alt="Calendar" />
              </a>
            </li>
            <li>
              <a href="/">
                <img src="/../src/assets/notif.png" height={28} alt="Notification" />
              </a>
            </li>
            <Button onClick={() => alert('Bouton cliqué !')}>
              Mon compte
            </Button>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;