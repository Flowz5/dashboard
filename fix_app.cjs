const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace(/filteredTickets = \[\.\.\.col\.tickets\];/g, "filteredTickets = [...(col.tickets || [])];");
fs.writeFileSync('src/App.jsx', app);
