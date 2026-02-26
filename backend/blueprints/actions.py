from flask import Blueprint, request, jsonify, current_app
import time
import json

from utils.telegram import verify_telegram_data
from models.player import Player
from models.building_config import (
    BUILDINGS_CONFIG,
    calculate_building_upgrade_cost,
    calculate_population_max,
    calculate_hourly_income_and_growth
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

actions_bp = Blueprint('actions', __name__)

# Конфигурация ратуши
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
        data = request.json
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
    data = request.json
    action = data.get('action')
    action_data = data.get('data', {})

    telegram_id = str(telegram_user['id'])
    player = Player.find_by_telegram_id(telegram_id)
    if not player:
        return jsonify({'success': False, 'error': 'Player not found'}), 404

    # Здесь будет огромный if/elif по action
    # Пока вернём заглушку
    return jsonify({'success': False, 'error': 'Not implemented yet'}), 501
