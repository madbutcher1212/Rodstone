import json
import time
from supabase import create_client
from flask import current_app

def get_supabase():
    """Возвращает клиент Supabase с настройками из конфига приложения."""
    return create_client(
        current_app.config['SUPABASE_URL'],
        current_app.config['SUPABASE_KEY']
    )

class Player:
    """Класс для работы с таблицей players в базе данных."""

    @staticmethod
    def find_by_telegram_id(telegram_id):
        """Ищет игрока по telegram_id."""
        supabase = get_supabase()
        result = supabase.table("players") \
            .select("*") \
            .eq("telegram_id", telegram_id) \
            .execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def create(telegram_id, username, initial_buildings):
        """Создает нового игрока с начальными данными."""
        supabase = get_supabase()
        now = int(time.time() * 1000)

        # Начальные данные
        player_data = {
            'telegram_id': telegram_id,
            'username': username,
            'game_login': '',
            'avatar': 'male_free',
            'owned_avatars': json.dumps(['male_free', 'female_free']),
            'gold': 100,
            'wood': 50,
            'food': 50,
            'stone': 0,
            'level': 1,
            'population_current': 10,
            'population_max': 10,  # будет пересчитано
            'buildings': json.dumps(initial_buildings),
            'last_collection': now
        }

        # Вставка
        supabase.table("players").insert(player_data).execute()

        # Возвращаем созданного игрока
        return Player.find_by_telegram_id(telegram_id)

    @staticmethod
    def update(player_id, **kwargs):
        """Обновляет поля игрока по его id."""
        supabase = get_supabase()
        supabase.table("players") \
            .update(kwargs) \
            .eq('id', player_id) \
            .execute()

    @staticmethod
    def get_buildings(player_id):
        """Возвращает постройки игрока в виде списка."""
        supabase = get_supabase()
        result = supabase.table("players") \
            .select("buildings") \
            .eq('id', player_id) \
            .execute()
        if result.data and result.data[0].get('buildings'):
            try:
                return json.loads(result.data[0]['buildings'])
            except:
                return []
        return []

    @staticmethod
    def get_owned_avatars(player_id):
        """Возвращает список купленных аватаров."""
        supabase = get_supabase()
        result = supabase.table("players") \
            .select("owned_avatars") \
            .eq('id', player_id) \
            .execute()
        if result.data and result.data[0].get('owned_avatars'):
            try:
                owned = json.loads(result.data[0]['owned_avatars'])
                if isinstance(owned, list):
                    return owned
            except:
                pass
        return ['male_free', 'female_free']
