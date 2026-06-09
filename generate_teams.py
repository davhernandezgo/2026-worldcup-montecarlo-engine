import json
import random

# Definición de 48 Equipos y Grupos Reales/Proyectados (Mundial 2026)
groups_data = {
    "A": ["México", "República de Corea", "Túnez", "Sudáfrica"],
    "B": ["Canadá", "Suiza", "Catar", "Bosnia y Herzegovina"],
    "C": ["Brasil", "Marruecos", "Escocia", "Haití"],
    "D": ["Estados Unidos", "Turquía", "Paraguay", "Australia"],
    "E": ["Alemania", "Ecuador", "Costa de Marfil", "Curazao"],
    "F": ["Países Bajos", "Japón", "Suecia", "Omán"],
    "G": ["Bélgica", "Egipto", "Irán", "Venezuela"],
    "H": ["España", "Arabia Saudita", "Cabo Verde", "Nueva Zelanda"],
    "I": ["Argentina", "Croacia", "Mali", "Uzbekistán"],
    "J": ["Francia", "Colombia", "Gales", "Irak"],
    "K": ["Inglaterra", "Uruguay", "Nigeria", "Emiratos Árabes Unidos"],
    "L": ["Portugal", "Senegal", "Polonia", "Panamá"]
}

# Configuraciones de confederación, Elo base y calidad promedio por equipo (aproximados)
team_configs = {
    "Argentina": {"confed": "CONMEBOL", "elo": 2150, "opta": 94.0, "socio": 7.5, "acclimated": True},
    "Francia": {"confed": "UEFA", "elo": 2120, "opta": 93.0, "socio": 9.0, "acclimated": False},
    "España": {"confed": "UEFA", "elo": 2080, "opta": 91.5, "socio": 8.5, "acclimated": False},
    "Inglaterra": {"confed": "UEFA", "elo": 2070, "opta": 91.0, "socio": 9.5, "acclimated": False},
    "Brasil": {"confed": "CONMEBOL", "elo": 2110, "opta": 92.5, "socio": 7.0, "acclimated": True},
    "Portugal": {"confed": "UEFA", "elo": 2050, "opta": 90.0, "socio": 8.5, "acclimated": False},
    "Países Bajos": {"confed": "UEFA", "elo": 2020, "opta": 88.5, "socio": 9.5, "acclimated": False},
    "Alemania": {"confed": "UEFA", "elo": 2030, "opta": 89.0, "socio": 9.5, "acclimated": False},
    "Bélgica": {"confed": "UEFA", "elo": 2010, "opta": 87.0, "socio": 9.0, "acclimated": False},
    "Colombia": {"confed": "CONMEBOL", "elo": 1980, "opta": 86.5, "socio": 6.5, "acclimated": True},
    "Uruguay": {"confed": "CONMEBOL", "elo": 2000, "opta": 87.5, "socio": 7.0, "acclimated": True},
    "México": {"confed": "CONCACAF", "elo": 1900, "opta": 82.0, "socio": 7.0, "acclimated": True},
    "Estados Unidos": {"confed": "CONCACAF", "elo": 1920, "opta": 83.5, "socio": 9.8, "acclimated": True},
    "Ecuador": {"confed": "CONMEBOL", "elo": 1890, "opta": 81.0, "socio": 6.0, "acclimated": True},
    "Marruecos": {"confed": "CAF", "elo": 1950, "opta": 85.0, "socio": 6.0, "acclimated": False},
    "Japón": {"confed": "AFC", "elo": 1930, "opta": 84.0, "socio": 8.5, "acclimated": False},
    "Croacia": {"confed": "UEFA", "elo": 1960, "opta": 86.0, "socio": 8.0, "acclimated": False},
    "Senegal": {"confed": "CAF", "elo": 1880, "opta": 80.5, "socio": 5.5, "acclimated": False},
    "Suiza": {"confed": "UEFA", "elo": 1920, "opta": 83.0, "socio": 9.5, "acclimated": False},
}

