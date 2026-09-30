import { useState } from 'react';
import useBoardStore from '../../store/useBoardStore';
import './Column.css';

// Une colonne du Kanban (ex: "To do", "Doing", etc.)
const Column = ({ title, children, headerColor, onAddClick }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const moveTicket = useBoardStore(state => state.moveTicket);

  // -- GESTION DU DRAG AND DROP (RÉCEPTION) --
  
  // Autoriser le drop (par défaut le navigateur l'interdit !)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true); // Permet de mettre la colonne en surbrillance (cf CSS)
  };

  const handleDragLeave = () => {
    setIsDragOver(false); // On enlève la surbrillance si le curseur sort de la colonne
  };

  // Ce qui se passe quand on lâche la souris avec un ticket au-dessus
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // On ouvre le "sac à dos" du drag pour récupérer l'ID du ticket
    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) {
      // On prévient le store (et donc Firestore) que ce ticket change de colonne !
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
