from flask import Blueprint, request, jsonify
import time
import json
import re  # добавил импорт

from utils.telegram import verify_telegram_data
from models.player import Player
from models.building_config import (
    BUILDINGS_CONFIG,
    calculate_building_upgrade_cost,
    calculate_population_max,
    calculate_hourly_income_and_growth
)

actions_bp = Blueprint('actions', __name__)

# Константы ратуши
TOWN_HALL_INCOME = {1:5, 2:10, 3:20, 4:45, 5:100}
TOWN_HALL_UPGRADE_COST = {
    2: {"gold": 50, "wood": 100, "stone": 0},
    3: {"gold": 500, "wood": 400, "stone": 0},
    4: {"gold": 2000, "wood": 1200, "stone": 250},
    5: {"gold": 10000, "wood": 6000, "stone": 2500}
}

# Декоратор для проверки авторизации
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

    # Получаем игрока
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404

    player_id = player['id']

    # Текущие данные игрока
    gold = player['gold']
    wood = player['wood']
    food = player['food']
    stone = player['stone']
    level = player['level']
    town_hall_level = player.get('town_hall_level', 1)
    population_current = player.get('population_current', 10)
    population_max = player.get('population_max', 20)
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

    last_collection = player.get('last_collection', int(time.time() * 1000))

    def build_response(additional_state=None):
        state = {
            'gold': gold,
            'wood': wood,
            'food': food,
            'stone': stone,
            'level': level,
            'townHallLevel': town_hall_level,
            'population_current': population_current,
            'population_max': population_max,
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

        if hours_passed > 0:
            total_gold = total_wood = total_food = total_stone = total_pop = 0
            current_pop = population_current
            current_food = food

            for _ in range(int(hours_passed)):
                inc, growth = calculate_hourly_income_and_growth(
                    buildings, town_hall_level, current_pop, population_max, current_food
                )
                total_gold += inc["gold"]
                total_wood += inc["wood"]
                total_food += inc["food"]
                total_stone += inc["stone"]
                total_pop += growth
                current_pop += growth
                current_food += inc["food"]

            gold += total_gold
            wood += total_wood
            food += total_food
            stone += total_stone
            population_current = min(current_pop, population_max)
            last_collection = now

            Player.update(player_id,
                          gold=gold, wood=wood, food=food, stone=stone,
                          population_current=population_current,
                          last_collection=last_collection)

            print(f"✅ Сбор ресурсов: +{total_gold}🪙 +{total_wood}🪵 +{total_food}🌾 +{total_stone}⛰️")

        return build_response()

    # ===== ПОСТРОЙКА НОВОГО ЗДАНИЯ =====
    if action == 'build':
        building_id = action_data.get('building_id')
        print(f"🏗️ Попытка построить {building_id}")

        if building_id not in BUILDINGS_CONFIG:
            return jsonify({'success': False, 'error': 'Unknown building'}), 400

        # Проверяем, не построено ли уже
        if any(b['id'] == building_id for b in buildings):
            return jsonify({'success': False, 'error': 'Building already exists'}), 400

        config = BUILDINGS_CONFIG[building_id]
        cost = config["base_cost"]

        # Проверка ресурсов
        if gold < cost['gold'] or wood < cost['wood'] or stone < cost['stone']:
            return jsonify({'success': False, 'error': 'Not enough resources'}), 400

        # Проверка требований к ратуше
        required = config.get('requiredTownHall', [1])[0]
        if town_hall_level < required:
            return jsonify({'success': False, 'error': f'Требуется ратуша {required}'}), 400

        # Списываем ресурсы
        gold -= cost['gold']
        wood -= cost['wood']
        stone -= cost['stone']

        # Добавляем здание
        buildings.append({"id": building_id, "level": 1, "count": 1})
        population_max = calculate_population_max(buildings)

        Player.update(player_id,
                      gold=gold, wood=wood, stone=stone,
                      buildings=json.dumps(buildings),
                      population_max=population_max)

        print(f"✅ Построено {building_id}")
        return build_response()

    # ===== УЛУЧШЕНИЕ ЗДАНИЯ =====
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

        # Проверка требований к ратуше для следующего уровня
        required = config.get('requiredTownHall', [current_level + 1])[current_level]
        if town_hall_level < required:
            return jsonify({'success': False, 'error': f'Требуется ратуша {required}'}), 400

        cost = calculate_building_upgrade_cost(building_id, current_level)
        if gold < cost['gold'] or wood < cost['wood'] or stone < cost['stone']:
            return jsonify({'success': False, 'error': 'Not enough resources'}), 400

        # Списываем ресурсы
        gold -= cost['gold']
        wood -= cost['wood']
        stone -= cost['stone']

        # Увеличиваем уровень
        building['level'] = current_level + 1
        population_max = calculate_population_max(buildings)

        Player.update(player_id,
                      gold=gold, wood=wood, stone=stone,
                      buildings=json.dumps(buildings),
                      population_max=population_max)

        print(f"✅ Улучшено {building_id} до уровня {current_level + 1}")
        return build_response()

    # ===== УЛУЧШЕНИЕ РАТУШИ =====
    if action == 'upgrade_level':
        print(f"🏛️ Попытка улучшить ратушу с {town_hall_level} до {town_hall_level + 1}")

        if town_hall_level >= 5:
            return jsonify({'success': False, 'error': 'Max level reached'}), 400

        cost = TOWN_HALL_UPGRADE_COST.get(town_hall_level + 1, {})
        if gold < cost.get('gold', 0) or wood < cost.get('wood', 0) or stone < cost.get('stone', 0):
            return jsonify({'success': False, 'error': 'Not enough resources'}), 400

        gold -= cost.get('gold', 0)
        wood -= cost.get('wood', 0)
        stone -= cost.get('stone', 0)
        town_hall_level += 1

        Player.update(player_id,
                      gold=gold, wood=wood, stone=stone,
                      town_hall_level=town_hall_level)

        print(f"✅ Ратуша улучшена до уровня {town_hall_level}")
        return build_response()

    # ===== УСТАНОВКА ИМЕНИ (ПРИ РЕГИСТРАЦИИ) =====
    if action == 'set_login':
        print(f"🔥 set_login вызван для {telegram_id}")
        print(f"📦 action_data: {action_data}")

        new_login = action_data.get('game_login', '').strip()
        print(f"📝 Имя после strip: '{new_login}'")

        # Валидация
        if not new_login:
            print("❌ Имя пустое")
            return jsonify({'success': False, 'error': 'Login cannot be empty'}), 400

        if len(new_login) > 12:
            new_login = new_login[:12]
            print(f"📏 Имя обрезано до 12: '{new_login}'")

        # Разрешаем буквы, цифры, пробелы и подчёркивания
        allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_ ')
        if not all(c in allowed_chars for c in new_login):
            print(f"❌ Недопустимые символы: '{new_login}'")
            return jsonify({'success': False, 'error': 'Only letters, numbers, spaces and underscores'}), 400

        # Обновляем в БД
        try:
            print(f"💾 Обновляем БД для player_id {player_id}")
            Player.update(player_id, game_login=new_login)
            print(f"✅ БД обновлена")

            return jsonify({
                'success': True,
                'state': {
                    'game_login': new_login,
                    'gold': gold,
                    'wood': wood,
                    'food': food,
                    'stone': stone,
                    'level': level,
                    'townHallLevel': town_hall_level,
                    'population_current': population_current,
                    'population_max': population_max,
                    'avatar': avatar,
                    'owned_avatars': owned_avatars,
                    'buildings': buildings,
                    'lastCollection': last_collection
                }
            })
        except Exception as e:
            print(f"❌ Ошибка БД: {e}")
            return jsonify({'success': False, 'error': 'Database error'}), 500

    # ===== ПЛАТНАЯ СМЕНА ИМЕНИ =====
    if action == 'change_name_paid':
        new_name = action_data.get('game_login', '').strip()
        price = 5000
        print(f"💰 Попытка платной смены имени на '{new_name}'")

        if not new_name:
            return jsonify({'success': False, 'error': 'Name cannot be empty'}), 400
        if len(new_name) > 12:
            new_name = new_name[:12]
        # Для платной смены тоже разрешаем пробелы
        allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_ ')
        if not all(c in allowed_chars for c in new_name):
            return jsonify({'success': False, 'error': 'Only letters, numbers, spaces and underscores'}), 400
        if gold < price:
            return jsonify({'success': False, 'error': 'Not enough gold'}), 400

        gold -= price
        Player.update(player_id, game_login=new_name, gold=gold)
        print(f"✅ Имя изменено на '{new_name}' за {price}🪙")
        return build_response({'game_login': new_name})

    # ===== ПОКУПКА АВАТАРА =====
    if action == 'buy_avatar':
        new_avatar = action_data.get('avatar', '')
        price = action_data.get('price', 0)
        print(f"🖼️ Попытка купить аватар {new_avatar} за {price}🪙")

        allowed_avatars = ['male_free', 'female_free', 'male_premium', 'female_premium']
        if new_avatar not in allowed_avatars:
            return jsonify({'success': False, 'error': 'Invalid avatar'}), 400
        if new_avatar in owned_avatars:
            return jsonify({'success': False, 'error': 'Already owned'}), 400
        if gold < price:
            return jsonify({'success': False, 'error': 'Not enough gold'}), 400

        gold -= price
        owned_avatars.append(new_avatar)
        Player.update(player_id,
                      gold=gold,
                      owned_avatars=json.dumps(owned_avatars))

        print(f"✅ Аватар {new_avatar} куплен")
        return build_response()

    # ===== ВЫБОР АВАТАРА =====
    if action == 'select_avatar':
        new_avatar = action_data.get('avatar', '')
        print(f"🖼️ Выбор аватара {new_avatar}")

        allowed_avatars = ['male_free', 'female_free', 'male_premium', 'female_premium']
        if new_avatar not in allowed_avatars:
            return jsonify({'success': False, 'error': 'Invalid avatar'}), 400
        if new_avatar not in owned_avatars:
            return jsonify({'success': False, 'error': 'Avatar not owned'}), 400

        Player.update(player_id, avatar=new_avatar)
        print(f"✅ Аватар {new_avatar} выбран")
        return build_response({'avatar': new_avatar})

    # Если действие неизвестно
    print(f"❌ Неизвестное действие: {action}")
    return jsonify({'success': False, 'error': 'Unknown action'}), 400
