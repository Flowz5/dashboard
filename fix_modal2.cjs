const fs = require('fs');
let code = fs.readFileSync('src/components/NotificationsModal/NotificationsModal.jsx', 'utf8');

const oldGen = /const generateNotifications = \(\) => \{[\s\S]*?return notifs\.sort\(\(a, b\) => b\.date - a\.date\);\n  \};/;

const newGen = `const myTickets = useUserStore(state => state.myTickets);
  
  const generateNotifications = () => {
    if (!currentUser) return [];
    
    const notifs = [];
    const now = new Date();

    (myTickets || []).forEach(ticket => {
      const isDone = (ticket.status || '').toLowerCase().includes('terminé') || (ticket.status || '').toLowerCase().includes('done') || (ticket.status || '').toLowerCase().includes('fini');
      if (!isDone) {
        // Retrouver le titre du board pour un affichage joli (si on l'a dans le store)
        const board = (boards || []).find(b => b.id === ticket.boardId);
        const boardTitle = board ? board.title : 'Projet';

        if (ticket.dueDate) {
          // ticket.dueDate est en YYYY-MM-DD
          // Mais attention au décalage horaire avec new Date("YYYY-MM-DD") -> UTC
          // On ajoute "T12:00:00" pour être sûr d'être au milieu de la journée locale
          const dueDateStr = ticket.dueDate.includes('T') ? ticket.dueDate : ticket.dueDate + 'T12:00:00';
          const dueDate = new Date(dueDateStr);
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            notifs.push({
              id: \`overdue-\${ticket.id}\`,
              type: 'danger',
              title: 'Ticket en retard !',
              message: \`Le ticket "\${ticket.title}" devait être terminé le \${dueDate.toLocaleDateString()}.\`,
              boardId: ticket.boardId,
              ticketId: ticket.id,
              date: dueDate
            });
          } else if (diffDays <= 2) {
            notifs.push({
              id: \`due-soon-\${ticket.id}\`,
              type: 'warning',
              title: 'Échéance très proche',
              message: \`Le ticket "\${ticket.title}" est à rendre pour le \${dueDate.toLocaleDateString()}.\`,
              boardId: ticket.boardId,
              ticketId: ticket.id,
              date: dueDate
            });
          } else {
            notifs.push({
              id: \`assigned-\${ticket.id}\`,
              type: 'info',
              title: 'Nouveau ticket assigné',
              message: \`Vous êtes assigné au ticket "\${ticket.title}" dans le projet "\${boardTitle}".\`,
              boardId: ticket.boardId,
              ticketId: ticket.id,
              date: new Date(ticket.date || new Date())
            });
          }
        } else {
          notifs.push({
            id: \`assigned-\${ticket.id}\`,
            type: 'info',
            title: 'Nouveau ticket assigné',
            message: \`Vous êtes assigné au ticket "\${ticket.title}" dans le projet "\${boardTitle}".\`,
            boardId: ticket.boardId,
            ticketId: ticket.id,
            date: new Date(ticket.date || new Date())
          });
        }
      }
    });

    return notifs.sort((a, b) => b.date - a.date);
  };`;

code = code.replace(oldGen, newGen);
fs.writeFileSync('src/components/NotificationsModal/NotificationsModal.jsx', code);
