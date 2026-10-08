const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');

// Add import
code = code.replace(
  "import NotificationsModal from '../NotificationsModal/NotificationsModal';",
  "import NotificationsModal from '../NotificationsModal/NotificationsModal';\nimport CalendarModal from '../CalendarModal/CalendarModal';"
);

// Add state
code = code.replace(
  "const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);",
  "const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);\n  const [isCalendarOpen, setIsCalendarOpen] = useState(false);"
);

// Add onClick to calendar btn
code = code.replace(
  "className=\"navbar-calendar-btn\"\n              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}\n              title=\"Calendrier (Bientôt disponible)\"",
  "className=\"navbar-calendar-btn\"\n              onClick={() => setIsCalendarOpen(true)}\n              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}\n              title=\"Calendrier\""
);

// Add modal render
code = code.replace(
  "{isNotifModalOpen && (",
  "{isCalendarOpen && (\n        <CalendarModal onClose={() => setIsCalendarOpen(false)} currentUser={currentUser} />\n      )}\n      {isNotifModalOpen && ("
);

fs.writeFileSync('src/components/Navbar/Navbar.jsx', code);
