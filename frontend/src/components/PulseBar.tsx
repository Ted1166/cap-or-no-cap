import type { PulseSummary } from "../types";
import { formatPercent } from "../format";

interface Props {
    pulse: PulseSummary | null;
}

export function PulseBar({ pulse }: Props) {
    if (!pulse || pulse.totalRounds === 0) {
        return (
            <div className="pulse-bar">
                <span className="pulse-dot" /> No rounds played yet — be the first
            </div>
        );
    }

    const topCategory = Object.entries(pulse.categories).sort((a, b) => b[1].played - a[1].played)[0];

    return (
        <div className="pulse-bar">
            <span className="pulse-dot" />
            {pulse.totalRounds.toLocaleString()} rounds played · {formatPercent(pulse.overallAccuracy)} guessed correctly
            {topCategory && (
                <span className="pulse-extra">
                    {" "}
                    · most played: {topCategory[0]} ({formatPercent(topCategory[1].accuracy)} accuracy)
                </span>
            )}
        </div>
    );
}
