const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');

// 1. Add imports at the top
const newImports = `import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';
import Button from '../Button/Button';
import searchIcon from '../../assets/search.png';
import useThemeStore from '../../store/useThemeStore';
import useUserStore from '../../store/useUserStore';
import useBoardStore from '../../store/useBoardStore';
import NotificationsModal from '../NotificationsModal/NotificationsModal';`;

content = content.replace(/import \{ useNavigate \}[\s\S]*?import useUserStore from '\.\.\/\.\.\/store\/useUserStore';/, newImports);

// 2. Fix the component definition
const newComponentTop = `// La barre de navigation du haut (Logo, Recherche, Membres, Déconnexion)
const Navbar = ({ board, onInviteClick, onRemoveMember, currentUser, searchQuery, onSearchChange, sortOption, onSortChange, onStatsClick, userRole, onProfileClick }) => {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const userProfile = useUserStore(state => state.userProfile);
  const boards = useBoardStore(state => state.boards);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // -- CALCUL DES NOTIFICATIONS POUR LE BADGE --
  const unreadNotifsCount = useMemo(() => {
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
  }, [boards, currentUser, userProfile?.dismissedNotifs]);`;

// Remove from `// La barre de navigation du haut` up to `// -- DÉCONNEXION --`
content = content.replace(/\/\/ La barre de navigation du haut[\s\S]*?\/\/ -- DÉCONNEXION --/, newComponentTop + '\n\n  // -- DÉCONNEXION --');

fs.writeFileSync('src/components/Navbar/Navbar.jsx', content);
