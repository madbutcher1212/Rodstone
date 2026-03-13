// resources.js - логика ресурсов, форматирование, таймер

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'м';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'к';
    return num.toString();
}

function showExactValue(resource) {
    const values = {
        gold: userData.gold,
        wood: userData.wood,
        stone: userData.stone,
        iron: userData.iron || 0,
        coal: userData.coal || 0,
        food: userData.food,
        leather: userData.leather || 0,
        fabric: userData.fabric || 0,
        horses: userData.horses || 0,
        ore: userData.ore || 0,
        rodstone: userData.rodstone || 0,
        population: `${userData.population_current}/${userData.population_max}`
    };
    const names = {
        gold: 'Золото',
        wood: 'Древесина',
        stone: 'Камень',
        iron: 'Железо',
        coal: 'Уголь',
        food: 'Еда',
        leather: 'Шкуры',
        fabric: 'Ткань',
        horses: 'Лошади',
        ore: 'Руда',
        rodstone: 'Родстоун',
        population: 'Население'
    };
    showToast(`${names[resource]}: ${values[resource]}`);
}

function calculateHourlyIncome() {
    let income = {
        gold: TOWN_HALL_INCOME[userData.townHallLevel] || 0,
        wood: 0,
        food: 0,
        stone: 0,
        iron: 0,
        coal: 0,
        leather: 0,
        horses: 0,
        fabric: 0,
        ore: 0,
        rodstone: 0,
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
            income.iron += inc.iron || 0;
            income.coal += inc.coal || 0;
            income.leather += inc.leather || 0;
            income.horses += inc.horses || 0;
            income.fabric += inc.fabric || 0;
            income.populationGrowth += inc.populationGrowth || 0;
        }
    });

    return income;
}

function updateResourcesDisplay() {
    const income = calculateHourlyIncome();

    // Верхний бар (золото, родстоун, население)
    const goldBar = document.getElementById('goldBar');
    if (goldBar) goldBar.textContent = formatNumber(userData.gold);
    
    const goldIncome = document.getElementById('goldIncome');
    if (goldIncome) goldIncome.textContent = `+${formatNumber(income.gold)}/ч`;
    
    const rodstoneBar = document.getElementById('rodstoneBar');
    if (rodstoneBar) rodstoneBar.textContent = formatNumber(userData.rodstone || 0);
    
    const rodstoneIncome = document.getElementById('rodstoneIncome');
    if (rodstoneIncome) rodstoneIncome.textContent = `+0/ч`;
    
    const populationDisplay = document.getElementById('populationDisplay');
    if (populationDisplay) {
        populationDisplay.textContent = `${userData.population_current}/${userData.population_max}`;
    }

    // Ресурсы в городе (еда, дерево, камень, железо, уголь, шкуры, ткань, лошади)
    const foodDisplay = document.getElementById('foodDisplay');
    if (foodDisplay) foodDisplay.textContent = formatNumber(userData.food);
    
    const woodDisplay = document.getElementById('woodDisplay');
    if (woodDisplay) woodDisplay.textContent = formatNumber(userData.wood);
    
    const stoneDisplay = document.getElementById('stoneDisplay');
    if (stoneDisplay) stoneDisplay.textContent = formatNumber(userData.stone);
    
    const ironDisplay = document.getElementById('ironDisplay');
    if (ironDisplay) ironDisplay.textContent = formatNumber(userData.iron || 0);
    
    const coalDisplay = document.getElementById('coalDisplay');
    if (coalDisplay) coalDisplay.textContent = formatNumber(userData.coal || 0);
    
    const leatherDisplay = document.getElementById('leatherDisplay');
    if (leatherDisplay) leatherDisplay.textContent = formatNumber(userData.leather || 0);
    
    const fabricDisplay = document.getElementById('fabricDisplay');
    if (fabricDisplay) fabricDisplay.textContent = formatNumber(userData.fabric || 0);

    const horsesDisplay = document.getElementById('horsesDisplay');
    if (horsesDisplay) horsesDisplay.textContent = formatNumber(userData.horses || 0);

    // Доходы в городе
    const foodProd = income.food;
    const foodCons = userData.population_current;
    const foodBal = foodProd - foodCons;
    
    const foodIncome2 = document.getElementById('foodIncome2');
    if (foodIncome2) {
        foodIncome2.textContent = 
            foodBal > 0 ? `+${formatNumber(foodBal)}` : 
            foodBal < 0 ? `${formatNumber(foodBal)}` : '0';
        foodIncome2.className = foodBal < 0 ? 'resource-income-negative' : 'resource-income-small';
    }
    
    const woodIncome2 = document.getElementById('woodIncome2');
    if (woodIncome2) {
        woodIncome2.textContent = `+${formatNumber(income.wood)}`;
        woodIncome2.className = 'resource-income-small';
    }
    
    const stoneIncome2 = document.getElementById('stoneIncome2');
    if (stoneIncome2) {
        stoneIncome2.textContent = `+${formatNumber(income.stone)}`;
        stoneIncome2.className = 'resource-income-small';
    }
    
    const ironIncome2 = document.getElementById('ironIncome2');
    if (ironIncome2) {
        ironIncome2.textContent = `+${formatNumber(income.iron)}`;
        ironIncome2.className = 'resource-income-small';
    }
    
    const coalIncome2 = document.getElementById('coalIncome2');
    if (coalIncome2) {
        coalIncome2.textContent = `+${formatNumber(income.coal)}`;
        coalIncome2.className = 'resource-income-small';
    }
    
    const leatherIncome2 = document.getElementById('leatherIncome2');
    if (leatherIncome2) {
        leatherIncome2.textContent = `+${formatNumber(income.leather)}`;
        leatherIncome2.className = 'resource-income-small';
    }
    
    
    const fabricIncome2 = document.getElementById('fabricIncome2');
    if (fabricIncome2) {
        fabricIncome2.textContent = `+${formatNumber(income.fabric)}`;
        fabricIncome2.className = 'resource-income-small';
    }
    const horsesIncome2 = document.getElementById('horsesIncome2');
    if (horsesIncome2) 
        horsesIncome2.textContent = `+${formatNumber(income.horses)}`;
        horsesIncome2.className = 'resource-income-small';
    }
    // Рост населения
    const canGrow = userData.food > 0 || income.food >= userData.population_current;
    const totalGrowth = canGrow ? 3 + income.populationGrowth : 0;
    
    const populationGrowth = document.getElementById('populationGrowth');
    if (populationGrowth) {
        populationGrowth.textContent = totalGrowth > 0 ? `+${totalGrowth}/ч` : '⚠️';
    }
}

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
