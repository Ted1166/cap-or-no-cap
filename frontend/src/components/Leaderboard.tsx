import type { LeaderboardEntry } from "../types";

interface Props {
    entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: Props) {
    return (
        <section className="panel">
            <h2>Global Leaderboard</h2>
            {entries.length === 0 ? (
                <p className="lede">No streaks submitted yet. Play Streak mode and save yours when it ends.</p>
            ) : (
                <ol className="leaderboard-list">
                    {entries.map((e, i) => (
                        <li key={`${e.name}-${e.at}`} className="leaderboard-row">
                            <span className="leaderboard-rank">#{i + 1}</span>
                            <span className="leaderboard-name">{e.name}</span>
                            <span className="leaderboard-category">{e.category}</span>
                            <span className="leaderboard-streak">{e.streak} 🔥</span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
