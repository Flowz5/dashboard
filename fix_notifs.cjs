const fs = require('fs');

// 1. Fix NotificationsModal.jsx
let notifContent = fs.readFileSync('src/components/NotificationsModal/NotificationsModal.jsx', 'utf8');
notifContent = notifContent.replace(
  "import { useAuth } from '../../context/AuthContext';\n", 
  ""
);
notifContent = notifContent.replace(
  "const NotificationsModal = ({ onClose }) => {\n  const { currentUser } = useAuth();",
  "const NotificationsModal = ({ onClose, currentUser }) => {"
);
fs.writeFileSync('src/components/NotificationsModal/NotificationsModal.jsx', notifContent);

// 2. Fix Navbar.jsx
let navContent = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');
navContent = navContent.replace(
  "<NotificationsModal onClose={() => setIsNotifModalOpen(false)} />",
  "<NotificationsModal onClose={() => setIsNotifModalOpen(false)} currentUser={currentUser} />"
);
fs.writeFileSync('src/components/Navbar/Navbar.jsx', navContent);

