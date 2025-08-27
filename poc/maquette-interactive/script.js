// Configuration des projets
const projectConfig = {
  meme: {
    name: 'MemeManager',
    icon: 'fas fa-image',
    heroTitle: 'Découvrez les meilleurs memes',
    heroSubtitle: 'Créez, partagez et likez les memes de la communauté',
    createTitle: 'Créer un nouveau meme',
    createText: 'Create',
    profileStats: '142 memes créés • 1.2k likes',
    myCreationsTitle: 'Mes memes',
    searchPlaceholder: 'Rechercher des memes...',
    filters: ['Populaire', 'Récent', 'Drôle', 'Viral', 'Template']
  },
  utau: {
    name: 'UTAUEditor',
    icon: 'fas fa-music',
    heroTitle: 'Créez des mélodies avec UTAU',
    heroSubtitle: 'Composez, partagez et découvrez des créations vocales',
    createTitle: 'Composer une nouvelle phrase',
    createText: 'Compose',
    profileStats: '67 projets créés • 892 likes',
    myCreationsTitle: 'Mes compositions',
    searchPlaceholder: 'Rechercher des compositions...',
    filters: ['Populaire', 'Récent', 'Teto', 'Lent', 'Rapide']
  }
};

// Données factices pour les deux projets
const mockData = {
  meme: [
    { id: 1, title: 'Drake Pointing Meme', author: 'MemeLord42', likes: 234, image: '🐺' },
    { id: 2, title: 'Distracted Boyfriend', author: 'MemeQueen', likes: 189, image: '😅' },
    { id: 3, title: 'Woman Yelling at Cat', author: 'CatLover', likes: 156, image: '😾' },
    { id: 4, title: 'This is Fine Dog', author: 'DoggoFan', likes: 298, image: '🐶' },
    { id: 5, title: 'Surprised Pikachu', author: 'PokemonMaster', likes: 412, image: '⚡' },
    { id: 6, title: 'Galaxy Brain Expanding', author: 'BigBrain', likes: 178, image: '🧠' }
  ],
  utau: [
    { id: 1, title: 'Senbonzakura Cover', author: 'TetoFan2024', likes: 167, image: '🌸' },
    { id: 2, title: 'Original Ballad', author: 'VocaloidPro', likes: 145, image: '💖' },
    { id: 3, title: 'Anime Opening Style', author: 'AnimeMusic', likes: 203, image: '⭐' },
    { id: 4, title: 'Electronic Dance Mix', author: 'EDMProducer', likes: 234, image: '🎶' },
    { id: 5, title: 'Classical Arrangement', author: 'ClassicalComposer', likes: 98, image: '🎼' },
    { id: 6, title: 'Pop Song Cover', author: 'PopSinger', likes: 187, image: '🎤' }
  ]
};

// État actuel
let currentProject = 'meme';
let currentPage = 'home';
let previousPage = 'home';
let currentItem = null;

// Elements DOM
const projectSwitch = document.getElementById('projectSwitch');
const navIcon = document.getElementById('navIcon');
const navTitle = document.getElementById('navTitle');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const createTitle = document.getElementById('createTitle');
const createText = document.getElementById('createText');
const profileStats = document.getElementById('profileStats');
const myCreationsTitle = document.getElementById('myCreationsTitle');
const searchInput = document.getElementById('searchInput');
const contentGrid = document.getElementById('contentGrid');
const profileGrid = document.getElementById('profileGrid');
const searchFilters = document.getElementById('searchFilters');
const searchResults = document.getElementById('searchResults');
const createContent = document.getElementById('createContent');

// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  updateProjectTheme();
  updateContent();
  
  // Event listeners
  projectSwitch.addEventListener('change', handleProjectSwitch);
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  searchInput.addEventListener('input', handleSearch);
});

// Gestion du switch de projet
function handleProjectSwitch() {
  currentProject = projectSwitch.checked ? 'utau' : 'meme';
  updateProjectTheme();
  updateContent();
  
  // Animation de transition
  document.body.style.transform = 'scale(0.95)';
  setTimeout(() => {
    document.body.style.transform = 'scale(1)';
  }, 200);
}

