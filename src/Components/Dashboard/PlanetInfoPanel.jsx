// src/components/Dashboard/PlanetInfoPanel.jsx
import React from "react";
import ScientistOverview from "./ScientistOverview";
import KidsOverview from "./KidsOverview";

export default function PlanetInfoPanel({
  selected,
  mode = "scientist",
  hideTitle = false,
  totalPlanets = 1, // new prop to pass total loaded planets
  maxPlanets = 2, // optional max limit
}) {
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
      {!hideTitle ? (
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
      ) : mode === "scientist" ? (
        <div
          style={{
            marginBottom: 10,
            padding: 8,
            fontSize: 12,
            color: "#888",
            fontStyle: "italic",
            borderLeft: "3px solid #aaa",
          }}
        >
          {totalPlanets
            ? `${totalPlanets} planet${
                totalPlanets > 1 ? "s" : ""
              } loaded (max ${maxPlanets}).`
            : "Planet data loaded."}{" "}
          In scientist mode, you can analyze detailed planetary properties.
        </div>
      ) : null}

      {/* Mode Overview */}
      {mode === "scientist" ? (
        <ScientistOverview planet={selected} />
      ) : (
        <KidsOverview planet={selected} />
      )}
    </div>
  );
}
