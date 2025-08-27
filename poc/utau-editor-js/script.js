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
        this.gridSnap = 10; // Pixels de snap pour la grille
        
        // Configuration du piano roll (2 octaves)
        this.notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        this.octaves = [5, 4]; // Du plus aigu au plus grave
        this.pianoKeys = [];
        
        // Notes UTAU avec phonèmes (comme dans la maquette)
        this.utauNotes = [
            { id: 1, syllable: 'ka', start: 50, width: 80, pitch: this.noteToFreq('A4'), row: 15 },
            { id: 2, syllable: 'te', start: 150, width: 60, pitch: this.noteToFreq('C5'), row: 10 },
            { id: 3, syllable: 'to', start: 230, width: 70, pitch: this.noteToFreq('E5'), row: 6 },
            { id: 4, syllable: 'chan', start: 320, width: 100, pitch: this.noteToFreq('G4'), row: 18 }
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
        
        // Nouvelle position avec snap
        const newStart = Math.max(0, Math.round((note.start + deltaX) / this.gridSnap) * this.gridSnap);
        const newRow = Math.max(0, Math.min(this.pianoKeys.length - 1, note.row + Math.round(deltaY / 20)));
        
        // Vérifier les collisions
        const wouldCollide = this.utauNotes.some((otherNote, index) => 
            index !== this.selectedNote &&
            otherNote.row === newRow &&
            newStart < otherNote.start + otherNote.width &&
            newStart + note.width > otherNote.start
        );
        
        if (!wouldCollide) {
            // Mise à jour visuelle immédiate
            block.style.left = newStart + 'px';
            block.style.top = (newRow * 20) + 'px';
            
            // Mise à jour des données temporaire
            note.start = newStart;
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
    
    // Gérer le redimensionnement
    handleNoteResize(e) {
        if (!this.isResizing || this.selectedNote === null) return;
        
        const note = this.utauNotes[this.selectedNote];
        const block = document.querySelector(`[data-index="${this.selectedNote}"]`);
        
        if (!note || !block) return;
        
        const deltaX = e.clientX - this.dragStartX;
        const snapDelta = Math.round(deltaX / this.gridSnap) * this.gridSnap;
        
        if (this.resizeHandle === 'right') {
            // Redimensionner à droite
            const newWidth = Math.max(20, note.width + snapDelta);
            block.style.width = newWidth + 'px';
            note.width = newWidth;
        } else if (this.resizeHandle === 'left') {
            // Redimensionner à gauche
            const newWidth = Math.max(20, note.width - snapDelta);
            const newStart = Math.max(0, note.start + snapDelta);
            
            if (newWidth >= 20 && newStart >= 0) {
                block.style.left = newStart + 'px';
                block.style.width = newWidth + 'px';
                note.start = newStart;
                note.width = newWidth;
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
                    // Note de base de Teto est autour de C4 (261.63 Hz)
                    const baseTetoPitch = 261.63;
                    const pitchRatio = frequency / baseTetoPitch;
                    
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

    // Jouer toute la composition
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
        const beatDuration = 60 / bpm; // durée d'un beat
        
        try {
            // Trier les notes par position temporelle
            const sortedNotes = [...this.utauNotes].sort((a, b) => a.start - b.start);
            
            for (let i = 0; i < sortedNotes.length; i++) {
                if (!this.currentlyPlaying) break;
                
                const note = sortedNotes[i];
                const duration = (note.width / 100) * beatDuration; // Durée basée sur largeur
                
                // Sélectionner visuellement la note en cours
                this.selectNote(this.utauNotes.indexOf(note));
                
                // Jouer la note avec sa fréquence et son phonème
                await this.playNote(note.pitch, duration, note.syllable);
                
                // Délai avant la note suivante (basé sur position)
                const nextNote = sortedNotes[i + 1];
                if (nextNote) {
                    const gap = (nextNote.start - note.start - note.width) / 100 * beatDuration;
                    if (gap > 0) {
                        await new Promise(resolve => setTimeout(resolve, gap * 1000));
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors de la lecture:', error);
        }
        
        this.currentlyPlaying = false;
        this.updateStatus('Composition terminée ! 🎉', 'ready');
        
        // Désélectionner toutes les notes
        document.querySelectorAll('.note-block').forEach(block => {
            block.classList.remove('selected');
        });
    }

    // Pause la lecture
    pausePlayback() {
        if (this.currentlyPlaying) {
            this.currentlyPlaying = false;
            this.updateStatus('Lecture en pause ⏸️', 'ready');
        }
    }

    // Arrêt complet
    stopPlayback() {
        this.currentlyPlaying = false;
        this.synth.releaseAll(); // Arrêter tous les sons
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

}

// Initialiser l'éditeur UTAU au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.utauEditor = new UTAUEditor();
    
    // Message de bienvenue
    setTimeout(() => {
        window.utauEditor.updateStatus('Éditeur UTAU prêt ! Cliquez sur les notes pour les éditer', 'ready');
    }, 500);
});