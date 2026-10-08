const fs = require('fs');

let content = fs.readFileSync('src/store/useUserStore.js', 'utf8');

const handlers = `
  // -- GESTION DES WORKSPACES (DOSSIERS) --
  // On utilise le profil utilisateur pour sauvegarder la structure des dossiers
  
  createFolder: async (email, folderName) => {
    const state = useUserStore.getState();
    const currentFolders = state.userProfile?.folders || [];
    const newFolder = {
      id: 'folder_' + Date.now().toString(),
      name: folderName
    };
    await state.updateUserProfile(email, {
      folders: [...currentFolders, newFolder]
    });
  },

  deleteFolder: async (email, folderId) => {
    const state = useUserStore.getState();
    const currentFolders = state.userProfile?.folders || [];
    const currentBoardFolders = state.userProfile?.boardFolders || {};
    
    // On retire le dossier de la liste
    const newFolders = currentFolders.filter(f => f.id !== folderId);
    
    // On nettoie les projets qui étaient dans ce dossier
    const newBoardFolders = { ...currentBoardFolders };
    Object.keys(newBoardFolders).forEach(boardId => {
      if (newBoardFolders[boardId] === folderId) {
        delete newBoardFolders[boardId];
      }
    });

    await state.updateUserProfile(email, {
      folders: newFolders,
      boardFolders: newBoardFolders
    });
  },

  moveBoardToFolder: async (email, boardId, folderId) => {
    const state = useUserStore.getState();
    const currentBoardFolders = state.userProfile?.boardFolders || {};
    
    const newBoardFolders = { ...currentBoardFolders };
    if (folderId === null) {
      delete newBoardFolders[boardId]; // Enlever d'un dossier
    } else {
      newBoardFolders[boardId] = folderId; // Mettre dans le dossier
    }

    await state.updateUserProfile(email, {
      boardFolders: newBoardFolders
    });
  }
}));
`;

content = content.replace("}));", handlers);

fs.writeFileSync('src/store/useUserStore.js', content);
