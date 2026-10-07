import { useState } from 'react';
import useUserStore from '../../store/useUserStore';
import Button from '../Button/Button';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const userProfile = useUserStore(state => state.userProfile);
  const updateUserProfile = useUserStore(state => state.updateUserProfile);

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [color, setColor] = useState(userProfile?.color || '#62b6cb');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userProfile?.email) {
      await updateUserProfile(userProfile.email, { displayName, photoURL, color });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mon Profil</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="profile-preview">
              <div 
                className="profile-avatar-large" 
                style={{ 
                  backgroundColor: color,
                  backgroundImage: photoURL ? `url(${photoURL})` : 'none'
                }}
              >
                {!photoURL && (displayName ? displayName.charAt(0).toUpperCase() : '?')}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile-name">Pseudo / Nom</label>
              <input 
                type="text" 
                id="profile-name" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton pseudo"
                required
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="profile-photo">Photo de profil (URL)</label>
              <input 
                type="url" 
                id="profile-photo" 
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="profile-color">Couleur associée</label>
              <input 
                type="color" 
                id="profile-color" 
                value={color.startsWith('var(') ? '#62b6cb' : color}
                onChange={(e) => setColor(e.target.value)}
                className="color-picker"
              />
            </div>
          </div>
          
          <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
            <div className="footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Annuler
              </button>
              <Button type="submit">
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
