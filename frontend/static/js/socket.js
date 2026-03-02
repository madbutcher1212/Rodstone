// socket.js - управление WebSocket соединением

let socket = null;

function initSocket(telegramId) {
    if (socket) return socket;
    
    socket = io(API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5
    });
    
    socket.on('connect', () => {
        console.log('🔌 WebSocket подключён');
        socket.emit('authenticate', { telegram_id: telegramId });
    });
    
    socket.on('authenticated', (data) => {
        console.log('✅ Аутентификация WebSocket успешна');
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 WebSocket отключён');
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Ошибка WebSocket:', error);
    });
    
    socket.on('upgrade_complete', (data) => {
        console.log('🏗️ Улучшение завершено:', data);
        
        // Обновляем данные
        if (data.building_id === 'townhall') {
            userData.townHallLevel = data.new_level;
            console.log(`🏛️ Ратуша улучшена до ${data.new_level} уровня`);
        } else {
            const building = buildings.find(b => b.id === data.building_id);
            if (building) {
                building.level = data.new_level;
                console.log(`✅ ${data.building_id} улучшено до ${data.new_level} уровня`);
            }
        }
        
        // Обновляем UI
        updateCityUI();
        showToast(`✅ ${data.building_id === 'townhall' ? 'Ратуша' : data.building_id} улучшена до ${data.new_level} уровня!`);
    });
    
    socket.on('construction_start', (data) => {
        console.log('🚧 Начало строительства:', data);
        
        // Показываем шкалу прогресса
        const buildingId = data.building_id;
        const endTime = data.end_time;
        
        // Для ратуши
        if (buildingId === 'townhall') {
            const progressContainer = document.getElementById('progress-townhall');
            const progressBar = document.getElementById('progress-bar-townhall');
            const progressText = document.getElementById('progress-text-townhall');
            
            if (progressContainer && progressBar) {
                progressContainer.style.display = 'flex';
                
                // Запускаем анимацию прогресса
                const startTime = Date.now();
                const duration = endTime - startTime;
                
                const updateProgress = () => {
                    const now = Date.now();
                    const elapsed = now - startTime;
                    const percent = Math.min(100, (elapsed / duration) * 100);
                    
                    progressBar.style.width = `${percent}%`;
                    
                    // Обновляем текст с таймером
                    if (progressText) {
                        const remaining = Math.max(0, endTime - now);
                        const seconds = Math.floor(remaining / 1000);
                        progressText.textContent = `🏗️ Строительство: ${seconds}с`;
                    }
                    
                    if (now < endTime) {
                        requestAnimationFrame(updateProgress);
                    }
                };
                
                requestAnimationFrame(updateProgress);
            }
        } else {
            // Для обычных зданий
            const progressContainer = document.getElementById(`progress-${buildingId}`);
            const progressBar = document.getElementById(`progress-bar-${buildingId}`);
            const progressText = document.getElementById(`progress-text-${buildingId}`);
            
            if (progressContainer && progressBar) {
                progressContainer.style.display = 'flex';
                
                const startTime = Date.now();
                const duration = endTime - startTime;
                
                const updateProgress = () => {
                    const now = Date.now();
                    const elapsed = now - startTime;
                    const percent = Math.min(100, (elapsed / duration) * 100);
                    
                    progressBar.style.width = `${percent}%`;
                    
                    if (progressText) {
                        const remaining = Math.max(0, endTime - now);
                        const seconds = Math.floor(remaining / 1000);
                        progressText.textContent = `🏗️ Строительство: ${seconds}с`;
                    }
                    
                    if (now < endTime) {
                        requestAnimationFrame(updateProgress);
                    }
                };
                
                requestAnimationFrame(updateProgress);
            }
        }
    });
    
    return socket;
}

function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
