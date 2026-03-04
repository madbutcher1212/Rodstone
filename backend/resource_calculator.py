# backend/resource_calculator.py
import time
import json
from models.building_config import calculate_hourly_income_and_growth

def calculate_resources_for_period(player_data, start_time, end_time):
    """
    Рассчитывает ресурсы за период с учетом прогрессии
    Возвращает обновленные данные игрока
    """
    # Копируем данные для расчетов (ВСЕ ресурсы)
    current_pop = player_data['population_current']
    current_food = player_data['food']
    current_gold = player_data['gold']
    current_wood = player_data['wood']
    current_stone = player_data['stone']
    current_iron = player_data.get('iron', 0)
    current_coal = player_data.get('coal', 0)
    current_leather = player_data.get('leather', 0)
    current_horses = player_data.get('horses', 0)
    
    buildings = json.loads(player_data['buildings']) if isinstance(player_data['buildings'], str) else player_data['buildings']
    town_hall_level = player_data.get('town_hall_level', 1)
    population_max = player_data.get('population_max', 20)
    
    # Сколько прошло часов
    time_passed_ms = end_time - start_time
    hours_passed = time_passed_ms / (60 * 60 * 1000)
    
    if hours_passed < 0.0167:  # меньше минуты
        return player_data
    
    full_hours = int(hours_passed)
    remaining_minutes = (hours_passed - full_hours) * 60
    
    # ПОЛНЫЕ ЧАСЫ - с прогрессией
    for hour in range(full_hours):
        inc, growth = calculate_hourly_income_and_growth(
            buildings, 
            town_hall_level,
            current_pop,      # меняется каждый час!
            population_max,
            current_food      # меняется каждый час!
        )
        
        # Обновляем ВСЕ ресурсы
        current_gold += inc.get('gold', 0)
        current_wood += inc.get('wood', 0)
        current_food += inc.get('food', 0)  # может быть отрицательным
        current_stone += inc.get('stone', 0)
        current_iron += inc.get('iron', 0)
        current_coal += inc.get('coal', 0)
        current_leather += inc.get('leather', 0)
        current_horses += inc.get('horses', 0)
        
        # Еда не может быть ниже 0
        if current_food < 0:
            current_food = 0
            growth = 0  # если еда кончилась - роста нет
        
        # Рост населения
        current_pop += growth
        if current_pop > population_max:
            current_pop = population_max
        
        print(f"⏰ Час {hour+1}: население={current_pop}, еда={current_food:.1f}")
    
    # ОСТАТОК МИНУТ - пропорционально (без роста населения)
    if remaining_minutes > 1:  # больше минуты
        inc, _ = calculate_hourly_income_and_growth(
            buildings, 
            town_hall_level,
            current_pop,      # население не меняется за минуты
            population_max,
            current_food
        )
        
        minute_multiplier = remaining_minutes / 60
        
        # Обновляем ВСЕ ресурсы пропорционально
        current_gold += int(inc.get('gold', 0) * minute_multiplier)
        current_wood += int(inc.get('wood', 0) * minute_multiplier)
        current_food += inc.get('food', 0) * minute_multiplier
        current_stone += int(inc.get('stone', 0) * minute_multiplier)
        current_iron += int(inc.get('iron', 0) * minute_multiplier)
        current_coal += int(inc.get('coal', 0) * minute_multiplier)
        current_leather += int(inc.get('leather', 0) * minute_multiplier)
        current_horses += int(inc.get('horses', 0) * minute_multiplier)
        
        if current_food < 0:
            current_food = 0
    
    # Возвращаем обновленные данные (ВСЕ ресурсы)
    return {
        'gold': int(current_gold),
        'wood': int(current_wood),
        'stone': int(current_stone),
        'iron': int(current_iron),
        'coal': int(current_coal),
        'food': int(current_food),
        'leather': int(current_leather),
        'horses': int(current_horses),
        'population_current': int(current_pop)
    }


def update_player_resources(player, current_time=None):
    """
    Обновляет ресурсы игрока если прошло время с last_calculated
    Вызывается перед любым действием
    """
    if current_time is None:
        current_time = int(time.time() * 1000)
    
    last_calc = player.get('last_calculated', player.get('last_collection', current_time))
    
    # Если прошло меньше минуты - ничего не делаем
    if current_time - last_calc < 60 * 1000:  # 1 минута
        return player
    
    # Рассчитываем ресурсы за прошедшее время
    new_resources = calculate_resources_for_period(player, last_calc, current_time)
    
    # Обновляем player (ВСЕ ресурсы)
    for key, value in new_resources.items():
        player[key] = value
    player['last_calculated'] = current_time
    
    return player
