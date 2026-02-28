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
        const result = await authRequest();
        console.log('📦 Ответ сервера при авторизации:', result);
        
        if (result && result.success) {
            // ВАЖНО: загружаем game_login из ответа
            userData.id = result.user?.id || null;
            userData.username = result.user?.username || '';
            userData.game_login = result.user?.game_login || '';  // ← ЭТО КЛЮЧЕВОЕ
            userData.avatar = result.user?.avatar || 'male_free';
            userData.owned_avatars = result.user?.owned_avatars || ['male_free', 'female_free'];
            userData.gold = result.user?.gold || 100;
            userData.wood = result.user?.wood || 50;
            userData.food = result.user?.food || 50;
            userData.stone = result.user?.stone || 0;
            userData.level = result.user?.level || 1;
            userData.townHallLevel = result.user?.townHallLevel || 1;
            userData.population_current = result.user?.population_current || 10;
            userData.population_max = result.user?.population_max || 20;
            userData.lastCollection = result.user?.lastCollection || Date.now();
            
            buildings = result.buildings || [
                { id: 'house', level: 1 },
                { id: 'farm', level: 1 },
                { id: 'lumber', level: 1 }
            ];
            
            updateUserInfo();
            updateCityUI();
            
            // ВАЖНО: проверяем game_login (включая 'EMPTY')
            const overlay = document.getElementById('overlay');
            if (overlay) {
                if (!userData.game_login || userData.game_login === '' || userData.game_login === 'EMPTY') {
                    console.log('📝 Нет имени, показываем окно');
                    overlay.style.display = 'flex';
                } else {
                    console.log('✅ Имя есть:', userData.game_login);
                    overlay.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('❌ Ошибка авторизации:', error);
        showToast('⚠️ Ошибка загрузки');
    }
}

// Сохранение имени (первый вход)
async function saveGameLogin() {
    console.log('🖱️ Кнопка нажата');
    
    const loginInput = document.getElementById('newLogin');
    if (!loginInput) {
        alert('Ошибка: поле ввода не найдено');
        return;
    }
    
    let newLogin = loginInput.value.trim();
    if (!newLogin) {
        showToast('❌ Введите имя');
        return;
    }
    
    if (newLogin.length > 12) {
        newLogin = newLogin.substring(0, 12);
    }
    
    console.log('📤 Отправляем имя:', newLogin);
    
    // ВАЖНО: используем apiRequest, а не прямой fetch
    const result = await apiRequest('set_login', { game_login: newLogin });
    console.log('📥 Результат сохранения:', result);
    
    if (result && result.success) {
        userData.game_login = newLogin;
        updateUserInfo();
        
        const overlay = document.getElementById('overlay');
        if (overlay) overlay.style.display = 'none';
        
        showToast(`✅ Добро пожаловать, ${newLogin}!`);
    } else {
        showToast(`❌ ${result?.error || 'Ошибка сохранения'}`);
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
    
    const result = await apiRequest('set_login', { game_login: newName });
    
    if (result && result.success) {
        userData.game_login = newName;
        updateUserInfo();
        nameInput.value = '';
        showToast(`✅ Имя изменено на ${newName}`);
    } else {
        showToast(`❌ ${result?.error || 'Ошибка'}`);
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
    
    const result = await apiRequest('change_name_paid', { game_login: newName });
    
    if (result && result.success) {
        if (result.state) Object.assign(userData, result.state);
        updateUserInfo();
        nameInput.value = '';
        showToast(`✅ Имя изменено на ${newName}`);
    } else {
        showToast(`❌ ${result?.error || 'Ошибка'}`);
    }
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
async function createClan() { 
    showToast('🚧 В разработке'); 
}

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
    } catch { 
        showToast('❌ Ошибка'); 
    }
}

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
    
    setInterval(() => {
        updateTimer();
        checkAutoCollection();
    }, 1000);
    
    switchTab('city');
});
