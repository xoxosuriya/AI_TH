// Zero-dependency procedural Web Audio synthesizer for crisp arcade soundscapes
export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('ai_th_muted') === 'true';
        this.masterVolume = 0.25;
        this._initialized = false;
        
        // Auto-unlock on first user interaction
        const unlock = () => {
            this.init();
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('pointerdown', unlock);
        };
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('pointerdown', unlock, { once: true });
    }
    
    init() {
        if (!this._initialized && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                this._initialized = true;
            }
        }
    }
    
    setMuted(muted) {
        this.muted = !!muted;
        localStorage.setItem('ai_th_muted', this.muted ? 'true' : 'false');
    }
    
    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }
    
    isMuted() {
        return this.muted;
    }
    
    _canPlay() {
        if (this.muted) return false;
        if (!this.ctx) this.init();
        if (!this.ctx) return false;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return true;
    }
    
    // UI selection tick
    playMenuHover() {
        if (!this._canPlay()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.04);
    }
    
    // UI confirmation chord
    playMenuSelect() {
        if (!this._canPlay()) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 1046.50]; // C5, E5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.04);
            
            gain.gain.setValueAtTime(0.001, now + i * 0.04);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.25, now + i * 0.04 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.04 + 0.2);
        });
    }
    
    // Coin pickup chime
    playCoin() {
        if (!this._canPlay()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        
        gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.32);
    }
    
    // Gem pickup crystalline shimmer
    playGem() {
        if (!this._canPlay()) return;
        const now = this.ctx.currentTime;
        const freqs = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
        
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.03);
            
            gain.gain.setValueAtTime(0.001, now + idx * 0.03);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + idx * 0.03 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.28);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.03);
            osc.stop(now + idx * 0.03 + 0.3);
        });
    }
    
    // Ancient Artifact resonant power swell
    playArtifact() {
        if (!this._canPlay()) return;
        const now = this.ctx.currentTime;
        const freqs = [440, 554.37, 659.25, 880]; // A major
        
        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);
            
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.2, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.65);
        });
    }
    
    // Portal exit whoosh
    playPortal() {
        if (!this._canPlay()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);
        
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.35, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.9);
    }
    
    // Level complete victory chime
    playVictory() {
        if (!this._canPlay()) return;
        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, t: 0.00, d: 0.15 },
            { f: 659.25, t: 0.15, d: 0.15 },
            { f: 783.99, t: 0.30, d: 0.20 },
            { f: 1046.50, t: 0.50, d: 0.60 }
        ];
        
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now + note.t);
            
            gain.gain.setValueAtTime(0.001, now + note.t);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.35, now + note.t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + note.t);
            osc.stop(now + note.t + note.d + 0.05);
        });
    }
}

export const sound = new AudioSystem();
