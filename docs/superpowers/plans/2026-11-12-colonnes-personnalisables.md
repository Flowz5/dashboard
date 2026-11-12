# Colonnes personnalisables — Plan d'implémentation

> **Pour les agents :** sous-skill requis : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**Objectif :** permettre d'ajouter, renommer et supprimer des colonnes après la colonne permanente « To do » de chaque board.

**Architecture :** le document Firestore `boards/{id}` porte un tableau `columns: [{ id, title }]` (repli sur une liste par défaut dont les id valent les anciens titres, donc sans migration). `ticket.status` contient l'id de la colonne. La logique pure (liste par défaut, validation, couleurs, libellés) est isolée dans `src/utils/columns.js`. Le store Zustand écrit le tableau, et l'UI le lit via `listenToBoards`, déjà en temps réel.

**Stack :** React 19, Vite, Zustand 5, Firebase Firestore, CSS natif (variables de thème).

**Spec :** `docs/superpowers/specs/2026-11-12-colonnes-personnalisables-design.md`

**Règles du dépôt :** branche `feature/colonnes-personnalisables`, commits en français au format conventionnel, commentaires de code en français au ton impersonnel, aucun push ni merge sans accord explicite. Chaque tâche est validée par l'utilisateur avant de passer à la suivante.

**Tests :** le projet n'a pas de framework de test et ce plan n'en ajoute pas (YAGNI). La logique pure de la tâche 1 est vérifiée par un script Node exécuté depuis le scratchpad. Le reste est vérifié par `npm run lint`, `npm run build` et un test manuel.

---

## Structure des fichiers

| Fichier | Action | Responsabilité |
|---|---|---|
| `src/utils/columns.js` | Créer | Constantes (`TODO_COLUMN`, `DEFAULT_COLUMNS`), lecture des colonnes d'un board, validation d'un titre, couleur, libellé |
| `src/store/useBoardStore.js` | Modifier | Actions `addColumn`, `renameColumn`, `deleteColumn` |
| `src/pages/Home/Home.jsx` | Modifier | Nouveau board créé avec `columns: DEFAULT_COLUMNS` |
| `src/components/Column/Column.jsx` + `.css` | Modifier | `columnId` pour le drop, renommage par double-clic, bouton de suppression |
| `src/components/AddColumn/AddColumn.jsx` + `.css` | Créer | Carte « + Ajouter une colonne » avec saisie |
| `src/App.jsx` | Modifier | Rendu dynamique des colonnes et gestionnaires (validation, blocage de suppression) |
| `src/components/StatisticsModal/StatisticsModal.jsx` | Modifier | Afficher le titre de colonne au lieu de l'id |

---

### Tâche 1 : utilitaires de colonnes

**Fichiers :**
- Créer : `src/utils/columns.js`

- [ ] **Étape 1 : créer le module**

