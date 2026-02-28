// api.js - все запросы к серверу

async function apiRequest(action, data = {}) {
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: initData,
                action: action,
                data: data
            })
        });
        
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: 'Connection error' };
    }
}

async function authRequest() {
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        const response = await fetch(`${API_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: initData })
        });
        
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        return await response.json();
        
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
