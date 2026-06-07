package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"os"
	"sort"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type SimulationRequest struct {
	TeamA        string  `json:"teamA"`
	TeamB        string  `json:"teamB"`
	OptaWeight   float64 `json:"optaWeight"`
	EloWeight    float64 `json:"eloWeight"`
	SocioWeight  float64 `json:"socioWeight"`
	EnvWeight    float64 `json:"envWeight"`
	RandomWeight float64 `json:"randomWeight"`
	IsAltitude   bool    `json:"isAltitude"`
	WBGT         float64 `json:"wbgt"`
	TravelA      float64 `json:"travelA"`
	TravelB      float64 `json:"travelB"`
}

type SimulationResponse struct {
	WinProbA      float64 `json:"winProbA"`
	WinProbB      float64 `json:"winProbB"`
	DrawProb      float64 `json:"drawProb"`
	ExpectedGoalA float64 `json:"expectedGoalA"`
	ExpectedGoalB float64 `json:"expectedGoalB"`
	Analysis      string  `json:"analysis"`
}

type Player struct {
	Name    string  `json:"name"`
	Quality float64 `json:"quality"`
	Status  string  `json:"status"`
}

type TeamStats struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Confederation  string   `json:"confederation"`
	BaseElo        float64  `json:"baseElo"`
	OptaRating     float64  `json:"optaRating"`
	SocioScore     float64  `json:"socioScore"`
	IsAcclimated   bool     `json:"isAcclimated"`
	PlayStyle      string   `json:"playStyle"`
	Roster         []Player `json:"roster"`
	CrisisModifier float64  `json:"-"`
}

var TeamsDB = make(map[string]TeamStats)
var TeamsList = []TeamStats{}

type Group struct {
	Group string   `json:"group"`
	Teams []string `json:"teams"`
}
var TournamentGroups []Group

// Structures for Tournament Response
type TournamentRequest struct {
	// Reutiliza los pesos base para el torneo
	Weights SimulationRequest `json:"weights"`
}

type GroupStanding struct {
	TeamName string
	Points   int
	GD       float64 // Goal difference (using xG for decimals or simulating match strictly, let's use integers for real points, but xG for GD)
	GF       float64
}

type MatchNode struct {
	Phase  string     `json:"phase"`
	TeamA  string     `json:"teamA"`
	TeamB  string     `json:"teamB"`
	ScoreA float64    `json:"scoreA"`
	ScoreB float64    `json:"scoreB"`
	Winner string     `json:"winner"`
}

type TournamentResponse struct {
	Groups   map[string][]GroupStanding `json:"groups"`
	Round32  []MatchNode                `json:"round32"`
	Round16  []MatchNode                `json:"round16"`
	Quarters []MatchNode                `json:"quarters"`
	Semis    []MatchNode                `json:"semis"`
	Final    MatchNode                  `json:"final"`
	GlobalConfidence float64            `json:"globalConfidence"`
}

type BacktestResponse struct {
	SimulationsRun        int            `json:"simulations_run"`
	ChampionCounts        map[string]int `json:"champion_counts"`
	AverageSurpriseFactor float64        `json:"average_surprise_factor"`
	ExecutionTimeMs       int64          `json:"execution_time_ms"`
}

type SimulationLog struct {
	ID         string    `json:"id"`
	Timestamp  time.Time `json:"timestamp"`
	Type       string    `json:"type"`
	Confidence float64   `json:"confidence"`
}

var HistoryLog []SimulationLog
var historyMutex sync.Mutex

func addLog(logItem SimulationLog) {
	historyMutex.Lock()
	defer historyMutex.Unlock()
	HistoryLog = append([]SimulationLog{logItem}, HistoryLog...) // prepend
	if len(HistoryLog) > 10 {
		HistoryLog = HistoryLog[:10]
	}
}

