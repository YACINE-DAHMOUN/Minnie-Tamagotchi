interface MinnieExpressions {
    greeting: string[];
    eating: string[];
    playing: string[];
    sleeping: string[];
    waking: string[];
    critical: string[];
    happy: string[];
    death: string[];
    revive: string[];
}

type MessageType = 'info' | 'warning' | 'danger' | 'success';

class MinnieTamagotchi {
    [x: string]: any;
    private hangry: number = 50;
    private energy: number = 50;
    private happy: number = 50;
    private isSleeping: boolean = false;
    private isDead: boolean = false;
    private isMuted: boolean = false;
    private masterVolume: number = 0.7;

    // Éléments DOM
    private minnieElement!: HTMLImageElement;
    private spanEnergy!: HTMLElement;
    private spanHappy!: HTMLElement;
    private spanHangry!: HTMLElement;
    private spanMessage!: HTMLElement;
    private hangryBar!: HTMLElement;
    private energyBar!: HTMLElement;
    private happyBar!: HTMLElement;
    private boutonDormir!: HTMLButtonElement;
    private boutonManger!: HTMLButtonElement;
    private boutonJouer!: HTMLButtonElement;
    private muteBtn!: HTMLButtonElement;
    private volumeSlider!: HTMLInputElement;

    // Audio
    private audioContext?: AudioContext;
    private gainNode?: GainNode;

