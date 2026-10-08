const fs = require('fs');
let code = fs.readFileSync('src/components/TicketModal/TicketModal.jsx', 'utf8');

code = code.replace(
  "const TicketModal = ({ onClose, onSubmit, onDelete, ticket, boardMembers = [], userRole }) => {",
  "const TicketModal = ({ onClose, onSubmit, onDelete, ticket, boardMembers = [], userRole, initialDueDate = '' }) => {"
);

code = code.replace(
  "const [dueDate, setDueDate] = useState(ticket?.dueDate || '');",
  "const [dueDate, setDueDate] = useState(ticket?.dueDate || initialDueDate);"
);

fs.writeFileSync('src/components/TicketModal/TicketModal.jsx', code);
