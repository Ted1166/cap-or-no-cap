function fmt(n) {
    if (typeof n !== "number") return String(n);
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return n.toFixed(2);
}

function templateFallback({ label, winner, loser }) {
    return `${winner.name} (${fmt(winner.value)}) edges out ${loser.name} (${fmt(loser.value)}) on ${label} right now — no LLM key set, so this is the templated line. Add ANTHROPIC_API_KEY to get a real generated explanation.`;
}

async function explainRound({ category, label, winner, loser }) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return templateFallback({ label, winner, loser });

    const prompt = `You are a punchy crypto/markets commentator in a guessing game called "Cap or No Cap".
Category: ${category}. Stat compared: ${label}.
Winner: ${winner.name} (${winner.symbol}) = ${fmt(winner.value)}
Loser: ${loser.name} (${loser.symbol}) = ${fmt(loser.value)}
In ONE short sentence (under 25 words), say why this result makes sense given what these two assets are. Be concrete, not generic. No hashtags, no emoji spam (one is fine).`;

    try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 100,
                messages: [{ role: "user", content: prompt }],
            }),
        });
        const data = await res.json();
        const text = data?.content?.find((b) => b.type === "text")?.text;
        return text?.trim() || templateFallback({ label, winner, loser });
    } catch (err) {
        console.error("Explain call failed:", err.message, err.cause ?? "");
        return templateFallback({ label, winner, loser });
    }
}

module.exports = { explainRound };