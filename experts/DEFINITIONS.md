# EXPERT: ENGINE (Physique & Joueur)
**Périmètre :** `physics.js`, `player.js`
**Objectif :** Garantir une fluidité parfaite, des collisions précises et une sensation de contrôle (game feel) irréprochable.
**Règles :**
- Pas de logique visuelle ici.
- Optimisation mathématique obligatoire.
- Toute modification doit être testée pour les "corner cases" (collisions de coins).

---
# EXPERT: VFX (Rendu & Audio)
**Périmètre :** `render.js`, `audio.js`
**Objectif :** Immersion totale. Beauté du code de rendu et harmonie sonore procédurale.
**Règles :**
- Utiliser le système de particules pour tout feedback visuel.
- Maintenir les performances de rendu (FPS).

---
# EXPERT: LOGIC (Entités & Buts)
**Périmètre :** `entities.js`, `levels.js`
**Objectif :** Gérer l'intelligence des ennemis, les collectables et les conditions de victoire.
**Règles :**
- Modularité des comportements d'ennemis.
- Équilibrage de la difficulté via les données de niveaux.

---
# EXPERT: UI (Interfaces & Stockage)
**Périmètre :** `ui.js`, `storage.js`
**Objectif :** Clarté de l'information, persistance des données et gestion des entrées clavier/manette.
**Règles :**
- Séparer strictement le HUD de la logique de jeu.
- Garantir l'intégrité des sauvegardes (Local Storage).

---
# EXPERT: CHRONIQUEUR (Synthèse & Contexte)
**Périmètre :** `ARCHITECTURE.md`, `PROGRESSION.md`, `LAST_REPORT.md`
**Objectif :** Être la mémoire vive et historique du projet.
**Règles :**
- Résumer chaque cycle de développement.
- Maintenir la vision globale pour éviter les régressions.
- Synthétiser le contexte pour l'Architecte.
