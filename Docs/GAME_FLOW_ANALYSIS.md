# Vibe Coding Dungeon - 遊戲流程分析文檔

## 📋 目前遊戲流程

### 1. 初始載入 (Page Load)
```javascript
window.addEventListener('load', () => {
    createFireParticles();  // 創建火焰粒子效果
});
```

### 2. 開始遊戲 (Start Game)
```javascript
function startGame() {
    // 淡出開始畫面
    startScreen.classList.add('fadeOut');
    
    setTimeout(() => {
        startScreen.style.display = 'none';
        gameContainer.classList.add('active');
        
        // 初始化遊戲
        initializeGame();
        
        // 自動進入全螢幕（桌面版）
        if (!isMobile()) {
            document.documentElement.requestFullscreen();
        }
        
        // 顯示引導視窗
        setTimeout(() => {
            guideWindow.classList.add('show');
            if (game) game.paused = true;  // ⚠️ 問題點：遊戲暫停
        }, 500);
    }, 1000);
}
```

### 3. 初始化遊戲 (Initialize Game)
```javascript
function initializeGame() {
    // 清理舊的事件監聽器
    // 設定畫布尺寸
    canvas.width = 800;
    canvas.height = 400;
    
    // 創建遊戲引擎
    game = new GameEngine(canvas);
    game.paused = true;  // ⚠️ 問題點：預設暫停
    
    // 創建角色
    player = new Player(100, 200);
    boss = new MimicBoss(600, 200, game);
    
    // 延遲啟動遊戲循環
    setTimeout(() => {
        gameLoop();  // ⚠️ 問題點：即使暫停也啟動循環
    }, 100);
}
```

### 4. 關閉引導 (Close Guide)
```javascript
function closeGuide() {
    guideWindow.classList.remove('show');
    
    // 開場動畫
    player.x = -50;
    player.targetX = 100;
    boss.x = game.width + 50;
    boss.targetX = 600;
    
    setTimeout(() => {
        game.paused = false;  // 解除暫停
        showGameMessage('FIGHT!', 1000);
    }, 500);
}
```

### 5. 遊戲循環 (Game Loop)
```javascript
function gameLoop(currentTime) {
    if (game) {
        game.render();  // 總是渲染
        if (!game.paused && !game.gameOver) {
            game.update(deltaTime);  // 只在非暫停時更新
        }
    }
    animationId = requestAnimationFrame(gameLoop);
}
```

### 6. 遊戲結束 (Game Over)
```javascript
// 玩家死亡
if (this.health <= 0) {
    game.gameOver = true;
    showGameOverScreen(false);  // 顯示失敗畫面
}

// Boss死亡
if (this.health <= 0) {
    game.gameOver = true;
    game.victory = true;
    showGameOverScreen(true);  // 顯示勝利畫面
}
```

### 7. 重新開始 (Restart Game)
```javascript
function restartGame() {
    // 停止當前遊戲循環
    cancelAnimationFrame(animationId);
    
    // 清理遊戲狀態
    game.gameOver = false;
    game.paused = false;
    
    // 重新初始化
    initializeGame();  // ⚠️ 問題點：重新初始化但沒有引導流程
}
```

## 🔍 問題分析

### 主要問題
1. **初始暫停狀態混亂**
   - GameEngine constructor 設置 `paused = true`
   - 引導視窗顯示時又設置 `paused = true`
   - 可能造成重複暫停

2. **重新開始缺少引導流程**
   - restartGame 直接調用 initializeGame
   - 沒有經過 closeGuide 的入場動畫
   - 角色可能沒有正確初始化位置

3. **事件監聽器可能重複**
   - 鍵盤事件在 GameEngine 中綁定
   - 每次創建新 GameEngine 都會綁定
   - 可能造成多重響應

4. **遊戲狀態不一致**
   - game.paused 在多處被修改
   - 沒有統一的狀態管理

## 🚨 當前卡住的原因

最可能的原因是重新開始時：
1. 遊戲被設為暫停（paused = true）
2. 沒有觸發 closeGuide 來解除暫停
3. 角色沒有正確的入場動畫設置