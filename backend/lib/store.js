const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "store.json");

function defaultStore() {
    return {
        players: {},
        leaderboard: [],
        pulse: {
            totalRounds: 0,
            totalCorrect: 0,
            categories: {},
        },
    };
}

function load() {
    try {
        const raw = fs.readFileSync(DATA_PATH, "utf8");
        return JSON.parse(raw);
    } catch {
        return defaultStore();
    }
}

function save(store) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
}

function getPlayer(store, id) {
    if (!store.players[id]) {
        store.players[id] = { id, rating: 1000, gamesPlayed: 0, correctCount: 0, bestStreak: 0 };
    }
    return store.players[id];
}

function difficultyFor(a, b) {
    const denom = Math.max(Math.abs(a), Math.abs(b), 1e-9);
    const pct = (Math.abs(a - b) / denom) * 100;
    let label, multiplier;
    if (pct < 5) {
        label = "RAZOR-THIN";
        multiplier = 1.6;
    } else if (pct < 15) {
        label = "TIGHT";
        multiplier = 1.2;
    } else if (pct < 40) {
        label = "CLEAR";
        multiplier = 0.9;
    } else {
        label = "LANDSLIDE";
        multiplier = 0.6;
    }
    return { pct: Math.round(pct * 10) / 10, label, multiplier };
}

const RATING_K = 16;

function applyGuessResult(store, { playerId, category, correct, currentStreak, difficulty }) {
    store.pulse.totalRounds += 1;
    if (correct) store.pulse.totalCorrect += 1;
    if (!store.pulse.categories[category]) store.pulse.categories[category] = { played: 0, correct: 0 };
    store.pulse.categories[category].played += 1;
    if (correct) store.pulse.categories[category].correct += 1;

    let ratingInfo = null;
    if (playerId) {
        const player = getPlayer(store, playerId);
        player.gamesPlayed += 1;
        if (correct) player.correctCount += 1;
        if (typeof currentStreak === "number") player.bestStreak = Math.max(player.bestStreak, currentStreak);

        const actual = correct ? 1 : 0;
        const delta = Math.round(RATING_K * (actual - 0.5) * 2 * difficulty.multiplier);
        player.rating = Math.max(0, player.rating + delta);
        ratingInfo = { rating: player.rating, delta };
    }

    save(store);
    return ratingInfo;
}

function submitLeaderboard(store, { name, streak, category }) {
    const entry = {
        name: String(name).slice(0, 20) || "Anonymous",
        streak,
        category: category || "mixed",
        at: new Date().toISOString(),
    };
    store.leaderboard.push(entry);
    store.leaderboard.sort((a, b) => b.streak - a.streak);
    store.leaderboard = store.leaderboard.slice(0, 20);
    save(store);
    return store.leaderboard;
}

function getPulseSummary(store) {
    const overallAccuracy = store.pulse.totalRounds ? store.pulse.totalCorrect / store.pulse.totalRounds : 0;
    const categories = Object.fromEntries(
        Object.entries(store.pulse.categories).map(([k, v]) => [
            k,
            { played: v.played, accuracy: v.played ? v.correct / v.played : 0 },
        ])
    );
    return { totalRounds: store.pulse.totalRounds, overallAccuracy, categories };
}

module.exports = {
    load,
    save,
    getPlayer,
    difficultyFor,
    applyGuessResult,
    submitLeaderboard,
    getPulseSummary,
};
