// src/components/Dashboard/PlanetInfoPanel.jsx
import React from "react";
import ScientistOverview from "./ScientistOverview";
import KidsOverview from "./KidsOverview";

export default function PlanetInfoPanel({ selected, mode = "scientist" }) {
  if (!selected) return null;

  const name =
    selected.pl_name ||
    selected.kepoi_name ||
    selected.toidisplay ||
    selected.toi ||
    selected.tid ||
    selected.koi_name ||
    selected.kepid ||
    "Unknown Planet";

  return (
    <div style={{ padding: 14, marginBottom: 12 }}>
      {/* header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <h3 style={{ margin: 0 }}>{name}</h3>
        <div style={{ fontSize: 12, color: "#ccc" }}>
          {selected.hostname || ""}
        </div>
      </div>

      {/* Mode Overview */}
      {mode === "scientist" ? (
        <ScientistOverview planet={selected} />
      ) : (
        <KidsOverview planet={selected} />
      )}
    </div>
  );
}
