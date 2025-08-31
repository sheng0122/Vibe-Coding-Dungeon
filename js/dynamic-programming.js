// 動態規劃系統 - 智慧難度調節與資源分配
class DynamicProgrammingSystem {
    constructor() {
        // 難度調節參數
        this.difficultyState = {
            playerSkill: 5,      // 玩家技能等級 (1-10)
            currentDifficulty: 5, // 當前難度 (1-10)
            targetFlow: 7,        // 目標心流狀態值
            history: []           // 歷史記錄
        };
        
        // DP表格快取
        this.dpCache = new Map();
        
        // 資源分配狀態
        this.resourceState = {
            totalPoints: 100,
            allocation: {
                health: 0,
                damage: 0,
                speed: 0,
                defense: 0
            }
        };
        
        // 效能監控
        this.lastDPTime = 0;
    }
    
    // 自適應難度調節 - 使用動態規劃
    adaptiveDifficulty(playerPerformance) {
        const startTime = performance.now();
        
        // 狀態定義: [時間步, 玩家技能, 難度等級]
        const key = `${playerPerformance.deaths}_${playerPerformance.hits}_${playerPerformance.time}`;
        
        if (this.dpCache.has(key)) {
            return this.dpCache.get(key);
        }
        
        // 計算最佳難度調整
        const dp = this.calculateOptimalDifficulty(playerPerformance);
        
        // 快取結果
        this.dpCache.set(key, dp);
        
        // 更新效能指標
        this.lastDPTime = performance.now() - startTime;
        document.getElementById('dpTime').textContent = this.lastDPTime.toFixed(2);
        
        return dp;
    }
    
    calculateOptimalDifficulty(performance) {
        const { deaths, hits, dodges, time, combo } = performance;
        
        // 計算玩家技能評分
        const skillScore = this.evaluatePlayerSkill(performance);
        
        // 使用DP找出最佳難度曲線
        const states = 10; // 難度等級數
        const dp = Array(states + 1).fill(0);
        const path = Array(states + 1).fill(-1);
        
        // 基礎案例
        dp[0] = 0;
        
        // 填充DP表
        for (let i = 1; i <= states; i++) {
            let maxFlow = -Infinity;
            let bestPrev = -1;
            
            for (let j = Math.max(0, i - 2); j < i; j++) {
                // 計算從難度j轉移到i的心流值
                const flow = this.calculateFlowScore(j, i, skillScore);
                const totalFlow = dp[j] + flow;
                
                if (totalFlow > maxFlow) {
                    maxFlow = totalFlow;
                    bestPrev = j;
                }
            }
            
            dp[i] = maxFlow;
            path[i] = bestPrev;
        }
        
        // 找出最佳難度
        let optimalDifficulty = 0;
        let maxScore = -Infinity;
        
        for (let i = 1; i <= states; i++) {
            if (dp[i] > maxScore) {
                maxScore = dp[i];
                optimalDifficulty = i;
            }
        }
        
        // 更新難度係數
        const difficultyCoef = optimalDifficulty / 5.0;
        document.getElementById('diffCoef').textContent = difficultyCoef.toFixed(2);
        
        return {
            difficulty: optimalDifficulty,
            flowScore: maxScore,
            multiplier: difficultyCoef
        };
    }
    
    evaluatePlayerSkill(performance) {
        // 多維度評估玩家技能
        const weights = {
            accuracy: 0.3,
            survival: 0.3,
            combo: 0.2,
            speed: 0.2
        };
        
        const accuracy = performance.hits / (performance.hits + performance.misses + 1);
        const survival = 1 / (performance.deaths + 1);
        const comboScore = Math.min(performance.combo / 10, 1);
        const speedScore = Math.min(performance.time / 300, 1); // 5分鐘為基準
        
        return accuracy * weights.accuracy +
               survival * weights.survival +
               comboScore * weights.combo +
               speedScore * weights.speed;
    }
    
    calculateFlowScore(fromDiff, toDiff, playerSkill) {
        // 心流理論: 挑戰與技能的平衡
        const challenge = toDiff / 10;
        const skill = playerSkill;
        
        // 最佳心流在挑戰略高於技能時
        const flowRatio = challenge / (skill + 0.1);
        
        if (flowRatio < 0.5) {
            // 太簡單 - 無聊
            return 2 * flowRatio;
        } else if (flowRatio <= 1.5) {
            // 最佳心流區間
            return 1 - Math.abs(1 - flowRatio);
        } else {
            // 太困難 - 焦慮
            return Math.max(0, 2 - flowRatio);
        }
    }
    
