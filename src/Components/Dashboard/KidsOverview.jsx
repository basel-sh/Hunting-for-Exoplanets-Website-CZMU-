import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const randomEmoji = (emojis) =>
  emojis[Math.floor(Math.random() * emojis.length)];

const randomFact = (planet) => {
  const facts = [
    planet.pl_rade > 10 &&
      "Whoa! This planet is HUGE compared to Earth! 🌍➡️🪐",
    planet.pl_rade < 1 && "Tiny but mighty! Smaller than Earth! 🐜🪐",
    planet.pl_orbper < 50 && "Zoom! Orbits super fast! ⚡",
    planet.pl_orbper > 300 && "Slow and steady… takes forever! 🐢",
    planet.koi_disposition === "habitable" &&
      "Could humans live here someday? 🏡",
    planet.pl_eqtemp && planet.pl_eqtemp < 0 && "Brrr! Freezing! ❄️",
    planet.pl_eqtemp &&
      planet.pl_eqtemp > 100 &&
      "Hot enough to fry an egg! 🔥🥚",
    "Astronomers are observing this planet closely! 🔭",
  ].filter(Boolean);
  return facts[Math.floor(Math.random() * facts.length)];
};

const randomBadge = () => {
  const badges = [
    { label: "⭐ Surprise Badge! Rare Planet!", chance: 0.3, color: "#FF69B4" },
    { label: "🌟 Ultra-Rare Discovery!", chance: 0.1, color: "#FFD700" },
    { label: "💫 Cosmic Explorer Award!", chance: 0.15, color: "#7FFFD4" },
    { label: "🌌 Mystery Badge!", chance: 0.05, color: "#8A2BE2" },
  ];
  return badges.find((b) => Math.random() < b.chance) || null;
};

// Confetti animation (only for AI confirmed)
const Confetti = ({ count = 20 }) =>
  Array.from({ length: count }).map((_, i) => (
    <span
      key={i}
      style={{
        position: "absolute",
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: Math.random() * 16 + 8,
        color: ["#FFD700", "#FF69B4", "#7FFFD4", "#FFB347"][
          Math.floor(Math.random() * 4)
        ],
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `confetti-fall ${3 + Math.random() * 2}s infinite linear`,
      }}
    >
      ✨
    </span>
  ));

