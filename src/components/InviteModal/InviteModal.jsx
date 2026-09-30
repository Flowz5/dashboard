import { useState, useEffect } from 'react';
import Button from '../Button/Button';
import './InviteModal.css';

const InviteModal = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim());
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
              Entrez l'adresse email de la personne que vous souhaitez inviter sur ce Dashboard. Elle le verra apparaître directement sur sa page d'accueil !
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
