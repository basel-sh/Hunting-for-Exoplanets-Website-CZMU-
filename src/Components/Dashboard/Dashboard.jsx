// src/components/Dashboard/Dashboard.jsx
import React, { useState } from "react";
import planetsData from "./samplePlanets.json";
import ThreeScene from "./ThreeScene";
import PlanetInfoPanel from "./PlanetInfoPanel";
import ScientistOverview from "./ScientistOverview";
import CandidatesList from "./CandidatesList";
import { predictPlanetAPI } from "./api";
import "./dashboardStyles.css";

export default function Dashboard() {
  const [mode, setMode] = useState("kid"); // "kid" or "scientist"
  const [speed, setSpeed] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [planets, setPlanets] = useState(planetsData);

  const handleSelectPlanet = (planet) => {
    setSelected(planet);
    setPrediction(null);
    predictPlanetAPI(planet).then((res) => setPrediction(res));
  };

  // Called when user selects a candidate from CSV list
  const handleLoadCandidate = (candidate) => {
    setSelected(candidate);
    setPrediction(null);
    predictPlanetAPI(candidate).then((res) => setPrediction(res));
    // Add to 3D scene if not already present
    setPlanets((prev) => {
      if (prev.some((p) => p.kepoi_name === candidate.kepoi_name)) return prev;
      return [...prev, candidate];
    });
  };

  return (
    <div className="czmu-dashboard-root">
      {/* Left 3D area */}
      <div className="czmu-left">
        <ThreeScene
          planets={planets}
          mode={mode}
          speed={speed}
          paused={paused}
          onSelectPlanet={handleSelectPlanet}
        />
      </div>

      {/* Right panels */}
      <aside className="czmu-right">
        <div className="czmu-header">
          <h2>CZMU Dashboard</h2>
          <div className="mode-switch">
            <button
              className={mode === "kid" ? "active" : ""}
              onClick={() => setMode("kid")}
            >
              Kid
            </button>
            <button
              className={mode === "scientist" ? "active" : ""}
              onClick={() => setMode("scientist")}
            >
              Scientist
            </button>
          </div>
        </div>

        <div className="controls">
          <button onClick={() => setPaused(!paused)}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button onClick={() => setSpeed((s) => Math.max(0.1, s - 0.25))}>
            - Speed
          </button>
          <button onClick={() => setSpeed((s) => Math.min(4, s + 0.25))}>
            + Speed
          </button>
          <div className="speed-display">Speed: {speed.toFixed(2)}</div>
        </div>

        <div className="info-panel">
          {selected ? (
            <PlanetInfoPanel selected={selected} prediction={prediction} />
          ) : (
            <div className="no-select">Click a planet to inspect it</div>
          )}
        </div>

        {mode === "scientist" && (
          <div className="scientist-graphs">
            <ScientistOverview planets={planets} />
          </div>
        )}

        <div className="candidates-section">
          <h4>Candidates (CSV)</h4>
          <CandidatesList onLoadCandidate={handleLoadCandidate} />
        </div>
      </aside>
    </div>
  );
}
