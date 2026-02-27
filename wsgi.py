import sys
import os

# Добавляем папку backend в путь поиска модулей
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import create_app

app = create_app()
