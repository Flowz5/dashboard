import MDEditor from '@uiw/react-md-editor';
import useThemeStore from '../../store/useThemeStore';
import useUserStore from '../../store/useUserStore';
import rehypeSanitize from 'rehype-sanitize';
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
      id={`ticket-${ticket.id}`}
    >
      <div className="ticket-header">
        <div className="ticket-header-left" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="ticket-date">{ticket.date}</span>
          {ticket.priority && (
            <span className={`ticket-priority priority-${ticket.priority.toLowerCase()}`} style={{ fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
              <span className={`priority-dot ${ticket.priority === 'Haute' ? 'high' : ticket.priority === 'Basse' ? 'low' : 'medium'}`}></span>
              {ticket.priority}
            </span>
          )}
        </div>
        {ticket.dueDate && (
          <span className="ticket-due-date" title="Date butoire" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {new Date(ticket.dueDate).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
      
      <h4 className="ticket-title">{ticket.title}</h4>
      
      {ticket.description && (
        <div className="ticket-description" data-color-mode={isDarkMode ? "dark" : "light"} style={{ background: 'transparent' }}>
          <MDEditor.Markdown rehypePlugins={[[rehypeSanitize]]} 
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
            // Petit hack pour choper les infos de l'assigné depuis le store des profils
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          </a>
        )}
        
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="ticket-link-icon" title={`${ticket.attachments.length} pièce(s) jointe(s)`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '2px'}}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            {ticket.attachments.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticket;
