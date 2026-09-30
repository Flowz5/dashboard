import './Ticket.css';

const Ticket = ({ ticket, onClick }) => {
  // on utilise l'API drag and drop native de HTML5
  const handleDragStart = (e) => {
    e.dataTransfer.setData('ticketId', ticket.id);
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  return (
    <div 
      className="ticket-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      <div className="ticket-header">
        <span className="ticket-date">{ticket.date}</span>
        {ticket.dueDate && (
          <span className="ticket-due-date" title="Date butoire">
            📅 {new Date(ticket.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <h4 className="ticket-title">{ticket.title}</h4>
      
      {ticket.description && (
        <p className="ticket-description">{ticket.description}</p>
      )}

      <div className="ticket-footer">
        {ticket.assignee && ticket.assignee !== 'Non assigné' ? (
          <div className="ticket-assignee" title={`Assigné à ${ticket.assignee}`}>
            <span className="avatar">
              {ticket.assignee.charAt(0).toUpperCase()}
            </span>
            <span className="assignee-name">{ticket.assignee}</span>
          </div>
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
