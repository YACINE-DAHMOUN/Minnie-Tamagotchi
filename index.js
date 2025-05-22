// Variables globales
let hangry = 50;
let energy = 50;
let happy = 50;
let isSleeping = false;
let isDead = false;
let isMuted = false;
let masterVolume = 0.7;

// Éléments DOM
let minnieElement;
let spanEnergy;
let spanHappy;
let spanHangry;
let spanMessage;
let hangryBar;
let energyBar;
let happyBar;
let boutonDormir;
let boutonManger;
let boutonJouer;
let muteBtn;
let volumeSlider;

// Système audio avec Tone.js
let audioContext;
let backgroundMusic;

// ========== SYSTÈME AUDIO ==========

// Initialisation audio
async function initAudio() {
    try {
        await Tone.start();
        console.log('🎵 Système audio démarré !');
        
        // Configuration du volume principal
        Tone.Master.volume.value = Tone.gainToDb(masterVolume);
        
        // Créer une mélodie de fond douce
        createBackgroundMusic();
    } catch (error) {
        console.log('❌ Erreur audio:', error);
    }
}

// Créer une mélodie de fond subtile
function createBackgroundMusic() {
    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 1 }
    }).toDestination();

    synth.volume.value = -30; // Très doux en arrière-plan

    const melody = ["C4", "E4", "G4", "C5"];
    let index = 0;

    backgroundMusic = new Tone.Loop((time) => {
        if (!isMuted && !isDead && Math.random() > 0.8) { // Son occasionnel
            synth.triggerAttackRelease(melody[index % melody.length], "8n", time);
            index++;
        }
    }, "2n");

    // Démarre la musique de fond très subtile
    // backgroundMusic.start();
}

// Son quand Minnie mange
function playEatingSound() {
    if (isMuted) return;
    
    const synth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }
    }).toDestination();

    // Son de mastication "miam miam"
    const notes = ["G4", "A4", "G4", "A4", "B4"];
    let i = 0;
    
    const eatPattern = setInterval(() => {
        if (i < notes.length) {
            synth.triggerAttackRelease(notes[i], "16n");
            i++;
        } else {
            clearInterval(eatPattern);
        }
    }, 200);
}

// Son de sommeil (ronflement doux)
function playSleepSound() {
    if (isMuted) return;
    
    const noise = new Tone.Noise({
        type: "pink",
        volume: -25
    }).toDestination();

    const filter = new Tone.Filter({
        frequency: 150,
        type: "lowpass"
    });

    noise.connect(filter);
    filter.toDestination();

    // Modulation pour créer un effet de ronflement
    const lfo = new Tone.LFO(0.3, -30, -20);
    lfo.connect(noise.volume);
    lfo.start();

    noise.start();
    
    // Arrêter après 3 secondes
    setTimeout(() => {
        lfo.stop();
        noise.stop();
        noise.dispose();
        filter.dispose();
        lfo.dispose();
    }, 3000);
}

// Son de joie et bonheur
function playHappySound() {
    if (isMuted) return;
    
    const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.1, decay: 0.1, sustain: 0.3, release: 0.3 }
    }).toDestination();

    // Mélodie joyeuse ascendante
    const happyMelody = ["C4", "E4", "G4", "C5", "E5", "G5"];
    let i = 0;
    
    const happyPattern = setInterval(() => {
        if (i < happyMelody.length) {
            synth.triggerAttackRelease(happyMelody[i], "8n");
            i++;
        } else {
            clearInterval(happyPattern);
        }
    }, 120);
}

// Son de réveil
function playWakeUpSound() {
    if (isMuted) return;
    
    const synth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.2, decay: 0.3, sustain: 0.4, release: 0.5 }
    }).toDestination();

    // Mélodie de réveil douce
    setTimeout(() => synth.triggerAttackRelease("C4", "4n"), 0);
    setTimeout(() => synth.triggerAttackRelease("E4", "4n"), 300);
    setTimeout(() => synth.triggerAttackRelease("G4", "2n"), 600);
}

// Son d'alerte critique
function playCriticalSound() {
    if (isMuted) return;
    
    const synth = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 }
    }).toDestination();

    // Son d'alerte répétitif
    synth.triggerAttackRelease("A3", "8n");
    setTimeout(() => synth.triggerAttackRelease("A3", "8n"), 250);
    setTimeout(() => synth.triggerAttackRelease("A3", "8n"), 500);
}

