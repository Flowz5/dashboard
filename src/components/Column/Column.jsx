import { useState } from 'react';
import TicketModal from '../TicketModal/TicketModal';
import './Column.css';

const Column = ({ title, children, headerColor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="column-container">
      {/* on applique le headerColor en fond pour bien différencier chaque colonne comme tu as demandé */}
      <div className="column-header" style={{ backgroundColor: headerColor }}>
        <h3>{title}</h3>
        {title === 'To do' && (
          <span className="add-button" onClick={() => setIsModalOpen(true)} title="Créer un ticket">+</span>
        )}
      </div>
      <div className="column-body">
        {children}
      </div>
      {isModalOpen && <TicketModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Column;
