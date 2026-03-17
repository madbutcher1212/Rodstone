// crafting.js - управление крафтом

let craftingInProgress = false;
let craftingEndTime = null;
let currentCraftingItem = null;
let currentCraftingType = null;

// Открыть окно крафта для здания
function openCrafting(buildingType) {
    console.log(`🔨 Открытие крафта для ${buildingType}`);
    currentCraftingItem = null;
    currentCraftingType = buildingType;
    
    if (buildingType === 'weaving_workshop') {
        showGambesonCrafting();
    } else if (buildingType === 'armorer') {
        showArmorerCrafting();
    } else if (buildingType === 'weaponsmith') {
        showWeaponsmithCrafting();
    } else if (buildingType === 'bow_workshop') {
        showBowCrafting();
    } else if (buildingType === 'shield_workshop') {
        showShieldCrafting();
    } else if (buildingType === 'saddle_workshop') {
        showSaddleCrafting();
    } else {
        console.log(`❌ Неизвестный тип мастерской: ${buildingType}`);
        showToast('🚧 Крафт для этого здания в разработке');
    }
}

// Показать окно крафта стеганки (ткацкая мастерская)
function showGambesonCrafting() {
    const modal = document.getElementById('craftingModal');
    const content = document.getElementById('craftingContent');
    
    content.innerHTML = `
        <div class="crafting-header">
            <span class="crafting-icon">🧵</span>
            <span class="crafting-title">Ткацкая мастерская</span>
        </div>
        
        <div class="crafting-item">
            <div class="item-icon">
                <img src="/static/icons/resources/gambeson.png" class="resource-icon-img" style="width: 48px; height: 48px;">
            </div>
            <div class="item-name">Стёганка</div>
            
            <div class="item-recipe" id="recipeContainer">
                <div class="recipe-item" data-resource="fabric" data-cost="5">
                    <img src="/static/icons/resources/fabric.png" class="recipe-icon">
                    <span class="recipe-amount" id="fabricCost">5</span>
                </div>
                <div class="recipe-item" data-resource="leather" data-cost="1">
                    <img src="/static/icons/resources/leather.png" class="recipe-icon">
                    <span class="recipe-amount" id="leatherCost">1</span>
                </div>
                <div class="recipe-item">
                    <span class="recipe-time">🕒 1 мин</span>
                </div>
            </div>
            
            <div class="crafting-controls">
                <div class="slider-container">
                    <input type="range" id="craftRange" min="1" max="5" value="1" class="craft-slider">
                    <div class="slider-value" id="craftCount">1</div>
                </div>
                <input type="number" id="craftInput" class="manual-input" placeholder="1-5" min="1" max="5" style="display: none;">
                <button class="craft-btn" onclick="startCrafting('gambeson')">🔨 Начать крафт</button>
            </div>
            
            <div class="crafting-progress" id="craftProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="craftProgressFill"></div>
                </div>
                <div class="progress-time" id="craftTime"></div>
            </div>
            
            <div class="crafting-inventory" id="craftInventory">
                <h4>Готовые предметы:</h4>
                <div class="inventory-item">
                    <img src="/static/icons/resources/gambeson.png" class="resource-icon-img" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    <span>Стёганка: <span id="gambesonCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('gambeson')" id="collectGambesonBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('craftingOverlay').style.display = 'flex';
setupCraftingControls();
loadCraftingStatus(); 
}

// Показать окно крафта шлема (мастерская бронника)
function showArmorerCrafting() {
    const modal = document.getElementById('craftingModal');
    const content = document.getElementById('craftingContent');
    
    content.innerHTML = `
        <div class="crafting-header">
            <span class="crafting-icon">🛡️</span>
            <span class="crafting-title">Мастерская бронника</span>
        </div>
        
        <div class="crafting-item">
            <div class="item-icon">
                <img src="/static/icons/resources/spangenhelm.png" class="resource-icon-img" style="width: 48px; height: 48px;">
            </div>
            <div class="item-name">Шлем (Spangenhelm)</div>
            
            <div class="item-recipe" id="recipeContainer">
                <div class="recipe-item" data-resource="iron" data-cost="4">
                    <img src="/static/icons/resources/iron.png" class="recipe-icon">
                    <span class="recipe-amount" id="ironCost">4</span>
                </div>
                <div class="recipe-item" data-resource="fabric" data-cost="1">
                    <img src="/static/icons/resources/fabric.png" class="recipe-icon">
                    <span class="recipe-amount" id="fabricCost">1</span>
                </div>
                <div class="recipe-item" data-resource="coal" data-cost="10">
                    <img src="/static/icons/resources/coal.png" class="recipe-icon">
                    <span class="recipe-amount" id="coalCost">10</span>
                </div>
                <div class="recipe-item">
                    <span class="recipe-time">🕒 1 мин</span>
                </div>
            </div>
            
            <div class="crafting-controls">
                <div class="slider-container">
                    <input type="range" id="craftRange" min="1" max="5" value="1" class="craft-slider">
                    <div class="slider-value" id="craftCount">1</div>
                </div>
                <input type="number" id="craftInput" class="manual-input" placeholder="1-5" min="1" max="5" style="display: none;">
                <button class="craft-btn" onclick="startCrafting('spangenhelm')">🔨 Начать крафт</button>
            </div>
            
            <div class="crafting-progress" id="craftProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="craftProgressFill"></div>
                </div>
                <div class="progress-time" id="craftTime"></div>
            </div>
            
            <div class="crafting-inventory" id="craftInventory">
                <h4>Готовые предметы:</h4>
                <div class="inventory-item">
                    <img src="/static/icons/resources/spangenhelm.png" class="resource-icon-img" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    <span>Шлем: <span id="spangenhelmCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('spangenhelm')" id="collectSpangenhelmBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('craftingOverlay').style.display = 'flex';
setupCraftingControls();
loadCraftingStatus(); 
}

