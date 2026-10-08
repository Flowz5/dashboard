import React, { useEffect } from 'react';
import useBoardStore from '../../store/useBoardStore';
import useUserStore from '../../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import './NotificationsModal.css';

const NotificationsModal = ({ onClose, currentUser }) => {
  const userProfile = useUserStore(state => state.userProfile);
  const updateUserProfile = useUserStore(state => state.updateUserProfile);
  const boards = useBoardStore(state => state.boards);
  const navigate = useNavigate();

  // Bloquer le scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const myTickets = useUserStore(state => state.myTickets);
  
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
              id: `overdue-${ticket.id}`,
              type: 'danger',
              title: 'Ticket en retard !',
              message: `Le ticket "${ticket.title}" devait être terminé le ${dueDate.toLocaleDateString('fr-FR')}.`,
              boardId: ticket.boardId,
              ticketId: ticket.id,
              date: dueDate
            });
          } else if (diffDays <= 2) {
            notifs.push({
              id: `due-soon-${ticket.id}`,
              type: 'warning',
              title: 'Échéance très proche',
              message: `Le ticket "${ticket.title}" est à rendre pour le ${dueDate.toLocaleDateString('fr-FR')}.`,
              boardId: ticket.boardId,
              ticketId: ticket.id,
              date: dueDate
            });
          } else {
            notifs.push({
              id: `assigned-${ticket.id}`,
              type: 'info',
              title: 'Nouveau ticket assigné',
              message: `Vous êtes assigné au ticket "${ticket.title}" dans le projet "${boardTitle}".`,
              boardId: ticket.boardId,
              ticketId: ticket.id,
              date: new Date(ticket.date || new Date())
            });
          }
        } else {
          notifs.push({
            id: `assigned-${ticket.id}`,
            type: 'info',
            title: 'Nouveau ticket assigné',
            message: `Vous êtes assigné au ticket "${ticket.title}" dans le projet "${boardTitle}".`,
            boardId: ticket.boardId,
            ticketId: ticket.id,
            date: new Date(ticket.date || new Date())
          });
        }
      }
    });

    return notifs.sort((a, b) => b.date - a.date);
  };

  const allNotifs = generateNotifications();
  const dismissedNotifs = userProfile?.dismissedNotifs || [];
  const visibleNotifs = allNotifs.filter(n => !dismissedNotifs.includes(n.id));

  const handleDismiss = (e, notifId) => {
    e.stopPropagation();
    if (!currentUser) return;
    updateUserProfile(currentUser.email, {
      dismissedNotifs: [...dismissedNotifs, notifId]
    });
  };

  const handleNotifClick = (notif) => {
    navigate(`/board/${notif.boardId}`);
    onClose();
  };

  const getIconForType = (type) => {
    if (type === 'danger') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
    if (type === 'warning') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
  };

  return (
    <div className="notif-modal-overlay" onClick={onClose}>
      <div className="notif-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="notif-modal-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Notifications
          </h2>
          <button className="btn-close-notif" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="notif-list">
          {visibleNotifs.length === 0 ? (
            <div className="empty-notifs">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
              <p>Vous n'avez aucune notification pour le moment.</p><p style={{fontSize:'10px'}}>Debug: currentUser={currentUser?.email}, boards={boards?.length}, allNotifs={allNotifs?.length}, visibleNotifs={visibleNotifs?.length}, dismissedNotifs={dismissedNotifs?.length}</p>
            </div>
          ) : (
            visibleNotifs.map(notif => (
              <div key={notif.id} className="notif-item" onClick={() => handleNotifClick(notif)}>
                <div className={`notif-icon ${notif.type}`}>
                  {getIconForType(notif.type)}
                </div>
                <div className="notif-content">
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                </div>
                <button className="btn-dismiss-notif" onClick={(e) => handleDismiss(e, notif.id)} title="Marquer comme lu">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
