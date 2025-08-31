// 遊戲主類
class MimicBossGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 遊戲狀態
        this.isPaused = false;
        this.isGameOver = false;
        this.keys = {};
        
        // 遊戲物件
        this.player = null;
        this.mimicBoss = null;
        this.projectiles = [];
        this.goldCoins = [];
        this.effects = [];
        
        // 初始化
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    init() {
        // 創建玩家
        this.player = new Player(100, this.height - 100);
        
        // 創建寶箱怪
        this.mimicBoss = new MimicBoss(this.width / 2, this.height / 2);
        
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
        // 清空畫布
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 繪製地面
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, this.height - 50, this.width, 50);
        
        // 繪製物件
        this.mimicBoss.render(this.ctx);
        this.player.render(this.ctx);
        
        this.projectiles.forEach(p => p.render(this.ctx));
        this.goldCoins.forEach(c => c.render(this.ctx));
        this.effects.forEach(e => e.render(this.ctx));
    }
    
    checkCollision(obj1, obj2) {
        return Math.abs(obj1.x - obj2.x) < (obj1.width + obj2.width) / 2 &&
               Math.abs(obj1.y - obj2.y) < (obj1.height + obj2.height) / 2;
    }
    
    createProjectile(x, y, vx, vy, damage, owner, color = '#ffeb3b') {
        this.projectiles.push(new Projectile(x, y, vx, vy, damage, owner, color));
    }
    
    createGoldCoin(x, y) {
        this.goldCoins.push(new GoldCoin(x, y));
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

// 玩家類
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.speed = 5;
        this.health = 100;
        this.maxHealth = 100;
        this.attackCooldown = 0;
        this.gold = 0;
        this.color = '#3498db';
    }
    
    update(keys, game) {
        // 移動
        if (keys['a'] || keys['arrowleft']) this.x -= this.speed;
        if (keys['d'] || keys['arrowright']) this.x += this.speed;
        if (keys['w'] || keys['arrowup']) this.y -= this.speed;
        if (keys['s'] || keys['arrowdown']) this.y += this.speed;
        
        // 邊界檢查
        this.x = Math.max(this.width/2, Math.min(game.width - this.width/2, this.x));
        this.y = Math.max(this.height/2, Math.min(game.height - 50 - this.height/2, this.y));
        
        // 冷卻時間
        if (this.attackCooldown > 0) this.attackCooldown--;
    }
    
    attack(game) {
        if (this.attackCooldown <= 0) {
            const dx = game.mimicBoss.x - this.x;
            const dy = game.mimicBoss.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            game.createProjectile(
                this.x, this.y,
                (dx/dist) * 10, (dy/dist) * 10,
                10, 'player', '#3498db'
            );
            
            this.attackCooldown = 20;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        this.health = Math.max(0, this.health);
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // 繪製玩家眼睛
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x - 10, this.y - 20, 8, 8);
        ctx.fillRect(this.x + 2, this.y - 20, 8, 8);
    }
}

