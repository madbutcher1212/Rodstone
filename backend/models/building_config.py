# Конфигурация всех зданий в игре
BUILDINGS_CONFIG = {
    "house": {
        "name": "Жилой район",
        "icon": "🏘️",
        "section": "social",
        "max_level": 5,
        "workers_needed": [0, 0, 0, 0, 0],
        "base_cost": {"gold": 50, "wood": 20, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 50},
            {"gold": 250, "wood": 300, "stone": 125},
            {"gold": 1500, "wood": 1000, "stone": 400},
            {"gold": 7200, "wood": 5300, "stone": 2450}
        ],
        "population_bonus": [20, 20, 40, 100, 250],
        "income": [{}, {}, {}, {}, {}],
        "requiredTownHall": [1, 2, 3, 4, 5]
    },
    "tavern": {
        "name": "Корчма",
        "icon": "🍺",
        "section": "social",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 100, "wood": 100, "stone": 25},
        "upgrade_costs": [
            {"gold": 250, "wood": 250, "stone": 100},
            {"gold": 900, "wood": 900, "stone": 400},
            {"gold": 1800, "wood": 1800, "stone": 800},
            {"gold": 8000, "wood": 4000, "stone": 2500}
        ],
        "income": [
            {"gold": 3, "food": -3, "populationGrowth": 1},
            {"gold": 6, "food": -5, "populationGrowth": 2},
            {"gold": 15, "food": -12, "populationGrowth": 3},
            {"gold": 30, "food": -22, "populationGrowth": 4},
            {"gold": 70, "food": -50, "populationGrowth": 5}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    "bath": {
        "name": "Купели",
        "icon": "💧",
        "section": "social",
        "max_level": 5,
        "workers_needed": [1, 1, 2, 2, 3],
        "base_cost": {"gold": 100, "wood": 100, "stone": 25},
        "upgrade_costs": [
            {"gold": 250, "wood": 250, "stone": 100},
            {"gold": 900, "wood": 900, "stone": 400},
            {"gold": 1800, "wood": 1800, "stone": 800},
            {"gold": 8000, "wood": 4000, "stone": 2500}
        ],
        "income": [
            {"gold": 2, "populationGrowth": 1},
            {"gold": 4, "populationGrowth": 2},
            {"gold": 10, "populationGrowth": 2},
            {"gold": 20, "populationGrowth": 3},
            {"gold": 50, "populationGrowth": 3}
        ],
        "requiredTownHall": [3, 4, 4, 5, 5]
    },
    "farm": {
        "name": "Ферма",
        "icon": "🌾",
        "section": "production",
        "max_level": 5,
        "workers_needed": [1, 2, 3, 4, 5],
        "base_cost": {"gold": 30, "wood": 40, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 0},
            {"gold": 250, "wood": 300, "stone": 0},
            {"gold": 1000, "wood": 1000, "stone": 150},
            {"gold": 5200, "wood": 6300, "stone": 2450}
        ],
        "income": [
            {"food": 10},
            {"food": 25},
            {"food": 60},
            {"food": 120},
            {"food": 260}
        ],
        "requiredTownHall": [1, 2, 3, 4, 5]
    },
    "lumber": {
        "name": "Лагерь лесорубов",
        "icon": "🪵",
        "section": "production",
        "max_level": 5,
        "workers_needed": [1, 2, 3, 4, 5],
        "base_cost": {"gold": 40, "wood": 30, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 0},
            {"gold": 350, "wood": 200, "stone": 50},
            {"gold": 1300, "wood": 900, "stone": 550},
            {"gold": 7000, "wood": 4500, "stone": 3500}
        ],
        "income": [
            {"wood": 10},
            {"wood": 20},
            {"wood": 40},
            {"wood": 100},
            {"wood": 200}
        ],
        "requiredTownHall": [1, 2, 3, 4, 5]
    },
    "quarry": {
        "name": "Каменоломня",
        "icon": "⛰️",
        "section": "production",
        "max_level": 5,
        "workers_needed": [2, 3, 4, 5, 6],
        "base_cost": {"gold": 20, "wood": 80, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 150, "stone": 0},
            {"gold": 250, "wood": 350, "stone": 100},
            {"gold": 1000, "wood": 1700, "stone": 150},
            {"gold": 6200, "wood": 7300, "stone": 1450}
        ],
        "income": [
            {"stone": 5},
            {"stone": 15},
            {"stone": 35},
            {"stone": 80},
            {"stone": 160}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },

    "hunting_lodge": {
        "name": "Хижина охотника",
        "icon": "🏹",
        "section": "production",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 50, "wood": 60, "stone": 0},
        "upgrade_costs": [
            {"gold": 100, "wood": 120, "stone": 0},
            {"gold": 400, "wood": 300, "stone": 50},
            {"gold": 1200, "wood": 800, "stone": 200},
            {"gold": 5000, "wood": 3000, "stone": 1000}
        ],
        "income": [
            {"food": 5, "leather": 2},
            {"food": 12, "leather": 5},
            {"food": 25, "leather": 12},
            {"food": 50, "leather": 25},
            {"food": 100, "leather": 50}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    "mines": {
        "name": "Шахты",
        "icon": "⛏️",
        "section": "production",
        "max_level": 5,
        "workers_needed": [2, 3, 4, 5, 6],
        "base_cost": {"gold": 100, "wood": 80, "stone": 40},
        "upgrade_costs": [
            {"gold": 200, "wood": 150, "stone": 100},
            {"gold": 800, "wood": 400, "stone": 300},
            {"gold": 2500, "wood": 1200, "stone": 800},
            {"gold": 8000, "wood": 4000, "stone": 2500}
        ],
        "income": [
            {"iron": 5, "coal": 3},
            {"iron": 15, "coal": 8},
            {"iron": 35, "coal": 18},
            {"iron": 80, "coal": 40},
            {"iron": 160, "coal": 80}
        ],
        "requiredTownHall": [3, 4, 4, 5, 5]
    },
    "ranch": {
        "name": "Скотный двор",
        "icon": "🐄",
        "section": "production",
        "max_level": 5,
        "workers_needed": [1, 2, 3, 4, 5],
        "base_cost": {"gold": 80, "wood": 100, "stone": 20},
        "upgrade_costs": [
            {"gold": 150, "wood": 200, "stone": 50},
            {"gold": 600, "wood": 500, "stone": 150},
            {"gold": 2000, "wood": 1500, "stone": 500},
            {"gold": 8000, "wood": 5000, "stone": 2000}
        ],
        "income": [
            {"food": 8, "leather": 3},
            {"food": 18, "leather": 7},
            {"food": 35, "leather": 15},
            {"food": 70, "leather": 30},
            {"food": 150, "leather": 60}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    "fishing_wharf": {
        "name": "Рыбацкая пристань",
        "icon": "🎣",
        "section": "production",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 60, "wood": 80, "stone": 0},
        "upgrade_costs": [
            {"gold": 120, "wood": 150, "stone": 0},
            {"gold": 500, "wood": 400, "stone": 50},
            {"gold": 1500, "wood": 1000, "stone": 200},
            {"gold": 6000, "wood": 4000, "stone": 1000}
        ],
        "income": [
            {"food": 8},
            {"food": 18},
            {"food": 40},
            {"food": 85},
            {"food": 175}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    "charcoal_kiln": {
        "name": "Жаровня",
        "icon": "🔥",
        "section": "production",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 60, "wood": 80, "stone": 20},
        "upgrade_costs": [
            {"gold": 120, "wood": 150, "stone": 40},
            {"gold": 500, "wood": 400, "stone": 120},
            {"gold": 1500, "wood": 1000, "stone": 350},
            {"gold": 5000, "wood": 3500, "stone": 1200}
        ],
        "income": [
            {"coal": 5},
            {"coal": 12},
            {"coal": 25},
            {"coal": 55},
            {"coal": 120}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    
"vineyard": {
    "name": "Виноградник",
    "icon": "🍇",
    "section": "production",
    "max_level": 5,
    "workers_needed": [1, 2, 2, 3, 3],
    "base_cost": {"gold": 200, "wood": 150, "stone": 50},
    "upgrade_costs": [
        {"gold": 400, "wood": 250, "stone": 100},
        {"gold": 900, "wood": 500, "stone": 250},
        {"gold": 2000, "wood": 1200, "stone": 600},
        {"gold": 5000, "wood": 3000, "stone": 1500}
    ],
    "income": [
        {"food": 25, "gold": 10},
        {"food": 45, "gold": 20},
        {"food": 70, "gold": 35},
        {"food": 100, "gold": 55},
        {"food": 140, "gold": 80}
    ],
    "requiredTownHall": [5, 5, 5, 5, 5]
},

"linen_workshop": {
    "name": "Льняная мастерская",
    "icon": "🧵",
    "section": "production",
    "max_level": 5,
    "workers_needed": [1, 2, 2, 3, 3],
    "base_cost": {"gold": 100, "wood": 120, "stone": 30},
    "upgrade_costs": [
        {"gold": 200, "wood": 200, "stone": 60},
        {"gold": 500, "wood": 450, "stone": 150},
        {"gold": 1200, "wood": 1000, "stone": 400},
        {"gold": 3000, "wood": 2500, "stone": 1000}
    ],
    "income": [
        {"fabric": 5, "gold": 3},
        {"fabric": 10, "gold": 6},
        {"fabric": 18, "gold": 12},
        {"fabric": 30, "gold": 20},
        {"fabric": 50, "gold": 35}
    ],
    "requiredTownHall": [3, 4, 5, 5, 5]
},
    "armorer": {
        "name": "Бронник",
        "icon": "🛡️",
        "section": "military",
        "max_level": 5,
        "workers_needed": [2, 3, 3, 4, 5],
        "base_cost": {"gold": 200, "wood": 150, "stone": 100, "iron": 20},
        "upgrade_costs": [
            {"gold": 400, "wood": 200, "stone": 150, "iron": 30},
            {"gold": 1200, "wood": 600, "stone": 400, "iron": 80},
            {"gold": 3500, "wood": 1500, "stone": 1000, "iron": 200},
            {"gold": 10000, "wood": 5000, "stone": 3000, "iron": 500}
        ],
        "income": [],
        "requiredTownHall": [4, 5, 5, 5, 5]
    },
    "weaponsmith": {
        "name": "Оружейник",
        "icon": "⚔️",
        "section": "military",
        "max_level": 5,
        "workers_needed": [2, 3, 3, 4, 5],
        "base_cost": {"gold": 200, "wood": 150, "stone": 100, "iron": 20},
        "upgrade_costs": [
            {"gold": 400, "wood": 200, "stone": 150, "iron": 30},
            {"gold": 1200, "wood": 600, "stone": 400, "iron": 80},
            {"gold": 3500, "wood": 1500, "stone": 1000, "iron": 200},
            {"gold": 10000, "wood": 5000, "stone": 3000, "iron": 500}
        ],
        "income": [],
        "requiredTownHall": [4, 5, 5, 5, 5]
    },
    "foal_farm": {
        "name": "Жеребятник",
        "icon": "🐎",
        "section": "production",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 150, "wood": 200, "stone": 50},
        "upgrade_costs": [
            {"gold": 300, "wood": 300, "stone": 100},
            {"gold": 900, "wood": 800, "stone": 300},
            {"gold": 2500, "wood": 2000, "stone": 800},
            {"gold": 8000, "wood": 6000, "stone": 2500}
        ],
        "income": [
            {"horses": 2},
            {"horses": 5},
            {"horses": 12},
            {"horses": 25},
            {"horses": 50}
        ],
        "requiredTownHall": [4, 5, 5, 5, 5]
    },
"manor": {
    "name": "Поместье",
    "icon": "🏰",
    "section": "social",
    "max_level": 5,
    "workers_needed": [0, 0, 0, 0, 0],
    "base_cost": {"gold": 500, "wood": 300, "stone": 200},
    "upgrade_costs": [
        {"gold": 1000, "wood": 500, "stone": 300},
        {"gold": 2000, "wood": 1000, "stone": 600},
        {"gold": 4000, "wood": 2000, "stone": 1200},
        {"gold": 8000, "wood": 4000, "stone": 2500}
    ],
    "population_bonus": [100, 180, 280, 400, 550],  # Согласно нашему балансу
    "income": [
        {"gold": 5},
        {"gold": 10},
        {"gold": 18},
        {"gold": 30},
        {"gold": 50}
    ],
    "requiredTownHall": [5, 6, 7, 8, 9]
},
    
    "barracks": {
        "name": "Казармы",
        "icon": "🏛️",
        "section": "military",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 300, "wood": 250, "stone": 150},
        "upgrade_costs": [
            {"gold": 600, "wood": 400, "stone": 250},
            {"gold": 1500, "wood": 1000, "stone": 600},
            {"gold": 4000, "wood": 2500, "stone": 1500},
            {"gold": 12000, "wood": 8000, "stone": 4000}
        ],
        "income": [],
        "requiredTownHall": [4, 5, 5, 5, 5]
    },
    "shooting_range": {
        "name": "Стрельбище",
        "icon": "🎯",
        "section": "military",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 250, "wood": 200, "stone": 100},
        "upgrade_costs": [
            {"gold": 500, "wood": 350, "stone": 200},
            {"gold": 1200, "wood": 800, "stone": 500},
            {"gold": 3500, "wood": 2000, "stone": 1200},
            {"gold": 10000, "wood": 6000, "stone": 3000}
        ],
        "income": [],
        "requiredTownHall": [4, 5, 5, 5, 5]
    },
    "stables": {
        "name": "Конюшни",
        "icon": "🐎",
        "section": "military",
        "max_level": 5,
        "workers_needed": [1, 2, 3, 3, 4],
        "base_cost": {"gold": 200, "wood": 250, "stone": 100},
        "upgrade_costs": [
            {"gold": 400, "wood": 400, "stone": 200},
            {"gold": 1000, "wood": 1000, "stone": 500},
            {"gold": 3000, "wood": 2500, "stone": 1200},
            {"gold": 9000, "wood": 7000, "stone": 3000}
        ],
        "income": [],
        "requiredTownHall": [4, 5, 5, 5, 5]
    },
    "military_academy": {
        "name": "Военное училище",
        "icon": "🎓",
        "section": "military",
        "max_level": 5,
        "workers_needed": [2, 3, 3, 4, 5],
        "base_cost": {"gold": 500, "wood": 300, "stone": 200, "iron": 50},
        "upgrade_costs": [
            {"gold": 1000, "wood": 500, "stone": 350, "iron": 80},
            {"gold": 2500, "wood": 1200, "stone": 800, "iron": 200},
            {"gold": 6000, "wood": 3000, "stone": 2000, "iron": 500},
            {"gold": 15000, "wood": 10000, "stone": 5000, "iron": 1000}
        ],
        "income": [],
        "requiredTownHall": [5, 5, 5, 5, 5]
    },

    # ===== ЭКОНОМИЧЕСКИЕ =====
    "market": {
        "name": "Рынок",
        "icon": "🏪",
        "section": "economic",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 200, "wood": 150, "stone": 50},
        "upgrade_costs": [
            {"gold": 400, "wood": 250, "stone": 100},
            {"gold": 1000, "wood": 600, "stone": 300},
            {"gold": 3000, "wood": 1500, "stone": 800},
            {"gold": 9000, "wood": 5000, "stone": 2500}
        ],
        "income": [
            {"gold": 5},
            {"gold": 15},
            {"gold": 35},
            {"gold": 75},
            {"gold": 150}
        ],
        "requiredTownHall": [3, 4, 5, 5, 5]
    },
    "pottery": {
        "name": "Гончарная мастерская",
        "icon": "🏺",
        "section": "economic",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 100, "wood": 80, "stone": 20},
        "upgrade_costs": [
            {"gold": 200, "wood": 150, "stone": 50},
            {"gold": 600, "wood": 400, "stone": 150},
            {"gold": 1800, "wood": 1000, "stone": 400},
            {"gold": 5000, "wood": 3000, "stone": 1200}
        ],
        "income": [
            {"gold": 3},
            {"gold": 8},
            {"gold": 18},
            {"gold": 40},
            {"gold": 85}
        ],
        "requiredTownHall": [3, 4, 5, 5, 5]
    },
    "guilds": {
        "name": "Гильдии",
        "icon": "🤝",
        "section": "economic",
        "max_level": 5,
        "workers_needed": [2, 3, 3, 4, 5],
        "base_cost": {"gold": 300, "wood": 200, "stone": 100},
        "upgrade_costs": [
            {"gold": 600, "wood": 350, "stone": 200},
            {"gold": 1500, "wood": 800, "stone": 500},
            {"gold": 4000, "wood": 2000, "stone": 1200},
            {"gold": 10000, "wood": 6000, "stone": 3000}
        ],
        "income": [
            {"gold": 8},
            {"gold": 20},
            {"gold": 45},
            {"gold": 100},
            {"gold": 200}
        ],
        "requiredTownHall": [4, 5, 5, 5, 5]
    },
    "weaving_workshop": {
        "name": "Ткацкая мастерская",
        "icon": "🧵",
        "section": "economic",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 80, "wood": 100, "stone": 0},
        "upgrade_costs": [
            {"gold": 150, "wood": 200, "stone": 0},
            {"gold": 500, "wood": 500, "stone": 50},
            {"gold": 1500, "wood": 1200, "stone": 200},
            {"gold": 4500, "wood": 3500, "stone": 800}
        ],
        "income": [
            {"leather": 2, "gold": 2},
            {"leather": 5, "gold": 5},
            {"leather": 12, "gold": 12},
            {"leather": 25, "gold": 25},
            {"leather": 50, "gold": 50}
        ],
        "requiredTownHall": [3, 4, 5, 5, 5]
    },
    # ===== МАСТЕРСКИЕ  =====
