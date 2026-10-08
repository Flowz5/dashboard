const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  "const [selectedTicket, setSelectedTicket] = useState(null);",
  "const [selectedTicket, setSelectedTicket] = useState(null);\n  const [initialDateForNewTicket, setInitialDateForNewTicket] = useState('');"
);

// We need to reset initialDateForNewTicket when modal closes
code = code.replace(
  "onClose={() => setIsModalOpen(false)}",
  "onClose={() => { setIsModalOpen(false); setInitialDateForNewTicket(''); }}"
);

// And pass it to TicketModal
code = code.replace(
  "boardMembers={currentBoard.members}",
  "boardMembers={currentBoard.members}\n          initialDueDate={initialDateForNewTicket}"
);

// And we need to add handleCreateTicketForDate
const navBarRender = "        onProfileClick={() => setIsProfileModalOpen(true)}\n        userRole={userRole}\n      />";
const newNavBarRender = `        onProfileClick={() => setIsProfileModalOpen(true)}
        userRole={userRole}
        onCreateTicketForDate={(dateStr) => {
          setSelectedTicket(null);
          setInitialDateForNewTicket(dateStr);
          setIsModalOpen(true);
        }}
      />`;

code = code.replace(navBarRender, newNavBarRender);

fs.writeFileSync('src/App.jsx', code);
