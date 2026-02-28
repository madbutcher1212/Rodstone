// api.js - все запросы к серверу

// Функция для показа сообщений прямо на экране
function showDebug(message) {
    console.log(message);
    // Создаём или находим элемент для отладки
    let debugDiv = document.getElementById('debug-console');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-console';
        debugDiv.style.position = 'fixed';
        debugDiv.style.top = '10px';
        debugDiv.style.left = '10px';
        debugDiv.style.right = '10px';
        debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
        debugDiv.style.color = 'lime';
        debugDiv.style.padding = '10px';
        debugDiv.style.borderRadius = '5px';
        debugDiv.style.zIndex = '9999';
        debugDiv.style.fontSize = '12px';
        debugDiv.style.maxHeight = '200px';
        debugDiv.style.overflowY = 'auto';
        document.body.appendChild(debugDiv);
    }
    
    const line = document.createElement('div');
    line.textContent = new Date().toLocaleTimeString() + ': ' + message;
    debugDiv.appendChild(line);
    debugDiv.scrollTop = debugDiv.scrollHeight;
}

async function apiRequest(action, data = {}) {
    showDebug(`📤 Отправка действия: ${action}`);
    
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        showDebug(`📤 URL: ${API_URL}/api/action`);
        
        const response = await fetch(`${API_URL}/api/action`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                initData: initData,
                action: action,
                data: data
            })
        });
        
        showDebug(`📥 Статус: ${response.status}`);
        
        if (!response.ok) {
            const text = await response.text();
            showDebug(`❌ Ошибка: ${text.substring(0, 100)}`);
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        const result = await response.json();
        showDebug(`✅ Успех: ${JSON.stringify(result).substring(0, 100)}`);
        return result;
        
    } catch (error) {
        showDebug(`❌ Ошибка сети: ${error.message}`);
        return { success: false, error: 'Connection error' };
    }
}

async function authRequest() {
    showDebug(`📤 Авторизация...`);
    
    try {
        const initData = window.Telegram?.WebApp?.initData || '';
        showDebug(`📤 URL: ${API_URL}/api/auth`);
        
        const response = await fetch(`${API_URL}/api/auth`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initData: initData })
        });
        
        showDebug(`📥 Статус: ${response.status}`);
        
        if (!response.ok) {
            const text = await response.text();
            showDebug(`❌ Ошибка: ${text.substring(0, 100)}`);
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        const result = await response.json();
        showDebug(`✅ Успех: ${JSON.stringify(result).substring(0, 100)}`);
        return result;
        
    } catch (error) {
        showDebug(`❌ Ошибка сети: ${error.message}`);
        return { success: false, error: 'Connection error' };
    }
}