export default function KidsOverview({ planet }) {
  const [hovered, setHovered] = useState(false);
  const [spin, setSpin] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const navigate = useNavigate();

  const planetEmoji = useMemo(
    () => randomEmoji(["🪐", "🌕", "🌟", "💫", "🌑"]),
    [planet, prediction]
  );
  const funFact = useMemo(
    () => (planet ? randomFact(planet) : ""),
    [planet, prediction]
  );
  const highlightColor = useMemo(() => {
    const colors = ["#FFD700", "#FF69B4", "#7FFFD4", "#FFB347", "#87CEEB"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, [planet, prediction]);
  const badge = useMemo(() => randomBadge(), [planet, prediction]);

  if (!planet) return null;

  const name =
    planet.pl_name || planet.kepoi_name || planet.toidisplay || "This Planet";
  const radius = planet.pl_rade ?? planet.koi_prad ?? "?";
  const period = planet.pl_orbper ?? planet.koi_period ?? "?";

  // ✅ Fix undefined temperature/distance
  const temperatureRaw = planet.pl_eqtemp ?? planet.koi_teq;
  const temperature =
    temperatureRaw !== undefined && temperatureRaw !== null
      ? temperatureRaw
      : "?";

  const distanceRaw = planet.pl_orbsmax ?? planet.koi_sma;
  const distance =
    distanceRaw !== undefined && distanceRaw !== null ? distanceRaw : "?";

  // Default status
  let status = planet.koi_disposition || "Candidate";
  let statusEmoji = status === "habitable" ? "✅" : "⚠️";
  let statusColor = status === "habitable" ? "#7CFC00" : "#FFD700";

  // AI prediction
  const predLabel = prediction?.predictions?.[0]?.final_label;
  const showConfetti = predLabel === "CONFIRMED(model)";
  const showFalsePositive = predLabel === "FALSE_POSITIVE(model)";
  const showUndecided = predLabel === "UNDECIDED";

  if (predLabel) {
    status = predLabel.replace("_model", "").replace("_", " ");
    statusEmoji =
      predLabel === "CONFIRMED(model)"
        ? "✅"
        : predLabel === "FALSE_POSITIVE(model)"
        ? "❌"
        : "⚠️";
    statusColor =
      predLabel === "CONFIRMED(model)"
        ? "#7CFC00"
        : predLabel === "FALSE_POSITIVE(model)"
        ? "#FF6347"
        : "#FFD700";
  }

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
    setLoadingPrediction(true);
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
      setLoadingPrediction(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 20,
        borderRadius: 16,
        border: `2px solid ${highlightColor}`,
        background: hovered
          ? showFalsePositive
            ? "#2f2f3f"
            : `linear-gradient(135deg, #1e1e2f, ${highlightColor}33)`
          : "#1e1e2f",
        color: "#fff",
        maxWidth: 420,
        fontFamily: "Comic Sans MS, Comic Neue, sans-serif",
        boxShadow: `0 0 20px ${highlightColor}`,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {showConfetti && <Confetti count={25} />}

      <h3 style={{ margin: "0 0 8px 0", textAlign: "center" }}>
        {planetEmoji} Planet Overview {planetEmoji}
      </h3>

      <p>
        Meet <strong>{name}</strong>! {randomEmoji(["🌍", "🚀", "🛸", "🛰️"])}
      </p>

      <p>
        It takes <strong>{period}</strong> days to orbit its star and is{" "}
        <strong>{radius}</strong> times the size of Earth.
      </p>

      <p style={{ fontStyle: "italic", color: "#FFD700" }}>{funFact}</p>

      <div style={{ marginTop: 14, lineHeight: 1.6 }}>
        <div>
          🌡️ Temperature: <strong>{temperature}°C</strong>
        </div>
        <div>
          🌌 Distance from star: <strong>{distance} AU</strong>
        </div>
        <div>
          🧪 Status:{" "}
          <strong style={{ color: statusColor }}>
            {statusEmoji} {status}
          </strong>
        </div>

        {prediction && prediction.predictions?.[0] && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              background: "#111",
              borderRadius: 8,
            }}
          >
            🤖 <strong>AI Prediction:</strong>{" "}
            {(prediction.predictions[0].prob_planet * 100).toFixed(2)}%{" "}
            {predLabel}
            <br />
            <em
              style={{
                color:
                  predLabel === "CONFIRMED(model)"
                    ? "#7CFC00"
                    : predLabel === "FALSE_POSITIVE(model)"
                    ? "#FFA500"
                    : "#FFD700",
              }}
            >
              {predLabel === "CONFIRMED(model)" &&
                "🎉 Wow! The AI says this is a planet! 🪐"}
              {predLabel === "FALSE_POSITIVE(model)" &&
                "Hmm… the AI says this is not a planet! Maybe a cosmic trickster! 😜"}
              {predLabel === "UNDECIDED" &&
                "🌌 The AI isn’t sure yet… keep observing this candidate!"}
            </em>
          </div>
        )}
      </div>

      <div
        onClick={() => setSpin(!spin)}
        style={{
          marginTop: 14,
          cursor: "pointer",
          display: "inline-block",
          transform: spin ? "rotate(360deg)" : "rotate(0deg)",
          transition: "transform 1s",
          fontSize: 32,
        }}
      >
        {showFalsePositive ? "☄️" : showUndecided ? "❔" : planetEmoji}
      </div>

      <div style={{ marginTop: 14 }}>
        <button
          onClick={handlePredict}
          disabled={loadingPrediction}
          style={{
            marginRight: 10,
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#00BFFF",
            color: "#1e1e2f",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 0 8px #00BFFF",
          }}
        >
          {loadingPrediction ? "Predicting..." : "🔮 Predict Planet Status"}
        </button>

        <button
          onClick={() => window.open("/game", "_blank")}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#FFB347",
            color: "#1e1e2f",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 0 8px #FFB347",
            marginTop: 13,
          }}
        >
          🎮 Play the Planet Quiz Game!
        </button>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity:1;}
          100% { transform: translateY(120%) rotate(360deg); opacity:0;}
        }
      `}</style>
    </div>
  );
}
