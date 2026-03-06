// buildings.js - логика построек, генерация карточек, улучшения

// Получить уровень здания
function getBuildingLevel(id) {
    const building = buildings.find(b => b.id === id);
    return building ? building.level : 0;
}

// Получить количество зданий
function getBuildingCount(id) {
    const building = buildings.find(b => b.id === id);
    return building ? building.count : 0;
}

// Получить доход здания на определённом уровне
function getBuildingIncome(buildingId, level) {
    if (buildingId === 'townhall') {
        return { gold: TOWN_HALL_INCOME[level] || 0 };
    }
    const config = window.BUILDINGS_CONFIG?.[buildingId];
    if (!config || level === 0 || !config.income) return {};
    return config.income[level - 1] || {};
}

// Получить стоимость улучшения
function getUpgradeCost(buildingId, currentLevel) {
    if (buildingId === 'townhall') {
        return TOWN_HALL_UPGRADE_COST[currentLevel + 1] || { gold: 0, wood: 0, stone: 0 };
    }
    const config = window.BUILDINGS_CONFIG?.[buildingId];
    if (!config || currentLevel >= config.max_level) return { gold: 0, wood: 0, stone: 0 };
    return config.upgrade_costs?.[currentLevel - 1] || { gold: 0, wood: 0, stone: 0 };
}

// Проверить, достаточно ли уровня ратуши
function isTownHallLevelEnough(buildingId, targetLevel) {
    if (buildingId === 'townhall') return true;
    const config = window.BUILDINGS_CONFIG?.[buildingId];
    if (!config || !config.requiredTownHall) return true;
    return userData.townHallLevel >= config.requiredTownHall[targetLevel - 1];
}

// Проверить, можно ли улучшить
function canUpgrade(buildingId, currentLevel) {
    if (buildingId === 'townhall') {
        if (userData.townHallLevel >= 5) return false;
        const cost = getUpgradeCost(buildingId, currentLevel);
        return userData.gold >= cost.gold && 
               userData.wood >= cost.wood && 
               userData.stone >= cost.stone;
    }
    
    const config = window.BUILDINGS_CONFIG?.[buildingId];
    if (!config) return false;
    
    if (currentLevel === 0) {
        const cost = config.base_cost;
        return isTownHallLevelEnough(buildingId, 1) && 
               userData.gold >= cost.gold && 
               userData.wood >= cost.wood;
    }
    
    if (currentLevel >= config.max_level) return false;
    if (!isTownHallLevelEnough(buildingId, currentLevel + 1)) return false;
    
    const cost = getUpgradeCost(buildingId, currentLevel);
    return userData.gold >= cost.gold && 
           userData.wood >= cost.wood && 
           userData.stone >= cost.stone;
}

