const fs = require('fs');
let nav = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');
nav = nav.replace(/col\.title\.toLowerCase\(\)/g, "(col.title || '').toLowerCase()");
fs.writeFileSync('src/components/Navbar/Navbar.jsx', nav);

let notif = fs.readFileSync('src/components/NotificationsModal/NotificationsModal.jsx', 'utf8');
notif = notif.replace(/col\.title\.toLowerCase\(\)/g, "(col.title || '').toLowerCase()");
fs.writeFileSync('src/components/NotificationsModal/NotificationsModal.jsx', notif);
