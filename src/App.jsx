import Navbar from './components/Navbar/Navbar';
import Column from './components/Column/Column';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <div className="board-container">
        {/* on repasse sur les couleurs de ta palette de base pour bien les différencier */}
        <Column title="To do" headerColor="var(--color-primary)" />
        <Column title="Doing" headerColor="var(--color-primary)" />
        <Column title="Done" headerColor="var(--color-primary)" />
        <Column title="Mis en Dev" headerColor="var(--color-dark)" />
        <Column title="A mettre en Prod" headerColor="var(--color-dark)" />
      </div>
    </div>
  );
}

export default App;
