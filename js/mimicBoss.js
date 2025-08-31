// Mimic Boss 類別
class MimicBoss {
    constructor(x, y, canvas, ctx) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.ctx = ctx;
        
        // 基礎屬性
        this.maxHealth = 500;
        this.health = this.maxHealth;
        this.defense = 20;
        this.speed = 2;
        this.attackRange = 100;
        this.detectionRange = 300;
        
        // 狀態
        this.state = 'disguised'; // disguised, awakening, idle, attacking, moving, hit, dying, dead
        this.phase = 1; // 1, 2, 3
        this.isAwakened = false;
        
        // 動畫相關
        this.currentAnimation = null;
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        this.animationTimer = 0;
        this.animations = {};
        
        // 方向與移動
        this.direction = 1; // 1 = 右, -1 = 左
        this.velocityX = 0;
        this.velocityY = 0;
        
        // 攻擊冷卻
        this.attackCooldown = 0;
        this.skills = {
            bite: { cooldown: 0, maxCooldown: 2 },
            tongueWhip: { cooldown: 0, maxCooldown: 3 },
            jump: { cooldown: 0, maxCooldown: 5 },
            goldSpray: { cooldown: 0, maxCooldown: 4 },
            rageCombo: { cooldown: 0, maxCooldown: 10 }
        };
        
