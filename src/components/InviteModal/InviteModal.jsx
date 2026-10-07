import { useState, useEffect } from 'react';
import Button from '../Button/Button';
import './InviteModal.css';

// Petite modale toute simple pour inviter quelqu'un via son adresse e-mail
const InviteModal = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');

  // Bloquer le scroll du body en arrière-plan quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // On passe le relais à App.jsx qui va utiliser le store pour l'ajouter sur Firebase
      onInvite(email.trim(), role);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Inviter un collaborateur</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="invite-desc">
              Entrez l'adresse email de la personne à inviter et choisissez ses permissions.
            </p>
            <div className="form-group">
              <label htmlFor="invite-email">Adresse Email</label>
              <input 
                type="email" 
                id="invite-email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@entreprise.com"
                required
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="invite-role">Rôle</label>
              <select 
                id="invite-role" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="editor">Éditeur (Peut créer et modifier des tickets)</option>
                <option value="viewer">Lecteur (Peut seulement consulter)</option>
              </select>
            </div>
          </div>
          
          <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
            <div className="footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Annuler
              </button>
              <Button type="submit" disabled={!email.trim()}>
                Envoyer l'invitation
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
