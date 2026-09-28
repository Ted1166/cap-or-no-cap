import { useState } from "react";
import { getSavedName, saveName } from "../player";

interface Props {
    streak: number;
    category: string;
    onSubmitted: () => void;
}

export function LeaderboardSubmit({ streak, category, onSubmitted }: Props) {
    const [name, setName] = useState(getSavedName());
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    async function submit() {
        if (!name.trim() || submitting) return;
        setSubmitting(true);
        saveName(name.trim());
        const { submitLeaderboardEntry } = await import("../api");
        await submitLeaderboardEntry(name.trim(), streak, category);
        setSubmitting(false);
        setDone(true);
        onSubmitted();
    }

    if (done) {
        return <div className="leaderboard-submit done">Saved to the leaderboard 🏆</div>;
    }

    return (
        <div className="leaderboard-submit">
            <span>Streak of {streak} ended — save it?</span>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={20}
            />
            <button className="cta small" onClick={submit} disabled={submitting || !name.trim()}>
                Save
            </button>
        </div>
    );
}
