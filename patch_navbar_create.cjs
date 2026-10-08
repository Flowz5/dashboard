const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');

// Add the prop
code = code.replace(
  "onProfileClick }) => {",
  "onProfileClick, onCreateTicketForDate }) => {"
);

// Pass it to CalendarModal
code = code.replace(
  "<CalendarModal onClose={() => setIsCalendarOpen(false)} currentUser={currentUser} />",
  "<CalendarModal onClose={() => setIsCalendarOpen(false)} currentUser={currentUser} onCreateTicketForDate={onCreateTicketForDate} />"
);

fs.writeFileSync('src/components/Navbar/Navbar.jsx', code);
