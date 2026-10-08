const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');

code = code.replace(
  "import React, { useState, useMemo } from 'react';",
  "import React, { useState, useMemo, useEffect } from 'react';"
);

// We replace the unreadNotifsCount useMemo
const oldCalc = /\/\/ -- CALCUL DES NOTIFICATIONS POUR LE BADGE --[\s\S]*?return count;\n  \}, \[boards, currentUser, userProfile\?\.dismissedNotifs\]\);/;

const newCalc = `// -- CALCUL DES NOTIFICATIONS POUR LE BADGE --
  const myTickets = useUserStore(state => state.myTickets);
  const listenToMyTickets = useUserStore(state => state.listenToMyTickets);

  useEffect(() => {
    if (currentUser?.email) {
      listenToMyTickets(currentUser.email);
    }
  }, [currentUser?.email, listenToMyTickets]);

  const unreadNotifsCount = useMemo(() => {
    if (!currentUser) return 0;
    const now = new Date();
    let count = 0;
    const dismissedNotifs = userProfile?.dismissedNotifs || [];

    (myTickets || []).forEach(ticket => {
      const isDone = (ticket.status || '').toLowerCase().includes('terminé') || (ticket.status || '').toLowerCase().includes('done') || (ticket.status || '').toLowerCase().includes('fini');
      if (!isDone) {
        let notifId = 'assigned-' + ticket.id;
        if (ticket.dueDate) {
          const diffTime = new Date(ticket.dueDate).getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 0) notifId = 'overdue-' + ticket.id;
          else if (diffDays <= 2) notifId = 'due-soon-' + ticket.id;
        }
        if (!dismissedNotifs.includes(notifId)) {
          count++;
        }
      }
    });
    return count;
  }, [myTickets, currentUser, userProfile?.dismissedNotifs]);`;

code = code.replace(oldCalc, newCalc);
fs.writeFileSync('src/components/Navbar/Navbar.jsx', code);
