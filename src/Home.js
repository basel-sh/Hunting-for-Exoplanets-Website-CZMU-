import React, { useEffect, useRef } from "react";
import Navbar from "./Components/Header";
import * as THREE from "three";
import "./Components/ProjectCards.css";
import "./style.css"; // CSS لترتيب الصفحة والفوتر
import "./Components/PlanetGame.css"; // CSS للعبة
import HabitablePlanets from "./Components/HabitablePlanets";
import Footer from "./Components/Footer";
import PlanetGame from "./Components/PlanetGame"; // اللعبة

export default function Home() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const texture = new THREE.TextureLoader().load("/2k_earth_daymap.jpg");
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const animate = () => {
      requestAnimationFrame(animate);
      planet.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // بيانات مبدئية للعبة (يمكن استبدالها لاحقًا بالـ backend)
  const gamePlanets = [
    { name: "Kepler-22b", habitable: true, radius: "2.4 Earth radii", distance: "600 ly" },
    { name: "Proxima Centauri b", habitable: true, radius: "1.3 Earth radii", distance: "4.2 ly" },
    { name: "TRAPPIST-1d", habitable: false, radius: "0.77 Earth radii", distance: "40 ly" },
    { name: "Kepler-442b", habitable: true, radius: "1.34 Earth radii", distance: "1200 ly" }
  ];

  return (
    <div className="home-container">
      <Navbar />

      {/* البانر */}
      <section className="main">
        <div>
          <h2>
            Welcome to <span>CZMU</span>
          </h2>
          <h3>Exploring Exoplanets with AI & Data Visualization</h3>
        </div>
      </section>

      {/* الكوكب */}
      <section className="planet-section">
        <div
          className="planet-container"
          ref={mountRef}
          style={{ width: "100%", height: "400px" }}
        />
        <div className="planet-info">
          <h2>Interactive Exoplanet Visualization</h2>
          <p>
            Rotate and explore planets. Discover their data, habitability
            potential, and learn how AI helps in finding new worlds beyond our
            solar system.
          </p>
        </div>
      </section>

      {/* كروت المشروع */}
      <section className="project-cards">
        <h2>Our Solution</h2>
        <div className="cards-container">
          <div className="card">
            <h3>Problem</h3>
            <p>
              Thousands of exoplanets data exist, but most are analyzed manually,
              which is slow and tedious.
            </p>
          </div>

          <div className="card">
            <h3>Our Approach</h3>
            <p>
              Using AI and Machine Learning to automatically analyze exoplanet
              datasets from NASA.
            </p>
          </div>

          <div className="card">
            <h3>Impact</h3>
            <p>
              Faster and more accurate identification of new exoplanets, helping
              scientists discover new worlds efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* قائمة الكواكب التفاعلية */}
      <HabitablePlanets />

      {/* لعبة اكتشاف الكواكب */}
      <section className="game-section">
        <h2>Test Your Skills!</h2>
        
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

