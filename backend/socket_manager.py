# backend/socket_manager.py
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import logging

# Создаём SocketIO instance (будет инициализирован в app.py)
socketio = SocketIO(cors_allowed_origins="*", logger=True, engineio_logger=True)

# Словарь для хранения соответствия telegram_id и комнат
user_rooms = {}

def init_socketio(app):
    """Инициализирует SocketIO с приложением"""
    socketio.init_app(app, cors_allowed_origins="*")
    return socketio

def register_socket_handlers():
    """Регистрирует обработчики событий"""
    
    @socketio.on('connect')
    def handle_connect():
        """Клиент подключился"""
        print(f'🟢 Клиент подключился: {request.sid}')
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Клиент отключился"""
        # Удаляем пользователя из всех комнат
        for telegram_id, sid in list(user_rooms.items()):
            if sid == request.sid:
                del user_rooms[telegram_id]
                print(f'🔴 Клиент {telegram_id} отключился')
                break
    
    @socketio.on('authenticate')
    def handle_authenticate(data):
        """Аутентификация через telegram_id"""
        telegram_id = data.get('telegram_id')
        if telegram_id:
            # Сохраняем соответствие
            user_rooms[telegram_id] = request.sid
            join_room(telegram_id)  # Вступаем в комнату с именем telegram_id
            print(f'✅ Пользователь {telegram_id} аутентифицирован, SID: {request.sid}')
            emit('authenticated', {'success': True})

# Функции для отправки событий
def notify_upgrade_complete(telegram_id, building_id, new_level):
    """Уведомить игрока о завершении улучшения"""
    socketio.emit('upgrade_complete', {
        'building_id': building_id,
        'new_level': new_level
    }, room=telegram_id)
    print(f"📨 Уведомление отправлено игроку {telegram_id}: {building_id} -> {new_level}")

def notify_resources_updated(telegram_id, resources):
    """Уведомить игрока об изменении ресурсов"""
    socketio.emit('resources_updated', resources, room=telegram_id)

def notify_construction_start(telegram_id, building_id, end_time):
    """Уведомить о начале строительства"""
    socketio.emit('construction_start', {
        'building_id': building_id,
        'end_time': end_time
    }, room=telegram_id)
    print(f"🚧 Начало строительства для {telegram_id}: {building_id}")
