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
    const config = BUILDINGS_CONFIG[buildingId];
    if (!config || level === 0 || !config.income) return {};
    return config.income[level - 1] || {};
}

// Получить стоимость улучшения
function getUpgradeCost(buildingId, currentLevel) {
    if (buildingId === 'townhall') {
        return TOWN_HALL_UPGRADE_COST[currentLevel + 1] || { gold: 0, wood: 0, stone: 0 };
    }
    const config = BUILDINGS_CONFIG[buildingId];
    if (!config || currentLevel >= config.maxLevel) return { gold: 0, wood: 0, stone: 0 };
    return config.upgradeCosts[currentLevel - 1] || { gold: 0, wood: 0, stone: 0 };
}

// Проверить, достаточно ли уровня ратуши
function isTownHallLevelEnough(buildingId, targetLevel) {
    if (buildingId === 'townhall') return true;
    const config = BUILDINGS_CONFIG[buildingId];
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
    
    const config = BUILDINGS_CONFIG[buildingId];
    if (!config) return false;
    
    if (currentLevel === 0) {
        const cost = config.baseCost;
        return isTownHallLevelEnough(buildingId, 1) && 
               userData.gold >= cost.gold && 
               userData.wood >= cost.wood;
    }
    
    if (currentLevel >= config.maxLevel) return false;
    if (!isTownHallLevelEnough(buildingId, currentLevel + 1)) return false;
    
    const cost = getUpgradeCost(buildingId, currentLevel);
    return userData.gold >= cost.gold && 
           userData.wood >= cost.wood && 
           userData.stone >= cost.stone;
}

// Генерация HTML для карточки здания
function generateBuildingCardHTML(id) {
    const config = BUILDINGS_CONFIG[id];
    if (!config) return '';
    
    const level = getBuildingLevel(id);
    
    let statusClass = '';
    let statusBadge = '';
    let bonusText = '';
    let incomeText = '';
    
    // Бонус для жилого района
    if (id === 'house' && level > 0) {
        const totalBonus = config.populationBonus.slice(0, level).reduce((a, b) => a + b, 0);
        bonusText = `<div class="building-bonus">👥 +${totalBonus} лимит</div>`;
    }
    
    // Статус здания
    if (level === 0) {
        if (!isTownHallLevelEnough(id, 1)) {
            statusClass = 'locked';
            const reqLevel = config.requiredTownHall ? config.requiredTownHall[0] : 1;
            statusBadge = `<span class="building-status locked">🔒 Требуется ратуша ${reqLevel}</span>`;
        } else {
            statusClass = 'unavailable';
            statusBadge = '<span class="building-status">🚫 Не построено</span>';
        }
    } else {
        statusClass = 'available';
        statusBadge = `<span class="building-status built">Ур. ${level}</span>`;
    }
    
    // Текущий доход
    if (level > 0) {
        const currentIncome = getBuildingIncome(id, level);
        let parts = [];
        if (currentIncome.gold) parts.push(`🪙+${currentIncome.gold}`);
        if (currentIncome.wood) parts.push(`🪵+${currentIncome.wood}`);
        if (currentIncome.stone) parts.push(`⛰️+${currentIncome.stone}`);
        if (currentIncome.food) {
            if (currentIncome.food > 0) parts.push(`🌾+${currentIncome.food}`);
            else if (currentIncome.food < 0) parts.push(`🌾${currentIncome.food}`);
        }
        if (currentIncome.populationGrowth) parts.push(`👥+${currentIncome.populationGrowth}`);
        
        if (parts.length > 0) {
            incomeText = `<div class="building-income">📊 ${parts.join(' ')}/ч</div>`;
        }
    }
    
    // Кнопка улучшения
    let upgradeBtn = '';
    if (level > 0 && level < config.maxLevel) {
        upgradeBtn = `
            <button class="building-upgrade-btn available" onclick="event.stopPropagation(); showUpgradeModal('${id}')">
                Улучшить до Ур.${level + 1}
            </button>
        `;
    } else if (level === 0 && isTownHallLevelEnough(id, 1)) {
        upgradeBtn = `
            <button class="building-upgrade-btn available" onclick="event.stopPropagation(); showUpgradeModal('${id}')">
                Построить
            </button>
        `;
    }
    
    return `
    <div class="building-card ${statusClass}" onclick="showUpgradeModal('${id}')">
        <div class="building-icon">${config.icon}</div>
        <div class="building-info">
            <div class="building-header">
                <span class="building-name">${config.name}</span>
                ${statusBadge}
            </div>
            
            ${level > 0 ? `<div class="building-level-badge">${level}</div>` : ''}
            
            <div class="construction-progress" id="progress-${id}" style="display: none;">
                <div class="construction-bar" id="progress-bar-${id}"></div>
                <div class="construction-text" id="progress-text-${id}"></div>
            </div>
            
            ${bonusText}
            ${incomeText}
            ${upgradeBtn}
        </div>
    </div>
`;
}