// Показать окно крафта для оружейника (фальшион и копье)
function showWeaponsmithCrafting() {
    const modal = document.getElementById('craftingModal');
    const content = document.getElementById('craftingContent');
    
    content.innerHTML = `
        <div class="crafting-header">
            <span class="crafting-icon">⚔️</span>
            <span class="crafting-title">Мастерская оружейника</span>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 20px; padding: 0 20px;">
            <button class="craft-tab-btn" onclick="showWeaponsmithTab('falchion', event)" style="flex:1; padding:10px; background:#4CAF50; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Фальшион</button>
            <button class="craft-tab-btn" onclick="showWeaponsmithTab('spear', event)" style="flex:1; padding:10px; background:#666; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Копьё</button>
        </div>
        
        <div id="weaponsmithContent">
            ${getFalchionHTML()}
        </div>
    `;
    
   document.getElementById('craftingOverlay').style.display = 'flex';
setupCraftingControls();
loadCraftingStatus(); 
}

// Переключение между вкладками оружейника
function showWeaponsmithTab(itemType, event) {
    const content = document.getElementById('weaponsmithContent');
    if (!content) return;
    
    // Обновляем стили кнопок
    const buttons = document.querySelectorAll('.craft-tab-btn');
    buttons.forEach(btn => {
        btn.style.background = '#666';
    });
    
    if (itemType === 'falchion') {
        content.innerHTML = getFalchionHTML();
        event.target.style.background = '#4CAF50';
    } else {
        content.innerHTML = getSpearHTML();
        event.target.style.background = '#4CAF50';
    }
    
    setupCraftingControls();
    setTimeout(() => loadCraftingStatus(), 100);
}

