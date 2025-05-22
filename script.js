// Sélectionner les éléments HTML
const boutonDormir = document.querySelector('.sleep-btn');
const boutonManger = document.querySelector('.eat-btn');
const boutonJouer = document.querySelector('.play-button');
const spanEnergy = document.getElementById('energy');
const spanHappy = document.getElementById('happy');
const spanHangry = document.getElementById('hangry');
const spanMessage = document.getElementById('message');
const hamElement = document.getElementById('ham');

let hangry = 50; // Initialiser la faim à 50%
let energy = 50; // Initialiser l'énergie à 50%
let happy = 50; // Initialiser le bonheur à 50%
let isSleeping = false; // Initialiser le sommeil à faux

document.addEventListener("DOMContentLoaded", function () {
    hamElement.classList.remove('rotate-sleep');
    hamElement.classList.add('bounce');
});

// Réinitialiser les messages
function showMessages() {
    spanMessage.textContent = "";
}

// Fonction pour mettre à jour l'affichage de l'énergie
function updateEnergy() {
    spanEnergy.textContent = energy;
}

function updateHappy() {
    spanHappy.textContent = happy;
}

// Fonction pour gérer la faim
function updateHangry() {
    spanHangry.textContent = hangry;
}

// Système de vie : réduire progressivement les stats
function lifeSysteme() {
    if (!isSleeping) {
        energy -= 5; 
        hangry -= 5; 
        happy -= 5; 
        
        // Limiter les valeurs à un minimum de 10
        if (hangry < 10) hangry = 10;
        if (happy < 10) happy = 10;
        if (energy < 10) energy = 10;

        // Mise à jour des affichages
        updateHangry();
        updateHappy();
        updateEnergy();

        // Afficher des messages d'alerte si une statistique est trop basse
        if (hangry === 10) {
            spanMessage.textContent = "L'animal a trop faim !";
        } else if (happy === 10) {
            spanMessage.textContent = "L'animal est triste !";
        } else if (energy === 10) {
            spanMessage.textContent = "L'animal est épuisé !";
        }
    }
}

// Fonction pour nourrir
function eating() {
    if (isSleeping) {
        spanMessage.textContent = "L'animal dort, il ne peut pas manger !";
        return;
    }
    if (hangry < 100) {
        hangry += 30; 
        energy += 20; 
        if (hangry > 100) hangry = 100;
        if (energy > 100) energy = 100;

        updateEnergy();
        updateHangry();

        // Animation de rebondissement
        hamElement.classList.add('bounce');
        setTimeout(() => hamElement.classList.remove('bounce'), 500);
    }
}

// Fonction pour jouer
function playing() {
    if (isSleeping) {
        spanMessage.textContent = "L'animal dort, il ne peut pas jouer !";
        return;
    }
    if (energy > 20) {
        // Ajouter l'animation de jeu
        hamElement.classList.add('shake');
        
        energy -= 20; 
        happy += 30;  
        hangry -= 10; 

        if (happy > 100) happy = 100;
        if (hangry < 10) hangry = 10;

        updateEnergy();
        updateHappy();
        updateHangry();

        // Retirer l'animation après 500ms
        setTimeout(() => {
            hamElement.classList.remove('shake');
        }, 500);
    } else {
        spanMessage.textContent = "L'animal est trop fatigué pour jouer ! 😩";
    }
}

// Fonction pour gérer le sommeil
function sleeping() {
    if (isSleeping) {
        spanMessage.textContent = "L'animal dort déjà !";
        return;
    }

    // Ajouter l'animation de rotation et rester à 90 degrés
    hamElement.classList.remove('bounce');
    hamElement.classList.add('rotate-sleep');

    // Augmenter l'énergie
    energy += 50;
    if (energy > 100) energy = 100;
    updateEnergy();

    // Définir l'état de sommeil
    isSleeping = true;

    // Réveiller l'animal après 5 secondes
    setTimeout(() => {
        isSleeping = false;
        hamElement.classList.remove('rotate-sleep');
        hamElement.classList.add('bounce');
        spanMessage.textContent = "L'animal s'est réveillé !";
    }, 5000);
}

// Ajouter les écouteurs d'événements
boutonDormir.addEventListener('click', sleeping);
boutonJouer.addEventListener('click', playing);
boutonManger.addEventListener('click', eating);

// Initialiser les affichages
updateEnergy();
updateHappy();
updateHangry();

// Lancer le système de vie toutes les 5 secondes
setInterval(lifeSysteme, 5000);