# backend/resource_calculator.py
import time
import json
from models.building_config import calculate_hourly_income_and_growth
from models.player import Player

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
    
    # Сохраняем текущее количество занятых жителей
    workers_used = player_data.get('workers_used', 0)
    
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
    
    # Начисляем ТОЛЬКО за полные часы
    full_hours = int(hours_passed)
    
    if full_hours == 0:
        # Не прошло ни одного полного часа - ничего не начисляем
        workers_free = current_pop - workers_used
        return {
            'gold': int(current_gold),
            'wood': int(current_wood),
            'stone': int(current_stone),
            'iron': int(current_iron),
            'coal': int(current_coal),
            'food': int(current_food),
            'leather': int(current_leather),
            'horses': int(current_horses),
            'population_current': int(current_pop),
            'workers_free': int(workers_free)
        }
    
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
            print(f"⏰ День {(hour//24)+1}: население={current_pop}, еда={current_food:.0f}, занято={workers_used}")
    
    # Возвращаем обновленные данные
    workers_free = current_pop - workers_used
    
    return {
        'gold': int(current_gold),
        'wood': int(current_wood),
        'stone': int(current_stone),
        'iron': int(current_iron),
        'coal': int(current_coal),
        'food': int(current_food),
        'leather': int(current_leather),
        'horses': int(current_horses),
        'population_current': int(current_pop),
        'workers_free': int(workers_free)
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
    
    # Если прошло меньше часа - ничего не делаем
    time_diff = current_time - last_calc
    if time_diff < 60 * 60 * 1000:  # 1 час
        return player
    
    # Рассчитываем ресурсы за прошедшее время (только полные часы)
    new_resources = calculate_resources_for_period(player, last_calc, current_time)
    
    # Обновляем player в памяти
    for key, value in new_resources.items():
        player[key] = value
    
    # Пересчитываем workers_free для надежности
    workers_free = player['population_current'] - player.get('workers_used', 0)
    player['workers_free'] = workers_free
    
    # Обновляем last_calculated, но сдвигаем только на полные часы
    full_hours = int((current_time - last_calc) / (60 * 60 * 1000))
    new_last_calc = last_calc + (full_hours * 60 * 60 * 1000)
    player['last_calculated'] = new_last_calc
    
    # СОХРАНЯЕМ ВСЕ ИЗМЕНЕНИЯ В БД!
    Player.update(
        player['id'],
        gold=player['gold'],
        wood=player['wood'],
        stone=player['stone'],
        iron=player['iron'],
        coal=player['coal'],
        food=player['food'],
        leather=player['leather'],
        horses=player['horses'],
        population_current=player['population_current'],
        workers_free=player['workers_free'],
        last_calculated=player['last_calculated']
    )
    
    print(f"💾 Ресурсы сохранены в БД для игрока {player['id']}: население={player['population_current']}, свободно={player['workers_free']}, занято={player.get('workers_used', 0)}")
    
    return player
