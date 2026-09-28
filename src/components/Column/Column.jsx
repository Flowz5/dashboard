import { useState } from 'react';
import TicketModal from '../TicketModal/TicketModal';
import './Column.css';

const Column = ({ title, children, headerColor = 'var(--color-primary)' }) => {
  // on gère l'ouverture de la modale de création ici pour l'instant
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="column-container">
      <div className="column-header" style={{ backgroundColor: headerColor }}>
        <h3>{title}</h3>
        {/* on affiche le + seulement pour la colonne To do comme sur le design */}
        {title === 'To do' && (
          <span className="add-button" onClick={() => setIsModalOpen(true)} title="Créer un ticket">+</span>
        )}
      </div>
      <div className="column-body">
        {children}
      </div>
      {/* si c'est ouvert on affiche la modale vide */}
      {isModalOpen && <TicketModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Column;