// Генерация HTML для карточки здания (КОМПАКТНАЯ ДЛЯ СЕТКИ 4x4)
function generateBuildingCardHTML(id) {
    const config = window.BUILDINGS_CONFIG?.[id];
    if (!config) return '';
    
    const level = getBuildingLevel(id);
    
    let statusClass = '';
    let incomeHtml = '';
    let bonusHtml = '';
    let levelHtml = '';
    
    // Статус здания (только цвет, без текстового бейджа)
    if (level === 0) {
        statusClass = 'unavailable';
    } else {
        statusClass = 'available';
    }
    
    // Отображение уровня
    if (level > 0) {
        levelHtml = `<div class="building-level">${level}</div>`;
    } else {
        levelHtml = `<div class="building-level">-</div>`;
    }
    
    // Доход (компактно)
    if (level > 0 && config.income) {
        const currentIncome = getBuildingIncome(id, level);
        let parts = [];
        if (currentIncome.gold) parts.push(`<img src="/static/icons/gold.png" class="income-icon">+${currentIncome.gold}`);
        if (currentIncome.wood) parts.push(`<img src="/static/icons/wood.png" class="income-icon">+${currentIncome.wood}`);
        if (currentIncome.stone) parts.push(`<img src="/static/icons/stone.png" class="income-icon">+${currentIncome.stone}`);
        if (currentIncome.food) {
            if (currentIncome.food > 0) parts.push(`<img src="/static/icons/food.png" class="income-icon">+${currentIncome.food}`);
            else if (currentIncome.food < 0) parts.push(`<img src="/static/icons/food.png" class="income-icon">${currentIncome.food}`);
        }
        if (currentIncome.iron) parts.push(`<img src="/static/icons/iron.png" class="income-icon">+${currentIncome.iron}`);
        if (currentIncome.coal) parts.push(`<img src="/static/icons/coal.png" class="income-icon">+${currentIncome.coal}`);
        if (currentIncome.leather) parts.push(`<img src="/static/icons/leather.png" class="income-icon">+${currentIncome.leather}`);
        if (currentIncome.horses) parts.push(`<img src="/static/icons/horses.png" class="income-icon">+${currentIncome.horses}`);
        if (currentIncome.populationGrowth) parts.push(`👥+${currentIncome.populationGrowth}`);
        
        if (parts.length > 0) {
            incomeHtml = `<div class="building-income">${parts.slice(0, 2).join(' ')}</div>`;
        }
    }
    
    // Бонус для жилого района
    if (id === 'house' && level > 0 && config.population_bonus) {
        const totalBonus = config.population_bonus.slice(0, level).reduce((a, b) => a + b, 0);
        bonusHtml = `<div class="building-bonus">👥+${totalBonus}</div>`;
    }
    
    // Кнопка улучшения (маленькая)
    let upgradeBtn = '';
    if (level > 0 && level < config.max_level) {
        upgradeBtn = `
            <button class="upgrade-btn-small" onclick="event.stopPropagation(); showUpgradeModal('${id}')">
                🔨 Ур.${level + 1}
            </button>
        `;
    } else if (level === 0 && isTownHallLevelEnough(id, 1)) {
        upgradeBtn = `
            <button class="upgrade-btn-small" onclick="event.stopPropagation(); showUpgradeModal('${id}')">
                🔨 Построить
            </button>
        `;
    }
    
    return `
<div class="building-card ${statusClass}" onclick="showUpgradeModal('${id}')">
    <div class="building-icon">${config.icon}</div>
    <div class="building-name-container">
        <div class="building-name">${config.name}</div>
    </div>
    <div class="building-level">${level > 0 ? level : '-'}</div>
    <div class="building-income">${incomeHtml}</div>
    ${upgradeBtn}
    <div class="construction-progress" id="progress-${id}" style="display: none;">
        <div class="construction-bar" id="progress-bar-${id}"></div>
    </div>
</div>
`;
    }