# Estrellas de algunos equipos principales
stars = {
    "Argentina": ["Lionel Messi", "Emiliano Martínez", "Julián Álvarez", "Enzo Fernández", "Alexis Mac Allister"],
    "Francia": ["Kylian Mbappé", "Antoine Griezmann", "Aurélien Tchouaméni", "William Saliba", "Mike Maignan"],
    "España": ["Rodri", "Lamine Yamal", "Pedri", "Nico Williams", "Unai Simón"],
    "Inglaterra": ["Jude Bellingham", "Harry Kane", "Phil Foden", "Declan Rice", "Bukayo Saka"],
    "Brasil": ["Vinícius Jr.", "Rodrygo", "Alisson", "Bruno Guimarães", "Éder Militão"],
    "Portugal": ["Cristiano Ronaldo", "Bruno Fernandes", "Bernardo Silva", "Rúben Dias", "Rafael Leão"],
    "Colombia": ["Luis Díaz", "James Rodríguez", "Jhon Arias", "Daniel Muñoz", "Camilo Vargas"],
    "Uruguay": ["Federico Valverde", "Darwin Núñez", "Ronald Araújo", "Manuel Ugarte", "Sergio Rochet"],
    "México": ["Santiago Giménez", "Edson Álvarez", "Luis Chávez", "Johan Vásquez", "Guillermo Ochoa"],
    "Estados Unidos": ["Christian Pulisic", "Weston McKennie", "Tyler Adams", "Folarin Balogun", "Matt Turner"]
}

def get_config(name):
    if name in team_configs:
        return team_configs[name]
    
    # Defaults genéricos según región esperada
    confed = "UEFA"
    elo = random.randint(1600, 1850)
    opta = random.uniform(70.0, 80.0)
    acclimated = False
    
    if name in ["Canadá", "Haití", "Paraguay", "Curazao", "Panamá", "Venezuela"]:
        confed = "CONCACAF" if name in ["Canadá", "Haití", "Curazao", "Panamá"] else "CONMEBOL"
        elo = random.randint(1700, 1850)
        opta = random.uniform(74.0, 80.0)
        acclimated = True
    elif name in ["República de Corea", "Catar", "Australia", "Irán", "Arabia Saudita", "Omán", "Uzbekistán", "Irak", "Emiratos Árabes Unidos"]:
        confed = "AFC"
        elo = random.randint(1650, 1800)
        acclimated = False
    elif name in ["Túnez", "Sudáfrica", "Costa de Marfil", "Egipto", "Cabo Verde", "Mali", "Nigeria"]:
        confed = "CAF"
        elo = random.randint(1650, 1850)
        acclimated = False
    elif name == "Nueva Zelanda":
        confed = "OFC"
        elo = 1600
        acclimated = False
    else:
        confed = "UEFA"
        elo = random.randint(1750, 1900)
        
    return {"confed": confed, "elo": elo, "opta": opta, "socio": random.uniform(5.0, 8.5), "acclimated": acclimated}

teams = []
tournament_groups = []

for group_letter, team_names in groups_data.items():
    tournament_groups.append({
        "group": group_letter,
        "teams": team_names
    })
    
    for team_name in team_names:
        cfg = get_config(team_name)
        
        roster = []
        # Añadir estrellas si las hay
        if team_name in stars:
            for s in stars[team_name]:
                roster.append({"name": s, "quality": random.uniform(88, 96), "status": "active" if random.random() > 0.1 else "injured"})
        
        # Rellenar hasta 26 jugadores
        avg_qual = cfg["opta"]
        for i in range(len(roster), 26):
            q = random.gauss(avg_qual, 4)
            status = "active" if random.random() > 0.05 else "injured"
            roster.append({"name": f"Jugador {i+1} de {team_name}", "quality": round(q, 1), "status": status})
            
        teams.append({
            "id": team_name[:3].upper().replace(" ", ""),
            "name": team_name,
            "confederation": cfg["confed"],
            "baseElo": cfg["elo"],
            "optaRating": round(cfg["opta"], 1),
            "socioScore": round(cfg["socio"], 1),
            "isAcclimated": cfg["acclimated"],
            "playStyle": random.choice(["high_press", "possession", "low_block"]),
            "roster": roster
        })

# Guardar archivos JSON
with open("backend/data/teams_data.json", "w", encoding="utf-8") as f:
    json.dump(teams, f, indent=2, ensure_ascii=False)

with open("backend/data/tournament_structure.json", "w", encoding="utf-8") as f:
    json.dump(tournament_groups, f, indent=2, ensure_ascii=False)

print("Datos generados exitosamente.")
