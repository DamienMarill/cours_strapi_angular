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

## 📊 Modèle de Données Strapi

### Content-Types

#### Meme
```javascript
{
  title: "string", // required
  image: "media", // required
  topText: "string",
  bottomText: "string", 
  tags: "relation(Tag, many-to-many)",
  author: "relation(User, many-to-one)",
  likes: "relation(Like, one-to-many)",
  isPublic: "boolean", // default: true
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### Tag
```javascript
{
  name: "string", // unique, required
  color: "string", // hex color
  description: "text",
  memes: "relation(Meme, many-to-many)"
}
```

#### Like
```javascript
{
  user: "relation(User, many-to-one)",
  meme: "relation(Meme, many-to-one)"
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

## 🔒 Permissions Strapi

### Rôles
- **Public** : View memes publics, recherche
- **Authenticated** : CRUD ses memes, likes, comments
- **Moderator** : Modération content
- **Admin** : Gestion complète

### Politiques
- Seul l'auteur peut modifier/supprimer son meme
- Memes privés visibles par l'auteur uniquement

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