// Показать модальное окно улучшения
function showUpgradeModal(buildingId) {
    console.log('🔨 Открытие модалки для:', buildingId);
    
    // Для ратуши
    if (buildingId === 'townhall') {
        const level = userData.townHallLevel;
        const nextLevel = level + 1;
        const nextIncome = TOWN_HALL_INCOME[nextLevel] || 0;
        const cost = TOWN_HALL_UPGRADE_COST[nextLevel] || { gold: 0, wood: 0, stone: 0 };
        
        const canUpgrade = userData.gold >= cost.gold && 
                          userData.wood >= cost.wood && 
                          userData.stone >= (cost.stone || 0);
        
        const modal = document.getElementById('upgradeModal');
        modal.innerHTML = `
            <div class="upgrade-header">
                <div class="upgrade-title">🏛️ Улучшить Ратушу до ${nextLevel} уровня</div>
            </div>
            
            <div class="upgrade-content">
                <div class="upgrade-income">
                    <div class="income-label">Прибыль на ${nextLevel} уровне:</div>
                    <div class="income-value"><img src="/static/icons/gold.png" class="income-icon"> +${nextIncome}/ч</div>
                </div>
                
                <div class="upgrade-cost">
                    <div class="cost-label">Стоимость улучшения:</div>
                    <div class="cost-resources">
                        <div class="cost-item ${userData.gold >= cost.gold ? 'enough' : 'not-enough'}">
                            <img src="/static/icons/gold.png" class="cost-icon-img">
                            <span class="cost-amount">${cost.gold}</span>
                        </div>
                        ${cost.wood > 0 ? `
                        <div class="cost-item ${userData.wood >= cost.wood ? 'enough' : 'not-enough'}">
                            <img src="/static/icons/wood.png" class="cost-icon-img">
                            <span class="cost-amount">${cost.wood}</span>
                        </div>
                        ` : ''}
                        ${cost.stone > 0 ? `
                        <div class="cost-item ${userData.stone >= cost.stone ? 'enough' : 'not-enough'}">
                            <img src="/static/icons/stone.png" class="cost-icon-img">
                            <span class="cost-amount">${cost.stone}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="upgrade-actions">
                    <button class="btn-upgrade ${canUpgrade ? 'available' : 'unavailable'}" 
                            onclick="confirmUpgrade('townhall')"
                            ${!canUpgrade ? 'disabled' : ''}>
                        🔨 Улучшить
                    </button>
                    <button class="btn-cancel" onclick="closeUpgradeModal()">
                        Отмена
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('upgradeOverlay').style.display = 'flex';
        selectedBuildingForUpgrade = buildingId;
        return;
    }
    
    // Для обычных зданий
    const config = window.BUILDINGS_CONFIG?.[buildingId];
    if (!config) {
        console.error('❌ Конфиг не найден для здания:', buildingId);
        return;
    }
    
    const level = getBuildingLevel(buildingId);
    const nextLevel = level + 1;
    const nextIncome = config.income?.[level] || {};
    const cost = level === 0 ? config.base_cost : (config.upgrade_costs?.[level - 1] || { gold: 0, wood: 0, stone: 0 });

    // Проверка требования к ратуше
    const requiredTownHall = config.requiredTownHall?.[level] || 1;
    const townHallEnough = userData.townHallLevel >= requiredTownHall;
    
    // Формируем строку с требованием ратуши
    let requirementHtml = '';
    if (!townHallEnough) {
        requirementHtml = `
            <div class="upgrade-requirement not-enough">
                <span class="requirement-icon">🏛️</span>
                <span class="requirement-text">Требуется ратуша ${requiredTownHall} уровня</span>
            </div>
        `;
    } else {
        requirementHtml = `
            <div class="upgrade-requirement enough">
                <span class="requirement-icon">🏛️</span>
                <span class="requirement-text">Ратуша ${requiredTownHall} уровня ✅</span>
            </div>
        `;
    }
    
    const canUpgrade = userData.gold >= cost.gold && 
                      userData.wood >= cost.wood && 
                      userData.stone >= (cost.stone || 0) &&
                      townHallEnough;
    
    // Формируем строку с доходом (с иконками)
    let incomeParts = [];
    if (nextIncome.gold) incomeParts.push(`<img src="/static/icons/gold.png" class="income-icon">+${nextIncome.gold}`);
    if (nextIncome.wood) incomeParts.push(`<img src="/static/icons/wood.png" class="income-icon">+${nextIncome.wood}`);
    if (nextIncome.stone) incomeParts.push(`<img src="/static/icons/stone.png" class="income-icon">+${nextIncome.stone}`);
    if (nextIncome.food) {
        if (nextIncome.food > 0) incomeParts.push(`<img src="/static/icons/food.png" class="income-icon">+${nextIncome.food}`);
        else if (nextIncome.food < 0) incomeParts.push(`<img src="/static/icons/food.png" class="income-icon">${nextIncome.food}`);
    }
    if (nextIncome.iron) incomeParts.push(`<img src="/static/icons/iron.png" class="income-icon">+${nextIncome.iron}`);
    if (nextIncome.coal) incomeParts.push(`<img src="/static/icons/coal.png" class="income-icon">+${nextIncome.coal}`);
    if (nextIncome.leather) incomeParts.push(`<img src="/static/icons/leather.png" class="income-icon">+${nextIncome.leather}`);
    if (nextIncome.horses) incomeParts.push(`<img src="/static/icons/horses.png" class="income-icon">+${nextIncome.horses}`);
    if (nextIncome.populationGrowth) incomeParts.push(`👥+${nextIncome.populationGrowth}`);
    
    const incomeText = incomeParts.length > 0 ? incomeParts.join(' ') : 'нет дохода';
    
    // Для жилого района показываем бонус к лимиту вместо дохода
    let incomeDisplay = '';
    if (buildingId === 'house' && config.population_bonus) {
        const nextBonus = config.population_bonus[level];
        incomeDisplay = `<div class="income-value">👥 +${nextBonus} лимит</div>`;
    } else {
        incomeDisplay = `<div class="income-value">${incomeText}/ч</div>`;
    }
    
    const modal = document.getElementById('upgradeModal');
    modal.innerHTML = `
        <div class="upgrade-header">
            <div class="upgrade-title">${level === 0 ? '🔨 Построить' : '🔨 Улучшить'} ${config.name} до ${nextLevel} уровня</div>
        </div>
        
        <div class="upgrade-content">
            <div class="upgrade-income">
                <div class="income-label">${buildingId === 'house' ? 'Бонус на ' + nextLevel + ' уровне:' : 'Прибыль на ' + nextLevel + ' уровне:'}</div>
                ${incomeDisplay}
            </div>
            
            ${requirementHtml}
            
            <div class="upgrade-cost">
                <div class="cost-label">Стоимость:</div>
                <div class="cost-resources">
                    <div class="cost-item ${userData.gold >= cost.gold ? 'enough' : 'not-enough'}">
                        <img src="/static/icons/gold.png" class="cost-icon-img">
                        <span class="cost-amount">${cost.gold}</span>
                    </div>
                    ${cost.wood > 0 ? `
                    <div class="cost-item ${userData.wood >= cost.wood ? 'enough' : 'not-enough'}">
                        <img src="/static/icons/wood.png" class="cost-icon-img">
                        <span class="cost-amount">${cost.wood}</span>
                    </div>
                    ` : ''}
                    ${cost.stone > 0 ? `
                    <div class="cost-item ${userData.stone >= cost.stone ? 'enough' : 'not-enough'}">
                        <img src="/static/icons/stone.png" class="cost-icon-img">
                        <span class="cost-amount">${cost.stone}</span>
                    </div>
                    ` : ''}
                    ${cost.iron > 0 ? `
                    <div class="cost-item ${userData.iron >= cost.iron ? 'enough' : 'not-enough'}">
                        <img src="/static/icons/iron.png" class="cost-icon-img">
                        <span class="cost-amount">${cost.iron}</span>
                    </div>
                    ` : ''}
                    ${cost.coal > 0 ? `
                    <div class="cost-item ${userData.coal >= cost.coal ? 'enough' : 'not-enough'}">
                        <img src="/static/icons/coal.png" class="cost-icon-img">
                        <span class="cost-amount">${cost.coal}</span>
                    </div>
                    ` : ''}
                    ${cost.leather > 0 ? `
                    <div class="cost-item ${userData.leather >= cost.leather ? 'enough' : 'not-enough'}">
                        <img src="/static/icons/leather.png" class="cost-icon-img">
                        <span class="cost-amount">${cost.leather}</span>
                    </div>
                    ` : ''}
                    ${cost.horses > 0 ? `
                    <div class="cost-item ${userData.horses >= cost.horses ? 'enough' : 'not-enough'}">
                        <img src="/static/icons/horses.png" class="cost-icon-img">
                        <span class="cost-amount">${cost.horses}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="upgrade-actions">
                <button class="btn-upgrade ${canUpgrade ? 'available' : 'unavailable'}" 
                        onclick="confirmUpgrade('${buildingId}')"
                        ${!canUpgrade ? 'disabled' : ''}>
                    ${level === 0 ? '🔨 Построить' : '🔨 Улучшить'}
                </button>
                <button class="btn-cancel" onclick="closeUpgradeModal()">
                    Отмена
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('upgradeOverlay').style.display = 'flex';
    selectedBuildingForUpgrade = buildingId;
}

