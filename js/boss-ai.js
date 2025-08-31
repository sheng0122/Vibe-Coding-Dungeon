// Boss AI系統 - 寶箱怪智慧行為
class MimicBoss {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = 96;
        this.height = 96;
        this.game = game;
        
        // 基礎屬性
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.damage = 20;
        this.speed = 100;
        this.defense = 10;
        
        // 階段管理
        this.phase = 1; // 1: 偽裝, 2: 覺醒, 3: 狂暴
        this.state = 'chest'; // chest, transforming, monster
        this.isTransforming = false;
        this.transformFrame = 0;
        this.transformAnimationSpeed = 0.15;
        
        // AI決策系統
        this.aiState = 'idle';
        this.aiTimer = 0;
        this.lastDecisionTime = 0;
        this.decisionInterval = 1000; // 每秒做一次決策
        
        // 攻擊模式
        this.attacks = {
            bite: { damage: 30, range: 50, cooldown: 1000, lastUsed: 0 },
            tongue: { damage: 20, range: 200, cooldown: 2000, lastUsed: 0 },
            jump: { damage: 40, range: 300, cooldown: 3000, lastUsed: 0 },
            barrage: { damage: 10, range: 400, cooldown: 4000, lastUsed: 0 },
            trap: { damage: 25, range: 150, cooldown: 5000, lastUsed: 0 }
        };
        
        // 動畫狀態
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.facing = 1; // 1: 右, -1: 左
        
