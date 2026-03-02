#!/usr/bin/env python
import sys
import os
import gevent.monkey
gevent.monkey.patch_all()

# Добавляем путь к backend
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Импортируем app и socketio
try:
    from backend.app import app
    from backend.socket_manager import socketio
except ImportError:
    # Если импорт из backend.app не работает, пробуем прямой импорт
    sys.path.insert(0, os.path.dirname(__file__))
    from app import app
    from socket_manager import socketio

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Запуск сервера на порту {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