```js
// Utilitaires de gestion des colonnes du Kanban.
// Fonctions pures, sans dépendance à React ni à Firebase.

// Colonne permanente : toujours affichée en premier, ni renommable ni supprimable.
export const TODO_COLUMN = { id: 'To do', title: 'To do' };

// Colonnes créées par défaut sur chaque board.
// Leur id correspond à l'ancien titre afin que les tickets existants (status = titre) restent rattachés.
export const DEFAULT_COLUMNS = [
  { id: 'Doing', title: 'Doing' },
  { id: 'Done', title: 'Done' },
  { id: 'Mis en Dev', title: 'Mis en Dev' },
  { id: 'A mettre en Prod', title: 'A mettre en Prod' },
];

// Couleurs historiques des colonnes par défaut ; les colonnes ajoutées utilisent la couleur primaire.
const COLUMN_COLORS = {
  'To do': 'var(--color-primary)',
  Doing: 'var(--color-secondary)',
  Done: 'var(--color-primary)',
  'Mis en Dev': 'var(--color-dark)',
  'A mettre en Prod': 'var(--color-dark)',
};

// Retourne les colonnes personnalisables d'un board (hors To do).
// Un board antérieur à la fonctionnalité n'a pas de champ `columns` : repli sur la liste par défaut.
export const getBoardColumns = (board) =>
  Array.isArray(board?.columns) ? board.columns : DEFAULT_COLUMNS;

// Génère un identifiant unique pour une nouvelle colonne.
export const createColumnId = () => `col_${Date.now()}`;

// Vérifie un titre de colonne. Retourne un message d'erreur, ou null si le titre est valide.
// `excludeId` permet d'ignorer la colonne en cours de renommage lors du contrôle d'unicité.
export const validateColumnTitle = (title, columns, excludeId = null) => {
  const cleaned = (title || '').trim();
  if (!cleaned) return 'Le nom de la colonne ne peut pas être vide.';

  const lower = cleaned.toLowerCase();
  const isDuplicate = [TODO_COLUMN, ...columns].some(
    (col) => col.id !== excludeId && col.title.toLowerCase() === lower
  );
  if (isDuplicate) return `Une colonne nommée « ${cleaned} » existe déjà.`;

  return null;
};

// Couleur d'accent d'une colonne à partir de son id.
export const getColumnColor = (columnId) => COLUMN_COLORS[columnId] || 'var(--color-primary)';

// Libellé lisible d'un statut de ticket (id de colonne) ; repli sur la valeur brute si inconnu.
export const getColumnTitle = (columnId, columns) => {
  if (columnId === TODO_COLUMN.id) return TODO_COLUMN.title;
  const found = columns.find((col) => col.id === columnId);
  return found ? found.title : columnId;
};
```

- [ ] **Étape 2 : vérifier la logique avec un script Node**

Créer `/tmp/claude-1000/-home-ldupont-dashboard-dev/bb0e193f-552b-4b7b-9153-84617bddad98/scratchpad/check-columns.mjs` :

```js
import assert from 'node:assert/strict';
import {
  DEFAULT_COLUMNS, getBoardColumns, validateColumnTitle, getColumnColor, getColumnTitle,
} from '/home/ldupont/dashboard-dev/src/utils/columns.js';

assert.deepEqual(getBoardColumns({}), DEFAULT_COLUMNS);
assert.deepEqual(getBoardColumns({ columns: [] }), []);
assert.equal(validateColumnTitle('  ', DEFAULT_COLUMNS), 'Le nom de la colonne ne peut pas être vide.');
assert.match(validateColumnTitle('doing', DEFAULT_COLUMNS), /existe déjà/);
assert.match(validateColumnTitle('TO DO', DEFAULT_COLUMNS), /existe déjà/);
assert.equal(validateColumnTitle('Doing', DEFAULT_COLUMNS, 'Doing'), null);
assert.equal(validateColumnTitle('Recette', DEFAULT_COLUMNS), null);
assert.equal(getColumnColor('Doing'), 'var(--color-secondary)');
assert.equal(getColumnColor('col_1'), 'var(--color-primary)');
assert.equal(getColumnTitle('col_1', [{ id: 'col_1', title: 'Recette' }]), 'Recette');
assert.equal(getColumnTitle('inconnu', []), 'inconnu');
console.log('OK');
```

Lancer : `node /tmp/claude-1000/-home-ldupont-dashboard-dev/bb0e193f-552b-4b7b-9153-84617bddad98/scratchpad/check-columns.mjs`
Attendu : `OK`

- [ ] **Étape 3 : lint**

Lancer : `npm run lint`
Attendu : aucune nouvelle erreur dans `src/utils/columns.js`.

- [ ] **Étape 4 : commit**

```bash
git add src/utils/columns.js
git commit -m "feat(columns): utilitaires de gestion des colonnes personnalisables"
```

---

### Tâche 2 : actions du store et création des boards

**Fichiers :**
- Modifier : `src/store/useBoardStore.js` (import en tête, nouvelle section avant `GESTION DES TICKETS`)
- Modifier : `src/pages/Home/Home.jsx` (import + objet `newBoard` dans `handleCreateBoard`)

- [ ] **Étape 1 : ajouter l'import dans `useBoardStore.js`**

