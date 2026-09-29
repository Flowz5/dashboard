import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import Button from '../../components/Button/Button';
import './Login.css';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isRegister) {
        // Inscription
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Connexion
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Si on arrive ici, ça a marché, on va sur le dashboard !
      navigate('/');
    } catch (err) {
      console.error(err);
      // On gère les erreurs classiques en français pour être sympa avec l'utilisateur
      if (err.code === 'auth/email-already-in-use') {
        setError("Cet email est déjà utilisé.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Email ou mot de passe incorrect.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe doit faire au moins 6 caractères.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Dashboard Dev</h2>
          <p>{isRegister ? "Créez votre compte pour rejoindre l'équipe" : "Connectez-vous à votre espace de travail"}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

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
            <span onClick={() => { setIsRegister(!isRegister); setError(null); }} className="toggle-mode">
              {isRegister ? " Se connecter" : " Créer un compte"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
