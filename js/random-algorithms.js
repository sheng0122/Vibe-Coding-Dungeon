// 隨機算法系統 - 程序化生成與隨機事件
class RandomAlgorithmSystem {
    constructor() {
        // Mersenne Twister 偽隨機數生成器
        this.mt = new MersenneTwister();
        this.seed = Date.now();
        this.mt.init_genrand(this.seed);
        
        // Perlin Noise 生成器
        this.perlin = new PerlinNoise(this.seed);
        
        // 戰利品表
        this.lootTable = this.initializeLootTable();
        
        // 保底機制
        this.pityCounter = {
            rare: 0,
            epic: 0,
            legendary: 0
        };
        
        // 馬可夫鏈事件系統
        this.eventChain = this.initializeEventChain();
        this.currentEvent = 'idle';
        
        // 更新種子顯示
        document.getElementById('seed').textContent = this.seed;
    }
    
    // 程序化關卡生成
    generateLevel(width, height, difficulty) {
        const level = {
            terrain: [],
            enemies: [],
            items: [],
            traps: []
        };
        
        // 使用Perlin Noise生成地形
        for (let x = 0; x < width; x++) {
            const heightValue = this.perlin.noise(x * 0.1, 0) * height * 0.5 + height * 0.5;
            level.terrain.push({
                x: x,
                height: Math.floor(heightValue),
                type: this.getTerrainType(heightValue / height)
            });
        }
        
        // Wave Function Collapse 生成房間佈局
        const rooms = this.generateRoomsWFC(width, height, difficulty);
        
        // 放置敵人和物品
        rooms.forEach(room => {
            // 使用泊松圓盤採樣避免重疊
            const positions = this.poissonDiskSampling(room, 30);
            
            positions.forEach(pos => {
                const rand = this.mt.genrand_real1();
                if (rand < 0.3 * difficulty) {
                    level.enemies.push(this.generateEnemy(pos, difficulty));
                } else if (rand < 0.5) {
                    level.items.push(this.generateItem(pos));
                } else if (rand < 0.6) {
                    level.traps.push(this.generateTrap(pos, difficulty));
                }
            });
        });
        
        // 蒙特卡羅評估難度
        const evaluatedDifficulty = this.monteCarloEvaluate(level);
        
        return {
            ...level,
            difficulty: evaluatedDifficulty,
            seed: this.seed
        };
    }
    
    // Wave Function Collapse 算法
    generateRoomsWFC(width, height, difficulty) {
        const gridSize = 10;
        const gridWidth = Math.floor(width / gridSize);
        const gridHeight = Math.floor(height / gridSize);
        
        // 定義瓦片類型和規則
        const tiles = [
            { type: 'empty', connections: [true, true, true, true] },
            { type: 'room', connections: [true, false, true, false] },
            { type: 'corridor', connections: [true, true, false, false] },
            { type: 'treasure', connections: [false, true, false, true] }
        ];
        
        const grid = Array(gridHeight).fill(null).map(() => 
            Array(gridWidth).fill(null).map(() => [...tiles])
        );
        
        // WFC主循環
        while (true) {
            // 找出熵最低的格子
            let minEntropy = Infinity;
            let minCell = null;
            
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    if (grid[y][x].length > 1 && grid[y][x].length < minEntropy) {
                        minEntropy = grid[y][x].length;
                        minCell = { x, y };
                    }
                }
            }
            
            if (!minCell) break; // 所有格子都確定了
            
            // 隨機選擇一個可能的瓦片
            const possibleTiles = grid[minCell.y][minCell.x];
            const chosen = possibleTiles[Math.floor(this.mt.genrand_real1() * possibleTiles.length)];
            grid[minCell.y][minCell.x] = [chosen];
            
