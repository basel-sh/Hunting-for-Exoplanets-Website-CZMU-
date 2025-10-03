// src/components/Dashboard/ScientistOverview.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdvancedMetrics from "./AdvancedMetrics";

const synthesizeLightCurve = (planet) => {
  const points = [];
  const period = Number(planet.koi_period || planet.pl_orbper || 10);
  const amplitude = Math.max(
    0.01,
    (planet.koi_radius || planet.pl_rade || planet.koi_prad || 1) * 0.02
  );
  for (let i = 0; i < 200; i++) {
    const x = i;
    const y =
      1 +
      amplitude *
        Math.sin((i / 200) * Math.PI * 2 * (200 / Math.max(1, period)));
    points.push({ x, y: Number(y.toFixed(4)) });
  }
  return points;
};

const synthesizeRadialVelocityCurve = (planet) => {
  const data = [];
  const N = 100;
  for (let i = 0; i < N; i++) {
    data.push({
      x: i / N,
      rv:
        Math.sin((2 * Math.PI * i) / N) *
        (planet.pl_rade ?? planet.koi_prad ?? 1) *
        10,
    });
  }
  return data;
};

export default function ScientistOverview({ planet, dataset }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const lc = useMemo(
    () => (planet ? synthesizeLightCurve(planet) : []),
    [planet]
  );
  const rvCurve = useMemo(
    () => (planet ? synthesizeRadialVelocityCurve(planet) : []),
    [planet]
  );

  const scatterData = useMemo(() => {
    if (!planet) return [];
    return dataset
      ? dataset.map((p) => ({
          x: Number(p.pl_insol ?? p.koi_insol ?? 1),
          y: Number(p.pl_rade ?? p.koi_prad ?? p.koi_radius ?? 1),
          name: p.pl_name ?? p.kepoi_name ?? "Planet",
          mission: p.mission ?? "Unknown",
        }))
      : [
          {
            x: Number(planet.pl_insol ?? planet.koi_insol ?? 1),
            y: Number(
              planet.pl_rade ?? planet.koi_prad ?? planet.koi_radius ?? 1
            ),
            name: planet.pl_name ?? planet.kepoi_name ?? "Planet",
            mission: planet.mission ?? "Unknown",
          },
        ];
  }, [dataset, planet]);

  useEffect(() => {
    setPrediction(null);
    setShowDetails(false);
  }, [planet]);

  if (!planet) return null;

  const formatNumber = (value) =>
    value != null && !isNaN(value) ? Number(value).toFixed(2) : "—";

  const buildPayload = (p) => [
    {
      mission: p.mission ?? "Kepler", // ✅ use API value
      orbital_period_days: Number(p.pl_orbper ?? p.koi_period ?? 0),
      transit_duration_hours: Number(p.pl_trandurh ?? p.koi_duration ?? 0.1),
      transit_depth_ppm: p.pl_trandep ?? p.koi_depth ?? null,
      planet_radius_rearth: Number(
        p.pl_rade ?? p.koi_prad ?? p.koi_radius ?? 1
      ),
      impact_param: Number(p.koi_impact ?? p.pl_impact ?? 0),
      snr: Number(p.koi_snr ?? p.koi_model_snr ?? 0),
      stellar_teff_k: p.st_teff ?? p.koi_steff ?? null,
      stellar_logg_cgs: p.st_logg ?? p.koi_slogg ?? null,
      stellar_radius_rsun: p.st_rad ?? p.koi_srad ?? null,
      stellar_metallicity: Number(p.st_met ?? p.koi_smet ?? 0),
      fpflag_nt: Number(p.fpflag_nt ?? p.koi_fpflag_nt ?? 0),
      fpflag_ss: Number(p.fpflag_ss ?? p.koi_fpflag_ss ?? 0),
      fpflag_co: Number(p.fpflag_co ?? p.koi_fpflag_co ?? 0),
      fpflag_ec: Number(p.fpflag_ec ?? p.koi_fpflag_ec ?? 0),
    },
  ];

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

  const prob = prediction?.predictions?.[0]?.prob_planet ?? 0;
  const status =
    prob >= 0.9
      ? "✅ Confirmed"
      : prob <= 0.4
      ? "❌ False Positive"
      : "⚠️ Undecided";

  return (
    <div
      style={{
        padding: 18,
        display: "grid",
        gap: 22,
        background: "rgba(20,20,30,0.75)",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ margin: 0, color: "#ff8c42" }}>
          {planet.pl_name ?? planet.kepoi_name ?? "Unknown Planet"}
        </h3>
        <div style={{ fontSize: 12, color: "#aaa" }}>
          Mission: {planet.mission ?? "Unknown"} {/* ✅ use mission */}
        </div>
        {/* Predict button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            marginTop: 6,
            padding: "8px 18px",
            background: "#ff8c42",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            alignSelf: "start",
            boxShadow: "0 0 15px rgba(255,140,66,0.5)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 0 25px rgba(255,140,66,0.8)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = "0 0 15px rgba(255,140,66,0.5)")
          }
        >
          {loading ? "Predicting..." : "🔮 Predict Planet"}
        </button>
      </div>

      {/* Prediction Card */}
      {prediction && (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "rgba(40,40,50,0.6)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            color: "#fff",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <strong>Status:</strong> {status}
            </div>
            <div
              style={{
                flex: 2,
                height: 18,
                background: "#333",
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${prob * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#4caf50,#ffeb3b)",
                  borderRadius: 10,
                  transition: "width 0.5s",
                }}
              />
            </div>
            <div style={{ width: 45, textAlign: "right" }}>
              {(prob * 100).toFixed(1)}%
            </div>
          </div>
          <button
            onClick={() => setShowDetails((s) => !s)}
            style={{
              marginTop: 6,
              padding: "4px 8px",
              fontSize: 12,
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              width: 140,
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

      {/* Planet Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 14,
          padding: 14,
          borderRadius: 12,
          background: "rgba(30,30,40,0.6)",
          color: "#ddd",
        }}
      >
        <div>
          <strong>Name</strong>
          <div>{planet.pl_name ?? planet.kepoi_name ?? "—"}</div>
        </div>
        <div>
          <strong>Radius</strong>
          <div>
            {formatNumber(
              planet.pl_rade ?? planet.koi_prad ?? planet.koi_radius
            )}{" "}
            🌍
          </div>
        </div>
        <div>
          <strong>Insolation</strong>
          <div>
            {formatNumber(
              planet.pl_insol ?? planet.koi_insol ?? planet.insolation
            )}{" "}
            ☀️
          </div>
        </div>
        <div>
          <strong>Period</strong>
          <div>{formatNumber(planet.pl_orbper ?? planet.koi_period)} days</div>
        </div>
        <div>
          <strong>Transit Depth</strong>
          <div>{formatNumber(planet.pl_trandep ?? planet.koi_depth)} ppm</div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <AdvancedMetrics
        planet={planet}
        lc={lc}
        rvCurve={rvCurve}
        scatterData={scatterData}
      />
    </div>
  );
}
