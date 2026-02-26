from flask import Blueprint, request, jsonify
from utils.telegram import verify_telegram_data
from models.player import Player
import json

admin_bp = Blueprint('admin', __name__)

# Список администраторов (telegram_id)
ADMINS = [
    '741282631',  # твой ID
    # можно добавить других
]

def require_admin(f):
    def wrapper(*args, **kwargs):
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data'}), 400
        init_data = data.get('initData', '')
        telegram_user = verify_telegram_data(init_data)
        if not telegram_user:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401

        telegram_id = str(telegram_user['id'])
        if telegram_id not in ADMINS:
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

        return f(telegram_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@admin_bp.route('/add_resources', methods=['POST'])
@require_admin
def add_resources(telegram_user):
    """
    Админская функция для добавления ресурсов игроку.
    Только для тестирования.
    """
    data = request.get_json()
    target_id = data.get('telegram_id')
    gold = data.get('gold', 0)
    wood = data.get('wood', 0)
    food = data.get('food', 0)
    stone = data.get('stone', 0)

    if not target_id:
        return jsonify({'success': False, 'error': 'Target ID required'}), 400

    player = Player.find_by_telegram_id(target_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404

    Player.update(player['id'],
                  gold=player['gold'] + gold,
                  wood=player['wood'] + wood,
                  food=player['food'] + food,
                  stone=player['stone'] + stone)

    return jsonify({'success': True, 'message': 'Resources added'})

@admin_bp.route('/reset_player', methods=['POST'])
@require_admin
def reset_player(telegram_user):
    """
    Сброс прогресса игрока (для тестирования).
    """
    data = request.get_json()
    target_id = data.get('telegram_id')

    if not target_id:
        return jsonify({'success': False, 'error': 'Target ID required'}), 400

    player = Player.find_by_telegram_id(target_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404

    # Сброс к начальным значениям
    initial_buildings = [
        {"id": "house", "level": 1},
        {"id": "farm", "level": 1},
        {"id": "lumber", "level": 1}
    ]

    Player.update(player['id'],
                  game_login='',
                  gold=100,
                  wood=50,
                  food=50,
                  stone=0,
                  level=1,
                  population_current=10,
                  buildings=json.dumps(initial_buildings))

    return jsonify({'success': True, 'message': 'Player reset'})

@admin_bp.route('/list_all', methods=['GET'])
@require_admin
def list_all_players(telegram_user):
    """
    Список всех игроков (только для админа).
    """
    supabase = Player.get_supabase()
    result = supabase.table("players") \
        .select("telegram_id, username, game_login, gold, level, last_collection") \
        .execute()
    return jsonify({'players': result.data})