Après `import { db } from '../firebase';` :

```js
import { getBoardColumns, createColumnId } from '../utils/columns';
```

- [ ] **Étape 2 : ajouter les actions avant le bloc `GESTION DES TICKETS`**

```js
  // ==========================================
  // GESTION DES COLONNES (Écriture Firestore)
  // ==========================================

  // Réécrit le tableau complet des colonnes d'un board.
  // La validation (titre vide, doublon, colonne non vide) est faite en amont par l'interface.
  saveColumns: async (boardId, columns) => {
    try {
      await updateDoc(doc(db, 'boards', boardId), { columns });
    } catch (error) {
      console.error("Erreur saveColumns:", error);
    }
  },

  // Ajoute une colonne en fin de liste.
  addColumn: async (boardId, title) => {
    const board = get().boards.find(b => b.id === boardId);
    const columns = getBoardColumns(board);
    await get().saveColumns(boardId, [...columns, { id: createColumnId(), title: title.trim() }]);
  },

  // Renomme une colonne ; son id (référencé par les tickets) reste inchangé.
  renameColumn: async (boardId, columnId, title) => {
    const board = get().boards.find(b => b.id === boardId);
    const columns = getBoardColumns(board).map(col =>
      col.id === columnId ? { ...col, title: title.trim() } : col
    );
    await get().saveColumns(boardId, columns);
  },

  // Retire une colonne du board.
  deleteColumn: async (boardId, columnId) => {
    const board = get().boards.find(b => b.id === boardId);
    const columns = getBoardColumns(board).filter(col => col.id !== columnId);
    await get().saveColumns(boardId, columns);
  },

```

- [ ] **Étape 3 : créer les nouveaux boards avec les colonnes par défaut (`Home.jsx`)**

Ajouter l'import après `import Button from '../../components/Button/Button';` :

```js
import { DEFAULT_COLUMNS } from '../../utils/columns';
```

Dans `handleCreateBoard`, remplacer l'objet `newBoard` par :

```js
    const newBoard = {
      title: newBoardTitle.trim(),
      owner: user.email,
      members: [user.email],
      roles: {},
      // Colonnes personnalisables initiales (To do est implicite et permanente)
      columns: DEFAULT_COLUMNS,
      createdAt: new Date().toLocaleDateString('fr-FR')
    };
```

- [ ] **Étape 4 : lint et build**

Lancer : `npm run lint && npm run build`
Attendu : pas de nouvelle erreur, build réussi.

- [ ] **Étape 5 : commit**

```bash
git add src/store/useBoardStore.js src/pages/Home/Home.jsx
git commit -m "feat(columns): actions d'ajout, renommage et suppression de colonnes dans le store"
```

---

### Tâche 3 : colonnes dynamiques, renommage et suppression

**Fichiers :**
- Modifier : `src/components/Column/Column.jsx` (réécriture complète)
- Modifier : `src/components/Column/Column.css` (ajouts en fin de fichier)
- Modifier : `src/App.jsx` (imports, sélecteurs du store, gestionnaires, rendu des colonnes)

- [ ] **Étape 1 : remplacer `Column.jsx`**

