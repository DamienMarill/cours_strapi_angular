# 🎭 Gestionnaire de Memes - Spécifications Complètes

## Vue d'ensemble
Application web moderne pour créer, partager et gérer des memes avec une communauté d'utilisateurs. Backend Directus v11 avec recherche intelligente Meilisearch, notifications temps réel via WebSockets.

## 🎯 Architecture Technique

### Stack Complet
- **Backend**: Directus v11.10.2 (SQLite + TypeScript)
- **Recherche**: Meilisearch (typo-tolérante, facettes avancées)
- **Frontend**: Angular v20 (standalone components)
- **Base de données**: SQLite avec relations automatiques
- **Temps réel**: WebSockets Directus + notifications
- **API**: REST + GraphQL générées automatiquement
- **Tests**: Insomnia/Postman (collections organisées)

### Fonctionnalités Modernes Implémentées
- ✅ **Authentification JWT** avec rôles granulaires
- ✅ **Upload automatique** avec transformations d'images
- ✅ **Recherche intelligente** typo-tolérante
- ✅ **Système de likes** avec notifications
- ✅ **Tags dynamiques** créés par utilisateurs  
- ✅ **Notifications temps réel** via WebSockets
- ✅ **API personnalisée** avec endpoints custom
- ✅ **Synchronisation automatique** Directus ↔ Meilisearch

## 📊 Modèle de Données Directus

### Collections Principales

#### directus_users (Système intégré)
```yaml
Champs automatiques:
  id: UUID (Primary Key)
  first_name: String
  last_name: String  
  email: String (unique, auth)
  password: String (hashé auto)
  avatar: File (relation directus_files)
  status: active/suspended/deleted
  role: admin/authenticated_user/public
  date_created: Timestamp (auto)
  last_access: Timestamp (auto)

Relations sortantes:
  - memes créés (1:N)
  - likes donnés (1:N) 
  - notifications reçues (1:N)
```

#### memes
```yaml
Champs:
  id: UUID (Primary Key, auto-generated)
  title: String (required, max 255 chars)
  image: File (required, images only)
  text_top: String (optional, max 100 chars)
  text_bottom: String (optional, max 100 chars)
  views: Integer (default 0, read-only)
  likes: Integer (default 0, calculé)
  user_created: M2O → directus_users (automatique)
  tags: M2M → tags (table liaison memes_tags)
  status: published/draft/archived
  date_created: Timestamp (automatique)
  date_updated: Timestamp (automatique)

Relations:
  - memes_likes (1:N) - qui a liké
  - memes_tags (1:N) - tags associés
  - notifications (1:N) - notifications générées
```

#### tags  
```yaml
Champs:
  id: UUID (Primary Key, auto-generated)
  name: String (required, unique, max 50 chars)
  date_created: Timestamp (automatique)
  date_updated: Timestamp (automatique)

Relations:
  - memes_tags (1:N) - memes utilisant ce tag

Permissions spéciales:
  - Création libre par utilisateurs authentifiés
  - Pas de suppression (tags partagés)
```

#### memes_likes (Table de liaison)
```yaml
Champs:
  id: UUID (Primary Key, auto-generated)
  meme_id: M2O → memes (cascade delete)
  user_id: M2O → directus_users (cascade delete)
  date_created: Timestamp (automatique)

Contraintes:
  - Unique (user_id, meme_id) - un like par user/meme
  - Index sur (meme_id) pour performance
```

#### notifications (Système temps réel)
```yaml
Champs:
  id: UUID (Primary Key, auto-generated)
  user_id: M2O → directus_users (required)
  message: String (required, max 255 chars)
  meme_id: M2O → memes (optional)
  event_type: nouveau_meme/nouveau_like/nouveau_tag
  is_read: Boolean (default false)
  date_created: Timestamp (automatique)

Index:
  - (user_id, is_read) pour requêtes optimisées
  - (date_created DESC) pour tri chronologique
```

### Relations et Cardinalités

**Relations Principales:**
1. **Users → Memes (1:N)** - Un utilisateur crée plusieurs memes
2. **Users → Memes_Likes (1:N)** - Un utilisateur like plusieurs memes  
3. **Memes → Memes_Likes (1:N)** - Un meme reçoit plusieurs likes
4. **Memes ↔ Tags (N:M)** - Relations complexes via memes_tags
5. **Users → Notifications (1:N)** - Un utilisateur reçoit plusieurs notifications
6. **Memes → Notifications (1:N)** - Un meme peut générer plusieurs notifications

## 🔒 Système de Permissions (RBAC)

### Rôles Configurés

#### Public (Non authentifié)
```yaml
memes: Read (status = published)
tags: Read all
memes_likes: Read all  
notifications: ❌ Aucun accès
files: Read (assets seulement)
```

