// src/components/RateTable.jsx

import { useState } from "react";
import { fetchUSDRates } from "../utils/fetchUSDRates";
import { fetchEURRates } from "../utils/fetchEURRates";
import { fetchGBPRates } from "../utils/fetchGBPRates";
import { fetchCADRates } from "../utils/fetchCADRates";
import { fetchNGNRates } from "../utils/fetchNGNRates";

const initialCorridorData = {
  NGN: [
    { pair: "USD/NGN", liveRate: 1674.8, spread: 0, buy: 0, sell: 0 },
    { pair: "EUR/NGN", liveRate: 1829.2, spread: 0, buy: 0, sell: 0 },
    { pair: "GBP/NGN", liveRate: 2134.5, spread: 0, buy: 0, sell: 0 },
    { pair: "CAD/NGN", liveRate: 1587.7, spread: 0, buy: 0, sell: 0 },
  ],
  EUR: [
    { pair: "EUR/NGN", liveRate: 1829.2, spread: 20, buy: 1823.00, sell: 1882.60 },
    { pair: "EUR/CAD", liveRate: 0.3, spread: 0.3, buy: 1.25, sell: 1.45 },
    { pair: "EUR/USD", liveRate: 0.4, spread: 0.4, buy: 1.05, sell: 1.15 },
    { pair: "EUR/GBP", liveRate: 0.6, spread: 0.6, buy: 0.82, sell: 0.94 },
  ],
  GBP: [
    { pair: "GBP/NGN", liveRate: 2134.5, spread: 20, buy: 2143.00, sell: 2145.20 },
    { pair: "GBP/USD", liveRate: 1.3, spread: 0.3, buy: 1.25, sell: 1.35 },
    { pair: "GBP/EUR", liveRate: 1.12, spread: 0.4, buy: 1.05, sell: 1.19 },
    { pair: "GBP/CAD", liveRate: 1.7, spread: 0.6, buy: 1.61, sell: 1.79 },

  ],
  USD: [
    { pair: "USD/NGN", liveRate: 1674.0, spread: 20, buy: 1672.00, sell: 1675.00 },
    { pair: "USD/EUR", liveRate: 0.91, spread: 0.3, buy: 0.87, sell: 0.95 },
    { pair: "USD/GBP", liveRate: 0.77, spread: 0.4, buy: 0.74, sell: 0.8 },
    { pair: "USD/CAD", liveRate: 1.35, spread: 0.6, buy: 1.29, sell: 1.41 },
  ],
  CAD: [
    { pair: "CAD/NGN", liveRate: 1587.7, spread: 20, buy: 1585.00, sell: 1885.20 },
    { pair: "CAD/USD", liveRate: 0.74, spread: 0.3, buy: 0.69, sell: 0.79 },
    { pair: "CAD/EUR", liveRate: 0.65, spread: 0.4, buy: 0.61, sell: 0.69 },
    { pair: "CAD/GBP", liveRate: 0.59, spread: 0.6, buy: 0.56, sell: 0.62 },

  ],
};

function currencySymbol(base) {
  return {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
  }[base] || "";
}

function CorridorTable({ title, initialData, fetchRates }) {
  const [rows, setRows] = useState(initialData);
  const [editingIndex, setEditingIndex] = useState(null);
  const [spreadInput, setSpreadInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setSpreadInput(rows[index].spread);
  };

  const handleSave = (index) => {
    const updated = [...rows];
    const spread = parseFloat(spreadInput);
    const rate = updated[index].liveRate;
    updated[index].spread = spread;
    updated[index].buy = +(rate - spread).toFixed(2);
    updated[index].sell = +(rate + spread).toFixed(2);
    setRows(updated);
    setEditingIndex(null);
  };

  const handleFetchRates = async () => {
    if (!fetchRates) return;
    try {
      setLoading(true);
      const updated = await fetchRates();
      setRows(updated);
    } catch (err) {
      alert("Could not fetch rates.");
      console.error("Error fetching rates for:", title, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] text-white rounded-2xl shadow-lg p-6 w-full max-w-5xl mx-auto mb-8 border border-[#292929]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title} Corridor</h2>
        {fetchRates && (
          <button
            onClick={handleFetchRates}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 transition text-white py-1 px-4 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Fetch Rates"}
          </button>
        )}
      </div>
      <table className="w-full text-sm text-left">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th className="py-3">Pair</th>
            <th className="py-3">Live Rate</th>
            <th className="py-3">Spread</th>
            <th className="py-3">Buy Rate</th>
            <th className="py-3">Sell Rate</th>
            <th className="py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, i) => (
            <tr key={i} className="border-b border-gray-800 hover:bg-[#1c1c1c]">
              <td className="py-3 font-medium">{item.pair}</td>
              <td>{item.liveRate}</td>
              <td>
                {editingIndex === i ? (
                  <input
                    type="number"
                    value={spreadInput}
                    onChange={(e) => setSpreadInput(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-600 px-2 py-1 rounded text-white w-16 text-sm"
                  />
                ) : (
                  <span className="bg-orange-700 text-white text-xs py-1 px-2 rounded-md">
                    {currencySymbol(title)}{item.spread}
                  </span>
                )}
              </td>
              <td>{item.buy.toLocaleString()}</td>
              <td>{item.sell.toLocaleString()}</td>
              <td>
                {editingIndex === i ? (
                  <button
                    onClick={() => handleSave(i)}
                    className="text-sm bg-green-600 px-3 py-1 rounded-md"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(i)}
                    className="text-sm bg-[#292929] hover:bg-orange-500 hover:text-white px-3 py-1 rounded-md border border-gray-600"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-gray-500 text-xs mt-4 text-right">Last updated: just now</div>
    </div>
  );
}

export default function RateTable() {
  return (
    <div className="space-y-8">
      {Object.entries(initialCorridorData).map(([corridor, data]) => {
        let fetcher = null;

        switch (corridor) {
          case "USD":
            fetcher = fetchUSDRates;
            break;
          case "EUR":
            fetcher = fetchEURRates;
            break;
          case "GBP":
            fetcher = fetchGBPRates;
            break;
          case "CAD":
            fetcher = fetchCADRates;
            break;
          case "NGN":
            fetcher = fetchNGNRates;
            break;
        }

        return (
          <CorridorTable
            key={corridor}
            title={corridor}
            initialData={data}
            fetchRates={fetcher}
          />
        );
      })}
    </div>
  );
}
