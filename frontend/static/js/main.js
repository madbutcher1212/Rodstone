// main.js - точка входа, инициализация, глобальные данные

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
    lastCollection: null
};

let buildings = [
    { id: 'house', level: 1 },
    { id: 'farm', level: 1 },
    { id: 'lumber', level: 1 }
];

let currentTab = 'city';
let selectedBuildingForUpgrade = null;
let selectedAvatar = null;

const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ============================================
// Функция обновления шкал строительства для всех зданий
// ============================================
async function updateConstructionProgress() {
    try {
        const result = await apiRequest('check_timers', {});
        
        if (!result.success || !result.active) return;
        
        // Скрываем все шкалы по умолчанию
        document.querySelectorAll('.construction-progress').forEach(el => {
            el.style.display = 'none';
        });
        
        // Показываем шкалы для активных таймеров
        result.active.forEach(timer => {
            if (timer.type === 'building') {
                const progressContainer = document.getElementById(`progress-${timer.building_id}`);
                const progressBar = document.getElementById(`progress-bar-${timer.building_id}`);
                
                if (!progressContainer || !progressBar) return;
                
                progressContainer.style.display = 'block';
                
                const now = Date.now();
                const total = timer.end_time - timer.start_time;
                const elapsed = now - timer.start_time;
                
                if (now < timer.end_time) {
                    const percent = Math.min(100, (elapsed / total) * 100);
                    progressBar.style.width = `${percent}%`;
                }
            }
        });
    } catch (error) {
        console.error('Ошибка при обновлении прогресса:', error);
    }
}

async function login() {
    try {
        const result = await authRequest();
        console.log('📦 Ответ сервера:', result);
        
        if (result && result.success) {
            userData.id = result.user?.id || null;
            userData.username = result.user?.username || '';
            userData.game_login = result.user?.game_login || '';
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
            updateAvatar();
            updateCityUI();
            
            const overlay = document.getElementById('overlay');
            if (overlay) {
                if (!userData.game_login || userData.game_login === '' || userData.game_login === 'EMPTY') {
                    overlay.style.display = 'flex';
                } else {
                    overlay.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        showToast('⚠️ Ошибка загрузки');
    }
}

async function saveGameLogin() {
    const input = document.getElementById('newLogin');
    let name = input.value.trim();
    if (!name) {
        showToast('❌ Введите имя');
        return;
    }
    if (name.length > 12) name = name.substring(0, 12);
    
    const result = await apiRequest('set_login', { game_login: name });
    if (result && result.success) {
        userData.game_login = name;
        updateUserInfo();
        document.getElementById('overlay').style.display = 'none';
        showToast(`✅ Добро пожаловать, ${name}!`);
    } else {
        showToast(`❌ ${result?.error || 'Ошибка'}`);
    }
}

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
    if (result && result.success) {
        if (result.state) Object.assign(userData, result.state);
        updateUserInfo();
        input.value = '';
        showToast(`✅ Имя изменено на ${name}`);
    } else {
        showToast(`❌ ${result?.error || 'Ошибка'}`);
    }
}

function updateUserInfo() {
    let name = userData.game_login || 'Игрок';
    if (name.length > 12) name = name.substring(0, 12);
    document.getElementById('userName').textContent = name;
    document.getElementById('userLogin').textContent = '@' + (userData.username || 'username');
    document.getElementById('levelBadge').textContent = userData.level;
    document.getElementById('userTelegramId').textContent = userData.id || '—';
}

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
        document.getElementById('topClans').innerHTML = html;
    } catch { 
        showToast('❌ Ошибка'); 
    }
}

async function checkAutoCollection() {
    const now = Date.now();
    if (now - userData.lastCollection >= COLLECTION_INTERVAL) {
        console.log('⏰ Автосбор ресурсов');
        const result = await apiRequest('collect', {});
        if (result.success && result.state) {
            Object.assign(userData, result.state);
            updateCityUI();
            showToast('📦 Ресурсы собраны!');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 main.js загружен');
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
    document.getElementById('changeNameWithPriceBtn')?.addEventListener('click', changeNamePaid);
    document.getElementById('confirmAvatarBtn')?.addEventListener('click', confirmAvatarSelection);
    
    // Таймер обновления (каждую секунду) - ТОЛЬКО ВИЗУАЛ
    setInterval(() => {
        updateTimer();
    }, 1000);

    // Проверка сбора (раз в 10 секунд)
    setInterval(async () => {
        await checkAutoCollection();
    }, 10000);

    // Проверка таймеров и обновление шкал (раз в 3 секунды)
    setInterval(async () => {
        const result = await apiRequest('check_timers', {});
        
        // Обработка завершённых таймеров
        if (result.success && result.completed?.length > 0) {
            if (result.state) Object.assign(userData, result.state);
            updateCityUI();
            result.completed.forEach(item => {
                if (item.type === 'townhall') {
                    showToast(`🏛️ Ратуша улучшена до ${item.new_level} уровня!`);
                } else {
                    showToast(`✅ ${item.building_id} улучшено до ${item.new_level} уровня!`);
                }
            });
        }
        
        // Обновляем шкалы прогресса
        await updateConstructionProgress();
    }, 3000);
    
    switchTab('city');
});
