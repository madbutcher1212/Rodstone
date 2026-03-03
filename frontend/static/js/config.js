// Конфигурация API
const API_URL = 'https://game-production-10ea.up.railway.app';

// Конфиг аватарок
const AVATARS = {
    'male_free': {
        name: 'Мужской',
        url: 'https://raw.githubusercontent.com/madbutcher1212/Rodstone/main/frontend/static/avatars/male_free.png',
        price: 0,
        category: 'free'
    },
    'female_free': {
        name: 'Женский',
        url: 'https://raw.githubusercontent.com/madbutcher1212/Rodstone/main/frontend/static/avatars/female_free.png',
        price: 0,
        category: 'free'
    },
    'male_premium': {
        name: 'Лорд',
        url: 'https://raw.githubusercontent.com/madbutcher1212/Rodstone/main/frontend/static/avatars/male_premium.png',
        price: 25000,
        category: 'premium'
    },
    'female_premium': {
        name: 'Леди',
        url: 'https://raw.githubusercontent.com/madbutcher1212/Rodstone/main/frontend/static/avatars/female_premium.png',
        price: 25000,
        category: 'premium'
    }
};

// Доход ратуши по уровням
const TOWN_HALL_INCOME = {
    1: 5,
    2: 10,
    3: 20,
    4: 45,
    5: 100
};

// Стоимость улучшения ратуши
const TOWN_HALL_UPGRADE_COST = {
    2: { gold: 50, wood: 100, stone: 0 },
    3: { gold: 500, wood: 400, stone: 0 },
    4: { gold: 2000, wood: 1200, stone: 250 },
    5: { gold: 10000, wood: 6000, stone: 2500 }
};

// Конфиг зданий
const BUILDINGS_CONFIG = {
    'house': {
        name: 'Жилой район',
        icon: '🏘️',
        section: 'social',
        maxLevel: 5,
        baseCost: { gold: 50, wood: 20, stone: 0 },
        upgradeCosts: [
            { gold: 50, wood: 100, stone: 50 },
            { gold: 250, wood: 300, stone: 125 },
            { gold: 1500, wood: 1000, stone: 400 },
            { gold: 7200, wood: 5300, stone: 2450 }
        ],
        income: [{}, {}, {}, {}, {}],
        populationBonus: [10, 25, 50, 100, 250]
    },
    'tavern': {
        name: 'Корчма',
        icon: '🍺',
        section: 'social',
        maxLevel: 5,
        baseCost: { gold: 100, wood: 100, stone: 25 },
        upgradeCosts: [
            { gold: 250, wood: 250, stone: 100 },
            { gold: 900, wood: 900, stone: 400 },
            { gold: 1800, wood: 1800, stone: 800 },
            { gold: 8000, wood: 4000, stone: 2500 }
        ],
        income: [
            { gold: 3, food: -3, populationGrowth: 1 },
            { gold: 6, food: -5, populationGrowth: 2 },
            { gold: 15, food: -12, populationGrowth: 3 },
            { gold: 30, food: -22, populationGrowth: 4 },
            { gold: 70, food: -50, populationGrowth: 5 }
        ],
        requiredTownHall: [2, 3, 4, 5, 5]
    },
    'bath': {
        name: 'Купели',
        icon: '💧',
        section: 'social',
        maxLevel: 5,
        baseCost: { gold: 100, wood: 100, stone: 25 },
        upgradeCosts: [
            { gold: 250, wood: 250, stone: 100 },
            { gold: 900, wood: 900, stone: 400 },
            { gold: 1800, wood: 1800, stone: 800 },
            { gold: 8000, wood: 4000, stone: 2500 }
        ],
        income: [
            { gold: 2, populationGrowth: 1 },
            { gold: 4, populationGrowth: 2 },
            { gold: 10, populationGrowth: 2 },
            { gold: 20, populationGrowth: 3 },
            { gold: 50, populationGrowth: 3 }
        ],
        requiredTownHall: [3, 4, 4, 5, 5]
    },
    'farm': {
        name: 'Ферма',
        icon: '🌾',
        section: 'economic',
        maxLevel: 5,
        baseCost: { gold: 30, wood: 40, stone: 0 },
        upgradeCosts: [
            { gold: 50, wood: 100, stone: 0 },
            { gold: 250, wood: 300, stone: 0 },
            { gold: 1000, wood: 1000, stone: 150 },
            { gold: 5200, wood: 6300, stone: 2450 }
        ],
        income: [
            { food: 10 },
            { food: 25 },
            { food: 60 },
            { food: 120 },
            { food: 260 }
        ]
    },
    'lumber': {
        name: 'Лесопилка',
        icon: '🪵',
        section: 'economic',
        maxLevel: 5,
        baseCost: { gold: 40, wood: 30, stone: 0 },
        upgradeCosts: [
            { gold: 50, wood: 100, stone: 0 },
            { gold: 350, wood: 200, stone: 50 },
            { gold: 1300, wood: 900, stone: 550 },
            { gold: 7000, wood: 4500, stone: 3500 }
        ],
        income: [
            { wood: 10 },
            { wood: 20 },
            { wood: 40 },
            { wood: 100 },
            { wood: 200 }
        ]
    },
    'quarry': {
        name: 'Каменоломня',
        icon: '⛰️',
        section: 'economic',
        maxLevel: 5,
        baseCost: { gold: 20, wood: 80, stone: 0 },
        upgradeCosts: [
            { gold: 50, wood: 150, stone: 0 },
            { gold: 250, wood: 350, stone: 100 },
            { gold: 1000, wood: 1700, stone: 150 },
            { gold: 6200, wood: 7300, stone: 1450 }
        ],
        income: [
            { stone: 5 },
            { stone: 15 },
            { stone: 35 },
            { stone: 80 },
            { stone: 160 }
        ]
    }
};

// Интервал сбора (1 час в миллисекундах)
const COLLECTION_INTERVAL = 60 * 60 * 1000;
