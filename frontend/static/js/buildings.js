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
    
    return config.upgradeCosts[currentLevel - 1];
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
        statusBadge = `<span class="building-status built">🏗️ Ур. ${level}</span>`;
    }
    
    // Для жилого района показываем бонус к лимиту
    if (id === 'house' && level > 0) {
        const totalBonus = config.populationBonus.slice(0, level).reduce((a, b) => a + b, 0);
        bonusText = `<div class="building-bonus">👥 +${totalBonus} лимит</div>`;
    }
    
    // Текущий доход
    const currentIncome = getBuildingIncome(id, level);
    let incomeText = '';
    if (level > 0 && Object.keys(currentIncome).length > 0) {
        let parts = [];
        
        if (currentIncome.gold !== undefined && currentIncome.gold !== 0) {
            parts.push(`🪙+${currentIncome.gold * count}`);
        }
        if (currentIncome.wood !== undefined && currentIncome.wood !== 0) {
            parts.push(`🪵+${currentIncome.wood * count}`);
        }
        if (currentIncome.stone !== undefined && currentIncome.stone !== 0) {
            parts.push(`⛰️+${currentIncome.stone * count}`);
        }
        if (currentIncome.food !== undefined) {
            if (currentIncome.food > 0) {
                parts.push(`🌾+${currentIncome.food * count}`);
            } else if (currentIncome.food < 0) {
                parts.push(`🌾${currentIncome.food * count}`);
            }
        }
        if (currentIncome.populationGrowth !== undefined && currentIncome.populationGrowth > 0) {
            parts.push(`👥+${currentIncome.populationGrowth * count}`);
        }
        
        if (parts.length > 0) {
            incomeText = `<div class="building-income">📊 Доход: ${parts.join(' ')}/ч</div>`;
        }
    }
    
    // Доход на следующем уровне
    let nextIncomeText = '';
    let upgradeBtn = '';
    
    if (level > 0 && level < config.maxLevel) {
        const nextIncome = config.income[level];
        const cost = getUpgradeCost(id, level);
        const canUpgradeNow = canUpgrade(id, level);
        
        // Для жилого района показываем бонус к лимиту на следующем уровне
        if (id === 'house') {
            const totalBonus = config.populationBonus.slice(0, level).reduce((a, b) => a + b, 0);
            const nextBonus = totalBonus + config.populationBonus[level];
            nextIncomeText = `<div class="building-next-income">📈 Ур.${level+1}: 👥 +${nextBonus} лимит</div>`;
        } else {
            let parts = [];
            if (nextIncome.gold !== undefined && nextIncome.gold !== 0) {
                parts.push(`🪙+${nextIncome.gold}`);
            }
            if (nextIncome.wood !== undefined && nextIncome.wood !== 0) {
                parts.push(`🪵+${nextIncome.wood}`);
            }
            if (nextIncome.stone !== undefined && nextIncome.stone !== 0) {
                parts.push(`⛰️+${nextIncome.stone}`);
            }
            if (nextIncome.food !== undefined) {
                if (nextIncome.food > 0) {
                    parts.push(`🌾+${nextIncome.food}`);
                } else if (nextIncome.food < 0) {
                    parts.push(`🌾${nextIncome.food}`);
                }
            }
            if (nextIncome.populationGrowth !== undefined && nextIncome.populationGrowth > 0) {
                parts.push(`👥+${nextIncome.populationGrowth}`);
            }
            
            if (parts.length > 0) {
                nextIncomeText = `<div class="building-next-income">📈 Ур.${level+1}: ${parts.join(' ')}/ч</div>`;
            }
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
            if (firstIncome.gold !== undefined && firstIncome.gold !== 0) {
                parts.push(`🪙+${firstIncome.gold}`);
            }
            if (firstIncome.wood !== undefined && firstIncome.wood !== 0) {
                parts.push(`🪵+${firstIncome.wood}`);
            }
            if (firstIncome.stone !== undefined && firstIncome.stone !== 0) {
                parts.push(`⛰️+${firstIncome.stone}`);
            }
            if (firstIncome.food !== undefined) {
                if (firstIncome.food > 0) {
                    parts.push(`🌾+${firstIncome.food}`);
                } else if (firstIncome.food < 0) {
                    parts.push(`🌾${firstIncome.food}`);
                }
            }
            if (firstIncome.populationGrowth !== undefined && firstIncome.populationGrowth > 0) {
                parts.push(`👥+${firstIncome.populationGrowth}`);
            }
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
                ${bonusText}
                ${incomeText}
                ${nextIncomeText}
                ${upgradeBtn}
            </div>
        </div>
    `;
}

// Обновление отображения ратуши
function updateTownHallDisplay() {
    const income = TOWN_HALL_INCOME[userData.townHallLevel] || 0;
    document.getElementById('townHallIncome').textContent = `+${income} 🪙/ч`;
    document.getElementById('townHallLevel').textContent = userData.townHallLevel;
    document.getElementById('townHallLevelBadge').textContent = userData.townHallLevel;
}

// Обновление UI города
function updateCityUI() {
    updateResourcesDisplay();
    updateTownHallDisplay();
    
    // Социальные постройки
    let socialHtml = generateBuildingCardHTML('house');
    if (BUILDINGS_CONFIG['tavern']) socialHtml += generateBuildingCardHTML('tavern');
    if (BUILDINGS_CONFIG['bath']) socialHtml += generateBuildingCardHTML('bath');
    document.getElementById('socialBuildings').innerHTML = socialHtml;
    
    // Экономические постройки
    let economicHtml = '';
    economicHtml += generateBuildingCardHTML('farm');
    economicHtml += generateBuildingCardHTML('lumber');
    economicHtml += generateBuildingCardHTML('quarry');
    document.getElementById('economicBuildings').innerHTML = economicHtml;
}

// Переключение секций
function toggleSection(section) {
    const el = document.getElementById(section + 'Section');
    if (el) el.classList.toggle('collapsed');
}

// Постройка здания
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

// Улучшение здания
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

// Улучшение ратуши
async function upgradeTownHall() {
    if (userData.townHallLevel >= 5) {
        showToast('🏛️ Максимальный уровень');
        return;
    }
    
    const result = await apiRequest('upgrade_level', {});
    
    if (result.success) {
        if (result.state) {
            Object.assign(userData, result.state);
        }
        updateCityUI();
        showToast('🏛️ Ратуша улучшена!');
    } else {
        showToast(`❌ ${result.error || 'Ошибка'}`);
    }
}
