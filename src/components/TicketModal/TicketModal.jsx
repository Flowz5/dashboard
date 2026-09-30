import { useState, useEffect } from 'react';
import Button from '../Button/Button';
import './TicketModal.css';

const TEAM_MEMBERS = [
  "Non assigné",
  "Jean Dupont",
  "Alice Dubois",
  "Marc Lemoine",
  "Sophie Martin"
];

const TicketModal = ({ onClose, onSubmit, onDelete, ticket }) => {
  const isEditing = !!ticket;
  
  const [title, setTitle] = useState(ticket?.title || '');
  const [description, setDescription] = useState(ticket?.description || '');
  const [assignee, setAssignee] = useState(ticket?.assignee || 'Non assigné');
  const [dueDate, setDueDate] = useState(ticket?.dueDate || '');
  const [link, setLink] = useState(ticket?.link || '');

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      id: isEditing ? ticket.id : Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      assignee,
      dueDate,
      link: link.trim(),
      status: isEditing ? ticket.status : 'To do',
      date: isEditing ? ticket.date : new Date().toLocaleDateString()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Modifier le ticket" : "Créer un nouveau ticket"}</h2>
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

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="ticket-assignee">Assigné à</label>
                <select 
                  id="ticket-assignee" 
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  {TEAM_MEMBERS.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div className="form-group half">
                <label htmlFor="ticket-date">Date butoire</label>
                <input 
                  type="date" 
                  id="ticket-date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ticket-link">Image ou Lien attaché (Optionnel)</label>
              <input 
                type="url" 
                id="ticket-link" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
              {link && (
                <div className="link-preview">
                  <a href={link} target="_blank" rel="noopener noreferrer">Ouvrir le lien attaché</a>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer" style={{ justifyContent: isEditing ? 'space-between' : 'flex-end' }}>
            {isEditing && (
              <button 
                type="button" 
                className="btn-delete" 
                onClick={() => {
                  if(window.confirm("Es-tu sûr de vouloir supprimer ce ticket ?")) {
                    onDelete(ticket.id);
                  }
                }}
              >
                Supprimer
              </button>
            )}
            
            <div className="footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Annuler
              </button>
              <Button type="submit" disabled={!title.trim()}>
                {isEditing ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
