class UTAUEditor {
    constructor() {
        this.isAudioInitialized = false;
        this.currentlyPlaying = false;
        this.selectedNote = null;
        
        // État du drag & drop
        this.isDragging = false;
        this.isResizing = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.resizeHandle = null; // 'left' ou 'right'
        this.gridSnap = 5; // Pixels de snap pour la grille (plus fin)
        
        // Configuration du piano roll (2 octaves) - Ajusté pour la tessitura de Teto
        this.notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        this.octaves = [4, 3]; // Du plus aigu au plus grave - Centré sur les échantillons Teto (~308Hz = D♯4)
        this.pianoKeys = [];
        
        // Notes UTAU avec phonèmes (enchaînement fluide sans blancs)
        this.utauNotes = [
            { id: 1, syllable: 'ka', start: 50, width: 80, pitch: this.noteToFreq('D4'), row: 9 },
            { id: 2, syllable: 'te', start: 130, width: 60, pitch: this.noteToFreq('C4'), row: 10 },
            { id: 3, syllable: 'to', start: 190, width: 70, pitch: this.noteToFreq('D4'), row: 9 },
            { id: 4, syllable: 'chan', start: 260, width: 100, pitch: this.noteToFreq('F4'), row: 7 }
        ];
        
        // ID counter pour nouvelles notes
        this.nextNoteId = 5;
        
        // Phonèmes japonais de Teto (correspondant aux fichiers wav disponibles)
        this.phonemes = [
            // Voyelles principales
            'a', 'i', 'u', 'e', 'o',
            // Syllabes Ka
            'ka', 'ki', 'ku', 'ke', 'ko',
            // Syllabes Ta  
            'ta', 'chi', 'tsu', 'te', 'to',
            // Syllabes Na
            'na', 'ni', 'nu', 'ne', 'no',
            // Autres phonèmes courants
            'n', 'wa', 'ya', 'yu', 'yo',
            'ra', 'ri', 'ru', 're', 'ro',
            // Spéciaux Teto
            'chan', 'nyan'
        ];
        
        this.synth = null;
        this.filter = null;
        this.reverb = null;
        this.compressor = null;
        
        this.generatePianoKeys();
        this.initializeUI();
    }

    // Générer les touches du piano (2 octaves)
    generatePianoKeys() {
        this.pianoKeys = [];
        this.octaves.forEach(octave => {
            // Parcourir les notes de B vers C (ordre visuel descendant)
            const orderedNotes = ['B', 'A♯', 'A', 'G♯', 'G', 'F♯', 'F', 'E', 'D♯', 'D', 'C♯', 'C'];
            orderedNotes.forEach(note => {
                this.pianoKeys.push({
                    note: note + octave,
                    frequency: this.noteToFreq(note + octave),
                    isBlack: note.includes('♯')
                });
            });
        });
    }

    // Conversion note vers fréquence
    noteToFreq(note) {
        const notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1);
        const keyNumber = notes.indexOf(noteName);
        
        if (keyNumber < 0) return 440; // Fallback vers A4
        
