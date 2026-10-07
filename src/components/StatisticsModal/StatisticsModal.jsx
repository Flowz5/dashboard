import './StatisticsModal.css';

const StatisticsModal = ({ board, tickets, onClose }) => {
  // --- CALCUL DES STATISTIQUES ---
  const totalTickets = tickets.length;

  const ticketsByStatus = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const ticketsByPriority = tickets.reduce((acc, t) => {
    acc[t.priority || 'Moyenne'] = (acc[t.priority || 'Moyenne'] || 0) + 1;
    return acc;
  }, {});

  const ticketsByAssignee = tickets.reduce((acc, t) => {
    const person = (t.assignee && t.assignee !== 'Non assigné') ? t.assignee : 'Non assigné';
    acc[person] = (acc[person] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Statistiques : {board.title}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body stats-body">
          {totalTickets === 0 ? (
            <p className="no-stats">Aucun ticket dans ce projet pour le moment.</p>
          ) : (
            <>
              {/* GROS CHIFFRE */}
              <div className="stats-cards">
                <div className="stat-card">
                  <span className="stat-value">{totalTickets}</span>
                  <span className="stat-label">Tickets au total</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{ticketsByStatus['Done'] || 0}</span>
                  <span className="stat-label">Terminés</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{ticketsByPriority['Haute'] || 0}</span>
                  <span className="stat-label">Priorité Haute</span>
                </div>
              </div>

              {/* BARRES DE PROGRESSION */}
              <div className="stats-section">
                <h3>Répartition par Statut</h3>
                <div className="progress-bars">
                  {Object.entries(ticketsByStatus).map(([status, count]) => {
                    const percentage = Math.round((count / totalTickets) * 100);
                    return (
                      <div key={status} className="progress-item">
                        <div className="progress-label">
                          <span>{status}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="stats-section">
                <h3>Répartition par Assigné</h3>
                <ul className="stats-list">
                  {Object.entries(ticketsByAssignee).sort((a, b) => b[1] - a[1]).map(([assignee, count]) => (
                    <li key={assignee}>
                      <span className="stats-assignee-name">{assignee}</span>
                      <span className="stats-assignee-count">{count} tickets</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
