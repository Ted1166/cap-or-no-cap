require("dotenv").config();
const fetch = require("node-fetch");

const combos = [
    ["ethereum", "uniswap-v3"],
    ["ethereum", "uniswap-v2"],
    ["ethereum", "uniswap"],
    ["ethereum", "sushiswap"],
    ["bsc", "pancakeswap-v3"],
    ["bsc", "pancakeswap-v2"],
    ["bsc", "pancakeswap"],
    ["solana", "raydium"],
    ["solana", "raydium-v4"],
    ["solana", "orca"],
    ["base", "uniswap-v3"],
    ["base", "aerodrome"],
    ["base", "baseswap"],
    ["arbitrum", "uniswap-v3"],
    ["arbitrum", "camelot"],
];

async function tryCombo(key, network_slug, dex_slug) {
    const res = await fetch(
        `https://pro-api.coinmarketcap.com/v4/dex/spot-pairs/latest?network_slug=${network_slug}&dex_slug=${dex_slug}&limit=1`,
        { headers: { "X-CMC_PRO_API_KEY": key } }
    );
    const json = await res.json();
    const ok = res.ok && Array.isArray(json.data ?? json);
    return { network_slug, dex_slug, ok, status: res.status, message: json?.status?.error_message || null };
}

async function main() {
    const key = process.env.CMC_API_KEY;
    if (!key) {
        console.error("Set CMC_API_KEY in backend/.env first.");
        process.exit(1);
    }

    for (const [network_slug, dex_slug] of combos) {
        const result = await tryCombo(key, network_slug, dex_slug);
        console.log(JSON.stringify(result));
    }
}

main();