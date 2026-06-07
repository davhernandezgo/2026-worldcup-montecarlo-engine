import json
import random

# Existing 6 teams
teams = [
  {
    "id": "ESP", "name": "España", "confederation": "UEFA", "baseElo": 2050, "optaRating": 90.5, "socioScore": 8.5, "isAcclimated": False, "playStyle": "possession",
    "roster": [
      { "name": "Rodri", "quality": 95, "status": "injured" }, { "name": "Lamine Yamal", "quality": 92, "status": "active" },
      { "name": "Gavi", "quality": 88, "status": "injured" }, { "name": "Pedri", "quality": 89, "status": "active" },
      { "name": "Álvaro Morata", "quality": 85, "status": "active" }, { "name": "Aymeric Laporte", "quality": 86, "status": "active" },
      { "name": "Unai Simón", "quality": 87, "status": "active" }
    ]
  },
  {
    "id": "BRA", "name": "Brasil", "confederation": "CONMEBOL", "baseElo": 2140, "optaRating": 93.5, "socioScore": 7.5, "isAcclimated": False, "playStyle": "high_press",
    "roster": [
      { "name": "Vinícius Jr.", "quality": 94, "status": "active" }, { "name": "Rodrygo", "quality": 89, "status": "injured" },
      { "name": "Neymar Jr.", "quality": 90, "status": "injured" }, { "name": "Alisson", "quality": 90, "status": "active" },
      { "name": "Marquinhos", "quality": 88, "status": "active" }, { "name": "Bruno Guimarães", "quality": 87, "status": "active" },
      { "name": "Raphinha", "quality": 89, "status": "active" }
    ]
  },
  {
    "id": "FRA", "name": "Francia", "confederation": "UEFA", "baseElo": 2100, "optaRating": 92.0, "socioScore": 9.0, "isAcclimated": False, "playStyle": "high_press",
    "roster": [
      { "name": "Kylian Mbappé", "quality": 96, "status": "active" }, { "name": "Antoine Griezmann", "quality": 90, "status": "active" },
      { "name": "William Saliba", "quality": 88, "status": "injured" }, { "name": "Mike Maignan", "quality": 89, "status": "active" },
      { "name": "Aurélien Tchouaméni", "quality": 87, "status": "active" }, { "name": "Ousmane Dembélé", "quality": 86, "status": "active" },
      { "name": "Theo Hernández", "quality": 87, "status": "active" }
    ]
  },
  {
    "id": "ARG", "name": "Argentina", "confederation": "CONMEBOL", "baseElo": 2150, "optaRating": 94.0, "socioScore": 7.0, "isAcclimated": False, "playStyle": "possession",
    "roster": [
      { "name": "Lionel Messi", "quality": 94, "status": "active" }, { "name": "Julián Álvarez", "quality": 89, "status": "active" },
      { "name": "Emiliano Martínez", "quality": 90, "status": "active" }, { "name": "Alexis Mac Allister", "quality": 88, "status": "active" },
      { "name": "Enzo Fernández", "quality": 87, "status": "active" }, { "name": "Cristian Romero", "quality": 88, "status": "injured" },
      { "name": "Rodrigo De Paul", "quality": 86, "status": "active" }
    ]
  },
  {
    "id": "MEX", "name": "México", "confederation": "CONCACAF", "baseElo": 1900, "optaRating": 82.0, "socioScore": 6.5, "isAcclimated": True, "playStyle": "low_block",
    "roster": [
      { "name": "Santiago Giménez", "quality": 84, "status": "active" }, { "name": "Edson Álvarez", "quality": 83, "status": "injured" },
      { "name": "Guillermo Ochoa", "quality": 79, "status": "active" }, { "name": "Hirving Lozano", "quality": 82, "status": "active" },
      { "name": "Johan Vásquez", "quality": 80, "status": "active" }, { "name": "Luis Chávez", "quality": 80, "status": "active" },
      { "name": "César Montes", "quality": 81, "status": "active" }
    ]
  },
  {
    "id": "ENG", "name": "Inglaterra", "confederation": "UEFA", "baseElo": 2080, "optaRating": 91.0, "socioScore": 9.5, "isAcclimated": False, "playStyle": "high_press",
    "roster": [
      { "name": "Harry Kane", "quality": 93, "status": "active" }, { "name": "Jude Bellingham", "quality": 94, "status": "active" },
      { "name": "Phil Foden", "quality": 90, "status": "active" }, { "name": "Declan Rice", "quality": 89, "status": "active" },
      { "name": "Bukayo Saka", "quality": 90, "status": "active" }, { "name": "John Stones", "quality": 87, "status": "injured" },
      { "name": "Luke Shaw", "quality": 84, "status": "injured" }
    ]
  }
]

