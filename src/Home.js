import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import "./Components/ProjectCards.css";
import "./style.css";
import "./Components/PlanetGame.css";
import HabitablePlanets from "./Components/HabitablePlanets";
import "./StoryPage.css"


export default function Home() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
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

    // 🌍 كوكب الأرض
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthTexture = new THREE.TextureLoader().load("/2k_earth_daymap.jpg");
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // 🚩 علم مصر (عند إحداثيات مصر على الكرة الأرضية)
    const flagGeometry = new THREE.PlaneGeometry(0.5, 0.3); // حجم العلم
    const flagTexture = new THREE.TextureLoader().load("/Flag_of_Egypt.png");
    const flagMaterial = new THREE.MeshBasicMaterial({
      map: flagTexture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const egyptFlag = new THREE.Mesh(flagGeometry, flagMaterial);

    // 📍 إحداثيات مصر (القاهرة) lat/lon -> 3D
    const radius = 2.02; // نصف قطر الأرض + هامش صغير علشان العلم يكون فوق السطح
    const lat = 26 * (Math.PI / 180); // خط العرض
    const lon = 30 * (Math.PI / 180); // خط الطول

    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);

    egyptFlag.position.set(x, y, z);

    // خلي العلم يواجه برّه (من مركز الأرض للخارج)
    egyptFlag.lookAt(egyptFlag.position.clone().multiplyScalar(2));

    // أضف العلم كـ child للأرض عشان يلف معاها
    earth.add(egyptFlag);

    console.log("العلم أضيف فوق مصر:", egyptFlag.position);

    // 🌌 نجوم خلفية
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2000;
      positions[i + 1] = (Math.random() - 0.5) * 2000;
      positions[i + 2] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      sizeAttenuation: false,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 💡 إضاءة
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    let starRotation = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      // دوران الأرض (العلم هيلف معاها لأنه child)
      earth.rotation.y += 0.003;

      // دوران النجوم
      starRotation += 0.0002;
      stars.rotation.y = starRotation;
      stars.rotation.x = starRotation * 0.5;

      renderer.render(scene, camera);
    };
    animate();

    // 🎯 النقر على العلم
    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        scene.children,
        true
      );

      for (let intersect of intersects) {
        if (intersect.object === egyptFlag) {
          navigate("/story");
          console.log("تم النقر على علم مصر!");
          return;
        }
      }
      console.log("نقر خارج العلم – intersects:", intersects.length);
    };

    renderer.domElement.addEventListener("click", handleClick);

    // 🧹 تنظيف
    return () => {
      if (
        mountRef.current &&
        renderer.domElement &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("click", handleClick);
      }
      if (renderer) renderer.dispose();
      if (earthMaterial) earthMaterial.dispose();
      if (earthGeometry) earthGeometry.dispose();
      if (flagMaterial) flagMaterial.dispose();
      if (flagGeometry) flagGeometry.dispose();
      if (starMaterial) starMaterial.dispose();
      if (starGeometry) starGeometry.dispose();
      if (earthTexture) earthTexture.dispose();
      if (flagTexture) flagTexture.dispose();
      console.log("تم تنظيف Three.js بنجاح!");
    };
  }, [navigate]);

  return (
    <div className="home-container" style={{ position: "relative", zIndex: 10 }}>
      <section className="main" style={{ position: "relative", zIndex: 20 }}>
        <div>
          <h2>
            Welcome to <span>CZMU</span>
          </h2>
          <h3>Exploring Exoplanets with AI & Data Visualization</h3>
        </div>
      </section>

      <section
        className="planet-section"
        style={{ position: "relative", zIndex: 15 }}
      >
        <div
          className="planet-container"
          ref={mountRef}
          style={{
            width: "100%",
            height: "500px",
            position: "relative",
            zIndex: 5,
          }}
        />
        <div
          className="planet-info"
          style={{ position: "relative", zIndex: 25 }}
        >
          <h2>Interactive Exoplanet Visualization</h2>
          <p>
            Rotate and explore Earth. Click on the Egyptian flag to discover a
            story! Learn how AI helps in finding new worlds beyond our solar
            system.
          </p>
        </div>
      </section>

      <section
        className="project-cards"
        style={{ position: "relative", zIndex: 30 }}
      >
        <h2>Our Solution</h2>
        <div className="cards-container">
          <div className="card" style={{ position: "relative", zIndex: 35 }}>
            <h3>Problem</h3>
            <p>
              Thousands of exoplanets data exist, but most are analyzed manually,
              which is slow and tedious.
            </p>
          </div>
          <div className="card" style={{ position: "relative", zIndex: 35 }}>
            <h3>Our Approach</h3>
            <p>
              Using AI and Machine Learning to automatically analyze exoplanet
              datasets from NASA.
            </p>
          </div>
          <div className="card" style={{ position: "relative", zIndex: 35 }}>
            <h3>Impact</h3>
            <p>
              Faster and more accurate identification of new exoplanets, helping
              scientists discover new worlds efficiently.
            </p>
          </div>
        </div>
      </section>

      <HabitablePlanets />

      <section className="game-section" style={{ position: "relative", zIndex: 20 }}>
        <h2>Test Your Skills!</h2>
      </section>
    </div>
  );
}
