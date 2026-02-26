// api.js - все запросы к серверу

async function apiRequest(action, data = {}) {
    try {
        const response = await fetch(`${API_URL}/api/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: window.Telegram.WebApp.initData,
                action: action,
                data: data
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: 'Connection error' };
    }
}

async function authRequest() {
    try {
        const response = await fetch(`${API_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        });
        return await response.json();
    } catch (error) {
        console.error('Auth Error:', error);
        return { success: false, error: 'Connection error' };
    }
}

async function topClansRequest() {
    try {
        const response = await fetch(`${API_URL}/api/clan/top`);
        return await response.json();
    } catch (error) {
        console.error('Top clans error:', error);
        return { players: [] };
    }
}
