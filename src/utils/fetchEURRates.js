// src/utils/fetchEURRates.js

import axios from "axios";

const SPREADS = {
  EURNGN: 20,
  EURUSD: .3,
  EURGBP: .4,
  EURCAD: .6,
};

export async function fetchEURRates() {
  const API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
  const BASE_URL = "https://api.exchangerate.host/live";
  const url = `${BASE_URL}?access_key=${API_KEY}&source=EUR&currencies=NGN,USD,GBP,CAD&format=1`;

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
    console.error("Error fetching EUR corridor data:", err);
    throw err;
  }
}
