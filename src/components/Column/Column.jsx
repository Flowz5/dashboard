import { useState, Children } from 'react';
import useBoardStore from '../../store/useBoardStore';
import './Column.css';

// Une colonne du Kanban (ex: "To do", "Doing", etc.)
const Column = ({ title, children, headerColor, onAddClick, userRole }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const moveTicket = useBoardStore(state => state.moveTicket);

  const ticketCount = Children.count(children);

  // Couleurs de puces de statut subtiles et harmonisées
  const getStatusColor = (colTitle) => {
    switch (colTitle) {
      case 'To do': return '#38bdf8'; // Cyan
      case 'Doing': return '#f59e0b'; // Ambre
      case 'Done': return '#10b981'; // Émeraude
      case 'Mis en Dev': return '#818cf8'; // Indigo
      case 'A mettre en Prod': return '#c084fc'; // Violet
      default: return headerColor || 'var(--color-primary)';
    }
  };

  const statusColor = getStatusColor(title);

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

