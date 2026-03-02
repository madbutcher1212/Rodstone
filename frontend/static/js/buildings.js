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
    
    const multiplier = currentLevel + 1;
    return {
        gold: config.baseCost.gold * multiplier,
        wood: config.baseCost.wood * multiplier,
        stone: config.baseCost.stone * multiplier
    };
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
    const count = getBuildingCount(id);
    
    let statusClass = '';
    let statusBadge = '';
    let bonusText = '';
    
    if (id === 'house' && level > 0) {
        const totalBonus = config.populationBonus.slice(0, level).reduce((a, b) => a + b, 0);
        bonusText = `<div class="building-bonus">👥 +${totalBonus} лимит</div>`;
    }
    
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
        statusBadge = `<span class="building-status built">🏗️ Ур. ${level}</span>`;
    }
    
    const currentIncome = getBuildingIncome(id, level);
    let incomeText = '';
    if (level > 0 && Object.keys(currentIncome).length > 0) {
        let parts = [];
        if (currentIncome.gold) parts.push(`🪙+${currentIncome.gold * count}`);
        if (currentIncome.wood) parts.push(`🪵+${currentIncome.wood * count}`);
        if (currentIncome.stone) parts.push(`⛰️+${currentIncome.stone * count}`);
        if (currentIncome.food) {
            if (currentIncome.food > 0) parts.push(`🌾+${currentIncome.food * count}`);
            else if (currentIncome.food < 0) parts.push(`🌾${currentIncome.food * count}`);
        }
        if (currentIncome.populationGrowth) parts.push(`👥+${currentIncome.populationGrowth * count}`);
        if (parts.length > 0) {
            incomeText = `<div class="building-income">📊 Доход: ${parts.join(' ')}/ч</div>`;
        }
    }
    
    let nextIncomeText = '';
    let upgradeBtn = '';
    
    if (level > 0 && level < config.maxLevel) {
        const nextIncome = config.income[level];
        const cost = getUpgradeCost(id, level);
        const canUpgradeNow = canUpgrade(id, level);
        
        let parts = [];
        if (nextIncome.gold) parts.push(`🪙+${nextIncome.gold}`);
        if (nextIncome.wood) parts.push(`🪵+${nextIncome.wood}`);
        if (nextIncome.stone) parts.push(`⛰️+${nextIncome.stone}`);
        if (nextIncome.food) {
            if (nextIncome.food > 0) parts.push(`🌾+${nextIncome.food}`);
            else if (nextIncome.food < 0) parts.push(`🌾${nextIncome.food}`);
        }
        if (nextIncome.populationGrowth) parts.push(`👥+${nextIncome.populationGrowth}`);
        
        if (parts.length > 0) {
            nextIncomeText = `<div class="building-next-income">📈 Ур.${level+1}: ${parts.join(' ')}/ч</div>`;
        }
        
        let reqText = '';
        if (!isTownHallLevelEnough(id, level + 1)) {
            const reqLevel = config.requiredTownHall ? config.requiredTownHall[level] : level + 1;
            reqText = ` (треб. ратуша ${reqLevel})`;
        }
        
        let btnClass = canUpgradeNow ? 'building-upgrade-btn available' : 'building-upgrade-btn unavailable';
        
        upgradeBtn = `
            <button class="${btnClass}" onclick="upgradeBuilding('${id}')" 
                    ${!canUpgradeNow ? 'disabled' : ''}>
                Улучшить до Ур.${level+1}${reqText} (🪙${cost.gold} 🪵${cost.wood}${cost.stone > 0 ? ` ⛰️${cost.stone}` : ''})
            </button>
        `;
    } else if (level === 0 && isTownHallLevelEnough(id, 1)) {
        const cost = config.baseCost;
        const canBuildNow = userData.gold >= cost.gold && userData.wood >= cost.wood;
        
        let btnClass = canBuildNow ? 'building-upgrade-btn available' : 'building-upgrade-btn unavailable';
        
        const firstIncome = config.income[0];
        let incomePreview = '';
        if (firstIncome) {
            let parts = [];
            if (firstIncome.gold) parts.push(`🪙+${firstIncome.gold}`);
            if (firstIncome.wood) parts.push(`🪵+${firstIncome.wood}`);
            if (firstIncome.stone) parts.push(`⛰️+${firstIncome.stone}`);
            if (firstIncome.food) {
                if (firstIncome.food > 0) parts.push(`🌾+${firstIncome.food}`);
                else if (firstIncome.food < 0) parts.push(`🌾${firstIncome.food}`);
            }
            if (firstIncome.populationGrowth) parts.push(`👥+${firstIncome.populationGrowth}`);
            if (parts.length > 0) {
                incomePreview = `<div class="building-next-income">📈 Доход: ${parts.join(' ')}/ч</div>`;
            }
        }
        
        upgradeBtn = `
            ${incomePreview}
            <button class="${btnClass}" onclick="buildBuilding('${id}')" 
                    ${!canBuildNow ? 'disabled' : ''}>
                Построить (🪙${cost.gold} 🪵${cost.wood})
            </button>
        `;
    }
    
   return `
    <div class="building-card ${statusClass}">
        <div class="building-icon">${config.icon}</div>
        <div class="building-info">
            <div class="building-header">
                <span class="building-name">${config.name}</span>
                ${statusBadge}
            </div>
            
            <!-- Бейдж уровня (справа в кружке) -->
            ${level > 0 ? `<div class="building-level-badge">${level}</div>` : ''}
            
            <!-- Шкала строительства для всех зданий -->
            <div class="construction-progress" id="progress-${id}" style="display: none;">
                <div class="construction-bar" id="progress-bar-${id}"></div>
            </div>
            
            ${bonusText}
            ${incomeText}
            ${nextIncomeText}
            ${upgradeBtn}
        </div>
    </div>
`;
}

