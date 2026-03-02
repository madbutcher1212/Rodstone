#!/usr/bin/env python
import sys
import os
import gevent.monkey
gevent.monkey.patch_all()

# Добавляем путь к backend
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Импортируем app (socketio будет инициализирован внутри app)
try:
    from backend.app import app
except ImportError:
    sys.path.insert(0, os.path.dirname(__file__))
    from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Запуск сервера на порту {port}")
    
    # Импортируем socketio ПОСЛЕ app, чтобы избежать циклических импортов
    from socket_manager import socketio
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
