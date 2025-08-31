// 資源載入管理器
class ResourceLoader {
    constructor() {
        this.images = {};
        this.audio = {};
        this.loaded = false;
        this.loadingProgress = 0;
        this.totalAssets = 0;
        this.loadedAssets = 0;
        
        // 新的資料夾結構路徑
        this.paths = {
            sprites: {
                base: 'Assets/Boss/MimicBoss/Sprites/',
                attack: 'Assets/Boss/MimicBoss/Sprites/Attack/',
                idle: 'Assets/Boss/MimicBoss/Sprites/Idle/',
                transform: 'Assets/Boss/MimicBoss/Sprites/Transform/',
                death: 'Assets/Boss/MimicBoss/Sprites/Death/',
                vfx: 'Assets/Boss/MimicBoss/VFX/'
            },
            backgrounds: 'Assets/Backgrounds/',
            audio: {
                music: 'Assets/Audio/Music/',
                sfx: 'Assets/Audio/SFX/'
            }
        };
        
        // 資源清單
        this.assetList = {
            // Boss 攻擊動畫
            bossAttack: [
                'boss_attack_frame1.png',
                'boss_attack_frame2.png',
                'boss_attack_frame3.png',
                'boss_attack_frame4.png',
                'boss_attack_frame5.png',
                'boss_attack_frame6.png',
                'boss_attack_frame7.png'
            ],
            // Boss 待機動畫
            bossIdle: [
                'Idle_Disguise.png'
            ],
            // Boss 變身動畫
            bossTransform: [
                'micmic_transform_frame_1.png',
                'micmic_transform_frame_2.png',
                'micmic_transform_frame_3.png',
                'micmic_transform_frame_4.png',
                'micmic_transform_frame_5.png',
                'micmic_transform_frame_6.png',
                'micmic_transform_frame_7.png',
                'micmic_transform_frame_8.png',
                'micmic_transform_frame_9.png'
            ],
            // 背景
            backgrounds: [
                'castle-background.png',
                'dungeon-start-bg.png'
            ]
        };
    }
    
    // 載入所有資源
    async loadAll(onProgress) {
        // 計算總資源數
        this.totalAssets = 
            this.assetList.bossAttack.length + 
            this.assetList.bossIdle.length + 
            this.assetList.bossTransform.length +
            this.assetList.backgrounds.length;
        
        const promises = [];
        
        // 載入 Boss 攻擊動畫
        for (let filename of this.assetList.bossAttack) {
            const path = this.paths.sprites.attack + filename;
            promises.push(this.loadImage('attack_' + filename.replace('.png', ''), path, onProgress));
        }
        
        // 載入 Boss 待機動畫
        for (let filename of this.assetList.bossIdle) {
            const path = this.paths.sprites.idle + filename;
            promises.push(this.loadImage('idle_' + filename.replace('.png', ''), path, onProgress));
        }
        
        // 載入 Boss 變身動畫
        for (let filename of this.assetList.bossTransform) {
            const path = this.paths.sprites.transform + filename;
            promises.push(this.loadImage('transform_' + filename.replace('.png', ''), path, onProgress));
        }
        
        // 載入背景
        for (let filename of this.assetList.backgrounds) {
            const path = this.paths.backgrounds + filename;
            promises.push(this.loadImage('bg_' + filename.replace('.png', ''), path, onProgress));
        }
        
        // 等待所有資源載入完成
        await Promise.all(promises);
        this.loaded = true;
        console.log('All resources loaded successfully!');
    }
    
    // 載入單一圖片
    loadImage(name, src, onProgress) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                this.loadedAssets++;
                this.loadingProgress = (this.loadedAssets / this.totalAssets) * 100;
                
                if (onProgress) {
                    onProgress(this.loadingProgress, this.loadedAssets, this.totalAssets);
                }
                
                console.log(`Loaded: ${name} (${this.loadingProgress.toFixed(1)}%)`);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    }
    
    // 載入音效
    loadAudio(name, src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audio[name] = audio;
                resolve(audio);
            };
            audio.onerror = () => {
                console.error(`Failed to load audio: ${src}`);
                reject(new Error(`Failed to load audio: ${src}`));
            };
            audio.src = src;
        });
    }
    
    // 取得圖片資源
    getImage(name) {
        if (!this.images[name]) {
            console.warn(`Image not found: ${name}`);
            return null;
        }
        return this.images[name];
    }
    
    // 取得音效資源
    getAudio(name) {
        if (!this.audio[name]) {
            console.warn(`Audio not found: ${name}`);
            return null;
        }
        return this.audio[name];
    }
    
    // 取得動畫幀陣列
    getAnimationFrames(animationType) {
        const frames = [];
        let prefix = '';
        let frameCount = 0;
        
        switch(animationType) {
            case 'attack':
                prefix = 'attack_boss_attack_frame';
                frameCount = 7;
                break;
            case 'idle':
                return [this.getImage('idle_Idle_Disguise')];
            case 'transform':
                prefix = 'transform_micmic_transform_frame_';
                frameCount = 9;
                break;
            default:
                console.warn(`Unknown animation type: ${animationType}`);
                return frames;
        }
        
        for (let i = 1; i <= frameCount; i++) {
            const image = this.getImage(prefix + i);
            if (image) {
                frames.push(image);
            }
        }
        
        return frames;
    }
    
    // 檢查是否載入完成
    isLoaded() {
        return this.loaded;
    }
    
    // 取得載入進度
    getProgress() {
        return this.loadingProgress;
    }
}

// 建立全域資源載入器實例
const resourceLoader = new ResourceLoader();