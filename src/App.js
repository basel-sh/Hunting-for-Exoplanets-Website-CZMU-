import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./Components/Footer";
import Dashboard from "./Components/Dashboard/Dashboard";
import Navbar from "./Components/Header";
import Home from "./Home";
import OurModel from "./Components/Our Model.jsx";
import AboutUs from "./Components/About_us";
import PlanetGame from "./Components/PlanetGame";
import BackgroundParticles from "./Components/BackgroundParticles"; // ✅ الخلفية

export default function App() {
  const location = useLocation();

  return (
    <>
      <BackgroundParticles />{" "}
      <div className="mainappdiv">
        <Navbar />
        <div className="main-content" style={{ flex: 1, paddingTop: "60px" }}>
          <Routes>
            <Route path="/ourmodel" element={<OurModel />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Home />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/game" element={<PlanetGame />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
