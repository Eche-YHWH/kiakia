// src/utils/fetchGBPRates.js

import axios from "axios";

const SPREADS = {
  GBPNGN: 20,
  GBPUSD: .3,
  GBPEUR: .4,
  GBPCAD: .6,
};

export async function fetchGBPRates() {
  const API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
  const BASE_URL = "https://api.exchangerate.host/live";
  const url = `${BASE_URL}?access_key=${API_KEY}&source=GBP&currencies=NGN,USD,EUR,CAD&format=1`;

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
    console.error("Error fetching GBP corridor data:", err);
    throw err;
  }
}
