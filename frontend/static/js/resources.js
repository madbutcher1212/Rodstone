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
        gold: TOWN_HALL_INCOME[userData.townHallLevel] || 0,
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

    document.getElementById('goldBar').textContent = formatNumber(userData.gold);
    document.getElementById('goldIncome').textContent = `+${formatNumber(income.gold)}/ч`;
    
    document.getElementById('woodBar').textContent = formatNumber(userData.wood);
    document.getElementById('woodIncome').textContent = `+${formatNumber(income.wood)}/ч`;
    
    document.getElementById('stoneBar').textContent = formatNumber(userData.stone);
    document.getElementById('stoneIncome').textContent = `+${formatNumber(income.stone)}/ч`;
    
    // Отображение еды
    const foodProd = income.food;
    const foodCons = userData.population_current;
    const foodBal = foodProd - foodCons;

    document.getElementById('foodBar').textContent = formatNumber(userData.food);
    document.getElementById('foodIncome').textContent = 
        foodBal > 0 ? `+${formatNumber(foodBal)}/ч` : 
        foodBal < 0 ? `${formatNumber(foodBal)}/ч` : '0/ч';
    
    // Отображение жителей
    const popElement = document.getElementById('populationDisplay');
    if (popElement) {
        popElement.textContent = `${userData.population_current}/${userData.population_max}`;
    }
    
    const popGrowthElement = document.getElementById('populationGrowth');
    if (popGrowthElement) {
        const canGrow = userData.food > 0 || foodProd >= foodCons;
        const totalGrowth = canGrow ? 3 + income.populationGrowth : 0;
        popGrowthElement.textContent = totalGrowth > 0 ? `+${totalGrowth}/ч` : '⚠️';
    }
}

// Обновление таймера
function updateTimer() {
    const now = Date.now();
    const timePassed = now - userData.lastCollection;
    const timeLeft = Math.max(0, COLLECTION_INTERVAL - timePassed);

    const timerDisplay = document.getElementById('timerDisplay');
    const timerProgress = document.getElementById('timerProgress');
    
    if (!timerDisplay || !timerProgress) return;

    if (timeLeft <= 0) {
        timerDisplay.textContent = 'Готово!';
        timerProgress.style.width = '100%';
    } else {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const progress = ((COLLECTION_INTERVAL - timeLeft) / COLLECTION_INTERVAL) * 100;
        timerProgress.style.width = `${progress}%`;
    }
}

// Проверка автосбора
async function checkAutoCollection() {
    if (Date.now() - userData.lastCollection >= COLLECTION_INTERVAL) {
        await apiRequest('collect', {});
    }
}
