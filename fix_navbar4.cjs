const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');

code = code.replace(
  "const diffTime = new Date(ticket.dueDate).getTime() - now.getTime();",
  "const dueDateStr = ticket.dueDate.includes('T') ? ticket.dueDate : ticket.dueDate + 'T12:00:00';\n          const diffTime = new Date(dueDateStr).getTime() - now.getTime();"
);
fs.writeFileSync('src/components/Navbar/Navbar.jsx', code);
