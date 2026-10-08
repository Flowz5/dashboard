const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarModal/CalendarModal.jsx', 'utf8');

// Add the prop
code = code.replace(
  "const CalendarModal = ({ onClose, currentUser }) => {",
  "const CalendarModal = ({ onClose, currentUser, onCreateTicketForDate }) => {"
);

// Add the button rendering logic.
// We should render the button next to the title "Tickets pour le ..."
// We also need to format the date correctly for the <input type="date"> which expects YYYY-MM-DD.
const selectedTicketsUI = `{selectedDate && (
          <div className="calendar-selected-tickets">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Tickets pour le {selectedDate.toLocaleDateString('fr-FR')}</h3>
              {onCreateTicketForDate && (
                <button 
                  onClick={() => {
                    const y = selectedDate.getFullYear();
                    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const d = String(selectedDate.getDate()).padStart(2, '0');
                    onCreateTicketForDate(\`\${y}-\${m}-\${d}\`);
                    onClose();
                  }}
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Créer un ticket
                </button>
              )}
            </div>
            {selectedTickets.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Aucun ticket prévu pour ce jour.</p>
            ) : (`;

code = code.replace(
  /\{selectedDate && \([\s\S]*?<div className="calendar-selected-tickets">\s*<h3>Tickets pour le \{selectedDate\.toLocaleDateString\('fr-FR'\)\}<\/h3>\s*\{selectedTickets\.length === 0 \? \(/,
  selectedTicketsUI
);

fs.writeFileSync('src/components/CalendarModal/CalendarModal.jsx', code);
