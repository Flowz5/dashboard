import MDEditor from '@uiw/react-md-editor';
import useThemeStore from '../../store/useThemeStore';
import useUserStore from '../../store/useUserStore';
import './Ticket.css';

// Composant qui affiche la petite carte d'un ticket dans le Kanban
const Ticket = ({ ticket, onClick, userRole }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  
  // -- GESTION DU DRAG AND DROP --
  // On utilise l'API native HTML5 (onDragStart / onDragEnd) qui est plus légère que des grosses bibliothèques.
  const handleDragStart = (e) => {
    if (userRole === 'viewer') {
      e.preventDefault();
      return;
    }
    // On embarque l'ID du ticket dans le "sac à dos" du drag (dataTransfer)
    // C'est ça qui permet à la colonne d'arrivée de savoir quel ticket a été lâché !
    e.dataTransfer.setData('ticketId', ticket.id);
    
    // Petite astuce visuelle : on rend le ticket transparent à moitié quand on le soulève
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    // On remet l'opacité à la normale quand on lâche le ticket
    e.target.style.opacity = '1';
  };

  return (
    <div 
      className="ticket-card"
      draggable={userRole !== 'viewer'}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      <div className="ticket-header">
        <div className="ticket-header-left" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="ticket-date">{ticket.date}</span>
          {ticket.priority && (
            <span className={`ticket-priority priority-${ticket.priority.toLowerCase()}`} style={{ fontSize: '11px', fontWeight: '500' }}>
              {ticket.priority === 'Haute' ? '🔴' : ticket.priority === 'Basse' ? '🟢' : '🟠'} {ticket.priority}
            </span>
          )}
        </div>
        {ticket.dueDate && (
          <span className="ticket-due-date" title="Date butoire">
            📅 {new Date(ticket.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <h4 className="ticket-title">{ticket.title}</h4>
      
      {ticket.description && (
        <div className="ticket-description" data-color-mode={isDarkMode ? "dark" : "light"} style={{ background: 'transparent' }}>
          <MDEditor.Markdown 
            source={ticket.description} 
            style={{ whiteSpace: 'pre-wrap', background: 'transparent', color: 'inherit', fontSize: '13px' }}
          />
        </div>
      )}

      {ticket.tags && ticket.tags.length > 0 && (
        <div className="ticket-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {ticket.tags.map(tag => (
            <span key={tag} className="ticket-tag" style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="ticket-footer">
        {ticket.assignee && ticket.assignee !== 'Non assigné' ? (
          (() => {
            const assigneeProfile = useUserStore.getState().users?.[ticket.assignee];
            const displayName = assigneeProfile?.displayName || ticket.assignee;
            const initial = (displayName || "?").charAt(0).toUpperCase();
            const bgColor = assigneeProfile?.color || 'var(--color-primary)';
            const photoURL = assigneeProfile?.photoURL || '';

            return (
              <div className="ticket-assignee" title={`Assigné à ${displayName}`}>
                <span className="avatar" style={{
                  backgroundColor: bgColor,
                  backgroundImage: photoURL ? `url(${photoURL})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}>
                  {!photoURL && initial}
                </span>
                <span className="assignee-name">{displayName}</span>
              </div>
            );
          })()
        ) : (
          <div className="ticket-unassigned">Non assigné</div>
        )}

        {ticket.link && (
          <a 
            href={ticket.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ticket-link-icon"
            onClick={(e) => e.stopPropagation()} /* Empêche d'ouvrir la modale si on clique sur le lien */
            title="Ouvrir le lien"
          >
            🔗
          </a>
        )}
      </div>
    </div>
  );
};

export default Ticket;
