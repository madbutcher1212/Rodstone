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
        
        if (result.success) {
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
            
            updateUserInfo();
            updateCityUI();
            
            const overlay = document.getElementById('loginOverlay');
            if (!userData.game_login) {
                overlay.style.display = 'flex';
            } else {
                overlay.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        showToast('⚠️ Ошибка загрузки');
    }
}

// Сохранение имени (первый вход)
async function saveGameLogin() {
    const loginInput = document.getElementById('newLogin');
    let newLogin = loginInput.value.trim();
    
    if (!newLogin) {
        showToast('❌ Введите имя');
        return;
    }
    
    if (newLogin.length > 12) {
        newLogin = newLogin.substring(0, 12);
    }
    
    const result = await apiRequest('set_login', { game_login: newLogin });
    
    if (result.success) {
        userData.game_login = newLogin;
        updateUserInfo();
        document.getElementById('loginOverlay').style.display = 'none';
        showToast(`✅ Добро пожаловать, ${newLogin}!`);
    } else {
        showToast(`❌ ${result.error || 'Ошибка'}`);
    }
}

// Изменение имени (в настройках)
async function changeName() {
    const nameInput = document.getElementById('changeNameInput');
    let newName = nameInput.value.trim();
    
    if (!newName) {
        showToast('❌ Введите имя');
        return;
    }
    
    if (newName.length > 12) {
        newName = newName.substring(0, 12);
    }
    
    const result = await apiRequest('set_login', { game_login: newName });
    
    if (result.success) {
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
        document.getElementById('settingsAvatarImg').src = AVATARS[userData.avatar]?.url || '';
        document.getElementById('settingsAvatarName').textContent = AVATARS[userData.avatar]?.name || 'Мужской';
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
    document.getElementById('createClanBtn')?.addEventListener('click', () => showToast('🚧 В разработке'));
    document.getElementById('topClansBtn')?.addEventListener('click', showTopClans);
    document.getElementById('confirmLogin')?.addEventListener('click', saveGameLogin);
    document.getElementById('changeNameBtn')?.addEventListener('click', changeName);
    document.getElementById('confirmAvatarBtn')?.addEventListener('click', confirmAvatarSelection);
    
    setInterval(() => {
        updateTimer();
        checkAutoCollection();
    }, 1000);
    
    switchTab('city');
});