#### Authenticated User
```yaml
memes: 
  - Read: Tous
  - Create: ✅ (user_created = $CURRENT_USER auto)
  - Update: Ses propres memes seulement
  - Delete: Ses propres memes seulement

memes_likes:
  - Read: Tous
  - Create: ✅ (user_id = $CURRENT_USER auto)  
  - Delete: Ses propres likes seulement
  - Update: ❌ (pas besoin)

tags:
  - Read: Tous
  - Create: ✅ (création dynamique autorisée)
  - Update/Delete: ❌ (tags partagés)

notifications:
  - Read: Ses propres notifications (user_id = $CURRENT_USER)
  - Update: Mark as read seulement
  - Delete: Ses propres notifications
  - Create: ❌ (système automatique)
```

#### Admin
```yaml
Accès complet: CRUD sur toutes les collections
+ Gestion utilisateurs et permissions
+ Configuration système
```

### Filtres de Sécurité
- **Memes publics**: `status = 'published'`
- **Mes memes**: `user_created = $CURRENT_USER`
- **Mes likes**: `user_id = $CURRENT_USER` 
- **Mes notifications**: `user_id = $CURRENT_USER`

## 🔍 Recherche Intelligente (Meilisearch)

### Architecture de Recherche
```
Frontend Angular
    ↓ API Request
Directus Endpoints Custom (/search/*)
    ↓ Proxy sécurisé  
Meilisearch Engine
    ↓ Index synchronisé
SQLite Database (source de vérité)
```

### Fonctionnalités de Recherche

#### Recherche Typo-tolérante
```javascript
// "meem" trouve "meme"
// "progrmation" trouve "programmation" 
// "rigolo" trouve via synonymes "drôle", "funny"
```

#### Facettes Intelligentes
```yaml
Tags populaires: Comptage automatique des tags les plus utilisés
Créateurs actifs: Top créateurs de memes
Périodes: Memes récents/populaires/trending
```

#### Autocomplétion
```javascript
// Suggestions instantanées basées sur:
// - Titres de memes
// - Tags populaires  
// - Noms de créateurs
```

### Configuration Index Meilisearch
```yaml
Attributs de recherche:
  - title (poids: élevé)
  - searchable_content (combiné)
  - tags (poids: moyen)
  - creator (poids: faible)

Attributs filtrables:
  - tags, creator, likes, views, date_created

Attributs triables:  
  - date_created, likes, views

Synonymes configurés:
  drôle: [funny, rigolo, marrant]
  programmation: [code, dev, informatique]
```

### Endpoints de Recherche Custom
```yaml
GET /search/memes:
  - q: terme de recherche
  - tags: filtres par tags 
  - creator: filtre par créateur
  - sort: date_desc/likes_desc/views_desc/relevance
  - limit/offset: pagination

GET /search/memes/suggest:
  - q: terme pour autocomplétion
  - limit: nombre de suggestions

GET /search/memes/facets:
  - Retourne tags populaires + créateurs actifs
```

## 🔄 Temps Réel (WebSockets)

### Fonctionnalités Temps Réel
- **Notifications instantanées** quand quelqu'un like votre meme
- **Feed live** des nouveaux memes publiés
- **Compteurs de likes** mis à jour en temps réel
- **Statut des notifications** (lu/non lu) synchronisé

### Architecture WebSocket
```
Frontend Angular WebSocket Client
    ↕ ws://localhost:8055/websocket
Directus Realtime Server  
    ↕ Database Events Hooks
SQLite Database Changes
```

### Types d'Événements
```yaml
Collection Events:
  - items.create → Nouveau meme/like/notification
  - items.update → Modification meme/notification lu  
  - items.delete → Suppression meme/like

Custom Events:
  - notification.new → Notification personnalisée
  - meme.trending → Meme devient populaire
  - user.active → Utilisateur en ligne
```

## 🧪 Tests et Validation

### Collection Insomnia Organisée

#### Structure Progressive
```
🔐 Authentification
  ├── Login (récupération JWT)
  └── Logout

📁 Files & Upload
  ├── Upload Image (multipart/form-data)
  └── Transform Image (avec paramètres)

🏷️ Tags
  ├── Get All Tags
  ├── Create Tag
  └── Get Tag Usage Stats

🎭 Memes  
  ├── Get All Memes (avec relations)
  ├── Get Single Meme
  ├── Create Meme (avec tags)
  ├── Update My Meme
  └── Delete My Meme

❤️ Likes
  ├── Like Meme
  ├── Unlike Meme  
  └── Get Meme Likes (avec users)

🔔 Notifications (ajouté après implémentation)
  ├── Get My Notifications
  └── Mark as Read

🔍 Search/Meilisearch (ajouté après implémentation)
  ├── Search Memes (avec highlighting)
  ├── Autocomplete Suggestions
  └── Get Facets (tags populaires)

🔄 WebSockets (ajouté après implémentation)
  └── Real-time Connection (avec souscriptions)
```

#### Workflow de Tests
1. **Authentification** → récupération token JWT
2. **Upload images** → récupération UUIDs fichiers
3. **Création tags** → récupération UUIDs tags
4. **Création memes** → test relations complètes
5. **Tests likes** → vérification compteurs
6. **Tests notifications** → vérification hooks automatiques
7. **Tests recherche** → validation typo-tolérance
8. **Tests WebSocket** → événements temps réel

