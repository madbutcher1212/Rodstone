from flask import Blueprint, request, jsonify
from utils.telegram import verify_telegram_data
from models.player import Player
import json
import time

clans_bp = Blueprint('clans', __name__)

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
@require_telegram
def create_clan(telegram_user):
    """
    Создание нового клана.
    Пока заглушка - будет реализовано позже.
    """
    return jsonify({
        'success': True,
        'message': 'Clan creation will be available in future updates'
    })

@clans_bp.route('/list', methods=['GET'])
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
        return jsonify({'players': [], 'error': str(e)})
