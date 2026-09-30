import { useState } from 'react';
import TicketModal from '../TicketModal/TicketModal';
import useBoardStore from '../../store/useBoardStore';
import './Column.css';

const Column = ({ title, children, headerColor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // on récupère nos actions depuis le store Zustand
  const addTicket = useBoardStore(state => state.addTicket);
  const moveTicket = useBoardStore(state => state.moveTicket);

  const handleAddTicket = (newTicket) => {
    addTicket(newTicket);
  };

  const handleDragOver = (e) => {
    // on autorise le drop
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // on récupère l'id du ticket et on le déplace dans la colonne actuelle (title)
    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) {
      moveTicket(ticketId, title);
    }
  };

  return (
    <div 
      className={`column-container ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header" style={{ backgroundColor: headerColor }}>
        <h3>{title}</h3>
        {title === 'To do' && (
          <span className="add-button" onClick={() => setIsModalOpen(true)} title="Créer un ticket">+</span>
        )}
      </div>
      <div className="column-body">
        {children}
      </div>
      {isModalOpen && <TicketModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddTicket} />}
    </div>
  );
};

export default Column;
