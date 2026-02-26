from flask import Blueprint, request, jsonify, current_app
import time
import json

from utils.telegram import verify_telegram_data
from models.player import Player
from models.building_config import BUILDINGS_CONFIG, calculate_population_max

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth', methods=['POST'])
def auth():
    data = request.json
    init_data = data.get('initData', '')
    if not init_data:
        return jsonify({'success': False, 'error': 'No initData'}), 400

    telegram_user = verify_telegram_data(init_data)
    if not telegram_user:
        return jsonify({'success': False, 'error': 'Invalid Telegram data'}), 401

    telegram_id = str(telegram_user['id'])
    username = telegram_user.get('username', '')

    try:
        player = Player.find_by_telegram_id(telegram_id)
        now = int(time.time() * 1000)

        if player:
            # Загружаем постройки
            buildings = []
            if player.get('buildings'):
                try:
                    buildings = json.loads(player.get('buildings'))
                except:
                    buildings = []

            # owned_avatars
            owned_avatars = player.get('owned_avatars', '["male_free","female_free"]')
            if isinstance(owned_avatars, str):
                try:
                    owned_avatars = json.loads(owned_avatars)
                except:
                    owned_avatars = ['male_free', 'female_free']

            # Пересчёт максимального населения
            max_pop = calculate_population_max(buildings)
            Player.update(player['id'], last_collection=now, population_max=max_pop)

            return jsonify({
                'success': True,
                'user': {
                    'id': player.get('telegram_id'),
                    'username': player.get('username', ''),
                    'game_login': player.get('game_login', ''),
                    'avatar': player.get('avatar', 'male_free'),
                    'owned_avatars': owned_avatars,
                    'gold': player.get('gold', 100),
                    'wood': player.get('wood', 50),
                    'food': player.get('food', 50),
                    'stone': player.get('stone', 0),
                    'level': player.get('level', 1),
                    'population_current': player.get('population_current', 10),
                    'population_max': max_pop,
                    'lastCollection': now
                },
                'buildings': buildings,
                'config': BUILDINGS_CONFIG
            })
        else:
            # Новый игрок
            initial_buildings = [
                {"id": "house", "level": 1},
                {"id": "farm", "level": 1},
                {"id": "lumber", "level": 1}
            ]
            max_pop = calculate_population_max(initial_buildings)

            new_player = Player.create(telegram_id, username, initial_buildings)
            # Возвращаем данные нового игрока
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
                    'population_current': 10,
                    'population_max': max_pop,
                    'lastCollection': now
                },
                'buildings': initial_buildings,
                'config': BUILDINGS_CONFIG
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
