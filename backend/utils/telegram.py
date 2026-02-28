import hmac
import hashlib
import json
from time import time
from urllib.parse import parse_qs
from flask import current_app

def verify_telegram_data(init_data: str):
    """
    Строгая проверка подписи Telegram.
    Никаких исключений, никаких тестовых пропусков.
    
    Возвращает данные пользователя или None.
    """
    try:
        # Парсим данные из строки запроса
        parsed = parse_qs(init_data)
        
        # Проверяем наличие обязательных полей
        required_fields = ['hash', 'auth_date', 'user']
        if not all(field in parsed for field in required_fields):
            print("❌ Отсутствуют обязательные поля")
            return None
        
        # Проверяем, что данные не старше 1 дня (86400 секунд)
        # Это защита от использования старых перехваченных данных
        auth_date = int(parsed['auth_date'][0])
        current_time = time()
        
        if current_time - auth_date > 86400:
            print(f"❌ Данные устарели: {current_time - auth_date} секунд")
            return None
        
        # Сортируем все поля кроме hash (как требует Telegram)
        data_check_pairs = []
        for key in sorted(parsed.keys()):
            if key != 'hash':
                # Берём первое значение (parse_qs возвращает списки)
                data_check_pairs.append(f"{key}={parsed[key][0]}")
        
        # Склеиваем через перенос строки
        data_check_string = "\n".join(data_check_pairs)
        
        # Получаем hash из данных
        received_hash = parsed['hash'][0]
        
        # Получаем токен бота из конфига
        bot_token = current_app.config.get('BOT_TOKEN')
        if not bot_token:
            print("❌ BOT_TOKEN не настроен")
            return None
        
        # Создаём секретный ключ (константа из документации Telegram)
        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Вычисляем ожидаемый hash
        expected_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Сравниваем через constant-time сравнение
        # Это защита от timing-атак
        if not hmac.compare_digest(expected_hash, received_hash):
            print("❌ Неверная подпись данных")
            return None
        
        # Извлекаем данные пользователя
        user_data = json.loads(parsed['user'][0])
        
        # Дополнительная проверка: убеждаемся, что есть ID
        if 'id' not in user_data:
            print("❌ Нет ID пользователя")
            return None
        
        print(f"✅ Авторизация успешна: {user_data.get('id')}")
        return user_data
        
    except Exception as e:
        print(f"❌ Ошибка при проверке данных: {e}")
        return None
