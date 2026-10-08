const fs = require('fs');

let content = fs.readFileSync('src/pages/Home/Home.jsx', 'utf8');

// 1. Add expandedFolders state
content = content.replace(
  "const [activeFolderId, setActiveFolderId] = useState('all');",
  "const [activeFolderId, setActiveFolderId] = useState('all');\n  const [expandedFolders, setExpandedFolders] = useState({});"
);

// 2. Add toggleFolder function
const toggleFolder = `
  const toggleFolder = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
`;
content = content.replace(
  "  const getFolderName = () => {",
  toggleFolder + "\n  const getFolderName = () => {"
);

// 3. Update the folder item render to include the tree
const folderItemRegex = /<div \s*key=\{folder\.id\}\s*className=\{\`sidebar-item folder-item \$\{activeFolderId === folder\.id \? 'active' : ''\}\`\}[\s\S]*?<\/div>/;

const newFolderItem = `
              <div key={folder.id} className="folder-tree-node">
                <div 
                  className={\`sidebar-item folder-item \${activeFolderId === folder.id ? 'active' : ''}\`}
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    setExpandedFolders(prev => ({ ...prev, [folder.id]: true }));
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnFolder(e, folder.id)}
                >
                  <span className="folder-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      className="btn-expand-folder" 
                      onClick={(e) => toggleFolder(folder.id, e)}
                      style={{ 
                        background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: '2px',
                        transform: expandedFolders[folder.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    {folder.name}
                  </span>
                  <button 
                    className="btn-delete-folder"
                    onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                    title="Supprimer le workspace"
                  >
                    &times;
                  </button>
                </div>
                
                {/* Sous-liste animée des projets */}
                <div className={\`folder-children-wrapper \${expandedFolders[folder.id] ? 'expanded' : ''}\`}>
                  <div className="folder-children">
                    {allAccessibleBoards
                      .filter(b => boardFolders[b.id] === folder.id)
                      .map(b => (
                        <div 
                          key={b.id} 
                          className="sidebar-board-item"
                          onClick={() => navigate(\`/board/\${b.id}\`)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, b.id)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', opacity: 0.7}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                          {b.title}
                        </div>
                      ))}
                  </div>
                </div>
              </div>`;

content = content.replace(folderItemRegex, newFolderItem);

fs.writeFileSync('src/pages/Home/Home.jsx', content);
