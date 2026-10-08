const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarModal/CalendarModal.jsx', 'utf8');

code = code.replace(
  "            {selectedTickets.length === 0 ? (\n              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Aucun ticket prévu pour ce jour.</p>\n            ) : (\n              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Aucun ticket prévu pour ce jour.</p>\n            ) : (",
  "            {selectedTickets.length === 0 ? (\n              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Aucun ticket prévu pour ce jour.</p>\n            ) : ("
);

fs.writeFileSync('src/components/CalendarModal/CalendarModal.jsx', code);