func loadData() {
	file, err := os.ReadFile("data/teams_data.json")
	if err != nil {
		log.Fatalf("Error reading teams_data.json: %v", err)
	}
	err = json.Unmarshal(file, &TeamsList)
	if err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}

	for i, team := range TeamsList {
		var activeQuality, totalQuality float64
		for _, player := range team.Roster {
			totalQuality += player.Quality
			if player.Status == "active" {
				activeQuality += player.Quality
			}
		}
		if totalQuality > 0 {
			team.CrisisModifier = activeQuality / totalQuality
		} else {
			team.CrisisModifier = 1.0
		}
		TeamsList[i].CrisisModifier = team.CrisisModifier
		TeamsDB[team.Name] = team
	}

	fileGroups, err := os.ReadFile("data/tournament_structure.json")
	if err == nil {
		json.Unmarshal(fileGroups, &TournamentGroups)
	}
}

func main() {
	loadData()

	app := fiber.New()
	app.Use(cors.New())

	app.Get("/api/teams", func(c *fiber.Ctx) error {
		return c.JSON(TeamsList)
	})

	app.Get("/api/history", func(c *fiber.Ctx) error {
		historyMutex.Lock()
		defer historyMutex.Unlock()
		return c.JSON(HistoryLog)
	})

	app.Post("/api/simulate", func(c *fiber.Ctx) error {
		req := new(SimulationRequest)
		if err := c.BodyParser(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		teamA, okA := TeamsDB[req.TeamA]
		teamB, okB := TeamsDB[req.TeamB]
		if !okA || !okB {
			return c.Status(400).JSON(fiber.Map{"error": "Team not found"})
		}

		res := simulateMatchConcurrent(*req, teamA, teamB, 10000)
		return c.JSON(res)
	})

	app.Post("/api/tournament", func(c *fiber.Ctx) error {
		req := new(TournamentRequest)
		if err := c.BodyParser(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}
		
		res := simulateTournament(req.Weights)
		
		return c.JSON(res)
	})

	app.Post("/api/backtest", func(c *fiber.Ctx) error {
		req := new(TournamentRequest)
		if err := c.BodyParser(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}
		
		start := time.Now()
		totalSims := 100
		championCounts := make(map[string]int)
		var totalConfidence float64
		var mu sync.Mutex
		var wg sync.WaitGroup
		
		numWorkers := 20
		jobs := make(chan int, totalSims)
		
		for w := 0; w < numWorkers; w++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				for range jobs {
					res := simulateTournament(req.Weights)
					mu.Lock()
					championCounts[res.Final.Winner]++
					totalConfidence += res.GlobalConfidence
					mu.Unlock()
				}
			}()
		}
		
		for i := 0; i < totalSims; i++ {
			jobs <- i
		}
		close(jobs)
		wg.Wait()
		
		execTime := time.Since(start).Milliseconds()
		avgSurprise := 1.0 - (totalConfidence / float64(totalSims))
		
		return c.JSON(BacktestResponse{
			SimulationsRun:        totalSims,
			ChampionCounts:        championCounts,
			AverageSurpriseFactor: avgSurprise,
			ExecutionTimeMs:       execTime,
		})
	})

	app.Listen(":8080")
}

