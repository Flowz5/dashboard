import { useState } from 'react';
import useBoardStore from '../../store/useBoardStore';
import './Column.css';

const Column = ({ title, children, headerColor, onAddClick }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const moveTicket = useBoardStore(state => state.moveTicket);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
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
        {/* On appelle la prop onAddClick que le Dashboard nous passe */}
        {title === 'To do' && onAddClick && (
          <span className="add-button" onClick={onAddClick} title="Créer un ticket">+</span>
        )}
      </div>
      <div className="column-body">
        {children}
      </div>
    </div>
  );
};

export default Column;
