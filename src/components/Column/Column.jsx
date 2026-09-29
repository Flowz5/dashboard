import { useState } from 'react';
import TicketModal from '../TicketModal/TicketModal';
import './Column.css';

const Column = ({ title, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="column-container">
      {/* j'ai viré la prop headerColor, toutes les colonnes ont maintenant le même style pur et sobre */}
      <div className="column-header">
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
