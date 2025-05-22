class Tamagotchi {
    private hangry: number = 50;
    private energy: number = 50;
    private happy: number = 50;
    private isSleeping: boolean = false;
    private isDead: boolean = false;

    // Éléments DOM
    private minnieElement: HTMLElement;
    private spanEnergy: HTMLElement;
    private spanHappy: HTMLElement;
    private spanHangry: HTMLElement;
    private spanMessage: HTMLElement;
    
    // Barres de statut
    private hangryBar: HTMLElement;
    private energyBar: HTMLElement;
    private happyBar: HTMLElement;

    // Boutons
    private boutonDormir: HTMLButtonElement;
    private boutonManger: HTMLButtonElement;
    private boutonJouer: HTMLButtonElement;

    constructor() {
        // Initialisation des éléments DOM
        this.minnieElement = document.getElementById('minnie')!;
        this.spanEnergy = document.getElementById('energy')!;
        this.spanHappy = document.getElementById('happy')!;
        this.spanHangry = document.getElementById('hangry')!;
        this.spanMessage = document.getElementById('message')!;
        
        // Barres de statut
        this.hangryBar = document.getElementById('hangry-bar')!;
        this.energyBar = document.getElementById('energy-bar')!;
        this.happyBar = document.getElementById('happy-bar')!;

        // Boutons
        this.boutonDormir = document.querySelector('.sleep-btn')!;
        this.boutonManger = document.querySelector('.eat-btn')!;
        this.boutonJouer = document.querySelector('.play-button')!;

        // Initialisation
        this.updateDisplay();
        this.bindEvents();
        this.startLifeSystem();
        this.showMessage("Bonjour ! Je suis Minnie ! 🎀", 'success');
    }

    // Limiter les valeurs entre 0 et 100
    private clampValue(value: number): number {
        return Math.max(0, Math.min(100, value));
    }

    // Mise à jour de l'affichage
    private updateDisplay(): void {
        // Limiter les valeurs
        this.hangry = this.clampValue(this.hangry);
        this.energy = this.clampValue(this.energy);
        this.happy = this.clampValue(this.happy);

        // Mettre à jour les textes
        this.spanHangry.textContent = this.hangry.toString();
        this.spanEnergy.textContent = this.energy.toString();
        this.spanHappy.textContent = this.happy.toString();

        // Mettre à jour les barres de statut
        this.updateStatusBars();
        this.updateStatColors();
    }

    // Mise à jour des barres de statut
    private updateStatusBars(): void {
        const hangryBarElement = this.hangryBar as HTMLElement;
        const energyBarElement = this.energyBar as HTMLElement;
        const happyBarElement = this.happyBar as HTMLElement;

        hangryBarElement.style.width = this.hangry + '%';
        energyBarElement.style.width = this.energy + '%';
        happyBarElement.style.width = this.happy + '%';

        // Couleurs des barres
        hangryBarElement.style.backgroundColor = this.getStatColor(this.hangry);
        energyBarElement.style.backgroundColor = this.getStatColor(this.energy);
        happyBarElement.style.backgroundColor = this.getStatColor(this.happy);
    }

    // Obtenir la couleur selon la valeur
    private getStatColor(value: number): string {
        if (value >= 70) return '#32cd32';
        if (value >= 40) return '#ffa500';
        if (value >= 20) return '#ff4500';
        return '#dc143c';
    }

    // Mise à jour des couleurs des stats
    private updateStatColors(): void {
        const spans = [this.spanHangry, this.spanEnergy, this.spanHappy];
        const values = [this.hangry, this.energy, this.happy];
        
        spans.forEach((span, index) => {
            const value = values[index];
            span.className = '';
            
            if (value >= 70) span.className = 'stat-high';
            else if (value >= 40) span.className = 'stat-medium';
            else if (value >= 20) span.className = 'stat-low';
            else span.className = 'stat-critical';
        });
    }

    // Système de vie
    private lifeSystem(): void {
        if (this.isSleeping || this.isDead) return;

        this.hangry -= 3;
        this.energy -= 2;
        this.happy -= 2;

        this.checkCriticalState();
        this.checkDeath();
        this.updateDisplay();
    }

    // Vérifier l'état critique
    private checkCriticalState(): void {
        if (this.hangry <= 15 && this.hangry > 0) {
            this.showMessage("Minnie a très faim ! 🍎", 'danger');
        } else if (this.energy <= 15 && this.energy > 0) {
            this.showMessage("Minnie est très fatiguée ! 😴", 'danger');
        } else if (this.happy <= 15 && this.happy > 0) {
            this.showMessage("Minnie est très triste ! 😢", 'danger');
        }
    }

    // Vérifier la mort
    private checkDeath(): void {
        if (this.hangry <= 0 || this.energy <= 0 || this.happy <= 0) {
            this.isDead = true;
            this.showMessage("Oh non ! Minnie s'est évanouie ! Prenez mieux soin d'elle ! 💔", 'danger');
            (this.minnieElement as HTMLImageElement).style.filter = 'grayscale(100%)';
            this.disableButtons();
            
            // Permettre la résurrection après 10 secondes
            setTimeout(() => {
                this.revive();
            }, 10000);
        }
    }

    // Réanimer Minnie
    private revive(): void {
        this.isDead = false;
        this.hangry = 30;
        this.energy = 30;
        this.happy = 30;
        (this.minnieElement as HTMLImageElement).style.filter = 'none';
        this.enableButtons();
        this.showMessage("Minnie s'est réveillée ! Elle vous pardonne ! 💖", 'success');
        this.updateDisplay();
    }

    // Afficher un message
    private showMessage(message: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info'): void {
        this.spanMessage.textContent = message;
        this.spanMessage.className = `message-${type}`;
        
        // Effacer le message après 4 secondes
        setTimeout(() => {
            this.spanMessage.textContent = '';
            this.spanMessage.className = '';
        }, 4000);
    }

    // Dormir
    private sleeping(): void {
        if (this.isDead) return;
        
        if (this.isSleeping) {
            this.showMessage("Minnie dort déjà ! 😴", 'warning');
            return;
        }

        this.showMessage("Minnie fait dodo... 💤", 'info');
        this.isSleeping = true;
        
        // Animation de sommeil
        this.minnieElement.classList.remove('bounce', 'shake', 'pulse');
        this.minnieElement.classList.add('sleep');
        
        // Désactiver les boutons pendant le sommeil
        this.boutonManger.disabled = true;
        this.boutonJouer.disabled = true;
        this.boutonDormir.disabled = true;

        // Restaurer l'énergie progressivement
        const sleepInterval = setInterval(() => {
            if (this.energy < 100) {
                this.energy += 2;
                this.updateDisplay();
            }
        }, 200);

        // Réveiller après 5 secondes
        setTimeout(() => {
            clearInterval(sleepInterval);
            this.isSleeping = false;
            this.minnieElement.classList.remove('sleep');
            this.minnieElement.classList.add('bounce');
            this.showMessage("Minnie s'est réveillée ! Elle se sent mieux ! 🌟", 'success');
            this.enableButtons();
        }, 5000);
    }

    // Manger
    private eating(): void {
        if (this.isDead) return;
        
        if (this.isSleeping) {
            this.showMessage("Minnie dort, elle ne peut pas manger ! 😴", 'warning');
            return;
        }

        this.hangry += 25;
        this.energy += 5;
        this.showMessage("Miam ! Minnie a bien mangé ! 🧀", 'success');
        
        // Animation
        this.minnieElement.classList.remove('shake', 'sleep');
        this.minnieElement.classList.add('pulse');
        setTimeout(() => this.minnieElement.classList.remove('pulse'), 1000);
        
        this.updateDisplay();
    }

    // Jouer
    private playing(): void {
        if (this.isDead) return;
        
        if (this.isSleeping) {
            this.showMessage("Minnie dort, elle ne peut pas jouer ! 😴", 'warning');
            return;
        }

        if (this.energy < 10) {
            this.showMessage("Minnie est trop fatiguée pour jouer ! 😩", 'warning');
            return;
        }

        this.happy += 20;
        this.energy -= 10;
        this.hangry -= 5;
        this.showMessage("Minnie s'amuse beaucoup ! 🎀", 'success');
        
        // Animation
        this.minnieElement.classList.remove('bounce', 'sleep', 'pulse');
        this.minnieElement.classList.add('shake');
        setTimeout(() => {
            this.minnieElement.classList.remove('shake');
            this.minnieElement.classList.add('bounce');
        }, 600);
        
        this.updateDisplay();
    }

    // Désactiver les boutons
    private disableButtons(): void {
        this.boutonDormir.disabled = true;
        this.boutonManger.disabled = true;
        this.boutonJouer.disabled = true;
    }

    // Activer les boutons
    private enableButtons(): void {
        this.boutonDormir.disabled = false;
        this.boutonManger.disabled = false;
        this.boutonJouer.disabled = false;
    }

    // Associer les événements
    private bindEvents(): void {
        this.boutonDormir.addEventListener('click', () => this.sleeping());
        this.boutonManger.addEventListener('click', () => this.eating());
        this.boutonJouer.addEventListener('click', () => this.playing());
    }

    // Démarrer le système de vie
    private startLifeSystem(): void {
        setInterval(() => this.lifeSystem(), 5000);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new Tamagotchi();
});