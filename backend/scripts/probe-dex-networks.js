require("dotenv").config();
const fetch = require("node-fetch");

const candidates = [
    "ethereum",
    "bsc",
    "bnb-smart-chain",
    "binance-smart-chain",
    "solana",
    "polygon",
    "arbitrum",
    "base",
    "avalanche",
    "optimism",
];

async function tryNetwork(key, network_slug) {
    const res = await fetch(
        `https://pro-api.coinmarketcap.com/v4/dex/spot-pairs/latest?network_slug=${network_slug}&limit=1`,
        { headers: { "X-CMC_PRO_API_KEY": key } }
    );
    const json = await res.json();
    const ok = res.ok && Array.isArray(json.data ?? json);
    return { network_slug, ok, status: res.status, message: json?.status?.error_message || null };
}

async function main() {
    const key = process.env.CMC_API_KEY;
    if (!key) {
        console.error("Set CMC_API_KEY in backend/.env first.");
        process.exit(1);
    }

    for (const slug of candidates) {
        const result = await tryNetwork(key, slug);
        console.log(JSON.stringify(result));
    }
}

main();