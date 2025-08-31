// 圖片載入器
class ImageLoader {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.loadCount = 0;
        this.totalImages = 0;
    }
    
    loadImages(imageSources, callback) {
        this.totalImages = Object.keys(imageSources).length;
        
        for (let key in imageSources) {
            this.images[key] = new Image();
            this.images[key].onload = () => {
                this.loadCount++;
                if (this.loadCount === this.totalImages) {
                    this.loaded = true;
                    callback();
                }
            };
            this.images[key].onerror = () => {
                console.warn(`Failed to load image: ${key}, using fallback color`);
                this.loadCount++;
                if (this.loadCount === this.totalImages) {
                    this.loaded = true;
                    callback();
                }
            };
            this.images[key].src = imageSources[key];
        }
        
        // 如果沒有圖片要載入，直接執行callback
        if (this.totalImages === 0) {
            this.loaded = true;
            callback();
        }
    }
    
    get(imageName) {
        return this.images[imageName];
    }
}

// 增強的遊戲主類（支援圖片）
class MimicBossGameWithImages {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 遊戲狀態
        this.isPaused = false;
        this.isGameOver = false;
        this.keys = {};
        this.gameStarted = false;
        
        // 圖片載入器
        this.imageLoader = new ImageLoader();
        
        // 遊戲物件
        this.player = null;
        this.mimicBoss = null;
        this.projectiles = [];
        this.goldCoins = [];
        this.effects = [];
        
