// api.js - все запросы к серверу

async function apiRequest(action, data = {}) {
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        console.log('📤 Отправка действия:', action, data);
        
        const response = await fetch(`${API_URL}/api/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: initData,
                action: action,
                data: data
            })
        });
        
        const result = await response.json();
        console.log('📥 Ответ:', result);
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: 'Connection error' };
    }
}

async function authRequest() {
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        console.log('📤 Авторизация...');
        
        const response = await fetch(`${API_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: initData })
        });
        
        const result = await response.json();
        console.log('📥 Ответ авторизации:', result);
        return result;
    } catch (error) {
        console.error('Auth Error:', error);
        return { success: false, error: 'Connection error' };
    }
}

async function topClansRequest() {
    try {
        const response = await fetch(`${API_URL}/api/clans/top`);
        return await response.json();
    } catch (error) {
        console.error('Top clans error:', error);
        return { players: [] };
    }
}
