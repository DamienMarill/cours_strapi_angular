# Cours Strapi + Angular

Projet de formation sur l'intégration Strapi (backend) et Angular (frontend).

## 📁 Structure du projet

```
cours-strapi-angular/
├── doc/                     # Documentation du cours
├── poc/                     # Proof of Concepts
│   ├── strapi-backend/      # Backend Strapi v5.23.0
│   └── angular-frontend/    # Frontend Angular v20
├── package.json             # Configuration racine du monorepo
└── README.md               # Ce fichier
```

## 🚀 Scripts disponibles

### Lancement rapide
```bash
# Lancer les deux projets en parallèle
npm run dev

# Installer toutes les dépendances
npm run install:all
```

### Scripts Strapi
```bash
npm run strapi:dev      # Mode développement
npm run strapi:build    # Build production
npm run strapi:start    # Démarrer en production
```

### Scripts Angular
```bash
npm run angular:dev     # Serveur de développement
npm run angular:build   # Build production
npm run angular:test    # Tests unitaires
```

### Utilitaires
```bash
npm run clean          # Nettoyer tous les node_modules
```

## 🔧 Versions

- **Node.js**: v22.18.0
- **npm**: v10.9.3
- **Strapi**: v5.23.0 (Community Edition)
- **Angular CLI**: v20.2.0
- **cross-env**: v10.0.0 (global)

## 📝 Configuration

- **Strapi**: SQLite (parfait pour le développement)
- **Angular**: Standalone components, SCSS, Routing activé
- **Monorepo**: Scripts centralisés pour une gestion simplifiée