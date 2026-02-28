// ui.js - уведомления и общие функции интерфейса

// Показать всплывающее уведомление
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// Обновление информации о пользователе
function updateUserInfo() {
    const nameElement = document.getElementById('userName');
    const loginElement = document.getElementById('userLogin');
    const levelElement = document.getElementById('levelBadge');
    const idElement = document.getElementById('userTelegramId');
    
    let displayName = userData.game_login || 'Игрок';
    if (displayName.length > 12) {
        displayName = displayName.substring(0, 12);
    }
    
    if (nameElement) nameElement.textContent = displayName;
    if (loginElement) loginElement.textContent = '@' + (userData.username || 'username');
    if (levelElement) levelElement.textContent = userData.level;
    if (idElement) idElement.textContent = userData.id || '—';
    
    updateAvatar();
}
