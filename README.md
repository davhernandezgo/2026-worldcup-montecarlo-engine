# 2026 World Cup Predictive Engine

![Go Version](https://img.shields.io/badge/Go-1.21-00ADD8?style=flat&logo=go)
![React Version](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![Monte Carlo](https://img.shields.io/badge/Algorithm-Monte_Carlo-FF4F00?style=flat)
![Architecture](https://img.shields.io/badge/Architecture-Concurrent-blueviolet?style=flat)

[🇺🇸 English Version](#-english-version) | [🇪🇸 Versión en Español](#-versión-en-español)

---

## 🇺🇸 English Version

**2026 World Cup Predictive Engine** is a high-performance, data-driven simulation platform designed to forecast the outcomes of the 2026 FIFA World Cup. By leveraging a custom multifactorial statistical model and the concurrent processing power of Go (Golang), the engine can simulate millions of tournament matches in a matter of seconds.

### 🧠 The Statistical Model

Unlike naive predictors that rely solely on static odds, this engine uses a **Multifactorial Weighted Formula** that dynamically computes team strengths based on real-world variables:

1. **Base Elo Rating:** Represents the historical and foundational strength of the national team.
2. **Opta Rating (Current Form):** Reflects short-term tactical performance, recent results, and specific player metrics.
3. **Socio-Economic Score:** Integrates macroeconomic factors (GDP per capita, population, football infrastructure investment) which historically correlate with sustained tournament success (Klement's theory).
4. **Crisis Modifier:** Dynamically calculates squad health by analyzing the active roster vs. injured players, heavily penalizing teams missing crucial talent (e.g., missing Rodri or Neymar).
5. **Environmental Weights:** Adjusts performance based on altitude acclimation, Wet-Bulb Globe Temperature (WBGT) fatigue, and extensive travel distances inherent to the 2026 NA format.

These factors are blended into an *Expected Goals (xG)* variance model.

### ⚡ Concurrency Architecture in Go

A single World Cup tournament consists of 104 matches (Group Stage + Knockout). To determine mathematical certainty, predicting a tournament just once is useless. We must run it thousands of times.

The backend is engineered to handle **extreme concurrency** using Go's `goroutines` and `channels`:

- **Match-Level Concurrency:** A single match is simulated up to 10,000 times. A pool of 10 workers processes these iterations in parallel, using buffered channels to aggregate the resulting expected goals (xG) and probabilities.
- **Tournament Backtesting:** The `/api/backtest` endpoint simulates **100 entire World Cups** (10,400 matches) concurrently. Using a sync pool of 20 goroutines and a thread-safe `sync.Mutex`, the backend crunches millions of mathematical operations in less than **3 seconds**.

This architecture guarantees maximum CPU utilization, transforming what would traditionally be a blocking, minute-long sequential operation in languages like Python or Node.js into a blazing-fast, real-time API.

### 🎲 Reducing Bias: Why Monte Carlo?

In football, the best team doesn't always win. Upsets happen.
A purely deterministic model would predict that the team with the highest Elo rating wins every single time, completely failing to capture the magic and chaos of the sport.

We utilize the **Monte Carlo Method** by injecting a calculated Randomness Weight (`rngA` and `rngB`) into our expected goals function alongside a normal distribution function (`rand.NormFloat64()`). By simulating the same matchup 10,000 times, the randomness smooths out, revealing the true statistical probability spectrum.

The **Backtesting Engine** proves this: when you run 100 simulations of the tournament, you will see a distribution of champions. The heavy favorites might win 30% of the time, but the Monte Carlo engine reveals the mathematical probability of dark horses making a deep run.

### 🛠 Tech Stack
- **Backend:** Go (Golang), Fiber Framework.
- **Frontend:** React, Next.js (Vite environment), Vanilla CSS, Recharts for analytics.
- **Deployment:** Multi-stage Docker build utilizing a 0-dependency `scratch` image (<20 MB total footprint).

### 🚀 Getting Started

#### Run the Simulation Engine (Backend)
```bash
cd backend
go run main.go
```

#### Run the Dashboard (Frontend)
```bash
cd victored-predictor
npm install
npm run dev
```

Navigate to the **Backtest de Motor** tab to witness the concurrent processing of 100 tournaments in real-time.

### 🌐 Deployment (Linux Server)

This project is fully automated for production deployment via SSH. 

1. Ensure the `.env.production` file is created inside `victored-predictor/` setting your server's IP:
```env
VITE_API_URL=http://your-server-ip:8080
```
2. Make the deployment script executable:
```bash
chmod +x deploy.sh
```
3. Run the deployment script to connect to your remote server, pull the latest changes, build the Go binary, and rebuild the React frontend:
```bash
./deploy.sh
```

---

## 🇪🇸 Versión en Español

**2026 World Cup Predictive Engine** es una plataforma de simulación de alto rendimiento orientada por datos, diseñada para predecir los resultados de la Copa Mundial de la FIFA 2026. Al aprovechar un modelo estadístico multifactorial personalizado y el poder de procesamiento concurrente de Go (Golang), el motor puede simular millones de partidos del torneo en cuestión de segundos.

### 🧠 The Statistical Model

A diferencia de predictores ingenuos que dependen únicamente de cuotas estáticas, este motor utiliza una **Fórmula Ponderada Multifactorial** que calcula dinámicamente la fuerza de los equipos en base a variables del mundo real:

1. **Base Elo Rating:** Representa la fuerza histórica y fundacional de la selección nacional.
2. **Opta Rating (Current Form):** Refleja el rendimiento táctico a corto plazo, resultados recientes y métricas de jugadores específicos.
3. **Socio-Economic Score:** Integra factores macroeconómicos (PIB per cápita, población, inversión en infraestructura futbolística) que históricamente se correlacionan con el éxito sostenido en torneos (teoría de Klement).
4. **Crisis Modifier:** Calcula dinámicamente la salud de la plantilla analizando el roster activo frente a los jugadores lesionados, penalizando fuertemente a los equipos que pierden talento crucial (por ejemplo, bajas de Rodri o Neymar).
5. **Environmental Weights:** Ajusta el rendimiento basándose en la aclimatación a la altitud, fatiga por temperatura (WBGT) y las extensas distancias de viaje inherentes al formato de Norteamérica 2026.

Estos factores se mezclan en un modelo de varianza de *Expected Goals (xG)*.

### ⚡ Concurrency Architecture en Go

Un solo torneo de la Copa del Mundo consta de 104 partidos (Fase de Grupos + Eliminatorias). Para determinar una certeza matemática, predecir un torneo solo una vez es inútil. Debemos ejecutarlo miles de veces.

El backend está diseñado para manejar **concurrencia extrema** utilizando `goroutines` y `channels` de Go:

- **Match-Level Concurrency:** Un partido individual se simula hasta 10,000 veces. Un pool de 10 workers procesa estas iteraciones en paralelo, usando buffered channels para agregar los goles esperados (xG) resultantes y las probabilidades.
- **Tournament Backtesting:** El endpoint `/api/backtest` simula **100 Mundiales completos** (10,400 partidos) de forma concurrente. Utilizando un sync pool de 20 `goroutines` y un `sync.Mutex` seguro para hilos, el backend procesa millones de operaciones matemáticas en menos de **3 segundos**.

Esta arquitectura garantiza la máxima utilización del CPU, transformando lo que tradicionalmente sería una operación secuencial y bloqueante de minutos en lenguajes como Python o Node.js en una API ultrarrápida en tiempo real.

### 🎲 Reducing Bias: Por qué usar el Monte Carlo Method?

En el fútbol, el mejor equipo no siempre gana. Las sorpresas existen.
Un modelo puramente determinista predeciría que el equipo con el mayor Elo rating ganaría siempre, fallando por completo en capturar la magia y el caos del deporte.

Utilizamos el **Monte Carlo Method** inyectando un Peso de Aleatoriedad (Randomness Weight, `rngA` y `rngB`) calculado en nuestra función de goles esperados, junto a una función de distribución normal (`rand.NormFloat64()`). Al simular el mismo emparejamiento 10,000 veces, la aleatoriedad se suaviza, revelando el verdadero espectro de probabilidad estadística.

El **Backtesting Engine** prueba esto: cuando ejecutas 100 simulaciones del torneo, verás una distribución estadística de campeones. Los grandes favoritos podrían ganar el 30% de las veces, pero el motor Monte Carlo revela la probabilidad matemática de que las sorpresas o *dark horses* lleguen lejos.

### 🛠 Tech Stack
- **Backend:** Go (Golang), Framework Fiber.
- **Frontend:** React, Next.js (entorno Vite), Vanilla CSS, Recharts para analítica.
- **Deployment:** Multi-stage Docker build utilizando una imagen `scratch` con 0 dependencias (<20 MB de peso total).

### 🚀 Cómo Inicializarlo

#### Ejecutar el Motor de Simulación (Backend)
```bash
cd backend
go run main.go
```

#### Ejecutar el Dashboard (Frontend)
```bash
cd victored-predictor
npm install
npm run dev
```

Navega a la pestaña de **Backtest de Motor** para presenciar el procesamiento concurrente de 100 torneos en tiempo real.

### 🌐 Deployment (Servidor Linux)

Este proyecto está completamente automatizado para un despliegue en producción vía SSH.

1. Asegúrate de crear el archivo `.env.production` dentro de la carpeta `victored-predictor/`, configurando la IP o dominio de tu servidor:
```env
VITE_API_URL=http://tu-ip-de-servidor:8080
```
2. Otórgale permisos de ejecución al script de automatización:
```bash
chmod +x deploy.sh
```
3. Ejecuta el script. Éste se conectará a tu servidor remoto, hará *pull* de los últimos cambios de la rama main, recompilará el binario de Go, reiniciará el servicio y reconstruirá el frontend de React automáticamente:
```bash
./deploy.sh
```