        // 物理屬性
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        
        // 行為樹根節點
        this.behaviorTree = this.createBehaviorTree();
    }
    
    createBehaviorTree() {
        // 建立行為樹結構
        return {
            type: 'selector',
            children: [
                // 檢查是否需要轉換階段
                {
                    type: 'sequence',
                    children: [
                        { type: 'condition', condition: () => this.shouldChangePhase() },
                        { type: 'action', action: () => this.changePhase() }
                    ]
                },
                // 根據階段選擇行為
                {
                    type: 'selector',
                    children: [
                        // 偽裝階段行為
                        {
                            type: 'sequence',
                            children: [
                                { type: 'condition', condition: () => this.phase === 1 },
                                { type: 'selector', children: [
                                    { type: 'action', action: () => this.disguiseBehavior() }
                                ]}
                            ]
                        },
                        // 覺醒階段行為
                        {
                            type: 'sequence',
                            children: [
                                { type: 'condition', condition: () => this.phase === 2 },
                                { type: 'selector', children: [
                                    { type: 'action', action: () => this.awakenedBehavior() }
                                ]}
                            ]
                        },
                        // 狂暴階段行為
                        {
                            type: 'sequence',
                            children: [
                                { type: 'condition', condition: () => this.phase === 3 },
                                { type: 'selector', children: [
                                    { type: 'action', action: () => this.berserkBehavior() }
                                ]}
                            ]
                        }
                    ]
                }
            ]
        };
    }
    
    update(deltaTime, game) {
        const startTime = performance.now();
        
        // 更新物理
        this.updatePhysics(deltaTime);
        
        // 執行AI決策
        if (Date.now() - this.lastDecisionTime > this.decisionInterval) {
            this.executeAI(game);
            this.lastDecisionTime = Date.now();
        }
        
        // 更新動畫
        this.updateAnimation(deltaTime);
        
        // 更新攻擊冷卻
        this.updateCooldowns(deltaTime);
        
        // 更新UI
        this.updateUI();
        
        // 記錄AI決策時間
        const aiTime = performance.now() - startTime;
        document.getElementById('aiTime').textContent = aiTime.toFixed(2);
    }
    
    executeAI(game) {
        // 執行行為樹
        this.executeBehaviorNode(this.behaviorTree, game);
        
        // 使用動態規劃預測玩家行動
        const player = game.entities.find(e => e.type === 'player');
        if (player) {
            const gameState = {
                playerHP: player.health,
                bossHP: this.health,
                playerPosition: player.x < this.x ? 'left' : 'right',
                distance: Math.abs(player.x - this.x),
                combo: player.combo || 0
            };
            
            const prediction = dpSystem.predictPlayerAction(gameState);
            this.adjustStrategy(prediction);
        }
    }
    
    executeBehaviorNode(node, game) {
        switch(node.type) {
            case 'selector':
                for (const child of node.children) {
                    if (this.executeBehaviorNode(child, game)) {
                        return true;
                    }
                }
                return false;
                
            case 'sequence':
                for (const child of node.children) {
                    if (!this.executeBehaviorNode(child, game)) {
                        return false;
                    }
                }
                return true;
                
            case 'condition':
                return node.condition();
                
            case 'action':
                return node.action();
                
            default:
                return false;
        }
    }
    
    shouldChangePhase() {
        const healthPercent = this.health / this.maxHealth;
        
        // 第一階段到第二階段：被攻擊就轉換（不需要動畫）
        if (this.phase === 1 && this.health < this.maxHealth) {
            console.log('Boss: Phase 1->2 trigger (damaged)');
            return true;
        } 
        // 第二階段到第三階段：血量50%以下（需要變身動畫）
        else if (this.phase === 2 && healthPercent <= 0.5) {
            console.log('Boss: Phase 2->3 trigger (HP:', Math.floor(healthPercent * 100), '%)');
            return true;
        }
        
        return false;
    }
    
    changePhase() {
        const oldPhase = this.phase;
        this.phase++;
        console.log(`Boss: Phase change ${oldPhase} -> ${this.phase}`);
        
        // 只有第二階段到第三階段才播放變身動畫
        if (this.phase === 3) {
            console.log('Boss: Starting transformation animation!');
            this.state = 'transforming';
            this.isTransforming = true;
            this.transformFrame = 0;
            
            // 震動螢幕效果
            this.game.shakeCamera(10, 0.5);
            
            // 產生轉換特效
            for (let i = 0; i < 20; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    'damage'
                );
            }
        } else {
            // 第一階段到第二階段：直接變成怪物形態
            this.state = 'monster';
            
            // 簡單的特效
            for (let i = 0; i < 10; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    'dust'
                );
            }
        }
        
        // 更新UI顯示
        const phaseNames = ['', '偽裝', '覺醒', '狂暴'];
        document.getElementById('bossPhase').textContent = phaseNames[this.phase];
        
        // 調整難度
        const difficulty = dpSystem.adaptiveDifficulty({
            deaths: 0,
            hits: 10,
            dodges: 5,
            time: 120,
            combo: 3,
            misses: 2
        });
        
        this.damage *= difficulty.multiplier;
        this.speed *= difficulty.multiplier;
        
        document.getElementById('difficulty').textContent = 
            difficulty.difficulty > 7 ? '困難' : 
            difficulty.difficulty > 4 ? '普通' : '簡單';
        
        return true;
    }
    
    disguiseBehavior() {
        // 偽裝階段 - 假裝是寶箱
        const player = this.findPlayer();
        if (!player) return false;
        
        const distance = Math.abs(player.x - this.x);
        
        if (distance < 100) {
            // 玩家靠近時突然攻擊
            this.state = 'monster';
            this.performAttack('bite', player);
            
            // 生成陷阱
            if (this.canUseAttack('trap')) {
                this.createTrap();
            }
        } else {
            // 保持偽裝
            this.state = 'chest';
            this.aiState = 'waiting';
        }
        
        return true;
    }
    
    awakenedBehavior() {
        // 覺醒階段 - 完整攻擊模式
        
        // 如果正在變身，不執行任何行動
        if (this.isTransforming) return true;
        
        const player = this.findPlayer();
        if (!player) return false;
        
        const distance = Math.abs(player.x - this.x);
        
        // 選擇最佳攻擊
        const bestAttack = this.selectBestAttack(distance);
        
        if (bestAttack) {
            this.performAttack(bestAttack, player);
        } else {
            // 接近玩家
            this.moveTowardsPlayer(player);
        }
        
        // 隨機事件
        if (Math.random() < 0.1) {
            const event = randomSystem.generateEvent();
            this.handleRandomEvent(event);
        }
        
        return true;
    }
    
    berserkBehavior() {
        // 狂暴階段 - 瘋狂攻擊
        
        // 如果正在變身，不執行任何行動
        if (this.isTransforming) return true;
        
        const player = this.findPlayer();
        if (!player) return false;
        
        // 提升攻擊速度
        this.decisionInterval = 500;
        
        // 連續攻擊
        const attacks = ['bite', 'tongue', 'jump', 'barrage'];
        const availableAttacks = attacks.filter(a => this.canUseAttack(a));
        
        if (availableAttacks.length > 0) {
            const randomAttack = availableAttacks[
                Math.floor(Math.random() * availableAttacks.length)
            ];
            this.performAttack(randomAttack, player);
        }
        
        // 全屏彈幕
        if (this.canUseAttack('barrage')) {
            this.createBarrage();
        }
        
        return true;
    }
    
    selectBestAttack(distance) {
        // 根據距離和冷卻選擇最佳攻擊
        const availableAttacks = [];
        
        for (const [name, attack] of Object.entries(this.attacks)) {
            if (this.canUseAttack(name) && distance <= attack.range) {
                availableAttacks.push({
                    name,
                    score: attack.damage / (distance + 1) // 簡單的評分函數
                });
            }
        }
        
        if (availableAttacks.length === 0) return null;
        
        // 選擇得分最高的攻擊
        availableAttacks.sort((a, b) => b.score - a.score);
        return availableAttacks[0].name;
    }
    
    canUseAttack(attackName) {
        const attack = this.attacks[attackName];
        return Date.now() - attack.lastUsed > attack.cooldown;
    }
    
    performAttack(attackName, target) {
        const attack = this.attacks[attackName];
        attack.lastUsed = Date.now();
        
        switch(attackName) {
            case 'bite':
                this.bite(target);
                break;
            case 'tongue':
                this.tongueWhip(target);
                break;
            case 'jump':
                this.jumpAttack(target);
                break;
            case 'barrage':
                this.goldBarrage(target);
                break;
            case 'trap':
                this.createTrap();
                break;
        }
        
        this.aiState = 'attacking';
    }
    
    bite(target) {
        // 快速咬擊
        this.vx = (target.x - this.x) > 0 ? 300 : -300;
        
        // 創建咬擊特效
        this.game.addParticle(this.x + this.width/2, this.y, 'damage');
        
        // 檢查命中
        if (Math.abs(target.x - this.x) < 50) {
            target.takeDamage(this.attacks.bite.damage);
            this.game.shakeCamera(5, 0.2);
        }
    }
    
    tongueWhip(target) {
        // 舌頭波動攻擊
        const projectile = {
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            width: 150,
            height: 20,
            vx: (target.x - this.x) > 0 ? 400 : -400,
            vy: 0,
            damage: this.attacks.tongue.damage,
            owner: this,
            type: 'tongue',
            active: true,
            
            update(deltaTime) {
                this.x += this.vx * deltaTime;
                this.width = Math.sin(Date.now() * 0.01) * 50 + 100; // 波動效果
                
                if (this.x < 0 || this.x > 800) {
                    this.active = false;
                }
            },
            
            render(ctx) {
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            },
            
            onHit(entity) {
                entity.vx *= 0.5; // 減速效果
                this.active = false;
            }
        };
        
        this.game.addProjectile(projectile);
    }
    
    jumpAttack(target) {
        // 跳躍震地 (限制跳躍高度)
        if (this.grounded) {  // 只有在地面上才能跳躍
            this.vy = -400;  // 降低跳躍力度
            this.vx = Math.max(-200, Math.min(200, (target.x - this.x) * 0.3));  // 限制水平速度
        
        setTimeout(() => {
            // 落地震波
            if (this.grounded) {
                this.game.shakeCamera(15, 0.5);
                
                // 創建震波
                for (let i = -3; i <= 3; i++) {
                    if (i === 0) continue;
                    
                    const shockwave = {
                        x: this.x + this.width/2 + i * 50,
                        y: this.game.height - 60,
                        width: 30,
                        height: 40,
                        damage: this.attacks.jump.damage,
                        owner: this,
                        type: 'shockwave',
                        active: true,
                        life: 0.5,
                        
                        update(deltaTime) {
                            this.life -= deltaTime;
                            this.height = 40 * this.life * 2;
                            if (this.life <= 0) {
                                this.active = false;
                            }
                        },
                        
                        render(ctx) {
                            ctx.fillStyle = `rgba(139, 69, 19, ${this.life})`;
                            ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
                        },
                        
                        onHit(entity) {
                            // 震波效果
                        }
                    };
                    
                    this.game.addProjectile(shockwave);
                }
            }
        }, 500);
    }
    
    goldBarrage(target) {
        // 金幣彈幕
        const coinCount = 10 + this.phase * 5;
        
        for (let i = 0; i < coinCount; i++) {
            setTimeout(() => {
                const angle = (Math.PI / coinCount) * i;
                const speed = 200 + Math.random() * 100;
                
                const coin = {
                    x: this.x + this.width/2,
                    y: this.y,
                    width: 16,
                    height: 16,
                    vx: Math.cos(angle) * speed,
                    vy: -Math.sin(angle) * speed,
                    damage: this.attacks.barrage.damage,
                    owner: this,
                    type: 'coin',
                    active: true,
                    rotation: 0,
                    
                    update(deltaTime) {
                        this.x += this.vx * deltaTime;
                        this.y += this.vy * deltaTime;
                        this.vy += 500 * deltaTime; // 重力
                        this.rotation += 10 * deltaTime;
                        
                        if (this.y > 400) {
                            this.active = false;
                        }
                    },
                    
                    render(ctx) {
                        ctx.save();
                        ctx.translate(this.x + 8, this.y + 8);
                        ctx.rotate(this.rotation);
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(-8, -8, 16, 16);
                        ctx.fillStyle = '#FFA500';
                        ctx.fillRect(-4, -4, 8, 8);
                        ctx.restore();
                    },
                    
                    onHit(entity) {
                        this.active = false;
                        game.addParticle(this.x, this.y, 'gold');
                    }
                };
                
                this.game.addProjectile(coin);
            }, i * 50);
        }
    }
    
    createTrap() {
        // 創建假金幣陷阱
        const trap = {
            x: this.x + (Math.random() - 0.5) * 200,
            y: this.game.height - 80,
            width: 20,
            height: 20,
            damage: this.attacks.trap.damage,
            owner: this,
            type: 'trap',
            active: true,
            triggered: false,
            
            update(deltaTime) {
                // 陷阱邏輯
            },
            
            render(ctx) {
                if (!this.triggered) {
                    // 繪製假金幣
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            },
            
            onHit(entity) {
                if (!this.triggered && entity.type === 'player') {
                    this.triggered = true;
                    // 爆炸效果
                    for (let i = 0; i < 10; i++) {
                        game.addParticle(
                            this.x + Math.random() * 20,
                            this.y + Math.random() * 20,
                            'damage'
                        );
                    }
                    entity.takeDamage(this.damage);
                    this.active = false;
                }
            }
        };
        
        this.game.addProjectile(trap);
    }
    
    moveTowardsPlayer(player) {
        const dx = player.x - this.x;
        
        if (Math.abs(dx) > 50) {
            this.vx = dx > 0 ? this.speed : -this.speed;
            this.facing = dx > 0 ? 1 : -1;
            this.aiState = 'chasing';
        } else {
            this.vx = 0;
            this.aiState = 'idle';
        }
    }
    
    findPlayer() {
        return this.game.entities.find(e => e.type === 'player');
    }
    
    adjustStrategy(prediction) {
        // 根據預測調整策略
        if (prediction > 0) {
            // 玩家佔優，採取防禦策略
            this.decisionInterval *= 0.8;
            this.defense *= 1.2;
        } else {
            // Boss佔優，採取激進策略
            this.decisionInterval *= 1.2;
            this.damage *= 1.1;
        }
    }
    
    handleRandomEvent(event) {
        // 處理隨機事件
        switch(event.type) {
            case 'treasure':
                // Boss獲得增益
                this.health = Math.min(this.maxHealth, this.health + 50);
                break;
            case 'ambush':
                // 召喚小怪
                // this.summonMinions();
                break;
        }
    }
    
    updatePhysics(deltaTime) {
        // 重力 (增強重力以防止飛走)
        if (!this.grounded) {
            this.vy += 1500 * deltaTime;  // 增強重力
        }
        
        // 限制最大速度
        this.vy = Math.max(-600, Math.min(this.vy, 800));  // 限制垂直速度
        this.vx = Math.max(-400, Math.min(this.vx, 400));  // 限制水平速度
        
        // 速度衰減
        this.vx *= 0.95;
        
        // 更新位置
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // 地面檢測 (更嚴格的檢測)
        const groundY = this.game.height - 60;
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }
        
        // 防止Boss飛出屏幕頂部
        if (this.y < 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy) * 0.5;  // 反彈並減速
        }
        
        // 邊界檢測
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        } else if (this.x + this.width > this.game.width) {
            this.x = this.game.width - this.width;
            this.vx = 0;
        }
        
        // 摩擦力
        this.vx *= 0.9;
    }
    
    updateAnimation(deltaTime) {
        // 更新變身動畫
        if (this.isTransforming) {
            this.transformFrame += this.transformAnimationSpeed;
            console.log(`Boss: Transform progress frame ${Math.floor(this.transformFrame)}/9, state: ${this.state}`);
            
            if (this.transformFrame >= 9) {
                // 變身完成
                console.log('Boss: Transformation complete!');
                this.isTransforming = false;
                this.state = 'monster';
                this.transformFrame = 0;
                
                // 變身完成特效
                for (let i = 0; i < 30; i++) {
                    const angle = (Math.PI * 2 * i) / 30;
                    this.game.addParticle(
                        this.x + this.width/2 + Math.cos(angle) * 60,
                        this.y + this.height/2 + Math.sin(angle) * 60,
                        'gold'
                    );
                }
                
                // 恢復部分血量
                this.health = Math.min(this.health + 200, this.maxHealth);
            }
            return; // 變身中不更新其他動畫
        }
        
        // 一般動畫更新
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }
    
    updateCooldowns(deltaTime) {
        // 冷卻時間已在canUseAttack中處理
    }
    
    updateUI() {
        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById('bossHealth').style.width = healthPercent + '%';
    }
    
    render(ctx, game) {
        ctx.save();
        
        // 繪製調試資訊（在Boss上方）
        this.renderDebugInfo(ctx, game);
        
        // 翻轉圖像
        if (this.facing === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2 - this.width, 0);
        }
        
        // 根據狀態繪製
        if (this.state === 'chest') {
            // 繪製寶箱形態
            if (game.sprites.mimicChest) {
                ctx.drawImage(game.sprites.mimicChest, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width * 0.8, this.height * 0.6);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x + this.width * 0.35, this.y - 10, this.width * 0.1, 20);
            }
        } else if (this.state === 'monster') {
            // 繪製怪物形態
            if (game.sprites.mimicMonster) {
                ctx.drawImage(game.sprites.mimicMonster, this.x, this.y, this.width, this.height);
            } else {
                // 身體
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width, this.height * 0.7);
                
                // 眼睛 (紅色發光)
                ctx.fillStyle = '#FF0000';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FF0000';
                ctx.fillRect(this.x + 20, this.y + 20, 10, 10);
                ctx.fillRect(this.x + this.width - 30, this.y + 20, 10, 10);
                ctx.shadowBlur = 0;
                
                // 牙齒
                ctx.fillStyle = '#FFFFFF';
                const teethCount = 8;
                const teethWidth = this.width / teethCount;
                for (let i = 0; i < teethCount; i++) {
                    const offset = Math.sin(this.animationFrame + i) * 5;
                    ctx.fillRect(
                        this.x + i * teethWidth + 2,
                        this.y + this.height * 0.5 + offset,
                        teethWidth - 4,
                        15
                    );
                }
                
                // 舌頭
                if (this.aiState === 'attacking') {
                    ctx.fillStyle = '#FF69B4';
                    const tongueLength = 50 + Math.sin(this.animationFrame * 2) * 20;
                    ctx.fillRect(
                        this.x + this.width / 2 - 10,
                        this.y + this.height * 0.6,
                        20,
                        tongueLength
                    );
                }
            }
        } else if (this.state === 'transforming' && this.isTransforming) {
            // 變身動畫
            const frame = Math.floor(this.transformFrame);
            console.log('Boss rendering: Transform frame:', frame, 'Sprites loaded:', !!game.sprites.transformFrames, 'State:', this.state, 'isTransforming:', this.isTransforming);
            
            if (game.sprites.transformFrames && game.sprites.transformFrames[frame]) {
                // 使用變身動畫圖片
                const transformSprite = game.sprites.transformFrames[frame];
                ctx.drawImage(
                    transformSprite,
                    this.x - this.width/4,
                    this.y - this.height/4,
                    this.width * 1.5,
                    this.height * 1.5
                );
            } else {
                // 備用變身特效 - 顯示當前幀數
                const t = Math.sin(this.transformFrame * 0.5) * 0.5 + 0.5;
                ctx.globalAlpha = t;
                
                // 閃爍效果與大小變化
                ctx.fillStyle = '#FFD700';
                const size = 1 + (this.transformFrame / 9) * 0.5;
                ctx.fillRect(
                    this.x - this.width * (size - 1) / 2, 
                    this.y - this.height * (size - 1) / 2, 
                    this.width * size, 
                    this.height * size
                );
                
                // 顯示進度
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '20px monospace';
                ctx.fillText(`變身中 ${Math.floor((this.transformFrame / 9) * 100)}%`, this.x, this.y - 30);
            }
        }
        
        // 繪製血條（除了偽裝狀態）
        if (this.state !== 'chest') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(this.x, this.y - 20, this.width, 10);
            
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.3 ? '#FF0000' : '#8B008B';
            ctx.fillRect(this.x, this.y - 20, this.width * healthPercent, 10);
        }
        
        ctx.restore();
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        const healthPercent = this.health / this.maxHealth;
        console.log(`Boss damaged: HP ${Math.floor(healthPercent * 100)}% (${this.health}/${this.maxHealth}), Phase: ${this.phase}, State: ${this.state}`);
        
        // 傷害數字
        this.game.addParticle(this.x + this.width/2, this.y, 'damage');
        
        // 立即更新血條
        this.updateUI();
        
        // 受擊反應
        if (this.state === 'chest' && this.health < this.maxHealth * 0.9) {
            // 被攻擊後顯形但不跳過變身
            this.state = 'monster';
            // 不要直接設定 phase = 2，讓 shouldChangePhase 來控制
        }
        
        if (this.health <= 0) {
            this.onDeath();
        }
    }
    
    onDeath() {
        // Boss死亡
        this.game.gameOver = true;
        
        // 掉落獎勵
        const loot = randomSystem.generateLoot(10, 2);
        console.log('Boss defeated! Loot:', loot);
        
        // 爆炸特效
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    'gold'
                );
            }, i * 20);
        }
        
        // 顯示勝利訊息
        this.game.score += 1000;
    }
    
    onCollision(other) {
        // 碰撞處理
        if (other.type === 'player' && this.state === 'monster') {
            other.takeDamage(this.damage);
        }
    }
    
    renderDebugInfo(ctx, game) {
        // 設定文字樣式
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        const x = this.x;
        const y = this.y - 60;
        const healthPercent = Math.floor((this.health / this.maxHealth) * 100);
        
        // 背景板
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 50, y - 60, 200, 80);
        
        // 顯示資訊
        ctx.fillStyle = '#00FF00';
        
        // 第一行：階段和狀態
        ctx.strokeText(`Phase: ${this.phase} | State: ${this.state}`, x - 40, y - 40);
        ctx.fillText(`Phase: ${this.phase} | State: ${this.state}`, x - 40, y - 40);
        
        // 第二行：血量
        ctx.strokeText(`HP: ${healthPercent}% (${this.health}/${this.maxHealth})`, x - 40, y - 25);
        ctx.fillText(`HP: ${healthPercent}% (${this.health}/${this.maxHealth})`, x - 40, y - 25);
        
        // 第三行：變身狀態
        if (this.isTransforming) {
            ctx.fillStyle = '#FFD700';
            const frame = Math.floor(this.transformFrame);
            const progress = Math.floor((frame / 9) * 100);
            ctx.strokeText(`TRANSFORMING: Frame ${frame}/9 (${progress}%)`, x - 40, y - 10);
            ctx.fillText(`TRANSFORMING: Frame ${frame}/9 (${progress}%)`, x - 40, y - 10);
        }
        
        // 第四行：圖片載入狀態
        ctx.fillStyle = '#FFA500';
        const framesLoaded = game.sprites.transformFrames ? game.sprites.transformFrames.filter(f => f).length : 0;
        ctx.strokeText(`Sprites: ${framesLoaded}/9 loaded`, x - 40, y + 5);
        ctx.fillText(`Sprites: ${framesLoaded}/9 loaded`, x - 40, y + 5);
    }
}