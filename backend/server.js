require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { buildRound, buildDailySequence } = require("./lib/rounds");
const { explainRound } = require("./lib/explain");
const store = require("./lib/store");

const app = express();
app.use(cors());
app.use(express.json());

const db = store.load();
const rounds = new Map();
const ROUND_TTL_MS = 5 * 60 * 1000;
const dailyCache = new Map();

function todayUTC() {
    return new Date().toISOString().slice(0, 10);
}

function publicShape(id, round) {
    return {
        roundId: id,
        category: round.category,
        field: round.field,
        shown: round.shown,
        hiddenAsset: { name: round.hidden.name, symbol: round.hidden.symbol },
    };
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/round", async (req, res) => {
    try {
        const category = req.query.category || "crypto";
        const round = await buildRound(category);
        const roundId = crypto.randomUUID();
        rounds.set(roundId, { ...round, createdAt: Date.now() });
        setTimeout(() => rounds.delete(roundId), ROUND_TTL_MS);
        res.json(publicShape(roundId, round));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/guess", async (req, res) => {
    try {
        const { roundId, guess, playerId, currentStreak } = req.body;
        const round = rounds.get(roundId);
        if (!round) return res.status(404).json({ error: "Round expired or not found" });

        const correct =
            (guess === "higher" && round.hidden.value >= round.shown.value) ||
            (guess === "lower" && round.hidden.value <= round.shown.value);

        const winner = round.hidden.value >= round.shown.value ? round.hidden : round.shown;
        const loser = winner === round.hidden ? round.shown : round.hidden;

        const difficulty = store.difficultyFor(round.shown.value, round.hidden.value);

        const explanation = await explainRound({
            category: round.category,
            label: round.field.label,
            winner,
            loser,
        });

        const ratingInfo = store.applyGuessResult(db, {
            playerId,
            category: round.category,
            correct,
            currentStreak,
            difficulty,
        });

        rounds.delete(roundId);
        res.json({
            correct,
            hiddenValue: round.hidden.value,
            hiddenAsset: { name: round.hidden.name, symbol: round.hidden.symbol },
            explanation,
            difficulty,
            rating: ratingInfo ? ratingInfo.rating : null,
            ratingDelta: ratingInfo ? ratingInfo.delta : null,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/daily", async (req, res) => {
    try {
        const date = todayUTC();
        let cached = dailyCache.get(date);
        if (!cached) {
            const seq = await buildDailySequence(date, 5);
            const ids = seq.map(() => crypto.randomUUID());
            seq.forEach((r, i) => rounds.set(ids[i], { ...r, createdAt: Date.now() }));
            cached = { rounds: seq, ids };
            dailyCache.set(date, cached);
        }
        res.json({
            date,
            rounds: cached.ids.map((id, i) => publicShape(id, cached.rounds[i])),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/pulse", (_req, res) => {
    res.json(store.getPulseSummary(db));
});

app.get("/api/leaderboard", (_req, res) => {
    res.json({ leaderboard: db.leaderboard });
});

app.post("/api/leaderboard", (req, res) => {
    const { name, streak, category } = req.body;
    if (!name || typeof streak !== "number") {
        return res.status(400).json({ error: "name and streak are required" });
    }
    const leaderboard = store.submitLeaderboard(db, { name, streak, category });
    res.json({ leaderboard });
});

app.get("/api/player/:id", (req, res) => {
    res.json(store.getPlayer(db, req.params.id));
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Cap or No Cap API running on :${PORT}`));
