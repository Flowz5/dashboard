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

Voici le diagramme d'architecture complet de l'application, montrant comment les différents composants React, le routeur, le gestionnaire d'état (Zustand) et la base de données (Firebase) interagissent ensemble.

```mermaid
graph TD
    %% Définition des acteurs
    User((Utilisateur))

    %% Point d'entrée & Routage
    subgraph Routing ["Accès & Routage (React Router)"]
        App[App.jsx <br/> Point d'entrée principal]
        Login[Login.jsx <br/> Authentification]
    end

    %% Page d'accueil (Projets)
    subgraph Projects ["Espace Projets"]
        Home[Home.jsx <br/> Liste des Dashboards]
    end

    %% Espace Kanban
    subgraph Kanban ["Espace Kanban (BoardView)"]
        BoardView[BoardView (App.jsx) <br/> Affichage d'un projet]
        Navbar[Navbar.jsx <br/> En-tête & Recherche]
        Column[Column.jsx <br/> Colonne de statut]
        Ticket[Ticket.jsx <br/> Carte du ticket]
        TicketModal[TicketModal.jsx <br/> Modale Création/Édition]
        InviteModal[InviteModal.jsx <br/> Inviter un membre]
        Button[Button.jsx <br/> Bouton partagé]
    end

    %% Gestion des données (State & Backend)
    subgraph Data ["Données & Backend"]
        Zustand[useBoardStore.js <br/> Store global Zustand]
        FirebaseSetup[firebase.js <br/> Initialisation SDK]
        Auth[(Firebase Auth)]
        Firestore[(Cloud Firestore)]
    end

    %% Flux d'interaction principal
    User -->|Ouvre l'application| App
    App -->|Si non connecté| Login
    App -->|Si connecté| Home
    App -->|Accède à un projet spécifique| BoardView

    %% Interactions dans l'espace Projets
    Home -->|Clique sur un projet| BoardView
    Home -->|Lit/Crée/Supprime des projets| Zustand

    %% Interactions dans le Kanban
    BoardView --> Navbar
    BoardView --> Column
    Column --> Ticket
    BoardView --> TicketModal
    BoardView --> InviteModal
    
    Navbar -->|Gère les invitations| InviteModal
    Ticket -->|Clic pour éditer| TicketModal
    
    %% Interactions avec le Store
    BoardView -->|Lit/Crée/Modifie des tickets| Zustand
    TicketModal -->|Soumet les données| BoardView
    InviteModal -->|Ajoute un email| Zustand

    %% Connexion au Backend
    Zustand -->|CRUD Temps réel| FirebaseSetup
    Login -->|Vérification identifiants| FirebaseSetup
    
    FirebaseSetup --> Auth
    FirebaseSetup --> Firestore

    %% Styles
    classDef react fill:#61dafb,stroke:#333,stroke-width:2px,color:#000;
    classDef store fill:#f9e79f,stroke:#f39c12,stroke-width:2px,color:#000;
    classDef backend fill:#f5b041,stroke:#d35400,stroke-width:2px,color:#fff;
    classDef ui fill:#d5f5e3,stroke:#27ae60,stroke-width:2px,color:#000;
    
    class App,Login,Home,BoardView react;
    class Zustand store;
    class FirebaseSetup,Auth,Firestore backend;
    class Navbar,Column,Ticket,TicketModal,InviteModal,Button ui;
```

- `src/App.jsx` : Conteneur principal gérant l'agencement du tableau et préparant l'espace pour la barre de navigation.
- `src/components/Column/` : Composant réutilisable définissant la structure, le style et l'espacement d'une colonne du tableau.
- `src/components/TicketModal/` : Fenêtre modale gérant l'interface de création de nouveaux tickets.
- `src/index.css` : Fichier de styles globaux contenant la palette de couleurs officielle.

## Stratégie de Développement

Le projet utilise une stratégie de branches par fonctionnalité (feature branching) pour faciliter le travail en équipe. 
Exemples de branches actives :
- `feature/columns` : Conception de la structure du tableau et des colonnes.
- `features/navbar` : Construction de la barre de navigation supérieure.
