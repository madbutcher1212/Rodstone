from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Импорт blueprint'ов
from blueprints.auth import auth_bp
from blueprints.actions import actions_bp
from blueprints.clans import clans_bp
from blueprints.admin import admin_bp

def create_app():
    app = Flask(__name__)

    # Конфигурация (позже можно вынести в .env)
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    app.config['SUPABASE_URL'] = 'https://xevwktdwyioyantuqntb.supabase.co'
    app.config['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldndrdGR3eWlveWFudHVxbnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODI2NTAsImV4cCI6MjA4NzQ1ODY1MH0.jC8jqGBv_yrbYg_x4XQradxxbkDtsXsQ9EBT0Iabed4'
    app.config['BOT_TOKEN'] = '8596066162:AAEm2DSAFhKemedKC8rT4RfFY4fjUhVBCvI'

    # CORS
    CORS(app)

    # Rate Limiter
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )

    # Регистрация blueprint'ов
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(actions_bp, url_prefix='/api')
    app.register_blueprint(clans_bp, url_prefix='/api/clan')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/')
    def index():
        return jsonify({"message": "Rodstone API is running", "status": "ok"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
