// src/utils/fetchNGNRates.js

import axios from "axios";

const SPREADS = {
  NGNEUR: 0,
  NGNUSD: 0,
  NGNGBP: 0,
  NGNCAD: 0,
};

export async function fetchNGNRates() {
  const API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
  const BASE_URL = "https://api.exchangerate.host/live";
  const url = `${BASE_URL}?access_key=${API_KEY}&source=NGN&currencies=EUR,USD,GBP,CAD&format=1`;

  try {
    const res = await axios.get(url);
    const { quotes } = res.data;

    return Object.entries(quotes).map(([pairKey, rate]) => {
      const spread = SPREADS[pairKey] || 5;
      return {
        pair: `${pairKey.slice(0, 3)}/${pairKey.slice(3)}`,
        liveRate: +rate.toFixed(2),
        spread,
        buy: +(rate - spread).toFixed(2),
        sell: +(rate + spread).toFixed(2),
      };
    });
  } catch (err) {
    console.error("Error fetching NGN corridor data:", err);
    throw err;
  }
}
