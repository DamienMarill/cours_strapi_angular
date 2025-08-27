# 🎯 Concepts Clés des Frameworks - Guide d'Architecture

## Vue d'ensemble
Ce document liste les **concepts essentiels** de Directus et Angular nécessaires pour couvrir **90% des cas d'usage** en développement fullstack moderne. L'objectif est la **maîtrise des fondamentaux** pour l'autonomie future.

---

## 🚀 **DIRECTUS v11 - Concepts Essentiels (Backend)**

### 🗄️ **1. Collections (Modèles de Données)**
**Concept** : Collections de données avec schéma dynamique
```javascript
// Exemple Collection "Article"
{
  title: "string",
  content: "text", 
  author: "relation(User)",
  published: "boolean"
}
```
**90% Usage** : Créer collections via interface visuelle ou API

### 🔗 **2. Relations entre Collections**
**Types essentiels** :
- **One-to-One** : User → Profile
- **One-to-Many** : User → Articles (1 user, plusieurs articles)
- **Many-to-Many** : Articles ← → Tags (plusieurs à plusieurs)

**90% Usage** : Lier vos données logiquement (author, categories, likes...)

### 🌐 **3. API REST & GraphQL Automatiques**
**Concept** : Directus génère REST et GraphQL automatiquement
```
GET    /items/articles        # Lister
POST   /items/articles        # Créer
GET    /items/articles/:id    # Détail
PATCH  /items/articles/:id    # Modifier
DELETE /items/articles/:id    # Supprimer

# GraphQL disponible aussi sur /graphql
```
**90% Usage** : CRUD complet + GraphQL sans code backend

### 🔒 **4. Authentification & Rôles (RBAC)**
**Concepts clés** :
- **JWT Tokens** pour l'authentification
- **Rôles personnalisés** avec permissions granulaires
- **RBAC** (Role-Based Access Control) visuel
- **Providers OAuth** (Google, GitHub, Discord...)
- **Admin Panel** intégré pour gestion utilisateurs

**90% Usage** : Sécuriser votre app et gérer les utilisateurs

### 📁 **5. Gestion de Fichiers & Transformations**
**Concept** : Upload avancé avec transformations automatiques
```javascript
// Champ fichier
image: {
  type: "file",
  transforms: ["thumbnail", "webp"]
}
gallery: {
  type: "files", // Multiple
  accept: "image/*"
}
```
**90% Usage** : Upload avec redimensionnement, optimisation, et métadonnées automatiques

### 🔧 **6. Relations & Filtres Avancés**
**Fields Parameter** : Charger les relations
```javascript
GET /items/articles?fields=*,author.*,tags.*
```
**Filtres** : Recherche complexe et tri
```javascript  
GET /items/articles?filter[title][_contains]=angular&sort=-date_created
```
**90% Usage** : Récupérer exactement les données voulues

### ⚙️ **7. Hooks & Extensions**
**Concept** : Hooks d'événements et extensions personnalisées
```javascript
// Hook d'événement
export default {
  'items.create': (payload) => {
    payload.slug = slugify(payload.title);
  }
}
```
**90% Usage** : Validation custom, transformation données, audit trail...

---

## ⭐ **ANGULAR v20 - Concepts Essentiels (Frontend)**

### 🧩 **1. Standalone Components (Moderne)**
**Concept** : Composants auto-suffisants sans NgModules
```typescript
@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article.component.html'
})
export class ArticleComponent { }
```
**90% Usage** : Architecture moderne, composants réutilisables

### 📡 **2. Services & Dependency Injection**
**Concept** : Logique métier centralisée et injectable
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}
  
  getArticles() {
    return this.http.get<Article[]>('/api/articles');
  }
}
```
**90% Usage** : Communication API, état partagé, utilitaires

### 🔄 **3. Reactive Forms & Validation**
**Concept** : Formulaires typés et validés
```typescript
articleForm = this.fb.group({
  title: ['', Validators.required],
  content: ['', [Validators.required, Validators.minLength(10)]]
});
```
**90% Usage** : Tous vos formulaires (login, création, édition...)

### 🛣️ **4. Router & Navigation**
**Concept** : Navigation entre pages/vues
```typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'articles/:id', component: ArticleDetailComponent },
  { path: 'create', component: CreateComponent, canActivate: [AuthGuard] }
];
```
**90% Usage** : Structure de navigation, protection des routes

### 📊 **5. Signals (State Management Moderne)**
**Concept** : Gestion d'état réactive et performante
```typescript
export class ArticleService {
  private articlesSignal = signal<Article[]>([]);
  articles = this.articlesSignal.asReadonly();
  
