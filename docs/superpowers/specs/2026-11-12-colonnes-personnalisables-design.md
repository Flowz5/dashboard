# Colonnes personnalisables — Design

Date : 2026-11-12
Branche : `feature/colonnes-personnalisables`

## Objectif

Rendre le tableau Kanban utilisable au-delà du développement : chaque board peut ajouter, renommer et supprimer ses propres colonnes après la colonne permanente « To do ».

## Modèle de données

- Le document `boards/{id}` reçoit un champ `columns: Array<{ id: string, title: string }>`.
- La colonne « To do » n'est **pas** stockée dans ce tableau : elle est toujours affichée en premier, avec l'id `'To do'`, et n'est ni renommable ni supprimable.
- Colonnes par défaut (constante `DEFAULT_COLUMNS`) :
  `[{ id: 'Doing', title: 'Doing' }, { id: 'Done', title: 'Done' }, { id: 'Mis en Dev', title: 'Mis en Dev' }, { id: 'A mettre en Prod', title: 'A mettre en Prod' }]`
- Leur `id` est égal à leur titre historique. Comme `ticket.status` contient déjà ces valeurs, les tickets existants restent rattachés sans migration.
- Une colonne ajoutée reçoit un id `col_<Date.now()>`. Le `ticket.status` d'un ticket contient désormais l'**id** de sa colonne.
- Un board sans champ `columns` (boards existants) est lu avec `DEFAULT_COLUMNS`. Le champ est écrit lors de la première modification.
- Un nouveau board est créé avec `columns: DEFAULT_COLUMNS`.

## Store (`useBoardStore`)

Nouvelles actions, chacune réécrivant le tableau `columns` du board via `updateDoc` :

- `addColumn(boardId, title)` : ajoute `{ id: 'col_' + Date.now(), title }` en fin de liste.
- `renameColumn(boardId, columnId, title)` : modifie uniquement `title`.
- `deleteColumn(boardId, columnId)` : retire la colonne du tableau.

Le tableau courant est lu depuis `boards` dans le store, avec un repli sur `DEFAULT_COLUMNS`. La synchronisation temps réel existante (`listenToBoards`) met l'affichage à jour.

## Interface

- `App.jsx` (BoardView) affiche « To do » puis un `.map` sur les colonnes du board, au lieu des 5 colonnes écrites en dur.
- `Column.jsx` reçoit un `columnId`, utilisé par le drop (`moveTicket(ticketId, columnId)`), ainsi que des callbacks `onRename` et `onDelete` (absents pour To do et pour les viewers).
- **Ajout** : une carte « + Ajouter une colonne » après la dernière colonne. Un clic ouvre un champ de saisie : Entrée valide, Échap ou perte du focus annule.
- **Renommage** : double-clic sur le titre, qui devient un champ de saisie. Entrée valide, Échap annule.
- **Suppression** : bouton × dans l'en-tête. Si la colonne contient au moins un ticket, la suppression est bloquée par une alerte « Déplacez d'abord les N tickets de cette colonne ». Sinon, un `window.confirm` est demandé.
- **Validation** (ajout et renommage) : titre nettoyé avec `trim`, non vide, et unique sans tenir compte de la casse parmi toutes les colonnes, To do comprise. En cas d'échec, une alerte explicite s'affiche et rien n'est écrit.
- **Couleurs** : To do et Done utilisent `--color-primary`, Doing `--color-secondary`, Mis en Dev et A mettre en Prod `--color-dark`. Les colonnes ajoutées utilisent `--color-primary`.
- **Droits** : propriétaire et éditeurs gèrent les colonnes, les viewers ne voient aucune commande.
- Le comptage des tickets pour bloquer la suppression porte sur **tous** les tickets de la colonne, sans le filtre de recherche.

## Impacts annexes

- `StatisticsModal` : affiche le titre de la colonne correspondant à `ticket.status` (repli sur la valeur brute si la colonne est inconnue).
- `TicketModal` : inchangé (le statut par défaut reste `'To do'`).
- `Navbar` / `NotificationsModal` : détection « terminé » par le texte du statut, inchangée. Elle continue de fonctionner pour la colonne par défaut `Done`.

## Hors périmètre

Réordonnancement des colonnes, choix de couleur par colonne, modèles de board.

## Vérification

Le projet n'a pas de tests automatisés. La vérification repose sur `npm run lint`, `npm run build` et un test manuel dans l'application : ajout, renommage, doublon refusé, suppression bloquée puis autorisée, drag & drop vers une colonne ajoutée, board existant sans champ `columns`, compte viewer.
