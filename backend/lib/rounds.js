const cmc = require("./cmc");

const FIELDS = {
    crypto: [
        { key: "market_cap", label: "Market Cap" },
        { key: "volume_24h", label: "24h Volume" },
        { key: "percent_change_24h", label: "24h Change %" },
    ],
    derivatives: [
        { key: "derivative_volume", label: "Derivative Volume" },
        { key: "open_interest", label: "Open Interest" },
    ],
    dex: [
        { key: "volume_24h", label: "24h Volume" },
        { key: "liquidity", label: "Liquidity" },
    ],
    rwa: [
        { key: "tokenized_market_cap", label: "Tokenized Market Cap" },
        { key: "tokenized_volume_24h", label: "Tokenized 24h Volume" },
        { key: "average_tokenized_price", label: "Avg Tokenized Price" },
    ],
};

const FETCHERS = {
    crypto: cmc.getCryptoListings,
    derivatives: cmc.getDerivativesExchanges,
    dex: cmc.getDexListings,
    rwa: cmc.getRwaListings,
};

function pick(arr, rng = Math.random) {
    return arr[Math.floor(rng() * arr.length)];
}

function seededRng(seed) {
    let a = seed;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seedFromString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
    return h;
}

async function buildRound(category, rng = Math.random) {
    const fetcher = FETCHERS[category];
    if (!fetcher) throw new Error(`Unknown category: ${category}`);
    const assets = (await fetcher()).filter((a) =>
        FIELDS[category].some((f) => typeof a.raw[f.key] === "number" && !Number.isNaN(a.raw[f.key]))
    );
    if (assets.length < 2) throw new Error(`Not enough usable ${category} data to build a round`);

    const field = pick(FIELDS[category], rng);
    const usable = assets.filter((a) => typeof a.raw[field.key] === "number");
    const a = pick(usable, rng);
    let b = pick(usable, rng);
    let guard = 0;
    while ((b.id === a.id || b.raw[field.key] === a.raw[field.key]) && guard++ < 20) {
        b = pick(usable, rng);
    }

    const revealFirst = rng() < 0.5;
    const [shown, hidden] = revealFirst ? [a, b] : [b, a];

    return {
        category,
        field,
        shown: { id: shown.id, name: shown.name, symbol: shown.symbol, value: shown.raw[field.key] },
        hidden: { id: hidden.id, name: hidden.name, symbol: hidden.symbol, value: hidden.raw[field.key] },
    };
}

async function buildDailySequence(dateStr, length = 5) {
    const rng = seededRng(seedFromString(dateStr));
    const categories = Object.keys(FIELDS);
    const rounds = [];
    for (let i = 0; i < length; i++) {
        const category = categories[Math.floor(rng() * categories.length)];
        rounds.push(await buildRound(category, rng));
    }
    return rounds;
}

module.exports = { FIELDS, buildRound, buildDailySequence };
