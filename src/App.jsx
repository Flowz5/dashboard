import Navbar from './components/Navbar/Navbar';
import Column from './components/Column/Column';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* j'ai viré la div en trop qui entourait la Navbar, le composant fait déjà le taf */}
      <Navbar />

      <div className="board-container">
        {/* on unifie les colonnes pour un rendu plus pro, pas besoin de surcharger les couleurs */}
        <Column title="To do" />
        <Column title="Doing" />
        <Column title="Done" />
        <Column title="Mis en Dev" />
        <Column title="A mettre en Prod" />
      </div>
    </div>
  );
}

export default App;
