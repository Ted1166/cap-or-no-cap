require("dotenv").config();

async function main() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
        console.error("ANTHROPIC_API_KEY is not set in backend/.env — that's expected if you're skipping this feature.");
        process.exit(1);
    }

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
                max_tokens: 20,
                messages: [{ role: "user", content: "Say hello in five words." }],
            }),
        });
        const text = await res.text();
        console.log("status:", res.status);
        console.log("body:", text);
    } catch (err) {
        console.log("fetch threw:", err.message);
        console.log("cause:", err.cause);
    }
}

main();