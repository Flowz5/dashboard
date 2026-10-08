const fs = require('fs');

let content = fs.readFileSync('src/pages/Home/Home.jsx', 'utf8');

// 1. Corriger le drag & drop (DataTransfer)
content = content.replace(
  /const handleDragStart = \(e, boardId\) => \{[\s\S]*?e.dataTransfer.effectAllowed = "move";\n  \};/,
  \`const handleDragStart = (e, boardId) => {
    setDraggedBoardId(boardId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", boardId); // Requis pour Firefox !
  };\`);

// 2. Remplacer les emojis
content = content.replace(
  "<span>🗂️ Workspaces</span>",
  \`<span style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Workspaces
            </span>\`
);

content = content.replace(
  "🏠 Tous les projets",
  \`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Tous les projets\`
);

content = content.replace(
  "📥 Non classés",
  \`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            Non classés\`
);

content = content.replace(
  '<span className="folder-name">📁 {folder.name}</span>',
  \`<span className="folder-name" style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  {folder.name}
                </span>\`
);

content = content.replace(
  '<div className="empty-icon">🗂️</div>',
  \`<div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>\`
);

fs.writeFileSync('src/pages/Home/Home.jsx', content);
