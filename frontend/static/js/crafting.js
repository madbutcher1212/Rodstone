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
                    <span class="recipe-amount iron-amount">4</span>
                </div>
                <div class="recipe-item" data-resource="fabric" data-cost="1">
                    <img src="/static/icons/resources/fabric.png" class="recipe-icon">
                    <span class="recipe-amount fabric-amount">1</span>
                </div>
                <div class="recipe-item" data-resource="coal" data-cost="10">
                    <img src="/static/icons/resources/coal.png" class="recipe-icon">
                    <span class="recipe-amount coal-amount">10</span>
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
                    <span class="recipe-amount iron-amount">10</span>
                </div>
                <div class="recipe-item" data-resource="wood" data-cost="2">
                    <img src="/static/icons/resources/wood.png" class="recipe-icon">
                    <span class="recipe-amount wood-amount">2</span>
                </div>
                <div class="recipe-item" data-resource="coal" data-cost="10">
                    <img src="/static/icons/resources/coal.png" class="recipe-icon">
                    <span class="recipe-amount coal-amount">10</span>
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
                    <span class="recipe-amount iron-amount">3</span>
                </div>
                <div class="recipe-item" data-resource="wood" data-cost="10">
                    <img src="/static/icons/resources/wood.png" class="recipe-icon">
                    <span class="recipe-amount wood-amount">10</span>
                </div>
                <div class="recipe-item" data-resource="coal" data-cost="6">
                    <img src="/static/icons/resources/coal.png" class="recipe-icon">
                    <span class="recipe-amount coal-amount">6</span>
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
                    <span class="recipe-amount wood-amount">12</span>
                </div>
                <div class="recipe-item" data-resource="leather" data-cost="2">
                    <img src="/static/icons/resources/leather.png" class="recipe-icon">
                    <span class="recipe-amount leather-amount">2</span>
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
                    <span class="recipe-amount wood-amount">15</span>
                </div>
                <div class="recipe-item" data-resource="leather" data-cost="2">
                    <img src="/static/icons/resources/leather.png" class="recipe-icon">
                    <span class="recipe-amount leather-amount">2</span>
                </div>
                <div class="recipe-item" data-resource="iron" data-cost="2">
                    <img src="/static/icons/resources/iron.png" class="recipe-icon">
                    <span class="recipe-amount iron-amount">2</span>
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
                    <span class="recipe-amount leather-amount">8</span>
                </div>
                <div class="recipe-item" data-resource="iron" data-cost="2">
                    <img src="/static/icons/resources/iron.png" class="recipe-icon">
                    <span class="recipe-amount iron-amount">2</span>
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
