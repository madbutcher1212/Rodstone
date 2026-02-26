// ui.js - обновление интерфейса, тосты, переключение вкладок

// Показать всплывающее уведомление
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
}

// Обновление информации о пользователе (имя, логин, уровень)
function updateUserInfo() {
    let name = userData.game_login || 'Игрок';
    if (name.length > 12) name = name.substring(0, 12);
    document.getElementById('userName').textContent = name;
    document.getElementById('userLogin').textContent = '@' + (userData.username || 'username');
    document.getElementById('levelBadge').textContent = userData.level;
    document.getElementById('userTelegramId').textContent = userData.id || '—';
    updateAvatar();
}

// Переключение вкладок
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => 
        t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.tab-pane').forEach(p => 
        p.classList.toggle('hidden', !p.id.includes(tab.charAt(0).toUpperCase() + tab.slice(1))));

    // При переходе на вкладку настроек обновляем отображение аватара
    if (tab === 'settings') {
        document.getElementById('settingsAvatarImg').src = AVATARS[userData.avatar].url;
        document.getElementById('settingsAvatarName').textContent = AVATARS[userData.avatar].name;
    }
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Вкладки
    document.querySelectorAll('.tab').forEach(t => 
        t.addEventListener('click', () => switchTab(t.dataset.tab)));

    // Ратуша
    document.getElementById('townHall').addEventListener('click', upgradeTownHall);

    // Кнопка улучшения ратуши (если есть)
    const townHallUpgradeBtn = document.getElementById('townHallUpgradeBtn');
    if (townHallUpgradeBtn) {
        townHallUpgradeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            upgradeTownHall();
        });
    }

    // Кланы (заглушки)
    document.getElementById('createClanBtn')?.addEventListener('click', () => showToast('🚧 В разработке'));
    document.getElementById('topClansBtn')?.addEventListener('click', showTopClans);

    // Регистрация
    document.getElementById('confirmLogin')?.addEventListener('click', saveGameLogin);

    // Смена имени
    document.getElementById('changeNameWithPriceBtn')?.addEventListener('click', changeNamePaid);

    // Подтверждение выбора аватара
    document.getElementById('confirmAvatarBtn')?.addEventListener('click', confirmAvatarSelection);
}

// Показать топ кланов (пока топ игроков по золоту)
async function showTopClans() {
    const data = await topClansRequest();
    let html = '<h4>🏆 Топ игроков</h4>';
    if (!data.players?.length) {
        html += '<p>Пока нет игроков</p>';
    } else {
        data.players.forEach((p, i) => {
            html += `<div><b>${i+1}.</b> ${p.game_login || 'Без имени'} 🪙${p.gold}</div>`;
        });
    }
    document.getElementById('topClans').innerHTML = html;
}
