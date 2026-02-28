from flask import Blueprint, request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
import json
from models.player import Player
from models.building_config import BUILDINGS_CONFIG, calculate_population_max
from utils.telegram import verify_telegram_data

auth_bp = Blueprint('auth', __name__)

# Rate Limiter для этого blueprint
limiter = Limiter(
    get_remote_address,
    app=current_app,
    default_limits=["200 per day", "50 per hour"]
)

@auth_bp.route('/auth', methods=['POST'])
@limiter.limit("5 per minute")
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
                    'townHallLevel': player_data.get('town_hall_level', 1),
                    'population_current': player_data.get('population_current', 10),
                    'population_max': max_pop,
                    'lastCollection': player_data.get('last_collection', now)  // ← берём из БД
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

            max_pop = calculate_population_max(initial_buildings)

            new_player = {
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
                'population_max': max_pop,
                'buildings': json.dumps(initial_buildings),
                'last_collection': now
            }
            
            Player.create(telegram_id, username, initial_buildings)

            return jsonify({
                'success': True,
                'user': {
                    'id': telegram_id,
                    'username': username,
                    'game_login': '',
                    'avatar': 'male_free',
                    'owned_avatars': ['male_free', 'female_free'],
                    'gold': 100,
                    'wood': 50,
                    'food': 50,
                    'stone': 0,
                    'level': 1,
                    'townHallLevel': 1,
                    'population_current': 10,
                    'population_max': max_pop,
                    'lastCollection': now
                },
                'buildings': initial_buildings,
                'config': BUILDINGS_CONFIG
            })

    except Exception as e:
        print(f"❌ Ошибка авторизации: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
