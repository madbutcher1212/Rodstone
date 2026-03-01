import json
import time
from models.player import get_supabase

class Timer:
    @staticmethod
    def create(player_id, timer_type, target_id, duration_seconds, data=None):
        """Создать новый таймер"""
        supabase = get_supabase()
        now = int(time.time() * 1000)
        end = now + (duration_seconds * 1000)
        
        timer_data = {
            'player_id': player_id,
            'timer_type': timer_type,
            'target_id': target_id,
            'start_time': now,
            'end_time': end,
            'data': json.dumps(data or {})
        }
        
        result = supabase.table("timers").insert(timer_data).execute()
        return result.data[0] if result.data else None
    
    @staticmethod
    def get_active(player_id, timer_type=None):
        """
        Получить активные и только что завершённые таймеры игрока.
        Возвращает таймеры, которые ещё не завершились или завершились не более 2 секунд назад.
        Это даёт время на обработку завершившегося таймера.
        """
        supabase = get_supabase()
        now = int(time.time() * 1000)
        
        # Берём таймеры с запасом 2 секунды
        query = supabase.table("timers") \
            .select("*") \
            .eq("player_id", player_id) \
            .gt("end_time", now - 2000)
        
        if timer_type:
            query = query.eq("timer_type", timer_type)
        
        result = query.execute()
        return result.data if result.data else []
    
    @staticmethod
    def complete(timer_id):
        """Завершить таймер (удалить или пометить)"""
        supabase = get_supabase()
        # Получаем данные таймера перед удалением
        result = supabase.table("timers") \
            .select("*") \
            .eq("id", timer_id) \
            .execute()
        
        if not result.data:
            return None
        
        # Удаляем таймер
        supabase.table("timers") \
            .delete() \
            .eq("id", timer_id) \
            .execute()
        
        return result.data[0]
    
    @staticmethod
    def cleanup_expired():
        """Очистить истекшие таймеры (можно вызвать по расписанию)"""
        supabase = get_supabase()
        now = int(time.time() * 1000)
        
        result = supabase.table("timers") \
            .delete() \
            .lt("end_time", now - 5000) \  # удаляем только те, что завершились больше 5 секунд назад
            .execute()
        
        return len(result.data) if result.data else 0
