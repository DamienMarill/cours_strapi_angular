# 🎵 Éditeur de Phrases UTAU - Spécifications

## Vue d'ensemble
Application web pour créer et éditer des phrases chantées avec des banques de voix UTAU (comme Teto-chan incluse).

## 🎯 Fonctionnalités Core (Obligatoires)

### Authentication & Comptes
- [x] Connexion OAuth2 (GitHub)
- [x] Profil utilisateur avec avatar
- [x] Gestion des préférences audio

### Gestion des Projets
- [x] Création de projets vocaux
- [x] Genération audio à partir de phonèmes
- [x] Sauvegarde automatique local -> puis export vers Directus lors de la génération
- [x] CRUD complet des projets

### Éditeur Audio
- [x] Piano-roll simplifié (2 octaves)
- [x] Ajout de notes par bouton + auto-placement
- [x] Redimensionnement notes pour durée (poignée droite)
- [x] Drag vertical pour ajustement pitch
- [x] Sélection syllabe par dropdown au click
- [x] Lecteur audio intégré avec Tone.js

### Social Features  
- [x] Système de likes sur projets
- [x] Partage de créations
- [x] Collections de favorites

### Recherche & Navigation
- [x] Recherche par titre, artiste, phonèmes
- [x] Filtres par banque vocale, durée
- [x] Découverte de nouveaux sons

## 🚀 Fonctionnalités Avancées (Bonus)

### Édition Avancée
- [ ] Multipiste audio
- [ ] Effets vocaux (reverb, chorus)

## 📊 Modèle de Données Directus

### Collections

#### voice_projects
```javascript
{
  id: "uuid",
  title: "string", // required
  description: "text",
  audioFile: "file", // fichier final généré
  bpm: "integer", // tempo
  lyrics: "text", // paroles en romaji
  phonemes: "text", // séquence phonétique
  voiceBank: "m2o(voice_banks)",
  author: "m2o(directus_users)",
  likes: "o2m(likes)",
  isPublic: "boolean", // default: true
  tags: "m2m(tags)",
  duration: "integer", // en secondes
  date_created: "datetime",
  date_updated: "datetime"
}
```

#### voice_banks
```javascript
{
  id: "uuid",
  name: "string", // required, unique
  character: "string", // nom du personnage (ex: "Kasane Teto")
  description: "text",
  language: "select", // japanese, english, other
  sampleRate: "integer", // 44100, 48000, etc.
  author: "string", // créateur de la banque
  avatar: "file", // image du personnage
  samples: "o2m(voice_samples)",
  projects: "o2m(voice_projects)",
  isOfficial: "boolean", // banques officielles vs communauté
  downloadCount: "integer"
}
```

#### voice_samples
```javascript
{
  id: "uuid",
  phoneme: "string", // "a", "ka", "te", etc.
  audioFile: "file", // fichier .wav avec métadonnées
  voiceBank: "m2o(voice_banks)",
  frequency: "float", // note de base
  duration: "integer", // en millisecondes
  quality: "select" // low, medium, high
}
```

#### likes
```javascript
{
  id: "uuid",
  user: "m2o(directus_users)",
  project: "m2o(voice_projects)",
  date_created: "datetime"
}
```

## 🎨 Interface Angular

### Pages Principales
- **Home** (`/`) - Feed des créations populaires
- **Editor** (`/editor`) - Éditeur de phrases principal
- **Projects** (`/projects`) - Mes projets sauvegardés
- **Voice Banks** (`/voices`) - Catalogue des banques
- **Project Detail** (`/project/:id`) - Lecture + commentaires
- **Search** (`/search`) - Recherche avancée

### Composants Clés
- `PianoRoll` - Grille 2 octaves avec notes draggables
- `NoteComponent` - Note redimensionnable avec syllabe
- `PhonemeDropdown` - Sélecteur syllabe au click
- `VoiceBankSelector` - Choix de la voix
- `AudioPlayer` - Lecteur simple avec Tone.js

## 🔊 Gestion Audio

### Formats Supportés
- **Import** : WAV, MP3, OGG
- **Export** : WAV (haute qualité), MP3 (partage)
- **Samples** : WAV mono 44.1kHz (standard UTAU)

### Technologies Audio
- Tone.js pour lecture et séquençage
- Sampler pour playback des phonèmes
- Transport pour synchronisation timing
- Simple export WAV/MP3

## 🗾 Support Phonétique Japonais

### Phonèmes de Base
- **Voyelles** : a, i, u, e, o
- **Consonnes** : k, g, s, z, t, d, n, h, b, p, m, y, r, w
- **Combinaisons** : ka, ki, ku, ke, ko, ga, gi, gu...
- **Spéciaux** : n, sil (silence), R (voyelle roulée)

### Interface Phonétique
- Dropdown organisé par catégories (Voyelles, Ka, Sa, Ta...)
- Recherche rapide dans le dropdown
- Phonèmes populaires en début de liste
- Couleurs par famille phonétique

## 🔒 Permissions Directus (RBAC)

### Rôles
- **Public** : Read projets publics, browse banques
- **User** : CRUD projets personnels, upload samples
- **Voice Creator** : Upload banques complètes + modération samples
- **Administrator** : Full access + gestion banques officielles

### Permissions
- **voice_projects** : Read si public, CRUD owner only
- **voice_samples** : Read all, Create Voice Creator+
- **voice_banks** : Read all, Create/Update Voice Creator+
- **likes** : CRUD owner only

### Filtres Dynamiques
- Projets publics : `isPublic = true`
- Mes projets : `author = $CURRENT_USER`
- Banques officielles : `isOfficial = true`

## 📱 Responsive Design

### Adaptations Mobile
- Interface tactile pour timeline
- Gestes swipe pour navigation
- Playback optimisé mobile
- Clavier phonétique adaptatif

### Performance
- Lazy loading des samples audio
- Compression audio adaptative  
- Cache intelligent banques vocales
- Progressive Web App support
