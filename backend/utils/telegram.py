import hmac
import hashlib
import json
from urllib.parse import parse_qs
from flask import current_app

def verify_telegram_data(init_data: str):
    """
    Проверяет подпись данных от Telegram Web App.
    Возвращает данные пользователя или None.
    """
    try:
        parsed = parse_qs(init_data)
        if 'hash' not in parsed:
            return None

        # Собираем строку для проверки
        data_check_pairs = []
        for key in sorted(parsed.keys()):
            if key != 'hash':
                data_check_pairs.append(f"{key}={parsed[key][0]}")
        data_check_string = "\n".join(data_check_pairs)

        received_hash = parsed['hash'][0]
        bot_token = current_app.config['BOT_TOKEN']

        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if expected_hash != received_hash:
            return None

        if 'user' in parsed:
            return json.loads(parsed['user'][0])
        return None
    except Exception:
        return None
