// src/components/Dashboard/CandidatesList.jsx
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { predictPlanetAPI } from "./api";

export default function CandidatesList({ onLoadCandidate }) {
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load CSV from public/kepler_koi.csv
    setLoading(true);
    fetch("/kepler_koi.csv")
      .then((r) => r.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Only keep CANDIDATEs
            const candidates = results.data.filter(
              (row) =>
                (row.koi_disposition === "CANDIDATE" ||
                  row.koi_pdisposition === "CANDIDATE") &&
                row.kepoi_name // must have a name
            );
            setRows(candidates);
            setFiltered(candidates); // show all by default
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        console.error("CSV load error:", err);
        setLoading(false);
        setRows([]);
        setFiltered([]);
      });
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered(rows);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        rows.filter(
          (r) =>
            (r.kepoi_name && r.kepoi_name.toLowerCase().includes(q)) ||
            (r.kepid && String(r.kepid).includes(q))
        )
      );
    }
  }, [query, rows]);

  const handlePredict = async (row) => {
    const res = await predictPlanetAPI(row);
    alert(
      `Prediction: ${res?.label ?? "error"} (prob ${res?.probability ?? "-"})`
    );
  };

  return (
    <div style={{ padding: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <input
          style={{ width: "100%", padding: "6px" }}
          placeholder="Search candidates by name or kepid..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading candidates...</div>
      ) : (
        <div
          style={{
            maxHeight: 220,
            overflowY: "auto",
            borderTop: "1px solid #222",
          }}
        >
          {filtered.length === 0 && (
            <div style={{ padding: 8 }}>No results</div>
          )}
          {filtered.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 8,
                borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>
                  {r.kepoi_name || r.kepid || "unknown"}
                </div>
                <div style={{ fontSize: 12, color: "#bbb" }}>
                  Period: {r.koi_period || r.pl_orbper || "—"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onLoadCandidate(r)}>Load</button>
                <button onClick={() => handlePredict(r)}>Predict</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
