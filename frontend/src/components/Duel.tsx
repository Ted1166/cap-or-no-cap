import type { Guess, GuessResult, RoundData } from "../types";
import { formatValue } from "../format";

interface Props {
    round: RoundData;
    result: GuessResult | null;
    onGuess: (g: Guess) => void;
    onNext: () => void;
    nextLabel: string;
    guessing: boolean;
}

export function Duel({ round, result, onGuess, onNext, nextLabel, guessing }: Props) {
    return (
        <section className="panel">
            <div className="field-label">
                {round.category.toUpperCase()} · {round.field.label}
            </div>
            <div className="duel-grid">
                <div className="asset-card revealed">
                    <div className="asset-name">
                        {round.shown.name} ({round.shown.symbol})
                    </div>
                    <div className="asset-value">{formatValue(round.shown.value, round.field.key)}</div>
                </div>
                <div className="vs">VS</div>
                <div className="asset-card hidden-card">
                    <div className="asset-name">
                        {round.hiddenAsset.name} ({round.hiddenAsset.symbol})
                    </div>
                    <div className={`asset-value ${result ? "" : "blurred"}`}>
                        {result ? formatValue(result.hiddenValue, round.field.key) : "?????"}
                    </div>
                </div>
            </div>

            {!result && (
                <div className="guess-row">
                    <button className="guess-btn higher" onClick={() => onGuess("higher")} disabled={guessing}>
                        ▲ Higher
                    </button>
                    <button className="guess-btn lower" onClick={() => onGuess("lower")} disabled={guessing}>
                        ▼ No Cap
                    </button>
                </div>
            )}

            {result && (
                <div className="verdict">
                    <div className={`verdict-tag ${result.correct ? "true" : "cap"}`}>
                        {result.correct ? "✅ FACTS — you called it" : "❌ CAP — that's a miss"}
                    </div>
                    <p className="explanation">{result.explanation}</p>
                    <button className="cta" onClick={onNext}>
                        {nextLabel}
                    </button>
                </div>
            )}
        </section>
    );
}
