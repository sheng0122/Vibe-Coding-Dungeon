// 主程式入口 - 整合所有系統
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.type = 'player';
        
        // 屬性
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 10;
        this.speed = 200;
        this.jumpPower = 400;
        
        // 物理
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.facing = 1;
        
        // 戰鬥
        this.attacking = false;
        this.attackCooldown = 0;
        this.combo = 0;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        
        // 動畫
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.currentAnimation = 'idle';
        
        // 裝備（使用DP系統優化）
        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
    }
    
    update(deltaTime, game) {
        // 輸入處理
        this.handleInput(game.keys);
        
        // 物理更新
        this.updatePhysics(deltaTime, game);
        
        // 戰鬥更新
        this.updateCombat(deltaTime);
        
        // 動畫更新
        this.updateAnimation(deltaTime);
        
        // UI更新
        this.updateUI();
    }
    
    handleInput(keys) {
        // 移動
        if (keys['ArrowLeft']) {
            this.vx = -this.speed;
            this.facing = -1;
            this.currentAnimation = 'run';
        } else if (keys['ArrowRight']) {
            this.vx = this.speed;
            this.facing = 1;
            this.currentAnimation = 'run';
        } else {
            this.vx *= 0.8;
            if (Math.abs(this.vx) < 10) {
                this.currentAnimation = 'idle';
            }
        }
        
        // 跳躍
        if (keys['ArrowUp'] && this.grounded) {
            this.vy = -this.jumpPower;
            this.grounded = false;
            this.currentAnimation = 'jump';
        }
        
        // 攻擊
        if (keys[' '] && this.attackCooldown <= 0) {
            this.attack();
        }
        
        // 衝刺
        if (keys['Shift']) {
            this.dash();
        }
    }
    
    updatePhysics(deltaTime, game) {
        // 重力
        if (!this.grounded) {
            this.vy += 1000 * deltaTime;
        }
        
        // 更新位置
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // 地面檢測
        if (this.y + this.height >= game.height - 60) {
            this.y = game.height - 60 - this.height;
            this.vy = 0;
            this.grounded = true;
        }
        
        // 邊界檢測
        this.x = Math.max(0, Math.min(this.x, game.width - this.width));
    }
    
    updateCombat(deltaTime) {
        // 攻擊冷卻
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // 無敵時間
        if (this.invulnerable) {
            this.invulnerableTime -= deltaTime;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // 連擊重置
        if (this.combo > 0 && this.attackCooldown <= -1) {
            this.combo = 0;
        }
    }
    
    updateAnimation(deltaTime) {
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
            
            if (this.currentAnimation === 'attack') {
                this.currentAnimation = 'idle';
                this.attacking = false;
            }
        }
    }
    
    attack() {
        this.attacking = true;
        this.attackCooldown = 0.5;
        this.currentAnimation = 'attack';
        // 不在這裡增加combo，等到確認命中再增加
        
        // 創建攻擊判定
        const attackBox = {
            x: this.x + (this.facing === 1 ? this.width : -30),
            y: this.y,
            width: 30,
            height: this.height,
            damage: this.damage * (1 + this.combo * 0.2),
            owner: this,
            type: 'melee',
            active: true,
            life: 0.1,
            hasHit: false,  // 追蹤是否已經命中
            
            update(deltaTime) {
                this.life -= deltaTime;
                if (this.life <= 0) {
                    this.active = false;
                }
            },
            
            render(ctx) {
                if (game.debug) {
                    ctx.strokeStyle = 'yellow';
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            },
            
            onHit(entity) {
                // 命中效果
                if (!this.hasHit) {
                    this.hasHit = true;
                    // 只在真正命中時增加連擊
                    this.owner.combo++;
                    this.owner.attackCooldown = 0.3;  // 重置連擊冷卻
                    game.addParticle(entity.x + entity.width/2, entity.y, 'damage');
                    game.score += 10 * this.owner.combo;
                }
            }
        };
        
        game.addProjectile(attackBox);
    }
    
    dash() {
        if (this.attackCooldown <= -0.5) { // 衝刺冷卻
            this.vx = this.facing * this.speed * 3;
            this.invulnerable = true;
            this.invulnerableTime = 0.3;
            this.attackCooldown = 1;
            
            // 衝刺特效
            for (let i = 0; i < 5; i++) {
                game.addParticle(
                    this.x - this.facing * i * 10,
                    this.y + this.height/2,
                    'dust'
                );
            }
        }
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return;
        
        this.health -= damage;
        this.invulnerable = true;
        this.invulnerableTime = 1;
        this.combo = 0;
        
        // 擊退
        this.vx = -this.facing * 200;
        this.vy = -100;
        
        // 傷害特效
        game.addParticle(this.x + this.width/2, this.y, 'damage');
        game.shakeCamera(3, 0.2);
        
        // 立即更新血條
        this.updateUI();
        
        if (this.health <= 0) {
            this.onDeath();
        }
    }
    
    onDeath() {
        console.log('Player died!');
        game.gameOver = true;
    }
    
    updateUI() {
        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById('playerHealth').style.width = healthPercent + '%';
    }
    
    render(ctx, game) {
        ctx.save();
        
        // 無敵閃爍
        if (this.invulnerable && Math.floor(this.invulnerableTime * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // 翻轉
        if (this.facing === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2 - this.width, 0);
        }
        
        // 繪製玩家
        if (game.sprites.player) {
            // 使用載入的圖片
            const frameWidth = 32;
            const frameHeight = 48;
            const frame = Math.floor(this.animationFrame);
            
            ctx.drawImage(
                game.sprites.player,
                frame * frameWidth, 0,
                frameWidth, frameHeight,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            // 程序化繪製
            // 身體
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(this.x + 8, this.y + 16, 16, 20);
            
            // 頭
            ctx.fillStyle = '#FDBCB4';
            ctx.fillRect(this.x + 10, this.y + 4, 12, 12);
            
            // 頭髮
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 10, this.y + 4, 12, 4);
            
            // 腿
            ctx.fillStyle = '#000080';
            const legOffset = Math.sin(this.animationFrame * 2) * 2;
            ctx.fillRect(this.x + 10, this.y + 36, 6, 12 + legOffset);
            ctx.fillRect(this.x + 16, this.y + 36, 6, 12 - legOffset);
            
            // 武器
            if (this.attacking) {
                ctx.fillStyle = '#C0C0C0';
                const swordX = this.x + (this.facing === 1 ? 24 : -8);
                const swordY = this.y + 20;
                ctx.fillRect(swordX, swordY - 10, 8, 30);
            }
        }
        
        ctx.restore();
        
        // 連擊顯示
        if (this.combo > 1) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(`x${this.combo}`, this.x + this.width/2 - 10, this.y - 10);
        }
    }
    
    onCollision(other) {
        // 碰撞處理
    }
    
    optimizeEquipment() {
        // 使用DP系統優化裝備
        if (this.inventory.length > 0) {
            const result = dpSystem.knapsackEquipment(this.inventory, 50);
            console.log('Optimal equipment:', result);
        }
    }
}

