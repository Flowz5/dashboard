import Navbar from './components/Navbar/Navbar';
import Column from './components/Column/Column';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <div className="board-container">
        {/* on remet les headerColors avec des teintes pastel très douces inspirées du design */}
        <Column title="To do" headerColor="#E0F2FE" />
        <Column title="Doing" headerColor="#FEF08A" />
        <Column title="Done" headerColor="#DCFCE7" />
        <Column title="Mis en Dev" headerColor="#F3E8FF" />
        <Column title="A mettre en Prod" headerColor="#FCE7F3" />
      </div>
    </div>
  );
}

export default App;
