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

    showMessage("Minnie fait dodo... 💤", 'info');
    isSleeping = true;
    
    // Animation de sommeil
    minnieElement.classList.remove('bounce', 'shake', 'pulse');
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
        showMessage("Minnie s'est réveillée ! Elle se sent mieux ! 🌟", 'success');
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
    showMessage("Miam ! Minnie a bien mangé ! 🧀", 'success');
    
    // Animation
    minnieElement.classList.remove('shake', 'sleep');
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
    showMessage("Minnie s'amuse beaucoup ! 🎀", 'success');
    
    // Animation
    minnieElement.classList.remove('bounce', 'sleep', 'pulse');
    minnieElement.classList.add('shake');
    setTimeout(() => {
        minnieElement.classList.remove('shake');
        minnieElement.classList.add('bounce');
    }, 600);
    
    updateDisplay();
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