import time
from models.player import Player
from models.building_config import calculate_hourly_income_and_growth
import json

def hourly_collection():
    """Запускается каждый час"""
    supabase = get_supabase()
    
    # Получаем всех игроков
    players = supabase.table("players").select("*").execute()
    
    for player in players.data:
        # Загружаем данные
        buildings = json.loads(player['buildings'])
        level = player['level']
        population_current = player['population_current']
        population_max = player['population_max']
        food = player['food']
        
        # Считаем доход за 1 час
        income, growth = calculate_hourly_income_and_growth(
            buildings, level, population_current, population_max, food
        )
        
        # Обновляем ресурсы
        Player.update(player['id'],
                      gold=player['gold'] + income['gold'],
                      wood=player['wood'] + income['wood'],
                      food=player['food'] + income['food'],
                      stone=player['stone'] + income['stone'],
                      population_current=population_current + growth,
                      last_collection=int(time.time() * 1000))
        
        print(f"✅ Начислено игроку {player['id']}: +{income['gold']}🪙")

if __name__ == "__main__":
    hourly_collection()
