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
