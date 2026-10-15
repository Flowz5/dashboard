import { useState, Children } from 'react';
import useBoardStore from '../../store/useBoardStore';
import './Column.css';

// Une colonne du Kanban (ex: "To do", "Doing", etc.)
const Column = ({ title, children, headerColor, onAddClick, userRole }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const moveTicket = useBoardStore(state => state.moveTicket);

  const ticketCount = Children.count(children);

  // Palette de bleus Coolors d'origine pour l'accentuation
  const getStatusColor = (colTitle) => {
    switch (colTitle) {
      case 'To do': return 'var(--color-primary)';
      case 'Doing': return 'var(--color-secondary)';
      case 'Done': return 'var(--color-primary)';
      case 'Mis en Dev': return 'var(--color-dark)';
      case 'A mettre en Prod': return 'var(--color-dark)';
      default: return 'var(--color-primary)';
    }
  };

  const statusColor = headerColor || getStatusColor(title);

  // -- GESTION DU DRAG AND DROP (RÉCEPTION) --
  const handleDragOver = (e) => {
    if (userRole === 'viewer') return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (userRole === 'viewer') return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    if (userRole === 'viewer') return;
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
      <div className="column-top-accent" style={{ backgroundColor: statusColor, boxShadow: `0 0 10px ${statusColor}44` }}></div>
      <div className="column-header">
        <div className="column-header-left">
          <span className="column-status-dot" style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}55` }}></span>
          <h3>{title}</h3>
          <span className="column-count-badge">{ticketCount}</span>
        </div>
        {title === 'To do' && onAddClick && (
          <button className="column-add-btn" onClick={onAddClick} title="Créer un ticket">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </div>
      <div className="column-body">
        {children}
      </div>
    </div>
  );
};

export default Column;

