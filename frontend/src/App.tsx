import { useState } from "react";
import type { Category, Guess, GuessResult, RoundData } from "./types";
import { fetchDaily, fetchRound, submitGuess } from "./api";
import { CategoryPicker } from "./components/CategoryPicker";
import { Duel } from "./components/Duel";
import { DailyResult } from "./components/DailyResult";
import "./App.css";

type Mode = "streak" | "daily";
type Screen = "setup" | "duel" | "dailyResult";

function App() {
  const [mode, setMode] = useState<Mode>("streak");
  const [screen, setScreen] = useState<Screen>("setup");
  const [category, setCategory] = useState<Category>("crypto");
  const [round, setRound] = useState<RoundData | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [streak, setStreak] = useState(0);

  const [dailyRounds, setDailyRounds] = useState<RoundData[]>([]);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyResults, setDailyResults] = useState<boolean[]>([]);
  const [dailyDate, setDailyDate] = useState("");

  async function startStreakRound() {
    const r = await fetchRound(category);
    setRound(r);
    setResult(null);
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

  function switchMode(next: Mode) {
    setMode(next);
    if (next === "daily") startDaily();
    else setScreen("setup");
  }

  async function handleGuess(guess: Guess) {
    if (!round) return;
    const res = await submitGuess(round.roundId, guess);
    setResult(res);

    if (mode === "streak") {
      setStreak(res.correct ? streak + 1 : 0);
    } else {
      setDailyResults([...dailyResults, res.correct]);
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
        </div>
        {mode === "streak" && (
          <div className="stat-pill">
            <span>Streak</span>
            <strong>{streak}{streak >= 3 ? " \u{1F525}" : ""}</strong>
          </div>
        )}
      </header>

      <main>
        {screen === "setup" && (
          <CategoryPicker selected={category} onSelect={setCategory} onStart={startStreakRound} />
        )}
        {screen === "duel" && round && (
          <Duel round={round} result={result} onGuess={handleGuess} onNext={handleNext} nextLabel={nextLabel} />
        )}
        {screen === "dailyResult" && <DailyResult date={dailyDate} results={dailyResults} />}
      </main>

      <footer className="footnote">Built on the CoinMarketCap API for #BuildwithCMC</footer>
    </>
  );
}

export default App;
