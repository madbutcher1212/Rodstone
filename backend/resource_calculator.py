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
    
    # ЗАЩИТА: максимум 720 часов (30 дней)
    if hours_passed > 720:
        print(f"⚠️ Слишком большой период: {hours_passed:.0f} часов, обрезаем до 720")
        hours_passed = 720
    
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
        
        # Обновляем ВСЕ ресурсы с проверкой наличия ключей
        if 'gold' in inc:
            current_gold += inc['gold']
        if 'wood' in inc:
            current_wood += inc['wood']
        if 'food' in inc:
            current_food += inc['food']  # может быть отрицательным
        if 'stone' in inc:
            current_stone += inc['stone']
        if 'iron' in inc:
            current_iron += inc['iron']
        if 'coal' in inc:
            current_coal += inc['coal']
        if 'leather' in inc:
            current_leather += inc['leather']
        if 'horses' in inc:
            current_horses += inc['horses']
        
        # Еда не может быть ниже 0
        if current_food < 0:
            current_food = 0
            growth = 0  # если еда кончилась - роста нет
        
        # Рост населения
        current_pop += growth
        if current_pop > population_max:
            current_pop = population_max
        
        # Логируем только раз в 24 часа, чтобы не спамить
        if hour % 24 == 0:
            print(f"⏰ День {(hour//24)+1}: население={current_pop}, еда={current_food:.0f}")
    
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
        
        # Обновляем ВСЕ ресурсы пропорционально с проверкой
        if 'gold' in inc:
            current_gold += int(inc['gold'] * minute_multiplier)
        if 'wood' in inc:
            current_wood += int(inc['wood'] * minute_multiplier)
        if 'food' in inc:
            current_food += inc['food'] * minute_multiplier
        if 'stone' in inc:
            current_stone += int(inc['stone'] * minute_multiplier)
        if 'iron' in inc:
            current_iron += int(inc['iron'] * minute_multiplier)
        if 'coal' in inc:
            current_coal += int(inc['coal'] * minute_multiplier)
        if 'leather' in inc:
            current_leather += int(inc['leather'] * minute_multiplier)
        if 'horses' in inc:
            current_horses += int(inc['horses'] * minute_multiplier)
        
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
    
    # Защита: если last_calc в будущем или 0 - ставим текущее время
    if last_calc > current_time or last_calc == 0:
        print(f"⚠️ last_calc={last_calc} некорректно, устанавливаем current_time")
        last_calc = current_time
        player['last_calculated'] = current_time
    
    # Если прошло меньше минуты - ничего не делаем
    time_diff = current_time - last_calc
    if time_diff < 60 * 1000:  # 1 минута
        return player
    
    # Рассчитываем ресурсы за прошедшее время
    new_resources = calculate_resources_for_period(player, last_calc, current_time)
    
    # Обновляем player (ВСЕ ресурсы)
    for key, value in new_resources.items():
        player[key] = value
    player['last_calculated'] = current_time
    
    return player
