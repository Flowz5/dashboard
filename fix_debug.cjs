const fs = require('fs');
let notif = fs.readFileSync('src/components/NotificationsModal/NotificationsModal.jsx', 'utf8');
notif = notif.replace(
  "<p>Vous n'avez aucune notification pour le moment.</p>",
  "<p>Vous n'avez aucune notification pour le moment.</p><p style={{fontSize:'10px'}}>Debug: currentUser={currentUser?.email}, boards={boards?.length}, allNotifs={allNotifs?.length}, visibleNotifs={visibleNotifs?.length}, dismissedNotifs={dismissedNotifs?.length}</p>"
);
fs.writeFileSync('src/components/NotificationsModal/NotificationsModal.jsx', notif);
