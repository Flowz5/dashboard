const fs = require('fs');
let code = fs.readFileSync('src/components/Ticket/Ticket.jsx', 'utf8');

code = code.replace(
  "onClick={onClick}\n    >",
  "onClick={onClick}\n      id={`ticket-${ticket.id}`}\n    >"
);

fs.writeFileSync('src/components/Ticket/Ticket.jsx', code);
