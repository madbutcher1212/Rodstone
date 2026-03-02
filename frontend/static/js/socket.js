// socket.js - управление WebSocket соединением

let socket = null;

function initSocket(telegramId) {
    if (socket) return socket;
    
    socket = io(API_URL);
    
    socket.on('connect', () => {
        console.log('🔌 WebSocket подключён');
        // Отправляем аутентификацию
        socket.emit('authenticate', { telegram_id: telegramId });
    });
    
    socket.on('authenticated', (data) => {
        console.log('✅ Аутентификация WebSocket успешна');
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 WebSocket отключён');
    });
    
    socket.on('upgrade_complete', (data) => {
        console.log('🏗️ Улучшение завершено:', data);
        
        // Обновляем данные
        if (data.building_id === 'townhall') {
            userData.townHallLevel = data.new_level;
        } else {
            const building = buildings.find(b => b.id === data.building_id);
            if (building) building.level = data.new_level;
        }
        
        updateCityUI();
        showToast(`✅ ${data.building_id} улучшено до ${data.new_level} уровня!`);
    });
    
    socket.on('construction_start', (data) => {
        console.log('🚧 Начало строительства:', data);
        // Можно показать уведомление или обновить UI
    });
    
    return socket;
}

function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
