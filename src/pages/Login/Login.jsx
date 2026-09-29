import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './Login.css';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connecter Firebase ici
    console.log("Tentative avec", email, password);
    // Pour l'instant on simule une connexion
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Dashboard Dev</h2>
          <p>{isRegister ? "Créez votre compte pour rejoindre l'équipe" : "Connectez-vous à votre espace de travail"}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@entreprise.com"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <Button type="submit" className="login-submit-btn">
            {isRegister ? "S'inscrire" : "Se connecter"}
          </Button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? "Vous avez déjà un compte ?" : "Nouveau sur la plateforme ?"}
            <span onClick={() => setIsRegister(!isRegister)} className="toggle-mode">
              {isRegister ? " Se connecter" : " Créer un compte"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