// Son de mort/évanouissement
function playDeathSound() {
    if (isMuted) return;
    
    const synth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.3, decay: 0.5, sustain: 0.2, release: 2 }
    }).toDestination();

    // Mélodie triste descendante
    const sadMelody = ["G4", "F4", "E4", "D4", "C4", "B3"];
    let i = 0;
    
    const sadPattern = setInterval(() => {
        if (i < sadMelody.length) {
            synth.triggerAttackRelease(sadMelody[i], "4n");
            i++;
        } else {
            clearInterval(sadPattern);
        }
    }, 600);
}

// Son de résurrection
function playReviveSound() {
    if (isMuted) return;
    
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // Accord joyeux de résurrection avec progression
    synth.triggerAttackRelease(["C4", "E4", "G4"], "4n");
    setTimeout(() => synth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "2n"), 400);
    setTimeout(() => synth.triggerAttackRelease(["C4", "E4", "G4", "C5", "E5"], "1n"), 800);
}

// ========== CONTRÔLES AUDIO ==========

// Basculer le mode muet
function toggleMute() {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    Tone.Master.mute = isMuted;
    
    if (isMuted) {
        showMessage("🔇 Audio désactivé", 'info');
    } else {
        showMessage("🔊 Audio activé", 'info');
    }
}

// Mettre à jour le volume
function updateVolume() {
    masterVolume = volumeSlider.value / 100;
    Tone.Master.volume.value = Tone.gainToDb(masterVolume);
}

// ========== INITIALISATION ==========

document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments DOM
    minnieElement = document.getElementById('minnie');
    spanEnergy = document.getElementById('energy');
    spanHappy = document.getElementById('happy');
    spanHangry = document.getElementById('hangry');
    spanMessage = document.getElementById('message');
    hangryBar = document.getElementById('hangry-bar');
    energyBar = document.getElementById('energy-bar');
    happyBar = document.getElementById('happy-bar');
    boutonDormir = document.querySelector('.sleep-btn');
    boutonManger = document.querySelector('.eat-btn');
    boutonJouer = document.querySelector('.play-button');
    muteBtn = document.getElementById('mute-btn');
    volumeSlider = document.getElementById('volume-slider');

    // Vérification des éléments critiques
    if (!minnieElement || !spanEnergy || !spanHappy || !spanHangry || !spanMessage) {
        console.error('❌ Erreur: Éléments DOM manquants');
        return;
    }

    // Événements des boutons principaux
    if (boutonDormir) boutonDormir.addEventListener('click', sleeping);
    if (boutonManger) boutonManger.addEventListener('click', eating);
    if (boutonJouer) boutonJouer.addEventListener('click', playing);

    // Contrôles audio
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
    if (volumeSlider) volumeSlider.addEventListener('input', updateVolume);

    // Initialisation du jeu
    updateDisplay();
    showMessage("Bonjour ! Je suis Minnie ! 🎀", 'success');
    startLifeSystem();
    
    // Initialiser l'audio après la première interaction utilisateur
    document.addEventListener('click', initAudio, { once: true });
});

// ========== FONCTIONS UTILITAIRES ==========

// Limiter les valeurs entre 0 et 100
function clampValue(value) {
    return Math.max(0, Math.min(100, value));
}

// Mise à jour de l'affichage complet
function updateDisplay() {
    // Limiter les valeurs
    hangry = clampValue(hangry);
    energy = clampValue(energy);
    happy = clampValue(happy);

    // Mettre à jour les textes
    spanHangry.textContent = hangry;
    spanEnergy.textContent = energy;
    spanHappy.textContent = happy;

    // Mettre à jour les barres et couleurs
    updateStatusBars();
    updateStatColors();
}

// Mise à jour des barres de statut
function updateStatusBars() {
    if (hangryBar) {
        hangryBar.style.width = hangry + '%';
        hangryBar.style.backgroundColor = getStatColor(hangry);
    }
    if (energyBar) {
        energyBar.style.width = energy + '%';
        energyBar.style.backgroundColor = getStatColor(energy);
    }
    if (happyBar) {
        happyBar.style.width = happy + '%';
        happyBar.style.backgroundColor = getStatColor(happy);
    }
}

// Obtenir la couleur selon la valeur de la statistique
function getStatColor(value) {
    if (value >= 70) return '#32cd32'; // Vert
    if (value >= 40) return '#ffa500'; // Orange
    if (value >= 20) return '#ff4500'; // Rouge-orange
    return '#dc143c'; // Rouge critique
}

