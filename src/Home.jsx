import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import HabitablePlanets from "./Components/HabitablePlanets";
import Particles from "@tsparticles/react";

import "./Components/ProjectCards.css";
import "./Components/PlanetGame.css";
import "./StoryPage.css";
import "./style.css";

export default function Home() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [modalContent, setModalContent] = useState(null);
  const [showScript, setShowScript] = React.useState(false);
  const egyptRef = useRef(null);
  const usaRef = useRef(null);
  const franceRef = useRef(null);

  const BackgroundParticles = () => {
    const particlesOptions = {
      fullScreen: { enable: true, zIndex: -1 },
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 120, density: { enable: true, area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.7 },
        size: { value: { min: 1, max: 2 } },
        move: { enable: true, speed: 0.2, direction: "none" },
      },
    };
    return <Particles id="tsparticles" options={particlesOptions} />;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

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

    const handleResize = () => {
      if (!mountRef.current) return;
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // --- Earth setup ---
    const earthGeometry = new THREE.SphereGeometry(2, 128, 128);
    const earthTexture = new THREE.TextureLoader().load("/earth_HD.jpg");
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const earthRotationSpeed = 0.0005;

    // --- Stars ---
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++)
      positions[i] = (Math.random() - 0.5) * 2000;
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // --- Countries ---
    const countries = [
      { name: "Egypt", lat: 26, lon: 117, flag: "/flags/Flag_of_Egypt.png" },
      {
        name: "USA",
        lat: 40,
        lon: -10,
        flag: "/flags/Flag_of_the_United_States.svg.png",
      },
      {
        name: "France",
        lat: 48,
        lon: 93,
        flag: "/flags/Flag_of_France.svg.png",
      },
    ];
    const countryMeshes = [];

    countries.forEach((c) => {
      const texture = new THREE.TextureLoader().load(c.flag);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
      });

      const aspect = texture.image
        ? texture.image.width / texture.image.height
        : 1;
      const width = 0.3;
      const height = width / aspect;
      const geometry = new THREE.PlaneGeometry(width, height);

      const mesh = new THREE.Mesh(geometry, material);
      const lat = THREE.MathUtils.degToRad(c.lat);
      const lon = THREE.MathUtils.degToRad(c.lon);
      const radius = 2.05;

      const x = radius * Math.cos(lat) * Math.sin(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.cos(lon);

      mesh.position.set(x, y, z);
      const normal = new THREE.Vector3(x, y, z).normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
      );
      mesh.setRotationFromQuaternion(quaternion);

      mesh.userData = { name: c.name };
      earth.add(mesh);
      countryMeshes.push(mesh);
    });

    // --- OrbitControls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;

    // --- Animation ---
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0002;
      earth.rotation.y += earthRotationSpeed;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Click handler ---
    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObjects(
        countryMeshes,
        true
      );
      if (intersects.length > 0) {
        const country = intersects[0].object.userData.name;
        // Instead of scrolling, open modal
        setModalContent(country);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    return () => {
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      )
        mountRef.current.removeChild(renderer.domElement);
      earthGeometry.dispose();
      earthMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [navigate]);

  return (
    <div className="home-container">
      <BackgroundParticles />
      {/* Hero Section */}
      <section className="hero-section centered-section">
        <h1 className="hero-title">
          WELCOME TO <span>EXO HUNTERS!</span>
        </h1>
        <p className="hero-subtitle">WHERE SPACE STORIES COME ALIVE.</p>
        <p className="hero-description">
          From Pharaohs gazing at the skies to AI uncovering new worlds, Exo
          Hunters is Egypt’s space story reborn.
        </p>
        <button
          className="hero-btn"
          onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}
        >
          Explore
        </button>
      </section>
      {/* Interactive Earth Section */}
      <section className="earth-section centered-section">
        <h2 className="section-title">🌍 Interactive Earth</h2>
        <p className="section-subtitle">
          Rotate the planet to see the three countries and click on them!
        </p>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "600px",
          }}
        >
          <div
            ref={mountRef}
            className="earth-canvas"
            style={{ width: "100%", height: "100%" }}
          />
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "15px",
              borderRadius: "10px",
              maxWidth: "250px",
              fontSize: "14px",
              lineHeight: "1.4",
              zIndex: 5,
            }}
          >
            <strong>Instructions:</strong>
            <br />
            Rotate the planet to see these countries:
            <ul style={{ paddingLeft: "15px", marginTop: "5px" }}>
              <li>Egypt</li>
              <li>France</li>
              <li>USA</li>
            </ul>
            Click a country to learn more.
          </div>
        </div>
      </section>
      {/* Modal */}
      {modalContent && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            animation: "fadeIn 0.4s ease-in-out",
          }}
        >
          {(() => {
            const content = {
              Egypt: {
                flag: "/flags/Flag_of_Egypt.png",
                img: "/images/egypt-bg.jpg",
                audio: "/audio/egypt-story.mp3",
                desc: "Egypt, land of the Pharaohs, where ancient astronomy guided the pyramids and temples.",
                script: `اهلا 
أنا مصر…
مهد الحضارة. لأكثر من خمسة آلاف عام، شعبي رفع عينيه للسماء بإعجاب وانبهار.
الأهرامات التي أحملها على رمالي ليست مجرد آثار — بل خرائط كونية. وُجِّهت مع نجوم الجبار لتدل الأرواح على طريق الخلود.
في أبو سمبل، تنحني الشمس نفسها بدقة، لتضيء وجه رمسيس في يوم ميلاده ويوم تتويجه. أسلافي لم يكونوا مجرد معماريين — بل فلكيين، رياضيين، وحالمين بالنجوم.

لكنني لست مجرد ماضٍ منقوش على الحجر.
اليوم أنهض من جديد بالعلم والابتكار. جامعاتي، شبابي، ومهندسيّ — يبنون تلسكوبات، يطلقون أقمارًا صناعية، ويدرّبون الآلات لتقرأ اللغة الخفية للكون.

الذكاء الاصطناعي أصبح كاتبي الجديد، يخط قصص الكواكب خلف الشمس.
الفضول نفسه الذي حرّك الفراعنة يجري اليوم في عقول علمائي.

أنا مصر — أزلية، لا تنكسر،
أرض الحكمة القديمة والمستقبل بين النجوم."`,
              },
              USA: {
                flag: "/flags/Flag_of_the_United_States.svg.png",
                img: "/images/usa.jpg",
                audio: "/audio/usa.mp3",
                desc: "The USA, home of NASA and the Apollo missions, pioneered humanity’s journey to the Moon.",
                script: "Here you can later add the USA script...",
              },
              France: {
                flag: "/flags/Flag_of_France.svg.png",
                img: "/images/france.avif",
                audio: "/audio/french.mp3",
                desc: "France has a rich space history through CNES, contributing to satellites and deep-space exploration.",
                script: `Je suis la France…
Une nation où la science et la poésie avancent main dans la main. Depuis des siècles, mes penseurs et mes rêveurs ont tracé les cieux.
Cassini a cartographié les étoiles, Messier a catalogué les galaxies, et Laplace a révélé les lois cachées du cosmos. Jules Verne a imaginé des voyages vers la Lune bien avant que les fusées ne touchent le ciel.

Mais je ne suis pas seulement un passé écrit dans les livres.
Aujourd’hui, je lance des fusées Ariane, je conçois des télescopes, et j’inspire des enfants qui rêvent avec à la fois l’imagination et le code. Mes universités et mes observatoires rejoignent le monde entier dans la quête de nouveaux mondes, dissimulés dans les courbes lumineuses de la NASA.

L’Intelligence Artificielle est ma nouvelle boussole, me guidant à travers les signaux, dévoilant des planètes et portant toujours plus loin ma curiosité.
Le même esprit qui dessinait jadis les nébuleuses programme désormais des machines pour révéler les galaxies au-delà.

Je suis la France, poétique, inventive,
terre de rêveurs et d’explorateurs, s’élevant toujours plus haut vers les étoiles.`,
              },
            };

            const c = content[modalContent];

            return (
              <div
                className="modal-content"
                style={{
                  position: "relative",
                  borderRadius: "20px",
                  padding: "30px",
                  width: "85%",
                  maxWidth: "900px",
                  height: "80%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  // ✅ Background image
                  backgroundImage: `url(${c.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "#fff",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                  animation: "scaleIn 0.4s ease-in-out",
                  overflow: "hidden",
                }}
              >
                {/* Floating Close Button */}
                <button
                  onClick={() => setModalContent(null)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,0,0,0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.6)")
                  }
                >
                  ✕
                </button>

                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <img
                    src={c.flag}
                    alt={modalContent}
                    style={{
                      width: "60px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "2px solid #fff",
                    }}
                  />
                  <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {modalContent}
                  </h2>
                </div>

                {/* Description */}
                <p style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
                  {c.desc}
                </p>

                {/* Audio */}
                <audio
                  controls
                  style={{
                    width: "100%",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    background: "#222",
                  }}
                >
                  <source src={c.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                {/* Show Script Button */}
                <button
                  onClick={() => setShowScript(!showScript)}
                  style={{
                    marginBottom: "15px",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "8px",
                    background: showScript
                      ? "linear-gradient(135deg, #ff416c, #ff4b2b)"
                      : "linear-gradient(135deg, #00c6ff, #0072ff)",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-3px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {showScript ? "Hide Script" : "Show Script"}
                </button>

                {/* Script Panel */}
                {showScript && (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      padding: "15px",
                      borderRadius: "10px",
                      flexGrow: 1,
                      overflowY: "auto",
                      textAlign: "right",
                      direction: "rtl",
                    }}
                  >
                    <p
                      style={{
                        whiteSpace: "pre-line",
                        lineHeight: "1.8",
                        fontSize: "1rem",
                      }}
                    >
                      {c.script}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Solution Section */}
      <section className="solution-section centered-section">
        <h2 className="section-title">💡 Our Solution</h2>
        <div className="cards-container">
          <div className="card">
            <h3>Problem</h3>
            <p>
              NASA holds thousands of exoplanet datasets, but most are analyzed
              manually. This process is slow, complex, and limits discoveries,
              leaving many hidden worlds unexplored.
            </p>
          </div>
          <div className="card">
            <h3>Approach</h3>
            <p>
              We use the power of AI and Machine Learning to automatically
              process light curve data from NASA’s missions (Kepler & TESS). Our
              system can classify signals faster, identify potential exoplanets,
              and bring them to life in an interactive 3D universe.
            </p>
          </div>
          <div className="card">
            <h3>Impact</h3>
            <p>
              With faster and more accurate detection, scientists can explore
              new worlds beyond our solar system more efficiently. Our platform
              makes discovery not only easier for researchers—but also fun and
              inspiring for students and the public.
            </p>
          </div>
        </div>
      </section>
      {/* Habitable Planets Section */}
      <section
        className="planets-section centered-section"
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        <h2 className="section-title">💡 Our Model Idea</h2>

        {/* Normal Video with Controls */}
        <video
          controls
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: "16px",
          }}
        >
          <source src="/videos/space story.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>
      {/* Games & Quiz Section */}
      <section className="game-section centered-section">
        <h2 className="section-title">🎮 Test Your Skills!</h2>
        <p className="section-subtitle">
          Play planetary games and quizzes to learn while having fun!
        </p>
        <div
          className="game-cards-container"
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <div
            className="game-card"
            style={{
              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
              color: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "320px",
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              transition: "transform 0.3s, box-shadow 0.3s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
            }}
          >
            <h3>🪐 Planet Quiz</h3>
            <p>Test your knowledge about exoplanets and space exploration.</p>
            <button
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#ffcc00",
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
              onClick={() => navigate("/game")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#ffaa00")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ffcc00")
              }
            >
              Play Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
