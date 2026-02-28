console.log("🔥 main.js загружен и запущен");

// Простейшая проверка кнопки
function setupButton() {
    console.log("🔄 Ищем кнопку...");
    const btn = document.getElementById('confirmLogin');
    if (btn) {
        console.log("✅ Кнопка найдена, настраиваю...");
        // Делаем её ОЧЕНЬ заметной
        btn.style.backgroundColor = 'purple';
        btn.style.color = 'white';
        btn.style.fontSize = '30px';
        btn.style.padding = '20px';
        btn.style.border = '10px solid lime';

        // Навешиваем обработчик самым примитивным способом
        btn.onclick = function() {
            console.log("🖱️ КЛИК ПО КНОПКЕ!");
            alert("Кнопка работает!");
            
            // Тут может быть твоя логика сохранения
            const playerName = document.getElementById('newLogin').value;
            if(playerName) {
                alert("Привет, " + playerName);
                document.getElementById('loginOverlay').style.display = 'none';
            } else {
                alert("Введи имя");
            }
        };
    } else {
        console.error("❌ Кнопка НЕ найдена!");
    }
}

// Пробуем найти кнопку разными способами
setupButton();

// Пробуем ещё раз через секунду, на всякий случай
setTimeout(setupButton, 1000);