// HTML для фальшиона
function getFalchionHTML() {
    return `
        <div class="crafting-item">
            <div class="item-icon">
                <img src="/static/icons/resources/falchion.png" class="resource-icon-img" style="width: 48px; height: 48px;">
            </div>
            <div class="item-name">Фальшион</div>
            
            <div class="item-recipe" id="recipeContainer">
                <div class="recipe-item" data-resource="iron" data-cost="10">
                    <img src="/static/icons/resources/iron.png" class="recipe-icon">
                    <span class="recipe-amount" id="ironCost">10</span>
                </div>
                <div class="recipe-item" data-resource="wood" data-cost="2">
                    <img src="/static/icons/resources/wood.png" class="recipe-icon">
                    <span class="recipe-amount" id="woodCost">2</span>
                </div>
                <div class="recipe-item" data-resource="coal" data-cost="10">
                    <img src="/static/icons/resources/coal.png" class="recipe-icon">
                    <span class="recipe-amount" id="coalCost">10</span>
                </div>
                <div class="recipe-item">
                    <span class="recipe-time">🕒 1 мин</span>
                </div>
            </div>
            
            <div class="crafting-controls">
                <div class="slider-container">
                    <input type="range" id="craftRange" min="1" max="5" value="1" class="craft-slider">
                    <div class="slider-value" id="craftCount">1</div>
                </div>
                <input type="number" id="craftInput" class="manual-input" placeholder="1-5" min="1" max="5" style="display: none;">
                <button class="craft-btn" onclick="startCrafting('falchion')">🔨 Начать крафт</button>
            </div>
            
            <div class="crafting-progress" id="craftProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="craftProgressFill"></div>
                </div>
                <div class="progress-time" id="craftTime"></div>
            </div>
            
            <div class="crafting-inventory" id="craftInventory">
                <h4>Готовые предметы:</h4>
                <div class="inventory-item">
                    <img src="/static/icons/resources/falchion.png" class="resource-icon-img" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    <span>Фальшион: <span id="falchionCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('falchion')" id="collectFalchionBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
}

// HTML для копья
function getSpearHTML() {
    return `
        <div class="crafting-item">
            <div class="item-icon">
                <img src="/static/icons/resources/spear.png" class="resource-icon-img" style="width: 48px; height: 48px;">
            </div>
            <div class="item-name">Копьё</div>
            
            <div class="item-recipe" id="recipeContainer">
                <div class="recipe-item" data-resource="iron" data-cost="3">
                    <img src="/static/icons/resources/iron.png" class="recipe-icon">
                    <span class="recipe-amount" id="ironCost">3</span>
                </div>
                <div class="recipe-item" data-resource="wood" data-cost="10">
                    <img src="/static/icons/resources/wood.png" class="recipe-icon">
                    <span class="recipe-amount" id="woodCost">10</span>
                </div>
                <div class="recipe-item" data-resource="coal" data-cost="6">
                    <img src="/static/icons/resources/coal.png" class="recipe-icon">
                    <span class="recipe-amount" id="coalCost">6</span>
                </div>
                <div class="recipe-item">
                    <span class="recipe-time">🕒 1 мин</span>
                </div>
            </div>
            
            <div class="crafting-controls">
                <div class="slider-container">
                    <input type="range" id="craftRange" min="1" max="5" value="1" class="craft-slider">
                    <div class="slider-value" id="craftCount">1</div>
                </div>
                <input type="number" id="craftInput" class="manual-input" placeholder="1-5" min="1" max="5" style="display: none;">
                <button class="craft-btn" onclick="startCrafting('spear')">🔨 Начать крафт</button>
            </div>
            
            <div class="crafting-progress" id="craftProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="craftProgressFill"></div>
                </div>
                <div class="progress-time" id="craftTime"></div>
            </div>
            
            <div class="crafting-inventory" id="craftInventory">
                <h4>Готовые предметы:</h4>
                <div class="inventory-item">
                    <img src="/static/icons/resources/spear.png" class="resource-icon-img" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    <span>Копьё: <span id="spearCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('spear')" id="collectSpearBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
}

