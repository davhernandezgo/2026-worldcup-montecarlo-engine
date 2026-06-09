import json
import random

# 1. 12 Grupos Oficiales
groups_data = {
    "A": ["México", "Sudáfrica", "República de Corea", "República Checa"],
    "B": ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
    "C": ["Brasil", "Marruecos", "Haití", "Escocia"],
    "D": ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
    "E": ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
    "F": ["Países Bajos", "Japón", "Suecia", "Túnez"],
    "G": ["Bélgica", "Egipto", "RI de Irán", "Nueva Zelanda"],
    "H": ["España", "Cabo Verde", "Arabia Saudí", "Uruguay"],
    "I": ["Francia", "Senegal", "Irak", "Noruega"],
    "J": ["Argentina", "Argelia", "Austria", "Jordania"],
    "K": ["Portugal", "RD de Congo", "Uzbekistán", "Colombia"],
    "L": ["Inglaterra", "Croacia", "Ghana", "Panamá"]
}

# 2. Plantillas Obligatorias (Exactas hasta 26 jugadores)
mandatory_rosters = {
    "Argentina": [
        ("E. Martínez", "active", 94), ("Rulli", "active", 85), ("Musso", "active", 84),
        ("Molina", "active", 86), ("Montiel", "active", 83), ("Romero", "active", 89),
        ("Otamendi", "active", 85), ("Li. Martínez", "active", 88), ("Tagliafico", "active", 84),
        ("Acuña", "active", 85), ("L. Balerdi", "injured", 83), ("De Paul", "active", 88),
        ("Mac Allister", "active", 89), ("E. Fernández", "active", 87), ("Lo Celso", "active", 85),
        ("Paredes", "active", 84), ("Palacios", "active", 86), ("Messi", "active", 95),
        ("Garnacho", "active", 85), ("J. Álvarez", "active", 90), ("L. Martínez", "active", 89),
        ("N. González", "active", 85), ("Dybala", "active", 87), ("Carboni", "active", 80),
        ("Pezzella", "active", 83), ("Armani", "active", 81)
    ],
    "Brasil": [
        ("Alisson", "active", 92), ("Ederson", "active", 90), ("Bento", "active", 82),
        ("Danilo", "active", 84), ("Marquinhos", "active", 89), ("G. Magalhães", "active", 88),
        ("Beraldo", "active", 84), ("Arana", "active", 83), ("Couto", "active", 85),
        ("Militão", "active", 88), ("Guimarães", "active", 89), ("Paquetá", "active", 86),
        ("J. Gomes", "active", 84), ("D. Luiz", "active", 85), ("Vinícius Jr", "active", 96),
        ("Rodrygo", "injured", 90), ("Endrick", "active", 84), ("Raphinha", "active", 88),
        ("Martinelli", "active", 87), ("Savinho", "active", 85), ("Neymar", "injured", 91),
        ("Bremer", "active", 86), ("Gomes", "active", 82), ("Wendell", "active", 81),
        ("Evanilson", "active", 84), ("Pepê", "active", 83)
    ],
    "Francia": [
        ("Maignan", "active", 90), ("Areola", "active", 83), ("Samba", "active", 84),
        ("Koundé", "active", 88), ("Upamecano", "active", 86), ("W. Saliba", "injured", 89),
        ("Konaté", "active", 86), ("T. Hernández", "active", 88), ("Mendy", "active", 84),
        ("Pavard", "active", 85), ("Kanté", "active", 87), ("Tchouaméni", "active", 88),
        ("Rabiot", "active", 86), ("Camavinga", "active", 87), ("Zaire-Emery", "active", 84),
        ("Fofana", "active", 84), ("Mbappé", "active", 97), ("Griezmann", "active", 89),
        ("Dembélé", "active", 86), ("Thuram", "active", 85), ("Kolo Muani", "active", 84),
        ("Barcola", "active", 85), ("Coman", "active", 86), ("Giroud", "active", 83),
        ("Clauss", "active", 83), ("Ugochukwu", "active", 80)
    ],
    "Inglaterra": [
        ("Pickford", "active", 86), ("Ramsdale", "active", 84), ("Henderson", "active", 82),
        ("Walker", "active", 88), ("Stones", "active", 87), ("Guehi", "active", 84),
        ("Konsa", "active", 83), ("Trippier", "active", 85), ("Alexander-Arnold", "active", 87),
        ("Shaw", "active", 84), ("Rice", "active", 89), ("Bellingham", "active", 95),
        ("Foden", "active", 91), ("Gallagher", "active", 84), ("Mainoo", "active", 85),
        ("Palmer", "active", 88), ("Saka", "active", 90), ("Kane", "active", 93),
        ("Watkins", "active", 86), ("Toney", "active", 85), ("Gordon", "active", 85),
        ("Eze", "active", 84), ("Bowen", "active", 84), ("Dunk", "active", 82),
        ("Gomez", "active", 83), ("Pope", "active", 83)
    ],
    "México": [
        ("Malagón", "active", 81), ("Rangel", "active", 78), ("J. González", "active", 77),
        ("Montes", "active", 82), ("Vásquez", "active", 81), ("Sánchez", "active", 80),
        ("Arteaga", "active", 79), ("Reyes", "active", 78), ("Romo", "active", 80),
        ("E. Álvarez", "active", 84), ("Chávez", "active", 82), ("Pineda", "active", 80),
        ("Ruiz", "active", 78), ("Giménez", "active", 85), ("Quiñones", "active", 82),
        ("Antuna", "active", 81), ("Vega", "active", 80), ("Huerta", "active", 79),
        ("Alvarado", "active", 80), ("P. Martínez", "active", 79), ("Cortizo", "active", 78),
        ("R. Jiménez", "active", 81), ("Lozano", "active", 83), ("Ochoa", "active", 79),
        ("Gallardo", "active", 79), ("Herrera", "active", 77)
    ]
}