        // 載入圖片
        this.loadGameImages();
    }
    
    loadGameImages() {
        // 顯示載入畫面
        this.showLoadingScreen();
        
        // 定義圖片來源
        // 你可以替換這些URL為你自己的圖片路徑
        const imageSources = {
            // 玩家圖片
            'player_idle': 'images/player_idle.png',
            'player_walk': 'images/player_walk.png',
            'player_attack': 'images/player_attack.png',
            
            // 寶箱怪圖片
            'mimic_chest': 'images/mimic_chest.png',
            'mimic_idle': 'images/mimic_idle.png',
            'mimic_attack': 'images/mimic_attack.png',
            'mimic_rage': 'images/mimic_rage.png',
            
            // 物品圖片
            'gold_coin': 'images/gold_coin.png',
            'projectile': 'images/projectile.png',
            
            // 背景
            'background': 'images/background.png',
            'ground': 'images/ground.png'
        };
        
        // 載入圖片
        this.imageLoader.loadImages(imageSources, () => {
            console.log('All images loaded!');
            this.init();
            this.setupEventListeners();
            this.gameStarted = true;
            this.gameLoop();
        });
    }
    
    showLoadingScreen() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('載入中...', this.width/2, this.height/2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('如果圖片載入失敗，將使用預設顏色', this.width/2, this.height/2 + 40);
    }
    
    init() {
        // 創建玩家（傳入圖片載入器）
        this.player = new PlayerWithImage(100, this.height - 100, this.imageLoader);
        
        // 創建寶箱怪（傳入圖片載入器）
        this.mimicBoss = new MimicBossWithImage(this.width / 2, this.height / 2, this.imageLoader);
        
        // 重置陣列
        this.projectiles = [];
        this.goldCoins = [];
        this.effects = [];
        
        // 重置UI
        this.updateUI();
    }
    
    setupEventListeners() {
        // 鍵盤事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.player.attack(this);
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    gameLoop() {
        if (!this.gameStarted) return;
        
        if (!this.isPaused && !this.isGameOver) {
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 更新玩家
        this.player.update(this.keys, this);
        
        // 更新Boss
        this.mimicBoss.update(this);
        
        // 更新投射物
        this.projectiles = this.projectiles.filter(p => {
            p.update();
            
            // 檢查碰撞
            if (p.owner === 'boss' && this.checkCollision(p, this.player)) {
                this.player.takeDamage(p.damage);
                this.createDamageNumber(this.player.x, this.player.y - 30, p.damage);
                return false;
            }
            
            if (p.owner === 'player' && this.checkCollision(p, this.mimicBoss)) {
                this.mimicBoss.takeDamage(p.damage, this);
                this.createDamageNumber(this.mimicBoss.x, this.mimicBoss.y - 50, p.damage);
                return false;
            }
            
            return !p.isDead;
        });
        
        // 更新金幣
        this.goldCoins = this.goldCoins.filter(coin => {
            coin.update();
            
            if (this.checkCollision(coin, this.player)) {
                this.player.gold += coin.value;
                document.getElementById('gold').textContent = this.player.gold;
                return false;
            }
            
            return !coin.collected;
        });
        
        // 更新特效
        this.effects = this.effects.filter(effect => {
            effect.update();
            return !effect.isDead;
        });
        
        // 更新UI
        this.updateUI();
        
        // 檢查遊戲結束
        if (this.player.health <= 0 || this.mimicBoss.health <= 0) {
            this.gameOver();
        }
    }
    
    render() {
        // 繪製背景
        const bgImage = this.imageLoader.get('background');
        if (bgImage && bgImage.complete) {
            this.ctx.drawImage(bgImage, 0, 0, this.width, this.height);
        } else {
            // 備用顏色背景
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 繪製地面
        const groundImage = this.imageLoader.get('ground');
        if (groundImage && groundImage.complete) {
            this.ctx.drawImage(groundImage, 0, this.height - 50, this.width, 50);
        } else {
            // 備用顏色地面
            this.ctx.fillStyle = '#34495e';
            this.ctx.fillRect(0, this.height - 50, this.width, 50);
        }
        
        // 繪製物件
        this.mimicBoss.render(this.ctx);
        this.player.render(this.ctx);
        
        this.projectiles.forEach(p => p.render(this.ctx, this.imageLoader));
        this.goldCoins.forEach(c => c.render(this.ctx, this.imageLoader));
        this.effects.forEach(e => e.render(this.ctx));
    }
    
    checkCollision(obj1, obj2) {
        return Math.abs(obj1.x - obj2.x) < (obj1.width + obj2.width) / 2 &&
               Math.abs(obj1.y - obj2.y) < (obj1.height + obj2.height) / 2;
    }
    
    createProjectile(x, y, vx, vy, damage, owner, color = '#ffeb3b') {
        this.projectiles.push(new ProjectileWithImage(x, y, vx, vy, damage, owner, color));
    }
    
    createGoldCoin(x, y) {
        this.goldCoins.push(new GoldCoinWithImage(x, y));
    }
    
    createEffect(x, y, type) {
        this.effects.push(new Effect(x, y, type));
    }
    
    createDamageNumber(x, y, damage) {
        const elem = document.createElement('div');
        elem.className = 'damage-number';
        elem.textContent = damage;
        elem.style.left = x + 'px';
        elem.style.top = y + 'px';
        document.body.appendChild(elem);
        
        setTimeout(() => elem.remove(), 1000);
    }
    
    updateUI() {
        // Boss血量
        const bossHealthPercent = (this.mimicBoss.health / this.mimicBoss.maxHealth) * 100;
        document.getElementById('bossHealth').style.width = bossHealthPercent + '%';
        document.getElementById('bossHealthText').textContent = 
            `${Math.max(0, Math.floor(this.mimicBoss.health))} / ${this.mimicBoss.maxHealth}`;
        
        // 玩家血量
        const playerHealthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('playerHealth').style.width = playerHealthPercent + '%';
        document.getElementById('playerHealthText').textContent = 
            `${Math.max(0, Math.floor(this.player.health))} / ${this.player.maxHealth}`;
        
        // 階段顯示
        const phaseText = this.mimicBoss.getPhaseText();
        document.getElementById('phase').textContent = phaseText;
    }
    
    gameOver() {
        this.isGameOver = true;
        const gameOverDiv = document.getElementById('gameOver');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        if (this.player.health <= 0) {
            title.textContent = '戰鬥失敗';
            message.textContent = '被寶箱怪擊敗了！';
        } else {
            title.textContent = '勝利！';
            message.textContent = `擊敗了寶箱怪！獲得 ${this.player.gold} 金幣！`;
        }
        
        gameOverDiv.style.display = 'block';
    }
    
    restart() {
        this.isGameOver = false;
        this.isPaused = false;
        document.getElementById('gameOver').style.display = 'none';
        this.init();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
    }
}

// 支援圖片的玩家類
class PlayerWithImage extends Player {
    constructor(x, y, imageLoader) {
        super(x, y);
        this.imageLoader = imageLoader;
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
    }
    
    update(keys, game) {
        super.update(keys, game);
        
        // 更新動畫狀態
        if (keys['a'] || keys['d'] || keys['arrowleft'] || keys['arrowright']) {
            this.currentAnimation = 'walk';
        } else {
            this.currentAnimation = 'idle';
        }
        
        this.animationFrame++;
    }
    
    render(ctx) {
        const image = this.imageLoader.get(`player_${this.currentAnimation}`);
        
        if (image && image.complete) {
            // 使用圖片
            ctx.drawImage(
                image,
                this.x - this.width/2,
                this.y - this.height/2,
                this.width,
                this.height
            );
        } else {
            // 使用原本的顏色繪製作為備用
            super.render(ctx);
        }
    }
}

// 支援圖片的寶箱怪類
class MimicBossWithImage extends MimicBoss {
    constructor(x, y, imageLoader) {
        super(x, y);
        this.imageLoader = imageLoader;
    }
    
    render(ctx) {
        let image;
        
        if (!this.isAwakened) {
            image = this.imageLoader.get('mimic_chest');
        } else if (this.phase === 3) {
            image = this.imageLoader.get('mimic_rage');
        } else if (this.state === 'attacking') {
            image = this.imageLoader.get('mimic_attack');
        } else {
            image = this.imageLoader.get('mimic_idle');
        }
        
        if (image && image.complete) {
            // 使用圖片
            const wobble = Math.sin(this.animationFrame * 0.1) * 5;
            ctx.drawImage(
                image,
                this.x - this.width/2 + wobble/2,
                this.y - this.height/2,
                this.width,
                this.height
            );
        } else {
            // 使用原本的顏色繪製作為備用
            super.render(ctx);
        }
    }
}

// 支援圖片的投射物類
class ProjectileWithImage extends Projectile {
    render(ctx, imageLoader) {
        const image = imageLoader.get('projectile');
        
        if (image && image.complete) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.drawImage(image, -10, -10, 20, 20);
            ctx.restore();
        } else {
            super.render(ctx);
        }
    }
}

// 支援圖片的金幣類
class GoldCoinWithImage extends GoldCoin {
    render(ctx, imageLoader) {
        const image = imageLoader.get('gold_coin');
        const wobble = Math.sin(this.animationFrame * 0.1) * 2;
        
        if (image && image.complete) {
            ctx.drawImage(
                image,
                this.x - 10,
                this.y - 10 + wobble,
                20,
                20
            );
        } else {
            super.render(ctx);
        }
    }
}

// 如果要使用圖片版本，取消下面這行的註解
// const game = new MimicBossGameWithImages();