// buildings.js - логика построек, генерация карточек, улучшения

// Получить уровень здания
function getBuildingLevel(id) {
    return buildings.find(b => b.id === id)?.level || 0;
}

// Получить доход здания на определённом уровне
function getBuildingIncome(buildingId, level) {
    if (buildingId === 'townhall') return {gold: TOWN_HALL_INCOME[level] || 0};
    const config = BUILDINGS_CONFIG[buildingId];
    if (!config || level === 0 || !config.income) return {};
    return config.income[level - 1] || {};
}

// Генерация HTML для карточки здания
function generateBuildingCardHTML(id) {
    const config = BUILDINGS_CONFIG[id];
    if (!config) return '';

    const level = getBuildingLevel(id);
    let statusClass = '', lockText = '';

    if (level === 0) {
        if (userData.level < (config.requiredTownHall?.[0] || 1)) {
            statusClass = 'locked';
            lockText = `<div class="building-lock-text">🔒 Требуется ратуша ${config.requiredTownHall[0]}</div>`;
        } else {
            statusClass = 'unavailable';
        }
    } else {
        statusClass = 'available';
    }

    const current = getBuildingIncome(id, level);
    let incomeText = '';
    if (level > 0 && Object.keys(current).length) {
        const parts = [];
        if (current.gold) parts.push(`🪙 +${current.gold}`);
        if (current.wood) parts.push(`🪵 +${current.wood}`);
        if (current.stone) parts.push(`⛰️ +${current.stone}`);
        if (current.food) parts.push(current.food > 0 ? `🌾 +${current.food}` : `🌾 ${current.food}`);
        if (current.populationGrowth) parts.push(`👥 +${current.populationGrowth}`);
        incomeText = `<div class="building-income">${parts.join(' • ')}/ч</div>`;
    }

    // Бонус для жилого района
    let bonusText = '';
    if (id === 'house' && level > 0) {
        const totalBonus = config.populationBonus.slice(0, level).reduce((a, b) => a + b, 0);
        bonusText = `<div class="building-bonus">👥 +${totalBonus} лимит</div>`;
    }

    // Кнопка улучшения/постройки
    let buttonHtml = '';
    if (level > 0 && level < config.maxLevel) {
        const canUpgradeNow = canUpgrade(id, level);
        buttonHtml = `<button class="building-upgrade-btn ${canUpgradeNow ? '' : 'unavailable'}" 
            onclick="${canUpgradeNow ? `showUpgradeModal('${id}')` : ''}">
            Улучшить
        </button>`;
    } else if (level === 0 && !lockText) {
        const canBuildNow = canUpgrade(id, 0);
        buttonHtml = `<button class="building-upgrade-btn ${canBuildNow ? '' : 'unavailable'}" 
            onclick="${canBuildNow ? `showUpgradeModal('${id}')` : ''}">
            Построить
        </button>`;
    }

    return `
        <div class="building-card ${statusClass}">
            <div class="building-header">
                <div class="building-icon">${config.icon}</div>
                <div class="building-title">
                    <div class="building-name">${config.name}</div>
                </div>
            </div>
            ${level > 0 ? `<div class="building-level-badge">${level}</div>` : ''}
            ${bonusText}
            ${incomeText}
            ${buttonHtml}
            ${lockText}
        </div>
    `;
}

// Обновление отображения ратуши
function updateTownHallDisplay() {
    const income = TOWN_HALL_INCOME[userData.level] || 0;
    document.getElementById('townHallIncome').textContent = `+${income} 🪙/ч`;
    document.getElementById('townHallLevelBadge').textContent = userData.level;

    const upgradeBtn = document.getElementById('townHallUpgradeBtn');
    if (upgradeBtn) {
        if (userData.level >= 5) {
            upgradeBtn.style.display = 'none';
        } else {
            upgradeBtn.style.display = 'block';
            const canUpgrade = userData.gold >= TOWN_HALL_UPGRADE_COST[userData.level + 1].gold &&
                              userData.wood >= TOWN_HALL_UPGRADE_COST[userData.level + 1].wood &&
                              userData.stone >= TOWN_HALL_UPGRADE_COST[userData.level + 1].stone;
            upgradeBtn.className = canUpgrade ? 'town-hall-upgrade-btn' : 'town-hall-upgrade-btn unavailable';
        }
    }
}

// Обновление UI города
function updateCityUI() {
    updateResourcesDisplay();
    updateTownHallDisplay();

    document.getElementById('socialBuildings').innerHTML = 
        generateBuildingCardHTML('house') + 
        generateBuildingCardHTML('tavern') + 
        generateBuildingCardHTML('bath');

    document.getElementById('economicBuildings').innerHTML = 
        generateBuildingCardHTML('farm') + 
        generateBuildingCardHTML('lumber') + 
        generateBuildingCardHTML('quarry');
}

// Переключение секций (свернуть/развернуть)
function toggleSection(section) {
    const el = document.getElementById(section + 'Section');
    el.classList.toggle('collapsed');
}

// Показать модальное окно улучшения
function showUpgradeModal(buildingId) {
    const config = BUILDINGS_CONFIG[buildingId];
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
            
            <div class="upgrade-cost">
                <h4>Стоимость:</h4>
                <div class="upgrade-cost-item">
                    <span>🪙 Золото:</span>
                    <span>${cost.gold}</span>
                </div>
                <div class="upgrade-cost-item">
                    <span>🪵 Дерево:</span>
                    <span>${cost.wood}</span>
                </div>
                ${cost.stone ? `
                <div class="upgrade-cost-item">
                    <span>⛰️ Камень:</span>
                    <span>${cost.stone}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="upgrade-actions">
                <button class="btn" onclick="confirmUpgrade('${buildingId}')">
                    ${level === 0 ? 'Построить' : 'Улучшить'}
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

// Подтвердить улучшение (вызывается из модального окна)
async function confirmUpgrade(buildingId) {
    closeUpgradeModal();
    const level = getBuildingLevel(buildingId);
    if (level === 0) {
        await buildBuilding(buildingId);
    } else {
        await upgradeBuilding(buildingId);
    }
}

// Постройка здания
async function buildBuilding(id) {
    if (buildings.find(b => b.id === id)) {
        showToast('❌ Здание уже построено');
        return;
    }
    const result = await apiRequest('build', { building_id: id });
    if (result.success) {
        Object.assign(userData, result.state);
        if (result.state.buildings) buildings = result.state.buildings;
        updateCityUI();
        showToast('✅ Построено!');
    } else {
        showToast(`❌ ${result.error || 'Ошибка'}`);
    }
}

// Улучшение здания
async function upgradeBuilding(id) {
    const b = buildings.find(b => b.id === id);
    if (!b) {
        await buildBuilding(id);
        return;
    }
    const result = await apiRequest('upgrade', { building_id: id });
    if (result.success) {
        Object.assign(userData, result.state);
        if (result.state.buildings) buildings = result.state.buildings;
        updateCityUI();
        showToast('✅ Улучшено!');
    } else {
        showToast(`❌ ${result.error || 'Ошибка'}`);
    }
}

// Улучшение ратуши
async function upgradeTownHall() {
    if (userData.level >= 5) {
        showToast('🏛️ Максимальный уровень');
        return;
    }
    showUpgradeModal('townhall');
}
