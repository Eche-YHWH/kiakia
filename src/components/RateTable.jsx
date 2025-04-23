import { useState } from "react";
import { fetchRatesForCorridor } from "../utils/fetchRates";

const initialCorridorData = {
  NGN: [
    { pair: "USD/NGN", liveRate: 16740, spread: 20, buy: 167200, sell: 167500 },
    { pair: "EUR/NGN", liveRate: 18292, spread: 10, buy: 182300, sell: 188260 },
    { pair: "GBP/NGN", liveRate: 21345, spread: 30, buy: 214300, sell: 214520 },
    { pair: "CAD/NGN", liveRate: 15877, spread: 15, buy: 158500, sell: 188520 },
  ],
  EUR: [
    { pair: "EUR/NGN", liveRate: 18292, spread: 10, buy: 182300, sell: 188260 },
    { pair: "EUR/CAD", liveRate: 1.35, spread: 10, buy: 1.25, sell: 1.45 },
    { pair: "EUR/USD", liveRate: 1.1, spread: 8, buy: 1.05, sell: 1.15 },
    { pair: "EUR/GBP", liveRate: 0.88, spread: 6, buy: 0.82, sell: 0.94 },
  ],
  GBP: [
    { pair: "GBP/NGN", liveRate: 21345, spread: 30, buy: 214300, sell: 214520 },
    { pair: "GBP/USD", liveRate: 1.3, spread: 5, buy: 1.25, sell: 1.35 },
    { pair: "GBP/EUR", liveRate: 1.12, spread: 7, buy: 1.05, sell: 1.19 },
    { pair: "GBP/CAD", liveRate: 1.7, spread: 9, buy: 1.61, sell: 1.79 },
  ],
  USD: [
    { pair: "USD/NGN", liveRate: 16740, spread: 20, buy: 167200, sell: 167500 },
    { pair: "USD/EUR", liveRate: 0.91, spread: 4, buy: 0.87, sell: 0.95 },
    { pair: "USD/GBP", liveRate: 0.77, spread: 3, buy: 0.74, sell: 0.8 },
    { pair: "USD/CAD", liveRate: 1.35, spread: 6, buy: 1.29, sell: 1.41 },
  ],
  CAD: [
    { pair: "CAD/NGN", liveRate: 15877, spread: 15, buy: 158500, sell: 188520 },
    { pair: "CAD/USD", liveRate: 0.74, spread: 5, buy: 0.69, sell: 0.79 },
    { pair: "CAD/EUR", liveRate: 0.65, spread: 4, buy: 0.61, sell: 0.69 },
    { pair: "CAD/GBP", liveRate: 0.59, spread: 3, buy: 0.56, sell: 0.62 },
  ],
};

function currencySymbol(corridor) {
  const map = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
  };
  return map[corridor] || "";
}

function CorridorTable({ title, initialData }) {
  const [rows, setRows] = useState(initialData);
  const [editingIndex, setEditingIndex] = useState(null);
  const [spreadInput, setSpreadInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [spreadMap, setSpreadMap] = useState(
    Object.fromEntries(initialData.map((item) => [item.pair, item.spread]))
  );

  const handleEdit = (index) => {
    setEditingIndex(index);
    setSpreadInput(rows[index].spread);
  };

  const handleSave = (index) => {
    const updated = [...rows];
    const spread = parseFloat(spreadInput);
    updated[index].spread = spread;
    updated[index].buy = +(updated[index].liveRate - spread).toFixed(2);
    updated[index].sell = +(updated[index].liveRate + spread).toFixed(2);
    setRows(updated);
    setSpreadMap((prev) => ({ ...prev, [updated[index].pair]: spread }));
    setEditingIndex(null);
  };

  const handleFetchRates = async () => {
    try {
      setLoading(true);
      const updatedRates = await fetchRatesForCorridor(title);

      const merged = updatedRates.map((item) => {
        const preservedSpread = spreadMap[item.pair] ?? item.spread;
        return {
          ...item,
          spread: preservedSpread,
          buy: +(item.liveRate - preservedSpread).toFixed(2),
          sell: +(item.liveRate + preservedSpread).toFixed(2),
        };
      });

      setRows(merged);
    } catch (err) {
      console.error("Error fetching corridor data:", err);
      alert("Could not fetch rates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] text-white rounded-2xl shadow-lg p-6 w-full max-w-5xl mx-auto mb-8 border border-[#292929]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title} Corridor</h2>
        <button
          onClick={handleFetchRates}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 transition text-white py-1 px-4 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Fetch Rates"}
        </button>
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
      <div className="text-gray-500 text-xs mt-4 text-right">
        Last updated: just now
      </div>
    </div>
  );
}

export default function RateTable() {
  return (
    <div className="space-y-8">
      {Object.entries(initialCorridorData).map(([corridor, data]) => (
        <CorridorTable key={corridor} title={corridor} initialData={data} />
      ))}
    </div>
  );
}
