// src/components/Dashboard/PlanetInfoPanel.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { synthesizeLightCurve } from "./utils";

export default function PlanetInfoPanel({ selected, prediction }) {
  if (!selected)
    return <div style={{ padding: 12 }}>Click a planet to inspect it.</div>;

  const lc = synthesizeLightCurve(selected);
  const name =
    selected.pl_name ||
    selected.kepoi_name ||
    selected.name ||
    selected.koi_name ||
    selected.kepid;

  return (
    <div style={{ padding: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>{name}</h3>
        <div style={{ fontSize: 12, color: "#ccc" }}>
          {selected.hostname || ""}
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div>
          <strong>Period:</strong>{" "}
          {selected.pl_orbper || selected.koi_period || "—"} days
        </div>
        <div>
          <strong>Duration:</strong> {selected.koi_duration || "—"} hrs
        </div>
        <div>
          <strong>Radius:</strong>{" "}
          {selected.pl_rade || selected.koi_radius || "—"} Earth radii
        </div>
        <div>
          <strong>Insolation:</strong> {selected.insolation || "—"}
        </div>
      </div>

      {prediction && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            borderRadius: 6,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontWeight: 700 }}>
            AI Prediction: {prediction.label}
          </div>
          <div style={{ fontSize: 12, color: "#ccc" }}>
            Probability: {Number(prediction.probability).toFixed(3)}
          </div>
        </div>
      )}

      <div style={{ width: "100%", height: 140, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={lc}
            margin={{ left: 6, right: 6, top: 6, bottom: 6 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" hide />
            <YAxis domain={["dataMin - 0.05", "dataMax + 0.05"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#ff8c42"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