// Mise à jour des couleurs des statistiques
function updateStatColors() {
    const spans = [spanHangry, spanEnergy, spanHappy];
    const values = [hangry, energy, happy];
    
    spans.forEach((span, index) => {
        if (!span) return;
        const value = values[index];
        span.className = '';
        
        if (value >= 70) span.className = 'stat-high';
        else if (value >= 40) span.className = 'stat-medium';
        else if (value >= 20) span.className = 'stat-low';
        else span.className = 'stat-critical';
    });
}

// ========== SYSTÈME DE VIE ==========

// Cycle de vie automatique
function lifeSystem() {
    if (isSleeping || isDead) return;

    // Diminution progressive des statistiques
    hangry -= 3;
    energy -= 2;
    happy -= 2;

    checkCriticalState();
    checkDeath();
    updateDisplay();
}

// Vérification des états critiques
function checkCriticalState() {
    if (hangry <= 15 && hangry > 0) {
        showMessage("Minnie a très faim ! 🍎", 'danger');
        playCriticalSound();
    } else if (energy <= 15 && energy > 0) {
        showMessage("Minnie est très fatiguée ! 😴", 'danger');
        playCriticalSound();
    } else if (happy <= 15 && happy > 0) {
        showMessage("Minnie est très triste ! 😢", 'danger');
        playCriticalSound();
    }
}

// Vérification de la mort
function checkDeath() {
    if (hangry <= 0 || energy <= 0 || happy <= 0) {
        isDead = true;
        showMessage("Oh non ! Minnie s'est évanouie ! Prenez mieux soin d'elle ! 💔", 'danger');
        minnieElement.style.filter = 'grayscale(100%)';
        disableButtons();
        playDeathSound();
        
        // Résurrection automatique après 10 secondes
        setTimeout(() => {
            revive();
        }, 10000);
    }
}

// Réanimer Minnie
function revive() {
    isDead = false;
    hangry = 30;
    energy = 30;
    happy = 30;
    minnieElement.style.filter = 'none';
    enableButtons();
    showMessage("Minnie s'est réveillée ! Elle vous pardonne ! 💖", 'success');
    playReviveSound();
    updateDisplay();
}

// ========== ACTIONS DE MINNIE ==========

