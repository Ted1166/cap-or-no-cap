const fetch = require("node-fetch");

const BASE = "https://pro-api.coinmarketcap.com";
const CACHE_MS = 90 * 1000;
const cache = new Map();

function apiKey() {
    const key = process.env.CMC_API_KEY;
    if (!key) throw new Error("CMC_API_KEY is not set. Copy .env.example to .env and add your key.");
    return key;
}

async function cmcRequest(path, params = {}) {
    const cacheKey = path + JSON.stringify(params);
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.json;

    const qs = new URLSearchParams(params).toString();
    const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, {
        headers: { "X-CMC_PRO_API_KEY": apiKey(), Accept: "application/json" },
    });
    const json = await res.json();
    if (!res.ok) {
        const msg = json?.status?.error_message || `CMC request failed (${res.status})`;
        throw new Error(msg);
    }
    cache.set(cacheKey, { at: Date.now(), json });
    return json;
}

async function cmcGetData(path, params = {}) {
    const json = await cmcRequest(path, params);
    return json.data;
}

async function cmcGetRaw(path, params = {}) {
    return cmcRequest(path, params);
}

async function getCryptoListings(limit = 100) {
    const data = await cmcGetData("/v1/cryptocurrency/listings/latest", {
        limit,
        convert: "USD",
        sort: "market_cap",
    });
    return data.map((c) => ({
        id: `crypto-${c.id}`,
        name: c.name,
        symbol: c.symbol,
        raw: {
            market_cap: c.quote?.USD?.market_cap,
            volume_24h: c.quote?.USD?.volume_24h,
            percent_change_24h: c.quote?.USD?.percent_change_24h,
        },
    }));
}

async function getDerivativesExchanges(limit = 100) {
    const data = await cmcGetData("/v5/exchange/derivatives/list", {
        limit,
        convert: "USD",
        sort: "volume_24h",
    });
    return data.exchanges.map((e) => {
        const q = e.quotes?.[0] || {};
        return {
            id: `derivatives-${e.exchange_id}`,
            name: e.exchange_name,
            symbol: e.exchange_slug,
            raw: {
                derivative_volume: q.derivative_volume,
                open_interest: q.open_interest,
            },
        };
    });
}

const DEX_TARGETS = [
    { network_slug: "ethereum", dex_slug: "uniswap-v3" },
    { network_slug: "bsc", dex_slug: "pancakeswap-v3" },
    { network_slug: "solana", dex_slug: "raydium" },
    { network_slug: "base", dex_slug: "uniswap-v3" },
    { network_slug: "arbitrum", dex_slug: "uniswap-v3" },
];

async function getDexListings(limit = 100) {
    const perNetwork = Math.max(10, Math.floor(limit / DEX_TARGETS.length));
    const attempts = await Promise.allSettled(
        DEX_TARGETS.map((t) =>
            cmcGetRaw("/v4/dex/spot-pairs/latest", {
                network_slug: t.network_slug,
                dex_slug: t.dex_slug,
                limit: perNetwork,
                sort: "volume_24h",
                sort_dir: "desc",
            })
        )
    );

    const pairs = [];
    attempts.forEach((result, i) => {
        if (result.status !== "fulfilled") {
            console.error(`DEX fetch failed for ${DEX_TARGETS[i].network_slug}/${DEX_TARGETS[i].dex_slug}:`, result.reason?.message);
            return;
        }
        const data = result.value;
        const arr = Array.isArray(data) ? data : data.data;
        if (Array.isArray(arr)) pairs.push(...arr);
    });

    return pairs.map((d) => {
        const q = d.quote?.[0] || {};
        return {
            id: d.contract_address,
            name: d.name,
            symbol: d.base_asset_symbol,
            raw: {
                volume_24h: q.volume_24h,
                liquidity: q.liquidity,
            },
        };
    });
}

async function getRwaListings(limit = 100) {
    const data = await cmcGetData("/v5/real-world-assets/assets/list", {
        limit,
        convert: "USD",
        sort: "tokenized_market_cap",
        sort_dir: "desc",
    });
    return data.rwa_assets.map((r) => ({
        id: `rwa-${r.rwa_id}`,
        name: r.name,
        symbol: r.symbol,
        raw: {
            tokenized_market_cap: r.tokenized_market_cap,
            tokenized_volume_24h: r.tokenized_volume_24h,
            average_tokenized_price: r.average_tokenized_price,
        },
    }));
}

module.exports = {
    getCryptoListings,
    getDerivativesExchanges,
    getDexListings,
    getRwaListings,
};
