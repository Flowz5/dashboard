import React, { useState, useMemo, useEffect } from 'react';
import useUserStore from '../../store/useUserStore';
import useBoardStore from '../../store/useBoardStore';
import { useNavigate } from 'react-router-dom';
import './CalendarModal.css';

const CalendarModal = ({ onClose, currentUser }) => {
  const myTickets = useUserStore(state => state.myTickets);
  const boards = useBoardStore(state => state.boards);
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Bloquer le scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Ajuster pour que Lundi soit le premier jour (0 = Lundi, 6 = Dimanche)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getTicketsForDate = (date) => {
    const targetDateStr = date.toLocaleDateString();
    
    return (myTickets || []).filter(ticket => {
      if (!ticket.dueDate) return false;
      const dueDateStr = ticket.dueDate.includes('T') ? ticket.dueDate : ticket.dueDate + 'T12:00:00';
      const d = new Date(dueDateStr);
      return d.toLocaleDateString() === targetDateStr;
    });
  };

  const renderDays = () => {
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isToday = date.toLocaleDateString() === new Date().toLocaleDateString();
      const isSelected = selectedDate && date.toLocaleDateString() === selectedDate.toLocaleDateString();
      
      const dayTickets = getTicketsForDate(date);
      
      days.push(
        <div 
          key={i} 
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          {i}
          {dayTickets.length > 0 && (
            <div className="calendar-day-dots">
              {dayTickets.slice(0, 3).map((t, idx) => {
                let prioClass = 'none';
                if (t.priority === 'Haute') prioClass = 'high';
                if (t.priority === 'Moyenne') prioClass = 'medium';
                if (t.priority === 'Basse') prioClass = 'low';
                return <div key={idx} className={`calendar-dot ${prioClass}`}></div>
              })}
              {dayTickets.length > 3 && <div className="calendar-dot none"></div>}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const handleTicketClick = (ticket) => {
    navigate(`/board/${ticket.boardId}#ticket-${ticket.id}`);
    onClose();
  };

  const selectedTickets = selectedDate ? getTicketsForDate(selectedDate) : [];

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-modal-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Calendrier
          </h2>
          <button className="btn-close-calendar" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="calendar-controls">
          <button onClick={prevMonth}>&lt;</button>
          <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={nextMonth}>&gt;</button>
        </div>

        <div className="calendar-grid">
          <div className="calendar-days-header">
            <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
          </div>
          <div className="calendar-days-grid">
            {renderDays()}
          </div>
        </div>

        {selectedDate && (
          <div className="calendar-selected-tickets">
            <h3>Tickets pour le {selectedDate.toLocaleDateString()}</h3>
            {selectedTickets.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Aucun ticket prévu pour ce jour.</p>
            ) : (
              selectedTickets.map(ticket => {
                const board = (boards || []).find(b => b.id === ticket.boardId);
                return (
                  <div key={ticket.id} className="calendar-ticket-item" onClick={() => handleTicketClick(ticket)}>
                    <div className="calendar-ticket-title">{ticket.title}</div>
                    <div className="calendar-ticket-board">Projet : {board ? board.title : 'Inconnu'}</div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarModal;
