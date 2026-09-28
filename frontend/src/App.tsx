import { useEffect, useState } from "react";
import type { Category, Guess, GuessResult, LeaderboardEntry, PulseSummary, RoundData } from "./types";
import { fetchDaily, fetchLeaderboard, fetchPlayer, fetchPulse, fetchRound, submitGuess } from "./api";
import { CategoryPicker } from "./components/CategoryPicker";
import { Duel } from "./components/Duel";
import { DailyResult } from "./components/DailyResult";
import { PulseBar } from "./components/PulseBar";
import { Leaderboard } from "./components/Leaderboard";
import { LeaderboardSubmit } from "./components/LeaderboardSubmit";
import "./App.css";

type Mode = "streak" | "daily" | "leaderboard";
type Screen = "setup" | "duel" | "dailyResult";

function App() {
  const [mode, setMode] = useState<Mode>("streak");
  const [screen, setScreen] = useState<Screen>("setup");
  const [category, setCategory] = useState<Category>("crypto");
  const [round, setRound] = useState<RoundData | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [endedStreak, setEndedStreak] = useState<number | null>(null);
  const [guessing, setGuessing] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [pulse, setPulse] = useState<PulseSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [dailyRounds, setDailyRounds] = useState<RoundData[]>([]);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyResults, setDailyResults] = useState<boolean[]>([]);
  const [dailyDate, setDailyDate] = useState("");

  useEffect(() => {
    fetchPlayer().then((p) => setRating(p.rating)).catch(() => { });
    refreshPulse();
  }, []);

  function refreshPulse() {
    fetchPulse().then(setPulse).catch(() => { });
  }

  async function startStreakRound() {
    const r = await fetchRound(category);
    setRound(r);
    setResult(null);
    setEndedStreak(null);
    setScreen("duel");
  }

  async function startDaily() {
    const data = await fetchDaily();
    setDailyDate(data.date);
    setDailyRounds(data.rounds);
    setDailyIndex(0);
    setDailyResults([]);
    setRound(data.rounds[0]);
    setResult(null);
    setScreen("duel");
  }

  async function openLeaderboard() {
    const data = await fetchLeaderboard();
    setLeaderboard(data.leaderboard);
  }

  function switchMode(next: Mode) {
    setMode(next);
    if (next === "daily") startDaily();
    else if (next === "leaderboard") openLeaderboard();
    else setScreen("setup");
  }

  async function handleGuess(guess: Guess) {
    if (!round || guessing) return;
    setGuessing(true);
    try {
      const res = await submitGuess(round.roundId, guess, streak);
      setResult(res);
      if (res.rating !== null) setRating(res.rating);
      refreshPulse();

      if (mode === "streak") {
        if (res.correct) {
          setStreak(streak + 1);
        } else {
          setEndedStreak(streak > 0 ? streak : null);
          setStreak(0);
        }
      } else {
        setDailyResults([...dailyResults, res.correct]);
      }
    } finally {
      setGuessing(false);
    }
  }

  function handleNext() {
    if (mode === "daily") {
      const nextIndex = dailyIndex + 1;
      if (nextIndex < dailyRounds.length) {
        setDailyIndex(nextIndex);
        setRound(dailyRounds[nextIndex]);
        setResult(null);
      } else {
        setScreen("dailyResult");
      }
    } else {
      startStreakRound();
    }
  }

  const nextLabel =
    mode === "daily" && dailyIndex + 1 >= dailyRounds.length ? "See result" : "Next round";

  return (
    <>
      <header className="topbar">
        <div className="wordmark">
          CAP <span className="or">or</span> NO CAP
        </div>
        <div className="mode-switch">
          <button
            className={`mode-btn ${mode === "streak" ? "active" : ""}`}
            onClick={() => switchMode("streak")}
          >
            Streak
          </button>
          <button
            className={`mode-btn ${mode === "daily" ? "active" : ""}`}
            onClick={() => switchMode("daily")}
          >
            Daily
          </button>
          <button
            className={`mode-btn ${mode === "leaderboard" ? "active" : ""}`}
            onClick={() => switchMode("leaderboard")}
          >
            Leaderboard
          </button>
        </div>
        <div className="stat-group">
          {rating !== null && (
            <div className="stat-pill">
              <span>Rating</span>
              <strong className="rating-value">{rating}</strong>
            </div>
          )}
          {mode === "streak" && (
            <div className="stat-pill">
              <span>Streak</span>
              <strong>
                {streak}
                {streak >= 3 ? " \u{1F525}" : ""}
              </strong>
            </div>
          )}
        </div>
      </header>

      <PulseBar pulse={pulse} />

      <main>
        {mode !== "leaderboard" && screen === "setup" && (
          <CategoryPicker selected={category} onSelect={setCategory} onStart={startStreakRound} />
        )}
        {mode !== "leaderboard" && screen === "duel" && round && (
          <>
            <Duel round={round} result={result} onGuess={handleGuess} onNext={handleNext} nextLabel={nextLabel} guessing={guessing} />
            {mode === "streak" && endedStreak !== null && (
              <LeaderboardSubmit streak={endedStreak} category={category} onSubmitted={() => setEndedStreak(null)} />
            )}
          </>
        )}
        {mode !== "leaderboard" && screen === "dailyResult" && <DailyResult date={dailyDate} results={dailyResults} />}
        {mode === "leaderboard" && <Leaderboard entries={leaderboard} />}
      </main>

      <footer className="footnote">Built on the CoinMarketCap API for #BuildwithCMC</footer>
    </>
  );
}

export default App;
