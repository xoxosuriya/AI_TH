// Asset loader - handles asynchronous loading of game assets
export class AssetLoader {
    constructor() {
        this.assets = {
            images: {},
            audio: {}
        };
        
        this.loading = {
            images: 0,
            audio: 0
        };
        
        this.loaded = {
            images: false,
            audio: false
        };
        
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
        
        // Define what needs to be loaded
        this._defineAssets();
    }
    
    // Define what assets to load
    _defineAssets() {
        // In a full implementation, this would list all required assets
        // For now, we'll use placeholders since we're using simple shapes
        this.imageList = [
            // Would be actual image paths
            // 'assets/tiles/floors/stone_01.png',
            // 'assets/tiles/walls/brick_01.png',
            // etc.
        ];
        
        this.audioList = [
            // Would be actual audio paths
            // 'audio/treasure_pickup.wav',
            // 'audio/menu_click.wav',
            // etc.
        ];
    }
    
    // Load all essential assets
    async loadEssentialAssets() {
        // For this implementation, we're using simple shapes so no assets needed
        // But we'll simulate loading for demonstration
        return new Promise((resolve) => {
            // Report progress at 50%\n        console.log('Reporting progress at 50%');
            if (this.onProgressCallback) {
                this.onProgressCallback({ images: 0.5, audio: 0.5, overall: 0.5 });
            }
            // Simulate loading delay\n        console.log('Simulate loading delay');
            setTimeout(() => {
                this._markAllAsLoaded();
                // Report progress at 100%
                if (this.onProgressCallback) {
                    this.onProgressCallback({ images: 1, audio: 1, overall: 1 });
                }
                resolve();
            }, 500); // 500ms loading time
        });
    }    
    // Load all assets (including non-essential)
    async loadAllAssets() {
        return this.loadEssentialAssets(); // For now, same as essential
    }
    
    // Load an image asset
    _loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.images[src] = img;
                this._onImageLoad();
                resolve(img);
            };
            img.onerror = () => {
                console.warn('Failed to load image:', src);
                // Create a placeholder image
                const placeholder = document.createElement('canvas');
                placeholder.width = 64;
                placeholder.height = 64;
                const ctx = placeholder.getContext('2d');
                ctx.fillStyle = '#FF00FF'; // Magenta for missing texture
                ctx.fillRect(0, 0, 64, 64);
                this.assets.images[src] = placeholder;
                this._onImageLoad();
                resolve(placeholder);
            };
            img.src = src;
        });
    }
    
    // Load an audio asset
    _loadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.onload = () => {
                this.assets.audio[src] = audio;
                this._onAudioLoad();
                resolve(audio);
            };
            audio.onerror = () => {
                console.warn('Failed to load audio:', src);
                this.assets.audio[src] = null; // Null audio
                this._onAudioLoad();
                resolve(null);
            };
            audio.src = src;
        });
    }
    
    // Internal: Called when an image finishes loading
    _onImageLoad() {
        this.loading.images--;
        this._updateProgress();
        
        if (this.loading.images === 0) {
            this.loaded.images = true;
            this._checkCompletion();
        }
    }
    
    // Internal: Called when an audio finishes loading
    _onAudioLoad() {
        this.loading.audio--;
        this._updateProgress();
        
        if (this.loading.audio === 0) {
            this.loaded.audio = true;
            this._checkCompletion();
        }
    }
    
    // Internal: Update progress and call callback
    _updateProgress() {
        const totalImages = this.imageList.length;
        const totalAudio = this.audioList.length;
        const loadedImages = totalImages - this.loading.images;
        const loadedAudio = totalAudio - this.loading.audio;
        
        const progress = {
            images: loadedImages / Math.max(1, totalImages),
            audio: loadedAudio / Math.max(1, totalAudio),
            overall: (loadedImages + loadedAudio) / Math.max(1, totalImages + totalAudio)
        };
        
        if (this.onProgressCallback) {
            this.onProgressCallback(progress);
        }
        
        // Also update loading UI if visible
        // This would be handled by the game
    }
    
    // Internal: Check if all loading is complete
    _checkCompletion() {
        if (this.loaded.images && this.loaded.audio) {
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
        }
    }
    
    // Internal: Mark all as loaded (for placeholder implementation)
    _markAllAsLoaded() {
        this.loading.images = 0;
        this.loading.audio = 0;
        this.loaded.images = true;
        this.loaded.audio = true;
        this._checkCompletion();
    }
    
    // Get an image asset
    getImage(src) {
        return this.assets.images[src] || null;
    }
    
    // Get an audio asset
    getAudio(src) {
        return this.assets.audio[src] || null;
    }
    
    // Check if all assets are loaded
    isLoaded() {
        return this.loaded.images && this.loaded.audio;
    }
    
    // Set progress callback
    onProgress(callback) {
        this.onProgressCallback = callback;
    }
    
    // Set completion callback
    onComplete(callback) {
        this.onCompleteCallback = callback;
    }
    
    // Get loading progress
    getProgress() {
        const totalImages = this.imageList.length;
        const totalAudio = this.audioList.length;
        const loadedImages = totalImages - this.loading.images;
        const loadedAudio = totalAudio - this.loading.audio;
        
        return {
            images: loadedImages / Math.max(1, totalImages),
            audio: loadedAudio / Math.max(1, totalAudio),
            overall: (loadedImages + loadedAudio) / Math.max(1, totalImages + totalAudio)
        };
    }
}