// Показать модальное окно улучшения
function showUpgradeModal(buildingId) {
    console.log('🏗️ Открытие модалки для:', buildingId);
    
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
                    <div class="income-value">🪙 +${nextIncome}/ч</div>
                </div>
                
                <div class="upgrade-cost">
                    <div class="cost-label">Стоимость улучшения:</div>
                    <div class="cost-resources">
                        <div class="cost-item ${userData.gold >= cost.gold ? 'enough' : 'not-enough'}">
                            <span class="cost-icon">🪙</span>
                            <span class="cost-amount">${cost.gold}</span>
                        </div>
                        ${cost.wood > 0 ? `
                        <div class="cost-item ${userData.wood >= cost.wood ? 'enough' : 'not-enough'}">
                            <span class="cost-icon">🪵</span>
                            <span class="cost-amount">${cost.wood}</span>
                        </div>
                        ` : ''}
                        ${cost.stone > 0 ? `
                        <div class="cost-item ${userData.stone >= cost.stone ? 'enough' : 'not-enough'}">
                            <span class="cost-icon">⛰️</span>
                            <span class="cost-amount">${cost.stone}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="upgrade-actions">
                    <button class="btn-upgrade ${canUpgrade ? 'available' : 'unavailable'}" 
                            onclick="confirmUpgrade('townhall')"
                            ${!canUpgrade ? 'disabled' : ''}>
                        Улучшить
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
    const config = BUILDINGS_CONFIG[buildingId];
    if (!config) return;
    
    const level = getBuildingLevel(buildingId);
    const nextLevel = level + 1;
    const nextIncome = config.income?.[level] || {};
    const cost = level === 0 ? config.baseCost : config.upgradeCosts[level - 1];
    
    const canUpgrade = userData.gold >= cost.gold && 
                      userData.wood >= cost.wood && 
                      userData.stone >= (cost.stone || 0);
    
    // Формируем строку с доходом
    let incomeParts = [];
    if (nextIncome.gold) incomeParts.push(`🪙+${nextIncome.gold}`);
    if (nextIncome.wood) incomeParts.push(`🪵+${nextIncome.wood}`);
    if (nextIncome.stone) incomeParts.push(`⛰️+${nextIncome.stone}`);
    if (nextIncome.food) {
        if (nextIncome.food > 0) incomeParts.push(`🌾+${nextIncome.food}`);
        else if (nextIncome.food < 0) incomeParts.push(`🌾${nextIncome.food}`);
    }
    if (nextIncome.populationGrowth) incomeParts.push(`👥+${nextIncome.populationGrowth}`);
    
    const incomeText = incomeParts.length > 0 ? incomeParts.join(' ') : 'нет дохода';
    
    // Для жилого района показываем бонус к лимиту вместо дохода
let incomeDisplay = '';
if (buildingId === 'house') {
    const nextBonus = config.populationBonus[level]; // бонус на СЛЕДУЮЩЕМ уровне
    incomeDisplay = `<div class="income-value">👥 +${nextBonus} лимит</div>`;
} else {
    incomeDisplay = `<div class="income-value">${incomeText}/ч</div>`;
}
    
    const modal = document.getElementById('upgradeModal');
    modal.innerHTML = `
        <div class="upgrade-header">
            <div class="upgrade-title">${level === 0 ? '🏗️ Построить' : '⬆️ Улучшить'} ${config.name} до ${nextLevel} уровня</div>
        </div>
        
        <div class="upgrade-content">
            <div class="upgrade-income">
    <div class="income-label">${buildingId === 'house' ? 'Бонус на ' + nextLevel + ' уровне:' : 'Прибыль на ' + nextLevel + ' уровне:'}</div>
    ${incomeDisplay}
</div>
            
            <div class="upgrade-cost">
                <div class="cost-label">Стоимость:</div>
                <div class="cost-resources">
                    <div class="cost-item ${userData.gold >= cost.gold ? 'enough' : 'not-enough'}">
                        <span class="cost-icon">🪙</span>
                        <span class="cost-amount">${cost.gold}</span>
                    </div>
                    ${cost.wood > 0 ? `
                    <div class="cost-item ${userData.wood >= cost.wood ? 'enough' : 'not-enough'}">
                        <span class="cost-icon">🪵</span>
                        <span class="cost-amount">${cost.wood}</span>
                    </div>
                    ` : ''}
                    ${cost.stone > 0 ? `
                    <div class="cost-item ${userData.stone >= cost.stone ? 'enough' : 'not-enough'}">
                        <span class="cost-icon">⛰️</span>
                        <span class="cost-amount">${cost.stone}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="upgrade-actions">
                <button class="btn-upgrade ${canUpgrade ? 'available' : 'unavailable'}" 
                        onclick="confirmUpgrade('${buildingId}')"
                        ${!canUpgrade ? 'disabled' : ''}>
                    ${level === 0 ? 'Построить' : 'Улучшить'}
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
    document.getElementById('townHallIncome').textContent = `+${income} 🪙/ч`;
    
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
    
    // Обновляем уровень игрока (справа от ника)
    const levelBadge = document.getElementById('levelBadge');
    if (levelBadge) {
        levelBadge.textContent = userData.townHallLevel;
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

// Обновление UI города
function updateCityUI() {
    updateResourcesDisplay();
    updateTownHallDisplay();
    
    let socialHtml = generateBuildingCardHTML('house');
    if (BUILDINGS_CONFIG['tavern']) socialHtml += generateBuildingCardHTML('tavern');
    if (BUILDINGS_CONFIG['bath']) socialHtml += generateBuildingCardHTML('bath');
    document.getElementById('socialBuildings').innerHTML = socialHtml;
    
    let economicHtml = '';
    economicHtml += generateBuildingCardHTML('farm');
    economicHtml += generateBuildingCardHTML('lumber');
    economicHtml += generateBuildingCardHTML('quarry');
    document.getElementById('economicBuildings').innerHTML = economicHtml;
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