    // 背包問題 - 裝備選擇優化
    knapsackEquipment(items, capacity) {
        const n = items.length;
        const dp = Array(n + 1).fill(null).map(() => 
            Array(capacity + 1).fill(0)
        );
        
        // 填充DP表
        for (let i = 1; i <= n; i++) {
            for (let w = 1; w <= capacity; w++) {
                if (items[i - 1].weight <= w) {
                    dp[i][w] = Math.max(
                        dp[i - 1][w],
                        dp[i - 1][w - items[i - 1].weight] + items[i - 1].value
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }
        
        // 回溯找出選中的物品
        const selected = [];
        let w = capacity;
        for (let i = n; i > 0 && w > 0; i--) {
            if (dp[i][w] !== dp[i - 1][w]) {
                selected.push(items[i - 1]);
                w -= items[i - 1].weight;
            }
        }
        
        return {
            maxValue: dp[n][capacity],
            items: selected
        };
    }
    
    // 最短路徑 - 戰鬥策略優化
    optimalCombatPath(states, transitions) {
        const n = states.length;
        const dp = Array(n).fill(Infinity);
        const path = Array(n).fill(-1);
        
        dp[0] = 0; // 起始狀態
        
        // Bellman-Ford變體
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < transitions.length; j++) {
                const { from, to, cost } = transitions[j];
                if (dp[from] + cost < dp[to]) {
                    dp[to] = dp[from] + cost;
                    path[to] = from;
                }
            }
        }
        
        // 重建路徑
        const optimalPath = [];
        let current = n - 1;
        while (current !== -1) {
            optimalPath.unshift(states[current]);
            current = path[current];
        }
        
        return {
            minCost: dp[n - 1],
            path: optimalPath
        };
    }
    
    // 技能點分配優化
    optimizeSkillAllocation(totalPoints, skills) {
        const n = skills.length;
        const maxPerSkill = Math.floor(totalPoints / 2); // 每個技能最多分配一半點數
        
        // 3D DP: [技能索引][剩餘點數][最後分配的點數]
        const dp = Array(n + 1).fill(null).map(() =>
            Array(totalPoints + 1).fill(-Infinity)
        );
        
        dp[0][totalPoints] = 0;
        
        for (let i = 0; i < n; i++) {
            for (let remain = 0; remain <= totalPoints; remain++) {
                if (dp[i][remain] === -Infinity) continue;
                
                // 嘗試分配不同點數給當前技能
                for (let allocate = 0; allocate <= Math.min(remain, maxPerSkill); allocate++) {
                    const value = this.calculateSkillValue(skills[i], allocate);
                    const newRemain = remain - allocate;
                    
                    dp[i + 1][newRemain] = Math.max(
                        dp[i + 1][newRemain],
                        dp[i][remain] + value
                    );
                }
            }
        }
        
        // 找出最優解
        let maxValue = -Infinity;
        let optimalRemaining = 0;
        
        for (let remain = 0; remain <= totalPoints; remain++) {
            if (dp[n][remain] > maxValue) {
                maxValue = dp[n][remain];
                optimalRemaining = remain;
            }
        }
        
        return {
            maxValue,
            remainingPoints: optimalRemaining,
            efficiency: maxValue / totalPoints
        };
    }
    
    calculateSkillValue(skill, points) {
        // 遞減邊際效用
        const base = skill.baseValue || 1;
        const scaling = skill.scaling || 0.8;
        
        return base * points * Math.pow(scaling, points / 10);
    }
    
    // 預測玩家行為 - Minimax with Alpha-Beta剪枝
    predictPlayerAction(gameState, depth = 3) {
        return this.minimax(gameState, depth, -Infinity, Infinity, true);
    }
    
    minimax(state, depth, alpha, beta, maximizingPlayer) {
        // 終止條件
        if (depth === 0 || this.isTerminalState(state)) {
            return this.evaluateState(state);
        }
        
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            const moves = this.getPossibleMoves(state, 'player');
            
            for (const move of moves) {
                const newState = this.applyMove(state, move);
                const eval = this.minimax(newState, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                
                if (beta <= alpha) {
                    break; // Beta剪枝
                }
            }
            
            return maxEval;
        } else {
            let minEval = Infinity;
            const moves = this.getPossibleMoves(state, 'boss');
            
            for (const move of moves) {
                const newState = this.applyMove(state, move);
                const eval = this.minimax(newState, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                
                if (beta <= alpha) {
                    break; // Alpha剪枝
                }
            }
            
            return minEval;
        }
    }
    
    isTerminalState(state) {
        return state.playerHP <= 0 || state.bossHP <= 0;
    }
    
    evaluateState(state) {
        // 啟發式評估函數
        const playerAdvantage = state.playerHP - state.bossHP;
        const positionBonus = state.playerPosition === 'favorable' ? 10 : 0;
        const comboBonus = state.combo * 5;
        
        return playerAdvantage + positionBonus + comboBonus;
    }
    
    getPossibleMoves(state, actor) {
        if (actor === 'player') {
            return ['attack', 'dodge', 'block', 'special'];
        } else {
            return ['bite', 'tongue', 'jump', 'barrage'];
        }
    }
    
    applyMove(state, move) {
        // 創建新狀態副本並應用移動
        const newState = JSON.parse(JSON.stringify(state));
        
        // 簡化的移動效果
        switch(move) {
            case 'attack':
                newState.bossHP -= 10;
                break;
            case 'bite':
                newState.playerHP -= 15;
                break;
            // ... 其他移動
        }
        
        return newState;
    }
    
    // 清理快取（防止記憶體洩漏）
    clearCache() {
        if (this.dpCache.size > 1000) {
            const entriesToDelete = this.dpCache.size - 500;
            const keys = Array.from(this.dpCache.keys());
            for (let i = 0; i < entriesToDelete; i++) {
                this.dpCache.delete(keys[i]);
            }
        }
    }
}

// 導出全域實例
const dpSystem = new DynamicProgrammingSystem();