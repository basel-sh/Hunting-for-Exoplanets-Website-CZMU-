import Footer from "./Components/Footer";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Components/Dashboard/Dashboard";
import Navbar from "./Components/Header";
import Home from "./Home";
import Storytelling from "./Components/Storytelling";
import PlanetGame from "./Components/PlanetGame"; // اللعبة

export default function App() {
  // بيانات مبدئية للعبة (يمكن استبدالها بالـ backend لاحقًا)
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
      {/* ✅ CSS directly inside App.jsx */}
      <style>{`
        .mainappdiv {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #0a0a0f;
          color: #fff;
        }

        .main-content {
          flex: 1;
          padding-top: 70px; /* نفس ارتفاع النافبار */


        }

        .navbar {
          background: #0d1117; /* خلفية غامقة */
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 40px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

      `}</style>

      <div className="mainappdiv">
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Storytelling */}
            <Route path="/storytelling" element={<Storytelling />} />

            {/* Planet Game */}
            <Route
              path="/game"
              element={<PlanetGame planets={gamePlanets} />}
            />
          </Routes>
        </div>
        {/* Footer ثابت لكل الصفحات */}
        <Footer />
      </div>
    </>
  );
}
