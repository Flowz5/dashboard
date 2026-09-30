import { create } from 'zustand';

// on utilise zustand qui est déjà installé pour gérer l'état de nos tickets de manière globale
const useBoardStore = create((set) => ({
  tickets: [],
  addTicket: (ticket) => set((state) => ({ 
    tickets: [...state.tickets, ticket] 
  })),
  moveTicket: (ticketId, newStatus) => set((state) => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    )
  }))
}));

export default useBoardStore;
