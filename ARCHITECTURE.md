# ARCHITECTURE.md - Vision Modulaire du Projet

## 🏗️ Structure Globale
L'architecture repose sur un orchestrateur central (`main.js`) qui délègue chaque sous-système à un module spécialisé.

| Module | Expert Responsable | Rôle Principal |
| :--- | :--- | :--- |
| `player.js` | ENGINE | État et méthodes du joueur |
| `physics.js` | ENGINE | Moteur de collision et gravité |
| `render.js` | VFX | Dessin, Particules et Parallaxe |
| `audio.js` | VFX | Musique procédurale et SFX |
| `entities.js` | LOGIC | Ennemis, Items, Goal |
| `levels.js` | LOGIC | Données brutes des niveaux |
| `ui.js` | UI | HUD et Inputs clavier |
| `storage.js` | UI | Leaderboard et Sauvegardes |

## 🔗 Flux de Données
1. `main.js` importe les modules.
2. `ui.js` capture les inputs.
3. `physics.js` calcule les nouvelles positions.
4. `render.js` dessine l'état final.

## 🎯 Context Mapping (Périmètres Experts)
*   **expert-engine** : `physics.js`, `player.js`
*   **expert-vfx** : `render.js`
*   **expert-audio** : `audio.js`
*   **expert-logic** : `entities.js`, `levels.js`
*   **expert-ui** : `ui.js`, `storage.js`
*   **expert-chronicle** : `ARCHITECTURE.md`, `PROGRESSION.md`, `PROTOCOL.md`, `FEATURES.md`
*   **expert-qa** : (Tout le projet en lecture seule pour tests)
*   **expert-creative** : `levels.js`
