// src/Components/HabitablePlanets.jsx
import React, { useState } from "react";
import "./HabitablePlanets.css";

const allPlanets = [
  { name: "Kepler-22b", distance: "600 light years", radius: "2.4 Earth radii", habitability: "Potentially habitable", description: "First confirmed potentially habitable planet discovered by Kepler mission." },
  { name: "Proxima Centauri b", distance: "4.2 light years", radius: "1.3 Earth radii", habitability: "Potentially habitable", description: "Closest exoplanet to Earth orbiting Proxima Centauri." },
  { name: "TRAPPIST-1d", distance: "40 light years", radius: "0.77 Earth radii", habitability: "Potentially habitable", description: "One of seven Earth-sized planets around TRAPPIST-1 star." },
  { name: "Kepler-442b", distance: "1200 light years", radius: "1.34 Earth radii", habitability: "Potentially habitable", description: "Located in the habitable zone with possibility of liquid water." },
  { name: "LHS 1140 b", distance: "40 light years", radius: "1.43 Earth radii", habitability: "Potentially habitable", description: "Super-Earth with rocky surface, orbiting within habitable zone." }
];

export default function HabitablePlanets() {
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const handleSeeMore = () => {
    setVisibleCount(allPlanets.length); // عرض كل الكواكب
  };

  return (
    <section className="planets-list">
      <h2>Potentially Habitable Exoplanets</h2>
      <ul>
        {allPlanets.slice(0, visibleCount).map((planet, index) => (
          <li key={index} onClick={() => setSelectedPlanet(planet)}>
            <h3>{planet.name}</h3>
            <p>Distance: {planet.distance}</p>
            <p>Radius: {planet.radius}</p>
            <p>Habitability: {planet.habitability}</p>
          </li>
        ))}
      </ul>

      {visibleCount < allPlanets.length && (
        <div className="see-more-container">
          <button onClick={handleSeeMore}>See More</button>
        </div>
      )}

      {/* Modal لتفاصيل الكوكب */}
      {selectedPlanet && (
        <div className="planet-modal" onClick={() => setSelectedPlanet(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedPlanet.name}</h2>
            <p><strong>Distance:</strong> {selectedPlanet.distance}</p>
            <p><strong>Radius:</strong> {selectedPlanet.radius}</p>
            <p><strong>Habitability:</strong> {selectedPlanet.habitability}</p>
            <p><strong>Description:</strong> {selectedPlanet.description}</p>
            <button onClick={() => setSelectedPlanet(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