# Additional 42 teams to make 48
additional_names = [
  "Uruguay", "Colombia", "Ecuador", "Perú", "Chile", "Estados Unidos", "Canadá", "Costa Rica", "Panamá",
  "Marruecos", "Senegal", "Egipto", "Nigeria", "Camerún", "Costa de Marfil", "Túnez", "Argelia", "Mali",
  "Japón", "Corea del Sur", "Irán", "Arabia Saudita", "Australia", "Catar", "Uzbekistán", "Irak",
  "Alemania", "Portugal", "Italia", "Países Bajos", "Croacia", "Bélgica", "Dinamarca", "Suiza", "Serbia", "Polonia", "Ucrania", "Gales", "Suecia", "Austria",
  "Nueva Zelanda", "Turquía"
]

def get_confed(name):
  if name in ["Uruguay", "Colombia", "Ecuador", "Perú", "Chile"]: return "CONMEBOL"
  if name in ["Estados Unidos", "Canadá", "Costa Rica", "Panamá"]: return "CONCACAF"
  if name in ["Marruecos", "Senegal", "Egipto", "Nigeria", "Camerún", "Costa de Marfil", "Túnez", "Argelia", "Mali"]: return "CAF"
  if name in ["Japón", "Corea del Sur", "Irán", "Arabia Saudita", "Australia", "Catar", "Uzbekistán", "Irak"]: return "AFC"
  if name == "Nueva Zelanda": return "OFC"
  return "UEFA"

for name in additional_names:
  confed = get_confed(name)
  base_elo = 1600
  opta_rating = 75.0
  if confed == "UEFA" or confed == "CONMEBOL":
      base_elo = random.randint(1800, 2050)
      opta_rating = random.uniform(80.0, 90.0)
  elif confed == "CAF" or confed == "AFC":
      base_elo = random.randint(1600, 1850)
      opta_rating = random.uniform(70.0, 80.0)
  else:
      base_elo = random.randint(1700, 1900)
      opta_rating = random.uniform(75.0, 85.0)
      
  teams.append({
    "id": name[:3].upper(),
    "name": name,
    "confederation": confed,
    "baseElo": base_elo,
    "optaRating": round(opta_rating, 1),
    "socioScore": round(random.uniform(5.0, 9.0), 1),
    "isAcclimated": confed in ["CONCACAF", "CONMEBOL", "CAF"],
    "playStyle": random.choice(["high_press", "possession", "low_block"]),
    "roster": [
      { "name": f"Jugador 1 {name}", "quality": round(random.uniform(70, 88), 1), "status": "active" },
      { "name": f"Jugador 2 {name}", "quality": round(random.uniform(70, 88), 1), "status": "active" }
    ]
  })

with open("backend/data/teams_data.json", "w") as f:
  json.dump(teams, f, indent=2, ensure_ascii=False)

groups = []
random.shuffle(teams)
for i in range(12):
  group_teams = [t["name"] for t in teams[i*4:(i+1)*4]]
  groups.append({
    "group": chr(65 + i), # A, B, C...
    "teams": group_teams
  })

with open("backend/data/tournament_structure.json", "w") as f:
  json.dump(groups, f, indent=2, ensure_ascii=False)
