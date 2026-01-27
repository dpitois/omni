# Cahier des Charges : Modern Vintage Outliner (MVO)

## 1. Vision du Produit

Application web ultra-légère de prise de notes structurée. Fusion de l'ergonomie hiérarchique d'OmniOutliner et du système de tags/vues d'Obsidian.

## 2. Stack Technique

* Framework : Preact (via ViteJS) pour un bundle minimal.
* Styling : Tailwind CSS (Look macOS/Aqua moderne).
* Icons : Lucide-Preact.
* Architecture : Séparation Logic/View via Hooks personnalisés.
* Persistence : Abstraction du Storage pour évolution vers API.

## 3. Architecture Logicielle

* useOutliner (Hook) : Gestion de la structure de l'arbre (CRUD, indentation, état).
* useTags (Hook) : Analyseur de texte pour extraction des tags via regex (/#\w+/g).
* OutlinerWrapper : Composant de liaison (Glue) entre les hooks et l'UI.
* NodeItem : Composant de rendu pur pour les lignes.

## 4. Structure des Données

Interface Node :

* id : string (UUID)
* text : string
* level : number (0-5)
* checked : boolean
* parentId : string | null
* updatedAt : number

## 5. Spécifications Fonctionnelles

* Navigation Clavier : Enter (nouveau nœud), Tab (indenter), Shift+Tab (désindenter), Flèches (navigation).
* Mode Hiérarchique : Affichage de l'arbre avec marges dynamiques (30px par niveau).
* Mode Pivot (Tags) : Vue alternative regroupant les nœuds par tags, indépendamment de leur position dans l'arbre.
* Persistence : Implémentation initiale en LocalStorage, conçue pour injection d'une API REST ultérieure.

## 6. Design UI

* Zebra-striping (lignes alternées).
* Focus automatique lors de la création de ligne.
* Checkbox de statut pour suivi d'avancement.
* Typographie système (San Francisco / Segoe UI).