// Mise à jour du thème
function updateProjectTheme() {
  const body = document.body;
  const config = projectConfig[currentProject];
  
  // Changement de classe pour les CSS
  if (currentProject === 'utau') {
    body.classList.add('utau-theme');
  } else {
    body.classList.remove('utau-theme');
  }
  
  // Mise à jour des textes
  navIcon.className = config.icon;
  navTitle.textContent = config.name;
  heroTitle.textContent = config.heroTitle;
  heroSubtitle.textContent = config.heroSubtitle;
  createTitle.textContent = config.createTitle;
  createText.textContent = config.createText;
  profileStats.textContent = config.profileStats;
  myCreationsTitle.textContent = config.myCreationsTitle;
  searchInput.placeholder = config.searchPlaceholder;
  
  // Animation des labels du switch
  const memeLabel = document.querySelector('.switch-label.meme-label');
  const utauLabel = document.querySelector('.switch-label.utau-label');
  
  if (currentProject === 'utau') {
    memeLabel.style.opacity = '0.5';
    utauLabel.style.opacity = '1';
  } else {
    memeLabel.style.opacity = '1';
    utauLabel.style.opacity = '0.5';
  }
}

// Navigation entre pages
function handleNavigation(e) {
  e.preventDefault();
  const targetPage = e.currentTarget.getAttribute('data-page');
  
  if (targetPage && targetPage !== currentPage) {
    navigateToPage(targetPage);
  }
}

// Navigation programmée
function navigateToPage(targetPage, itemData = null) {
  previousPage = currentPage;
  
  // Désactiver tous les liens nav (sauf pour detail)
  if (targetPage !== 'detail') {
    navLinks.forEach(link => link.classList.remove('active'));
    const targetLink = document.querySelector(`[data-page="${targetPage}"]`);
    if (targetLink) {
      targetLink.classList.add('active');
    }
  }
  
  // Cacher toutes les pages
  pages.forEach(page => page.classList.remove('active'));
  
  // Afficher la page cible
  const target = document.getElementById(targetPage);
  if (target) {
    target.classList.add('active');
    currentPage = targetPage;
    currentItem = itemData;
    
    // Mettre à jour le contenu de la page
    updatePageContent(targetPage);
  }
}

// Retour à la page précédente
function goBack() {
  navigateToPage(previousPage);
}

// Mise à jour du contenu selon la page
function updatePageContent(page) {
  switch(page) {
    case 'home':
      updateHomeContent();
      break;
    case 'create':
      updateCreateContent();
      break;
    case 'profile':
      updateProfileContent();
      break;
    case 'search':
      updateSearchContent();
      break;
    case 'detail':
      updateDetailContent();
      break;
  }
}

// Mise à jour globale du contenu
function updateContent() {
  updateHomeContent();
  updateCreateContent();
  updateProfileContent();
  updateSearchContent();
}

// Page Home
function updateHomeContent() {
  const data = mockData[currentProject];
  contentGrid.innerHTML = '';
  
  data.forEach(item => {
    const card = createCard(item);
    contentGrid.appendChild(card);
  });
}

// Page Profile
function updateProfileContent() {
  const data = mockData[currentProject].slice(0, 4); // Prendre les 4 premiers
  profileGrid.innerHTML = '';
  
  data.forEach(item => {
    const card = createCard(item);
    profileGrid.appendChild(card);
  });
}

// Création d'une carte
function createCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.cursor = 'pointer';
  
  card.innerHTML = `
    <div class="card-image">${item.image}</div>
    <div class="card-content">
      <h3 class="card-title">${item.title}</h3>
      <div class="card-meta">
        <span><i class="fas fa-user"></i> ${item.author}</span>
        <span><i class="fas fa-heart"></i> ${item.likes}</span>
      </div>
      <div class="card-actions">
        <button class="btn-like">
          <i class="far fa-heart"></i> Like
        </button>
        <button class="btn-like">
          <i class="fas fa-share"></i> Share
        </button>
      </div>
    </div>
  `;
  
  // Navigation vers detail au click sur la carte
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-like')) {
      navigateToPage('detail', item);
    }
  });
  
  // Ajouter l'interaction like
  const likeBtn = card.querySelector('.btn-like');
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Empêcher la navigation
    const icon = likeBtn.querySelector('i');
    if (icon.classList.contains('far')) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      likeBtn.style.color = currentProject === 'meme' ? '#ff6b6b' : '#4ecdc4';
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      likeBtn.style.color = '';
    }
  });
  
  return card;
}

