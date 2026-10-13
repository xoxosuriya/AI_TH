// =========================================================================
// AI Treasure Hunter: Royal Artifact Edition — Handcrafted Level Definitions
// 6 Distinctive Royal Vaults with Deterministic Grids & Coherent Architecture
// =========================================================================

export const levels = [
    // ---------------------------------------------------------------------
    // Level 1: Ruins Entrance (The Royal Ante-Chamber)
    // Size: 20 x 12 | Target: 80 pts | Time: 90s
    // ---------------------------------------------------------------------
    {
        number: 1,
        name: 'Ruins Entrance',
        subtitle: 'The Gilded Vestibule of the Fallen Citadel',
        width: 20,
        height: 12,
        targetScore: 80,
        timeLimit: 90,
        theme: 'stone',
        floorType: 'stone',
        wallType: 'brick',
        ambientColor: 'rgba(198, 161, 91, 0.06)',
        description: 'Breach the outer sanctuary. Wide stone halls and low obstacle density introduce the foundational pathfinding trial.',
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,0,1,1,0,1,0,1,1,1,0,1,0,1,0,0,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,1,1,0,0,1,0,1,0,1,0,0,0,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        treasures: [
            { x: 3,  y: 1, type: 'gold',     value: 25 },
            { x: 15, y: 1, type: 'gold',     value: 25 },
            { x: 2,  y: 3, type: 'gem',      value: 50 },
            { x: 9,  y: 5, type: 'artifact', value: 100 },
            { x: 17, y: 5, type: 'coin',     value: 10 },
            { x: 17, y: 8, type: 'coin',     value: 10 },
            { x: 4,  y: 9, type: 'gem',      value: 50 }
        ],
        playerSpawn: { x: 1, y: 1 },
        aiSpawns: [
            { x: 1,  y: 9 },
            { x: 15, y: 9 },
            { x: 18, y: 2 },
            { x: 9,  y: 9 }
        ],
        exit: { x: 18, y: 3 }
    },

    // ---------------------------------------------------------------------
    // Level 2: Forgotten Halls (The Ancient Royal Archives)
    // Size: 22 x 13 | Target: 120 pts | Time: 75s
    // ---------------------------------------------------------------------
    {
        number: 2,
        name: 'Forgotten Halls',
        subtitle: 'The Labyrinthine Gallery of Dynastic Tomes',
        width: 22,
        height: 13,
        targetScore: 120,
        timeLimit: 75,
        theme: 'sand',
        floorType: 'sand',
        wallType: 'stone',
        ambientColor: 'rgba(232, 213, 161, 0.08)',
        description: 'Branching corridors and dusty colonnades demand sophisticated multi-corridor route evaluation and competitor awareness.',
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,1],
            [1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        treasures: [
            { x: 3,  y: 1,  type: 'gold',     value: 25 },
            { x: 18, y: 1,  type: 'coin',     value: 10 },
            { x: 3,  y: 3,  type: 'gem',      value: 50 },
            { x: 9,  y: 4,  type: 'artifact', value: 100 },
            { x: 5,  y: 6,  type: 'gold',     value: 25 },
            { x: 17, y: 6,  type: 'coin',     value: 10 },
            { x: 7,  y: 8,  type: 'gem',      value: 50 },
            { x: 17, y: 8,  type: 'artifact', value: 100 },
            { x: 9,  y: 11, type: 'gold',     value: 25 }
        ],
        playerSpawn: { x: 1, y: 1 },
        aiSpawns: [
            { x: 1,  y: 11 },
            { x: 20, y: 11 },
            { x: 14, y: 3 },
            { x: 7,  y: 9 }
        ],
        exit: { x: 20, y: 1 }
    },

    // ---------------------------------------------------------------------
    // Level 3: Crystal Caverns (The Amethyst Scepter Crypt)
    // Size: 22 x 14 | Target: 160 pts | Time: 70s
    // ---------------------------------------------------------------------
    {
        number: 3,
        name: 'Crystal Caverns',
        subtitle: 'Subterranean Vault of Crystalline Veins',
        width: 22,
        height: 14,
        targetScore: 160,
        timeLimit: 70,
        theme: 'crystal',
        floorType: 'dirt',
        wallType: 'stone',
        ambientColor: 'rgba(77, 156, 119, 0.08)',
        description: 'Narrow serpentine passages and deep chasms. Distant rare gems spark aggressive utility contention between rival hunters.',
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1],
            [1,1,1,0,0,1,1,1,0,1,1,0,1,1,1,1,1,0,1,0,1,1],
            [1,0,0,0,0,0,0,1,0,1,0,0,1,0,0,0,0,0,1,0,0,1],
            [1,0,1,1,1,1,0,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,0,0,1,1,1,1,0,0,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        treasures: [
            { x: 2,  y: 1,  type: 'coin',     value: 10 },
            { x: 10, y: 1,  type: 'gold',     value: 25 },
            { x: 19, y: 1,  type: 'artifact', value: 100 },
            { x: 5,  y: 3,  type: 'gem',      value: 50 },
            { x: 14, y: 3,  type: 'gold',     value: 25 },
            { x: 2,  y: 5,  type: 'coin',     value: 10 },
            { x: 10, y: 7,  type: 'artifact', value: 100 },
            { x: 17, y: 7,  type: 'gem',      value: 50 },
            { x: 4,  y: 9,  type: 'gold',     value: 25 },
            { x: 18, y: 11, type: 'gem',      value: 50 },
            { x: 2,  y: 12, type: 'coin',     value: 10 }
        ],
        playerSpawn: { x: 1, y: 1 },
        aiSpawns: [
            { x: 20, y: 1 },
            { x: 1,  y: 12 },
            { x: 20, y: 12 },
            { x: 10, y: 5 }
        ],
        exit: { x: 13, y: 12 }
    },

    // ---------------------------------------------------------------------
    // Level 4: Iron Fortress (The Garrison of the Gilded Legion)
    // Size: 24 x 14 | Target: 220 pts | Time: 65s
    // ---------------------------------------------------------------------
    {
        number: 4,
        name: 'Iron Fortress',
        subtitle: 'Armored Citadel with Strategic Chokepoints',
        width: 24,
        height: 14,
        targetScore: 220,
        timeLimit: 65,
        theme: 'metal',
        floorType: 'metal',
        wallType: 'concrete',
        ambientColor: 'rgba(137, 129, 138, 0.08)',
        description: 'Impenetrable steel bulkheads and narrow gates. Rivals must exercise steering separation and dynamic A* rerouting.',
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,0,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
            [1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,1,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        treasures: [
            { x: 3,  y: 1,  type: 'gold',     value: 25 },
            { x: 13, y: 1,  type: 'coin',     value: 10 },
            { x: 21, y: 1,  type: 'artifact', value: 100 },
            { x: 3,  y: 3,  type: 'gem',      value: 50 },
            { x: 11, y: 3,  type: 'gold',     value: 25 },
            { x: 18, y: 3,  type: 'gem',      value: 50 },
            { x: 7,  y: 5,  type: 'artifact', value: 100 },
            { x: 15, y: 5,  type: 'coin',     value: 10 },
            { x: 3,  y: 7,  type: 'gold',     value: 25 },
            { x: 21, y: 7,  type: 'gem',      value: 50 },
            { x: 9,  y: 9,  type: 'coin',     value: 10 },
            { x: 13, y: 9,  type: 'artifact', value: 100 },
            { x: 4,  y: 11, type: 'gold',     value: 25 }
        ],
        playerSpawn: { x: 1, y: 1 },
        aiSpawns: [
            { x: 22, y: 1 },
            { x: 1,  y: 11 },
            { x: 22, y: 11 },
            { x: 11, y: 7 }
        ],
        exit: { x: 22, y: 12 }
    },

    // ---------------------------------------------------------------------
    // Level 5: Lost Temple (Sanctuary of the Sun Sovereign)
    // Size: 24 x 15 | Target: 280 pts | Time: 60s
    // ---------------------------------------------------------------------
    {
        number: 5,
        name: 'Lost Temple',
        subtitle: 'Overgrown Sanctum of Arcane Sun Relics',
        width: 24,
        height: 15,
        targetScore: 280,
        timeLimit: 60,
        theme: 'wood',
        floorType: 'wood',
        wallType: 'brick',
        ambientColor: 'rgba(40, 26, 56, 0.08)',
        description: 'Vast ceremonial chambers with multi-tiered corridors. High-value imperial relics ignite intense bidding wars among AI algorithms.',
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,0,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        treasures: [
            { x: 3,  y: 1,  type: 'gold',     value: 25 },
            { x: 12, y: 1,  type: 'artifact', value: 100 },
            { x: 20, y: 1,  type: 'gem',      value: 50 },
            { x: 3,  y: 3,  type: 'coin',     value: 10 },
            { x: 11, y: 3,  type: 'gem',      value: 50 },
            { x: 19, y: 3,  type: 'gold',     value: 25 },
            { x: 6,  y: 5,  type: 'artifact', value: 100 },
            { x: 16, y: 5,  type: 'artifact', value: 100 },
            { x: 3,  y: 7,  type: 'gold',     value: 25 },
            { x: 12, y: 7,  type: 'gem',      value: 50 },
            { x: 20, y: 7,  type: 'coin',     value: 10 },
            { x: 7,  y: 9,  type: 'gem',      value: 50 },
            { x: 16, y: 9,  type: 'gold',     value: 25 },
            { x: 3,  y: 11, type: 'coin',     value: 10 },
            { x: 12, y: 13, type: 'artifact', value: 100 }
        ],
        playerSpawn: { x: 1, y: 1 },
        aiSpawns: [
            { x: 22, y: 1 },
            { x: 1,  y: 13 },
            { x: 22, y: 13 },
            { x: 12, y: 5 }
        ],
        exit: { x: 22, y: 7 }
    },

    // ---------------------------------------------------------------------
    // Level 6: Treasure Vault (The Royal Sovereign Treasury)
    // Size: 26 x 15 | Target: 350 pts | Time: 55s
    // ---------------------------------------------------------------------
    {
        number: 6,
        name: 'Treasure Vault',
        subtitle: 'The Imperial Hoard of the First Emperor',
        width: 26,
        height: 15,
        targetScore: 350,
        timeLimit: 55,
        theme: 'vault',
        floorType: 'glass',
        wallType: 'metal',
        ambientColor: 'rgba(198, 161, 91, 0.12)',
        description: 'The crowning challenge. Maximum spatial complexity, 4 aggressive rivals, strict timer, and priceless imperial crowns.',
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,0,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,1,0,0,1,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        treasures: [
            { x: 3,  y: 1,  type: 'artifact', value: 100 },
            { x: 9,  y: 1,  type: 'gold',     value: 25 },
            { x: 16, y: 1,  type: 'gold',     value: 25 },
            { x: 22, y: 1,  type: 'artifact', value: 100 },
            { x: 3,  y: 3,  type: 'gem',      value: 50 },
            { x: 11, y: 3,  type: 'coin',     value: 10 },
            { x: 14, y: 3,  type: 'coin',     value: 10 },
            { x: 22, y: 3,  type: 'gem',      value: 50 },
            { x: 7,  y: 5,  type: 'gem',      value: 50 },
            { x: 18, y: 5,  type: 'gem',      value: 50 },
            { x: 11, y: 7,  type: 'artifact', value: 100 },
            { x: 14, y: 7,  type: 'artifact', value: 100 },
            { x: 3,  y: 9,  type: 'gold',     value: 25 },
            { x: 22, y: 9,  type: 'gold',     value: 25 },
            { x: 6,  y: 11, type: 'coin',     value: 10 },
            { x: 19, y: 11, type: 'coin',     value: 10 },
            { x: 12, y: 13, type: 'artifact', value: 100 }
        ],
        playerSpawn: { x: 1, y: 1 },
        aiSpawns: [
            { x: 24, y: 1 },
            { x: 1,  y: 13 },
            { x: 24, y: 13 },
            { x: 12, y: 5 }
        ],
        exit: { x: 24, y: 7 }
    }
];
