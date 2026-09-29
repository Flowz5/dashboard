import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Column from './components/Column/Column';
import Login from './pages/Login/Login';
import './App.css';

// Ce composant représente le tableau de bord (notre ancienne App)
const Dashboard = () => {
  return (
    <div className="app-container">
      <Navbar />

      <div className="board-container">
        <Column title="To do" headerColor="var(--color-primary)" />
        <Column title="Doing" headerColor="var(--color-primary)" />
        <Column title="Done" headerColor="var(--color-primary)" />
        <Column title="Mis en Dev" headerColor="var(--color-dark)" />
        <Column title="A mettre en Prod" headerColor="var(--color-dark)" />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        {/* On redirige tout ce qui n'existe pas vers le dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
