from flask import Blueprint, request, jsonify
import time
import json

from utils.telegram import verify_telegram_data
from models.player import Player
from models.timer import Timer
from models.building_config import (
    BUILDINGS_CONFIG,
    calculate_building_upgrade_cost,
    calculate_population_max,
    calculate_hourly_income_and_growth,
    get_workers_needed
)
from resource_calculator import update_player_resources

# Импорт SocketIO уведомлений
from socket_manager import notify_upgrade_complete, notify_construction_start

actions_bp = Blueprint('actions', __name__)

TOWN_HALL_INCOME = {1:5, 2:10, 3:20, 4:45, 5:100}
TOWN_HALL_UPGRADE_COST = {
    2: {"gold": 50, "wood": 100, "stone": 0},
    3: {"gold": 500, "wood": 400, "stone": 0},
    4: {"gold": 2000, "wood": 1200, "stone": 250},
    5: {"gold": 10000, "wood": 6000, "stone": 2500}
}

def require_telegram(f):
    def wrapper(*args, **kwargs):
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data'}), 400
        init_data = data.get('initData', '')
        telegram_user = verify_telegram_data(init_data)
        if not telegram_user:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        return f(telegram_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@actions_bp.route('/action', methods=['POST'])
@require_telegram
def game_action(telegram_user):
    data = request.get_json()
    action = data.get('action')
    action_data = data.get('data', {})

    telegram_id = str(telegram_user['id'])
    print(f"🎮 Действие '{action}' от пользователя {telegram_id}")

    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404

    # ОБНОВЛЯЕМ РЕСУРСЫ ПЕРЕД ЛЮБЫМ ДЕЙСТВИЕМ
    current_time = int(time.time() * 1000)
    player = update_player_resources(player, current_time)

    player_id = player['id']

    gold = player['gold']
    wood = player['wood']
    food = player['food']
    stone = player['stone']
    iron = player.get('iron', 0)
    coal = player.get('coal', 0)
    leather = player.get('leather', 0)
    horses = player.get('horses', 0)
    level = player['level']
    town_hall_level = player.get('town_hall_level', 1)
    population_current = player.get('population_current', 10)
    population_max = player.get('population_max', 20)
    workers_used = player.get('workers_used', 0)
    workers_free = player.get('workers_free', population_current)
    game_login = player.get('game_login', '')
    avatar = player.get('avatar', 'male_free')

    owned_avatars = player.get('owned_avatars', '["male_free","female_free"]')
    if isinstance(owned_avatars, str):
        try:
            owned_avatars = json.loads(owned_avatars)
        except:
            owned_avatars = ['male_free', 'female_free']

    buildings = []
    if player.get('buildings'):
        try:
            buildings = json.loads(player['buildings'])
        except:
            buildings = []

    last_collection = player.get('last_collection', current_time)

    def build_response(additional_state=None):
        # Пересчитываем свободных жителей
        free = population_current - workers_used
        state = {
            'gold': gold,
            'wood': wood,
            'stone': stone,
            'iron': iron,        
            'coal': coal,        
            'food': food,
            'leather': leather,  
            'horses': horses,    
            'level': level,
            'townHallLevel': town_hall_level,
            'population_current': population_current,
            'population_max': population_max,
            'workers_used': workers_used,
            'workers_free': free,
            'game_login': game_login,
            'avatar': avatar,
            'owned_avatars': owned_avatars,
            'buildings': buildings,
            'lastCollection': last_collection
        }
        if additional_state:
            state.update(additional_state)
        return jsonify({'success': True, 'state': state})

# ===== СБОР РЕСУРСОВ =====
if action == 'collect':
    now = int(time.time() * 1000)
    time_passed = now - last_collection
    hours_passed = time_passed / (60 * 60 * 1000)

    if hours_passed >= 1:
        full_hours = int(hours_passed)
        total_gold = total_wood = total_food = total_stone = 0
        total_iron = total_coal = total_leather = total_horses = 0
        current_pop = population_current
        current_food = food

        for _ in range(full_hours):
            inc, growth = calculate_hourly_income_and_growth(
                buildings, town_hall_level, current_pop, population_max, current_food
            )
            
            total_gold += inc.get('gold', 0)
            total_wood += inc.get('wood', 0)
            total_food += inc.get('food', 0)
            total_stone += inc.get('stone', 0)
            total_iron += inc.get('iron', 0)
            total_coal += inc.get('coal', 0)
            total_leather += inc.get('leather', 0)
            total_horses += inc.get('horses', 0)
            
            # Рост населения с учётом лимита
            available_space = population_max - current_pop
            actual_growth = min(growth, available_space)
            current_pop += actual_growth
            
            current_food += inc.get('food', 0)

        gold += total_gold
        wood += total_wood
        food += total_food
        stone += total_stone
        iron += total_iron
        coal += total_coal
        leather += total_leather
        horses += total_horses
        population_current = current_pop
        last_collection = now

        Player.update(player_id,
                      gold=gold, wood=wood, food=food, stone=stone,
                      iron=iron, coal=coal, leather=leather, horses=horses,
                      population_current=population_current,
                      last_collection=last_collection,
                      last_calculated=now)

        print(f"✅ СБОР: +{total_gold}🪙 +{total_wood}🪵 +{total_stone}⛰️ +{total_food}🌾 +{total_iron}⚙️ +{total_coal}🔥 +{total_leather}🦌 +{total_horses}🐎 за {full_hours}ч")
    else:
        print(f"⏳ Сбор слишком рано, прошло {hours_passed:.2f}ч")

    return build_response()
    
    # ===== ПОСТРОЙКА =====
    if action == 'build':
        building_id = action_data.get('building_id')
        if building_id not in BUILDINGS_CONFIG:
            return jsonify({'success': False, 'error': 'Unknown building'}), 400

        if any(b['id'] == building_id for b in buildings):
            return jsonify({'success': False, 'error': 'Building already exists'}), 400

        config = BUILDINGS_CONFIG[building_id]
        cost = config["base_cost"]

        # Проверка ресурсов
        if gold < cost.get('gold', 0) or wood < cost.get('wood', 0) or stone < cost.get('stone', 0):
            return jsonify({'success': False, 'error': 'Not enough resources'}), 400

        # Проверка уровня ратуши
        required = config.get('requiredTownHall', [1])[0]
        if town_hall_level < required:
            return jsonify({'success': False, 'error': f'Требуется ратуша {required}'}), 400

        # Проверка рабочих
        workers_needed = get_workers_needed(building_id, 1)
        if workers_needed > workers_free:
            return jsonify({'success': False, 'error': f'Нужно {workers_needed} свободных жителей'}), 400

        # Списываем ресурсы
        gold -= cost.get('gold', 0)
        wood -= cost.get('wood', 0)
        stone -= cost.get('stone', 0)

        # Добавляем здание и занимаем рабочих
        buildings.append({"id": building_id, "level": 1})
        workers_used += workers_needed
        workers_free -= workers_needed
        population_max = calculate_population_max(buildings)

        Player.update(player_id,
                      gold=gold, wood=wood, stone=stone,
                      workers_used=workers_used,
                      workers_free=workers_free,
                      buildings=json.dumps(buildings),
                      population_max=population_max,
                      last_calculated=current_time)

        print(f"✅ Построено {building_id}, занято {workers_needed} рабочих")
        return build_response()

    # ===== УЛУЧШЕНИЕ =====
    if action == 'upgrade':
        building_id = action_data.get('building_id')
        print(f"⬆️ Попытка улучшить {building_id}")

        if building_id not in BUILDINGS_CONFIG:
            return jsonify({'success': False, 'error': 'Unknown building'}), 400

        building = next((b for b in buildings if b['id'] == building_id), None)
        if not building:
            return jsonify({'success': False, 'error': 'Building not found'}), 400

        current_level = building['level']
        config = BUILDINGS_CONFIG[building_id]

        if current_level >= config['max_level']:
            return jsonify({'success': False, 'error': 'Max level reached'}), 400

        # Проверка уровня ратуши
        required = config.get('requiredTownHall', [current_level + 1])[current_level]
        if town_hall_level < required:
            return jsonify({'success': False, 'error': f'Требуется ратуша {required}'}), 400

        # Проверка ресурсов
        cost = calculate_building_upgrade_cost(building_id, current_level)
        if gold < cost.get('gold', 0) or wood < cost.get('wood', 0) or stone < cost.get('stone', 0):
            return jsonify({'success': False, 'error': 'Not enough resources'}), 400

        # Проверка дополнительных рабочих
        current_workers = get_workers_needed(building_id, current_level)
        new_workers = get_workers_needed(building_id, current_level + 1)
        additional_workers = new_workers - current_workers
        
        if additional_workers > 0 and additional_workers > workers_free:
            return jsonify({'success': False, 'error': f'Нужно еще {additional_workers} свободных жителей'}), 400

        # Проверка на уже улучшающееся здание
        active_timers = Timer.get_active(player_id, 'building')
        for t in active_timers:
            if t['target_id'] == building_id:
                return jsonify({'success': False, 'error': 'Building already upgrading'}), 400

        # Списываем ресурсы
        gold -= cost.get('gold', 0)
        wood -= cost.get('wood', 0)
        stone -= cost.get('stone', 0)

        # Занимаем дополнительных рабочих если нужно
        if additional_workers > 0:
            workers_used += additional_workers
            workers_free -= additional_workers
            Player.update(player_id, workers_used=workers_used, workers_free=workers_free)

        duration = 5
        timer_data = {
            'building_id': building_id,
            'current_level': current_level,
            'target_level': current_level + 1
        }

        timer = Timer.create(
            player_id=player_id,
            timer_type='building',
            target_id=building_id,
            duration_seconds=duration,
            data=timer_data
        )

        # Уведомляем о начале строительства
        if timer:
            notify_construction_start(telegram_id, building_id, timer['end_time'])

        Player.update(player_id, 
                      gold=gold, wood=wood, stone=stone,
                      last_calculated=current_time)

        print(f"⏳ Улучшение {building_id} до уровня {current_level + 1} запущено на {duration} сек")
        print(f"👷‍♂️ Рабочих: занято {workers_used}, свободно {workers_free}")
        return build_response()

    # ===== УЛУЧШЕНИЕ РАТУШИ =====
    if action == 'upgrade_level':
        print(f"🏛️ Попытка улучшить ратушу с {town_hall_level} до {town_hall_level + 1}")

        if town_hall_level >= 5:
            return jsonify({'success': False, 'error': 'Max level reached'}), 400

        cost = TOWN_HALL_UPGRADE_COST.get(town_hall_level + 1, {})
        if gold < cost.get('gold', 0) or wood < cost.get('wood', 0) or stone < cost.get('stone', 0):
            return jsonify({'success': False, 'error': 'Not enough resources'}), 400

        active_timers = Timer.get_active(player_id, 'building')
        for t in active_timers:
            if t['target_id'] == 'townhall':
                return jsonify({'success': False, 'error': 'Town hall already upgrading'}), 400

        gold -= cost.get('gold', 0)
        wood -= cost.get('wood', 0)
        stone -= cost.get('stone', 0)

        duration = 5
        timer_data = {
            'building_id': 'townhall',
            'current_level': town_hall_level,
            'target_level': town_hall_level + 1
        }

        timer = Timer.create(
            player_id=player_id,
            timer_type='building',
            target_id='townhall',
            duration_seconds=duration,
            data=timer_data
        )

        # Уведомляем о начале строительства ратуши
        if timer:
            notify_construction_start(telegram_id, 'townhall', timer['end_time'])

        Player.update(player_id, 
                      gold=gold, wood=wood, stone=stone,
                      last_calculated=current_time)

        print(f"⏳ Улучшение ратуши до уровня {town_hall_level + 1} запущено на {duration} сек")
        return build_response()

    # ===== ПРОВЕРКА ТАЙМЕРОВ =====
    if action == 'check_timers':
        now = int(time.time() * 1000)
        completed = []
        
        timers = Timer.get_active(player_id)
        
        for timer in timers:
            if timer['end_time'] <= now:
                timer_data = Timer.complete(timer['id'])
                if timer_data and timer_data['timer_type'] == 'building':
                    data = json.loads(timer_data['data'])
                    building_id = data['building_id']
                    target_level = data['target_level']

                    if building_id == 'townhall':
                        town_hall_level = target_level
                        Player.update(player_id, town_hall_level=town_hall_level)
                        completed.append({
                            'type': 'townhall',
                            'new_level': target_level
                        })
                        notify_upgrade_complete(telegram_id, building_id, target_level)
                        print(f"🏛️ Ратуша улучшена до уровня {target_level}")
                    else:
                        for b in buildings:
                            if b['id'] == building_id:
                                b['level'] = target_level
                                break
                        Player.update(player_id, buildings=json.dumps(buildings))
                        completed.append({
                            'type': 'building',
                            'building_id': building_id,
                            'new_level': target_level
                        })
                        notify_upgrade_complete(telegram_id, building_id, target_level)
                        print(f"✅ {building_id} улучшено до уровня {target_level}")

                    population_max = calculate_population_max(buildings)
                    Player.update(player_id, population_max=population_max)

        return jsonify({
            'success': True,
            'completed': completed,
            'state': {
                'gold': gold,
                'wood': wood,
                'food': food,
                'stone': stone,
                'iron': iron,
                'coal': coal,
                'leather': leather,
                'horses': horses,
                'level': level,
                'townHallLevel': town_hall_level,
                'population_current': population_current,
                'population_max': population_max,
                'workers_used': workers_used,
                'workers_free': population_current - workers_used,
                'game_login': game_login,
                'avatar': avatar,
                'owned_avatars': owned_avatars,
                'buildings': buildings,
                'lastCollection': last_collection
            }
        })

    # ===== УСТАНОВКА ИМЕНИ =====
    if action == 'set_login':
        new_login = action_data.get('game_login', '').strip()
        if not new_login:
            return jsonify({'success': False, 'error': 'Login cannot be empty'}), 400
        if len(new_login) > 12:
            new_login = new_login[:12]

        allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_ ')
        if not all(c in allowed_chars for c in new_login):
            return jsonify({'success': False, 'error': 'Only letters, numbers, spaces and underscores'}), 400

        Player.update(player_id, game_login=new_login)
        return build_response({'game_login': new_login})

    # ===== ПЛАТНАЯ СМЕНА ИМЕНИ =====
    if action == 'change_name_paid':
        new_name = action_data.get('game_login', '').strip()
        price = 5000
        if not new_name:
            return jsonify({'success': False, 'error': 'Name cannot be empty'}), 400
        if len(new_name) > 12:
            new_name = new_name[:12]
        allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_ ')
        if not all(c in allowed_chars for c in new_name):
            return jsonify({'success': False, 'error': 'Only letters, numbers, spaces and underscores'}), 400
        if gold < price:
            return jsonify({'success': False, 'error': 'Not enough gold'}), 400

        gold -= price
        Player.update(player_id, game_login=new_name, gold=gold)
        return build_response({'game_login': new_name})

    # ===== ПОКУПКА АВАТАРА =====
    if action == 'buy_avatar':
        new_avatar = action_data.get('avatar', '')
        price = action_data.get('price', 0)

        if new_avatar in owned_avatars:
            return jsonify({'success': False, 'error': 'Already owned'}), 400
        if gold < price:
            return jsonify({'success': False, 'error': 'Not enough gold'}), 400

        gold -= price
        owned_avatars.append(new_avatar)
        Player.update(player_id, gold=gold, owned_avatars=json.dumps(owned_avatars))
        return build_response()

    # ===== ВЫБОР АВАТАРА =====
    if action == 'select_avatar':
        new_avatar = action_data.get('avatar', '')
        if new_avatar not in owned_avatars:
            return jsonify({'success': False, 'error': 'Avatar not owned'}), 400

        Player.update(player_id, avatar=new_avatar)
        return build_response({'avatar': new_avatar})

    return jsonify({'success': False, 'error': 'Unknown action'}), 400
