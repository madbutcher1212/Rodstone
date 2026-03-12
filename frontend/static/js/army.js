// army.js - управление армией

let trainingStates = {
    militia: { inProgress: false, endTime: null },
    archer: { inProgress: false, endTime: null },
    infantry: { inProgress: false, endTime: null },
    spearmen: { inProgress: false, endTime: null },
    cavalry: { inProgress: false, endTime: null }
};

// Загрузить статус армии
async function loadArmyStatus() {
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/army/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: initData })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('❌ Ошибка сервера:', text);
            return;
        }
        
        const data = await response.json();
        console.log('📦 Статус армии:', data);
        
        if (data.success) {
            // Обновляем все юниты
            updateUnitDisplay('militia', data.troops.militia);
            updateUnitDisplay('archer', data.troops.archer);
            updateUnitDisplay('infantry', data.troops.infantry);
            updateUnitDisplay('spearmen', data.troops.spearmen);
            updateUnitDisplay('cavalry', data.troops.cavalry);
            
            // Обновляем ресурсы
            document.getElementById('workersFree').textContent = data.workers_free;
            document.getElementById('foodAmount').textContent = data.food;
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки армии:', error);
    }
}

// Обновить отображение конкретного юнита
function updateUnitDisplay(unitType, unitData) {
    document.getElementById(`${unitType}Count`).textContent = unitData.count || 0;
    
    // Если есть тренировка - показываем прогресс
    if (unitData.in_training > 0 && unitData.training_end) {
        trainingStates[unitType] = {
            inProgress: true,
            endTime: unitData.training_end
        };
        showTrainingProgress(unitType, unitData.training_end);
        hideTrainingControls(unitType);
    } else {
        trainingStates[unitType].inProgress = false;
        showTrainingControls(unitType);
    }
}

// Показать контролы тренировки для конкретного юнита
function showTrainingControls(unitType) {
    const controlsDiv = document.getElementById(`${unitType}Controls`);
    const progressDiv = document.getElementById(`${unitType}Progress`);
    
    if (controlsDiv) controlsDiv.style.display = 'block';
    if (progressDiv) progressDiv.style.display = 'none';
}

// Скрыть контролы тренировки
function hideTrainingControls(unitType) {
    const controlsDiv = document.getElementById(`${unitType}Controls`);
    const progressDiv = document.getElementById(`${unitType}Progress`);
    
    if (controlsDiv) controlsDiv.style.display = 'none';
    if (progressDiv) progressDiv.style.display = 'block';
}

// Обновить значение ползунка
function updateSliderValue(unitType, value) {
    document.getElementById(`${unitType}Count`).textContent = value;
    document.getElementById(`${unitType}Range`).value = value;
}

// Обработчик изменения ползунка
function onSliderChange(unitType) {
    const slider = document.getElementById(`${unitType}Range`);
    document.getElementById(`${unitType}Value`).textContent = slider.value;
}

// Обработчик ручного ввода
function onManualInput(unitType) {
    const input = document.getElementById(`${unitType}Input`);
    let value = parseInt(input.value) || 0;
    
    value = Math.max(0, Math.min(5, value));
    
    document.getElementById(`${unitType}Value`).textContent = value;
    document.getElementById(`${unitType}Range`).value = value;
    input.value = '';
    input.style.display = 'none';
}