func simulateMatchConcurrent(req SimulationRequest, teamA, teamB TeamStats, iterations int) SimulationResponse {
	var wg sync.WaitGroup
	results := make(chan int, iterations)
	goalsAChan := make(chan float64, iterations)
	goalsBChan := make(chan float64, iterations)

	modA, modB := calculateModifiers(req, teamA, teamB)
	numWorkers := 10
	itersPerWorker := iterations / numWorkers

	for w := 0; w < numWorkers; w++ {
		wg.Add(1)
		go func(iters int) {
			defer wg.Done()
			localRand := rand.New(rand.NewSource(time.Now().UnixNano()))
			for i := 0; i < iters; i++ {
				scoreA := (teamA.BaseElo * req.EloWeight) + (teamA.OptaRating * 10 * req.OptaWeight) + (teamA.SocioScore * 100 * req.SocioWeight)
				scoreB := (teamB.BaseElo * req.EloWeight) + (teamB.OptaRating * 10 * req.OptaWeight) + (teamB.SocioScore * 100 * req.SocioWeight)

				scoreA *= modA * teamA.CrisisModifier
				scoreB *= modB * teamB.CrisisModifier

				rngA := 1.0 + (localRand.Float64()*2-1)*req.RandomWeight
				rngB := 1.0 + (localRand.Float64()*2-1)*req.RandomWeight

				finalA, finalB := scoreA*rngA, scoreB*rngB

				gA := math.Max(0, (finalA-finalB)/500.0+1.1+localRand.NormFloat64()*0.8)
				gB := math.Max(0, (finalB-finalA)/500.0+1.1+localRand.NormFloat64()*0.8)

				goalsAChan <- gA
				goalsBChan <- gB

				if int(gA) > int(gB) {
					results <- 1
				} else if int(gB) > int(gA) {
					results <- 2
				} else {
					results <- 0
				}
			}
		}(itersPerWorker)
	}

	wg.Wait()
	close(results)
	close(goalsAChan)
	close(goalsBChan)

	var winsA, winsB, draws int
	var totalGA, totalGB float64

	for res := range results {
		if res == 1 {
			winsA++
		} else if res == 2 {
			winsB++
		} else {
			draws++
		}
	}
	for g := range goalsAChan {
		totalGA += g
	}
	for g := range goalsBChan {
		totalGB += g
	}

	return SimulationResponse{
		WinProbA:      float64(winsA) / float64(iterations),
		WinProbB:      float64(winsB) / float64(iterations),
		DrawProb:      float64(draws) / float64(iterations),
		ExpectedGoalA: totalGA / float64(iterations),
		ExpectedGoalB: totalGB / float64(iterations),
		Analysis:      "",
	}
}

func calculateModifiers(req SimulationRequest, teamA, teamB TeamStats) (float64, float64) {
	modA, modB := 1.0, 1.0
	if req.IsAltitude {
		if !teamA.IsAcclimated && teamA.Confederation == "UEFA" {
			modA -= 0.15 * req.EnvWeight
		}
		if !teamB.IsAcclimated && teamB.Confederation == "UEFA" {
			modB -= 0.15 * req.EnvWeight
		}
	}
	if req.WBGT > 26 {
		if teamA.PlayStyle == "high_press" { modA -= 0.10 * req.EnvWeight }
		if teamB.PlayStyle == "high_press" { modB -= 0.10 * req.EnvWeight }
		if teamA.PlayStyle == "possession" { modA += 0.05 * req.EnvWeight }
		if teamB.PlayStyle == "possession" { modB += 0.05 * req.EnvWeight }
	}
	if req.TravelA > 2000 { modA -= (req.TravelA - 2000) / 10000.0 * req.EnvWeight }
	if req.TravelB > 2000 { modB -= (req.TravelB - 2000) / 10000.0 * req.EnvWeight }
	return modA, modB
}

