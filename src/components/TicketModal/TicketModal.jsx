import { useState } from 'react';
import Button from '../Button/Button';
import './TicketModal.css';

const TicketModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // On passe les données du ticket au parent (le Kanban)
    if (onSubmit) {
      onSubmit({
        id: Date.now().toString(), // Génération d'un ID basique
        title: title.trim(),
        description: description.trim(),
        status: 'To do', // Par défaut
        date: new Date().toLocaleDateString()
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un nouveau ticket</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="ticket-title">Titre du ticket *</label>
              <input 
                type="text" 
                id="ticket-title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Corriger le bug de la navbar"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ticket-desc">Description détaillée</label>
              <textarea 
                id="ticket-desc" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez la tâche à accomplir en quelques mots..."
                rows={4}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            {/* on utilise un bouton gris (annuler) et notre bouton principal */}
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <Button type="submit" disabled={!title.trim()}>
              Ajouter le ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
