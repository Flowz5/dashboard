const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');

// Imports
content = content.replace(
  "import useBoardStore from '../../store/useBoardStore';",
  "import useBoardStore from '../../store/useBoardStore';\nimport NotificationsModal from '../NotificationsModal/NotificationsModal';"
);

// State
content = content.replace(
  "const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);",
  "const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);\n  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);"
);

// Logic to count unread notifications
const notifLogic = `
  // -- CALCUL DES NOTIFICATIONS POUR LE BADGE --
  const boards = useBoardStore(state => state.boards);
  const unreadNotifsCount = React.useMemo(() => {
    if (!currentUser) return 0;
    const now = new Date();
    let count = 0;
    const dismissedNotifs = userProfile?.dismissedNotifs || [];

    boards.forEach(board => {
      board.columns.forEach(col => {
        const isDone = col.title.toLowerCase().includes('terminé') || col.title.toLowerCase().includes('done') || col.title.toLowerCase().includes('fini');
        col.tickets.forEach(ticket => {
          if (ticket.assignee === currentUser.email && !isDone) {
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
      });
    });
    return count;
  }, [boards, currentUser, userProfile?.dismissedNotifs]);
`;
content = content.replace(
  "  const isDarkMode = useThemeStore(state => state.isDarkMode);",
  "  const isDarkMode = useThemeStore(state => state.isDarkMode);\n" + notifLogic
);

// Replace the notif icon with our new icon and badge
const oldNotifHTML = `<li>
            <a href="#">
              <img src={notifIcon} alt="Notification" />
            </a>
          </li>`;
const newNotifHTML = `<li>
            <div 
              className="navbar-notif-btn" 
              onClick={() => setIsNotifModalOpen(true)}
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {unreadNotifsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                </span>
              )}
            </div>
          </li>`;

content = content.replace(oldNotifHTML, newNotifHTML);

// Also replace calendarIcon since we are getting rid of the PNGs
const oldCalendarHTML = `<li>
            <a href="#">
              <img src={calendarIcon} alt="Calendar" />
            </a>
          </li>`;
const newCalendarHTML = `<li>
            <div 
              className="navbar-calendar-btn"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
              title="Calendrier (Bientôt disponible)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </li>`;
content = content.replace(oldCalendarHTML, newCalendarHTML);

// Render the modal
const modalRender = `
      {isNotifModalOpen && (
        <NotificationsModal onClose={() => setIsNotifModalOpen(false)} />
      )}
    </nav>
`;
content = content.replace("    </nav>", modalRender);

fs.writeFileSync('src/components/Navbar/Navbar.jsx', content);
