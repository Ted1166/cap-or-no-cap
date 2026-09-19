interface Props {
    date: string;
    results: boolean[];
}

export function DailyResult({ date, results }: Props) {
    const squares = results.map((r) => (r ? "🟩" : "🟥")).join("");
    const score = results.filter(Boolean).length;
    const shareStr = `Cap or No Cap — ${date}\n${squares}\n${score}/${results.length} #BuildwithCMC`;

    return (
        <section className="panel">
            <h2>Today's result</h2>
            <div className="daily-grid">{squares}</div>
            <pre className="share-string">{shareStr}</pre>
            <button className="cta" onClick={() => navigator.clipboard.writeText(shareStr)}>
                Copy result
            </button>
        </section>
    );
}
