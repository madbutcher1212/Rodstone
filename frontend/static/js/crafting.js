// crafting.js - управление крафтом

let craftingInProgress = false;
let craftingEndTime = null;

// Открыть окно крафта для здания
function openCrafting(buildingType) {
    console.log(`🔨 Открытие крафта для ${buildingType}`);
    
    if (buildingType === 'weaving_workshop') {
        showGambesonCrafting();
    }
}

// Показать окно крафта стеганки
function showGambesonCrafting() {
    const modal = document.getElementById('craftingModal');
    const content = document.getElementById('craftingContent');
    
    // Загружаем текущие ресурсы
    loadCraftingStatus();
    
    content.innerHTML = `
        <div class="crafting-header">
            <span class="crafting-icon">🧵</span>
            <span class="crafting-title">Ткацкая мастерская</span>
        </div>
        
        <div class="crafting-item">
            <div class="item-icon">🛡️</div>
            <div class="item-name">Стёганка</div>
            
            <div class="item-recipe">
                <div class="recipe-item">
                    <img src="/static/icons/resources/fabric.png" class="recipe-icon">
                    <span class="recipe-amount" id="fabricCost">5</span>
                </div>
                <div class="recipe-item">
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
                    <span>🛡️ Стёганка: <span id="gambesonCount">0</span></span>
                    <button class="collect-btn" onclick="collectCrafted('gambeson')" id="collectGambesonBtn" style="display: none;">📦 Забрать</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('craftingOverlay').style.display = 'flex';
    
    // Добавляем обработчики
    setupCraftingControls();
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
            // Обновляем отображение ресурсов
            document.getElementById('fabricCost').parentElement.innerHTML = 
                `<img src="/static/icons/resources/fabric.png" class="recipe-icon"> ${data.resources.fabric}/5`;
            document.getElementById('leatherCost').parentElement.innerHTML = 
                `<img src="/static/icons/resources/leather.png" class="recipe-icon"> ${data.resources.leather}/1`;
            
            // Обновляем инвентарь
            const gambeson = data.crafting.find(c => c.item_type === 'gambeson');
            if (gambeson) {
                document.getElementById('gambesonCount').textContent = gambeson.count || 0;
                
                if (gambeson.in_progress > 0 && gambeson.progress_end) {
                    craftingInProgress = true;
                    craftingEndTime = gambeson.progress_end;
                    showCraftingProgress('gambeson', gambeson.progress_end);
                    hideCraftingControls();
                } else {
                    craftingInProgress = false;
                    showCraftingControls();
                }
                
                // Показываем кнопку сбора если есть предметы
                const collectBtn = document.getElementById('collectGambesonBtn');
                if (collectBtn) {
                    collectBtn.style.display = gambeson.count > 0 ? 'inline-block' : 'none';
                }
            }
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки крафта:', error);
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
            showToast(`✅ Крафт ${count} стеганок начался`);
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
        const total = 60 * 1000; // 1 минута в миллисекундах
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
            showToast(`📦 Получено: ${data.count} стеганок`);
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