        // 載入動畫
        this.loadAnimations();
    }
    
    // 載入動畫資源
    loadAnimations() {
        // 從資源載入器取得動畫幀
        this.animations = {
            idle: resourceLoader.getAnimationFrames('idle'),
            attack: resourceLoader.getAnimationFrames('attack'),
            transform: resourceLoader.getAnimationFrames('transform'),
            death: [] // 死亡動畫待加入
        };
        
        // 設定初始動畫
        this.setAnimation('idle');
    }
    
    // 設定當前動畫
    setAnimation(animationName) {
        if (this.currentAnimation !== animationName && this.animations[animationName]) {
            this.currentAnimation = animationName;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }
    
    // 更新動畫
    updateAnimation(deltaTime) {
        if (!this.currentAnimation || !this.animations[this.currentAnimation]) return;
        
        const frames = this.animations[this.currentAnimation];
        if (frames.length === 0) return;
        
        this.animationTimer += deltaTime;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            
            // 循環動畫
            if (this.animationFrame >= frames.length) {
                this.animationFrame = 0;
                
                // 某些動畫完成後切換狀態
                if (this.currentAnimation === 'transform') {
                    this.completeAwakening();
                } else if (this.currentAnimation === 'attack') {
                    this.state = 'idle';
                    this.setAnimation('idle');
                }
            }
        }
    }
    
    // 更新 Boss
    update(deltaTime, player) {
        // 更新動畫
        this.updateAnimation(deltaTime);
        
        // 更新冷卻時間
        this.updateCooldowns(deltaTime);
        
        // 檢查階段轉換
        this.checkPhaseTransition();
        
        // 根據狀態執行不同邏輯
        switch(this.state) {
            case 'disguised':
                this.updateDisguised(player);
                break;
            case 'awakening':
                this.updateAwakening();
                break;
            case 'idle':
                this.updateIdle(player);
                break;
            case 'moving':
                this.updateMoving(player);
                break;
            case 'attacking':
                this.updateAttacking(player);
                break;
            case 'hit':
                this.updateHit();
                break;
            case 'dying':
                this.updateDying();
                break;
        }
        
        // 更新位置
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
    
    // 偽裝狀態更新
    updateDisguised(player) {
        const distance = this.getDistanceToPlayer(player);
        if (distance < this.detectionRange) {
            this.awaken();
        }
    }
    
    // 覺醒
    awaken() {
        if (this.isAwakened) return;
        
        this.isAwakened = true;
        this.state = 'awakening';
        this.setAnimation('transform');
        console.log('Boss awakening!');
    }
    
    // 覺醒狀態更新
    updateAwakening() {
        // 動畫會自動播放，完成後會呼叫 completeAwakening
    }
    
    // 完成覺醒
    completeAwakening() {
        this.state = 'idle';
        this.setAnimation('idle');
        console.log('Boss awakened and ready for battle!');
    }
    
    // 待機狀態更新
    updateIdle(player) {
        const distance = this.getDistanceToPlayer(player);
        
        // 決定下一個行動
        if (distance <= this.attackRange && this.attackCooldown <= 0) {
            this.performAttack(player);
        } else if (distance <= this.detectionRange * 2) {
            this.state = 'moving';
        }
    }
    
    // 移動狀態更新
    updateMoving(player) {
        const distance = this.getDistanceToPlayer(player);
        const direction = this.getDirectionToPlayer(player);
        
        this.velocityX = direction.x * this.speed;
        this.direction = direction.x > 0 ? 1 : -1;
        
        if (distance <= this.attackRange && this.attackCooldown <= 0) {
            this.velocityX = 0;
            this.performAttack(player);
        } else if (distance > this.detectionRange * 2.5) {
            this.velocityX = 0;
            this.state = 'idle';
            this.setAnimation('idle');
        }
    }
    
    // 執行攻擊
    performAttack(player) {
        this.state = 'attacking';
        this.setAnimation('attack');
        this.attackCooldown = 2; // 2秒冷卻
        
        // 根據階段選擇攻擊類型
        const attackType = this.selectAttackType(player);
        this.executeAttack(attackType, player);
    }
    
    // 選擇攻擊類型
    selectAttackType(player) {
        const distance = this.getDistanceToPlayer(player);
        
        if (this.phase === 3) {
            // 第三階段特殊攻擊
            const rand = Math.random();
            if (rand < 0.3 && this.skills.rageCombo.cooldown <= 0) return 'rageCombo';
            if (rand < 0.6 && this.skills.goldSpray.cooldown <= 0) return 'goldSpray';
        }
        
        // 根據距離選擇攻擊
        if (distance < 50) {
            return Math.random() > 0.5 ? 'bite' : 'tongueWhip';
        } else if (distance < 150) {
            return 'jump';
        } else {
            return 'goldSpray';
        }
    }
    
    // 執行具體攻擊
    executeAttack(type, player) {
        console.log(`Boss executing ${type} attack!`);
        
        switch(type) {
            case 'bite':
                // 咬擊攻擊邏輯
                if (this.getDistanceToPlayer(player) < 60) {
                    player.takeDamage(30);
                }
                this.skills.bite.cooldown = this.skills.bite.maxCooldown;
                break;
                
            case 'tongueWhip':
                // 舌頭攻擊邏輯
                if (this.getDistanceToPlayer(player) < 100) {
                    player.takeDamage(25);
                    player.applySlow(0.5, 3);
                }
                this.skills.tongueWhip.cooldown = this.skills.tongueWhip.maxCooldown;
                break;
                
            case 'jump':
                // 跳躍攻擊邏輯
                this.velocityY = -10;
                setTimeout(() => {
                    if (this.getDistanceToPlayer(player) < 80) {
                        player.takeDamage(40);
                    }
                }, 500);
                this.skills.jump.cooldown = this.skills.jump.maxCooldown;
                break;
                
            case 'goldSpray':
                // 金幣噴射邏輯
                this.sprayGoldCoins(player);
                this.skills.goldSpray.cooldown = this.skills.goldSpray.maxCooldown;
                break;
                
            case 'rageCombo':
                // 狂暴連擊邏輯
                this.performRageCombo(player);
                this.skills.rageCombo.cooldown = this.skills.rageCombo.maxCooldown;
                break;
        }
    }
    
    // 攻擊狀態更新
    updateAttacking(player) {
        // 攻擊動畫播放中
    }
    
    // 受擊狀態更新
    updateHit() {
        // 受擊硬直
        setTimeout(() => {
            this.state = 'idle';
            this.setAnimation('idle');
        }, 500);
    }
    
    // 死亡狀態更新
    updateDying() {
        // 播放死亡動畫
        setTimeout(() => {
            this.state = 'dead';
            this.dropRewards();
        }, 2000);
    }
    
    // 更新冷卻時間
    updateCooldowns(deltaTime) {
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        
        for (let skill in this.skills) {
            this.skills[skill].cooldown = Math.max(0, this.skills[skill].cooldown - deltaTime);
        }
    }
    
    // 檢查階段轉換
    checkPhaseTransition() {
        if (!this.isAwakened || this.health <= 0) return;
        
        const healthPercent = this.health / this.maxHealth;
        let newPhase = 1;
        
        if (healthPercent <= 0.3) {
            newPhase = 3;
        } else if (healthPercent <= 0.6) {
            newPhase = 2;
        }
        
        if (newPhase !== this.phase) {
            this.phase = newPhase;
            this.onPhaseChange();
        }
    }
    
    // 階段改變
    onPhaseChange() {
        console.log(`Boss entering phase ${this.phase}!`);
        
        // 根據階段調整屬性
        if (this.phase === 2) {
            this.speed *= 1.2;
            this.attackRange *= 1.1;
        } else if (this.phase === 3) {
            this.speed *= 1.4;
            this.attackRange *= 1.2;
            // 狂暴模式
        }
    }
    
    // 受到傷害
    takeDamage(damage) {
        if (this.state === 'disguised' && !this.isAwakened) {
            this.awaken();
        }
        
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        
        console.log(`Boss took ${actualDamage} damage! Health: ${this.health}/${this.maxHealth}`);
        
        if (this.health <= 0) {
            this.die();
        } else if (this.state !== 'hit' && this.state !== 'dying') {
            this.state = 'hit';
        }
    }
    
    // 死亡
    die() {
        if (this.state === 'dead') return;
        
        this.state = 'dying';
        console.log('Boss defeated!');
    }
    
    // 掉落獎勵
    dropRewards() {
        console.log('Dropping rewards...');
        // 實作獎勵掉落邏輯
    }
    
    // 金幣噴射攻擊
    sprayGoldCoins(player) {
        console.log('Spraying gold coins!');
        // 實作金幣噴射邏輯
    }
    
    // 狂暴連擊
    performRageCombo(player) {
        console.log('Performing rage combo!');
        // 實作連擊邏輯
    }
    
    // 取得與玩家的距離
    getDistanceToPlayer(player) {
        if (!player) return Infinity;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 取得朝向玩家的方向
    getDirectionToPlayer(player) {
        if (!player) return { x: 0, y: 0 };
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return {
            x: distance > 0 ? dx / distance : 0,
            y: distance > 0 ? dy / distance : 0
        };
    }
    
    // 繪製 Boss
    draw() {
        if (!this.currentAnimation || !this.animations[this.currentAnimation]) return;
        
        const frames = this.animations[this.currentAnimation];
        if (frames.length === 0) return;
        
        const currentFrame = frames[this.animationFrame];
        if (!currentFrame) return;
        
        // 保存畫布狀態
        this.ctx.save();
        
        // 根據方向翻轉圖片
        if (this.direction === -1) {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                currentFrame,
                -this.x - currentFrame.width / 2,
                this.y - currentFrame.height / 2
            );
        } else {
            this.ctx.drawImage(
                currentFrame,
                this.x - currentFrame.width / 2,
                this.y - currentFrame.height / 2
            );
        }
        
        // 恢復畫布狀態
        this.ctx.restore();
        
        // 繪製血條
        this.drawHealthBar();
    }
    
    // 繪製血條
    drawHealthBar() {
        if (!this.isAwakened || this.state === 'disguised') return;
        
        const barWidth = 100;
        const barHeight = 10;
        const barX = this.x - barWidth / 2;
        const barY = this.y - 60;
        
        // 背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 血條
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.6 ? '#00ff00' : 
                           healthPercent > 0.3 ? '#ffff00' : '#ff0000';
        
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // 邊框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 階段指示
        if (this.phase > 1) {
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Phase ${this.phase}`, barX, barY - 5);
        }
    }
}