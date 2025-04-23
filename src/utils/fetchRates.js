// src/utils/fetchRates.js

import axios from "axios";

const SPREADS = {
  USDNGN: 20,
  GBPNGN: 30,
  EURNGN: 25,
  CADNGN: 15,
  EURCAD: 10,
  EURUSD: 8,
  EURGBP: 6,
  GBPUSD: 5,
  GBPEUR: 7,
  GBPCAD: 9,
  USDEUR: 4,
  USDGBP: 3,
  USDCAD: 6,
  CADUSD: 5,
  CADEUR: 4,
  CADGBP: 3,
};

const SUPPORTED_PAIRS = {
  NGN: ["USD", "GBP", "EUR", "CAD"],
  EUR: ["NGN", "GBP", "USD", "CAD"],
  GBP: ["NGN", "EUR", "USD", "CAD"],
  USD: ["NGN", "EUR", "GBP", "CAD"],
  CAD: ["NGN", "USD", "EUR", "GBP"],
};

export async function fetchRatesForCorridor(corridor) {
  const API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
  const BASE_URL = "https://api.exchangerate.host/live";

  const pairs = SUPPORTED_PAIRS[corridor];
  if (!pairs) {
    throw new Error("Unsupported corridor (only NGN base supported via /live)");
  }

  const url = `${BASE_URL}?access_key=${API_KEY}&source=USD&currencies=NGN,GBP,EUR,CAD&format=1`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    if (!data.quotes) {
      console.error("API response missing 'quotes'", data);
      throw new Error("Exchange rate API did not return expected data.");
    }

    const quotes = data.quotes;

    const results = pairs.map((from) => {
      const key = from + corridor;
      const rate = quotes[key];
      const spread = Number(SPREADS[key] || 5);

      if (!rate) return null;

      return {
        pair: `${from}/${corridor}`,
        liveRate: +rate.toFixed(2),
        spread,
        buy: +(rate - spread).toFixed(2),
        sell: +(rate + spread).toFixed(2),
      };
    });

    return results.filter(Boolean);
  } catch (err) {
    console.error("Error fetching data from /live:", err);
    throw err;
  }
}
