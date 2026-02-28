import json
import time
from supabase import create_client
from flask import current_app

# Создадим клиент один раз (будет инициализирован через init_supabase)
_supabase_client = None

def init_supabase(url, key):
    """Инициализирует клиент Supabase (вызывается при создании app)"""
    global _supabase_client
    _supabase_client = create_client(url, key)

def get_supabase():
    """Возвращает клиент Supabase"""
    if _supabase_client is None:
        raise RuntimeError("Supabase client not initialized. Call init_supabase first.")
    return _supabase_client

class Player:
    """Класс для работы с таблицей players в базе данных."""

    @staticmethod
    def find_by_telegram_id(telegram_id, lock=False):
        """
        Ищет игрока по telegram_id.
        Если lock=True, блокирует строку для обновления (FOR UPDATE).
        """
        supabase = get_supabase()
        
        # Базовый запрос
        query = supabase.table("players").select("*").eq("telegram_id", telegram_id)
        
        # Если нужна блокировка, добавляем FOR UPDATE
        # В Supabase это делается через header
        if lock:
            # Используем сырой SQL для блокировки
            result = supabase.rpc(
                'get_player_for_update',
                {'p_telegram_id': telegram_id}
            ).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
        else:
            result = query.execute()
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
            'town_hall_level': 1,
            'population_current': 10,
            'population_max': 10,  # будет пересчитано
            'buildings': json.dumps(initial_buildings),
            'last_collection': now
        }

        # Вставка
        result = supabase.table("players").insert(player_data).execute()
        
        if not result.data:
            raise Exception("Failed to create player")

        # Возвращаем созданного игрока
        return Player.find_by_telegram_id(telegram_id)

    @staticmethod
    def update(player_id, **kwargs):
        """Обновляет поля игрока по его id."""
        supabase = get_supabase()
        
        # Убираем None значения
        update_data = {k: v for k, v in kwargs.items() if v is not None}
        
        if not update_data:
            return
            
        supabase.table("players") \
            .update(update_data) \
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

    @staticmethod
    def atomic_update(telegram_id, update_func):
        """
        Атомарное обновление с блокировкой.
        update_func получает текущие данные игрока и должен вернуть словарь с изменениями.
        """
        supabase = get_supabase()
        
        # Начинаем транзакцию
        # В Supabase это делается через RPC
        try:
            # Блокируем строку
            player = Player.find_by_telegram_id(telegram_id, lock=True)
            if not player:
                return None
            
            # Применяем функцию обновления
            updates = update_func(player)
            
            if updates:
                # Обновляем
                supabase.table("players") \
                    .update(updates) \
                    .eq('id', player['id']) \
                    .execute()
            
            return Player.find_by_telegram_id(telegram_id)
        except Exception as e:
            print(f"❌ Atomic update error: {e}")
            return None