// 寶箱怪類
class MimicBoss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 60;
        this.health = 500;
        this.maxHealth = 500;
        this.phase = 1;
        this.state = 'disguised';
        this.attackCooldown = 0;
        this.animationFrame = 0;
        this.isAwakened = false;
    }
    
    update(game) {
        this.animationFrame++;
        
        // 檢查玩家距離
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // 覺醒
        if (!this.isAwakened && distance < 150) {
            this.awaken();
        }
        
        if (this.isAwakened) {
            // 更新階段
            this.updatePhase();
            
            // AI行為
            if (this.attackCooldown <= 0) {
                this.performAttack(game);
            } else {
                this.attackCooldown--;
            }
            
            // 階段3持續掉金幣
            if (this.phase === 3 && Math.random() < 0.02) {
                game.createGoldCoin(
                    this.x + (Math.random() - 0.5) * 100,
                    this.y
                );
            }
        }
    }
    
    awaken() {
        this.isAwakened = true;
        this.state = 'combat';
    }
    
    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent <= 0.3 && this.phase !== 3) {
            this.phase = 3;
        } else if (healthPercent <= 0.6 && healthPercent > 0.3 && this.phase !== 2) {
            this.phase = 2;
        }
    }
    
    performAttack(game) {
        const attacks = this.getAvailableAttacks();
        const attack = attacks[Math.floor(Math.random() * attacks.length)];
        
        switch(attack) {
            case 'bite':
                this.biteAttack(game);
                break;
            case 'goldSpray':
                this.goldSprayAttack(game);
                break;
            case 'jump':
                this.jumpAttack(game);
                break;
        }
        
        // 根據階段調整冷卻時間
        this.attackCooldown = 60 / (1 + (this.phase - 1) * 0.3);
    }
    
    getAvailableAttacks() {
        if (this.phase === 1) return ['bite'];
        if (this.phase === 2) return ['bite', 'goldSpray'];
        return ['bite', 'goldSpray', 'jump'];
    }
    
    biteAttack(game) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 100) {
            game.player.takeDamage(20 * (1 + (this.phase - 1) * 0.2));
            game.createEffect(game.player.x, game.player.y, 'hit');
        }
    }
    
    goldSprayAttack(game) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            game.createProjectile(
                this.x, this.y,
                Math.cos(angle) * 5,
                Math.sin(angle) * 5,
                10 * (1 + (this.phase - 1) * 0.2),
                'boss',
                '#ffd700'
            );
        }
    }
    
    jumpAttack(game) {
        // 跳躍震地攻擊
        game.createEffect(this.x, this.y, 'shockwave');
        
        const dx = Math.abs(game.player.x - this.x);
        const dy = Math.abs(game.player.y - this.y);
        
        if (dx < 150 && dy < 150) {
            game.player.takeDamage(30 * (1 + (this.phase - 1) * 0.2));
        }
    }
    
    takeDamage(damage, game) {
        if (!this.isAwakened) {
            this.awaken();
        }
        
        this.health -= damage;
        this.health = Math.max(0, this.health);
        
        // 死亡時掉落大量金幣
        if (this.health <= 0) {
            for (let i = 0; i < 20; i++) {
                game.createGoldCoin(
                    this.x + (Math.random() - 0.5) * 200,
                    this.y + (Math.random() - 0.5) * 100
                );
            }
        }
    }
    
    getPhaseText() {
        if (!this.isAwakened) return '階段 1 - 偽裝中';
        if (this.phase === 1) return '階段 1 - 初始形態';
        if (this.phase === 2) return '階段 2 - 強化形態';
        return '階段 3 - 狂暴形態';
    }
    
    render(ctx) {
        if (!this.isAwakened) {
            // 偽裝狀態 - 寶箱
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            
            // 寶箱細節
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            
            // 寶箱鎖
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(this.x - 10, this.y - 5, 20, 15);
        } else {
            // 戰鬥狀態
            const wobble = Math.sin(this.animationFrame * 0.1) * 5;
            
            // 根據階段改變顏色
            if (this.phase === 1) ctx.fillStyle = '#8b4513';
            else if (this.phase === 2) ctx.fillStyle = '#a0522d';
            else ctx.fillStyle = '#ff6347';
            
            // 身體
            ctx.fillRect(
                this.x - this.width/2 + wobble/2,
                this.y - this.height/2,
                this.width,
                this.height
            );
            
            // 大嘴
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(
                this.x - this.width/3,
                this.y - this.height/4,
                this.width * 2/3,
                20
            );
            
            // 牙齒
            ctx.fillStyle = 'white';
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x - this.width/3 + i*10, this.y - this.height/4);
                ctx.lineTo(this.x - this.width/3 + i*10 + 5, this.y - this.height/4 + 10);
                ctx.lineTo(this.x - this.width/3 + i*10 + 10, this.y - this.height/4);
                ctx.fill();
            }
            
            // 眼睛
            ctx.fillStyle = this.phase === 3 ? 'red' : '#ffd700';
            ctx.beginPath();
            ctx.arc(this.x - 20, this.y - 20, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y - 20, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 舌頭
            if (Math.sin(this.animationFrame * 0.2) > 0) {
                ctx.fillStyle = '#ff1493';
                ctx.fillRect(this.x - 5, this.y, 10, 30);
            }
        }
    }
}

// 投射物類
class Projectile {
    constructor(x, y, vx, vy, damage, owner, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner;
        this.color = color;
        this.width = 10;
        this.height = 10;
        this.lifetime = 100;
        this.isDead = false;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime--;
        
        if (this.lifetime <= 0) {
            this.isDead = true;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 金幣類
class GoldCoin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.value = Math.floor(Math.random() * 5) + 1;
        this.vy = -5;
        this.gravity = 0.3;
        this.bounce = 0;
        this.collected = false;
        this.animationFrame = Math.random() * 100;
    }
    
    update() {
        this.animationFrame++;
        
        // 物理
        this.vy += this.gravity;
        this.y += this.vy;
        
        // 地面碰撞
        if (this.y > 550) {
            this.y = 550;
            this.vy *= -0.5;
            this.bounce++;
            
            if (this.bounce > 3) {
                this.vy = 0;
            }
        }
    }
    
    render(ctx) {
        const wobble = Math.sin(this.animationFrame * 0.1) * 2;
        
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y + wobble, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffed4e';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2 + wobble, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 特效類
class Effect {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.frame = 0;
        this.maxFrame = 30;
        this.isDead = false;
    }
    
    update() {
        this.frame++;
        if (this.frame >= this.maxFrame) {
            this.isDead = true;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = 1 - (this.frame / this.maxFrame);
        
        if (this.type === 'hit') {
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.frame * 2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'shockwave') {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.frame * 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// 啟動遊戲
const game = new MimicBossGame();