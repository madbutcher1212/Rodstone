# Конфигурация зданий (такая же, как в старом проекте)
BUILDINGS_CONFIG = {
    "house": {
        "name": "Жилой район", "icon": "🏘️", "section": "social", "max_level": 5,
        "base_cost": {"gold": 50, "wood": 20, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 50},
            {"gold": 250, "wood": 300, "stone": 125},
            {"gold": 1500, "wood": 1000, "stone": 400},
            {"gold": 7200, "wood": 5300, "stone": 2450}
        ],
        "population_bonus": [20, 20, 40, 100, 250]
    },
    "tavern": {
        "name": "Корчма", "icon": "🍺", "section": "social", "max_level": 5,
        "base_cost": {"gold": 100, "wood": 100, "stone": 25},
        "upgrade_costs": [
            {"gold": 250, "wood": 250, "stone": 100},
            {"gold": 900, "wood": 900, "stone": 400},
            {"gold": 1800, "wood": 1800, "stone": 800},
            {"gold": 8000, "wood": 4000, "stone": 2500}
        ],
        "income": [
            {"gold": 3, "food": -3, "populationGrowth": 1},
            {"gold": 6, "food": -5, "populationGrowth": 2},
            {"gold": 15, "food": -12, "populationGrowth": 3},
            {"gold": 30, "food": -22, "populationGrowth": 4},
            {"gold": 70, "food": -50, "populationGrowth": 5}
        ],
        "requiredTownHall": [2, 3, 4, 5, 5]
    },
    "bath": {
        "name": "Купели", "icon": "💧", "section": "social", "max_level": 5,
        "base_cost": {"gold": 100, "wood": 100, "stone": 25},
        "upgrade_costs": [
            {"gold": 250, "wood": 250, "stone": 100},
            {"gold": 900, "wood": 900, "stone": 400},
            {"gold": 1800, "wood": 1800, "stone": 800},
            {"gold": 8000, "wood": 4000, "stone": 2500}
        ],
        "income": [
            {"gold": 2, "populationGrowth": 1},
            {"gold": 4, "populationGrowth": 2},
            {"gold": 10, "populationGrowth": 2},
            {"gold": 20, "populationGrowth": 3},
            {"gold": 50, "populationGrowth": 3}
        ],
        "requiredTownHall": [3, 4, 4, 5, 5]
    },
    "farm": {
        "name": "Ферма", "icon": "🌾", "section": "economic", "max_level": 5,
        "base_cost": {"gold": 30, "wood": 40, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 0},
            {"gold": 250, "wood": 300, "stone": 0},
            {"gold": 1000, "wood": 1000, "stone": 150},
            {"gold": 5200, "wood": 6300, "stone": 2450}
        ],
        "income": [
            {"food": 10}, {"food": 25}, {"food": 60}, {"food": 120}, {"food": 260}
        ]
    },
    "lumber": {
        "name": "Лесопилка", "icon": "🪵", "section": "economic", "max_level": 5,
        "base_cost": {"gold": 40, "wood": 30, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 0},
            {"gold": 350, "wood": 200, "stone": 50},
            {"gold": 1300, "wood": 900, "stone": 550},
            {"gold": 7000, "wood": 4500, "stone": 3500}
        ],
        "income": [
            {"wood": 10}, {"wood": 20}, {"wood": 40}, {"wood": 100}, {"wood": 200}
        ]
    },
    "quarry": {
        "name": "Каменоломня", "icon": "⛰️", "section": "economic", "max_level": 5,
        "base_cost": {"gold": 20, "wood": 80, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 150, "stone": 0},
            {"gold": 250, "wood": 350, "stone": 100},
            {"gold": 1000, "wood": 1700, "stone": 150},
            {"gold": 6200, "wood": 7300, "stone": 1450}
        ],
        "income": [
            {"stone": 5}, {"stone": 15}, {"stone": 35}, {"stone": 80}, {"stone": 160}
        ]
    }
}

def calculate_building_upgrade_cost(building_id, current_level):
    config = BUILDINGS_CONFIG.get(building_id)
    if not config or current_level >= config["max_level"]:
        return {"gold": 0, "wood": 0, "stone": 0}
    return config["upgrade_costs"][current_level - 1]

def calculate_population_max(buildings):
    max_pop = 10
    for b in buildings:
        if b["id"] == "house":
            config = BUILDINGS_CONFIG["house"]
            for i in range(b["level"]):
                max_pop += config["population_bonus"][i]
            break
    return max_pop

def calculate_hourly_income_and_growth(buildings, town_hall_level, current_pop, max_pop, current_food):
    from .player import get_supabase  # избегаем циклических импортов
    # (копируем функцию из старого app.py)
    # ... (позже можно вынести в отдельную функцию, но пока оставим)
    # Я перенесу её позже, чтобы не перегружать сообщение