// Page Create
function updateCreateContent() {
  if (currentProject === 'meme') {
    createContent.innerHTML = createMemeInterface();
  } else {
    createContent.innerHTML = createUTAUInterface();
  }
}

// Interface création de meme
function createMemeInterface() {
  return `
    <div class="meme-creator">
      <div class="creator-left">
        <div class="upload-zone" onclick="handleImageUpload()">
          <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
          <p>Cliquez ou glissez une image ici</p>
          <small>JPG, PNG, GIF jusqu'à 10MB</small>
        </div>
      </div>
      <div class="creator-right">
        <div class="form-group">
          <label>Titre du meme</label>
          <input type="text" placeholder="Mon super meme..." />
        </div>
        <div class="form-group">
          <label>Texte du haut</label>
          <input type="text" placeholder="Texte supérieur..." />
        </div>
        <div class="form-group">
          <label>Texte du bas</label>
          <input type="text" placeholder="Texte inférieur..." />
        </div>
        <div class="form-group">
          <label>Tags</label>
          <input type="text" placeholder="drôle, viral, template..." />
        </div>
        <button class="btn-auth" style="width: 100%; margin-top: 2rem;">
          <i class="fas fa-magic"></i> Générer le meme
        </button>
      </div>
    </div>
  `;
}

// Interface UTAU
function createUTAUInterface() {
  return `
    <div class="utau-editor">
      <div class="">
        <div class="form-group">
          <label>Titre de la composition</label>
          <input type="text" placeholder="Ma composition UTAU..." />
        </div>
        <div class="form-group">
          <label>Banque vocale</label>
          <select style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px;">
            <option>Kasane Teto (Incluse)</option>
            <option>Hatsune Miku</option>
            <option>Kagamine Rin</option>
            <option>KAITO</option>
          </select>
        </div>
        <div class="form-group">
          <label>BPM</label>
          <input type="range" min="60" max="200" value="120" style="width: 100%;" />
          <small>120 BPM</small>
        </div>
        <button class="btn-auth" style="width: 100%; margin-top: 2rem;">
          <i class="fas fa-play"></i> Générer l'audio
        </button>
      </div>
      <div class="">
        <label>Piano Roll (2 octaves)</label>
        <div class="piano-roll">
          <div class="piano-keys">
            ${generatePianoKeys()}
          </div>
          <div class="piano-grid">
            ${generateSampleNotes()}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Génération des touches de piano
function generatePianoKeys() {
  const notes = ['B', 'A♯', 'A', 'G♯', 'G', 'F♯', 'F', 'E', 'D♯', 'D', 'C♯', 'C'];
  let keys = '';
  
  // 2 octaves (5 et 4)
  for (let octave = 5; octave >= 4; octave--) {
    notes.forEach(note => {
      const isBlackKey = note.includes('♯');
      keys += `<div class="piano-key ${isBlackKey ? 'black-key' : ''}">${note}${octave}</div>`;
    });
  }
  
  return keys;
}

// Notes d'exemple sur le piano roll
function generateSampleNotes() {
  const sampleNotes = [
    { syllable: 'ka', start: 50, width: 80, top: 120 },
    { syllable: 'te', start: 150, width: 60, top: 100 },
    { syllable: 'to', start: 230, width: 70, top: 80 },
    { syllable: 'chan', start: 320, width: 100, top: 140 }
  ];
  
  return sampleNotes.map(note => 
    `<div class="note-block" style="left: ${note.start}px; width: ${note.width}px; top: ${note.top}px;" onclick="editNote('${note.syllable}')">${note.syllable}</div>`
  ).join('');
}

// Page Search
function updateSearchContent() {
  const config = projectConfig[currentProject];
  searchFilters.innerHTML = '';
  
  config.filters.forEach(filter => {
    const chip = document.createElement('div');
    chip.className = 'filter-chip';
    chip.textContent = filter;
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
    searchFilters.appendChild(chip);
  });
}

// Recherche
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const data = mockData[currentProject];
  
  if (query.trim() === '') {
    searchResults.innerHTML = '<p class="no-results">Utilisez la barre de recherche pour trouver du contenu</p>';
    return;
  }
  
  const filtered = data.filter(item => 
    item.title.toLowerCase().includes(query) || 
    item.author.toLowerCase().includes(query)
  );
  
  if (filtered.length === 0) {
    searchResults.innerHTML = '<p class="no-results">Aucun résultat trouvé</p>';
  } else {
    searchResults.innerHTML = '';
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'content-grid';
    
    filtered.forEach(item => {
      const card = createCard(item);
      resultsGrid.appendChild(card);
    });
    
    searchResults.appendChild(resultsGrid);
  }
}

// Fonctions utilitaires
function handleImageUpload() {
  alert('Simulation upload d\'image - Dans l\'app réelle, ceci ouvrirait un sélecteur de fichiers');
}

// Page Detail
function updateDetailContent() {
  if (!currentItem) return;
  
  const detailMedia = document.getElementById('detailMedia');
  const detailTitle = document.getElementById('detailTitle');
  const detailAuthor = document.getElementById('detailAuthor');
  const detailLikes = document.getElementById('detailLikes');
  const detailLikesCount = document.getElementById('detailLikesCount');
  const detailDescription = document.getElementById('detailDescription');
  const detailTags = document.getElementById('detailTags');
  const relatedItems = document.getElementById('relatedItems');
  
  // Mise à jour des informations
  detailTitle.textContent = currentItem.title;
  detailAuthor.textContent = currentItem.author;
  detailLikes.textContent = currentItem.likes;
  detailLikesCount.textContent = currentItem.likes;
  
  // Description factice
  const descriptions = {
    meme: "Ce meme hilarant a été créé avec notre générateur de memes intégré. Il utilise un template populaire avec un texte original qui fait mouche !",
    utau: "Cette composition UTAU utilise la voix de Kasane Teto avec un arrangement original. Le rythme et la mélodie s'harmonisent parfaitement pour créer une ambiance unique."
  };
  
  detailDescription.innerHTML = `<p>${descriptions[currentProject]}</p>`;
  
  // Média selon le projet
  if (currentProject === 'meme') {
    detailMedia.innerHTML = `
      <div class="detail-image">
        ${currentItem.image}
        <div style="position: absolute; top: 20px; left: 20px; color: white; font-size: 1.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
          TEXTE DU HAUT
        </div>
        <div style="position: absolute; bottom: 20px; left: 20px; color: white; font-size: 1.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
          TEXTE DU BAS
        </div>
      </div>
    `;
  } else {
    detailMedia.innerHTML = `
      <div class="detail-audio">
        <h3>${currentItem.title}</h3>
        <p>Composition UTAU - ${currentItem.author}</p>
        <div class="audio-controls">
          <button class="btn-play"><i class="fas fa-play"></i></button>
          <div class="waveform"></div>
          <span>2:34</span>
        </div>
      </div>
    `;
  }
  
  // Tags factices
  const tagsList = currentProject === 'meme' 
    ? ['drôle', 'viral', 'template', 'populaire']
    : ['teto', 'original', 'mélodie', 'vocal'];
    
  detailTags.innerHTML = tagsList.map(tag => 
    `<span class="tag">${tag}</span>`
  ).join('');
  
  // Items liés
  const otherItems = mockData[currentProject].filter(item => item.id !== currentItem.id).slice(0, 3);
  relatedItems.innerHTML = otherItems.map(item => `
    <div class="related-item" onclick="navigateToPage('detail', ${JSON.stringify(item).replace(/"/g, '&quot;')})">
      <div class="related-thumb">${item.image}</div>
      <div class="related-info">
        <h4>${item.title}</h4>
        <small>${item.author} • ${item.likes} likes</small>
      </div>
    </div>
  `).join('');
}

function editNote(syllable) {
  const newSyllable = prompt(`Modifier la syllabe "${syllable}":`, syllable);
  if (newSyllable && newSyllable !== syllable) {
    event.target.textContent = newSyllable;
  }
}