// Action : Dormir
function sleeping() {
    if (isDead) return;
    
    if (isSleeping) {
        showMessage("Minnie dort déjà ! 😴", 'warning');
        return;
    }

    // Messages variés pour l'endormissement
    const sleepMessages = [
        "Minnie fait dodo... 💤",
        "Bonne nuit Minnie ! 🌙",
        "Minnie s'endort paisiblement... 😴",
        "Doux rêves ma petite Minnie ! ✨",
        "Minnie compte les moutons... 🐑"
    ];
    
    const wakeMessages = [
        "Minnie s'est réveillée ! Elle se sent mieux ! 🌟",
        "Bonjour Minnie ! Bien reposée ? ☀️",
        "Minnie a fait de beaux rêves ! 💭",
        "Minnie se réveille en pleine forme ! 💪",
        "Minnie étire ses petits bras ! 🤗"
    ];
    
    const randomSleepMessage = sleepMessages[Math.floor(Math.random() * sleepMessages.length)];
    showMessage(randomSleepMessage, 'info');
    isSleeping = true;
    
    // Jouer le son de sommeil
    playSleepSound();
    
    // Animation de sommeil
    minnieElement.classList.remove('bounce', 'shake', 'pulse', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow');
    minnieElement.classList.add('sleep');
    
    // Désactiver les boutons pendant le sommeil
    disableButtons();

    // Restauration progressive de l'énergie
    const sleepInterval = setInterval(() => {
        if (energy < 100) {
            energy += 2;
            updateDisplay();
        }
    }, 200);

    // Réveil après 5 secondes
    setTimeout(() => {
        clearInterval(sleepInterval);
        isSleeping = false;
        minnieElement.classList.remove('sleep');
        minnieElement.classList.add('bounce');
        const randomWakeMessage = wakeMessages[Math.floor(Math.random() * wakeMessages.length)];
        showMessage(randomWakeMessage, 'success');
        playWakeUpSound();
        enableButtons();
    }, 5000);
}

// Action : Manger
function eating() {
    if (isDead) return;
    
    if (isSleeping) {
        showMessage("Minnie dort, elle ne peut pas manger ! 😴", 'warning');
        return;
    }

    hangry += 25;
    energy += 5;
    
    // Messages variés avec les paroles de Minnie
    const eatMessages = [
        "Mmm ! C'est délicieux ! 🧀",
        "Trop bon ce repas ! Merci ! 😋",
        "Que c'est savoureux ! J'adore ! 🍎",
        "Miam miam ! C'est un régal ! 🥨",
        "Tu cuisines si bien ! 🥕",
        "Un vrai festin ! Je me régale ! 🍰",
        "C'est exactement ce qu'il me fallait ! 🍓",
        "Merci pour ce délicieux repas ! 🧈"
    ];
    
    const randomMessage = eatMessages[Math.floor(Math.random() * eatMessages.length)];
    showMessage(randomMessage, 'success');
    
    // Son de mastication
    playEatingSound();
    
    // Animation de satisfaction
    minnieElement.classList.remove('shake', 'sleep', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow');
    minnieElement.classList.add('pulse');
    setTimeout(() => minnieElement.classList.remove('pulse'), 1000);
    
    updateDisplay();
}

// Action : Jouer
function playing() {
    if (isDead) return;
    
    if (isSleeping) {
        showMessage("Minnie dort, elle ne peut pas jouer ! 😴", 'warning');
        return;
    }

    if (energy < 10) {
        showMessage("Minnie est trop fatiguée pour jouer ! 😩", 'warning');
        return;
    }

    happy += 20;
    energy -= 10;
    hangry -= 5;
    
    // Animations et messages variés pour le jeu
    const playAnimations = ['shake', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow'];
    const playMessages = [
        "Youpi ! Je m'amuse trop ! 🎀",
        "Hourra ! C'est parti pour danser ! 💃",
        "Hihi ! Regarde mes pirouettes ! ✨",
        "Waouh ! Que c'est amusant ! 😄",
        "Je saute de bonheur ! 🌟",
        "Tra-la-la ! Je virevolte ! 🎈",
        "C'est la fête ! Youhou ! 🎉",
        "Je rayonne de joie ! 🌈",
        "On s'amuse comme des fous ! 🎪",
        "La vie est belle ! 🦋"
    ];
    
    // Sélection aléatoire
    const randomAnimation = playAnimations[Math.floor(Math.random() * playAnimations.length)];
    const randomMessage = playMessages[Math.floor(Math.random() * playMessages.length)];
    
    showMessage(randomMessage, 'success');
    
    // Son de joie
    playHappySound();
    
    // Animation aléatoire
    minnieElement.classList.remove('bounce', 'sleep', 'pulse', 'shake', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow');
    minnieElement.classList.add(randomAnimation);
    
    // Retour à l'animation normale après l'animation spéciale
    const animationDuration = getAnimationDuration(randomAnimation);
    setTimeout(() => {
        minnieElement.classList.remove(randomAnimation);
        minnieElement.classList.add('bounce');
    }, animationDuration);
    
    updateDisplay();
}

// ========== FONCTIONS UTILITAIRES ==========

// Obtenir la durée de chaque animation
function getAnimationDuration(animationName) {
    const durations = {
        'shake': 600,
        'spin': 1000,
        'dance': 1000,
        'wiggle': 800,
        'jump': 800,
        'flip': 1200,
        'heartbeat': 1000,
        'rainbow': 1500
    };
    return durations[animationName] || 800;
}

// Afficher un message avec style
function showMessage(message, type = 'info') {
    if (!spanMessage) return;
    
    spanMessage.textContent = message;
    spanMessage.className = `message-${type}`;
    
    // Effacer le message après 4 secondes
    setTimeout(() => {
        spanMessage.textContent = '';
        spanMessage.className = '';
    }, 4000);
}

// Désactiver tous les boutons
function disableButtons() {
    if (boutonDormir) boutonDormir.disabled = true;
    if (boutonManger) boutonManger.disabled = true;
    if (boutonJouer) boutonJouer.disabled = true;
}

// Réactiver tous les boutons
function enableButtons() {
    if (boutonDormir) boutonDormir.disabled = false;
    if (boutonManger) boutonManger.disabled = false;
    if (boutonJouer) boutonJouer.disabled = false;
}

// Démarrer le système de vie automatique
function startLifeSystem() {
    // Cycle de vie toutes les 5 secondes
    setInterval(() => lifeSystem(), 5000);
}