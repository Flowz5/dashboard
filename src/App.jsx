import Column from './components/Column/Column';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* l'espace de la navbar du collègue en attendant qu'il merge */}
      <div className="navbar-placeholder">
        Navbar (Feature in progress)
      </div>

      <div className="board-container">
        <Column title="To do" />
        <Column title="Doing" />
        <Column title="Done" />
        {/* celles là ont un header plus sombre dans la maquette */}
        <Column title="Mis en Dev" headerColor="var(--color-dark)" />
        <Column title="A mettre en Prod" headerColor="var(--color-dark)" />
      </div>
    </div>
  );
}

export default App;
