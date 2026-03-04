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
            userData.level = data.new_level;
            console.log(`🏛️ Ратуша улучшена до ${data.new_level} уровня`);
            
            // Прячем шкалу для ратуши
            const progressContainer = document.getElementById('progress-townhall');
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
        } else {
            const building = buildings.find(b => b.id === data.building_id);
            if (building) {
                building.level = data.new_level;
                console.log(`✅ ${data.building_id} улучшено до ${data.new_level} уровня`);
                
                // Прячем шкалу для обычного здания
                const progressContainer = document.getElementById(`progress-${data.building_id}`);
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
            }
        }
        
        // Обновляем UI
        updateCityUI();
        showToast(`✅ ${data.building_id === 'townhall' ? 'Ратуша' : data.building_id} улучшена до ${data.new_level} уровня!`);
    });
    
    socket.on('construction_start', (data) => {
        console.log('🚧 Начало строительства:', data);
        
        const buildingId = data.building_id;
        const endTime = data.end_time;
        
        // Функция для создания и обновления шкалы прогресса
        const setupProgressBar = (container, bar, text, id) => {
            if (!container || !bar) return null;
            
            container.style.display = 'flex';
            
            const startTime = Date.now();
            const duration = endTime - startTime;
            
            const updateProgress = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const percent = Math.min(100, (elapsed / duration) * 100);
                
                bar.style.width = `${percent}%`;
                
                if (text) {
                    const remaining = Math.max(0, endTime - now);
                    const seconds = Math.floor(remaining / 1000);
                    text.textContent = `🏗️ ${seconds}с`;
                }
                
                if (now < endTime) {
                    requestAnimationFrame(updateProgress);
                }
            };
            
            requestAnimationFrame(updateProgress);
            return true;
        };
        
        // Для ратуши
        if (buildingId === 'townhall') {
            let progressContainer = document.getElementById('progress-townhall');
            let progressBar = document.getElementById('progress-bar-townhall');
            let progressText = document.getElementById('progress-text-townhall');
            
            // Если шкалы нет - создаём
            if (!progressContainer) {
                const townHall = document.getElementById('townHall');
                if (townHall) {
                    progressContainer = document.createElement('div');
                    progressContainer.className = 'construction-progress';
                    progressContainer.id = 'progress-townhall';
                    
                    progressBar = document.createElement('div');
                    progressBar.className = 'construction-bar';
                    progressBar.id = 'progress-bar-townhall';
                    
                    progressText = document.createElement('div');
                    progressText.className = 'construction-text';
                    progressText.id = 'progress-text-townhall';
                    
                    progressContainer.appendChild(progressBar);
                    progressContainer.appendChild(progressText);
                    townHall.appendChild(progressContainer);
                }
            }
            
            setupProgressBar(progressContainer, progressBar, progressText, buildingId);
        } 
        // Для обычных зданий
        else {
            let progressContainer = document.getElementById(`progress-${buildingId}`);
            let progressBar = document.getElementById(`progress-bar-${buildingId}`);
            let progressText = document.getElementById(`progress-text-${buildingId}`);
            
            // Если шкалы нет - ищем карточку здания и добавляем
            if (!progressContainer) {
                // Ищем карточку здания по ID здания
                const buildingCards = document.querySelectorAll('.building-card');
                for (const card of buildingCards) {
                    const nameElement = card.querySelector('.building-name');
                    const config = BUILDINGS_CONFIG[buildingId];
                    
                    if (nameElement && config && nameElement.textContent === config.name) {
                        progressContainer = document.createElement('div');
                        progressContainer.className = 'construction-progress';
                        progressContainer.id = `progress-${buildingId}`;
                        
                        progressBar = document.createElement('div');
                        progressBar.className = 'construction-bar';
                        progressBar.id = `progress-bar-${buildingId}`;
                        
                        progressText = document.createElement('div');
                        progressText.className = 'construction-text';
                        progressText.id = `progress-text-${buildingId}`;
                        
                        progressContainer.appendChild(progressBar);
                        progressContainer.appendChild(progressText);
                        card.appendChild(progressContainer);
                        break;
                    }
                }
            }
            
            setupProgressBar(progressContainer, progressBar, progressText, buildingId);
        }
    });
    
    socket.on('resources_updated', (data) => {
        console.log('💰 Ресурсы обновлены:', data);
        if (data) {
            Object.assign(userData, data);
            updateResourcesDisplay();
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
