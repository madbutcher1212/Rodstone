#!/usr/bin/env python
import sys
import os

# Добавляем путь к backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import app
from backend.socket_manager import socketio

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    socketio.run(app, host='0.0.0.0', port=port)