# 3. Base Stats para algunas otras selecciones
base_teams_stats = {
    "España": {"elo": 2080, "opta": 91.5, "confed": "UEFA"},
    "Portugal": {"elo": 2050, "opta": 90.0, "confed": "UEFA"},
    "Países Bajos": {"elo": 2020, "opta": 88.5, "confed": "UEFA"},
    "Alemania": {"elo": 2030, "opta": 89.0, "confed": "UEFA"},
    "Bélgica": {"elo": 2010, "opta": 87.0, "confed": "UEFA"},
    "Colombia": {"elo": 1980, "opta": 86.5, "confed": "CONMEBOL"},
    "Uruguay": {"elo": 2000, "opta": 87.5, "confed": "CONMEBOL"},
    "Estados Unidos": {"elo": 1920, "opta": 83.5, "confed": "CONCACAF"},
    "Ecuador": {"elo": 1890, "opta": 81.0, "confed": "CONMEBOL"},
    "Marruecos": {"elo": 1950, "opta": 85.0, "confed": "CAF"},
    "Japón": {"elo": 1930, "opta": 84.0, "confed": "AFC"},
    "Croacia": {"elo": 1960, "opta": 86.0, "confed": "UEFA"},
    "Senegal": {"elo": 1880, "opta": 80.5, "confed": "CAF"},
    "Suiza": {"elo": 1920, "opta": 83.0, "confed": "UEFA"},
}

def get_confed_and_stats(team_name):
    if team_name in base_teams_stats:
        return base_teams_stats[team_name]
    
    # Generic assignments based on common names
    if team_name in ["Canadá", "Haití", "Paraguay", "Curazao", "Panamá", "Venezuela"]:
        confed = "CONCACAF" if team_name in ["Canadá", "Haití", "Curazao", "Panamá"] else "CONMEBOL"
        return {"elo": random.randint(1700, 1850), "opta": random.uniform(74.0, 80.0), "confed": confed}
    if team_name in ["República de Corea", "Catar", "Australia", "RI de Irán", "Arabia Saudí", "Uzbekistán", "Irak", "Jordania"]:
        return {"elo": random.randint(1650, 1800), "opta": random.uniform(70.0, 78.0), "confed": "AFC"}
    if team_name in ["Túnez", "Sudáfrica", "Costa de Marfil", "Egipto", "Cabo Verde", "Argelia", "RD de Congo", "Ghana"]:
        return {"elo": random.randint(1650, 1850), "opta": random.uniform(72.0, 80.0), "confed": "CAF"}
    if team_name == "Nueva Zelanda":
        return {"elo": 1600, "opta": 68.0, "confed": "OFC"}
    
    # Defaults to UEFA for others (Suecia, Austria, Noruega, etc)
    return {"elo": random.randint(1750, 1900), "opta": random.uniform(75.0, 85.0), "confed": "UEFA"}

teams = []
tournament_groups = []

for group_letter, team_names in groups_data.items():
    tournament_groups.append({
        "group": group_letter,
        "teams": team_names
    })
    
    for team_name in team_names:
        stats = get_confed_and_stats(team_name)
        
        roster = []
        if team_name in mandatory_rosters:
            for p in mandatory_rosters[team_name]:
                roster.append({
                    "name": p[0],
                    "status": p[1],
                    "quality": p[2]
                })
        else:
            # Generate 26 real-sounding placeholder players
            for i in range(26):
                q = random.gauss(stats["opta"], 4)
                status = "active" if random.random() > 0.05 else "injured"
                roster.append({
                    "name": f"{team_name} Player {i+1}",
                    "quality": round(q, 1),
                    "status": status
                })
                
        # Acclimation
        acclimated = True if stats["confed"] in ["CONCACAF", "CONMEBOL"] else False

        teams.append({
            "id": team_name[:3].upper().replace(" ", ""),
            "name": team_name,
            "confederation": stats["confed"],
            "baseElo": stats["elo"],
            "optaRating": round(stats["opta"], 1),
            "socioScore": round(random.uniform(5.0, 8.5), 1),
            "isAcclimated": acclimated,
            "playStyle": random.choice(["high_press", "possession", "low_block"]),
            "roster": roster
        })

with open("backend/data/teams_data.json", "w", encoding="utf-8") as f:
    json.dump(teams, f, indent=2, ensure_ascii=False)

with open("backend/data/tournament_structure.json", "w", encoding="utf-8") as f:
    json.dump(tournament_groups, f, indent=2, ensure_ascii=False)

print(f"Generadas {len(teams)} plantillas completas con 26 jugadores.")
