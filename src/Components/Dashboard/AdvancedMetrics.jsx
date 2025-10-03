import React, { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export default function AdvancedMetrics({ planet, lc, rvCurve, scatterData }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  if (!planet) return null;

  // Prepare histogram data for radius and period
  const radiusHistogram = scatterData
    ? scatterData.map((p) => ({ name: p.name, radius: p.y }))
    : [];
  const periodHistogram = scatterData
    ? scatterData.map((p) => ({
        name: p.name,
        period: p.period ?? 1,
      }))
    : [];

  return (
    <>
      <button
        onClick={() => setShowAdvanced(true)}
        style={{
          marginTop: 14,
          padding: "6px 12px",
          fontSize: 12,
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        Show Advanced Metrics
      </button>

      {showAdvanced && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "95%",
              height: "95%",
              backgroundColor: "#111",
              borderRadius: 12,
              padding: 20,
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowAdvanced(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: "4px 8px",
                background: "#ff4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <h2 style={{ color: "#ff8c42", marginBottom: 20 }}>
              Advanced Metrics & Graphs
            </h2>

            {/* Light Curve + Radial Velocity */}
            <div style={{ width: "100%", height: 300, marginBottom: 30 }}>
              <ResponsiveContainer>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="x" stroke="#ccc" />
                  <YAxis
                    stroke="#ccc"
                    domain={["dataMin - 0.05", "dataMax + 0.05"]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#222", border: "none" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    data={lc}
                    dataKey="y"
                    stroke="#ff8c42"
                    dot={false}
                    strokeWidth={2}
                    name="Light Curve"
                  />
                  <Line
                    type="monotone"
                    data={rvCurve}
                    dataKey="rv"
                    stroke="#42a5ff"
                    dot={false}
                    strokeWidth={2}
                    name="Radial Velocity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter Plot: Insolation vs Radius */}
            <div style={{ width: "100%", height: 300, marginBottom: 30 }}>
              <ResponsiveContainer>
                <ScatterChart>
                  <CartesianGrid stroke="#444" />
                  <XAxis
                    dataKey="x"
                    name="Insolation (Earth)"
                    stroke="#ccc"
                    type="number"
                  />
                  <YAxis
                    dataKey="y"
                    name="Radius (Earth)"
                    stroke="#ccc"
                    type="number"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ backgroundColor: "#222", border: "none" }}
                    formatter={(value, name, props) => [
                      value,
                      name === "x" ? "Insolation" : "Radius",
                    ]}
                  />
                  <Scatter
                    data={scatterData}
                    fill="#88f"
                    name="Planets"
                    shape="circle"
                  />
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Radius Histogram */}
            <div style={{ width: "100%", height: 250, marginBottom: 30 }}>
              <ResponsiveContainer>
                <BarChart data={radiusHistogram}>
                  <CartesianGrid stroke="#444" />
                  <XAxis dataKey="name" stroke="#ccc" hide />
                  <YAxis stroke="#ccc" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#222", border: "none" }}
                  />
                  <Bar dataKey="radius" fill="#ff8c42" name="Radius (Earth)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Add more graphs: example Period Histogram */}
            <div style={{ width: "100%", height: 250, marginBottom: 30 }}>
              <ResponsiveContainer>
                <BarChart data={periodHistogram}>
                  <CartesianGrid stroke="#444" />
                  <XAxis dataKey="name" stroke="#ccc" hide />
                  <YAxis stroke="#ccc" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#222", border: "none" }}
                  />
                  <Bar
                    dataKey="period"
                    fill="#42a5ff"
                    name="Orbital Period (days)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Raw Data Toggle */}
            <button
              onClick={() => setShowRawData((s) => !s)}
              style={{
                marginTop: 12,
                padding: "6px 12px",
                fontSize: 12,
                background: "#444",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {showRawData ? "Hide Raw Data" : "Show Raw Data"}
            </button>

            {showRawData && (
              <pre
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  background: "#222",
                  padding: 12,
                  borderRadius: 6,
                  overflowX: "auto",
                  color: "#fff",
                }}
              >
                {JSON.stringify(planet, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </>
  );
}