## 🎨 Interface Angular (Frontend)

### Pages Principales
- **Home** (`/`) - Feed des memes avec recherche live
- **Create** (`/create`) - Générateur de memes avec preview
- **Search** (`/search`) - Recherche avancée avec facettes  
- **Profile** (`/profile/:id`) - Profil utilisateur + ses memes
- **Meme Detail** (`/meme/:id`) - Vue détaillée + likes/stats
- **Notifications** (`/notifications`) - Centre de notifications

### Composants Clés (Standalone)
```typescript
// Composants de base
MemeCard - Affichage meme avec actions (like, share)
TagChip - Affichage tag avec couleur et compteur  
LikeButton - Bouton like animé avec compteur temps réel
NotificationBadge - Badge notifications avec WebSocket

// Composants de recherche  
SearchBar - Barre de recherche avec autocomplétion
SearchFilters - Filtres avancés (tags, créateurs, dates)
SearchResults - Résultats avec highlighting Meilisearch

// Composants de création
MemeEditor - Éditeur avec preview temps réel
TagsInput - Sélection/création de tags dynamique
ImageUploader - Upload avec preview et validation

// Composants temps réel
NotificationCenter - Centre de notifications WebSocket
LiveFeed - Feed temps réel des nouveaux memes
```

### Services Angular
```typescript
// API Services
DirectusService - CRUD classique via REST API
SearchService - Recherche via endpoints custom Directus
UploadService - Gestion fichiers et transformations

// Real-time Services  
WebSocketService - Connexion WebSocket Directus
NotificationService - Gestion notifications temps réel
```

## 🚀 Extensions Directus Développées

### Hooks (Synchronisation automatique)
```javascript
extensions/hooks/meilisearch-sync/
  - Synchronisation Directus → Meilisearch
  - Déclencheurs: create/update/delete memes
  - Transformation données pour index optimisé

extensions/hooks/notification-generator/  
  - Création automatique notifications
  - Événements: nouveau like, nouveau meme
  - Filtrage pour éviter auto-notifications
```

### Endpoints Custom
```javascript
extensions/endpoints/search/
  - GET /search/memes (recherche principale)
  - GET /search/memes/suggest (autocomplétion)
  - GET /search/memes/facets (facettes/stats)
  - Proxy sécurisé vers Meilisearch
  - Gestion erreurs et validation
```

## 📱 Responsive Design & PWA

### Breakpoints
- **Mobile**: < 768px (1 colonne, navigation drawer)
- **Tablet**: 768px - 1024px (2 colonnes, sidebar)
- **Desktop**: > 1024px (3-4 colonnes, sidebar fixe)

### Progressive Web App
- **Service Worker**: Cache intelligent des memes
- **Offline Mode**: Consultation hors-ligne des memes likés
- **Push Notifications**: Notifications système via WebSocket
- **Install Prompt**: Installation comme app native

## 🔧 Configuration et Déploiement

### Variables d'Environnement
```env
# Directus
DIRECTUS_HOST=http://localhost:8055
DIRECTUS_API_KEY=your_directus_key

# Meilisearch  
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_meilisearch_key
MEILISEARCH_INDEX_MEMES=memes_index

# WebSocket
WEBSOCKET_URL=ws://localhost:8055/websocket
```

### Scripts de Setup
```bash
# Installation complète
npm run install:all

# Initialisation bases de données
npm run directus:init
npm run meilisearch:setup  

# Développement
npm run dev (Directus + Angular parallèle)

# Tests
npm run test:api (validation endpoints Insomnia)
```

## 🎯 Objectifs Pédagogiques

### Concepts Backend Maîtrisés
- **Architecture API-First** avec séparation claire des responsabilités
- **Authentification JWT** et système de permissions granulaires
- **Relations de données complexes** (1:N, N:M) avec intégrité référentielle
- **Extensions custom** : Hooks automatiques et endpoints personnalisés
- **Intégration services tiers** : Meilisearch pour recherche intelligente
- **Temps réel** : WebSockets et notifications push

### Skills Techniques Acquises  
- **Directus avancé** : Extensions, hooks, endpoints custom
- **API REST** : Design, sécurisation, documentation, tests
- **Recherche moderne** : Typo-tolérance, facettes, scoring intelligent
- **Architecture microservices** : Séparation Directus/Meilisearch
- **Workflow professionnel** : Tests API, collections Insomnia organisées

### Livrables Finaux
- ✅ **Backend Directus complet** avec toutes fonctionnalités
- ✅ **API documentée et testée** avec collection Insomnia
- ✅ **Recherche intelligente** intégrée et fonctionnelle
- ✅ **Système notifications** temps réel opérationnel
- ✅ **Architecture scalable** prête pour le frontend Angular

**🎉 Résultat : Un vrai backend professionnel moderne, prêt pour la production !**