// 遊戲初始化
let game;
let player;
let boss;

window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    game = new GameEngine(canvas);
    
    // 初始化遊戲
    initGame();
    
    // 開始遊戲循環
    gameLoop();
};

function initGame() {
    // 創建玩家
    player = new Player(100, 200);
    game.entities.push(player);
    
    // 創建Boss
    boss = new MimicBoss(600, 200, game);
    game.entities.push(boss);
    
    // 生成關卡
    const level = randomSystem.generateLevel(800, 400, 1);
    console.log('Generated level:', level);
    
    // 初始化系統
    game.initGame();
}

function gameLoop(currentTime) {
    // 更新
    game.update(currentTime);
    
    // 渲染
    game.render();
    
    // 清理DP快取
    if (game.frameCount % 600 === 0) {
        dpSystem.clearCache();
    }
    
    // 繼續循環
    if (!game.gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        showGameOver();
    }
}

function showGameOver() {
    const ctx = game.ctx;
    
    // 黑色半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, game.width, game.height);
    
    // 遊戲結束文字
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    
    if (boss.health <= 0) {
        ctx.fillText('勝利！', game.width/2, game.height/2 - 50);
        ctx.font = '24px monospace';
        ctx.fillText(`得分: ${game.score}`, game.width/2, game.height/2);
        
        // 顯示戰利品
        const loot = randomSystem.generateLoot(10, 2);
        ctx.font = '18px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`獲得: ${loot.name}`, game.width/2, game.height/2 + 40);
    } else {
        ctx.fillText('遊戲結束', game.width/2, game.height/2 - 50);
        ctx.font = '24px monospace';
        ctx.fillText(`得分: ${game.score}`, game.width/2, game.height/2);
        ctx.fillText('按 R 重新開始', game.width/2, game.height/2 + 40);
    }
    
    // 監聽重新開始
    window.addEventListener('keydown', function restart(e) {
        if (e.key === 'r' || e.key === 'R') {
            window.removeEventListener('keydown', restart);
            game.restart();
            initGame();
            gameLoop();
        }
    });
}

// 全域變數暴露給按鈕使用
window.game = game;