```jsx
import { useState, Children } from 'react';
import useBoardStore from '../../store/useBoardStore';
import './Column.css';

// Une colonne du Kanban.
// `columnId` est la valeur stockée dans `ticket.status` ; `title` est uniquement affiché.
// `onRename` et `onDelete` sont absents pour la colonne To do et pour les viewers.
const Column = ({ columnId, title, children, headerColor, onAddClick, onRename, onDelete, userRole }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const moveTicket = useBoardStore(state => state.moveTicket);

  const ticketCount = Children.count(children);
  const statusColor = headerColor || 'var(--color-primary)';

  // -- GESTION DU DRAG AND DROP (RÉCEPTION) --
  const handleDragOver = (e) => {
    if (userRole === 'viewer') return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (userRole === 'viewer') return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    if (userRole === 'viewer') return;
    e.preventDefault();
    setIsDragOver(false);

    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) {
      moveTicket(ticketId, columnId);
    }
  };

  // -- RENOMMAGE (double-clic sur le titre) --
  const startEditing = () => {
    if (!onRename) return;
    setDraftTitle(title);
    setIsEditing(true);
  };

  const submitRename = () => {
    setIsEditing(false);
    if (draftTitle.trim() !== title) {
      onRename(draftTitle);
    }
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') submitRename();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div
      className={`column-container ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-top-accent" style={{ backgroundColor: statusColor, boxShadow: `0 0 10px ${statusColor}44` }}></div>
      <div className="column-header">
        <div className="column-header-left">
          <span className="column-status-dot" style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}55` }}></span>
          {isEditing ? (
            <input
              className="column-title-input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={() => setIsEditing(false)}
              autoFocus
            />
          ) : (
            <h3
              onDoubleClick={startEditing}
              title={onRename ? 'Double-cliquer pour renommer' : undefined}
              className={onRename ? 'column-title-editable' : undefined}
            >
              {title}
            </h3>
          )}
          <span className="column-count-badge">{ticketCount}</span>
        </div>
        <div className="column-header-actions">
          {onAddClick && (
            <button className="column-add-btn" onClick={onAddClick} title="Créer un ticket">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
          {onDelete && (
            <button className="column-delete-btn" onClick={onDelete} title="Supprimer la colonne">
              &times;
            </button>
          )}
        </div>
      </div>
      <div className="column-body">
        {children}
      </div>
    </div>
  );
};

export default Column;
```

Remarque : avec `onBlur`, un clic en dehors du champ annule le renommage, ce qui est cohérent avec Échap. La touche Entrée valide avant la perte du focus.

- [ ] **Étape 2 : ajouter les styles en fin de `Column.css`**

```css
/* -- Actions d'en-tête (ajout de ticket, suppression de colonne) -- */
.column-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.column-delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  opacity: 0;
  transition: all 0.2s;
}

/* Le bouton de suppression n'apparaît qu'au survol de la colonne pour alléger l'en-tête */
.column-container:hover .column-delete-btn,
.column-delete-btn:focus-visible {
  opacity: 1;
}

.column-delete-btn:hover {
  background-color: rgba(220, 38, 38, 0.12);
  color: #dc2626;
}

/* -- Renommage -- */
.column-title-editable {
  cursor: text;
}

.column-title-input {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  background: var(--color-column-bg);
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  padding: 2px 6px;
  width: 150px;
  outline: none;
}
```

- [ ] **Étape 3 : adapter `App.jsx`, imports et sélecteurs**

Après `import useBoardStore from './store/useBoardStore';` :

```js
import { TODO_COLUMN, getBoardColumns, getColumnColor, validateColumnTitle } from './utils/columns';
```

Après `const removeMember = useBoardStore(state => state.removeMemberFromBoard);` :

```js
  const renameColumn = useBoardStore(state => state.renameColumn);
  const deleteColumn = useBoardStore(state => state.deleteColumn);
```

- [ ] **Étape 4 : adapter `App.jsx`, gestionnaires**

Juste avant `// --- GESTION DES MEMBRES ---` :

```js
  // --- GESTION DES COLONNES ---
  const boardColumns = getBoardColumns(currentBoard);
  const canEditColumns = userRole !== 'viewer';

  // Nombre total de tickets d'une colonne, indépendamment de la recherche en cours
  const countTicketsInColumn = (columnId) =>
    tickets.filter(ticket => ticket.boardId === id && ticket.status === columnId).length;

  const handleRenameColumn = (column, title) => {
    const error = validateColumnTitle(title, boardColumns, column.id);
    if (error) {
      alert(error);
      return;
    }
    renameColumn(id, column.id, title);
  };

  // La suppression est bloquée tant que la colonne contient des tickets
  const handleDeleteColumn = (column) => {
    const count = countTicketsInColumn(column.id);
    if (count > 0) {
      alert(`Déplacez d'abord les ${count} ticket${count > 1 ? 's' : ''} de la colonne « ${column.title} ».`);
      return;
    }
    if (window.confirm(`Supprimer la colonne « ${column.title} » ?`)) {
      deleteColumn(id, column.id);
    }
  };