// Закрыть окно улучшения
function closeUpgradeModal() {
    document.getElementById('upgradeOverlay').style.display = 'none';
    selectedBuildingForUpgrade = null;
}

// Подтвердить улучшение
async function confirmUpgrade(buildingId) {
    closeUpgradeModal();
    if (buildingId === 'townhall') {
        await upgradeTownHallConfirm();
    } else {
        const level = getBuildingLevel(buildingId);
        if (level === 0) {
            await buildBuilding(buildingId);
        } else {
            await upgradeBuilding(buildingId);
        }
    }
}

// Функция для подтверждения улучшения ратуши
async function upgradeTownHallConfirm() {
    const result = await apiRequest('upgrade_level', {});
    if (result.success) {
        if (result.state) {
            if (result.state.townHallLevel !== undefined) {
                userData.townHallLevel = result.state.townHallLevel;
                userData.level = result.state.townHallLevel;
            }
            Object.assign(userData, result.state);
        }
        updateCityUI();
    } else {
        showToast(`❌ ${result.error || 'Ошибка'}`);
    }
}

// Обновление отображения ратуши
function updateTownHallDisplay() {
    const income = TOWN_HALL_INCOME[userData.townHallLevel] || 0;
    document.getElementById('townHallIncome').innerHTML = `+${income} <img src="/static/icons/gold.png" class="income-icon">/ч`;
    
    // Скрываем элемент с текстом "Уровень X/5"
    const levelElement = document.getElementById('townHallLevel');
    if (levelElement) {
        levelElement.style.display = 'none';
    }
    
    // Обновляем кружок с цифрой
    const badge = document.getElementById('townHallLevelBadge');
    if (badge) {
        badge.textContent = userData.townHallLevel;
    } 
    // Обновляем кнопку
    const btn = document.getElementById('townHallUpgradeBtn');
    if (btn) {
        if (userData.townHallLevel >= 5) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'block';
        }
    }
    
    // Добавляем шкалу строительства для ратуши (если её ещё нет)
    let townHallProgress = document.getElementById('progress-townhall');
    if (!townHallProgress) {
        const townHall = document.getElementById('townHall');
        if (townHall) {
            const progressDiv = document.createElement('div');
            progressDiv.className = 'construction-progress';
            progressDiv.id = 'progress-townhall';
            progressDiv.style.display = 'none';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'construction-bar';
            progressBar.id = 'progress-bar-townhall';
            
            const progressText = document.createElement('div');
            progressText.className = 'construction-text';
            progressText.id = 'progress-text-townhall';
            
            progressDiv.appendChild(progressBar);
            progressDiv.appendChild(progressText);
            townHall.appendChild(progressDiv);
        }
    }
}

