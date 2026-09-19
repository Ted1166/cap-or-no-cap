require("dotenv").config();
const fetch = require("node-fetch");

async function main() {
    const key = process.env.CMC_API_KEY;
    if (!key) {
        console.error("Set CMC_API_KEY in backend/.env first.");
        process.exit(1);
    }

    const res = await fetch("https://pro-api.coinmarketcap.com/v5/exchange/derivatives/list?limit=2&convert=USD", {
        headers: { "X-CMC_PRO_API_KEY": key },
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}

main();