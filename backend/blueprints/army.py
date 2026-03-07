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

@army_bp.route('/train', methods=['POST'])
@require_telegram
def train_troops(telegram_user):
    """Тренировка войск"""
    data = request.get_json()
    troop_type = data.get('troop_type', 'militia')
    count = data.get('count', 1)
    
    if count not in [1, 5, 10]:
        return jsonify({'success': False, 'error': 'Invalid count'}), 400
    
    telegram_id = str(telegram_user['id'])
    print(f"⚔️ Тренировка {count} {troop_type} для {telegram_id}")
    
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
    
    # Проверяем завершенные тренировки
    for troop in troops:
        if troop.get('training_end') and troop['training_end'] <= current_time and troop['in_training'] > 0:
            # Тренировка завершена
            new_count = troop['count'] + troop['in_training']
            Player.update_troops(
                player['id'],
                troop['troop_type'],
                new_count,
                in_training=0,
                training_end=None
            )
            troop['count'] = new_count
            troop['in_training'] = 0
            troop['training_end'] = None
            print(f"✅ Тренировка {troop['troop_type']} завершена")
    
    return jsonify({
        'success': True,
        'troops': troops,
        'workers_free': player.get('workers_free', 0),
        'workers_used': player.get('workers_used', 0)
    })
