# Plan d'Organisation du Cours Strapi + Angular

## 🎯 Vue d'ensemble

**Deux projets étudiants au choix** :
- **Gestionnaire de Memes** - Pour les amateurs de culture internet
- **Éditeur de Phrases UTAU** - Pour les passionnés de synthèse vocale

**Stack technique commune** : Strapi v5 + Angular v20

## 📋 Fonctionnalités Communes Obligatoires

### Core Features
1. **Authentication OAuth2** - Connexion via Google/GitHub/Discord
2. **Gestion de Comptes** - Profils utilisateurs avec avatars
3. **CRUD Ressources** - Création/édition/suppression des contenus
4. **Système de Likes** - Appréciation des ressources
5. **Recherche Avancée** - Filtres et tri des contenus

### Fonctionnalités Spécifiques

#### 🌈 Gestionnaire de Memes
- Upload d'images avec preview
- Générateur de texte sur images
- Tags et catégories
- Trending memes
- Partage social

#### 🎵 Éditeur UTAU
- Upload de fichiers audio (.wav)
- Lecteur audio intégré  
- Gestion des phonèmes japonais
- Export des projets
- Banque de sons (Teto incluse)

## 🗓️ Structure du Cours (Meta-Organisation)

### Phase 1: Fondations (Semaine 1-2)
- **Jour 1-2** : Introduction architecture fullstack
- **Jour 3-4** : Setup Strapi - Modèles de données
- **Jour 5-6** : Setup Angular - Architecture moderne
- **POCs** : Authentification simple, CRUD basique

### Phase 2: Backend Avancé (Semaine 3-4)  
- **Jour 7-8** : OAuth2 avec Strapi
- **Jour 9-10** : Relations et permissions
- **Jour 11-12** : Upload de fichiers et storage
- **POCs** : OAuth complet, gestion fichiers

### Phase 3: Frontend Moderne (Semaine 5-6)
- **Jour 13-14** : Composants standalone Angular
- **Jour 15-16** : Services et intercepteurs
- **Jour 17-18** : Gestion d'état avec Signals
- **POCs** : Interface utilisateur, état réactif

### Phase 4: Intégration (Semaine 7-8)
- **Jour 19-20** : Communication API REST
- **Jour 21-22** : Système de recherche
- **Jour 23-24** : Système de likes
- **POCs** : Features complètes par projet

### Phase 5: Optimisation & Déploiement (Semaine 9-10)
- **Jour 25-26** : Performance et caching
- **Jour 27-28** : Tests et validation  
- **Jour 29-30** : Déploiement et CI/CD
- **POCs** : Applications finales

## 📁 Organisation des Ressources

### Structure doc/
```
doc/
├── 00-plan-organisation-cours.md          # Ce fichier
├── 01-architecture/                       # Concepts généraux
├── 02-strapi/                            # Backend spécifique  
├── 03-angular/                           # Frontend spécifique
├── 04-integration/                       # Communication API
├── 05-projets/                          # Specs des 2 projets
│   ├── meme-manager/                    # Gestionnaire memes
│   └── utau-editor/                     # Éditeur UTAU
├── 06-pocs/                             # Documentation POCs
└── 99-ressources/                       # Assets et références
```

### Structure poc/
```
poc/
├── strapi-backend/                       # Base commune
├── angular-frontend/                     # Base commune  
├── auth-poc/                            # OAuth2 complet
├── file-upload-poc/                     # Gestion fichiers
├── search-poc/                          # Moteur recherche
├── likes-poc/                           # Système likes
├── meme-features/                       # Spécifique memes
└── utau-features/                       # Spécifique UTAU
```

## 🎓 Pédagogie Progressive

### Approche "Feature-Driven"
- Chaque semaine = 1 fonctionnalité majeure
- POCs pour valider les concepts
- Application immédiate sur les projets étudiants
- Code reviews régulières

### Évaluation Modulaire
- **40%** POCs individuels (validation concepts)
- **40%** Projet final (meme-manager OU utau-editor)
- **20%** Participation et code reviews

### Différenciation Pédagogique
- **Débutants** : Suivent les POCs guidés
- **Intermédiaires** : Adaptent aux spécificités de leur projet
- **Avancés** : Explorent optimisations et features bonus

## 🔄 Méthodologie

### Daily Stand-up (15min)
- Blocages techniques
- Avancée sur POCs
- Questions sur projets

### Weekly Sprint Review
- Demo des POCs réalisés
- Feedback et amélirations
- Préparation semaine suivante  

### Pair Programming Encouraged
- Échange entre équipes meme/UTAU
- Cross-pollination des solutions
- Mentoring peer-to-peer

## 🎯 Objectifs d'Apprentissage

### Techniques
- Maîtriser Strapi v5 (composants, plugins, API)
- Maîtriser Angular v20 (standalone, signals, moderne)  
- Comprendre architecture fullstack moderne
- Intégrer authentification OAuth2
- Optimiser performance et UX

### Transversales  
- Gestion projet agile
- Code reviews et qualité
- Documentation technique
- Déploiement et DevOps
- Veille technologique

---

*Ce plan sera affiné au fur et à mesure des retours étudiants et de l'avancement du cours.*