```

- [ ] **Étape 5 : adapter `App.jsx`, rendu**

Remplacer tout le bloc, des deux commentaires `{/* Le corps du Kanban, avec nos 5 colonnes */}` jusqu'à la fermeture de `<div className="board-container">`, par :

```jsx
      {/* Le corps du Kanban : To do (permanente) puis les colonnes personnalisables du board */}
      <div className="board-container">
        <Column
          columnId={TODO_COLUMN.id}
          title={TODO_COLUMN.title}
          headerColor={getColumnColor(TODO_COLUMN.id)}
          onAddClick={canEditColumns ? handleOpenCreateModal : undefined}
          userRole={userRole}
        >
          {getTicketsByStatus(TODO_COLUMN.id)}
        </Column>
        {boardColumns.map(column => (
          <Column
            key={column.id}
            columnId={column.id}
            title={column.title}
            headerColor={getColumnColor(column.id)}
            onRename={canEditColumns ? (title) => handleRenameColumn(column, title) : undefined}
            onDelete={canEditColumns ? () => handleDeleteColumn(column) : undefined}
            userRole={userRole}
          >
            {getTicketsByStatus(column.id)}
          </Column>
        ))}
      </div>
```

- [ ] **Étape 6 : lint et build**

Lancer : `npm run lint && npm run build`
Attendu : pas de nouvelle erreur, build réussi.

- [ ] **Étape 7 : vérification manuelle**

Lancer `npm run dev`, ouvrir un board existant :
- les 5 colonnes s'affichent comme avant, avec les mêmes tickets ;
- double-clic sur « Doing », renommer en « En cours » puis Entrée : le titre change et les tickets restent ;
- renommer en « done » : alerte de doublon ;
- × sur une colonne non vide : alerte de blocage ; × sur une colonne vide puis confirmation : la colonne disparaît ;
- glisser-déposer un ticket entre colonnes : fonctionne.

- [ ] **Étape 8 : commit**

```bash
git add src/components/Column/Column.jsx src/components/Column/Column.css src/App.jsx
git commit -m "feat(columns): rendu dynamique des colonnes avec renommage et suppression"
```

---

### Tâche 4 : carte « Ajouter une colonne »

**Fichiers :**
- Créer : `src/components/AddColumn/AddColumn.jsx`
- Créer : `src/components/AddColumn/AddColumn.css`
- Modifier : `src/App.jsx` (import + rendu en fin de `board-container`)

- [ ] **Étape 1 : créer `AddColumn.jsx`**

```jsx
import { useState } from 'react';
import './AddColumn.css';

// Carte placée après la dernière colonne, permettant d'en créer une nouvelle.
// `onAdd(title)` retourne true si la colonne a été créée (titre valide), false sinon.
const AddColumn = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');

  const close = () => {
    setIsOpen(false);
    setTitle('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAdd(title)) close();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') close();
  };

  if (!isOpen) {
    return (
      <button className="add-column-trigger" onClick={() => setIsOpen(true)}>
        + Ajouter une colonne
      </button>
    );
  }

  return (
    <form className="add-column-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom de la colonne..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (!title.trim()) close(); }}
        autoFocus
      />
      <div className="add-column-actions">
        <button type="submit" disabled={!title.trim()}>Ajouter</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={close}>Annuler</button>
      </div>
    </form>
  );
};

export default AddColumn;
```

Remarque : la perte du focus ne ferme le formulaire que si le champ est vide, pour ne pas perdre une saisie lors d'un clic sur « Ajouter ».

- [ ] **Étape 2 : créer `AddColumn.css`**

```css
/* Carte d'ajout de colonne, alignée sur la largeur minimale des colonnes */
.add-column-trigger,
.add-column-form {
  flex-shrink: 0;
  width: 290px;
  border-radius: 14px;
  align-self: flex-start;
}

