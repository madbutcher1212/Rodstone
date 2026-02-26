import json
from supabase import create_client
from flask import current_app

def get_supabase():
    return create_client(
        current_app.config['SUPABASE_URL'],
        current_app.config['SUPABASE_KEY']
    )

class Player:
    @staticmethod
    def find_by_telegram_id(telegram_id):
        supabase = get_supabase()
        result = supabase.table("players").select("*").eq("telegram_id", telegram_id).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def create(telegram_id, username, initial_buildings):
        supabase = get_supabase()
        now = int(time.time() * 1000)
        data = {
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
        supabase.table("players").insert(data).execute()
        # Пересчитаем population_max
        from .building_config import calculate_population_max
        max_pop = calculate_population_max(initial_buildings)
        supabase.table("players").update({'population_max': max_pop}).eq('telegram_id', telegram_id).execute()
        return Player.find_by_telegram_id(telegram_id)

    @staticmethod
    def update(player_id, **kwargs):
        supabase = get_supabase()
        supabase.table("players").update(kwargs).eq('id', player_id).execute()
