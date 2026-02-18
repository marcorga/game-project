# PROGRESSION.md - Suivi par Experts

## 📅 État au 2026-02-18
**Phase actuelle :** Expansion du moteur physique et de la diversité des niveaux.

### ✅ Travaux Terminés (Expertise)
- **UI/LOGIC :** Mission 'Système de Combo/Multiplicateur' : Implémentation du système de score dynamique avec multiplicateur progressif et affichage HUD animé.
- **ENGINE :** Résolution du bug des collisions de coins (Fix #CornerGlitch) via l'implémentation d'une résolution AABB robuste (axes de séparation).
- **VFX :** Ajout de l'effet de vent dynamique sur le feuillage (arbres, buissons et herbe) pour améliorer l'immersion.
- **ENGINE :** Correction CRITIQUE : Prévention des positions NaN en robustifiant le moteur et les données des niveaux.
- **ENGINE :** Correction de la régression : le joueur ne passe plus à travers les plateformes statiques.
- **ENGINE :** Implémentation des plateformes mouvantes (cycle complet).
- **ENGINE :** Refactoring du joueur terminé.
- **VFX :** Isolation du système de particules et parallaxe.
- **UI :** Extraction totale des inputs et du HUD.
- **LOGIC :** Centralisation de la gestion des buts et items.
- **LOGIC :** Implémentation de l'Ennemi Volant (flyer) avec mouvement sinusoïdal et patrouille.

### 🛠️ En Cours
- **AUDIO :** Intégration de la rythmique percutante dynamique.
- **VFX :** Implémentation du système de pluie.

## 🧠 Note du CHRONIQUEUR
Le projet est prêt pour une scalabilité massive. Chaque nouveau fichier `.js` doit désormais être assigné à un Expert existant ou provoquer la création d'un nouveau profil.
