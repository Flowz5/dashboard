import './Navbar.css';
import Button from '../Button/Button';


const Navbar = () => {
  return (
    <div className="Navbar">
      <nav>
        <div className="Navbar-logo"><a href="/">DevBoard</a></div>
        <div className='Navbar-links'>
          <ul>
            <input id="search-bar" name="search" type="text" placeholder="Search..."></input>
            <input id="search-button" name="search_submit" type="submit" value="Search"></input>
            <li><a href="/">Calendar</a></li>
            <li><a href="/">Notifs</a></li>
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
