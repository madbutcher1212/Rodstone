import time
import threading
from models.timer import Timer
from models.player import Player
from socket_manager import notify_upgrade_complete
import json

def check_timers_background():
    """Фоновая проверка таймеров каждую секунду"""
    while True:
        try:
            # Получаем все активные таймеры из БД
            supabase = Player.get_supabase()
            now = int(time.time() * 1000)
            
            # Ищем завершённые таймеры
            result = supabase.table("timers") \
                .select("*") \
                .lt("end_time", now) \
                .execute()
            
            for timer in result.data:
                # Завершаем таймер
                timer_data = Timer.complete(timer['id'])
                if timer_data and timer_data['timer_type'] == 'building':
                    data = json.loads(timer_data['data'])
                    building_id = data['building_id']
                    target_level = data['target_level']
                    
                    # Получаем telegram_id игрока
                    player = supabase.table("players") \
                        .select("telegram_id") \
                        .eq("id", timer['player_id']) \
                        .execute()
                    
                    if player.data:
                        telegram_id = player.data[0]['telegram_id']
                        
                        if building_id == 'townhall':
                            Player.update(timer['player_id'], town_hall_level=target_level)
                        else:
                            # Обновляем уровень здания
                            player_data = Player.find_by_telegram_id(telegram_id)
                            buildings = json.loads(player_data['buildings'])
                            for b in buildings:
                                if b['id'] == building_id:
                                    b['level'] = target_level
                                    break
                            Player.update(timer['player_id'], buildings=json.dumps(buildings))
                        
                        # Отправляем уведомление через WebSocket
                        notify_upgrade_complete(telegram_id, building_id, target_level)
                        print(f"✅ Фоновый таймер: {building_id} -> {target_level}")
            
            time.sleep(1)  # Проверяем каждую секунду
            
        except Exception as e:
            print(f"❌ Ошибка в фоновом таймере: {e}")
            time.sleep(1)

# Запускаем в отдельном потоке
def start_timer_checker():
    thread = threading.Thread(target=check_timers_background, daemon=True)
    thread.start()
    print("🚀 Фоновый проверщик таймеров запущен")
