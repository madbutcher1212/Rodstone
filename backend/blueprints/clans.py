from flask import Blueprint, request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
import json

from utils.telegram import verify_telegram_data
from models.player import Player

clans_bp = Blueprint('clans', __name__)

# Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=current_app,
    default_limits=["200 per day", "50 per hour"]
)

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

@clans_bp.route('/create', methods=['POST'])
@limiter.limit("3 per minute")  # Не больше 3 попыток в минуту
@require_telegram
def create_clan(telegram_user):
    """
    Создание нового клана.
    Пока заглушка - будет реализовано позже с полной защитой.
    """
    data = request.get_json()
    name = data.get('name', '').strip()
    tag = data.get('tag', '').strip()
    
    # Валидация входных данных
    if not name or not tag:
        return jsonify({'success': False, 'error': 'Name and tag required'}), 400
    
    if len(name) > 20:
        return jsonify({'success': False, 'error': 'Name too long'}), 400
    
    if len(tag) > 5:
        return jsonify({'success': False, 'error': 'Tag too long'}), 400
    
    if not tag.isalnum():
        return jsonify({'success': False, 'error': 'Tag must be alphanumeric'}), 400
    
    telegram_id = str(telegram_user['id'])
    
    # TODO: добавить реальную логику кланов
    # Сейчас просто заглушка
    
    return jsonify({
        'success': True,
        'message': 'Clan creation will be available in future updates'
    })

@clans_bp.route('/list', methods=['GET'])
@limiter.limit("10 per minute")
def list_clans():
    """
    Список кланов.
    Пока заглушка.
    """
    return jsonify({
        'success': True,
        'clans': []
    })

@clans_bp.route('/top', methods=['GET'])
@limiter.limit("10 per minute")
def top_clans():
    """
    Топ кланов по уровню/силе.
    Пока возвращает топ игроков по золоту.
    """
    try:
        supabase = Player.get_supabase()
        result = supabase.table("players") \
            .select("game_login, gold, level") \
            .order('gold', desc=True) \
            .limit(10) \
            .execute()
        return jsonify({'players': result.data})
    except Exception as e:
        print(f"❌ Top clans error: {e}")
        return jsonify({'players': [], 'error': str(e)})
