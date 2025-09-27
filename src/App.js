import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./Components/Footer";
import Dashboard from "./Components/Dashboard/Dashboard";
import Navbar from "./Components/Header";
import Home from "./Home";
import Storytelling from "./Components/Storytelling";
import PlanetGame from "./Components/PlanetGame";

export default function App() {
  const location = useLocation(); // ✅ get current route

  const gamePlanets = [
    {
      name: "Kepler-22b",
      habitable: true,
      radius: "2.4 Earth radii",
      distance: "600 ly",
    },
    {
      name: "Proxima Centauri b",
      habitable: true,
      radius: "1.3 Earth radii",
      distance: "4.2 ly",
    },
    {
      name: "TRAPPIST-1d",
      habitable: false,
      radius: "0.77 Earth radii",
      distance: "40 ly",
    },
    {
      name: "Kepler-442b",
      habitable: true,
      radius: "1.34 Earth radii",
      distance: "1200 ly",
    },
  ];

  return (
    <>
      <style>{`
        .main-content {
          flex: 1;
          padding-top: 60px; /* navbar height */
        }
      `}</style>

      <div className="mainappdiv">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Home />} />
            <Route path="/storytelling" element={<Storytelling />} />
            <Route
              path="/game"
              element={<PlanetGame planets={gamePlanets} />}
            />
          </Routes>
        </div>

        {/* ✅ Only show footer if not on dashboard */}
        {location.pathname !== "/dashboard" && <Footer />}
      </div>
    </>
  );
}
