const fs = require('fs');

// Navbar.jsx
let nav = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');
nav = nav.replace(
  /boards\.forEach\(board => \{/g,
  "(boards || []).forEach(board => {"
);
nav = nav.replace(
  /board\.columns\.forEach\(col => \{/g,
  "(board.columns || []).forEach(col => {"
);
nav = nav.replace(
  /col\.tickets\.forEach\(ticket => \{/g,
  "(col.tickets || []).forEach(ticket => {"
);
fs.writeFileSync('src/components/Navbar/Navbar.jsx', nav);

// NotificationsModal.jsx
let notif = fs.readFileSync('src/components/NotificationsModal/NotificationsModal.jsx', 'utf8');
notif = notif.replace(
  /boards\.forEach\(board => \{/g,
  "(boards || []).forEach(board => {"
);
notif = notif.replace(
  /board\.columns\.forEach\(col => \{/g,
  "(board.columns || []).forEach(col => {"
);
notif = notif.replace(
  /col\.tickets\.forEach\(ticket => \{/g,
  "(col.tickets || []).forEach(ticket => {"
);
fs.writeFileSync('src/components/NotificationsModal/NotificationsModal.jsx', notif);
