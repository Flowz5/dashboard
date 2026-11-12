import { useState, Children } from 'react';
import useBoardStore from '../../store/useBoardStore';
import './Column.css';

// Une colonne du Kanban.
// `columnId` est la valeur stockée dans `ticket.status` ; `title` est uniquement affiché.
// `onRename` et `onDelete` sont absents pour la colonne To do et pour les viewers.
const Column = ({ columnId, title, children, headerColor, onAddClick, onRename, onDelete, userRole }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const moveTicket = useBoardStore(state => state.moveTicket);

  const ticketCount = Children.count(children);
  const statusColor = headerColor || 'var(--color-primary)';

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
      moveTicket(ticketId, columnId);
    }
  };

  // -- RENOMMAGE (double-clic sur le titre) --
  const startEditing = () => {
    if (!onRename) return;
    setDraftTitle(title);
    setIsEditing(true);
  };

  const submitRename = () => {
    setIsEditing(false);
    if (draftTitle.trim() !== title) {
      onRename(draftTitle);
    }
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') submitRename();
    if (e.key === 'Escape') setIsEditing(false);
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
          {isEditing ? (
            <input
              className="column-title-input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={() => setIsEditing(false)}
              autoFocus
            />
          ) : (
            <h3
              onDoubleClick={startEditing}
              title={onRename ? 'Double-cliquer pour renommer' : undefined}
              className={onRename ? 'column-title-editable' : undefined}
            >
              {title}
            </h3>
          )}
          <span className="column-count-badge">{ticketCount}</span>
        </div>
        <div className="column-header-actions">
          {onAddClick && (
            <button className="column-add-btn" onClick={onAddClick} title="Créer un ticket">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
          {onDelete && (
            <button className="column-delete-btn" onClick={onDelete} title="Supprimer la colonne">
              &times;
            </button>
          )}
        </div>
      </div>
      <div className="column-body">
        {children}
      </div>
    </div>
  );
};

export default Column;
