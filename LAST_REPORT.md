# Rapport de Cycle - Expert Engine & Creative
- Tâches effectuées : Système de niveaux multiples et Design du Niveau 2.
- Détails techniques :
    - Refactorisation du code pour supporter un tableau de niveaux (`levels`).
    - Implémentation de `initLevel(index)` pour charger dynamiquement les plateformes, ennemis et objectifs.
    - Ajout d'une transition de victoire permettant de passer au niveau suivant via la touche "Entrée".
    - Design du Niveau 2 : plus long (1800px), avec des trous dans le sol (mort par chute) et des ennemis plus rapides patrouillant sur des plateformes en hauteur.
- Prochaine étape suggérée : Ajout de sons ou retours haptiques visuels (Expert VFX).