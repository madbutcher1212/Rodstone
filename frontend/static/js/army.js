// army.js - управление армией

let trainingInProgress = false;
let trainingEndTime = null;

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
            const militia = data.troops.find(t => t.troop_type === 'militia') || { count: 0, in_training: 0 };
            
            // Обновляем отображение
            document.getElementById('militiaCount').textContent = militia.count;
            
            // Если есть тренировка - показываем прогресс
            if (militia.in_training > 0 && militia.training_end) {
                trainingInProgress = true;
                trainingEndTime = militia.training_end;
                showTrainingProgress('militia', militia.training_end);
                hideTrainingControls();
            } else {
                trainingInProgress = false;
                trainingEndTime = null;
                showTrainingControls();
            }
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки армии:', error);
    }
}

// Показать контролы тренировки
function showTrainingControls() {
    const controlsDiv = document.getElementById('trainingControls');
    const progressDiv = document.getElementById('militiaProgress');
    
    if (controlsDiv) controlsDiv.style.display = 'block';
    if (progressDiv) progressDiv.style.display = 'none';
}

// Скрыть контролы тренировки
function hideTrainingControls() {
    const controlsDiv = document.getElementById('trainingControls');
    const progressDiv = document.getElementById('militiaProgress');
    
    if (controlsDiv) controlsDiv.style.display = 'none';
    if (progressDiv) progressDiv.style.display = 'block';
}

// Обновить значение ползунка
function updateSliderValue(value) {
    document.getElementById('trainCount').textContent = value;
    document.getElementById('trainRange').value = value;
}

// Обработчик изменения ползунка
function onSliderChange() {
    const slider = document.getElementById('trainRange');
    document.getElementById('trainCount').textContent = slider.value;
}

// Обработчик ручного ввода
function onManualInput() {
    const input = document.getElementById('trainInput');
    let value = parseInt(input.value) || 0;
    
    // Ограничиваем от 0 до 5
    value = Math.max(0, Math.min(5, value));
    
    document.getElementById('trainCount').textContent = value;
    document.getElementById('trainRange').value = value;
    input.value = '';
}

// Тренировка ополчения
async function trainMilitia() {
    if (trainingInProgress) {
        showToast('⏳ Уже идет обучение');
        return;
    }
    
    const count = parseInt(document.getElementById('trainCount').textContent) || 0;
    
    if (count <= 0) {
        showToast('❌ Выберите количество');
        return;
    }
    
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/army/train`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: initData,
                troop_type: 'militia',
                count: count
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('❌ Ошибка сервера:', text);
            showToast('❌ Ошибка сервера');
            return;
        }
        
        const data = await response.json();
        console.log('📦 Тренировка:', data);
        
        if (data.success) {
            showToast(`✅ Обучение ${count} ополченцев началось`);
            trainingInProgress = true;
            trainingEndTime = data.end_time;
            showTrainingProgress('militia', data.end_time);
            hideTrainingControls();
            
            // Обновляем отображение
            document.getElementById('militiaCount').textContent = data.militia_count || 0;
        } else {
            showToast(`❌ ${data.error || 'Ошибка'}`);
        }
    } catch (error) {
        console.error('❌ Ошибка тренировки:', error);
        showToast('❌ Ошибка соединения');
    }
}

// Показать прогресс тренировки
function showTrainingProgress(troopType, endTime) {
    const progressDiv = document.getElementById(`${troopType}Progress`);
    const progressFill = document.getElementById(`${troopType}ProgressFill`);
    const timeDisplay = document.getElementById(`${troopType}Time`);
    
    if (!progressDiv || !progressFill || !timeDisplay) return;
    
    progressDiv.style.display = 'block';
    
    const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const total = 10 * 1000; // 10 секунд
        const percent = ((total - remaining) / total) * 100;
        
        progressFill.style.width = `${percent}%`;
        
        if (remaining > 0) {
            const seconds = Math.ceil(remaining / 1000);
            timeDisplay.textContent = `Осталось: ${seconds}с`;
            requestAnimationFrame(updateProgress);
        } else {
            progressDiv.style.display = 'none';
            trainingInProgress = false;
            trainingEndTime = null;
            showTrainingControls();
            loadArmyStatus(); // Перезагружаем статус
            showToast('✅ Обучение завершено');
        }
    };
    
    requestAnimationFrame(updateProgress);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчики
    const rangeInput = document.getElementById('trainRange');
    const countSpan = document.getElementById('trainCount');
    const manualInput = document.getElementById('trainInput');
    
    if (rangeInput) {
        rangeInput.addEventListener('input', onSliderChange);
    }
    
    if (countSpan) {
        countSpan.addEventListener('click', () => {
            const input = document.getElementById('trainInput');
            if (input) {
                input.style.display = 'inline-block';
                input.focus();
            }
        });
    }
    
    if (manualInput) {
        manualInput.addEventListener('blur', onManualInput);
        manualInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                onManualInput();
            }
        });
    }
    
    // Загружаем статус при открытии вкладки
    const armyTab = document.querySelector('[data-tab="army"]');
    if (armyTab) {
        armyTab.addEventListener('click', loadArmyStatus);
    }
});