// Показать окно крафта лука (мастерская лукодела)
function showBowCrafting() {
    const modal = document.getElementById('craftingModal');
    const content = document.getElementById('craftingContent');
    
    content.innerHTML = `
        <div class="crafting-header">
            <span class="crafting-icon">🏹</span>
            <span class="crafting-title">Мастерская лукодела</span>
        </div>
        
        <div class="crafting-item">
            <div class="item-icon">
                <img src="/static/icons/resources/bow.png" class="resource-icon-img" style="width: 48px; height: 48px;">
            </div>
            <div class="item-name">Лук</div>
            
            <div class="item-recipe" id="recipeContainer">
                <div class="recipe-item" data-resource="wood" data-cost="12">
                    <img src="/static/icons/resources/wood.png" class="recipe-icon">
                    <span class="recipe-amount" id="woodCost">12</span>
                </div>
                <div class="recipe-item" data-resource="leather" data-cost="2">
                    <img src="/static/icons/resources/leather.png" class="recipe-icon">
                    <span class="recipe-amount" id="leatherCost">2</span>
                </div>
                <div class="recipe-item">
                    <span class="recipe-time">🕒 1 мин</span>
                </div>
            </div>
            
            <div class="crafting-controls">
                <div class="slider-container">
                    <input type="range" id="craftRange" min="1" max="5" value="1" class="craft-slider">
                    <div class="slider-value" id="craftCount">1</div>
                </div>
                <input type="number" id="craftInput" class="manual-input" placeholder="1-5" min="1" max="5" style="display: none;">
                <button class="craft-btn" onclick="startCrafting('bow')">🔨 Начать крафт</button>
            </div>
            
            <div class="crafting-progress" id="craftProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="craftProgressFill"></div>
                </div>
                <div class="progress-time" id="craftTime"></div>
            </div>
            
            <div class="crafting-inventory" id="craftInventory">
                <h4>Готовые предметы:</h4>
                <div class="inventory-item">
                    <img src="/static/icons/resources/bow.png" class="resource-icon-img" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    <span>Лук: <span id="bowCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('bow')" id="collectBowBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('craftingOverlay').style.display = 'flex';
setupCraftingControls();
loadCraftingStatus(); 
}

// Показать окно крафта щита (мастерская щитника)
function showShieldCrafting() {
    const modal = document.getElementById('craftingModal');
    const content = document.getElementById('craftingContent');
    
    content.innerHTML = `
        <div class="crafting-header">
            <span class="crafting-icon">🛡️</span>
            <span class="crafting-title">Мастерская щитника</span>
        </div>
        
        <div class="crafting-item">
            <div class="item-icon">
                <img src="/static/icons/resources/wooden_shield.png" class="resource-icon-img" style="width: 48px; height: 48px;">
            </div>
            <div class="item-name">Деревянный щит</div>
            
            <div class="item-recipe" id="recipeContainer">
                <div class="recipe-item" data-resource="wood" data-cost="15">
                    <img src="/static/icons/resources/wood.png" class="recipe-icon">
                    <span class="recipe-amount" id="woodCost">15</span>
                </div>
                <div class="recipe-item" data-resource="leather" data-cost="2">
                    <img src="/static/icons/resources/leather.png" class="recipe-icon">
                    <span class="recipe-amount" id="leatherCost">2</span>
                </div>
                <div class="recipe-item" data-resource="iron" data-cost="2">
                    <img src="/static/icons/resources/iron.png" class="recipe-icon">
                    <span class="recipe-amount" id="ironCost">2</span>
                </div>
                <div class="recipe-item">
                    <span class="recipe-time">🕒 1 мин</span>
                </div>
            </div>
            
            <div class="crafting-controls">
                <div class="slider-container">
                    <input type="range" id="craftRange" min="1" max="5" value="1" class="craft-slider">
                    <div class="slider-value" id="craftCount">1</div>
                </div>
                <input type="number" id="craftInput" class="manual-input" placeholder="1-5" min="1" max="5" style="display: none;">
                <button class="craft-btn" onclick="startCrafting('wooden_shield')">🔨 Начать крафт</button>
            </div>
            
            <div class="crafting-progress" id="craftProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="craftProgressFill"></div>
                </div>
                <div class="progress-time" id="craftTime"></div>
            </div>
            
            <div class="crafting-inventory" id="craftInventory">
                <h4>Готовые предметы:</h4>
                <div class="inventory-item">
                    <img src="/static/icons/resources/wooden_shield.png" class="resource-icon-img" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    <span>Щит: <span id="woodenShieldCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('wooden_shield')" id="collectWoodenShieldBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('craftingOverlay').style.display = 'flex';
setupCraftingControls();
loadCraftingStatus(); 
}

