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
    population_current: 10,
    population_max: 20,
    lastCollection: Date.now()
};

let buildings = [
    { id: 'house', level: 1 },
    { id: 'farm', level: 1 },
    { id: 'lumber', level: 1 }
];

let currentTab = 'city';
let selectedBuildingForUpgrade = null;

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Авторизация при загрузке
async function login() {
    const result = await authRequest();
    
    if (result.success) {
        Object.assign(userData, result.user);
        buildings = result.buildings || buildings;
        updateUserInfo();
        updateCityUI();

        // Показываем окно регистрации, если нет имени
        if (!userData.game_login || userData.game_login === '' || userData.game_login === 'EMPTY') {
            document.getElementById('loginOverlay').style.display = 'flex';
        } else {
            document.getElementById('loginOverlay').style.display = 'none';
        }
    } else {
        showToast('⚠️ Ошибка загрузки');
    }
}

// Сохранение имени при первом входе
async function saveGameLogin() {
    const input = document.getElementById('newLogin');
    let name = input.value.trim();
    if (!name) {
        showToast('❌ Введите имя');
        return;
    }
    if (name.length > 12) name = name.substring(0, 12);

    const result = await apiRequest('set_login', { game_login: name });
    if (result.success) {
        Object.assign(userData, result.state);
        document.getElementById('loginOverlay').style.display = 'none';
        showToast(`✅ Добро пожаловать, ${name}!`);
        updateUserInfo();
    }
}

// Платная смена имени
async function changeNamePaid() {
    const input = document.getElementById('newNameInput');
    let name = input.value.trim();
    if (!name) {
        showToast('❌ Введите имя');
        return;
    }
    if (name.length > 12) name = name.substring(0, 12);
    if (userData.gold < 5000) {
        showToast('❌ Не хватает монет');
        return;
    }

    const result = await apiRequest('change_name_paid', { game_login: name });
    if (result.success) {
        Object.assign(userData, result.state);
        showToast(`✅ Имя изменено на ${name}`);
        updateUserInfo();
        input.value = '';
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    login();
    initEventListeners();

    // Запускаем таймер и проверку автосбора каждую секунду
    setInterval(() => {
        updateTimer();
        checkAutoCollection();
    }, 1000);

    // По умолчанию открыта вкладка города
    switchTab('city');
});
