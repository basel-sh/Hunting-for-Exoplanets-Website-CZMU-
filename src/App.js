import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./Components/Footer";
import Dashboard from "./Components/Dashboard/Dashboard";
import Navbar from "./Components/Header";
import Home from "./Home";
import Storytelling from "./Components/Storytelling";
import PlanetGame from "./Components/PlanetGame";

export default function App() {
  const location = useLocation(); // ✅ get current route

  const spaceObjects = [
    {
      name: "Kepler-22b",
      isPlanet: true,
      radius: "2.4 Earth radii",
      distance: "600 ly",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Kepler-22b.png/220px-Kepler-22b.png",
    },
    {
      name: "Proxima Centauri b",
      isPlanet: true,
      radius: "1.3 Earth radii",
      distance: "4.2 ly",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Proxima_Centauri_b_Artist%27s_Impression.png/220px-Proxima_Centauri_b_Artist%27s_Impression.png",
    },
    {
      name: "Black Hole",
      isPlanet: false,
      radius: "Unknown",
      distance: "3000 ly",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Black_Hole_in_the_universe.jpg/220px-Black_Hole_in_the_universe.jpg",
    },
    {
      name: "TRAPPIST-1d",
      isPlanet: true,
      radius: "0.77 Earth radii",
      distance: "40 ly",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/PIA21422_-_TRAPPIST-1d.png/220px-PIA21422_-_TRAPPIST-1d.png",
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
              element={<PlanetGame objects={spaceObjects} />}
            />
          </Routes>
        </div>

        {/* ✅ Only show footer if not on dashboard */}
        {location.pathname !== "/dashboard" && <Footer />}
      </div>
    </>
  );
}