// TOURNAMENT LOGIC
func simulateTournament(weights SimulationRequest) TournamentResponse {
	// 1. Group Stage
	groupsResult := make(map[string][]GroupStanding)
	var allThirds []GroupStanding
	var qualified32 []string

	for _, g := range TournamentGroups {
		standings := make(map[string]*GroupStanding)
		for _, t := range g.Teams {
			standings[t] = &GroupStanding{TeamName: t, Points: 0, GD: 0, GF: 0}
		}

		// Round Robin
		for i := 0; i < len(g.Teams); i++ {
			for j := i + 1; j < len(g.Teams); j++ {
				tA := TeamsDB[g.Teams[i]]
				tB := TeamsDB[g.Teams[j]]
				res := simulateMatchConcurrent(weights, tA, tB, 7000)

				// Determine match result based on probabilities for group stage
				if res.WinProbA > res.WinProbB && res.WinProbA > res.DrawProb {
					standings[tA.Name].Points += 3
				} else if res.WinProbB > res.WinProbA && res.WinProbB > res.DrawProb {
					standings[tB.Name].Points += 3
				} else {
					standings[tA.Name].Points += 1
					standings[tB.Name].Points += 1
				}
				standings[tA.Name].GF += res.ExpectedGoalA
				standings[tA.Name].GD += (res.ExpectedGoalA - res.ExpectedGoalB)
				standings[tB.Name].GF += res.ExpectedGoalB
				standings[tB.Name].GD += (res.ExpectedGoalB - res.ExpectedGoalA)
			}
		}

		// Sort group
		var groupSorted []GroupStanding
		for _, v := range standings {
			groupSorted = append(groupSorted, *v)
		}
		sort.Slice(groupSorted, func(i, j int) bool {
			if groupSorted[i].Points == groupSorted[j].Points {
				return groupSorted[i].GD > groupSorted[j].GD
			}
			return groupSorted[i].Points > groupSorted[j].Points
		})

		groupsResult[g.Group] = groupSorted
		qualified32 = append(qualified32, groupSorted[0].TeamName, groupSorted[1].TeamName)
		allThirds = append(allThirds, groupSorted[2])
	}

	// Get best 8 thirds
	sort.Slice(allThirds, func(i, j int) bool {
		if allThirds[i].Points == allThirds[j].Points {
			return allThirds[i].GD > allThirds[j].GD
		}
		return allThirds[i].Points > allThirds[j].Points
	})

	for i := 0; i < 8; i++ {
		qualified32 = append(qualified32, allThirds[i].TeamName)
	}

	// Randomize Round of 32 for simplicity (in reality there's a strict bracket logic, but this suffices for the MVP)
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(qualified32), func(i, j int) { qualified32[i], qualified32[j] = qualified32[j], qualified32[i] })

	round32, conf32 := simulatePhase(qualified32, weights, "Round of 32")
	
	winners32 := []string{}
	for _, m := range round32 { winners32 = append(winners32, m.Winner) }
	round16, conf16 := simulatePhase(winners32, weights, "Round of 16")

	winners16 := []string{}
	for _, m := range round16 { winners16 = append(winners16, m.Winner) }
	quarters, conf8 := simulatePhase(winners16, weights, "Quarter-Finals")

	winners8 := []string{}
	for _, m := range quarters { winners8 = append(winners8, m.Winner) }
	semis, conf4 := simulatePhase(winners8, weights, "Semi-Finals")

	winners4 := []string{}
	for _, m := range semis { winners4 = append(winners4, m.Winner) }
	finalPhase, conf2 := simulatePhase(winners4, weights, "Final")
	final := finalPhase[0]

	// Average confidence of knockout stage
	totalConf := conf32 + conf16 + conf8 + conf4 + conf2
	avgConf := totalConf / 31.0

	addLog(SimulationLog{
		ID:         fmt.Sprintf("TRN-%d", time.Now().Unix()),
		Timestamp:  time.Now(),
		Type:       "Tournament",
		Confidence: avgConf,
	})

	return TournamentResponse{
		Groups:   groupsResult,
		Round32:  round32,
		Round16:  round16,
		Quarters: quarters,
		Semis:    semis,
		Final:    final,
		GlobalConfidence: avgConf,
	}
}

func simulatePhase(teams []string, weights SimulationRequest, phaseName string) ([]MatchNode, float64) {
	var matches []MatchNode
	var totalConfidence float64
	for i := 0; i < len(teams); i += 2 {
		tA := TeamsDB[teams[i]]
		tB := TeamsDB[teams[i+1]]
		res := simulateMatchConcurrent(weights, tA, tB, 7000)
		
		winner := tA.Name
		matchConf := res.WinProbA
		if res.WinProbB > res.WinProbA {
			winner = tB.Name
			matchConf = res.WinProbB
		} else if res.WinProbB == res.WinProbA {
			if rand.Float64() > 0.5 { 
				winner = tB.Name
				matchConf = res.WinProbB
			}
		}

		totalConfidence += matchConf

		matches = append(matches, MatchNode{
			Phase:  phaseName,
			TeamA:  tA.Name,
			TeamB:  tB.Name,
			ScoreA: res.ExpectedGoalA,
			ScoreB: res.ExpectedGoalB,
			Winner: winner,
		})
	}
	return matches, totalConfidence
}
