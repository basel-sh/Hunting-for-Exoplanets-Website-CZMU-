import React, { useState, useEffect } from "react";
import ThreeScene from "./ThreeScene";
import PlanetInfoPanel from "./PlanetInfoPanel";
import ScientistOverview from "./ScientistOverview";
import CandidatesList from "./CandidatesList";
import { fetchKeplerCandidatesAPI, fetchTESSCandidatesAPI } from "./api";
import "./dashboardStyles.css";

export default function Dashboard({ initialPlanets = [] }) {
  const [mode, setMode] = useState("kid");
  const [speed, setSpeed] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [planets, setPlanets] = useState(initialPlanets);
  const [warning, setWarning] = useState({ message: "", count: 0 });

  // Load a candidate
  const handleLoadCandidate = (candidate) => {
    if (planets.length >= 2) {
      setWarning({
        message:
          "⚠️ You can only render 2 samples at a time. Unload one to add another.",
        count: 3,
      });
      return;
    }
    setPlanets((prev) =>
      prev.some((p) => p.kepoi_name === candidate.kepoi_name)
        ? prev
        : [...prev, candidate]
    );
  };

  // Unload candidate
  const handleUnloadCandidate = (candidate) => {
    setPlanets((prev) =>
      prev.filter((p) => p.kepoi_name !== candidate.kepoi_name)
    );
  };

  // Warning countdown
  useEffect(() => {
    if (warning.count <= 0) return;
    const timer = setInterval(() => {
      setWarning((prev) => ({ ...prev, count: prev.count - 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [warning.count]);

  const closeWarning = () => setWarning({ message: "", count: 0 });

  return (
    <div className={`czmu-dashboard-root ${mode}`}>
      {/* LEFT SIDE (3D Scene) */}
      <div className="czmu-left">
        <ThreeScene
          planets={planets}
          mode={mode}
          speed={speed}
          paused={paused}
          onSelectPlanet={() => {}}
        />

        {warning.count > 0 && (
          <div className="czmu-warning">
            <span>{warning.message}</span>
            <span className="countdown">{warning.count}</span>
            <button className="close-btn" onClick={closeWarning}>
              ×
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDE PANEL */}
      <aside className="czmu-right">
        {/* Header */}
        <div className="czmu-header">
          <h2 className="czmu-title">
            {mode === "kid"
              ? "🤩 CZMU Space Playground"
              : "🔬 CZMU Research Lab"}
          </h2>
          <div className="mode-switch">
            <button
              className={mode === "kid" ? "active" : ""}
              onClick={() => setMode("kid")}
            >
              Kid Mode 🌟
            </button>
            <button
              className={mode === "scientist" ? "active" : ""}
              onClick={() => setMode("scientist")}
            >
              Scientist Mode 📊
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <button onClick={() => setPaused(!paused)}>
            {paused ? "▶️ Resume" : "⏸️ Pause"}
          </button>

          {/* Improved Speed Control */}
          <div className="speed-control">
            <label>🎚️ Simulation Speed</label>
            <input
              type="range"
              min="0.1"
              max="4"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
            <div className="speed-display">
              ⚡ <strong>{speed.toFixed(2)}x</strong>
            </div>
          </div>
        </div>

        {/* Kid storytelling */}
        {mode === "kid" && (
          <div className="kid-story">
            <p>🚀 Explore planets and earn badges!</p>
            <div className="badges">
              <span className="badge">🌍 Explorer</span>
              <span className="badge">🔭 Discoverer</span>
              <span className="badge">👩‍🔬 Scientist</span>
            </div>
          </div>
        )}

        {/* Planet Info Panel */}
        <div className="info-panel">
          {planets.length === 0 && (
            <div className="no-select">
              {mode === "kid"
                ? "🌌 Load a planet and hear its story!"
                : "Load a planet to inspect it"}
            </div>
          )}

          {planets.length >= 1 && (
            <div className={planets.length === 2 ? "comparison" : ""}>
              {planets.map((planet) => (
                <PlanetInfoPanel
                  key={planet.kepoi_name}
                  selected={planet}
                  mode={mode}
                  hideTitle={true} // <-- new prop to hide the title
                />
              ))}
            </div>
          )}
        </div>

        {/* Scientist Overview */}
        {mode === "scientist" && (
          <div className="scientist-graphs">
            <ScientistOverview planets={planets} />
          </div>
        )}

        {/* Candidate Lists */}
        <div className="candidates-section">
          <CandidatesList
            listTitle="Kepler Candidates"
            fetchCandidates={fetchKeplerCandidatesAPI}
            loadedPlanets={planets}
            onLoadCandidate={handleLoadCandidate}
            onUnloadCandidate={handleUnloadCandidate}
            mode={mode}
          />
          <CandidatesList
            listTitle="TESS Candidates"
            fetchCandidates={fetchTESSCandidatesAPI}
            loadedPlanets={planets}
            onLoadCandidate={handleLoadCandidate}
            onUnloadCandidate={handleUnloadCandidate}
            mode={mode}
          />
        </div>
      </aside>
    </div>
  );
}
