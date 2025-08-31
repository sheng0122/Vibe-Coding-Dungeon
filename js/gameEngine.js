// 遊戲引擎類
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // 關閉圖像平滑，確保像素藝術風格
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        this.width = 800;
        this.height = 400;
        
        this.paused = false; // 預設不暫停
        this.gameOver = false;
        this.victory = false;
        
        this.entities = [];
        this.particles = [];
        this.projectiles = [];
        
        this.keys = {};
        this.setupInput();
        
        this.score = 0;
        this.level = 1;
        
        // 載入背景
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'Assets/Backgrounds/castle-background.png';
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            // ESC 鍵退出全螢幕
            if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            }
            // F 鍵切換全螢幕
            if (e.key === 'f' || e.key === 'F') {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log('無法進入全螢幕:', err);
                    });
                } else {
                    document.exitFullscreen();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update(deltaTime) {
        if (this.paused || this.gameOver) return;
        
        // 更新遊戲時間
        const elapsed = Math.floor((Date.now() - window.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('gameTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新禮盒掉落系統
        if (window.giftBoxSystem.triggered) {
            window.giftBoxSystem.dropTimer += deltaTime;
            
            if (window.giftBoxSystem.dropTimer >= window.giftBoxSystem.dropInterval) {
                // 確保玩家還存在再掉落禮盒
                if (window.player && !this.gameOver) {
                    window.player.dropGiftBox(this);
                    console.log('Recurring gift box dropped!');
                }
                window.giftBoxSystem.dropTimer = 0;  // 重置計時器
            }
        }
        
        // 更新實體
        this.entities.forEach(entity => {
            entity.update(deltaTime, this);
        });
        
        // 更新粒子
        this.particles = this.particles.filter(p => {
            p.life -= deltaTime;
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 500 * deltaTime;
            return p.life > 0;
        });
        
        // 更新投射物
        this.projectiles = this.projectiles.filter(p => {
            if (p.update) p.update(deltaTime);
            return p.active;
        });
        
        // 碰撞檢測
        this.checkCollisions();
        
        // 更新UI
        this.updateUI();
    }
    
    render() {
        // 繪製背景（包含地板）
        if (this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        } else {
            // 背景圖片未載入時的備用畫面
            this.ctx.fillStyle = '#1a1410';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#2e2416';
            this.ctx.fillRect(0, this.height - 60, this.width, 60);
        }
        
        // 如果暫停，顯示暫停提示
        if (this.paused && !document.getElementById('guideWindow').classList.contains('show')) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#ffcc66';
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.width/2, this.height/2);
            this.ctx.textAlign = 'left';
        }
        
        // 繪製實體
        console.log('Rendering entities:', this.entities.length);
        this.entities.forEach(entity => {
            if (entity.render) {
                console.log('Rendering entity at:', entity.x, entity.y);
                entity.render(this.ctx, this);
            }
        });
        
        // 繪製投射物
        this.projectiles.forEach(p => {
            if (p.render) p.render(this.ctx);
        });
        
        // 繪製粒子
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
            this.ctx.restore();
        });
    }
    
    checkCollisions() {
        this.projectiles.forEach(proj => {
            this.entities.forEach(entity => {
                if (proj.owner !== entity && this.isColliding(proj, entity)) {
                    if (entity.takeDamage) {
                        entity.takeDamage(proj.damage);
                        if (proj.owner && proj.owner.onHitConfirmed) {
                            proj.owner.onHitConfirmed(proj.damage);  // 傳遞傷害值給吸血計算
                        }
                        proj.active = false;
                    }
                }
            });
        });
        
        // 檢查玩家與禮盒的碰撞
        this.entities.forEach(entity => {
            if (entity.isGiftBox && window.player && this.isColliding(window.player, entity)) {
                entity.collect(window.player);
            }
        });
    }
    
    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    addParticle(x, y, type) {
        const configs = {
            damage: { color: '#ff3333', size: 4, vx: (Math.random() - 0.5) * 100, vy: -100 },
            dust: { color: '#8b6914', size: 3, vx: (Math.random() - 0.5) * 50, vy: -50 },
            gold: { color: '#ffcc66', size: 5, vx: (Math.random() - 0.5) * 150, vy: -150 },
            heal: { color: '#00ff00', size: 6, vx: (Math.random() - 0.5) * 80, vy: -120 }
        };
        
        const config = configs[type] || configs.damage;
        this.particles.push({
            x, y,
            ...config,
            life: 0.5
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
    }
    
    togglePause() {
        this.paused = !this.paused;
    }
}