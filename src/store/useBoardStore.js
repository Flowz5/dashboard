import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// On utilise persist pour sauvegarder les données dans le localStorage
// comme on n'a pas de vraie BDD Firestore pour l'instant !
const useBoardStore = create(
  persist(
    (set) => ({
      boards: [],
      tickets: [],
      
      // -- GESTION DES BOARDS --
      addBoard: (board) => set((state) => ({
        boards: [...state.boards, board]
      })),
      
      inviteMemberToBoard: (boardId, email) => set((state) => ({
        boards: state.boards.map(board => {
          if (board.id === boardId) {
            // on évite les doublons
            if (!board.members.includes(email)) {
              return { ...board, members: [...board.members, email] };
            }
          }
          return board;
        })
      })),

      // -- GESTION DES TICKETS --
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
    }),
    {
      name: 'dashboard-storage', // nom de la clé dans le localStorage
    }
  )
);

export default useBoardStore;
