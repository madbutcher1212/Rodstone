// main.js - точка входа, инициализация, глобальные данные

// Глобальные переменные
let userData = {
    id: null,
    username: '',
    game_login: '',
    avatar: 'male_free',
    owned_avatars: ['male_free', 'female_free'],
    gold: 100,
    wood: 50,
    food: 50,
    stone: 0,
    level: 1,
    townHallLevel: 1,
    population_current: 10,
    population_max: 20,
    lastCollection: Date.now()
};

let buildings = [
    { id: 'house', count: 1, level: 1 },
    { id: 'farm', count: 1, level: 1 },
    { id: 'lumber', count: 1, level: 1 }
];

let currentTab = 'city';
let selectedBuildingForUpgrade = null;
let selectedAvatar = null;

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Авторизация при загрузке
async function login() {
    try {
        console.log('🔍 Авторизация...');
        const result = await authRequest();
        console.log('📦 Ответ сервера:', result);
        
        if (result.success) {
            // Загружаем данные пользователя
            userData.id = result.user.id;
            userData.username = result.user.username || '';
            userData.game_login = result.user.game_login || '';
            userData.avatar = result.user.avatar || 'male_free';
            userData.owned_avatars = result.user.owned_avatars || ['male_free', 'female_free'];
            userData.gold = result.user.gold || 100;
            userData.wood = result.user.wood || 50;
            userData.food = result.user.food || 50;
            userData.stone = result.user.stone || 0;
            userData.level = result.user.level || 1;
            userData.townHallLevel = result.user.townHallLevel || 1;
            userData.population_current = result.user.population_current || 10;
            userData.population_max = result.user.population_max || 20;
            userData.lastCollection = result.user.lastCollection || Date.now();
            
            buildings = result.buildings || [
                { id: 'house', count: 1, level: 1 },
                { id: 'farm', count: 1, level: 1 },
                { id: 'lumber', count: 1, level: 1 }
            ];
            
            // Обновляем интерфейс
            updateUserInfo();
            updateCityUI();
            
            // Показываем окно выбора имени, если нужно
            const overlay = document.getElementById('loginOverlay');
            if (overlay) {
                if (!userData.game_login) {
                    overlay.style.display = 'flex';
                    const btn = document.getElementById('confirmLogin');
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = 'Начать игру';
                    }
                } else {
                    overlay.style.display = 'none';
                }
            }
        } else {
            showToast('⚠️ Ошибка загрузки: ' + (result.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        showToast('⚠️ Ошибка соединения с сервером');
    }
}

// Сохранение имени (первый вход)
// Сохранение имени (первый вход)
async function saveGameLogin() {
    console.log('🖱️ Кнопка нажата!');
    
    const loginInput = document.getElementById('newLogin');
    if (!loginInput) {
        alert('Ошибка: поле ввода не найдено');
        return;
    }
    
    const newLogin = loginInput.value.trim();
    
    if (!newLogin) {
        alert('Введите имя');
        return;
    }
    
    if (newLogin.length > 12) {
        newLogin = newLogin.substring(0, 12);
    }
    
    userData.game_login = newLogin;
    updateUserInfo();
    
    document.getElementById('loginOverlay').style.display = 'none';
    
    alert(`Добро пожаловать, ${newLogin}!`);
    
    // Сохраняем в базу
    await performAction('set_login', { game_login: newLogin });
}
    
    // Блокируем кнопку чтобы не нажали дважды
    const btn = document.getElementById('confirmLogin');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Сохранение...';
    }
    
    const success = await performAction('set_login', { game_login: newLogin });
    console.log('✅ Результат сохранения:', success);
    
    if (success) {
        const overlay = document.getElementById('loginOverlay');
        if (overlay) overlay.style.display = 'none';
        showToast(`✅ Добро пожаловать, ${newLogin}!`);
    } else {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Начать игру';
        }
    }
}

// Изменение имени (в настройках)
async function changeName() {
    const nameInput = document.getElementById('changeNameInput');
    if (!nameInput) return;
    
    let newName = nameInput.value.trim();
    
    if (!newName) {
        showToast('❌ Введите имя');
        return;
    }
    
    if (newName.length > 12) {
        newName = newName.substring(0, 12);
    }
    
    const success = await performAction('set_login', { game_login: newName });
    
    if (success) {
        nameInput.value = '';
        showToast(`✅ Имя изменено на ${newName}`);
    }
}

