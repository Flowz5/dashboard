import './TicketModal.css';

const TicketModal = ({ onClose }) => {
  return (
    // on met le clic ici pour fermer si on clique dans le vide (l'overlay sombre)
    <div className="modal-overlay" onClick={onClose}>
      {/* faut stopper la propagation sinon cliquer dans la modale ça la ferme aussi */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Création de ticket</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {/* juste une fausse modale avec work in progress pour plus tard */}
          <p className="wip-text">Work in progress...</p>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
