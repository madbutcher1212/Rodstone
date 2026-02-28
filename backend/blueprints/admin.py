from flask import Blueprint, request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import json
import time

from utils.telegram import verify_telegram_data
from models.player import Player

admin_bp = Blueprint('admin', __name__)

# Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=current_app,
    default_limits=["200 per day", "50 per hour"]
)

# Список администраторов (telegram_id)
# В продакшене хранить в БД или переменных окружения
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
            print(f"⚠️ Попытка доступа к админке: {telegram_id}")
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

        return f(telegram_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@admin_bp.route('/add_resources', methods=['POST'])
@limiter.limit("10 per minute")
@require_admin
def add_resources(telegram_user):
    """
    Админская функция для добавления ресурсов игроку.
    Только для тестирования. В продакшене убрать или ограничить.
    """
    data = request.get_json()
    target_id = data.get('telegram_id')
    gold = data.get('gold', 0)
    wood = data.get('wood', 0)
    food = data.get('food', 0)
    stone = data.get('stone', 0)

    if not target_id:
        return jsonify({'success': False, 'error': 'Target ID required'}), 400

    # Валидация
    if not isinstance(gold, int) or gold < 0 or gold > 1000000:
        return jsonify({'success': False, 'error': 'Invalid gold amount'}), 400
    if not isinstance(wood, int) or wood < 0 or wood > 1000000:
        return jsonify({'success': False, 'error': 'Invalid wood amount'}), 400
    if not isinstance(food, int) or food < 0 or food > 1000000:
        return jsonify({'success': False, 'error': 'Invalid food amount'}), 400
    if not isinstance(stone, int) or stone < 0 or stone > 1000000:
        return jsonify({'success': False, 'error': 'Invalid stone amount'}), 400

    # Используем атомарное обновление
    def update_func(player):
        return {
            'gold': player['gold'] + gold,
            'wood': player['wood'] + wood,
            'food': player['food'] + food,
            'stone': player['stone'] + stone
        }
    
    updated = Player.atomic_update(target_id, update_func)
    
    if not updated:
        return jsonify({'success': False, 'error': 'Player not found'}), 404

    # Логируем действие админа
    print(f"✅ Admin {telegram_user['id']} added resources to {target_id}: +{gold}🪙 +{wood}🪵 +{food}🌾 +{stone}⛰️")

    return jsonify({'success': True, 'message': 'Resources added'})

@admin_bp.route('/reset_player', methods=['POST'])
@limiter.limit("5 per minute")
@require_admin
def reset_player(telegram_user):
    """
    Сброс прогресса игрока (для тестирования).
    """
    data = request.get_json()
    target_id = data.get('telegram_id')

    if not target_id:
        return jsonify({'success': False, 'error': 'Target ID required'}), 400

    # Сброс к начальным значениям
    initial_buildings = [
        {"id": "house", "level": 1},
        {"id": "farm", "level": 1},
        {"id": "lumber", "level": 1}
    ]

    def update_func(player):
        return {
            'game_login': '',
            'gold': 100,
            'wood': 50,
            'food': 50,
            'stone': 0,
            'level': 1,
            'town_hall_level': 1,
            'population_current': 10,
            'buildings': json.dumps(initial_buildings)
        }
    
    updated = Player.atomic_update(target_id, update_func)
    
    if not updated:
        return jsonify({'success': False, 'error': 'Player not found'}), 404

    print(f"✅ Admin {telegram_user['id']} reset player {target_id}")

    return jsonify({'success': True, 'message': 'Player reset'})

@admin_bp.route('/list_all', methods=['GET'])
@limiter.limit("5 per minute")
@require_admin
def list_all_players(telegram_user):
    """
    Список всех игроков (только для админа).
    """
    try:
        supabase = Player.get_supabase()
        result = supabase.table("players") \
            .select("telegram_id, username, game_login, gold, level, last_collection") \
            .execute()
        
        print(f"✅ Admin {telegram_user['id']} requested player list")
        
        return jsonify({'players': result.data})
    except Exception as e:
        print(f"❌ List all error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/get_player', methods=['POST'])
@limiter.limit("10 per minute")
@require_admin
def get_player(telegram_user):
    """
    Получить данные конкретного игрока по ID.
    """
    data = request.get_json()
    target_id = data.get('telegram_id')

    if not target_id:
        return jsonify({'success': False, 'error': 'Target ID required'}), 400

    try:
        supabase = Player.get_supabase()
        result = supabase.table("players") \
            .select("*") \
            .eq("telegram_id", target_id) \
            .execute()
        
        if not result.data:
            return jsonify({'success': False, 'error': 'Player not found'}), 404

        print(f"✅ Admin {telegram_user['id']} viewed player {target_id}")
        
        return jsonify({'success': True, 'player': result.data[0]})
    except Exception as e:
        print(f"❌ Get player error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