// Показать модальное окно улучшения
function showUpgradeModal(buildingId) {
    console.log('🏗️ Открытие модалки для:', buildingId);
    
    // Для ратуши свои данные
    if (buildingId === 'townhall') {
        const level = userData.townHallLevel;
        const nextLevel = level + 1;
        const nextIncome = TOWN_HALL_INCOME[nextLevel] || 0;
        const cost = TOWN_HALL_UPGRADE_COST[nextLevel] || { gold: 0, wood: 0, stone: 0 };
        
        const modal = document.getElementById('upgradeModal');
        modal.innerHTML = `
            <div class="upgrade-info">
                <h3>Улучшить Ратушу</h3>
                
                <div class="upgrade-levels">
                    <div class="upgrade-level-current">
                        <span>${level}</span>
                        <small>текущий</small>
                    </div>
                    <div class="upgrade-arrow">→</div>
                    <div class="upgrade-level-next">
                        <span>${nextLevel}</span>
                        <small>новый</small>
                    </div>
                </div>
                
                <div class="upgrade-income">
                    <h4>Прибыль на ${nextLevel} уровне:</h4>
                    <div class="upgrade-income-item">🪙 +${nextIncome}/ч</div>
                </div>
                
                <div class="upgrade-actions">
                    <button class="btn" onclick="confirmUpgrade('townhall')">
                        Улучшить (🪙${cost.gold} 🪵${cost.wood}${cost.stone ? ` ⛰️${cost.stone}` : ''})
                    </button>
                    <button class="btn btn-secondary" onclick="closeUpgradeModal()">Отмена</button>
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
    
    let incomeHtml = '';
    const parts = [];
    if (nextIncome.gold) parts.push(`🪙 +${nextIncome.gold}`);
    if (nextIncome.wood) parts.push(`🪵 +${nextIncome.wood}`);
    if (nextIncome.stone) parts.push(`⛰️ +${nextIncome.stone}`);
    if (nextIncome.food) parts.push(nextIncome.food > 0 ? `🌾 +${nextIncome.food}` : `🌾 ${nextIncome.food}`);
    if (nextIncome.populationGrowth) parts.push(`👥 +${nextIncome.populationGrowth}`);
    
    if (parts.length) {
        incomeHtml = parts.join('<br>');
    } else {
        incomeHtml = 'нет дохода';
    }
    
    const modal = document.getElementById('upgradeModal');
    modal.innerHTML = `
        <div class="upgrade-info">
            <h3>${level === 0 ? 'Постройка' : 'Улучшить'} ${config.name}</h3>
            
            <div class="upgrade-levels">
                <div class="upgrade-level-current">
                    <span>${level || 0}</span>
                    <small>текущий</small>
                </div>
                <div class="upgrade-arrow">→</div>
                <div class="upgrade-level-next">
                    <span>${nextLevel}</span>
                    <small>новый</small>
                </div>
            </div>
            
            <div class="upgrade-income">
                <h4>Прибыль на ${nextLevel} уровне:</h4>
                <div class="upgrade-income-item">${incomeHtml}</div>
            </div>
            
            <div class="upgrade-actions">
                <button class="btn" onclick="confirmUpgrade('${buildingId}')">
                    ${level === 0 ? 'Построить' : 'Улучшить'} (🪙${cost.gold} 🪵${cost.wood}${cost.stone ? ` ⛰️${cost.stone}` : ''})
                </button>
                <button class="btn btn-secondary" onclick="closeUpgradeModal()">Отмена</button>
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

// Новая функция для подтверждения улучшения ратуши
async function upgradeTownHallConfirm() {
    const result = await apiRequest('upgrade_level', {});
    if (result.success) {
        if (result.state) {
            // Явно обновляем уровень ратуши
            if (result.state.townHallLevel !== undefined) {
                userData.townHallLevel = result.state.townHallLevel;
            }
            Object.assign(userData, result.state);
        }
        updateCityUI();
        showToast('🏛️ Ратуша улучшена!');
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
        levelElement.style.display = 'none';  // или levelElement.remove() для полного удаления
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
        showToast('✅ Построено!');
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
        showToast('✅ Улучшено!');
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