    // Expressions authentiques de Minnie
    private minnieExpressions: MinnieExpressions = {
        greeting: [
            "Oh, bonjour ! Je suis Minnie ! 🎀",
            "Hello there ! C'est moi, Minnie Mouse ! ✨",
            "Coucou ! Minnie à votre service ! 💖",
            "Oh là là ! Quelle belle journée ! 🌟",
            "Tra-la-la ! Je suis si heureuse de vous voir ! 🎵"
        ],
        eating: [
            "Oh my ! C'est absolument délicieux ! 🧀",
            "Miam miam ! Tu cuisines si bien ! 😋",
            "Oh, c'est un vrai régal ! Merci beaucoup ! 🍎",
            "Yummy yummy ! C'est trop bon ! 🥨",
            "Oh là là ! Mes papilles dansent de joie ! 🍰",
            "Magnifique ! C'est exactement ce qu'il me fallait ! 🍓",
            "Mmm ! Ça fond dans la bouche ! 🧈",
            "Oh my stars ! Quelle saveur extraordinaire ! 🌟"
        ],
        playing: [
            "Oh boy oh boy ! C'est parti pour s'amuser ! 🎀",
            "Youpi ! Je suis si heureuse ! 💃",
            "Tra-la-la-la ! Regardez-moi danser ! ✨",
            "Oh my stars ! Que c'est amusant ! 😄",
            "Hihi ! Je saute de bonheur ! 🌟",
            "La-la-la ! Je virevolte comme un papillon ! 🦋",
            "Oh, c'est merveilleux ! Je rayonne ! 🌈",
            "Tee-hee ! On s'amuse comme des fous ! 🎪"
        ],
        sleeping: [
            "Oh... je suis si fatiguée... 💤",
            "Bonne nuit ! Faites de beaux rêves ! 🌙",
            "Mmm... temps de faire dodo... 😴",
            "Sweet dreams ! À plus tard ! ✨",
            "Oh là là... mes petits yeux se ferment... 🌟"
        ],
        waking: [
            "Oh ! Bonjour ! J'ai fait de si beaux rêves ! ☀️",
            "Hello again ! Je me sens en pleine forme ! 💪",
            "Oh my ! Quelle belle sieste ! 🌟",
            "Tra-la-la ! Je suis toute reposée ! ✨",
            "Oh boy ! Prête pour de nouvelles aventures ! 🎀"
        ],
        critical: [
            "Oh non ! J'ai vraiment besoin d'aide ! 😢",
            "Oh my stars ! Je ne me sens pas bien ! 💔",
            "Oh là là... quelque chose ne va pas... 😰",
            "Help me ! J'ai besoin de soins ! 🆘",
            "Oh dear... je me sens si faible... 😵"
        ],
        happy: [
            "Oh ! Je suis aux anges ! 😊",
            "Tra-la-la ! La vie est belle ! 🌈",
            "Oh my ! Je suis si heureuse ! 💖",
            "Tee-hee ! Tout va pour le mieux ! ✨"
        ],
        death: [
            "Oh... je... je m'évanouis... 💔",
            "Oh my... tout devient noir... 😵",
            "Aidez-moi... s'il vous plaît... 💫"
        ],
        revive: [
            "Oh ! Je suis de retour ! 💖",
            "Oh my stars ! Merci de m'avoir sauvée ! 🌟",
            "Tra-la-la ! Je vous pardonne ! Prenez mieux soin de moi ! ✨",
            "Oh boy ! Une seconde chance ! Merci ! 🎀"
        ]
    };

    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.startLifeSystem();
        this.greetPlayer();
    }

    private initializeElements(): void {
        this.minnieElement = document.getElementById('minnie') as HTMLImageElement;
        this.spanEnergy = document.getElementById('energy')!;
        this.spanHappy = document.getElementById('happy')!;
        this.spanHangry = document.getElementById('hangry')!;
        this.spanMessage = document.getElementById('message')!;
        this.hangryBar = document.getElementById('hangry-bar')!;
        this.energyBar = document.getElementById('energy-bar')!;
        this.happyBar = document.getElementById('happy-bar')!;
        this.boutonDormir = document.querySelector('.sleep-btn') as HTMLButtonElement;
        this.boutonManger = document.querySelector('.eat-btn') as HTMLButtonElement;
        this.boutonJouer = document.querySelector('.play-button') as HTMLButtonElement;
        this.muteBtn = document.getElementById('mute-btn') as HTMLButtonElement;
        this.volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;

        if (!this.minnieElement || !this.spanEnergy || !this.spanHappy || !this.spanHangry || !this.spanMessage) {
            throw new Error('❌ Erreur: Éléments DOM manquants');
        }
    }

    private bindEvents(): void {
        this.boutonDormir?.addEventListener('click', () => this.sleeping());
        this.boutonManger?.addEventListener('click', () => this.eating());
        this.boutonJouer?.addEventListener('click', () => this.playing());
        this.muteBtn?.addEventListener('click', () => this.toggleMute());
        this.volumeSlider?.addEventListener('input', () => this.updateVolume());

        // Initialiser l'audio après la première interaction
        document.addEventListener('click', () => this.initAudio(), { once: true });
    }

    private async initAudio(): Promise<void> {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.masterVolume;
            console.log('🎵 Système audio démarré !');
        } catch (error) {
            console.log('❌ Erreur audio:', error);
        }
    }

    private speakMinnie(text: string): void {
        if (this.isMuted || !('speechSynthesis' in window)) return;

        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = 1.1;
        utterance.pitch = 1.8;
        utterance.volume = this.masterVolume;
        
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.includes('fr') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.includes('fr'));
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
    }

    private playSound(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
        if (this.isMuted || !this.audioContext || !this.gainNode) return;
        
        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();
        
        oscillator.connect(envelope);
        envelope.connect(this.gainNode);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
        envelope.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
        envelope.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    private playEatingSound(): void {
        if (this.isMuted) return;
        
        const notes = [440, 494, 523, 587, 659];
        let i = 0;
        
        const eatPattern = setInterval(() => {
            if (i < notes.length) {
                this.playSound(notes[i], 0.2, 'square', 0.2);
                i++;
            } else {
                clearInterval(eatPattern);
            }
        }, 150);
    }

    private playHappySound(): void {
        if (this.isMuted) return;
        
        const melody = [523, 659, 783, 1046, 1318];
        let i = 0;
        
        const happyPattern = setInterval(() => {
            if (i < melody.length) {
                this.playSound(melody[i], 0.3, 'triangle', 0.25);
                i++;
            } else {
                clearInterval(happyPattern);
            }
        }, 100);
    }

    private playSleepSound(): void {
        if (this.isMuted) return;
        
        const lullaby = [261, 294, 329, 261];
        let i = 0;
        
        const sleepPattern = setInterval(() => {
            if (i < lullaby.length) {
                this.playSound(lullaby[i], 0.8, 'sine', 0.15);
                i++;
            } else {
                clearInterval(sleepPattern);
            }
        }, 600);
    }

    private getRandomMessage(messages: string[]): string {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    private clampValue(value: number): number {
        return Math.max(0, Math.min(100, value));
    }

    private updateDisplay(): void {
        this.hangry = this.clampValue(this.hangry);
        this.energy = this.clampValue(this.energy);
        this.happy = this.clampValue(this.happy);

        this.spanHangry.textContent = this.hangry.toString();
        this.spanEnergy.textContent = this.energy.toString();
        this.spanHappy.textContent = this.happy.toString();

        this.updateStatusBars();
        this.updateStatColors();
    }

    private updateStatusBars(): void {
        if (this.hangryBar) {
            this.hangryBar.style.width = this.hangry + '%';
            this.hangryBar.style.backgroundColor = this.getStatColor(this.hangry);
        }
        if (this.energyBar) {
            this.energyBar.style.width = this.energy + '%';
            this.energyBar.style.backgroundColor = this.getStatColor(this.energy);
        }
        if (this.happyBar) {
            this.happyBar.style.width = this.happy + '%';
            this.happyBar.style.backgroundColor = this.getStatColor(this.happy);
        }
    }

    private getStatColor(value: number): string {
        if (value >= 70) return '#32cd32';
        if (value >= 40) return '#ffa500';
        if (value >= 20) return '#ff4500';
        return '#dc143c';
    }

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

    private showMessage(message: string, type: MessageType = 'info'): void {
        this.spanMessage.textContent = message;
        this.spanMessage.className = `message-${type}`;
        
        setTimeout(() => {
            this.spanMessage.textContent = '';
            this.spanMessage.className = '';
        }, 4000);
    }

    private greetPlayer(): void {
        const greetingMessage = this.getRandomMessage(this.minnieExpressions.greeting);
        this.showMessage(greetingMessage, 'success');
    }

    private sleeping(): void {
        if (this.isDead) return;
        
        if (this.isSleeping) {
            const alreadySleepingMessage = "Je dors déjà ! Chut... 😴";
            this.showMessage(alreadySleepingMessage, 'warning');
            this.speakMinnie(alreadySleepingMessage);
            return;
        }

        const sleepMessage = this.getRandomMessage(this.minnieExpressions.sleeping);
        this.showMessage(sleepMessage, 'info');
        this.speakMinnie(sleepMessage);
        this.isSleeping = true;
        
        setTimeout(() => this.playSleepSound(), 1000);
        
        this.minnieElement.className = 'sleep';
        this.disableButtons();

        const sleepInterval = setInterval(() => {
            if (this.energy < 100) {
                this.energy += 2;
                this.updateDisplay();
            }
        }, 200);

        setTimeout(() => {
            clearInterval(sleepInterval);
            this.isSleeping = false;
            this.minnieElement.className = 'bounce';
            const wakeMessage = this.getRandomMessage(this.minnieExpressions.waking);
            this.showMessage(wakeMessage, 'success');
            this.speakMinnie(wakeMessage);
            this.enableButtons();
        }, 5000);
    }

    private eating(): void {
        if (this.isDead) return;
        
        if (this.isSleeping) {
            const cantEatMessage = "Je dors, je ne peux pas manger maintenant ! 😴";
            this.showMessage(cantEatMessage, 'warning');
            this.speakMinnie(cantEatMessage);
            return;
        }

        this.hangry += 25;
        this.energy += 5;
        
        const eatMessage = this.getRandomMessage(this.minnieExpressions.eating);
        this.showMessage(eatMessage, 'success');
        this.speakMinnie(eatMessage);
        this.playEatingSound();
        
        this.minnieElement.className = 'pulse';
        setTimeout(() => this.minnieElement.className = 'bounce', 1000);
        
        this.updateDisplay();
    }

    private playing(): void {
        if (this.isDead) return;
        
        if (this.isSleeping) {
            const cantPlayMessage = "Chut ! Je dors ! On jouera plus tard ! 😴";
            this.showMessage(cantPlayMessage, 'warning');
            this.speakMinnie(cantPlayMessage);
            return;
        }

        if (this.energy < 10) {
            const tiredMessage = "Oh my... je suis trop fatiguée pour jouer ! 😩";
            this.showMessage(tiredMessage, 'warning');
            this.speakMinnie(tiredMessage);
            return;
        }

        this.happy += 20;
        this.energy -= 10;
        this.hangry -= 5;
        
        const animations = ['shake', 'spin', 'dance', 'wiggle', 'jump', 'flip', 'heartbeat', 'rainbow'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        const playMessage = this.getRandomMessage(this.minnieExpressions.playing);
        
        this.showMessage(playMessage, 'success');
        this.speakMinnie(playMessage);
        this.playHappySound();
        
        this.minnieElement.className = randomAnimation;
        setTimeout(() => this.minnieElement.className = 'bounce', 1000);
        
        this.updateDisplay();
    }

    private toggleMute(): void {
        this.isMuted = !this.isMuted;
        this.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        
        if (this.isMuted) {
            speechSynthesis.cancel();
            this.showMessage("🔇 Audio désactivé", 'info');
        } else {
            this.showMessage("🔊 Audio activé", 'info');
            setTimeout(() => this.speakMinnie("Je peux parler à nouveau !"), 500);
        }
    }

    private updateVolume(): void {
        this.masterVolume = parseInt(this.volumeSlider.value) / 100;
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
    }

    private disableButtons(): void {
        this.boutonDormir.disabled = true;
        this.boutonManger.disabled = true;
        this.boutonJouer.disabled = true;
    }

    private enableButtons(): void {
        this.boutonDormir.disabled = false;
        this.boutonManger.disabled = false;
        this.boutonJouer.disabled = false;
    }

    private startLifeSystem(): void {
        setInterval(() => {
            if (this.isSleeping || this.isDead) return;

            this.hangry -= 3;
            this.energy -= 2;
            this.happy -= 2;

            this.checkCriticalState();
            this.checkDeath();
            this.updateDisplay();
        }, 5000);
    }

    private checkCriticalState(): void {
        if (this.hangry <= 15 && this.hangry > 0) {
            const criticalMessage = this.getRandomMessage(this.minnieExpressions.critical);
            this.showMessage(criticalMessage, 'danger');
            this.speakMinnie(criticalMessage);
        }
    }

    private checkDeath(): void {
        if (this.hangry <= 0 || this.energy <= 0 || this.happy <= 0) {
            if (!this.isDead) {
                this.isDead = true;
                this.disableButtons();
                this.minnieElement.className = 'dead';
                const deathMessage = this.getRandomMessage(this.minnieExpressions.death);
                this.showMessage(deathMessage, 'danger');
                this.speakMinnie(deathMessage);
                setTimeout(() => this.showReviveButton(), 3000);
            }
        }}}