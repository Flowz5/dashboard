const fs = require('fs');

// --- TICKET.JSX ---
let ticketContent = fs.readFileSync('src/components/Ticket/Ticket.jsx', 'utf8');

// Priority dots
const getPriorityIcon = (priority) => {
  if (priority === 'Basse') return '<span className="priority-dot low"></span>';
  if (priority === 'Haute') return '<span className="priority-dot high"></span>';
  return '<span className="priority-dot medium"></span>';
};

ticketContent = ticketContent.replace(
  "const getPriorityIcon = (priority) => {",
  "const getPriorityIcon = (priority) => {\n  if (priority === 'Basse') return <span className=\"priority-dot low\"></span>;\n  if (priority === 'Haute') return <span className=\"priority-dot high\"></span>;\n  return <span className=\"priority-dot medium\"></span>;\n  //"
);

// Calendar emoji
ticketContent = ticketContent.replace(
  "📅 {ticket.dueDate}",
  \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          {ticket.dueDate}\`
);

fs.writeFileSync('src/components/Ticket/Ticket.jsx', ticketContent);


// --- TICKETMODAL.JSX ---
let modalContent = fs.readFileSync('src/components/TicketModal/TicketModal.jsx', 'utf8');

modalContent = modalContent.replace(
  '<option value="Basse">🟢 Basse</option>',
  '<option value="Basse">Basse</option>'
);
modalContent = modalContent.replace(
  '<option value="Moyenne">🟠 Moyenne</option>',
  '<option value="Moyenne">Moyenne</option>'
);
modalContent = modalContent.replace(
  '<option value="Haute">🔴 Haute</option>',
  '<option value="Haute">Haute</option>'
);

fs.writeFileSync('src/components/TicketModal/TicketModal.jsx', modalContent);


// --- TICKET.CSS ---
let cssContent = fs.readFileSync('src/components/Ticket/Ticket.css', 'utf8');
const dotCSS = \`
.priority-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.priority-dot.low { background-color: #10B981; }
.priority-dot.medium { background-color: #F59E0B; }
.priority-dot.high { background-color: #EF4444; }
\`;
cssContent += dotCSS;
fs.writeFileSync('src/components/Ticket/Ticket.css', cssContent);

