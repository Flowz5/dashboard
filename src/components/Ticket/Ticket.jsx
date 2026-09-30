import './Ticket.css';

const Ticket = ({ ticket }) => {
  // on utilise l'API drag and drop native de HTML5
  const handleDragStart = (e) => {
    // on stocke l'id du ticket qu'on est en train de glisser
    e.dataTransfer.setData('ticketId', ticket.id);
    // petit effet visuel optionnel quand on drag
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    // on remet l'opacité normale quand on a fini
    e.target.style.opacity = '1';
  };

  return (
    <div 
      className="ticket-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="ticket-date">{ticket.date}</div>
      <h4 className="ticket-title">{ticket.title}</h4>
      {ticket.description && (
        <p className="ticket-description">{ticket.description}</p>
      )}
    </div>
  );
};

export default Ticket;
