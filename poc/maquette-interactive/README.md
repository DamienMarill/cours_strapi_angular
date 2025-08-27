# 🎨 POC Maquette Interactive

## Vue d'ensemble
Maquette interactive permettant de naviguer et visualiser les deux projets étudiants (Gestionnaire de Memes et Éditeur UTAU) avec un minimum de JavaScript et des fonctionnalités figées.

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Switch de projet** en position absolue (coin supérieur droit)
- **Moteur commun** de navigation entre les pages
- **Thématiques visuelles** distinctes (rouge/orange pour Memes, turquoise/vert pour UTAU)
- **Pages complètes** : Home, Create, Profile, Search
- **Données factices** pour simuler le contenu
- **Interactions basiques** : likes, recherche, navigation

### 🎯 Pages disponibles

#### Home
- Feed de contenu selon le projet sélectionné
- Cartes avec preview, titre, auteur, likes
- Hero section thématique

#### Create  
- **Memes** : Interface upload + formulaire texte
- **UTAU** : Piano-roll 2 octaves + paramètres composition
- Preview des interfaces de création

#### Profile
- Profil utilisateur avec statistiques
- Grille des créations personnelles
- Adaptation des stats selon le projet

#### Search
- Barre de recherche fonctionnelle
- Filtres par catégories (spécifiques à chaque projet)  
- Résultats dynamiques

## 🎨 Design Features

### Switch de Projet
- Position absolue (coin supérieur droit)
- Toggle smooth entre Meme 🌈 et UTAU 🎵
- Animation de transition de thème

### Thématiques
- **Memes** : Palette rouge/orange, icônes images
- **UTAU** : Palette turquoise/vert, icônes musique
- Transition fluide entre les thèmes

### Piano-Roll UTAU
- Grille 2 octaves (C4 à B5)
- Notes draggables simulées
- Interface familière pour musiciens

## 🛠️ Technologies

- **HTML5** : Structure sémantique
- **CSS3** : Variables CSS, Grid, Flexbox, animations
- **JavaScript Vanilla** : Navigation, switch de thème, interactions
- **Font Awesome** : Iconographie cohérente

## 🎯 Objectifs Pédagogiques

Cette maquette permet de :
- ✅ **Visualiser** les deux interfaces projet côte à côte
- ✅ **Comparer** la complexité relative des deux projets  
- ✅ **Tester** l'UX/UI avant développement
- ✅ **Présenter** aux étudiants pour choix du projet
- ✅ **Valider** les concepts avec les parties prenantes

## 🚀 Utilisation

```bash
# Ouvrir la maquette
cd poc/maquette-interactive
open index.html  # ou double-click sur le fichier

# Ou servir avec un serveur local
python -m http.server 8000
# Puis ouvrir http://localhost:8000
```

### Navigation
1. **Switch de projet** : Toggle coin supérieur droit
2. **Navigation** : Cliquer sur les liens de la navbar
3. **Interactions** : Tester les boutons, recherche, likes
4. **Piano-roll** : Cliquer sur les notes pour les modifier

## 📋 Checklist de Test

- [ ] Switch Meme ↔ UTAU fonctionne
- [ ] Navigation entre toutes les pages
- [ ] Thèmes visuels s'appliquent correctement  
- [ ] Piano-roll UTAU s'affiche avec notes
- [ ] Interface création Memes avec upload zone
- [ ] Recherche filtre le contenu
- [ ] Boutons Like interactifs
- [ ] Responsive sur mobile/tablet

## 🎨 Personnalisation

### Couleurs
Modifier les variables CSS dans `styles.css` :
```css
:root {
  --primary-meme: #ff6b6b;    /* Rouge memes */
  --primary-utau: #4ecdc4;    /* Turquoise UTAU */
  --secondary-meme: #ffa726;  /* Orange memes */
  --secondary-utau: #81c784;  /* Vert UTAU */
}
```

### Contenu
Modifier les données dans `script.js` :
```javascript
const mockData = {
  meme: [...],  // Données memes
  utau: [...]   // Données UTAU
};
```

---

*Cette maquette est un outil de conception - les vraies applications utiliseront Angular + Strapi pour les fonctionnalités complètes.*