"bow_workshop": {
    "name": "Мастерская лукодела",
    "icon": "🏹",
    "section": "workshop",
    "max_level": 5,
    "workers_needed": [1, 2, 2, 3, 3],
    "base_cost": {"gold": 100, "wood": 120, "stone": 30},
    "upgrade_costs": [...],
    "income": [
        {"bows": 2},
        {"bows": 5},
        {"bows": 10},
        {"bows": 18},
        {"bows": 30}
    ],
    "requiredTownHall": [3, 4, 5, 5, 5]
},
"shield_workshop": {
    "name": "Мастерская щитника",
    "icon": "🛡️",
    "section": "workshop",
    "max_level": 5,
    "workers_needed": [1, 2, 2, 3, 3],
    "base_cost": {"gold": 100, "wood": 130, "stone": 40},
    "upgrade_costs": [...],
    "income": [
        {"shields": 2},
        {"shields": 5},
        {"shields": 10},
        {"shields": 18},
        {"shields": 30}
    ],
    "requiredTownHall": [3, 4, 5, 5, 5]
},
"saddle_workshop": {
    "name": "Мастерская седельника",
    "icon": "🪑",
    "section": "workshop",
    "max_level": 5,
    "workers_needed": [1, 2, 2, 3, 3],
    "base_cost": {"gold": 120, "wood": 100, "stone": 50},
    "upgrade_costs": [...],
    "income": [
        {"saddles": 2},
        {"saddles": 4},
        {"saddles": 8},
        {"saddles": 15},
        {"saddles": 25}
    ],
    "requiredTownHall": [4, 5, 5, 5, 5]
}

    # ===== СОЦИАЛЬНЫЕ =====
    "chapel": {
        "name": "Часовня",
        "icon": "⛪️",
        "section": "social",
        "max_level": 5,
        "workers_needed": [1, 1, 2, 2, 2],
        "base_cost": {"gold": 150, "wood": 200, "stone": 100},
        "upgrade_costs": [
            {"gold": 300, "wood": 300, "stone": 200},
            {"gold": 900, "wood": 800, "stone": 500},
            {"gold": 2500, "wood": 2000, "stone": 1200},
            {"gold": 7000, "wood": 5000, "stone": 3000}
        ],
        "income": [
            {"populationGrowth": 1},
            {"populationGrowth": 2},
            {"populationGrowth": 3},
            {"populationGrowth": 4},
            {"populationGrowth": 5}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    "almshouse": {
        "name": "Богадельня",
        "icon": "🏠",
        "section": "social",
        "max_level": 5,
        "workers_needed": [1, 1, 1, 2, 2],
        "base_cost": {"gold": 100, "wood": 150, "stone": 50},
        "upgrade_costs": [
            {"gold": 200, "wood": 250, "stone": 100},
            {"gold": 600, "wood": 600, "stone": 300},
            {"gold": 1800, "wood": 1500, "stone": 800},
            {"gold": 5000, "wood": 4000, "stone": 2000}
        ],
        "income": [
            {"populationGrowth": 1},
            {"populationGrowth": 1},
            {"populationGrowth": 2},
            {"populationGrowth": 2},
            {"populationGrowth": 3}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    "infirmary": {
        "name": "Лазарет",
        "icon": "🏥",
        "section": "social",
        "max_level": 5,
        "workers_needed": [1, 2, 2, 3, 3],
        "base_cost": {"gold": 200, "wood": 250, "stone": 150},
        "upgrade_costs": [
            {"gold": 400, "wood": 400, "stone": 250},
            {"gold": 1200, "wood": 1000, "stone": 600},
            {"gold": 3500, "wood": 2500, "stone": 1500},
            {"gold": 9000, "wood": 6000, "stone": 3500}
        ],
        "income": [
            {"populationGrowth": 2},
            {"populationGrowth": 3},
            {"populationGrowth": 4},
            {"populationGrowth": 5},
            {"populationGrowth": 6}
        ],
        "requiredTownHall": [3, 4, 5, 5, 5]
    }
}

def calculate_building_upgrade_cost(building_id, current_level):
    """Возвращает стоимость улучшения здания на следующем уровне."""
    config = BUILDINGS_CONFIG.get(building_id)
    if not config or current_level >= config["max_level"]:
        return {"gold": 0, "wood": 0, "stone": 0, "iron": 0, "coal": 0}
    return config["upgrade_costs"][current_level - 1]

def calculate_population_max(buildings):
    """Рассчитывает максимальное население на основе построек."""
    max_pop = 10
    for b in buildings:
        if b["id"] == "house":
            config = BUILDINGS_CONFIG["house"]
            for i in range(b["level"]):
                max_pop += config["population_bonus"][i]
            break
    return max_pop

def calculate_hourly_income_and_growth(buildings, town_hall_level, current_population, max_population, current_food):
    """Рассчитывает доход в час и рост населения."""
    TOWN_HALL_INCOME = {1:5, 2:10, 3:20, 4:45, 5:100}
    income = {
        "gold": TOWN_HALL_INCOME.get(town_hall_level, 0),
        "wood": 0, "food": 0, "stone": 0,
        "iron": 0, "coal": 0, "leather": 0, "horses": 0
    }

    for b in buildings:
        config = BUILDINGS_CONFIG.get(b["id"])
        if not config or b["level"] == 0 or not config.get("income"):
            continue
        inc = config["income"][b["level"] - 1]
        for resource, value in inc.items():
            if resource in income:
                income[resource] += value

    food_prod = income["food"]
    food_needed = current_population
    
    # Проверяем, хватит ли еды с учетом запасов
    total_available = current_food + food_prod
    
    pop_growth = 0
    
    if total_available >= food_needed:
        # Еды хватает - население может расти
        potential = 3
        available_space = max_population - current_population
        pop_growth = min(potential, available_space)
        
        # Сколько еды останется после потребления
        food_left = total_available - food_needed
        income["food"] = food_left - current_food  # изменение запасов
    else:
        # Еды не хватает - роста нет
        pop_growth = 0
        income["food"] = -current_food  # вся еда съедена, запасы = 0

    return income, pop_growth

def get_workers_needed(building_id, level):
    """Возвращает количество рабочих для здания."""
    config = BUILDINGS_CONFIG.get(building_id)
    if not config or level == 0:
        return 0
    return config["workers_needed"][level - 1]
