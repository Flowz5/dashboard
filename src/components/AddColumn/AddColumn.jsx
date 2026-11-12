import { useState } from 'react';
import './AddColumn.css';

// Carte placée après la dernière colonne, permettant d'en créer une nouvelle.
// `onAdd(title)` retourne true si la colonne a été créée (titre valide), false sinon.
const AddColumn = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');

  const close = () => {
    setIsOpen(false);
    setTitle('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAdd(title)) close();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') close();
  };

  if (!isOpen) {
    return (
      <button className="add-column-trigger" onClick={() => setIsOpen(true)}>
        + Ajouter une colonne
      </button>
    );
  }

  return (
    <form className="add-column-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom de la colonne..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (!title.trim()) close(); }}
        autoFocus
      />
      <div className="add-column-actions">
        <button type="submit" disabled={!title.trim()}>Ajouter</button>
        {/* preventDefault au mousedown : évite que la perte de focus ne s'exécute avant le clic */}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={close}>Annuler</button>
      </div>
    </form>
  );
};

export default AddColumn;
