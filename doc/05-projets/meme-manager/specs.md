# 🌈 Gestionnaire de Memes - Spécifications

## Vue d'ensemble
Application web pour créer, partager et gérer des memes avec une communauté d'utilisateurs.

## 🎯 Fonctionnalités Core (Obligatoires)

### Authentication & Comptes
- [x] Connexion OAuth2 (GitHub)
- [x] Profil utilisateur avec avatar
- [x] Gestion des préférences

### Gestion des Memes
- [x] Upload d'images (JPG, PNG, GIF)
- [x] Générateur de texte sur image
- [x] Preview en temps réel
- [x] CRUD complet (Create, Read, Update, Delete)

### Social Features
- [x] Système de likes (bookmark)
- [x] Partage vers réseaux sociaux
- [x] Collections personnelles

### Recherche & Navigation
- [x] Recherche par titre, tags, utilisateur
- [x] Filtres avancés (date, popularité, type)
- [x] Pagination optimisée

## 🚀 Fonctionnalités Avancées (Bonus)

### Création Avancée
- [ ] Templates de memes populaires
- [ ] Éditeur d'image intégré (crop, resize)
- [ ] Support des GIFs animés
- [ ] Générateur de memes IA

### Performance
- [ ] Optimisation images (WebP, lazy loading)
- [ ] Cache intelligent
- [ ] PWA support
- [ ] Mode hors-ligne

## 📊 Modèle de Données Directus

### Collections

#### memes
```javascript
{
  id: "uuid", // primary key
  title: "string", // required
  image: "file", // required, with transforms
  topText: "string",
  bottomText: "string", 
  tags: "m2m(tags)", // many-to-many relation
  author: "m2o(directus_users)", // relation to users
  likes: "o2m(likes)", // one-to-many
  isPublic: "boolean", // default: true
  date_created: "datetime", // auto
  date_updated: "datetime" // auto
}
```

#### tags
```javascript
{
  id: "uuid",
  name: "string", // unique, required
  color: "color", // color picker field
  description: "text",
  memes: "m2m(memes)" // many-to-many relation
}
```

#### likes
```javascript
{
  id: "uuid",
  user: "m2o(directus_users)",
  meme: "m2o(memes)",
  date_created: "datetime"
}
```

## 🎨 Interface Angular

### Pages Principales
- **Home** (`/`) - Feed des memes trending
- **Create** (`/create`) - Générateur de memes
- **Profile** (`/profile/:id`) - Profil utilisateur
- **Meme Detail** (`/meme/:id`) - Vue détaillée + comments
- **Search** (`/search`) - Recherche avancée
- **Collections** (`/collections`) - Memes sauvegardés

### Composants Clés
- `MemeCard` - Affichage meme avec actions
- `TagsInput` - Sélection de tags
- `LikeButton` - Bouton like/dislike animé
- `SearchFilters` - Filtres de recherche

## 🔒 Permissions Directus (RBAC)

### Rôles
- **Public** : Read memes publics seulement
- **User** : CRUD ses propres memes, likes, voir les publics
- **Moderator** : Read/Update tous les memes, modération
- **Administrator** : Full access

### Permissions
- **memes** : Lecture libre si public, écriture owner only
- **likes** : CRUD owner only
- **tags** : Read all, Create/Update auth required

### Filtres Dynamiques
- Memes publics : `isPublic = true`
- Memes personnels : `author = $CURRENT_USER`

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### Adaptations
- Navigation drawer mobile
- Grid adaptatif (1-2-3-4 colonnes)
- Touch-friendly sur mobile
- Keyboard shortcuts desktop
