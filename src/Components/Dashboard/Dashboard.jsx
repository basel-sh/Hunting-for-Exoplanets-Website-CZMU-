import React, { useState, useEffect } from "react";
import ThreeScene from "./ThreeScene";
import PlanetInfoPanel from "./PlanetInfoPanel";
import ScientistOverview from "./ScientistOverview";
import CandidatesList from "./CandidatesList";
import "./dashboardStyles.css";

export default function Dashboard({ initialPlanets = [] }) {
  const [mode, setMode] = useState("kid");
  const [speed, setSpeed] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [planets, setPlanets] = useState(initialPlanets);

  // Warning state with countdown
  const [warning, setWarning] = useState({ message: "", count: 0 });

  const handleLoadCandidate = (candidate) => {
    if (planets.length >= 2) {
      setWarning({
        message:
          "⚠️ You can only render 2 samples at a time. Unload one to add another.",
        count: 3, // countdown in seconds
      });
      return;
    }
    setPlanets((prev) => {
      if (prev.some((p) => p.kepoi_name === candidate.kepoi_name)) return prev;
      return [...prev, candidate];
    });
  };

  const handleUnloadCandidate = (candidate) => {
    setPlanets((prev) =>
      prev.filter((p) => p.kepoi_name !== candidate.kepoi_name)
    );
  };

  // Countdown effect
  useEffect(() => {
    if (warning.count <= 0) return;
    const timer = setInterval(() => {
      setWarning((prev) => ({ ...prev, count: prev.count - 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [warning.count]);

  const closeWarning = () => setWarning({ message: "", count: 0 });

  return (
    <div className="czmu-dashboard-root">
      <div className="czmu-left">
        <ThreeScene
          planets={planets}
          mode={mode}
          speed={speed}
          paused={paused}
          onSelectPlanet={() => {}}
        />

        {/* Warning with countdown and close button */}
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
          {planets.length === 0 && (
            <div className="no-select">Load a planet to inspect it</div>
          )}
          {planets.length === 1 && <PlanetInfoPanel selected={planets[0]} />}
          {planets.length === 2 && (
            <div className="comparison">
              <PlanetInfoPanel selected={planets[0]} />
              <PlanetInfoPanel selected={planets[1]} />
            </div>
          )}
        </div>

        {mode === "scientist" && (
          <div className="scientist-graphs">
            <ScientistOverview planets={planets} />
          </div>
        )}

        <div className="candidates-section">
          <h4>Candidates (CSV)</h4>
          <CandidatesList
            loadedPlanets={planets}
            onLoadCandidate={handleLoadCandidate}
            onUnloadCandidate={handleUnloadCandidate}
          />
        </div>
      </aside>
    </div>
  );
}
