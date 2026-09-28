# DevBoard Kanban

Une application web de type tableau Kanban pour la gestion et le suivi de tickets, conçue pour les équipes de développement.

## Description du Projet

Ce projet est une interface de suivi de tâches développée avec React et Vite. Il permet d'organiser le travail de l'équipe à travers différentes colonnes représentant l'état d'avancement des tickets, de la création jusqu'à la mise en production.

## Fonctionnalités Principales

- Interface Kanban fluide avec 5 colonnes par défaut :
  - To do
  - Doing
  - Done
  - Mis en Dev
  - A mettre en Prod
- Création de tickets via une fenêtre modale superposée.
- Système de design sur mesure basé sur une palette de couleurs centralisée via des variables CSS.
- Mise en page adaptative s'étirant automatiquement sur toute la hauteur et la largeur de l'écran grâce à Flexbox.

## Technologies Utilisées

- React 19
- Vite
- CSS3 (Variables natives pour la gestion du thème global)

## Installation et Utilisation

### Prérequis

Node.js doit être installé sur votre machine.

### Démarrage Rapide

1. Installez les dépendances du projet :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

L'application sera accessible dans votre navigateur (généralement sur http://localhost:5173).

3. Pour compiler le projet pour la production :
   ```bash
   npm run build
   ```

## Architecture du Code

- `src/App.jsx` : Conteneur principal gérant l'agencement du tableau et préparant l'espace pour la barre de navigation.
- `src/components/Column/` : Composant réutilisable définissant la structure, le style et l'espacement d'une colonne du tableau.
- `src/components/TicketModal/` : Fenêtre modale gérant l'interface de création de nouveaux tickets.
- `src/index.css` : Fichier de styles globaux contenant la palette de couleurs officielle.

## Stratégie de Développement

Le projet utilise une stratégie de branches par fonctionnalité (feature branching) pour faciliter le travail en équipe. 
Exemples de branches actives :
- `feature/columns` : Conception de la structure du tableau et des colonnes.
- `features/navbar` : Construction de la barre de navigation supérieure.
