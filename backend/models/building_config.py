# Конфигурация всех зданий в игре
BUILDINGS_CONFIG = {
    "house": {
        "name": "Жилой район",
        "icon": "🏘️",
        "section": "social",
        "max_level": 5,
        "base_cost": {"gold": 50, "wood": 20, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 50},
            {"gold": 250, "wood": 300, "stone": 125},
            {"gold": 1500, "wood": 1000, "stone": 400},
            {"gold": 7200, "wood": 5300, "stone": 2450}
        ],
        "population_bonus": [20, 20, 40, 100, 250],
        "income": [{}, {}, {}, {}, {}]  # Нет дохода, только лимит
    },
    "tavern": {
        "name": "Корчма",
        "icon": "🍺",
        "section": "social",
        "max_level": 5,
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
        "name": "Купели",
        "icon": "💧",
        "section": "social",
        "max_level": 5,
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
        "name": "Ферма",
        "icon": "🌾",
        "section": "economic",
        "max_level": 5,
        "base_cost": {"gold": 30, "wood": 40, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 0},
            {"gold": 250, "wood": 300, "stone": 0},
            {"gold": 1000, "wood": 1000, "stone": 150},
            {"gold": 5200, "wood": 6300, "stone": 2450}
        ],
        "income": [
            {"food": 10},
            {"food": 25},
            {"food": 60},
            {"food": 120},
            {"food": 260}
        ]
    },
    "lumber": {
        "name": "Лесопилка",
        "icon": "🪵",
        "section": "economic",
        "max_level": 5,
        "base_cost": {"gold": 40, "wood": 30, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 100, "stone": 0},
            {"gold": 350, "wood": 200, "stone": 50},
            {"gold": 1300, "wood": 900, "stone": 550},
            {"gold": 7000, "wood": 4500, "stone": 3500}
        ],
        "income": [
            {"wood": 10},
            {"wood": 20},
            {"wood": 40},
            {"wood": 100},
            {"wood": 200}
        ]
    },
    "quarry": {
        "name": "Каменоломня",
        "icon": "⛰️",
        "section": "economic",
        "max_level": 5,
        "base_cost": {"gold": 20, "wood": 80, "stone": 0},
        "upgrade_costs": [
            {"gold": 50, "wood": 150, "stone": 0},
            {"gold": 250, "wood": 350, "stone": 100},
            {"gold": 1000, "wood": 1700, "stone": 150},
            {"gold": 6200, "wood": 7300, "stone": 1450}
        ],
        "income": [
            {"stone": 5},
            {"stone": 15},
            {"stone": 35},
            {"stone": 80},
            {"stone": 160}
        ]
    }
}

def calculate_building_upgrade_cost(building_id, current_level):
    """
    Возвращает стоимость улучшения здания на следующем уровне.
    """
    config = BUILDINGS_CONFIG.get(building_id)
    if not config or current_level >= config["max_level"]:
        return {"gold": 0, "wood": 0, "stone": 0}
    return config["upgrade_costs"][current_level - 1]

def calculate_population_max(buildings):
    """
    Рассчитывает максимальное население на основе построек.
    База 10 + бонусы от жилых районов.
    """
    max_pop = 10
    for b in buildings:
        if b["id"] == "house":
            config = BUILDINGS_CONFIG["house"]
            for i in range(b["level"]):
                max_pop += config["population_bonus"][i]
            break
    return max_pop

def calculate_hourly_income_and_growth(buildings, town_hall_level, current_population, max_population, current_food):
    """
    Рассчитывает доход в час и рост населения.
    Возвращает (income, population_growth)
    """
    # Базовый доход от ратуши
    TOWN_HALL_INCOME = {1:5, 2:10, 3:20, 4:45, 5:100}
    income = {
        "gold": TOWN_HALL_INCOME.get(town_hall_level, 0),
        "wood": 0,
        "food": 0,
        "stone": 0
    }

    # Доход от построек
    for b in buildings:
        config = BUILDINGS_CONFIG.get(b["id"])
        if not config or b["level"] == 0 or not config.get("income"):
            continue
        inc = config["income"][b["level"] - 1]
        for resource, value in inc.items():
            if resource in income:
                income[resource] += value

    food_prod = income["food"]
    food_needed = current_population
    food_left = food_prod - food_needed
    pop_growth = 0

    if food_left >= 0:
        # Еды хватает - население растет
        income["food"] = food_left
        potential = 3
        if current_population + potential <= max_population:
            pop_growth = potential
        else:
            pop_growth = max_population - current_population
    else:
        # Еды не хватает - используем запасы
        total_food = current_food + food_prod
        if total_food >= food_needed:
            income["food"] = total_food - food_needed
        else:
            income["food"] = 0

    return income, pop_growth
