// src/components/Dashboard/ScientistOverview.jsx
import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ScientistOverview({ planets }) {
  const scatterData = planets
    .map((p, i) => ({
      x: Number(p.insolation || p.pl_insol || i + 1),
      y: Number(p.koi_radius || p.pl_rade || 1),
      name: p.pl_name || p.kepoi_name || `P${i + 1}`,
    }))
    .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

  return (
    <div style={{ padding: 12 }}>
      <h4 style={{ margin: 0 }}>Scientist Charts</h4>
      <div style={{ width: "100%", height: 200, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="x" name="insolation" />
            <YAxis dataKey="y" name="radius" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={scatterData} fill="#88f" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
