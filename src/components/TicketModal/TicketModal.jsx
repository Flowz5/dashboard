import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import useThemeStore from '../../store/useThemeStore';
import Button from '../Button/Button';
import './TicketModal.css';

// La modale qui s'ouvre au clic sur un ticket ou sur "+"
// Elle sert à la fois pour CRÉER un nouveau ticket et pour MODIFIER un ticket existant.
const TicketModal = ({ onClose, onSubmit, onDelete, ticket, boardMembers = [], userRole }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  // Petite astuce : si on nous passe un "ticket" dans les props, c'est qu'on est en mode édition !
  const isEditing = !!ticket;
  const isViewer = userRole === 'viewer';
  
  // États locaux du formulaire (pré-remplis si on est en édition)
  const [title, setTitle] = useState(ticket?.title || '');
  const [description, setDescription] = useState(ticket?.description || '');
  
  // -- VÉRIFICATION DE L'ASSIGNATION --
  // On s'assure que si l'ancien assigné a été supprimé du board entre temps,
  // il n'est plus assigné automatiquement pour éviter les bugs fantômes.
  const initialAssignee = ticket?.assignee;
  const isAssigneeStillMember = boardMembers.includes(initialAssignee);
  const [assignee, setAssignee] = useState(
    initialAssignee && isAssigneeStillMember ? initialAssignee : 'Non assigné'
  );
  
  const [dueDate, setDueDate] = useState(ticket?.dueDate || '');
  const [link, setLink] = useState(ticket?.link || '');
  const [priority, setPriority] = useState(ticket?.priority || 'Moyenne');
  const [tags, setTags] = useState(ticket?.tags?.join(', ') || '');

  // Bloquer le scroll du body en arrière-plan quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // -- SOUMISSION DU FORMULAIRE --
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return; // On empêche les tickets sans titre
    
    // On renvoie un gros objet ticket à App.jsx qui va le balancer dans Firestore
    onSubmit({
      // Si isEditing est false, l'ID est mis à null car on va laisser 
      // la fonction addDoc de Firestore générer un vrai ID unique côté serveur.
      id: isEditing ? ticket.id : null,
      title: title.trim(),
      description: description.trim(),
      assignee,
      dueDate,
      link: link.trim(),
      priority,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      // Si nouveau ticket, on le met par défaut dans la colonne 'To do'
      status: isEditing ? ticket.status : 'To do',
      date: isEditing ? ticket.date : new Date().toLocaleDateString(),
      // Un vrai timestamp technique pour faciliter les tris
      createdAt: isEditing ? (ticket.createdAt || Date.now()) : Date.now()
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
              <input disabled={isViewer} 
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
              <div data-color-mode={isDarkMode ? "dark" : "light"}>
                <MDEditor
                  id="ticket-desc"
                  value={description}
                  onChange={setDescription}
                  preview={isViewer ? "preview" : "edit"} hideToolbar={isViewer}
                  height={200}
                  textareaProps={{
                    placeholder: "Décrivez la tâche à accomplir (Markdown supporté)..."
                  }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="ticket-assignee">Assigné à</label>
                <select disabled={isViewer} 
                  id="ticket-assignee" 
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  <option value="Non assigné">Non assigné</option>
                  {boardMembers.map(member => {
                    const profile = useUserStore.getState().users?.[member];
                    return <option key={member} value={member}>{profile?.displayName || member}</option>;
                  })}
                </select>
              </div>

              <div className="form-group half">
                <label htmlFor="ticket-date">Date butoire</label>
                <input disabled={isViewer} 
                  type="date" 
                  id="ticket-date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="ticket-priority">Priorité</label>
                <select disabled={isViewer} 
                  id="ticket-priority" 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Basse">🟢 Basse</option>
                  <option value="Moyenne">🟠 Moyenne</option>
                  <option value="Haute">🔴 Haute</option>
                </select>
              </div>

              <div className="form-group half">
                <label htmlFor="ticket-link">Image ou Lien (Optionnel)</label>
                <input disabled={isViewer} 
                  type="url" 
                  id="ticket-link" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
              {link && (
                <div className="link-preview" style={{ marginTop: '8px' }}>
                  <a href={link} target="_blank" rel="noopener noreferrer">Ouvrir le lien attaché</a>
                </div>
              )}

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="ticket-tags">Étiquettes (Tags)</label>
              <input disabled={isViewer} 
                type="text" 
                id="ticket-tags" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ex: bug, design, frontend (séparés par des virgules)"
              />
            </div>
          </div>
          
          <div className="modal-footer" style={{ justifyContent: isEditing && !isViewer ? 'space-between' : 'flex-end' }}>
            {isEditing && !isViewer && (
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
                {isViewer ? "Fermer" : "Annuler"}
              </button>
              {!isViewer && (
                <Button type="submit" disabled={!title.trim()}>
                  {isEditing ? "Mettre à jour" : "Ajouter"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
