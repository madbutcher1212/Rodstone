from flask import Blueprint, request, jsonify, current_app
import time
import json
from models.player import Player
from models.building_config import BUILDINGS_CONFIG, calculate_population_max
from utils.telegram import verify_telegram_data

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth', methods=['POST'])
def auth():
    """
    Авторизация пользователя через Telegram Web App данные.
    Если пользователь новый - создает запись в БД.
    """
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    init_data = data.get('initData', '')
    if not init_data:
        return jsonify({'success': False, 'error': 'No initData'}), 400

    # Проверяем подпись Telegram
    telegram_user = verify_telegram_data(init_data)
    if not telegram_user:
        return jsonify({'success': False, 'error': 'Invalid Telegram data'}), 401

    telegram_id = str(telegram_user['id'])
    username = telegram_user.get('username', '')

    try:
        # Ищем игрока в БД
        player_data = Player.find_by_telegram_id(telegram_id)
        now = int(time.time() * 1000)

        if player_data:
            # Игрок существует - загружаем данные
            buildings = []
            if player_data.get('buildings'):
                try:
                    buildings = json.loads(player_data['buildings'])
                except:
                    buildings = []

            # Загружаем список купленных аватаров
            owned_avatars = player_data.get('owned_avatars', '["male_free","female_free"]')
            if isinstance(owned_avatars, str):
                try:
                    owned_avatars = json.loads(owned_avatars)
                except:
                    owned_avatars = ['male_free', 'female_free']

            # Пересчитываем максимальное население
            max_pop = calculate_population_max(buildings)

            # Обновляем время последнего сбора
            Player.update(player_data['id'],
                          last_collection=now,
                          population_max=max_pop)

            return jsonify({
                'success': True,
                'user': {
                    'id': player_data.get('telegram_id'),
                    'username': player_data.get('username', ''),
                    'game_login': player_data.get('game_login', ''),
                    'avatar': player_data.get('avatar', 'male_free'),
                    'owned_avatars': owned_avatars,
                    'gold': player_data.get('gold', 100),
                    'wood': player_data.get('wood', 50),
                    'food': player_data.get('food', 50),
                    'stone': player_data.get('stone', 0),
                    'level': player_data.get('level', 1),
                    'population_current': player_data.get('population_current', 10),
                    'population_max': max_pop,
                    'lastCollection': now
                },
                'buildings': buildings,
                'config': BUILDINGS_CONFIG
            })
        else:
            # Новый игрок - создаем запись
            initial_buildings = [
                {"id": "house", "level": 1},
                {"id": "farm", "level": 1},
                {"id": "lumber", "level": 1}
            ]

            player_data = Player.create(telegram_id, username, initial_buildings)
            max_pop = calculate_population_max(initial_buildings)

            # Обновляем максимальное население после создания
            Player.update(player_data['id'], population_max=max_pop)

            return jsonify({
                'success': True,
                'user': {
                    'id': player_data['telegram_id'],
                    'username': player_data['username'],
                    'game_login': player_data['game_login'],
                    'avatar': player_data['avatar'],
                    'owned_avatars': json.loads(player_data['owned_avatars']),
                    'gold': player_data['gold'],
                    'wood': player_data['wood'],
                    'food': player_data['food'],
                    'stone': player_data['stone'],
                    'level': player_data['level'],
                    'population_current': player_data['population_current'],
                    'population_max': max_pop,
                    'lastCollection': player_data['last_collection']
                },
                'buildings': initial_buildings,
                'config': BUILDINGS_CONFIG
            })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
