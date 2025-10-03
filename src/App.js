import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./Components/Footer";
import Dashboard from "./Components/Dashboard/Dashboard";
import Navbar from "./Components/Header";
import Home from "./Home";
import OurModel from "./Components/Our Model.jsx";
import AboutUs from "./Components/About_us";
import PlanetGame from "./Components/PlanetGame";
import BackgroundParticles from "./Components/BackgroundParticles"; // ✅ الخلفية
import StoryPage from "./StoryPage"; // ✅ إضافة جديدة: استيراد صفحة القصة

export default function App() {
  const location = useLocation();

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
      <BackgroundParticles />{" "}
      {/* ⭐ النجوم في الخلفية – ستظهر في /story أيضًا */}
      <div className="mainappdiv">
        <Navbar />
        <div className="main-content" style={{ flex: 1, paddingTop: "60px" }}>
          <Routes>
            <Route path="/ourmodel" element={<OurModel />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Home />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/story" element={<StoryPage />} />{" "}
            {/* ✅ إضافة جديدة: Route لصفحة القصة */}
            <Route
              path="/game"
              element={<PlanetGame objects={spaceObjects} />}
            />
          </Routes>
        </div>

        {/* ✅ تعديل: إخفاء Footer في /story أيضًا (اختياري – لصفحة فيديو كاملة) */}
        {location.pathname !== "/dashboard" &&
          location.pathname !== "/story" && <Footer />}
      </div>
    </>
  );
}