// Обновление UI города с сеткой 4x4 и правильным порядком
function updateCityUI() {
    updateResourcesDisplay();
    updateTownHallDisplay();
    
    // 1. ПРОИЗВОДСТВО (8 зданий)
    let productionHtml = '';
    productionHtml += generateBuildingCardHTML('farm');
    productionHtml += generateBuildingCardHTML('lumber');
    productionHtml += generateBuildingCardHTML('quarry');
    productionHtml += generateBuildingCardHTML('hunting_lodge');
    productionHtml += generateBuildingCardHTML('mines');
    productionHtml += generateBuildingCardHTML('ranch');
    productionHtml += generateBuildingCardHTML('fishing_wharf');
    productionHtml += generateBuildingCardHTML('charcoal_kiln');
    document.getElementById('productionBuildings').innerHTML = productionHtml;
    
    // 2. СОЦИАЛЬНЫЕ (6 зданий)
    let socialHtml = '';
    socialHtml += generateBuildingCardHTML('house');
    socialHtml += generateBuildingCardHTML('tavern');
    socialHtml += generateBuildingCardHTML('bath');
    socialHtml += generateBuildingCardHTML('chapel');
    socialHtml += generateBuildingCardHTML('almshouse');
    socialHtml += generateBuildingCardHTML('infirmary');
    document.getElementById('socialBuildings').innerHTML = socialHtml;
    
    // 3. ЭКОНОМИЧЕСКИЕ (4 здания)
    let economicHtml = '';
    economicHtml += generateBuildingCardHTML('market');
    economicHtml += generateBuildingCardHTML('pottery');
    economicHtml += generateBuildingCardHTML('guilds');
    economicHtml += generateBuildingCardHTML('weaving_workshop');
    document.getElementById('economicBuildings').innerHTML = economicHtml;
    
    // 4. ВОЕННЫЕ (7 зданий)
    let militaryHtml = '';
    militaryHtml += generateBuildingCardHTML('armorer');
    militaryHtml += generateBuildingCardHTML('weaponsmith');
    militaryHtml += generateBuildingCardHTML('foal_farm');
    militaryHtml += generateBuildingCardHTML('barracks');
    militaryHtml += generateBuildingCardHTML('shooting_range');
    militaryHtml += generateBuildingCardHTML('stables');
    militaryHtml += generateBuildingCardHTML('military_academy');
    document.getElementById('militaryBuildings').innerHTML = militaryHtml;
}

function toggleSection(section) {
    const el = document.getElementById(section + 'Section');
    if (el) el.classList.toggle('collapsed');
}

async function buildBuilding(id) {
    const existing = buildings.find(b => b.id === id);
    if (existing) {
        showToast('❌ Здание уже построено');
        return;
    }
    
    const result = await apiRequest('build', { building_id: id });
    
    if (result.success) {
        if (result.state) {
            Object.assign(userData, result.state);
            if (result.state.buildings) buildings = result.state.buildings;
        }
        updateCityUI();
    } else {
        showToast(`❌ ${result.error || 'Ошибка'}`);
    }
}

async function upgradeBuilding(id) {
    const building = buildings.find(b => b.id === id);
    if (!building) {
        await buildBuilding(id);
        return;
    }
    
    const result = await apiRequest('upgrade', { building_id: id });
    
    if (result.success) {
        if (result.state) {
            Object.assign(userData, result.state);
            if (result.state.buildings) buildings = result.state.buildings;
        }
        updateCityUI();
    } else {
        showToast(`❌ ${result.error || 'Ошибка'}`);
    }
}

// Улучшение ратуши через модальное окно
async function upgradeTownHall() {
    if (userData.townHallLevel >= 5) {
        showToast('🏛️ Максимальный уровень');
        return;
    }
    showUpgradeModal('townhall');
}
