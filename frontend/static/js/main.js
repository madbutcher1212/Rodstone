// Запуск
document.addEventListener('DOMContentLoaded', () => {
    login();
    
    document.querySelectorAll('.tab').forEach(t => 
        t.addEventListener('click', () => switchTab(t.dataset.tab)));
    
    document.getElementById('townHall')?.addEventListener('click', upgradeTownHall);
    document.getElementById('townHallUpgradeBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        upgradeTownHall();
    });
    
    document.getElementById('createClanBtn')?.addEventListener('click', createClan);
    document.getElementById('topClansBtn')?.addEventListener('click', showTopClans);
    document.getElementById('confirmLogin')?.addEventListener('click', saveGameLogin);
    document.getElementById('changeNameBtn')?.addEventListener('click', changeName);
    document.getElementById('changeNameWithPriceBtn')?.addEventListener('click', changeNamePaid);
    document.getElementById('confirmAvatarBtn')?.addEventListener('click', confirmAvatarSelection);
    
    // Таймер сбора ресурсов (каждую секунду)
    setInterval(async () => {
        const oldTimeLeft = updateTimer(); // теперь updateTimer возвращает время
        
        // Проверяем, не пора ли собрать
        const now = Date.now();
        if (now - userData.lastCollection >= COLLECTION_INTERVAL) {
            const result = await apiRequest('collect', {});
            if (result.success && result.state) {
                Object.assign(userData, result.state);
                updateCityUI();
                showToast('📦 Ресурсы собраны!');
            }
        }
    }, 1000);
    
    // Проверка завершённых таймеров каждые 2 секунды
    setInterval(async () => {
        const result = await apiRequest('check_timers', {});
        if (result.success && result.completed && result.completed.length > 0) {
            console.log('✅ Завершённые таймеры:', result.completed);
            if (result.state) {
                Object.assign(userData, result.state);
                updateCityUI();
            }
            for (const item of result.completed) {
                if (item.type === 'townhall') {
                    showToast(`🏛️ Ратуша улучшена до ${item.new_level} уровня!`);
                } else if (item.type === 'building') {
                    showToast(`✅ ${item.building_id} улучшено до ${item.new_level} уровня!`);
                }
            }
        }
    }, 2000);
    
    switchTab('city');
});
