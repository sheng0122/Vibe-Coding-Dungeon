// 遊戲引擎核心 - 橫向卷軸系統
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // 保持像素風格
        
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 遊戲狀態
        this.paused = false;
        this.debug = false;
        this.gameOver = false;
        
        // 時間管理
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        
        // 實體管理
        this.entities = [];
        this.particles = [];
        this.projectiles = [];
        
        // 相機系統
        this.camera = {
            x: 0,
            y: 0,
            shake: 0,
            shakeIntensity: 0
        };
        
        // 輸入管理
        this.keys = {};
        this.setupInputHandlers();
        
        // 關卡資料
        this.currentLevel = 1;
        this.score = 0;
        
        // 遊戲時間追蹤
        this.gameStartTime = Date.now();
        this.gameDuration = 0;
        
        // 圖片資源
        this.sprites = {};
        this.loadSprites();
    }
    
    setupInputHandlers() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            e.preventDefault();
        });
    }
    
    loadSprites() {
        // 載入玩家圖片
        const playerSprite = new Image();
        playerSprite.src = 'MimicBoss/Web/images/player_idle.png';
        playerSprite.onload = () => {
            this.sprites.player = playerSprite;
        };
        
        // 載入變身動畫
        this.sprites.transformFrames = [];
        let loadedFrames = 0;
        for (let i = 1; i <= 9; i++) {
            const frame = new Image();
            frame.src = `assets/animations/micmic_transform/micmic_transform_frame_${i}.png`;
            frame.onload = () => {
                this.sprites.transformFrames[i-1] = frame;
                loadedFrames++;
                console.log(`Loaded transform frame ${i}/9, Total loaded: ${loadedFrames}`);
                if (loadedFrames === 9) {
                    console.log('All transformation frames loaded successfully!');
                }
            };
            frame.onerror = () => {
                console.error(`Failed to load transform frame ${i}:`, frame.src);
            };
        }
        
        // 創建程序化Boss圖片（寶箱怪）
        this.createMimicSprites();
    }
    
    createMimicSprites() {
        // 創建寶箱形態
        const chestCanvas = document.createElement('canvas');
        chestCanvas.width = 64;
        chestCanvas.height = 64;
        const chestCtx = chestCanvas.getContext('2d');
        
        // 繪製像素寶箱
        chestCtx.fillStyle = '#8B4513';
        chestCtx.fillRect(8, 24, 48, 32);
        chestCtx.fillStyle = '#654321';
        chestCtx.fillRect(8, 20, 48, 8);
        chestCtx.fillStyle = '#FFD700';
        chestCtx.fillRect(28, 16, 8, 12);
        
        this.sprites.mimicChest = chestCanvas;
        
        // 創建怪物形態
        const monsterCanvas = document.createElement('canvas');
        monsterCanvas.width = 96;
        monsterCanvas.height = 96;
        const monsterCtx = monsterCanvas.getContext('2d');
        
        // 繪製像素怪物
        monsterCtx.fillStyle = '#8B4513';
        monsterCtx.fillRect(24, 32, 48, 40);
        
        // 眼睛
        monsterCtx.fillStyle = '#FF0000';
        monsterCtx.fillRect(32, 40, 8, 8);
        monsterCtx.fillRect(56, 40, 8, 8);
        
        // 牙齒
        monsterCtx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 6; i++) {
            monsterCtx.fillRect(28 + i * 8, 56, 4, 8);
        }
        
        // 舌頭
        monsterCtx.fillStyle = '#FF69B4';
        monsterCtx.fillRect(40, 64, 16, 24);
        
        this.sprites.mimicMonster = monsterCanvas;
    }
    
    update(currentTime) {
        if (this.paused || this.gameOver) return;
        
        // 計算deltaTime
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // 更新遊戲時間
        this.updateGameTime();
        
        // 更新FPS
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1 / this.deltaTime);
            document.getElementById('fps').textContent = this.fps;
        }
        
        // 更新所有實體
        this.entities.forEach(entity => {
            entity.update(this.deltaTime, this);
        });
        
        // 更新粒子系統
        this.updateParticles();
        
        // 更新投射物
        this.updateProjectiles();
        
        // 更新相機震動
        if (this.camera.shake > 0) {
            this.camera.shake -= this.deltaTime;
            this.camera.x = (Math.random() - 0.5) * this.camera.shakeIntensity;
            this.camera.y = (Math.random() - 0.5) * this.camera.shakeIntensity;
        } else {
            this.camera.x = 0;
            this.camera.y = 0;
        }
        
        // 碰撞檢測
        this.checkCollisions();
        
        // 更新UI
        this.updateUI();
    }
    
    render() {
        // 清空畫布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 保存狀態
        this.ctx.save();
        
        // 應用相機變換
        this.ctx.translate(this.camera.x, this.camera.y);
        
        // 繪製背景
        this.drawBackground();
        
        // 繪製地面
        this.drawGround();
        
        // 繪製所有實體
        this.entities.forEach(entity => {
            entity.render(this.ctx, this);
        });
        
        // 繪製投射物
        this.projectiles.forEach(proj => {
            proj.render(this.ctx);
        });
        
        // 繪製粒子效果
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // 恢復狀態
        this.ctx.restore();
        
        // 繪製UI覆蓋層
        if (this.debug) {
            this.drawDebugInfo();
        }
    }
    
    drawBackground() {
        // 繪製像素風格背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 繪製遠景層
        this.ctx.fillStyle = '#1a252f';
        for (let i = 0; i < 5; i++) {
            const x = i * 200 - (this.camera.x * 0.3) % 200;
            this.ctx.fillRect(x, 100, 80, 120);
            this.ctx.fillRect(x + 100, 80, 60, 140);
        }
    }
    
    drawGround() {
        // 繪製地面
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(0, this.height - 60, this.width, 60);
        
        // 繪製地面紋理
        this.ctx.fillStyle = '#8B4513';
        for (let x = 0; x < this.width; x += 40) {
            this.ctx.fillRect(x, this.height - 60, 2, 60);
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.update(this.deltaTime);
            return particle.life > 0;
        });
        
        document.getElementById('particles').textContent = this.particles.length;
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(proj => {
            proj.update(this.deltaTime);
            return proj.active;
        });
    }
    
    checkCollisions() {
        // 簡單的AABB碰撞檢測
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                const a = this.entities[i];
                const b = this.entities[j];
                
                if (this.isColliding(a, b)) {
                    a.onCollision(b);
                    b.onCollision(a);
                }
            }
        }
        
        // 檢查投射物碰撞
        this.projectiles.forEach(proj => {
            this.entities.forEach(entity => {
                if (proj.owner !== entity && this.isColliding(proj, entity)) {
                    proj.onHit(entity);
                    entity.takeDamage(proj.damage);
                }
            });
        });
    }
    
    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    addParticle(x, y, type) {
        this.particles.push(new Particle(x, y, type));
    }
    
    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }
    
    shakeCamera(intensity, duration) {
        this.camera.shake = duration;
        this.camera.shakeIntensity = intensity;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('entities').textContent = this.entities.length;
        
        // 更新遊戲時間顯示
        const minutes = Math.floor(this.gameDuration / 60);
        const seconds = Math.floor(this.gameDuration % 60);
        const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新或創建時間顯示元素
        let timeElement = document.getElementById('gameTime');
        if (!timeElement) {
            // 如果不存在，在分數旁邊創建一個
            const scoreElement = document.getElementById('score');
            if (scoreElement && scoreElement.parentElement) {
                const timeDiv = document.createElement('div');
                timeDiv.innerHTML = '時間: <span id="gameTime">' + timeDisplay + '</span>';
                scoreElement.parentElement.appendChild(timeDiv);
            }
        } else {
            timeElement.textContent = timeDisplay;
        }
    }
    
    updateGameTime() {
        if (!this.gameOver) {
            this.gameDuration = (Date.now() - this.gameStartTime) / 1000;
        }
    }
    
    drawDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        this.ctx.font = '12px monospace';
        
        this.entities.forEach(entity => {
            // 繪製碰撞框
            this.ctx.strokeStyle = 'lime';
            this.ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
            
            // 顯示實體資訊
            this.ctx.fillText(`HP: ${entity.health}`, entity.x, entity.y - 5);
        });
    }
    
    togglePause() {
        this.paused = !this.paused;
    }
    
    toggleDebug() {
        this.debug = !this.debug;
        document.getElementById('debugPanel').style.display = 
            this.debug ? 'block' : 'none';
    }
    
    restart() {
        this.entities = [];
        this.particles = [];
        this.projectiles = [];
        this.score = 0;
        this.currentLevel = 1;
        this.gameOver = false;
        this.gameStartTime = Date.now();  // 重置遊戲時間
        this.gameDuration = 0;
        this.initGame();
    }
    
    initGame() {
        // 將在main.js中初始化玩家和Boss
    }
}

// 粒子系統
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;
        
        switch(type) {
            case 'damage':
                this.color = '#FF0000';
                this.vx = (Math.random() - 0.5) * 100;
                this.vy = -Math.random() * 200;
                this.size = 4;
                break;
            case 'gold':
                this.color = '#FFD700';
                this.vx = (Math.random() - 0.5) * 150;
                this.vy = -Math.random() * 250;
                this.size = 6;
                break;
            case 'dust':
                this.color = '#8B7355';
                this.vx = (Math.random() - 0.5) * 50;
                this.vy = -Math.random() * 50;
                this.size = 3;
                break;
        }
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += 500 * deltaTime; // 重力
        this.life -= deltaTime;
    }
    
    render(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}