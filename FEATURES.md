# FEATURES.md - Snapshot des Fonctionnalités

Ce document liste l'état fonctionnel du jeu à un instant T. 
**État :** 🟢 Opérationnel | 🟡 Expérimental | ⚪ Prévu

## 🏃 Mouvement & Physique
- 🟢 **Déplacements :** Gauche/Droite avec friction et inertie.
- 🟢 **Saut :** Système de saut avec particule au décollage.
- 🟢 **Squash & Stretch :** Déformation visuelle du personnage selon la vitesse.
- 🟢 **Collisions :** Gestion des plateformes et du sol (Fix #CornerGlitch résolu).
- 🟢 **Plateformes Mouvantes :** Plateformes horizontales et verticales transportant le joueur.

## 🎮 Gameplay & Progression
- 🟢 **Système de Vie :** HP (3 max), invincibilité temporaire après dégât.
- 🟢 **Collectables :** Pièces d'or avec compteur par niveau et total.
- 🟢 **Items :** Cœurs de soin (Pop-up visuel).
- 🟢 **Niveaux :** Transition automatique vers le niveau suivant via le drapeau.
- 🟢 **Leaderboard :** Sauvegarde locale des records de pièces.

## 🎨 Visuels & Ambiance
- 🟢 **Parallaxe :** Nuages (vitesse lente) et Montagnes (vitesse très lente).
- 🟢 **Décors :** Arbres et buissons générés aléatoirement sur les plateformes.
- 🟢 **Particules :** Effets de poussière (saut/atterrissage) et collecte.
- 🟢 **Météo :** Système de vent dynamique influençant le décor (arbres, buissons, herbe).
- ⚪ **Pluie :** Particules et effets de surface (Prévu).

## 🎵 Audio
- 🟢 **Musique Procédurale :** Changement de gamme (Majeure/Mineure) selon le niveau.
- 🟢 **SFX :** Saut, collecte de pièce, dégât, victoire.
- ⚪ **Rythmique :** Percussions dynamiques (Prévu).

## 📱 Interface (UI)
- 🟢 **HUD :** Affichage HP, Timer, Pièces, FPS et Barre de progression.
- 🟢 **Menu :** Écran de démarrage (Start) et Game Over.
- 🟢 **Navigation :** Support Clavier (Flèches + Espace/Enter).
