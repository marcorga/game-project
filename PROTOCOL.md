# PROTOCOL.md - Évolution Modulaire et Gestion des Experts

Ce document définit comment le projet doit croître sans saturer le contexte des agents.

## 1. Création de Nouveau Module
Toute nouvelle fonctionnalité majeure doit être isolée dans un fichier `.js` dédié.
**Action :** L'Architecte crée le fichier et le déclare dans `ARCHITECTURE.md`.

## 2. Cycle de Vie des Experts
Chaque module (ou groupe de modules cohérents) est la propriété exclusive d'un Expert.
- **Si le module existe :** Utiliser l'expert assigné via `sessions_spawn(agentId='expert-...')`.
- **Si le module est nouveau :**
    1. L'Architecte patche la Gateway pour ajouter l'agent.
    2. L'Architecte assigne le fichier à cet agent dans `ARCHITECTURE.md`.

## 3. Gestion du Contexte (Zonage)
Pour minimiser le "token burn" et maximiser la précision :
- **Entrée :** Un Expert ne reçoit que son brief, ses fichiers assignés et le `PROGRESSION.md`.
- **Sortie :** L'Expert rend son travail et le **Chroniqueur** synthétise le résultat dans `LAST_REPORT.md` et `PROGRESSION.md`.
- **Interdiction :** Un Expert ne doit pas modifier un fichier qui ne lui appartient pas sans l'accord de l'Architecte.

## 4. Rôle du Chroniqueur (Chronicle)
Il est le seul à lire l'intégralité de l'historique pour en extraire la substantifique moelle. Il prépare les "Briefs de Contexte" pour les autres.
