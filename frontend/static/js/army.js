// army.js - управление армией

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
            document.getElementById('armyFreeWorkers').textContent = data.workers_free;
            document.getElementById('armyBusyWorkers').textContent = data.workers_used;
            
            const militia = data.troops.find(t => t.troop_type === 'militia') || { count: 0, in_training: 0 };
            document.getElementById('militiaCount').textContent = militia.count;
            document.getElementById('militiaTraining').textContent = militia.in_training;
            
            // Показываем прогресс тренировки
            if (militia.in_training > 0 && militia.training_end) {
                showTrainingProgress('militia', militia.training_end);
            } else {
                document.getElementById('militiaProgress').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки армии:', error);
    }
}

// Тренировка ополчения
async function trainMilitia(count) {
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
            showToast(`✅ Тренировка ${count} ополченцев началась`);
            document.getElementById('armyFreeWorkers').textContent = data.workers_free;
            document.getElementById('militiaTraining').textContent = data.in_training;
            showTrainingProgress('militia', data.end_time);
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
            const seconds = Math.floor(remaining / 1000);
            timeDisplay.textContent = `Осталось: ${seconds}с`;
            requestAnimationFrame(updateProgress);
        } else {
            progressDiv.style.display = 'none';
            loadArmyStatus(); // Перезагружаем статус
        }
    };
    
    requestAnimationFrame(updateProgress);
}