// Платная смена имени
async function changeNamePaid() {
    const nameInput = document.getElementById('newNameInput');
    if (!nameInput) return;
    
    let newName = nameInput.value.trim();
    
    if (!newName) {
        showToast('❌ Введите имя');
        return;
    }
    
    if (newName.length > 12) {
        newName = newName.substring(0, 12);
    }
    
    if (userData.gold < 5000) {
        showToast('❌ Не хватает монет');
        return;
    }
    
    const success = await performAction('change_name_paid', { game_login: newName });
    
    if (success) {
        nameInput.value = '';
        showToast(`✅ Имя изменено на ${newName}`);
    }
}

// Переключение вкладок
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => 
        t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.tab-pane').forEach(p => 
        p.classList.toggle('hidden', !p.id.includes(tab.charAt(0).toUpperCase() + tab.slice(1))));
    
    if (tab === 'settings') {
        const img = document.getElementById('settingsAvatarImg');
        const name = document.getElementById('settingsAvatarName');
        if (img && name && AVATARS[userData.avatar]) {
            img.src = AVATARS[userData.avatar].url;
            name.textContent = AVATARS[userData.avatar].name;
        }
    }
}

// Кланы (заглушки)
async function createClan() { showToast('🚧 В разработке'); }

async function showTopClans() {
    try {
        const response = await fetch(`${API_URL}/api/clans/top`);
        const data = await response.json();
        let html = '<h4 style="margin-bottom:10px;">🏆 Топ игроков</h4>';
        if (!data.players?.length) {
            html += '<p style="color:#666;">Пока нет игроков</p>';
        } else {
            data.players.forEach((p, i) => {
                html += `<div style="padding:8px; margin:5px 0; background:white; border-radius:8px; display:flex; justify-content:space-between;">
                    <span><b>${i+1}.</b> ${p.game_login || 'Без имени'}</span>
                    <span>🪙${p.gold}</span>
                </div>`;
            });
        }
        const topClans = document.getElementById('topClans');
        if (topClans) topClans.innerHTML = html;
    } catch { showToast('❌ Ошибка'); }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ main.js загружен');
    
    login();
    
    document.querySelectorAll('.tab').forEach(t => 
        t.addEventListener('click', () => switchTab(t.dataset.tab)));
    
    const townHall = document.getElementById('townHall');
    if (townHall) townHall.addEventListener('click', upgradeTownHall);
    
    const createBtn = document.getElementById('createClanBtn');
    if (createBtn) createBtn.addEventListener('click', createClan);
    
    const topBtn = document.getElementById('topClansBtn');
    if (topBtn) topBtn.addEventListener('click', showTopClans);
    
    const confirmBtn = document.getElementById('confirmLogin');
    if (confirmBtn) {
        console.log('🔘 Кнопка найдена, добавляю обработчик');
        confirmBtn.addEventListener('click', saveGameLogin);
    } else {
        console.error('❌ Кнопка confirmLogin не найдена!');
    }
    
    const changeBtn = document.getElementById('changeNameBtn');
    if (changeBtn) changeBtn.addEventListener('click', changeName);
    
    const paidBtn = document.getElementById('changeNameWithPriceBtn');
    if (paidBtn) paidBtn.addEventListener('click', changeNamePaid);
    
    const avatarBtn = document.getElementById('confirmAvatarBtn');
    if (avatarBtn) avatarBtn.addEventListener('click', confirmAvatarSelection);
    
    setInterval(() => {
        updateTimer();
        checkAutoCollection();
    }, 1000);
    // ПРОВЕРКА КНОПКИ
setTimeout(() => {
    const btn = document.getElementById('confirmLogin');
    if (btn) {
        console.log('✅ Кнопка найдена через 2 секунды');
        btn.style.border = '5px solid red';
        btn.style.backgroundColor = 'green';
        btn.onclick = function() {
            alert('✅ Кнопка работает напрямую!');
        };
    } else {
        console.error('❌ Кнопка НЕ найдена через 2 секунды');
    }
}, 2000);
    
    switchTab('city');
});
