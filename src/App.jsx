import Button from './components/Button/Button';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Button onClick={() => alert('Bouton cliqué !')}>
        Mon compte
      </Button>
    </div>
  );
}

export default App;
