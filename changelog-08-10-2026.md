---
title: Changelog du 08 Octobre 2026
date: 2026-10-08
tags: [changelog, react, firebase, kanban]
---

# Résumé des modifications

Une énorme journée de refonte et d'améliorations pour le dashboard Kanban. Voici la liste exhaustive des modifications apportées aujourd'hui.

## 1. Refonte Globale & Navigation (Workspaces)
- Création d'une **sidebar dynamique** (style Notion) pour la page d'accueil.
- Possibilité de créer des dossiers (Workspaces personnels).
- Mécanisme d'accordéon pour plier/déplier les dossiers avec animation fluide.
- Drag & Drop ou sélection pour déplacer un projet d'un dossier à un autre.

## 2. Refonte Visuelle (Purge des Emojis)
- Suppression totale de tous les emojis natifs de l'application.
- Remplacement par des icônes SVG minimalistes (type Lucide) et des éléments CSS purs (comme les points colorés pour les priorités).
- Harmonisation avec le thème sombre (mode dark).

## 3. Pièces Jointes sans Firebase Storage
- Ajout de la fonctionnalité de **Drag & Drop** pour glisser-déposer des fichiers dans les tickets.
- Implémentation d'une astuce de **compression d'image côté client** (via HTML5 Canvas) pour convertir les images en chaînes Base64.
- Cela permet de sauvegarder les images directement dans les documents Firestore sans avoir besoin de payer un abonnement Firebase Storage (plan Blaze).

## 4. Modale de Notifications Dynamique
- Création d'une icône cloche 🔔 dans la barre de navigation.
- La pastille rouge s'incrémente dynamiquement selon les tickets assignés.
- Au lieu de créer une nouvelle collection dans Firebase, le système balaie **tous les tickets du `userStore`** (`myTickets`) pour générer les notifications à la volée.
- Notifications gérées : Ticket assigné (Info), Échéance proche <= 2 jours (Warning), Ticket en retard (Danger).

## 5. Modale Calendrier & Raccourcis
- Intégration d'une **Modale Calendrier** accessible depuis la barre de navigation.
- Les dates avec échéances arborent de petits points colorés selon la priorité.
- Au clic sur une date, les tickets du jour s'affichent.
- **Auto-scroll & Highlight** : Cliquer sur un ticket dans le calendrier nous téléporte sur le Kanban, fait défiler la page automatiquement vers le ticket, et le fait clignoter en bleu.
- **Création rapide** : Un bouton "Créer un ticket" apparaît au clic sur une date, pré-remplissant le champ `Date butoire` avec la date sélectionnée.

## 6. Stabilité & Résolution de Bugs
- Implémentation d'un **React Error Boundary** global (`ErrorBoundary.jsx`) pour empêcher les écrans blancs fatals (White Screen of Death) et afficher proprement la trace de l'erreur.
- Résolution d'un bug majeur de plantage lié à des propriétés `undefined` (`board.columns`, `col.tickets`).
- Correction d'un bug vicieux sur le format des dates : l'application force désormais l'affichage en locale `fr-FR` (`JJ/MM/AAAA`) au lieu de `en-US` (`MM/JJ/AAAA`) pour éviter que le 10 Septembre ne soit confondu avec le 9 Octobre.
