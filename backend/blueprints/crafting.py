from flask import Blueprint, request, jsonify
import time
import json

from utils.telegram import verify_telegram_data
from models.player import Player
from resource_calculator import update_player_resources

crafting_bp = Blueprint('crafting', __name__)

# Рецепты крафта
CRAFT_RECIPES = {
    'gambeson': {  # Стёганка (ткацкая мастерская)
        'fabric': 5,
        'leather': 1,
        'time': 60  # 60 секунд (1 минута)
    },
    'spangenhelm': {  # Шлем (мастерская бронника)
        'iron': 4,
        'fabric': 1,
        'coal': 10,
        'time': 60
    },
    'falchion': {  # Фальшион (мастерская оружейника)
        'iron': 10,
        'wood': 2,
        'coal': 10,
        'time': 60
    },
    'spear': {  # Копьё (мастерская оружейника)
        'iron': 3,
        'wood': 10,
        'coal': 6,
        'time': 60
    },
    'bow': {  # Лук (мастерская лукодела)
        'wood': 12,
        'leather': 2,
        'time': 60
    },
    'wooden_shield': {  # Щит (мастерская щитника)
        'wood': 15,
        'leather': 2,
        'iron': 2,
        'time': 60
    },
    'saddle': {  # Седло (мастерская седельника)
        'leather': 8,
        'iron': 2,
        'time': 60
    }
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

@crafting_bp.route('/craft', methods=['POST'])
@require_telegram
def craft_item(telegram_user):
    """Запустить крафт предмета"""
    data = request.get_json()
    item_type = data.get('item_type')  # 'gambeson'
    count = data.get('count', 1)
    
    if item_type not in CRAFT_RECIPES:
        return jsonify({'success': False, 'error': 'Unknown item'}), 400
    
    if count < 1 or count > 5:
        return jsonify({'success': False, 'error': 'Count must be 1-5'}), 400
    
    telegram_id = str(telegram_user['id'])
    print(f"🔨 Крафт {count} {item_type} для {telegram_id}")
    
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404
    
    # Обновляем ресурсы перед действием
    current_time = int(time.time() * 1000)
    player = update_player_resources(player, current_time)
    
    recipe = CRAFT_RECIPES[item_type]
    
    # Проверка ресурсов
    for resource, amount in recipe.items():
        if resource == 'time':
            continue
        if player.get(resource, 0) < amount * count:
            return jsonify({
                'success': False,
                'error': f'Not enough {resource}'
            }), 400
    
    # Проверяем, нет ли уже активного крафта
    crafting = Player.get_crafting(player['id'])
    active = [c for c in crafting if c['in_progress'] > 0]
    
    if active:
        return jsonify({
            'success': False,
            'error': 'Crafting already in progress'
        }), 400
    
    # Списываем ресурсы
    for resource, amount in recipe.items():
        if resource == 'time':
            continue
        player[resource] -= amount * count
    
    # Обновляем ресурсы в БД
    update_data = {}
    for resource in recipe:
        if resource != 'time':
            update_data[resource] = player[resource]
    Player.update(player['id'], **update_data)
    
    # Запускаем крафт
    craft_time = recipe['time'] * 1000 * count  # в миллисекундах
    end_time = current_time + craft_time
    
    Player.update_crafting(
        player['id'],
        item_type,
        0,  # готовых пока 0
        in_progress=count,
        progress_end=end_time
    )
    
    return jsonify({
        'success': True,
        'message': f'Crafting {count} {item_type} started',
        'end_time': end_time,
        'in_progress': count
    })

@crafting_bp.route('/status', methods=['POST'])
@require_telegram
def crafting_status(telegram_user):
    """Статус крафта"""
    telegram_id = str(telegram_user['id'])
    
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404
    
    # Обновляем ресурсы перед проверкой
    current_time = int(time.time() * 1000)
    player = update_player_resources(player, current_time)
    
    crafting = Player.get_crafting(player['id'])
    
    # Проверяем завершенные крафты
    for item in crafting:
        if item.get('progress_end') and item['progress_end'] <= current_time and item['in_progress'] > 0:
            # Крафт завершен
            new_count = item['count'] + item['in_progress']
            Player.update_crafting(
                player['id'],
                item['item_type'],
                new_count,
                in_progress=0,
                progress_end=None
            )
            item['count'] = new_count
            item['in_progress'] = 0
            item['progress_end'] = None
            print(f"✅ Крафт {item['item_type']} завершен")
    
    return jsonify({
        'success': True,
        'crafting': crafting,
        'resources': {
            'fabric': player.get('fabric', 0),
            'leather': player.get('leather', 0)
            'iron': player.get('iron', 0),      
            'coal': player.get('coal', 0),       
            'wood': player.get('wood', 0),
        }
    })

@crafting_bp.route('/collect', methods=['POST'])
@require_telegram
def collect_crafted(telegram_user):
    """Забрать готовые предметы"""
    data = request.get_json()
    item_type = data.get('item_type')
    
    telegram_id = str(telegram_user['id'])
    
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404
    
    # Обновляем ресурсы перед действием
    current_time = int(time.time() * 1000)
    player = update_player_resources(player, current_time)
    
    crafting = Player.get_crafting(player['id'])
    item = next((c for c in crafting if c['item_type'] == item_type), None)
    
    if not item or item['count'] == 0:
        return jsonify({'success': False, 'error': 'No items to collect'}), 400
    
    # Получаем текущее количество предметов (колонка gambeson)
    current_count = player.get('gambeson', 0)
    
    # Добавляем новые предметы
    new_count = current_count + item['count']
    
    # Обновляем ресурсы игрока
    Player.update(player['id'], gambeson=new_count)
    
    # Обнуляем счетчик в таблице крафта
    Player.update_crafting(
        player['id'],
        item_type,
        0,
        in_progress=item['in_progress'],
        progress_end=item['progress_end']
    )
    
    print(f"📦 Игрок {telegram_id} забрал {item['count']} {item_type}, теперь всего gambeson: {new_count}")
    
    return jsonify({
        'success': True,
        'message': f'Collected {item["count"]} {item_type}',
        'count': item['count']
    })
