# Directus Backend - Cours Directus/Angular

Backend Directus pour le projet éducatif cours-directus-angular.

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer en mode développement (déjà initialisé !)
npm run dev
```

## 📋 Scripts Disponibles

- `npm run dev` - Démarre le serveur en mode développement
- `npm run start` - Démarre le serveur en mode production
- `npm run init` - Initialise Directus (si besoin de reconfigurer)
- `npm run bootstrap` - Bootstrap la configuration Directus

## 🛠️ Configuration

- **Base de données** : SQLite (`data.db`) - ✅ **Initialisée !**
- **Port** : 8055
- **Admin Panel** : http://localhost:8055
- **API REST** : http://localhost:8055/items/
- **GraphQL** : http://localhost:8055/graphql

### 🎯 Accès Admin Panel

- **URL** : http://localhost:8055
- **Identifiants** : Créés lors de l'initialisation
- **Interface** : Moderne et intuitive pour gérer les collections

### ⚙️ Configuration Avancée

Le fichier `.env` contient toutes les configurations :
- **CORS activé** pour Angular (localhost:4200)
- **Upload local** dans `./uploads/`
- **Rate limiting désactivé** (développement)
- **Cache désactivé** (développement)

## 🎯 Fonctionnalités Configurées

- **Upload de fichiers** : Images et audio supportés
- **CORS** : Configuré pour Angular (port 4200)
- **SQLite** : Base de données locale pour développement
- **TypeScript** : Support complet

## 📁 Structure

```
directus-backend/
├── .env                 # Variables d'environnement
├── database.db          # Base SQLite (auto-générée)
├── uploads/             # Fichiers uploadés
└── extensions/          # Extensions personnalisées
```

## 🔗 Intégration Angular

Le backend est configuré pour fonctionner avec le frontend Angular sur le port 4200.
Utilisez le SDK Directus dans Angular pour communiquer avec l'API.