            // 傳播約束
            this.propagateConstraints(grid, minCell.x, minCell.y);
        }
        
        // 轉換為房間列表
        const rooms = [];
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                if (grid[y][x][0].type === 'room' || grid[y][x][0].type === 'treasure') {
                    rooms.push({
                        x: x * gridSize,
                        y: y * gridSize,
                        width: gridSize,
                        height: gridSize,
                        type: grid[y][x][0].type
                    });
                }
            }
        }
        
        return rooms;
    }
    
    propagateConstraints(grid, x, y) {
        const queue = [{ x, y }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // 檢查四個方向
            const directions = [
                { dx: 0, dy: -1 }, // 上
                { dx: 1, dy: 0 },  // 右
                { dx: 0, dy: 1 },  // 下
                { dx: -1, dy: 0 }  // 左
            ];
            
            directions.forEach((dir, index) => {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
                    // 過濾不兼容的瓦片
                    const compatible = grid[ny][nx].filter(tile => {
                        // 檢查連接規則
                        return this.tilesCompatible(grid[current.y][current.x][0], tile, index);
                    });
                    
                    if (compatible.length < grid[ny][nx].length) {
                        grid[ny][nx] = compatible;
                        queue.push({ x: nx, y: ny });
                    }
                }
            });
        }
    }
    
    tilesCompatible(tile1, tile2, direction) {
        // 簡化的兼容性檢查
        const opposite = (direction + 2) % 4;
        return tile1.connections[direction] === tile2.connections[opposite];
    }
    
    // 泊松圓盤採樣
    poissonDiskSampling(area, minDistance) {
        const points = [];
        const active = [];
        const cellSize = minDistance / Math.sqrt(2);
        const grid = {};
        
        // 添加初始點
        const firstPoint = {
            x: area.x + this.mt.genrand_real1() * area.width,
            y: area.y + this.mt.genrand_real1() * area.height
        };
        points.push(firstPoint);
        active.push(firstPoint);
        
        const gridX = Math.floor(firstPoint.x / cellSize);
        const gridY = Math.floor(firstPoint.y / cellSize);
        grid[`${gridX},${gridY}`] = firstPoint;
        
        while (active.length > 0) {
            const randomIndex = Math.floor(this.mt.genrand_real1() * active.length);
            const point = active[randomIndex];
            
            let found = false;
            for (let i = 0; i < 30; i++) {
                const angle = this.mt.genrand_real1() * Math.PI * 2;
                const distance = minDistance + this.mt.genrand_real1() * minDistance;
                
                const newPoint = {
                    x: point.x + Math.cos(angle) * distance,
                    y: point.y + Math.sin(angle) * distance
                };
                
                if (this.isValidPoint(newPoint, area, points, minDistance, grid, cellSize)) {
                    points.push(newPoint);
                    active.push(newPoint);
                    
                    const newGridX = Math.floor(newPoint.x / cellSize);
                    const newGridY = Math.floor(newPoint.y / cellSize);
                    grid[`${newGridX},${newGridY}`] = newPoint;
                    
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                active.splice(randomIndex, 1);
            }
        }
        
        return points;
    }
    
    isValidPoint(point, area, points, minDistance, grid, cellSize) {
        // 檢查是否在區域內
        if (point.x < area.x || point.x > area.x + area.width ||
            point.y < area.y || point.y > area.y + area.height) {
            return false;
        }
        
        // 檢查與其他點的距離
        const gridX = Math.floor(point.x / cellSize);
        const gridY = Math.floor(point.y / cellSize);
        
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                const neighbor = grid[`${gridX + dx},${gridY + dy}`];
                if (neighbor) {
                    const dist = Math.sqrt(
                        Math.pow(point.x - neighbor.x, 2) +
                        Math.pow(point.y - neighbor.y, 2)
                    );
                    if (dist < minDistance) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // 戰利品掉落系統
    generateLoot(enemyLevel, playerLuck) {
        // 加權隨機選擇
        const roll = this.mt.genrand_real1();
        let adjustedRoll = roll * (1 + playerLuck * 0.1);
        
        // 保底機制
        this.pityCounter.rare++;
        this.pityCounter.epic++;
        this.pityCounter.legendary++;
        
        let rarity = 'common';
        
        if (this.pityCounter.legendary >= 100 || adjustedRoll > 0.99) {
            rarity = 'legendary';
            this.pityCounter.legendary = 0;
        } else if (this.pityCounter.epic >= 30 || adjustedRoll > 0.95) {
            rarity = 'epic';
            this.pityCounter.epic = 0;
        } else if (this.pityCounter.rare >= 10 || adjustedRoll > 0.85) {
            rarity = 'rare';
            this.pityCounter.rare = 0;
        } else if (adjustedRoll > 0.5) {
            rarity = 'uncommon';
        }
        
        // 從對應稀有度的戰利品表中選擇
        const items = this.lootTable[rarity];
        const item = items[Math.floor(this.mt.genrand_real1() * items.length)];
        
        // 動態調整屬性
        const levelMultiplier = 1 + (enemyLevel - 1) * 0.1;
        const finalItem = {
            ...item,
            value: Math.floor(item.value * levelMultiplier),
            stats: this.rollItemStats(item.baseStats, levelMultiplier)
        };
        
        return finalItem;
    }
    
    rollItemStats(baseStats, multiplier) {
        const stats = {};
        for (const [stat, base] of Object.entries(baseStats)) {
            // 高斯分布隨機
            const variance = this.gaussianRandom() * 0.2 + 1;
            stats[stat] = Math.floor(base * multiplier * variance);
        }
        return stats;
    }
    
    // 馬可夫鏈事件系統
    generateEvent() {
        const transitions = this.eventChain[this.currentEvent];
        let roll = this.mt.genrand_real1();
        
        for (const [nextEvent, probability] of Object.entries(transitions)) {
            roll -= probability;
            if (roll <= 0) {
                this.currentEvent = nextEvent;
                return this.createEventData(nextEvent);
            }
        }
        
        return this.createEventData('idle');
    }
    
    createEventData(eventType) {
        switch(eventType) {
            case 'treasure':
                return {
                    type: 'treasure',
                    reward: this.generateLoot(5, 1),
                    message: '你發現了一個寶箱！'
                };
            case 'ambush':
                return {
                    type: 'ambush',
                    enemies: this.generateEnemyWave(3),
                    message: '你被埋伏了！'
                };
            case 'merchant':
                return {
                    type: 'merchant',
                    items: this.generateMerchantInventory(),
                    message: '一個神秘商人出現了'
                };
            case 'shrine':
                return {
                    type: 'shrine',
                    buff: this.generateRandomBuff(),
                    message: '你發現了一個古老的神壇'
                };
            default:
                return {
                    type: 'idle',
                    message: '周圍很安靜...'
                };
        }
    }
    
    // 蒙特卡羅方法評估關卡難度
    monteCarloEvaluate(level, simulations = 100) {
        let totalScore = 0;
        
        for (let i = 0; i < simulations; i++) {
            const result = this.simulateLevel(level);
            totalScore += result.score;
        }
        
        const averageScore = totalScore / simulations;
        
        // 將分數映射到難度等級
        if (averageScore < 30) return 'Easy';
        if (averageScore < 60) return 'Normal';
        if (averageScore < 80) return 'Hard';
        return 'Extreme';
    }
    
    simulateLevel(level) {
        let playerHP = 100;
        let score = 0;
        
        // 模擬玩家通過關卡
        level.enemies.forEach(enemy => {
            const combatResult = this.mt.genrand_real1();
            if (combatResult < 0.3) {
                playerHP -= enemy.damage;
            }
            score += enemy.difficulty * 10;
        });
        
        level.traps.forEach(trap => {
            const avoidChance = this.mt.genrand_real1();
            if (avoidChance < 0.4) {
                playerHP -= trap.damage;
            }
            score += trap.difficulty * 5;
        });
        
        return {
            score,
            survived: playerHP > 0,
            finalHP: Math.max(0, playerHP)
        };
    }
    
    // 輔助函數
    gaussianRandom() {
        let u = 0, v = 0;
        while(u === 0) u = this.mt.genrand_real1();
        while(v === 0) v = this.mt.genrand_real1();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    
    getTerrainType(height) {
        if (height < 0.3) return 'pit';
        if (height < 0.5) return 'ground';
        if (height < 0.7) return 'platform';
        return 'wall';
    }
    
    generateEnemy(pos, difficulty) {
        return {
            x: pos.x,
            y: pos.y,
            type: ['slime', 'skeleton', 'goblin'][Math.floor(this.mt.genrand_real1() * 3)],
            health: 50 * difficulty,
            damage: 10 * difficulty,
            difficulty: difficulty
        };
    }
    
    generateItem(pos) {
        return {
            x: pos.x,
            y: pos.y,
            type: ['potion', 'coin', 'key'][Math.floor(this.mt.genrand_real1() * 3)]
        };
    }
    
    generateTrap(pos, difficulty) {
        return {
            x: pos.x,
            y: pos.y,
            type: ['spike', 'arrow', 'flame'][Math.floor(this.mt.genrand_real1() * 3)],
            damage: 15 * difficulty,
            difficulty: difficulty
        };
    }
    
    generateEnemyWave(count) {
        const enemies = [];
        for (let i = 0; i < count; i++) {
            enemies.push({
                type: ['slime', 'skeleton', 'goblin'][Math.floor(this.mt.genrand_real1() * 3)],
                level: Math.floor(this.mt.genrand_real1() * 5) + 1
            });
        }
        return enemies;
    }
    
    generateMerchantInventory() {
        const inventory = [];
        const itemCount = Math.floor(this.mt.genrand_real1() * 3) + 3;
        
        for (let i = 0; i < itemCount; i++) {
            inventory.push(this.generateLoot(5, 0));
        }
        
        return inventory;
    }
    
    generateRandomBuff() {
        const buffs = [
            { type: 'health', value: 20 },
            { type: 'damage', value: 5 },
            { type: 'speed', value: 10 },
            { type: 'defense', value: 3 }
        ];
        
        return buffs[Math.floor(this.mt.genrand_real1() * buffs.length)];
    }
    
    initializeLootTable() {
        return {
            common: [
                { name: '小型治療藥水', value: 10, baseStats: { healing: 20 } },
                { name: '生鏽的短劍', value: 15, baseStats: { damage: 5 } }
            ],
            uncommon: [
                { name: '鐵劍', value: 50, baseStats: { damage: 10 } },
                { name: '皮甲', value: 45, baseStats: { defense: 8 } }
            ],
            rare: [
                { name: '魔法劍', value: 200, baseStats: { damage: 20, magic: 5 } },
                { name: '騎士盾', value: 180, baseStats: { defense: 15, block: 10 } }
            ],
            epic: [
                { name: '龍鱗甲', value: 500, baseStats: { defense: 30, fireResist: 20 } },
                { name: '雷霆之刃', value: 600, baseStats: { damage: 35, lightning: 15 } }
            ],
            legendary: [
                { name: '神聖之劍', value: 2000, baseStats: { damage: 50, holy: 30, healing: 10 } },
                { name: '不朽護甲', value: 1800, baseStats: { defense: 50, regen: 5 } }
            ]
        };
    }
    
    initializeEventChain() {
        return {
            idle: {
                idle: 0.5,
                treasure: 0.2,
                ambush: 0.2,
                merchant: 0.05,
                shrine: 0.05
            },
            treasure: {
                idle: 0.4,
                ambush: 0.4,
                treasure: 0.1,
                merchant: 0.05,
                shrine: 0.05
            },
            ambush: {
                idle: 0.6,
                treasure: 0.3,
                ambush: 0.05,
                shrine: 0.05
            },
            merchant: {
                idle: 0.7,
                treasure: 0.15,
                ambush: 0.1,
                shrine: 0.05
            },
            shrine: {
                idle: 0.5,
                treasure: 0.25,
                ambush: 0.2,
                merchant: 0.05
            }
        };
    }
}

// Mersenne Twister實現
class MersenneTwister {
    constructor() {
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 0x9908b0df;
        this.UPPER_MASK = 0x80000000;
        this.LOWER_MASK = 0x7fffffff;
        
        this.mt = new Array(this.N);
        this.mti = this.N + 1;
    }
    
    init_genrand(s) {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            const s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + 
                                 (s & 0x0000ffff) * 1812433253) + this.mti;
            this.mt[this.mti] >>>= 0;
        }
    }
    
    genrand_int32() {
        let y;
        const mag01 = [0x0, this.MATRIX_A];
        
        if (this.mti >= this.N) {
            let kk;
            
            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
            
            this.mti = 0;
        }
        
        y = this.mt[this.mti++];
        
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);
        
        return y >>> 0;
    }
    
    genrand_real1() {
        return this.genrand_int32() * (1.0 / 4294967295.0);
    }
}

// 簡化的Perlin Noise實現
class PerlinNoise {
    constructor(seed) {
        this.permutation = this.generatePermutation(seed);
    }
    
    generatePermutation(seed) {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        
        // 使用種子打亂
        const mt = new MersenneTwister();
        mt.init_genrand(seed);
        
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(mt.genrand_real1() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // 複製一份
        return p.concat(p);
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.permutation[X] + Y;
        const aa = this.permutation[a];
        const ab = this.permutation[a + 1];
        const b = this.permutation[X + 1] + Y;
        const ba = this.permutation[b];
        const bb = this.permutation[b + 1];
        
        return this.lerp(v,
            this.lerp(u,
                this.grad(this.permutation[aa], x, y),
                this.grad(this.permutation[ba], x - 1, y)
            ),
            this.lerp(u,
                this.grad(this.permutation[ab], x, y - 1),
                this.grad(this.permutation[bb], x - 1, y - 1)
            )
        );
    }
}

// 導出全域實例
const randomSystem = new RandomAlgorithmSystem();