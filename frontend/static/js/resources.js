// Обновление таймера - ТЕПЕРЬ ВОЗВРАЩАЕТ ВРЕМЯ
function updateTimer() {
    const now = Date.now();
    const timePassed = now - userData.lastCollection;
    const timeLeft = Math.max(0, COLLECTION_INTERVAL - timePassed);

    const timerDisplay = document.getElementById('timerDisplay');
    const timerProgress = document.getElementById('timerProgress');
    
    if (!timerDisplay || !timerProgress) return timeLeft;

    if (timeLeft <= 0) {
        timerDisplay.textContent = 'Сбор...';
        timerProgress.style.width = '100%';
    } else {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const progress = ((COLLECTION_INTERVAL - timeLeft) / COLLECTION_INTERVAL) * 100;
        timerProgress.style.width = `${progress}%`;
    }
    
    return timeLeft;
}

// Проверка автосбора - теперь просто обёртка
async function checkAutoCollection() {
    if (Date.now() - userData.lastCollection >= COLLECTION_INTERVAL) {
        const result = await apiRequest('collect', {});
        if (result.success && result.state) {
            Object.assign(userData, result.state);
            updateCityUI();
            showToast('📦 Ресурсы собраны!');
        }
    }
}