// Показать окно крафта седла (мастерская седельника)
function showSaddleCrafting() {
    const modal = document.getElementById('craftingModal');
    const content = document.getElementById('craftingContent');
    
    content.innerHTML = `
        <div class="crafting-header">
            <span class="crafting-icon">🪑</span>
            <span class="crafting-title">Мастерская седельника</span>
        </div>
        
        <div class="crafting-item">
            <div class="item-icon">
                <img src="/static/icons/resources/saddle.png" class="resource-icon-img" style="width: 48px; height: 48px;">
            </div>
            <div class="item-name">Седло</div>
            
            <div class="item-recipe" id="recipeContainer">
                <div class="recipe-item" data-resource="leather" data-cost="8">
                    <img src="/static/icons/resources/leather.png" class="recipe-icon">
                    <span class="recipe-amount" id="leatherCost">8</span>
                </div>
                <div class="recipe-item" data-resource="iron" data-cost="2">
                    <img src="/static/icons/resources/iron.png" class="recipe-icon">
                    <span class="recipe-amount" id="ironCost">2</span>
                </div>
                <div class="recipe-item">
                    <span class="recipe-time">🕒 1 мин</span>
                </div>
            </div>
            
            <div class="crafting-controls">
                <div class="slider-container">
                    <input type="range" id="craftRange" min="1" max="5" value="1" class="craft-slider">
                    <div class="slider-value" id="craftCount">1</div>
                </div>
                <input type="number" id="craftInput" class="manual-input" placeholder="1-5" min="1" max="5" style="display: none;">
                <button class="craft-btn" onclick="startCrafting('saddle')">🔨 Начать крафт</button>
            </div>
            
            <div class="crafting-progress" id="craftProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill" id="craftProgressFill"></div>
                </div>
                <div class="progress-time" id="craftTime"></div>
            </div>
            
            <div class="crafting-inventory" id="craftInventory">
                <h4>Готовые предметы:</h4>
                <div class="inventory-item">
                    <img src="/static/icons/resources/saddle.png" class="resource-icon-img" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">
                    <span>Седло: <span id="saddleCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('saddle')" id="collectSaddleBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('craftingOverlay').style.display = 'flex';
setupCraftingControls();
loadCraftingStatus(); 
}

// Настройка контролов крафта
function setupCraftingControls() {
    const rangeInput = document.getElementById('craftRange');
    const countSpan = document.getElementById('craftCount');
    const manualInput = document.getElementById('craftInput');
    
    if (rangeInput) {
        rangeInput.addEventListener('input', () => {
            document.getElementById('craftCount').textContent = rangeInput.value;
        });
    }
    
    if (countSpan) {
        countSpan.addEventListener('click', () => {
            if (manualInput) {
                manualInput.style.display = 'inline-block';
                manualInput.focus();
            }
        });
    }
    
    if (manualInput) {
        manualInput.addEventListener('blur', () => {
            let value = parseInt(manualInput.value) || 1;
            value = Math.max(1, Math.min(5, value));
            document.getElementById('craftCount').textContent = value;
            document.getElementById('craftRange').value = value;
            manualInput.style.display = 'none';
            manualInput.value = '';
        });
        
        manualInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                manualInput.blur();
            }
        });
    }
}

// Загрузить статус крафта
async function loadCraftingStatus() {
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/crafting/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: initData })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновляем отображение ресурсов для ткацкой мастерской
            const fabricEl = document.getElementById('fabricCost');
            if (fabricEl) {
                fabricEl.parentElement.innerHTML = 
                    `<img src="/static/icons/resources/fabric.png" class="recipe-icon"> ${data.resources.fabric}/5`;
            }
            
            const leatherEl = document.getElementById('leatherCost');
            if (leatherEl) {
                leatherEl.parentElement.innerHTML = 
                    `<img src="/static/icons/resources/leather.png" class="recipe-icon"> ${data.resources.leather}/1`;
            }
            
            // Для мастерской бронника
            const ironEl = document.getElementById('ironCost');
            if (ironEl && document.querySelector('.crafting-header span')?.textContent.includes('бронника')) {
                ironEl.parentElement.innerHTML = 
                    `<img src="/static/icons/resources/iron.png" class="recipe-icon"> ${data.resources.iron}/4`;
                
                const fabricEl2 = document.getElementById('fabricCost');
                if (fabricEl2) {
                    fabricEl2.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/fabric.png" class="recipe-icon"> ${data.resources.fabric}/1`;
                }
                
                const coalEl = document.getElementById('coalCost');
                if (coalEl) {
                    coalEl.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/coal.png" class="recipe-icon"> ${data.resources.coal}/10`;
                }
            }
            
            // Для фальшиона
            if (document.getElementById('falchionCount')) {
                const ironFalchion = document.getElementById('ironCost');
                if (ironFalchion) {
                    ironFalchion.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/iron.png" class="recipe-icon"> ${data.resources.iron}/10`;
                }
                
                const woodFalchion = document.getElementById('woodCost');
                if (woodFalchion) {
                    woodFalchion.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/wood.png" class="recipe-icon"> ${data.resources.wood}/2`;
                }
                
                const coalFalchion = document.getElementById('coalCost');
                if (coalFalchion) {
                    coalFalchion.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/coal.png" class="recipe-icon"> ${data.resources.coal}/10`;
                }
            }
            
            // Для копья
            if (document.getElementById('spearCount')) {
                const ironSpear = document.getElementById('ironCost');
                if (ironSpear) {
                    ironSpear.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/iron.png" class="recipe-icon"> ${data.resources.iron}/3`;
                }
                
                const woodSpear = document.getElementById('woodCost');
                if (woodSpear) {
                    woodSpear.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/wood.png" class="recipe-icon"> ${data.resources.wood}/10`;
                }
                
                const coalSpear = document.getElementById('coalCost');
                if (coalSpear) {
                    coalSpear.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/coal.png" class="recipe-icon"> ${data.resources.coal}/6`;
                }
            }
            
            // Для лука
            if (document.getElementById('bowCount')) {
                const woodBow = document.getElementById('woodCost');
                if (woodBow) {
                    woodBow.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/wood.png" class="recipe-icon"> ${data.resources.wood}/12`;
                }
                
                const leatherBow = document.getElementById('leatherCost');
                if (leatherBow) {
                    leatherBow.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/leather.png" class="recipe-icon"> ${data.resources.leather}/2`;
                }
            }
            
            // Для щита
            if (document.getElementById('woodenShieldCount')) {
                const woodShield = document.getElementById('woodCost');
                if (woodShield) {
                    woodShield.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/wood.png" class="recipe-icon"> ${data.resources.wood}/15`;
                }
                
                const leatherShield = document.getElementById('leatherCost');
                if (leatherShield) {
                    leatherShield.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/leather.png" class="recipe-icon"> ${data.resources.leather}/2`;
                }
                
                const ironShield = document.getElementById('ironCost');
                if (ironShield) {
                    ironShield.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/iron.png" class="recipe-icon"> ${data.resources.iron}/2`;
                }
            }
            
            // Для седла
            if (document.getElementById('saddleCount')) {
                const leatherSaddle = document.getElementById('leatherCost');
                if (leatherSaddle) {
                    leatherSaddle.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/leather.png" class="recipe-icon"> ${data.resources.leather}/8`;
                }
                
                const ironSaddle = document.getElementById('ironCost');
                if (ironSaddle) {
                    ironSaddle.parentElement.innerHTML = 
                        `<img src="/static/icons/resources/iron.png" class="recipe-icon"> ${data.resources.iron}/2`;
                }
            }
            
            // Обновляем инвентарь
            const items = [
                'gambeson', 'spangenhelm', 'falchion', 
                'spear', 'bow', 'wooden_shield', 'saddle'
            ];
            
            items.forEach(itemType => {
                const item = data.crafting.find(c => c.item_type === itemType);
                const countEl = document.getElementById(`${itemType}Count`);
                if (countEl) {
                    countEl.textContent = item?.count || 0;
                }
                
                const collectBtn = document.getElementById(`collect${itemType.charAt(0).toUpperCase() + itemType.slice(1)}Btn`);
                if (collectBtn) {
                    collectBtn.style.display = (item && item.count > 0) ? 'inline-block' : 'none';
                }
            });
            
            // Проверяем активный крафт
            const activeCraft = data.crafting.find(c => c.in_progress > 0);
            if (activeCraft) {
                craftingInProgress = true;
                craftingEndTime = activeCraft.progress_end;
                showCraftingProgress(activeCraft.item_type, activeCraft.progress_end);
                hideCraftingControls();
            } else {
                craftingInProgress = false;
                showCraftingControls();
            }
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки крафта:', error);
    }
}
// Вспомогательная функция для обновления текста элемента
function updateElementText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Начать крафт
async function startCrafting(itemType) {
    if (craftingInProgress) {
        showToast('⏳ Уже идет крафт');
        return;
    }
    
    const count = parseInt(document.getElementById('craftCount').textContent) || 1;
    
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/crafting/craft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: initData,
                item_type: itemType,
                count: count
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ Крафт ${count} предметов начался`);
            craftingInProgress = true;
            craftingEndTime = data.end_time;
            showCraftingProgress(itemType, data.end_time);
            hideCraftingControls();
            loadCraftingStatus();
        } else {
            showToast(`❌ ${data.error || 'Ошибка'}`);
        }
    } catch (error) {
        console.error('❌ Ошибка крафта:', error);
        showToast('❌ Ошибка соединения');
    }
}

// Показать прогресс крафта
function showCraftingProgress(itemType, endTime) {
    const progressDiv = document.getElementById('craftProgress');
    const progressFill = document.getElementById('craftProgressFill');
    const timeDisplay = document.getElementById('craftTime');
    const controlsDiv = document.querySelector('.crafting-controls');
    
    if (!progressDiv || !progressFill || !timeDisplay) return;
    
    if (controlsDiv) controlsDiv.style.display = 'none';
    progressDiv.style.display = 'block';
    
    const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const total = 60 * 1000;
        const percent = ((total - remaining) / total) * 100;
        
        progressFill.style.width = `${percent}%`;
        
        if (remaining > 0) {
            const seconds = Math.ceil(remaining / 1000);
            timeDisplay.textContent = `Осталось: ${seconds}с`;
            requestAnimationFrame(updateProgress);
        } else {
            progressDiv.style.display = 'none';
            if (controlsDiv) controlsDiv.style.display = 'block';
            craftingInProgress = false;
            loadCraftingStatus();
            showToast('✅ Крафт завершен');
        }
    };
    
    requestAnimationFrame(updateProgress);
}

// Скрыть контролы крафта
function hideCraftingControls() {
    const controlsDiv = document.querySelector('.crafting-controls');
    if (controlsDiv) controlsDiv.style.display = 'none';
}

// Показать контролы крафта
function showCraftingControls() {
    const controlsDiv = document.querySelector('.crafting-controls');
    if (controlsDiv) controlsDiv.style.display = 'block';
}

// Забрать готовые предметы
async function collectCrafted(itemType) {
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/crafting/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: initData,
                item_type: itemType
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`📦 Получено: ${data.count} предметов`);
            
            // Обновляем userData
            if (!userData[itemType]) userData[itemType] = 0;
            userData[itemType] += data.count;
            
            // Обновляем отображение
            const displayMap = {
                'gambeson': 'gambesonDisplay',
                'spangenhelm': 'spangenhelmDisplay',
                'falchion': 'falchionDisplay',
                'spear': 'spearDisplay',
                'bow': 'bowDisplay',
                'wooden_shield': 'woodenShieldDisplay',
                'saddle': 'saddleDisplay'
            };
            
            const displayId = displayMap[itemType];
            if (displayId) {
                const el = document.getElementById(displayId);
                if (el) el.textContent = userData[itemType];
            }
            
            loadCraftingStatus();
        } else {
            showToast(`❌ ${data.error || 'Ошибка'}`);
        }
    } catch (error) {
        console.error('❌ Ошибка сбора:', error);
    }
}

// Закрыть окно крафта
function closeCraftingModal() {
    document.getElementById('craftingOverlay').style.display = 'none';
}

// Делаем функции глобальными
window.openCrafting = openCrafting;
window.startCrafting = startCrafting;
window.collectCrafted = collectCrafted;
window.closeCraftingModal = closeCraftingModal;
window.showWeaponsmithTab = showWeaponsmithTab;
