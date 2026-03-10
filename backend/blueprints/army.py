from flask import Blueprint, request, jsonify
import time
import json

from utils.telegram import verify_telegram_data
from models.player import Player
from resource_calculator import update_player_resources

army_bp = Blueprint('army', __name__)

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

@army_bp.route('/train_militia', methods=['POST'])
@require_telegram
def train_militia(telegram_user):
    """Тренировка ополчения из свободных жителей"""
    data = request.get_json()
    count = data.get('count', 1)
    
    if count < 1 or count > 5:
        return jsonify({'success': False, 'error': 'Invalid count'}), 400
    
    telegram_id = str(telegram_user['id'])
    print(f"⚔️ Тренировка {count} ополченцев для {telegram_id}")
    
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404
    
    # Обновляем ресурсы перед действием
    current_time = int(time.time() * 1000)
    player = update_player_resources(player, current_time)
    
    player_id = player['id']
    workers_free = player.get('workers_free', 0)
    
    # Проверка: хватает ли свободных жителей
    if workers_free < count:
        return jsonify({
            'success': False, 
            'error': f'Нужно {count} свободных жителей, есть {workers_free}'
        }), 400
    
    # Время тренировки: 10 секунд для теста
    training_time = 10 * 1000
    end_time = current_time + training_time
    
    # Получаем текущие войска
    troops = Player.get_troops(player_id)
    militia = next((t for t in troops if t['troop_type'] == 'militia'), None)
    
    # Обновляем запись о войсках
    current_count = militia['count'] if militia else 0
    in_training = (militia['in_training'] if militia else 0) + count
    
    Player.update_troops(
        player_id, 
        'militia', 
        current_count, 
        in_training=in_training,
        training_end=end_time
    )
    
    # Занимаем свободных жителей
    new_workers_free = workers_free - count
    new_workers_used = player.get('workers_used', 0) + count
    
    Player.update(player_id,
                  workers_free=new_workers_free,
                  workers_used=new_workers_used)
    
    return jsonify({
        'success': True,
        'message': f'Тренировка {count} ополченцев началась',
        'end_time': end_time,
        'workers_free': new_workers_free,
        'in_training': in_training
    })

@army_bp.route('/train_unit', methods=['POST'])
@require_telegram
def train_unit(telegram_user):
    """Тренировка юнитов из ополченцев"""
    data = request.get_json()
    unit_type = data.get('unit_type')  # 'archer', 'infantry', 'spearmen', 'cavalry'
    count = data.get('count', 1)
    
    if count < 1 or count > 5:
        return jsonify({'success': False, 'error': 'Invalid count'}), 400
    
    if unit_type not in ['archer', 'infantry', 'spearmen', 'cavalry']:
        return jsonify({'success': False, 'error': 'Invalid unit type'}), 400
    
    telegram_id = str(telegram_user['id'])
    print(f"⚔️ Тренировка {count} {unit_type} для {telegram_id}")
    
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404
    
    # Обновляем ресурсы перед действием
    current_time = int(time.time() * 1000)
    player = update_player_resources(player, current_time)
    
    player_id = player['id']
    
    # Получаем текущие войска
    troops = Player.get_troops(player_id)
    militia = next((t for t in troops if t['troop_type'] == 'militia'), None)
    militia_count = militia['count'] if militia else 0
    
    # Проверка: хватает ли ополченцев
    if militia_count < count:
        return jsonify({
            'success': False, 
            'error': f'Нужно {count} ополченцев, есть {militia_count}'
        }), 400
    
    # Проверка: хватает ли еды (временно 1 еды за юнита)
    if player['food'] < count:
        return jsonify({
            'success': False, 
            'error': f'Нужно {count} еды, есть {player["food"]}'
        }), 400
    
    # Время тренировки: 10 секунд для теста
    training_time = 10 * 1000
    end_time = current_time + training_time
    
    # Обновляем запись о войсках
    unit = next((t for t in troops if t['troop_type'] == unit_type), None)
    current_count = unit['count'] if unit else 0
    
    # Создаем словарь для обновления
    update_data = {
        'count': current_count,
        f'{unit_type}_training': count,
        f'{unit_type}_end': end_time
    }
    
    if unit:
        # Обновляем существующую запись
        supabase = Player.get_supabase()
        supabase.table("troops") \
            .update(update_data) \
            .eq("id", unit['id']) \
            .execute()
    else:
        # Создаем новую запись
        insert_data = {
            'player_id': player_id,
            'troop_type': unit_type,
            'count': 0,
            f'{unit_type}_training': count,
            f'{unit_type}_end': end_time
        }
        supabase = Player.get_supabase()
        supabase.table("troops") \
            .insert(insert_data) \
            .execute()
    
    # Списываем ресурсы
    new_food = player['food'] - count
    new_militia_count = militia_count - count
    
    Player.update_troops(
        player_id,
        'militia',
        new_militia_count,
        in_training=militia['in_training'] if militia else 0,
        training_end=militia['training_end'] if militia else None
    )
    
    Player.update(player_id, food=new_food)
    
    return jsonify({
        'success': True,
        'message': f'Тренировка {count} {unit_type} началась',
        'end_time': end_time,
        'militia_count': new_militia_count,
        'food': new_food
    })

@army_bp.route('/status', methods=['POST'])
@require_telegram
def army_status(telegram_user):
    """Статус армии"""
    telegram_id = str(telegram_user['id'])
    print(f"📊 Запрос статуса армии от {telegram_id}")
    
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404
    
    # Обновляем ресурсы перед проверкой
    current_time = int(time.time() * 1000)
    player = update_player_resources(player, current_time)
    
    troops = Player.get_troops(player['id'])
    
    # Формируем ответ
    result = {
        'militia': {'count': 0, 'in_training': 0},
        'archer': {'count': 0, 'in_training': 0},
        'infantry': {'count': 0, 'in_training': 0},
        'spearmen': {'count': 0, 'in_training': 0},
        'cavalry': {'count': 0, 'in_training': 0}
    }
    
    for troop in troops:
        troop_type = troop['troop_type']
        if troop_type == 'militia':
            result['militia']['count'] = troop.get('count', 0)
            result['militia']['in_training'] = troop.get('in_training', 0)
            result['militia']['training_end'] = troop.get('training_end')
        else:
            # Для других юнитов
            result[troop_type]['count'] = troop.get('count', 0)
            result[troop_type]['in_training'] = troop.get(f'{troop_type}_training', 0)
            result[troop_type]['training_end'] = troop.get(f'{troop_type}_end')
    
    return jsonify({
        'success': True,
        'troops': result,
        'workers_free': player.get('workers_free', 0),
        'food': player.get('food', 0)
    })