.add-column-trigger {
  padding: 14px 16px;
  background: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.add-column-trigger:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: rgba(98, 182, 203, 0.08);
}

.add-column-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background-color: var(--color-column-bg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.add-column-form input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  outline: none;
}

.add-column-form input:focus {
  border-color: var(--color-primary);
}

.add-column-actions {
  display: flex;
  gap: 8px;
}

.add-column-actions button {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
}

.add-column-actions button[type='submit'] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.add-column-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Étape 3 : brancher dans `App.jsx`**

Après `import useBoardStore from './store/useBoardStore';` :

```js
import AddColumn from './components/AddColumn/AddColumn';
```

Après `const deleteColumn = useBoardStore(state => state.deleteColumn);` :

```js
  const addColumn = useBoardStore(state => state.addColumn);
```

Dans le bloc `// --- GESTION DES COLONNES ---`, après `countTicketsInColumn` :

```js
  // Retourne true si la colonne a été créée, afin que la carte d'ajout puisse se refermer
  const handleAddColumn = (title) => {
    const error = validateColumnTitle(title, boardColumns);
    if (error) {
      alert(error);
      return false;
    }
    addColumn(id, title);
    return true;
  };
```

Juste avant la fermeture `</div>` de `board-container` (après le `boardColumns.map(...)`) :

```jsx
        {canEditColumns && <AddColumn onAdd={handleAddColumn} />}
```

- [ ] **Étape 4 : lint et build**

Lancer : `npm run lint && npm run build`
Attendu : pas de nouvelle erreur, build réussi.

- [ ] **Étape 5 : vérification manuelle**

- clic sur « + Ajouter une colonne », saisir « Recette » puis Entrée : la colonne apparaît à droite ;
- glisser un ticket dans « Recette » : il y reste après rechargement de la page ;
- renommer « Recette » : le ticket reste dedans ;
- saisir « to do » : alerte de doublon, formulaire toujours ouvert ;
- Échap : le formulaire se ferme.

- [ ] **Étape 6 : commit**

```bash
git add src/components/AddColumn src/App.jsx
git commit -m "feat(columns): carte d'ajout de colonne en fin de tableau"
```

---

### Tâche 5 : statistiques avec les titres de colonnes

**Fichiers :**
- Modifier : `src/components/StatisticsModal/StatisticsModal.jsx` (import + libellé de statut)

- [ ] **Étape 1 : import**

En tête du fichier, après `import './StatisticsModal.css';` :

```js
import { getBoardColumns, getColumnTitle } from '../../utils/columns';
```

- [ ] **Étape 2 : afficher le titre**

Dans les barres de progression, remplacer :

```jsx
                          <span>{status}</span>
```

par :

```jsx
                          {/* Le statut stocké est l'id de colonne : affichage de son titre lisible */}
                          <span>{getColumnTitle(status, getBoardColumns(board))}</span>
```

- [ ] **Étape 3 : lint et build**

Lancer : `npm run lint && npm run build`
Attendu : pas de nouvelle erreur, build réussi.

- [ ] **Étape 4 : vérification manuelle**

Ouvrir les statistiques d'un board ayant un ticket dans une colonne ajoutée : la ligne affiche « Recette » et non `col_…`.

- [ ] **Étape 5 : commit**

```bash
git add src/components/StatisticsModal/StatisticsModal.jsx
git commit -m "fix(stats): affichage du titre des colonnes personnalisées"
```

---

### Tâche 6 : vérification finale

- [ ] **Étape 1 :** `npm run lint && npm run build`, attendu : succès.
- [ ] **Étape 2 :** test manuel complet de la spec, y compris :
  - un nouveau board créé depuis l'accueil a les 5 colonnes ;
  - un compte viewer ne voit ni la carte d'ajout, ni les boutons ×, ni le renommage ;
  - deux onglets ouverts sur le même board : un ajout de colonne apparaît dans l'autre en temps réel.
- [ ] **Étape 3 :** présenter le résultat à l'utilisateur. Aucun push ni merge sans son accord explicite.