        return 440 * Math.pow(2, (keyNumber - 9 + (octave - 4) * 12) / 12);
    }

    async initializeAudio() {
        try {
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }
            
            // Créer la chaîne d'effets audio pour Teto
            this.filter = new Tone.Filter({
                frequency: 1200,
                type: 'lowpass',
                rolloff: -12
            });
            
            this.reverb = new Tone.Reverb({
                decay: 1.5,
                wet: 0.3
            });
            
            this.compressor = new Tone.Compressor({
                threshold: -12,
                ratio: 3,
                attack: 0.01,
                release: 0.1
            });
            
            // Synthétiseur correct pour Teto (voix simple mais efficace)
            this.synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: 'sawtooth'
                },
                envelope: {
                    attack: 0.02,
                    decay: 0.3,
                    sustain: 0.6,
                    release: 0.8
                },
                filter: {
                    Q: 6,
                    type: 'lowpass',
                    rolloff: -24,
                    frequency: 800
                },
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.5,
                    release: 0.2,
                    baseFrequency: 800,
                    octaves: 2
                }
            });
            
            // Connecter les effets
            this.synth.chain(this.filter, this.reverb, this.compressor, Tone.Destination);
            
            // Charger la voicebank Teto avec les vrais échantillons
            await this.loadTetoVoicebank();
            
            this.isAudioInitialized = true;
            
            const initBtn = document.getElementById('initAudio');
            initBtn.textContent = '✅ Teto Prête';
            initBtn.disabled = true;
            
            // Désactiver les autres options de voicebank
            const voiceBankSelect = document.getElementById('voiceBank');
            Array.from(voiceBankSelect.options).forEach(option => {
                if (option.value !== 'teto') {
                    option.disabled = true;
                    option.textContent += ' (Indisponible)';
                }
            });
            
            document.getElementById('generateAudio').disabled = false;
            document.getElementById('playBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('stopBtn').disabled = false;
            
            return true;
        } catch (error) {
            console.error('Erreur d\'initialisation audio:', error);
            this.updateStatus('Erreur d\'initialisation audio ❌', 'error');
            return false;
        }
    }
    
    // Charger la voicebank Teto avec les vrais échantillons audio
    async loadTetoVoicebank() {
        this.updateStatus('Chargement des échantillons Teto... ♪', 'loading');
        
        // Mapping des phonèmes vers les fichiers WAV de Teto (maintenant dans assets/teto-samples)
        const tetoSamples = {
            // Voyelles principales
            'a': 'assets/teto-samples/a.wav',
            'i': 'assets/teto-samples/i.wav',
            'u': 'assets/teto-samples/u.wav',
            'e': 'assets/teto-samples/e.wav',
            'o': 'assets/teto-samples/o.wav',
            
            // Syllabes Ka
            'ka': 'assets/teto-samples/ka.wav',
            'ki': 'assets/teto-samples/ki.wav',
            'ku': 'assets/teto-samples/ku.wav',
            'ke': 'assets/teto-samples/ke.wav',
            'ko': 'assets/teto-samples/ko.wav',
            
            // Syllabes Ta
            'ta': 'assets/teto-samples/ta.wav',
            'chi': 'assets/teto-samples/chi.wav',
            'tsu': 'assets/teto-samples/tsu.wav',
            'te': 'assets/teto-samples/te.wav',
            'to': 'assets/teto-samples/to.wav',
            
            // Syllabes Na
            'na': 'assets/teto-samples/na.wav',
            'ni': 'assets/teto-samples/ni.wav',
            'nu': 'assets/teto-samples/nu.wav',
            'ne': 'assets/teto-samples/ne.wav',
            'no': 'assets/teto-samples/no.wav',
            
            // Autres phonèmes utiles
            'n': 'assets/teto-samples/n.wav',
            'wa': 'assets/teto-samples/wa.wav',
            'ya': 'assets/teto-samples/ya.wav',
            'yu': 'assets/teto-samples/yu.wav',
            'yo': 'assets/teto-samples/yo.wav',
            'ra': 'assets/teto-samples/ra.wav',
            'ri': 'assets/teto-samples/ri.wav',
            'ru': 'assets/teto-samples/ru.wav',
            're': 'assets/teto-samples/re.wav',
            'ro': 'assets/teto-samples/ro.wav',
            
            // Syllabes spéciales 
            'chan': 'assets/teto-samples/chan.wav',
            'nyan': 'assets/teto-samples/nyan.wav'
        };

        // Créer les Players pour chaque échantillon
        this.tetoVoicebank = {};
        this.audioBuffers = {};
        
        try {
            // Charger tous les échantillons en utilisant Tone.js Players
            const loadPromises = Object.entries(tetoSamples).map(async ([phoneme, url]) => {
                try {
                    // Créer un buffer audio pour chaque échantillon
                    const buffer = new Tone.Buffer(url);
                    await new Promise((resolve, reject) => {
                        buffer.onload = resolve;
                        buffer.onerror = reject;
                        // Timeout de 5 secondes par fichier
                        setTimeout(() => reject(new Error(`Timeout loading ${phoneme}`)), 5000);
                    });
                    
                    // Créer un Player pour cet échantillon
                    const player = new Tone.Player(buffer).toDestination();
                    
                    this.tetoVoicebank[phoneme] = player;
                    this.audioBuffers[phoneme] = buffer;
                    
                    return { phoneme, success: true };
                } catch (error) {
                    console.warn(`Impossible de charger ${phoneme}: ${error.message}`);
                    return { phoneme, success: false };
                }
            });
            
            const results = await Promise.all(loadPromises);
            const successful = results.filter(r => r.success).length;
            const total = results.length;
            
            if (successful > 0) {
                this.updateStatus(`✅ Teto chargée ! ${successful}/${total} échantillons (≧◡≦)`, 'ready');
                
                // Tenter de charger les fréquences depuis les fichiers .frq
                await this.loadFrequenciesFromFrq();
            } else {
                throw new Error('Aucun échantillon chargé');
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement des échantillons:', error);
            this.updateStatus('❌ Erreur de chargement. Mode synthèse activé', 'error');
            
            // Fallback: mode synthétique si les fichiers ne se chargent pas
            await this.loadSyntheticVoicebank();
        }
    }
    
    // Voicebank synthétique de fallback
    async loadSyntheticVoicebank() {
        this.tetoVoicebank = 'synthetic'; // Flag pour indiquer le mode synthétique
        this.updateStatus('Mode synthèse Teto activé 🎵', 'ready');
    }

    initializeUI() {
        // Créer les touches du piano et les notes
        this.createPianoRoll();
        
        // Event listeners pour les contrôles
        document.getElementById('initAudio').addEventListener('click', () => {
            this.initializeAudio();
        });
        
        document.getElementById('generateAudio').addEventListener('click', () => {
            this.playComposition();
        });
        
        document.getElementById('playBtn').addEventListener('click', () => {
            this.playComposition();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pausePlayback();
        });
        
        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopPlayback();
        });
        
        // Bouton de suppression
        document.getElementById('deleteBtn').addEventListener('click', () => {
            if (this.selectedNote !== null) {
                this.deleteSelectedNote();
            }
        });
        
        // Boutons génération WAV
        document.getElementById('generateWavBtn').addEventListener('click', () => {
            this.generateMixedWav();
        });
        
        document.getElementById('previewMixedBtn').addEventListener('click', () => {
            this.previewMixedWav();
        });
        
        document.getElementById('downloadWavBtn').addEventListener('click', () => {
            this.downloadMixedWav();
        });
        
        // Boutons outils UTAU
        document.getElementById('debugFrqBtn').addEventListener('click', () => {
            window.DEBUG_FRQ = !window.DEBUG_FRQ;
            const btn = document.getElementById('debugFrqBtn');
            if (window.DEBUG_FRQ) {
                btn.textContent = '🔍 Debug activé (rechargez Teto)';
                btn.style.background = '#d4edda';
                btn.style.borderColor = '#c3e6cb';
                btn.style.color = '#155724';
                console.log('🔧 Debug .frq activé - rechargez Teto pour voir les détails !');
            } else {
                btn.textContent = '📊 Debug .frq files (console)';
                btn.style.background = '#fff3cd';
                btn.style.borderColor = '#ffc107';  
                btn.style.color = '#856404';
                console.log('🔧 Debug .frq désactivé');
            }
        });
        
        document.getElementById('convertVoicebankBtn').addEventListener('click', async () => {
            if (!this.isAudioInitialized) {
                this.updateStatus('Initialisez d\'abord l\'audio pour charger les données ! 🔧', 'error');
                return;
            }
            
            const btn = document.getElementById('convertVoicebankBtn');
            const originalText = btn.textContent;
            btn.textContent = '⏳ Conversion en cours...';
            btn.disabled = true;
            
            try {
                await this.convertVoicebankToJson('teto');
                this.updateStatus('✅ Voicebank exportée en JSON ! Vérifiez vos téléchargements', 'ready');
            } catch (error) {
                console.error('Erreur conversion:', error);
                this.updateStatus('❌ Erreur lors de la conversion', 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
        
        // Contrôle BPM
        const bpmSlider = document.getElementById('bpm');
        bpmSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('bpmValue').textContent = value;
            if (this.isAudioInitialized) {
                Tone.Transport.bpm.value = value;
            }
        });
        
        // Contrôle banque vocale (Teto seulement)
        document.getElementById('voiceBank').addEventListener('change', (e) => {
            if (e.target.value === 'teto') {
                this.updateStatus('Kasane Teto sélectionnée ! ♪(´▽｀)', 'ready');
            } else {
                this.updateStatus('Seule Teto est disponible dans cette version', 'error');
                e.target.value = 'teto'; // Forcer Teto
            }
        });
        
        // Interaction avec la grille
        const pianoGrid = document.getElementById('pianoGrid');
        
        // Click simple pour ajouter des notes
        pianoGrid.addEventListener('click', (e) => {
            if (e.target === pianoGrid) {
                this.addNoteAtPosition(e);
            }
        });
        
        // Mouse events pour preview
        pianoGrid.addEventListener('mousemove', (e) => {
            if (e.target === pianoGrid && !this.isDragging && !this.isResizing) {
                this.showAddNotePreview(e);
            }
        });
        
        pianoGrid.addEventListener('mouseleave', () => {
            this.hideAddNotePreview();
        });
        
        // Global mouse events pour drag & drop
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleNoteDrag(e);
            } else if (this.isResizing) {
                this.handleNoteResize(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.endDragOrResize();
        });
        
        // Gestion du clavier pour suppression
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (this.selectedNote !== null) {
                    this.deleteSelectedNote();
                }
            }
        });
    }

    // Créer le piano roll complet
    createPianoRoll() {
        this.createPianoKeys();
        this.createNoteBlocks();
    }

    // Créer les touches du piano
    createPianoKeys() {
        const pianoKeysContainer = document.getElementById('pianoKeys');
        pianoKeysContainer.innerHTML = '';
        
        this.pianoKeys.forEach((key, index) => {
            const keyElement = document.createElement('div');
            keyElement.className = `piano-key${key.isBlack ? ' black-key' : ''}`;
            keyElement.textContent = key.note;
            keyElement.dataset.note = key.note;
            keyElement.dataset.frequency = key.frequency;
            keyElement.dataset.row = index;
            
            // Click sur touche = jouer la note
            keyElement.addEventListener('click', () => {
                this.playNote(key.frequency, 0.5);
            });
            
            pianoKeysContainer.appendChild(keyElement);
        });
    }

    // Créer les blocs de notes UTAU
    createNoteBlocks() {
        const pianoGrid = document.getElementById('pianoGrid');
        pianoGrid.innerHTML = '';
        
        this.utauNotes.forEach((note, index) => {
            const noteBlock = this.createNoteBlock(note, index);
            pianoGrid.appendChild(noteBlock);
        });
    }

    // Créer un bloc de note individuel
    createNoteBlock(note, index) {
        const block = document.createElement('div');
        block.className = 'note-block';
        block.textContent = note.syllable;
        block.style.left = note.start + 'px';
        block.style.width = note.width + 'px';
        block.style.top = (note.row * 20) + 'px';
        block.dataset.index = index;
        block.dataset.id = note.id;
        
        // Click sur note = sélection
        block.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectNote(index);
        });
        
        // Double-click = édition du phonème
        block.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.editNote(note, index);
        });
        
        // Clic droit = menu contextuel
        block.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showContextMenu(e, index);
        });
        
        // Mouse down pour démarrer drag ou resize
        block.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const rect = block.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            // Déterminer si c'est un resize (bords) ou drag (centre)
            if (x < 6) {
                // Resize gauche
                this.startResize(index, 'left', e);
            } else if (x > rect.width - 6) {
                // Resize droite
                this.startResize(index, 'right', e);
            } else {
                // Drag au centre
                this.startDrag(index, e);
            }
            
            this.selectNote(index);
        });
        
        return block;
    }

    // Sélectionner une note
    selectNote(index) {
        // Désélectionner toutes les notes
        document.querySelectorAll('.note-block').forEach(block => {
            block.classList.remove('selected');
        });
        
        // Sélectionner la note actuelle
        const selectedBlock = document.querySelector(`[data-index="${index}"]`);
        if (selectedBlock) {
            selectedBlock.classList.add('selected');
            this.selectedNote = index;
            
            // Activer le bouton de suppression
            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn) {
                deleteBtn.disabled = false;
            }
        } else {
            this.selectedNote = null;
            
            // Désactiver le bouton de suppression
            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn) {
                deleteBtn.disabled = true;
            }
        }
    }

    // Éditer une note (changer le phonème)
    editNote(note, index) {
        const newSyllable = prompt(`Modifier la syllabe "${note.syllable}":`, note.syllable);
        if (newSyllable && newSyllable !== note.syllable) {
            // Vérifier si c'est un phonème valide
            if (this.phonemes.includes(newSyllable.toLowerCase())) {
                this.utauNotes[index].syllable = newSyllable;
                const block = document.querySelector(`[data-index="${index}"]`);
                block.textContent = newSyllable;
                this.updateStatus(`Note modifiée: ${newSyllable}`, 'ready');
            } else {
                alert('Phonème non reconnu. Utilisez des phonèmes japonais valides.');
            }
        }
    }

    // Ajouter une note à une position
    addNoteAtPosition(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculer la ligne (note) et la position temporelle avec snap
        const row = Math.floor(y / 20);
        const start = Math.round(x / this.gridSnap) * this.gridSnap;
        
        if (row >= 0 && row < this.pianoKeys.length) {
            // Vérifier s'il y a déjà une note à cette position
            const conflictNote = this.utauNotes.find(note => 
                note.row === row && 
                start < note.start + note.width && 
                start + 60 > note.start
            );
            
            if (conflictNote) {
                this.updateStatus('Position occupée ! Déplacez la note existante', 'error');
                return;
            }
            
            const newNote = {
                id: this.nextNoteId++,
                syllable: 'a', // Phonème par défaut
                start: start,
                width: 60, // Durée par défaut
                pitch: this.pianoKeys[row].frequency,
                row: row
            };
            
            this.utauNotes.push(newNote);
            this.createNoteBlocks();
            this.selectNote(this.utauNotes.length - 1);
            this.updateStatus(`Note ajoutée sur ${this.pianoKeys[row].note}`, 'ready');
        }
    }
    
    // Preview d'ajout de note
    showAddNotePreview(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const row = Math.floor(y / 20);
        const start = Math.round(x / this.gridSnap) * this.gridSnap;
        
        if (row >= 0 && row < this.pianoKeys.length) {
            let indicator = document.querySelector('.add-note-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'add-note-indicator';
                document.getElementById('pianoGrid').appendChild(indicator);
            }
            
            indicator.style.left = start + 'px';
            indicator.style.top = (row * 20) + 'px';
            indicator.style.width = '60px';
            indicator.style.opacity = '1';
        }
    }
    
    hideAddNotePreview() {
        const indicator = document.querySelector('.add-note-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
        }
    }
    
    // Démarrer le drag d'une note
    startDrag(noteIndex, e) {
        this.isDragging = true;
        this.selectedNote = noteIndex;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        const block = document.querySelector(`[data-index="${noteIndex}"]`);
        if (block) {
            block.classList.add('dragging');
        }
        
        document.body.style.cursor = 'grabbing';
        this.hideAddNotePreview();
    }
    
    // Gérer le drag d'une note
    handleNoteDrag(e) {
        if (!this.isDragging || this.selectedNote === null) return;
        
        const note = this.utauNotes[this.selectedNote];
        const block = document.querySelector(`[data-index="${this.selectedNote}"]`);
        
        if (!note || !block) return;
        
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Calcul de la nouvelle position sans snap immédiat (plus fluide)
        const rawNewStart = note.start + deltaX;
        const rawNewRow = note.row + (deltaY / 20);
        
        // Appliquer le snap seulement si le déplacement est significatif (> gridSnap/2)
        const snapThreshold = this.gridSnap / 2;
        let newStart = rawNewStart;
        
        if (Math.abs(deltaX) > snapThreshold) {
            newStart = Math.max(0, Math.round(rawNewStart / this.gridSnap) * this.gridSnap);
        } else {
            newStart = Math.max(0, rawNewStart);
        }
        
        // Pour les lignes, snap plus précis (chaque ligne = 20px)
        const newRow = Math.max(0, Math.min(this.pianoKeys.length - 1, Math.round(rawNewRow)));
        
        // Vérifier les collisions
        const wouldCollide = this.utauNotes.some((otherNote, index) => 
            index !== this.selectedNote &&
            otherNote.row === newRow &&
            newStart < otherNote.start + otherNote.width &&
            newStart + note.width > otherNote.start
        );
        
        if (!wouldCollide) {
            // Mise à jour visuelle immédiate (position continue, pas saccadée)
            block.style.left = Math.round(newStart) + 'px';
            block.style.top = (newRow * 20) + 'px';
            
            // Mise à jour des données temporaire
            note.start = Math.round(newStart);
            note.row = newRow;
            note.pitch = this.pianoKeys[newRow].frequency;
        }
    }
    
    // Démarrer le redimensionnement
    startResize(noteIndex, handle, e) {
        this.isResizing = true;
        this.selectedNote = noteIndex;
        this.resizeHandle = handle;
        this.dragStartX = e.clientX;
        
        const block = document.querySelector(`[data-index="${noteIndex}"]`);
        if (block) {
            block.classList.add('dragging');
        }
        
        document.body.style.cursor = 'ew-resize';
        this.hideAddNotePreview();
    }
    
    // Gérer le redimensionnement (version fluide)
    handleNoteResize(e) {
        if (!this.isResizing || this.selectedNote === null) return;
        
        const note = this.utauNotes[this.selectedNote];
        const block = document.querySelector(`[data-index="${this.selectedNote}"]`);
        
        if (!note || !block) return;
        
        const deltaX = e.clientX - this.dragStartX;
        
        // Snap plus fluide pour le resize aussi
        const snapThreshold = this.gridSnap / 2;
        let snapDelta = deltaX;
        
        if (Math.abs(deltaX) > snapThreshold) {
            snapDelta = Math.round(deltaX / this.gridSnap) * this.gridSnap;
        }
        
        if (this.resizeHandle === 'right') {
            // Redimensionner à droite
            const newWidth = Math.max(15, note.width + snapDelta); // Largeur min réduite
            block.style.width = Math.round(newWidth) + 'px';
            note.width = Math.round(newWidth);
        } else if (this.resizeHandle === 'left') {
            // Redimensionner à gauche
            const newWidth = Math.max(15, note.width - snapDelta);
            const newStart = Math.max(0, note.start + snapDelta);
            
            if (newWidth >= 15 && newStart >= 0) {
                block.style.left = Math.round(newStart) + 'px';
                block.style.width = Math.round(newWidth) + 'px';
                note.start = Math.round(newStart);
                note.width = Math.round(newWidth);
            }
        }
    }
    
    // Terminer drag ou resize
    endDragOrResize() {
        if (this.isDragging || this.isResizing) {
            const block = document.querySelector(`[data-index="${this.selectedNote}"]`);
            if (block) {
                block.classList.remove('dragging');
            }
            
            this.isDragging = false;
            this.isResizing = false;
            this.resizeHandle = null;
            document.body.style.cursor = 'default';
            
            if (this.selectedNote !== null) {
                const note = this.utauNotes[this.selectedNote];
                this.updateStatus(`Note ${note.syllable}: ${this.pianoKeys[note.row].note}`, 'ready');
            }
        }
    }
    
    // Supprimer la note sélectionnée
    deleteSelectedNote() {
        if (this.selectedNote === null || this.selectedNote >= this.utauNotes.length) return;
        
        const noteToDelete = this.utauNotes[this.selectedNote];
        
        // Confirmation optionnelle
        const confirmDelete = confirm(`Supprimer la note "${noteToDelete.syllable}" ?`);
        if (!confirmDelete) return;
        
        // Supprimer de la liste
        this.utauNotes.splice(this.selectedNote, 1);
        
        // Réinitialiser la sélection
        this.selectedNote = null;
        
        // Recréer l'affichage
        this.createNoteBlocks();
        
        this.updateStatus(`Note "${noteToDelete.syllable}" supprimée ! 🗑️`, 'ready');
    }
    
    // Supprimer une note par son index
    deleteNote(noteIndex) {
        if (noteIndex < 0 || noteIndex >= this.utauNotes.length) return;
        
        const noteToDelete = this.utauNotes[noteIndex];
        
        // Supprimer de la liste
        this.utauNotes.splice(noteIndex, 1);
        
        // Réinitialiser la sélection si c'était la note sélectionnée
        if (this.selectedNote === noteIndex) {
            this.selectedNote = null;
        } else if (this.selectedNote > noteIndex) {
            // Ajuster l'index de la note sélectionnée si nécessaire
            this.selectedNote--;
        }
        
        // Recréer l'affichage
        this.createNoteBlocks();
        
        this.updateStatus(`Note "${noteToDelete.syllable}" supprimée ! 🗑️`, 'ready');
    }
    
    // Afficher le menu contextuel
    showContextMenu(e, noteIndex) {
        // Supprimer le menu existant s'il y en a un
        this.hideContextMenu();
        
        const note = this.utauNotes[noteIndex];
        if (!note) return;
        
        // Sélectionner la note
        this.selectNote(noteIndex);
        
        // Créer le menu contextuel
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="edit">
                ✏️ Éditer "${note.syllable}"
            </div>
            <div class="context-menu-item" data-action="duplicate">
                📋 Dupliquer
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item delete" data-action="delete">
                🗑️ Supprimer
            </div>
        `;
        
        // Positionner le menu
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        
        // Ajouter les event listeners
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.getAttribute('data-action');
            
            switch(action) {
                case 'edit':
                    this.editNote(note, noteIndex);
                    break;
                case 'duplicate':
                    this.duplicateNote(noteIndex);
                    break;
                case 'delete':
                    this.deleteNote(noteIndex);
                    break;
            }
            
            this.hideContextMenu();
        });
        
        document.body.appendChild(menu);
        
        // Fermer le menu en cliquant ailleurs
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 10);
    }
    
    // Masquer le menu contextuel
    hideContextMenu() {
        const menu = document.querySelector('.context-menu');
        if (menu) {
            menu.remove();
        }
    }
    
    // Dupliquer une note
    duplicateNote(noteIndex) {
        if (noteIndex < 0 || noteIndex >= this.utauNotes.length) return;
        
        const originalNote = this.utauNotes[noteIndex];
        
        // Créer une copie avec un décalage
        const duplicatedNote = {
            id: this.nextNoteId++,
            syllable: originalNote.syllable,
            start: originalNote.start + originalNote.width + 10, // Décaler à droite
            width: originalNote.width,
            pitch: originalNote.pitch,
            row: originalNote.row
        };
        
        // Vérifier s'il y a conflit avec une autre note
        const conflictNote = this.utauNotes.find(note => 
            note.row === duplicatedNote.row && 
            duplicatedNote.start < note.start + note.width && 
            duplicatedNote.start + duplicatedNote.width > note.start
        );
        
        if (conflictNote) {
            // Si conflit, décaler vers le bas
            duplicatedNote.row = Math.min(this.pianoKeys.length - 1, duplicatedNote.row + 1);
            duplicatedNote.pitch = this.pianoKeys[duplicatedNote.row].frequency;
        }
        
        this.utauNotes.push(duplicatedNote);
        this.createNoteBlocks();
        
        // Sélectionner la note dupliquée
        this.selectNote(this.utauNotes.length - 1);
        
        this.updateStatus(`Note "${originalNote.syllable}" dupliquée ! 📋`, 'ready');
    }
    
    
    // Parser CORRECT pour fichiers FREQ0003 (.frq) - Basé sur frq_reader.py  
    async parseFrqFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const dataView = new DataView(arrayBuffer);
                    let offset = 0;
                    
                    // 1. Header (8 bytes)
                    const header = new TextDecoder().decode(arrayBuffer.slice(0, 8));
                    if (!header.startsWith('FREQ0003')) {
                        throw new Error('Format de fichier .frq invalide');
                    }
                    offset += 8;
                    
                    // 2. Samples per frequency (4 bytes, little-endian int32)
                    const samplesPerFreq = dataView.getInt32(offset, true);
                    offset += 4;
                    
                    // 3. Average frequency (8 bytes, little-endian double)
                    const avgFrequency = dataView.getFloat64(offset, true);
                    offset += 8;
                    
                    // 4. Reserved space (16 bytes) - ignorer
                    offset += 16;
                    
                    // 5. Number of chunks (4 bytes, little-endian int32)
                    const numChunks = dataView.getInt32(offset, true);
                    offset += 4;
                    
                    console.log(`📊 FREQ0003 - Header: ${header.trim()}`);
                    console.log(`📊 Samples per freq: ${samplesPerFreq}`);
                    console.log(`📊 Average frequency: ${avgFrequency.toFixed(2)} Hz`);
                    console.log(`📊 Number of chunks: ${numChunks}`);
                    
                    // 6. Lire tous les chunks (frequency + amplitude pairs)
                    const chunks = [];
                    const frequencies = [];
                    const amplitudes = [];
                    
                    for (let i = 0; i < numChunks; i++) {
                        // Frequency (8 bytes double)
                        const frequency = dataView.getFloat64(offset, true);
                        offset += 8;
                        
                        // Amplitude (8 bytes double)  
                        const amplitude = dataView.getFloat64(offset, true);
                        offset += 8;
                        
                        chunks.push({ frequency, amplitude });
                        
                        // Filtre les fréquences valides pour statistiques
                        if (frequency > 0 && frequency < 2000) {
                            frequencies.push(frequency);
                            amplitudes.push(amplitude);
                        }
                    }
                    
                    if (frequencies.length === 0) {
                        throw new Error('Aucune fréquence valide trouvée dans les chunks');
                    }
                    
                    // Analyse statistique des fréquences 
                    const sortedFreqs = frequencies.sort((a, b) => a - b);
                    const medianFreq = sortedFreqs.length % 2 === 0 
                        ? (sortedFreqs[Math.floor(sortedFreqs.length/2) - 1] + sortedFreqs[Math.floor(sortedFreqs.length/2)]) / 2
                        : sortedFreqs[Math.floor(sortedFreqs.length/2)];
                    
                    // Utiliser l'average frequency du header si disponible, sinon médiane calculée
                    const baseFrequency = avgFrequency > 0 ? avgFrequency : medianFreq;
                    
                    console.log(`🎵 Base frequency (header): ${avgFrequency.toFixed(2)} Hz`);
                    console.log(`🎵 Median frequency (calculated): ${medianFreq.toFixed(2)} Hz`);
                    console.log(`🎵 Using base frequency: ${baseFrequency.toFixed(2)} Hz`);
                    
                    resolve({
                        header: header.trim(),
                        samplesPerFreq: samplesPerFreq,
                        avgFrequency: avgFrequency,
                        numChunks: numChunks,
                        baseFrequency: baseFrequency,
                        chunks: chunks,
                        frequencies: frequencies,
                        amplitudes: amplitudes,
                        minFreq: Math.min(...sortedFreqs),
                        maxFreq: Math.max(...sortedFreqs),
                        medianFreq: medianFreq
                    });
                    
                } catch (error) {
                    console.error('Erreur parsing .frq:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Erreur lecture fichier'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Charger les fréquences de base depuis les fichiers .frq
    async loadFrequenciesFromFrq() {
        const frqFiles = [
            { phoneme: 'a', path: 'assets/teto-samples/a_wav.frq' },
            { phoneme: 'ka', path: 'assets/teto-samples/ka_wav.frq' },
            { phoneme: 'te', path: 'assets/teto-samples/te_wav.frq' },
            { phoneme: 'to', path: 'assets/teto-samples/to_wav.frq' },
            { phoneme: 'chan', path: 'assets/teto-samples/chan_wav.frq' },
            { phoneme: 'ni', path: 'assets/teto-samples/ni_wav.frq' }
        ];
        
        this.realTetoFrequencies = {};
        
        for (const frqFile of frqFiles) {
            try {
                const response = await fetch(frqFile.path);
                if (response.ok) {
                    const blob = await response.blob();
                    const frqData = await this.parseFrqFile(blob);
                    
                    this.realTetoFrequencies[frqFile.phoneme] = frqData.baseFrequency;
                    console.log(`✅ ${frqFile.phoneme}: ${frqData.baseFrequency.toFixed(2)} Hz (${frqData.numChunks} chunks)`);
                    
                    // Sauvegarder les données complètes pour débogage (optionnel)
                    if (window.DEBUG_FRQ) {
                        this.exportFrqToJson(frqFile.phoneme, frqData);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Impossible de charger ${frqFile.path}:`, error.message);
            }
        }
        
        if (Object.keys(this.realTetoFrequencies).length > 0) {
            console.log('🎤 Fréquences .frq chargées:', this.realTetoFrequencies);
            const frqCount = Object.keys(this.realTetoFrequencies).length;
            this.updateStatus(`✅ Teto + ${frqCount} fichiers .frq chargés ! Pitch ultra-précis (≧▽≦)`, 'ready');
        }
    }
    
    // Version améliorée qui utilise les .frq si disponibles
    getTetoBasePitch(syllable) {
        // D'abord essayer les données .frq réelles
        if (this.realTetoFrequencies && this.realTetoFrequencies[syllable]) {
            const frqFreq = this.realTetoFrequencies[syllable];
            console.log(`🎵 UTILISE .frq: ${syllable} = ${frqFreq.toFixed(2)} Hz (réel)`);
            return frqFreq;
        }
        
        // Fallback sur le mapping manuel si pas de .frq
        const tetoPitchMap = {
            // Voyelles - fréquences naturelles moyennes de Teto
            'a': 220.0,  'i': 246.9,  'u': 196.0,  'e': 220.0,  'o': 207.7,
            // Syllabes Ka
            'ka': 196.0, 'ki': 220.0,  'ku': 185.0, 'ke': 207.7, 'ko': 185.0,
            // Syllabes Ta
            'ta': 185.0, 'chi': 207.7, 'tsu': 174.6, 'te': 196.0, 'to': 174.6,
            // Syllabes Na
            'na': 185.0, 'ni': 196.0, 'nu': 174.6, 'ne': 185.0, 'no': 174.6,
            // Autres phonèmes
            'n': 146.8,  'wa': 207.7, 'ya': 220.0, 'yu': 196.0, 'yo': 185.0,
            'ra': 185.0, 'ri': 196.0, 'ru': 174.6, 're': 185.0, 'ro': 174.6,
            // Spéciaux Teto
            'chan': 246.9, 'nyan': 261.6
        };
        
        const manualFreq = tetoPitchMap[syllable] || 196.0;
        console.log(`🎵 UTILISE manuel: ${syllable} = ${manualFreq.toFixed(2)} Hz (fallback)`);
        return manualFreq;
    }
    
    // 🔧 UTILITAIRES DE CONVERSION .frq → JSON
    
    // Exporter un fichier .frq vers JSON
    exportFrqToJson(phoneme, frqData) {
        const jsonData = {
            phoneme: phoneme,
            timestamp: new Date().toISOString(),
            format: frqData.header,
            metadata: {
                samplesPerFreq: frqData.samplesPerFreq,
                avgFrequency: frqData.avgFrequency,
                numChunks: frqData.numChunks,
                baseFrequency: frqData.baseFrequency,
                minFreq: frqData.minFreq,
                maxFreq: frqData.maxFreq,
                medianFreq: frqData.medianFreq
            },
            chunks: frqData.chunks,
            statistics: {
                totalFrequencies: frqData.frequencies.length,
                averageAmplitude: frqData.amplitudes.reduce((a, b) => a + b, 0) / frqData.amplitudes.length,
                frequencyRange: frqData.maxFreq - frqData.minFreq
            }
        };
        
        // Créer le blob et télécharger
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${phoneme}_frequencies.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`💾 Exporté: ${phoneme}_frequencies.json`);
    }
    
    // Convertir toute une voicebank .frq vers JSON optimisé
    async convertVoicebankToJson(voicebankName = 'teto') {
        const allData = {
            voicebank: voicebankName,
            timestamp: new Date().toISOString(),
            format: 'FREQ0003',
            phonemes: {}
        };
        
        console.log(`🔄 Conversion voicebank ${voicebankName} en cours...`);
        
        // Conversion des fichiers .frq disponibles
        for (const [phoneme, frequency] of Object.entries(this.realTetoFrequencies)) {
            allData.phonemes[phoneme] = {
                baseFrequency: frequency,
                note: this.frequencyToNote(frequency)
            };
        }
        
        // Ajouter les fallbacks du mapping manuel
        const manualMapping = {
            'a': 220.0, 'i': 246.9, 'u': 196.0, 'e': 220.0, 'o': 207.7,
            'ka': 196.0, 'ki': 220.0, 'ku': 185.0, 'ke': 207.7, 'ko': 185.0,
            'ta': 185.0, 'chi': 207.7, 'tsu': 174.6, 'te': 196.0, 'to': 174.6,
            'na': 185.0, 'ni': 196.0, 'nu': 174.6, 'ne': 185.0, 'no': 174.6,
            'n': 146.8, 'wa': 207.7, 'ya': 220.0, 'yu': 196.0, 'yo': 185.0,
            'ra': 185.0, 'ri': 196.0, 'ru': 174.6, 're': 185.0, 'ro': 174.6,
            'chan': 246.9, 'nyan': 261.6
        };
        
        for (const [phoneme, frequency] of Object.entries(manualMapping)) {
            if (!allData.phonemes[phoneme]) {
                allData.phonemes[phoneme] = {
                    baseFrequency: frequency,
                    note: this.frequencyToNote(frequency),
                    source: 'manual_mapping'
                };
            }
        }
        
        // Statistiques globales
        const frequencies = Object.values(allData.phonemes).map(p => p.baseFrequency);
        allData.statistics = {
            totalPhonemes: Object.keys(allData.phonemes).length,
            fromFrqFiles: Object.keys(this.realTetoFrequencies).length,
            fromManualMapping: Object.keys(allData.phonemes).length - Object.keys(this.realTetoFrequencies).length,
            avgFrequency: frequencies.reduce((a, b) => a + b, 0) / frequencies.length,
            minFrequency: Math.min(...frequencies),
            maxFrequency: Math.max(...frequencies)
        };
        
        // Export JSON optimisé
        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${voicebankName}_voicebank_frequencies.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`✅ Voicebank ${voicebankName} convertie: ${Object.keys(allData.phonemes).length} phonèmes`);
        console.log('📊 Statistiques:', allData.statistics);
        
        return allData;
    }
    
    // Convertir fréquence en nom de note musical
    frequencyToNote(freq) {
        const A4 = 440;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        const semitonesFromA4 = Math.round(12 * Math.log2(freq / A4));
        const octave = Math.floor((semitonesFromA4 + 9) / 12) + 4;
        const noteIndex = ((semitonesFromA4 + 9) % 12 + 12) % 12;
        
        return noteNames[noteIndex] + octave;
    }

    // Jouer une note avec les vrais échantillons de Teto
    async playNote(frequency, duration = 0.5, syllable = null) {
        if (!this.isAudioInitialized) {
            this.updateStatus('Veuillez d\'abord initialiser l\'audio ! 🔧', 'error');
            return;
        }
        
        const now = Tone.now();
        
        // Si on a une syllabe et que la voicebank est chargée (mode échantillons)
        if (syllable && this.tetoVoicebank && this.tetoVoicebank !== 'synthetic') {
            const player = this.tetoVoicebank[syllable];
            
            if (player) {
                try {
                    // Calculer le ratio de pitch pour ajuster à la fréquence désirée
                    // Utiliser la fréquence de base spécifique à ce phonème
                    const baseTetoPitch = this.getTetoBasePitch(syllable);
                    const pitchRatio = frequency / baseTetoPitch;
                    
                    console.log(`🎤 AUDIO: ${syllable} | Base: ${baseTetoPitch.toFixed(2)} Hz | Cible: ${frequency.toFixed(2)} Hz | Ratio: ${pitchRatio.toFixed(3)}x`);
                    
                    // Ajuster la vitesse de lecture pour changer le pitch (effet chipmunk acceptable)
                    player.playbackRate = pitchRatio;
                    
                    // Appliquer la chaîne d'effets si disponible
                    if (this.filter) {
                        player.chain(this.filter, this.reverb || Tone.Destination, this.compressor || Tone.Destination);
                    }
                    
                    // Jouer l'échantillon
                    player.start(now);
                    
                    // Arrêter après la durée spécifiée
                    player.stop(now + duration);
                    
                    console.log(`🎤 Joue échantillon Teto: ${syllable} (pitch ratio: ${pitchRatio.toFixed(2)})`);
                    
                } catch (error) {
                    console.error(`Erreur lecture ${syllable}:`, error);
                    // Fallback sur synthétiseur
                    this.synth.triggerAttackRelease(frequency, duration, now);
                }
            } else {
                // Phonème non disponible, utiliser fallback
                console.warn(`Phonème ${syllable} non trouvé, utilisation synthétiseur`);
                this.synth.triggerAttackRelease(frequency, duration, now);
            }
        } 
        // Mode synthétique ou pas de syllabe spécifique
        else if (this.tetoVoicebank === 'synthetic' || !syllable) {
            // Utiliser le synthétiseur avec filtrage Teto
            if (syllable) {
                // Ajuster les paramètres selon le type de phonème (estimation)
                const vowels = ['a', 'i', 'u', 'e', 'o'];
                const isVowel = vowels.includes(syllable);
                
                if (isVowel) {
                    this.filter.frequency.setValueAtTime(1400, now);
                    duration *= 1.2;
                } else {
                    this.filter.frequency.setValueAtTime(1000, now);
                    duration *= 0.9;
                }
            }
            
            this.synth.triggerAttackRelease(frequency, duration, now);
            
            // Reset du filtre
            if (this.filter) {
                this.filter.frequency.setValueAtTime(1200, now + duration);
            }
            
            console.log(`🎵 Synthèse: ${syllable || 'note'} (${frequency.toFixed(1)}Hz)`);
        }
    }

    // Jouer toute la composition avec timeline précise
    async playComposition() {
        if (!this.isAudioInitialized) {
            this.updateStatus('Veuillez d\'abord initialiser l\'audio ! 🔧', 'error');
            return;
        }
        
        if (this.utauNotes.length === 0) {
            this.updateStatus('Aucune note à jouer ! Ajoutez des notes sur le piano roll', 'ready');
            return;
        }
        
        if (this.currentlyPlaying) {
            return;
        }
        
        this.currentlyPlaying = true;
        this.updateStatus('🎵 Lecture de la composition...', 'playing');
        
        const bpm = parseInt(document.getElementById('bpm').value);
        const pixelsPerSecond = 50; // Conversion: 50 pixels = 1 seconde
        
        try {
            // Trier les notes par position temporelle
            const sortedNotes = [...this.utauNotes].sort((a, b) => a.start - b.start);
            
            // Utiliser Tone.Transport pour le timing précis
            Tone.Transport.bpm.value = bpm;
            const startTime = Tone.now();
            
            // Programmer toutes les notes avec des timings absolus
            sortedNotes.forEach((note, index) => {
                if (!this.currentlyPlaying) return;
                
                // Calculer le timing absolu de chaque note
                const noteStartTime = startTime + (note.start / pixelsPerSecond);
                const noteDuration = (note.width / pixelsPerSecond);
                
                console.log(`🎵 Programmation: ${note.syllable} à ${noteStartTime.toFixed(2)}s pour ${noteDuration.toFixed(2)}s`);
                
                // Sélection visuelle
                setTimeout(() => {
                    if (this.currentlyPlaying) {
                        this.selectNote(this.utauNotes.indexOf(note));
                    }
                }, (noteStartTime - Tone.now()) * 1000);
                
                // Programmer la lecture de la note
                this.scheduleNote(note.pitch, noteDuration, note.syllable, noteStartTime);
            });
            
            // Calculer la durée totale de la composition
            const lastNote = sortedNotes[sortedNotes.length - 1];
            const totalDuration = (lastNote.start + lastNote.width) / pixelsPerSecond;
            
            // Attendre la fin de la lecture
            await new Promise(resolve => {
                setTimeout(() => {
                    this.currentlyPlaying = false;
                    this.updateStatus('Composition terminée ! 🎉', 'ready');
                    
                    // Désélectionner toutes les notes
                    document.querySelectorAll('.note-block').forEach(block => {
                        block.classList.remove('selected');
                    });
                    
                    resolve();
                }, totalDuration * 1000 + 500); // +500ms de marge
            });
            
        } catch (error) {
            console.error('Erreur lors de la lecture:', error);
            this.currentlyPlaying = false;
            this.updateStatus('Erreur de lecture ❌', 'error');
        }
    }
    
    // Programmer une note avec timing précis
    scheduleNote(frequency, duration, syllable, startTime) {
        // Si on a une syllabe et que la voicebank est chargée (mode échantillons)
        if (syllable && this.tetoVoicebank && this.tetoVoicebank !== 'synthetic') {
            const player = this.tetoVoicebank[syllable];
            
            if (player) {
                try {
                    // Obtenir la fréquence de base réelle pour ce phonème de Teto
                    const baseTetoPitch = this.getTetoBasePitch(syllable);
                    const pitchRatio = frequency / baseTetoPitch;
                    
                    // Cloner le player pour éviter les conflits
                    const tempPlayer = new Tone.Player(player.buffer).toDestination();
                    tempPlayer.playbackRate = pitchRatio;
                    
                    // Programmer la lecture
                    tempPlayer.start(startTime);
                    tempPlayer.stop(startTime + duration);
                    
                    console.log(`🎤 Programmé échantillon: ${syllable} à ${startTime.toFixed(2)}s (pitch: ${pitchRatio.toFixed(2)})`);
                    
                } catch (error) {
                    console.error(`Erreur programmation ${syllable}:`, error);
                    // Fallback sur synthétiseur
                    this.synth.triggerAttackRelease(frequency, duration, startTime);
                }
            } else {
                // Phonème non disponible, utiliser synthétiseur
                this.synth.triggerAttackRelease(frequency, duration, startTime);
            }
        } else {
            // Mode synthétique
            this.synth.triggerAttackRelease(frequency, duration, startTime);
        }
    }

    // Pause la lecture
    pausePlayback() {
        if (this.currentlyPlaying) {
            this.currentlyPlaying = false;
            
            // Arrêter le transport Tone.js et tous les sons
            Tone.Transport.stop();
            this.synth.releaseAll();
            
            this.updateStatus('Lecture en pause ⏸️', 'ready');
        }
    }

    // Arrêt complet
    stopPlayback() {
        this.currentlyPlaying = false;
        
        // Arrêter complètement le transport et tous les sons
        Tone.Transport.stop();
        Tone.Transport.cancel(); // Annule tous les événements programmés
        this.synth.releaseAll();
        
        this.updateStatus('Lecture arrêtée ⏹️', 'ready');
        
        // Désélectionner toutes les notes
        document.querySelectorAll('.note-block').forEach(block => {
            block.classList.remove('selected');
        });
    }

    // Fonction utilitaire pour mettre à jour le statut
    updateStatus(message, type = 'ready') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
    }

    // 🎵 GÉNÉRATION WAV UNIQUE - Mixage de tous les échantillons en un seul fichier
    
    async generateMixedWav() {
        if (this.utauNotes.length === 0) {
            this.updateStatus('Aucune note à générer !', 'error');
            return;
        }

        this.updateStatus('🎛️ Génération du WAV mixé...', 'ready');

        try {
            // Calculer la durée totale nécessaire
            const totalDuration = this.calculateTotalDuration();
            const sampleRate = 44100;
            const channels = 2; // Stéréo
            
            // Créer un AudioContext offline pour le rendu
            const offlineContext = new OfflineAudioContext(channels, totalDuration * sampleRate, sampleRate);
            
            // Créer un buffer de destination
            const mixBuffer = offlineContext.createBuffer(channels, totalDuration * sampleRate, sampleRate);
            
            // Mixer chaque note
            for (const note of this.utauNotes) {
                await this.mixNoteToBuffer(note, mixBuffer, sampleRate);
            }
            
            // Créer le fichier WAV
            const wavBlob = this.bufferToWav(mixBuffer);
            this.currentMixedWav = wavBlob;
            
            // Créer un player pour le preview
            const audioUrl = URL.createObjectURL(wavBlob);
            this.mixedAudio = new Audio(audioUrl);
            
            this.updateStatus('✅ WAV mixé généré ! Cliquez Preview pour écouter', 'ready');
            
            // Activer les boutons preview et download
            const previewBtn = document.getElementById('previewMixedBtn');
            const downloadBtn = document.getElementById('downloadWavBtn');
            if (previewBtn) previewBtn.disabled = false;
            if (downloadBtn) downloadBtn.disabled = false;
            
            return wavBlob;
            
        } catch (error) {
            console.error('Erreur génération WAV:', error);
            this.updateStatus('❌ Erreur génération WAV', 'error');
        }
    }
    
    // Calculer la durée totale nécessaire
    calculateTotalDuration() {
        if (this.utauNotes.length === 0) return 1;
        
        let maxEnd = 0;
        this.utauNotes.forEach(note => {
            const endTime = (note.start / this.gridSnap * 0.1) + (note.width / this.gridSnap * 0.1);
            maxEnd = Math.max(maxEnd, endTime);
        });
        
        return maxEnd + 1; // +1 seconde de marge
    }
    
    // Mixer une note dans le buffer principal
    async mixNoteToBuffer(note, mixBuffer, sampleRate) {
        const player = this.tetoVoicebank[note.syllable];
        if (!player || !player.buffer) return;
        
        // Calculer les paramètres de timing
        const startTime = note.start / this.gridSnap * 0.1;
        const duration = note.width / this.gridSnap * 0.1;
        
        // Calculer le pitch ratio
        const baseTetoPitch = this.getTetoBasePitch(note.syllable);
        const pitchRatio = note.pitch / baseTetoPitch;
        
        // Obtenir le buffer source
        const sourceBuffer = player.buffer;
        const sourceData = sourceBuffer.getChannelData(0);
        
        // Calculer les positions dans le buffer de mix
        const startSample = Math.floor(startTime * sampleRate);
        const sourceDuration = sourceData.length / pitchRatio; // Ajusté pour le pitch
        const targetSamples = Math.min(
            Math.floor(duration * sampleRate),
            Math.floor(sourceDuration)
        );
        
        // Mixer les données avec pitch shifting
        for (let channel = 0; channel < mixBuffer.numberOfChannels; channel++) {
            const mixData = mixBuffer.getChannelData(channel);
            
            for (let i = 0; i < targetSamples; i++) {
                const mixIndex = startSample + i;
                if (mixIndex >= mixData.length) break;
                
                // Échantillonnage avec pitch ratio (interpolation linéaire simple)
                const sourceIndex = i * pitchRatio;
                const sourceIndexFloor = Math.floor(sourceIndex);
                const sourceIndexCeil = Math.min(sourceIndexFloor + 1, sourceData.length - 1);
                
                if (sourceIndexFloor < sourceData.length) {
                    const fraction = sourceIndex - sourceIndexFloor;
                    const sample = sourceData[sourceIndexFloor] * (1 - fraction) + 
                                 sourceData[sourceIndexCeil] * fraction;
                    
                    // Mixer avec atténuation pour éviter la saturation
                    mixData[mixIndex] += sample * 0.7;
                }
            }
        }
    }
    
    // Convertir AudioBuffer vers WAV blob
    bufferToWav(buffer) {
        const length = buffer.length;
        const sampleRate = buffer.sampleRate;
        const channels = buffer.numberOfChannels;
        
        // Créer le buffer WAV
        const arrayBuffer = new ArrayBuffer(44 + length * channels * 2);
        const view = new DataView(arrayBuffer);
        
        // Header WAV
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * channels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * channels * 2, true);
        view.setUint16(32, channels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * channels * 2, true);
        
        // Écrire les données audio
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < channels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    // Preview du WAV mixé
    previewMixedWav() {
        if (this.mixedAudio) {
            if (this.mixedAudio.paused) {
                this.mixedAudio.currentTime = 0;
                this.mixedAudio.play();
                this.updateStatus('🎵 Preview WAV en cours...', 'playing');
                
                this.mixedAudio.onended = () => {
                    this.updateStatus('Preview terminé ✨', 'ready');
                };
            } else {
                this.mixedAudio.pause();
                this.updateStatus('Preview pausé', 'ready');
            }
        } else {
            this.updateStatus('Générez d\'abord le WAV !', 'error');
        }
    }
    
    // Télécharger le WAV généré
    downloadMixedWav() {
        if (this.currentMixedWav) {
            const url = URL.createObjectURL(this.currentMixedWav);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teto-composition-${Date.now()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.updateStatus('📁 WAV téléchargé !', 'ready');
        } else {
            this.updateStatus('Générez d\'abord le WAV !', 'error');
        }
    }

}

// Initialiser l'éditeur UTAU au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.utauEditor = new UTAUEditor();
    
    // Message de bienvenue
    setTimeout(() => {
        window.utauEditor.updateStatus('Éditeur UTAU prêt ! Cliquez sur les notes pour les éditer', 'ready');
    }, 500);
});