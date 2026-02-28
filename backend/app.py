from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

# Импорт blueprint'ов
from blueprints.auth import auth_bp
from blueprints.actions import actions_bp
from blueprints.clans import clans_bp
from blueprints.admin import admin_bp

# Импорт инициализации Supabase
from models.player import init_supabase

def create_app():
    # Указываем правильные пути к шаблонам и статике
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/static'))
    
    app = Flask(__name__, 
                template_folder=template_dir,
                static_folder=static_dir)

    # Конфигурация
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SUPABASE_URL'] = os.environ.get('SUPABASE_URL', 'https://xevwktdwyioyantuqntb.supabase.co')
    app.config['SUPABASE_KEY'] = os.environ.get('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldndrdGR3eWlveWFudHVxbnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODI2NTAsImV4cCI6MjA4NzQ1ODY1MH0.jC8jqGBv_yrbYg_x4XQradxxbkDtsXsQ9EBT0Iabed4')
    app.config['BOT_TOKEN'] = os.environ.get('BOT_TOKEN', '8596066162:AAEm2DSAFhKemedKC8rT4RfFY4fjUhVBCvI')

    # Инициализируем Supabase клиент
    init_supabase(app.config['SUPABASE_URL'], app.config['SUPABASE_KEY'])

    # CORS
    CORS(app)

    # Rate Limiter с памятью (без Redis)
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"  # Используем память вместо Redis
    )

    # Регистрация blueprint'ов
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(actions_bp, url_prefix='/api')
    app.register_blueprint(clans_bp, url_prefix='/api/clan')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Главная страница
    @app.route('/')
    def index():
        return render_template('index.html')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
