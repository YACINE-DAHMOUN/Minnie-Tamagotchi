// Variables globales
let hangry = 50;
let energy = 50;
let happy = 50;
let isSleeping = false;
let isDead = false;

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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments
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

    // Vérification des éléments
    if (!minnieElement || !spanEnergy || !spanHappy || !spanHangry || !spanMessage) {
        console.error('Erreur: Éléments DOM manquants');
        return;
    }

    // Événements des boutons
    if (boutonDormir) boutonDormir.addEventListener('click', sleeping);
    if (boutonManger) boutonManger.addEventListener('click', eating);
    if (boutonJouer) boutonJouer.addEventListener('click', playing);

    // Initialisation
    updateDisplay();
    showMessage("Bonjour ! Je suis Minnie ! 🎀", 'success');
    startLifeSystem();
});

// Limiter les valeurs entre 0 et 100
function clampValue(value) {
    return Math.max(0, Math.min(100, value));
}

// Mise à jour de l'affichage
function updateDisplay() {
    // Limiter les valeurs
    hangry = clampValue(hangry);
    energy = clampValue(energy);
    happy = clampValue(happy);

    // Mettre à jour les textes
    spanHangry.textContent = hangry;
    spanEnergy.textContent = energy;
    spanHappy.textContent = happy;

    // Mettre à jour les barres de statut
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

// Obtenir la couleur selon la valeur
function getStatColor(value) {
    if (value >= 70) return '#32cd32';
    if (value >= 40) return '#ffa500';
    if (value >= 20) return '#ff4500';
    return '#dc143c';
}

// Mise à jour des couleurs des stats
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

// Système de vie
function lifeSystem() {
    if (isSleeping || isDead) return;

    hangry -= 3;
    energy -= 2;
    happy -= 2;

    checkCriticalState();
    checkDeath();
    updateDisplay();
}

// Vérifier l'état critique
function checkCriticalState() {
    if (hangry <= 15 && hangry > 0) {
        showMessage("Minnie a très faim ! 🍎", 'danger');
    } else if (energy <= 15 && energy > 0) {
        showMessage("Minnie est très fatiguée ! 😴", 'danger');
    } else if (happy <= 15 && happy > 0) {
        showMessage("Minnie est très triste ! 😢", 'danger');
    }
}

// Vérifier la mort
function checkDeath() {
    if (hangry <= 0 || energy <= 0 || happy <= 0) {
        isDead = true;
        showMessage("Oh non ! Minnie s'est évanouie ! Prenez mieux soin d'elle ! 💔", 'danger');
        minnieElement.style.filter = 'grayscale(100%)';
        disableButtons();
        
        // Permettre la résurrection après 10 secondes
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
    updateDisplay();
}

// Afficher un message
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

// Dormir
function sleeping() {
    if (isDead) return;
    
    if (isSleeping) {
        showMessage("Minnie dort déjà ! 😴", 'warning');
        return;
    }

    // Messages variés pour dormir
    const sleepMessages = [
        "Minnie fait dodo... 💤",
        "Bonne nuit Minnie ! 🌙",
        "Minnie s'endort paisiblement... 😴",
        "Doux rêves Minnie ! ✨",
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
    
    // Animation de sommeil
    minnieElement.classList.remove('bounce', 'shake', 'pulse', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow');
    minnieElement.classList.add('sleep');
    
    // Désactiver les boutons pendant le sommeil
    disableButtons();

    // Restaurer l'énergie progressivement
    const sleepInterval = setInterval(() => {
        if (energy < 100) {
            energy += 2;
            updateDisplay();
        }
    }, 200);

    // Réveiller après 5 secondes
    setTimeout(() => {
        clearInterval(sleepInterval);
        isSleeping = false;
        minnieElement.classList.remove('sleep');
        minnieElement.classList.add('bounce');
        const randomWakeMessage = wakeMessages[Math.floor(Math.random() * wakeMessages.length)];
        showMessage(randomWakeMessage, 'success');
        enableButtons();
    }, 5000);
}

// Manger
function eating() {
    if (isDead) return;
    
    if (isSleeping) {
        showMessage("Minnie dort, elle ne peut pas manger ! 😴", 'warning');
        return;
    }

    hangry += 25;
    energy += 5;
    
    // Messages variés pour manger
    const eatMessages = [
        "Miam ! Minnie a bien mangé ! 🧀",
        "Délicieux ! Minnie se régale ! 😋",
        "Minnie dévore tout avec plaisir ! 🍎",
        "Que c'est bon ! Minnie est satisfaite ! 🥨",
        "Minnie croque à pleines dents ! 🥕",
        "Un vrai festin pour Minnie ! 🍰"
    ];
    
    const randomMessage = eatMessages[Math.floor(Math.random() * eatMessages.length)];
    showMessage(randomMessage, 'success');
    
    // Animation
    minnieElement.classList.remove('shake', 'sleep', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow');
    minnieElement.classList.add('pulse');
    setTimeout(() => minnieElement.classList.remove('pulse'), 1000);
    
    updateDisplay();
}

// Jouer
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
    
    // Animations aléatoires et messages variés
    const playAnimations = ['shake', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow'];
    const playMessages = [
        "Minnie s'amuse beaucoup ! 🎀",
        "Hourra ! Minnie danse de joie ! 💃",
        "Minnie fait des pirouettes ! ✨",
        "Que c'est amusant ! Minnie rigole ! 😄",
        "Minnie saute de bonheur ! 🌟",
        "Minnie virevolte joyeusement ! 🎈",
        "C'est la fête ! Minnie est ravie ! 🎉",
        "Minnie rayonne de bonheur ! 🌈"
    ];
    
    // Sélection aléatoire
    const randomAnimation = playAnimations[Math.floor(Math.random() * playAnimations.length)];
    const randomMessage = playMessages[Math.floor(Math.random() * playMessages.length)];
    
    showMessage(randomMessage, 'success');
    
    // Animation aléatoire
    minnieElement.classList.remove('bounce', 'sleep', 'pulse', 'shake', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow');
    minnieElement.classList.add(randomAnimation);
    
    // Retour à l'animation de base après l'animation
    const animationDuration = getAnimationDuration(randomAnimation);
    setTimeout(() => {
        minnieElement.classList.remove(randomAnimation);
        minnieElement.classList.add('bounce');
    }, animationDuration);
    
    updateDisplay();
}

// Obtenir la durée de l'animation
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

// Désactiver les boutons
function disableButtons() {
    if (boutonDormir) boutonDormir.disabled = true;
    if (boutonManger) boutonManger.disabled = true;
    if (boutonJouer) boutonJouer.disabled = true;
}

// Activer les boutons
function enableButtons() {
    if (boutonDormir) boutonDormir.disabled = false;
    if (boutonManger) boutonManger.disabled = false;
    if (boutonJouer) boutonJouer.disabled = false;
}

// Démarrer le système de vie
function startLifeSystem() {
    setInterval(() => lifeSystem(), 5000);
}