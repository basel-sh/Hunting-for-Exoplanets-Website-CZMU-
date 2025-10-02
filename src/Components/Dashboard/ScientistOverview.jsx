// src/components/Dashboard/ScientistOverview.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "recharts";
import { synthesizeLightCurve } from "./utils";

export default function ScientistOverview({ planet }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setPrediction(null);
    setShowDetails(false);
  }, [planet]);

  if (!planet) return null;

  const getId = (p) =>
    p.kepoi_name ||
    p.toidisplay ||
    p.toi ||
    p.tid ||
    p.koi_name ||
    p.kepid ||
    `${p.pl_orbper ?? ""}-${p.pl_rade ?? ""}`;

  const buildPayload = (p) => {
    const mission = p.toidisplay || p.toi || p.tid ? "TESS" : "Kepler";
    return [
      {
        mission,
        orbital_period_days: Number(p.pl_orbper ?? p.koi_period ?? 0),
        transit_duration_hours: Number(p.pl_trandurh ?? p.koi_duration ?? 0.1),
        transit_depth_ppm:
          p.pl_trandep != null
            ? Number(p.pl_trandep)
            : p.koi_depth != null
            ? Number(p.koi_depth)
            : null,
        planet_radius_rearth: Number(
          p.pl_rade ?? p.koi_prad ?? p.koi_radius ?? 1
        ),
        impact_param: Number(p.koi_impact ?? p.pl_impact ?? 0) || 0,
        snr: Number(p.koi_snr ?? p.koi_model_snr ?? 0) || 0,
        stellar_teff_k: p.st_teff != null ? Number(p.st_teff) : null,
        stellar_logg_cgs: p.st_logg != null ? Number(p.st_logg) : null,
        stellar_radius_rsun: p.st_rad != null ? Number(p.st_rad) : null,
        stellar_metallicity: Number(p.st_met ?? p.koi_smet ?? 0) || 0,
        fpflag_nt: Number(p.fpflag_nt ?? 0),
        fpflag_ss: Number(p.fpflag_ss ?? 0),
        fpflag_co: Number(p.fpflag_co ?? 0),
        fpflag_ec: Number(p.fpflag_ec ?? 0),
      },
    ];
  };

  const handlePredict = async () => {
    if (!planet) return;
    setLoading(true);
    setPrediction(null);

    try {
      const payload = buildPayload(planet);
      const res = await axios.post(
        "https://engbasel-kepler-ml-datasets.hf.space/predict_json",
        payload,
        { headers: { "Content-Type": "application/json" }, timeout: 20000 }
      );
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction failed:", err);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const lc = synthesizeLightCurve(planet);

  // scatter data for context
  const scatterData = [
    {
      x: Number(planet.insolation || planet.pl_insol || 1),
      y: Number(planet.koi_radius || planet.pl_rade || 1),
      name: planet.pl_name || planet.kepoi_name || "Planet",
    },
  ];

  return (
    <div style={{ padding: 12 }}>
      <h4 style={{ margin: 0 }}>🔬 Scientist Overview</h4>

      {/* Predict button */}
      <div style={{ margin: "10px 0" }}>
        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            padding: "6px 12px",
            background: "#ff8c42",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Predicting..." : "🔮 Predict"}
        </button>
      </div>

      {/* Prediction result */}
      {prediction && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
          }}
        >
          🌍 <strong>Planet Probability:</strong>{" "}
          {prediction.predictions?.[0]?.prob_planet != null
            ? `${(prediction.predictions[0].prob_planet * 100).toFixed(2)}%`
            : "—"}
          <br />
          🏷️ <strong>Final Label:</strong>{" "}
          {prediction.predictions?.[0]?.final_label ?? "—"}
          <br />
          <button
            onClick={() => setShowDetails((s) => !s)}
            style={{
              marginTop: 6,
              padding: "4px 8px",
              fontSize: 12,
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {showDetails ? "Hide Full Data" : "Show Full Data"}
          </button>
          {showDetails && (
            <pre
              style={{
                marginTop: 8,
                fontSize: 12,
                background: "#111",
                padding: 8,
                borderRadius: 6,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(prediction, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Scatter chart */}
      <div style={{ width: "100%", height: 200, marginTop: 14 }}>
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

      {/* Light curve */}
      <div style={{ width: "100%", height: 160, marginTop: 14 }}>
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
