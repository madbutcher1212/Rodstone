console.log("🔥 main.js загружен");

// Глобальные переменные (минимум)
let userData = {
    id: null,
    username: '',
    game_login: '',
    gold: 100,
    wood: 50,
    food: 50,
    stone: 0,
    level: 1
};

// Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Авторизация
async function login() {
    try {
        const result = await authRequest();
        if (result.success) {
            userData.id = result.user.id;
            userData.username = result.user.username || '';
            userData.game_login = result.user.game_login || '';
            userData.gold = result.user.gold || 100;
            userData.wood = result.user.wood || 50;
            userData.food = result.user.food || 50;
            userData.stone = result.user.stone || 0;
            userData.level = result.user.level || 1;
            
            updateUserInfo();
            
            // Показываем окно если нет имени
            const overlay = document.getElementById('loginOverlay');
            if (!userData.game_login) {
                overlay.style.display = 'flex';
            } else {
                overlay.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
    }
}

// Обновление информации
function updateUserInfo() {
    const nameElement = document.getElementById('userName');
    const loginElement = document.getElementById('userLogin');
    if (nameElement) {
        nameElement.textContent = userData.game_login || 'Игрок';
    }
    if (loginElement) {
        loginElement.textContent = '@' + (userData.username || 'username');
    }
}

// Сохранение имени
async function saveGameLogin() {
    console.log('🖱️ Кнопка нажата');
    
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
    
    console.log('Отправляем имя:', newLogin);
    
    // Отправляем на сервер
    const result = await apiRequest('set_login', { game_login: newLogin });
    
    if (result.success) {
        userData.game_login = newLogin;
        updateUserInfo();
        document.getElementById('loginOverlay').style.display = 'none';
        alert(`✅ Добро пожаловать, ${newLogin}!`);
    } else {
        alert('❌ Ошибка сохранения: ' + (result.error || 'Неизвестная ошибка'));
    }
}

// Настройка кнопки
function setupButton() {
    const btn = document.getElementById('confirmLogin');
    if (btn) {
        console.log('✅ Кнопка найдена');
        btn.onclick = saveGameLogin;
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
    } else {
        console.error('❌ Кнопка не найдена');
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM загружен');
    login();
    setupButton();
});
