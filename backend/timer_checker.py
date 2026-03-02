import time
import threading
import json
from models.player import Player, get_supabase
from models.timer import Timer
from socket_manager import notify_upgrade_complete

def check_timers_background():
    """Фоновая проверка таймеров каждую секунду"""
    while True:
        try:
            # Получаем всех игроков с активными таймерами
            supabase = get_supabase()  # ← используем функцию, а не метод класса
            
            now = int(time.time() * 1000)
            
            # Ищем завершённые таймеры
            result = supabase.table("timers") \
                .select("*") \
                .lt("end_time", now) \
                .execute()
            
            if result.data:
                print(f"⏰ Найдено завершённых таймеров: {len(result.data)}")
            
            for timer in result.data:
                try:
                    # Завершаем таймер
                    timer_data = Timer.complete(timer['id'])
                    if timer_data and timer_data['timer_type'] == 'building':
                        data = json.loads(timer_data['data'])
                        building_id = data['building_id']
                        target_level = data['target_level']
                        
                        # Получаем telegram_id игрока
                        player_result = supabase.table("players") \
                            .select("telegram_id") \
                            .eq("id", timer['player_id']) \
                            .execute()
                        
                        if player_result.data:
                            telegram_id = player_result.data[0]['telegram_id']
                            print(f"🔔 Обработка таймера для игрока {telegram_id}: {building_id} -> {target_level}")
                            
                            if building_id == 'townhall':
                                Player.update(timer['player_id'], town_hall_level=target_level)
                                print(f"🏛️ Ратуша улучшена до {target_level}")
                            else:
                                # Обновляем уровень здания
                                player_data = Player.find_by_telegram_id(telegram_id)
                                if player_data and player_data.get('buildings'):
                                    buildings = json.loads(player_data['buildings'])
                                    for b in buildings:
                                        if b['id'] == building_id:
                                            b['level'] = target_level
                                            break
                                    Player.update(timer['player_id'], buildings=json.dumps(buildings))
                                    print(f"✅ {building_id} улучшено до {target_level}")
                            
                            # Отправляем уведомление через WebSocket
                            notify_upgrade_complete(telegram_id, building_id, target_level)
                            print(f"📨 Уведомление отправлено")
                
                except Exception as e:
                    print(f"❌ Ошибка при обработке таймера {timer.get('id')}: {e}")
            
            time.sleep(1)  # Проверяем каждую секунду
            
        except Exception as e:
            print(f"❌ Ошибка в фоновом таймере: {e}")
            time.sleep(1)

# Запускаем в отдельном потоке
def start_timer_checker():
    thread = threading.Thread(target=check_timers_background, daemon=True)
    thread.start()
    print("🚀 Фоновый проверщик таймеров запущен")