// Тренировка ополчения
async function trainMilitia() {
    if (trainingStates.militia.inProgress) {
        showToast('⏳ Уже идет обучение');
        return;
    }
    
    const count = parseInt(document.getElementById('militiaValue').textContent) || 0;
    
    if (count <= 0) {
        showToast('❌ Выберите количество');
        return;
    }
    
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/army/train_militia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: initData,
                count: count
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ Обучение ${count} ополченцев началось`);
            trainingStates.militia.inProgress = true;
            trainingStates.militia.endTime = data.end_time;
            showTrainingProgress('militia', data.end_time);
            hideTrainingControls('militia');
            loadArmyStatus();
        } else {
            showToast(`❌ ${data.error || 'Ошибка'}`);
        }
    } catch (error) {
        console.error('❌ Ошибка тренировки:', error);
        showToast('❌ Ошибка соединения');
    }
}

// Тренировка юнита
async function trainUnit(unitType, unitName) {
    if (trainingStates[unitType].inProgress) {
        showToast('⏳ Уже идет обучение');
        return;
    }
    
    const count = parseInt(document.getElementById(`${unitType}Value`).textContent) || 0;
    
    if (count <= 0) {
        showToast('❌ Выберите количество');
        return;
    }
    
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/army/train_unit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: initData,
                unit_type: unitType,
                count: count
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ Обучение ${count} ${unitName} началось`);
            trainingStates[unitType].inProgress = true;
            trainingStates[unitType].endTime = data.end_time;
            showTrainingProgress(unitType, data.end_time);
            hideTrainingControls(unitType);
            loadArmyStatus();
        } else {
            showToast(`❌ ${data.error || 'Ошибка'}`);
        }
    } catch (error) {
        console.error('❌ Ошибка тренировки:', error);
        showToast('❌ Ошибка соединения');
    }
}

// Показать прогресс тренировки
function showTrainingProgress(unitType, endTime) {
    const progressDiv = document.getElementById(`${unitType}Progress`);
    const progressFill = document.getElementById(`${unitType}ProgressFill`);
    const timeDisplay = document.getElementById(`${unitType}Time`);
    
    if (!progressDiv || !progressFill || !timeDisplay) return;
    
    progressDiv.style.display = 'block';
    
    const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const total = 10 * 1000;
        const percent = ((total - remaining) / total) * 100;
        
        progressFill.style.width = `${percent}%`;
        
        if (remaining > 0) {
            const seconds = Math.ceil(remaining / 1000);
            timeDisplay.textContent = `Осталось: ${seconds}с`;
            requestAnimationFrame(updateProgress);
        } else {
            progressDiv.style.display = 'none';
            trainingStates[unitType].inProgress = false;
            showTrainingControls(unitType);
            loadArmyStatus();
            showToast('✅ Обучение завершено');
        }
    };
    
    requestAnimationFrame(updateProgress);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const unitTypes = ['militia', 'archer', 'infantry', 'spearmen', 'cavalry'];
    
    unitTypes.forEach(unitType => {
        const rangeInput = document.getElementById(`${unitType}Range`);
        const valueSpan = document.getElementById(`${unitType}Value`);
        const manualInput = document.getElementById(`${unitType}Input`);
        
        if (rangeInput) {
            rangeInput.addEventListener('input', () => onSliderChange(unitType));
        }
        
        if (valueSpan) {
            valueSpan.addEventListener('click', () => {
                if (manualInput) {
                    manualInput.style.display = 'inline-block';
                    manualInput.focus();
                }
            });
        }
        
        if (manualInput) {
            manualInput.addEventListener('blur', () => onManualInput(unitType));
            manualInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    onManualInput(unitType);
                }
            });
        }
    });
    
    // Загружаем статус при открытии вкладки
    const armyTab = document.querySelector('[data-tab="army"]');
    if (armyTab) {
        armyTab.addEventListener('click', loadArmyStatus);
    }
});
// Показать точное значение военного ресурса
function showCraftValue(resource) {
    const values = {
        falchion: userData.falchion || 0,
        wooden_shield: userData.wooden_shield || 0,
        gambeson: userData.gambeson || 0,
        spear: userData.spear || 0,
        bow: userData.bow || 0,
        saddle: userData.saddle || 0,
        horses: userData.horses || 0,
        spangenhelm: userData.spangenhelm || 0
    };
    const names = {
        falchion: 'Фальшион',
        wooden_shield: 'Деревянный щит',
        gambeson: 'Стёганка',
        spear: 'Копьё',
        bow: 'Лук',
        saddle: 'Седло',
        horses: 'Лошади',
        spangenhelm: 'Шлем'
    };
    showToast(`${names[resource]}: ${values[resource]}`);
}