  addArticle(article: Article) {
    this.articlesSignal.update(articles => [...articles, article]);
  }
}
```
**90% Usage** : État global, cache, synchronisation données

### 🔧 **6. HTTP Interceptors**
**Concept** : Intercepter toutes les requêtes HTTP
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next.handle(authReq);
  }
}
```
**90% Usage** : Auth tokens, gestion erreurs, loading states

### 🎨 **7. Directives & Pipes**
**Directives structurelles** :
```html
<div *ngIf="user$ | async as user">{{ user.name }}</div>
<div *ngFor="let article of articles; trackBy: trackById">
```
**Pipes** :
```html
{{ article.createdAt | date:'short' }}
{{ article.title | titlecase }}
```
**90% Usage** : Affichage conditionnel, listes, formatage données

### 🎯 **8. Guards & Resolvers**
**Guards** : Protection des routes
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}
```
**90% Usage** : Sécurité, chargement de données avant navigation

---

## 🏗️ **ARCHITECTURE PROJET - Corrélations**

### 📋 **Mapping Backend ↔ Frontend**

| **Concept Directus** | **↔** | **Concept Angular** | **Usage Commun** |
|---------------------|-------|-------------------|------------------|
| Collections | ↔ | Interface/Model | Définition des données |
| API REST/GraphQL | ↔ | HTTP Services | Communication données |
| Relations visuelles | ↔ | Observables/Signals | Données liées |
| RBAC | ↔ | Guards + JWT | Sécurité utilisateur |
| File Management | ↔ | FormData + HTTP | Gestion fichiers avancée |
| Rôles & Permissions | ↔ | Route Guards | Contrôle d'accès granulaire |
| Fields Parameter | ↔ | HTTP Params | Optimisation requêtes |

### 🔄 **Flux de Données Typique**

```mermaid
flowchart LR
    A[Angular Component] --> B[Angular Service]
    B --> C[HTTP Interceptor]  
    C --> D[Directus API]
    D --> E[Collection]
    E --> F[Database]
    F --> E
    E --> D
    D --> C
    C --> B
    B --> G[Signal/State]
    G --> A
```

### 🎯 **Pattern Architecture 90%**

**Structure Frontend (Angular)** :
```
src/
├── app/
│   ├── core/          # Services globaux, guards, interceptors
│   ├── shared/        # Composants/pipes réutilisables  
│   ├── features/      # Modules métier (articles, users...)
│   │   ├── models/    # Interfaces TypeScript
│   │   ├── services/  # Services API spécifiques
│   │   └── components/ # Composants du module
│   └── layouts/       # Layouts généraux
```

**Structure Backend (Directus)** :
```
directus-backend/
├── .env              # Configuration environnement
├── data.db           # Base SQLite
├── uploads/          # Fichiers uploadés
└── extensions/       # Extensions personnalisées
```

---

## 📊 **Les 90% de Cas Couverts**

### ✅ **Avec ces concepts, les étudiants peuvent construire** :

**🎯 Applications CRUD complètes** :
- Blog, e-commerce, portfolio, CMS
- Authentification utilisateur  
- Upload et gestion de médias
- Recherche et filtrage
- Relations entre données

**🔒 Applications sécurisées** :
- Gestion des rôles et permissions
- Protection des routes
- Validation des données
- Gestion des tokens JWT

**📱 Applications modernes** :
- Interface responsive
- État réactif avec Signals
- Navigation fluide
- Formulaires typés et validés

### 🚀 **Le 10% restant** (à apprendre au besoin) :
- Extensions Directus avancées
- Flows (automatisations visuelles)
- Optimisations performance poussées  
- Architecture micro-services
- Tests automatisés avancés
- Déploiement complexe

---

## 💡 **Stratégie d'Apprentissage**

### **Phase 1: Fondations** (Concepts 1-3)
- Collections + API REST/GraphQL (Directus)
- Components + Services (Angular)
- **Objectif** : CRUD basique fonctionnel

### **Phase 2: Interactions** (Concepts 4-6)  
- Auth + RBAC (Directus)
- Forms + Router (Angular)
- **Objectif** : Application utilisateur complète

### **Phase 3: Optimisation** (Concepts 7-8)
- Hooks + File Management (Directus)  
- State + Guards (Angular)
- **Objectif** : Application production-ready avec interface admin

---

*Avec cette base solide, les étudiants auront l'autonomie pour explorer et apprendre le reste selon leurs besoins spécifiques !*