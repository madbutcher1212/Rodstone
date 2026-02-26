// resources.js - логика ресурсов, форматирование, таймер

// Форматирование чисел (1000 -> 1к, 1000000 -> 1м)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'м';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'к';
    }
    return num.toString();
}

// Показать точное значение ресурса при клике
function showExactValue(resource) {
    const values = {
        gold: userData.gold,
        wood: userData.wood,
        stone: userData.stone,
        food: userData.food,
        population: `${userData.population_current}/${userData.population_max}`
    };
    const names = {
        gold: 'Золото',
        wood: 'Древесина',
        stone: 'Камень',
        food: 'Еда',
        population: 'Население'
    };
    showToast(`${names[resource]}: ${values[resource]}`);
}

// Расчёт дохода в час
function calculateHourlyIncome() {
    let income = {
        gold: TOWN_HALL_INCOME[userData.level] || 0,
        wood: 0,
        food: 0,
        stone: 0,
        populationGrowth: 0
    };

    buildings.forEach(b => {
        const config = BUILDINGS_CONFIG[b.id];
        if (!config?.income) return;
        const inc = config.income[b.level - 1];
        if (inc) {
            income.gold += inc.gold || 0;
            income.wood += inc.wood || 0;
            income.food += inc.food || 0;
            income.stone += inc.stone || 0;
            income.populationGrowth += inc.populationGrowth || 0;
        }
    });

    return income;
}

// Обновление отображения ресурсов
function updateResourcesDisplay() {
    const income = calculateHourlyIncome();

    document.getElementById('goldDisplay').textContent = formatNumber(userData.gold);
    document.getElementById('goldIncome').textContent = `+${formatNumber(income.gold)}`;

    document.getElementById('woodDisplay').textContent = formatNumber(userData.wood);
    document.getElementById('woodIncome').textContent = `+${formatNumber(income.wood)}`;

    document.getElementById('stoneDisplay').textContent = formatNumber(userData.stone);
    document.getElementById('stoneIncome').textContent = `+${formatNumber(income.stone)}`;

    // Расчёт еды с учётом потребления жителей
    const foodProd = income.food;
    const foodCons = userData.population_current;
    const foodBal = foodProd - foodCons;

    document.getElementById('foodDisplay').textContent = formatNumber(userData.food);
    document.getElementById('foodIncome').textContent = 
        foodBal > 0 ? `+${formatNumber(foodBal)}` : 
        foodBal < 0 ? `${formatNumber(foodBal)}` : '0';
    document.getElementById('foodIncome').className = 
        foodBal < 0 ? 'resource-income-negative' : 'resource-income';

    document.getElementById('populationDisplay').textContent = 
        `${userData.population_current}/${userData.population_max}`;

    // Рост населения (базовый + от зданий)
    const canGrow = userData.food > 0 || foodProd >= foodCons;
    const totalGrowth = canGrow ? 3 + income.populationGrowth : 0;
    document.getElementById('populationGrowth').textContent = 
        totalGrowth > 0 ? `+${totalGrowth}` : '⚠️';
}

// Обновление таймера до следующего сбора
function updateTimer() {
    const now = Date.now();
    const timePassed = now - userData.lastCollection;
    const timeLeft = Math.max(0, COLLECTION_INTERVAL - timePassed);

    if (timeLeft <= 0) {
        document.getElementById('timerDisplay').textContent = 'Готово!';
        document.getElementById('timerProgress').style.width = '100%';
    } else {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const progress = ((COLLECTION_INTERVAL - timeLeft) / COLLECTION_INTERVAL) * 100;
        document.getElementById('timerProgress').style.width = `${progress}%`;
    }
}

// Проверка автосбора
async function checkAutoCollection() {
    if (Date.now() - userData.lastCollection >= COLLECTION_INTERVAL) {
        const result = await apiRequest('collect', {});
        if (result.success) {
            Object.assign(userData, result.state);
            if (result.state.buildings) buildings = result.state.buildings;
            updateResourcesDisplay();
            updateCityUI?.(); // может быть не определён при первой загрузке
            showToast('📦 Ресурсы собраны!');
        }
    }
}

// Функция для проверки, можно ли улучшить здание
function canUpgrade(buildingId, currentLevel) {
    if (buildingId === 'townhall') {
        if (userData.level >= 5) return false;
        const cost = TOWN_HALL_UPGRADE_COST[userData.level + 1];
        return userData.gold >= cost.gold && 
               userData.wood >= cost.wood && 
               userData.stone >= cost.stone;
    }

    const config = BUILDINGS_CONFIG[buildingId];
    if (!config) return false;

    // Постройка нового здания
    if (currentLevel === 0) {
        const cost = config.baseCost;
        return userData.level >= (config.requiredTownHall?.[0] || 1) &&
               userData.gold >= cost.gold && 
               userData.wood >= cost.wood && 
               userData.stone >= cost.stone;
    }

    // Улучшение существующего
    if (currentLevel >= config.maxLevel) return false;
    if (userData.level < (config.requiredTownHall?.[currentLevel] || currentLevel + 1)) return false;

    const cost = config.upgradeCosts[currentLevel - 1];
    return userData.gold >= cost.gold && 
           userData.wood >= cost.wood && 
           userData.stone >= cost.stone;
}
