import { create } from 'zustand';

// on utilise zustand qui est déjà installé pour gérer l'état de nos tickets de manière globale
const useBoardStore = create((set) => ({
  tickets: [],
  addTicket: (ticket) => set((state) => ({ 
    tickets: [...state.tickets, ticket] 
  })),
  updateTicket: (updatedTicket) => set((state) => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    )
  })),
  deleteTicket: (ticketId) => set((state) => ({
    tickets: state.tickets.filter(ticket => ticket.id !== ticketId)
  })),
  moveTicket: (ticketId, newStatus) => set((state) => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    )
  }))
}));

export default useBoardStore;
