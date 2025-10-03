// Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Particles from "@tsparticles/react";

// Optional local CSS (kept from your project)
import "./Components/ProjectCards.css";
import "./Components/PlanetGame.css";
import "./style.css";

/* -------------------------------
   Text direction helpers
-------------------------------- */
const RTL_RANGES =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/; // Arabic/Persian/Urdu

function inferDirection(text = "") {
  return RTL_RANGES.test(text) ? "rtl" : "ltr";
}
function dirStyles(dir = "ltr") {
  return {
    direction: dir,
    textAlign: dir === "rtl" ? "right" : "left",
    unicodeBidi: "plaintext",
  };
}

/* -------------------------------
   Small responsive helpers
-------------------------------- */
const useViewport = () => {
  const [vw, setVw] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { vw, isMobile: vw < 640, isTablet: vw >= 640 && vw < 1024 };
};

export default function Home() {
  const navigate = useNavigate();
  const { vw, isMobile, isTablet } = useViewport();

  const mountRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const rafRef = useRef(null);

  const [modalContent, setModalContent] = useState(null);
  const [showScript, setShowScript] = useState(false);

  // Star count responsive
  const starCount = isMobile ? 800 : isTablet ? 1400 : 2000;

  /* -------------------------------
     Background particles (kept)
  -------------------------------- */
  const BackgroundParticles = () => {
    const particlesOptions = {
      fullScreen: { enable: true, zIndex: -1 },
      background: { color: { value: "transparent" } },
      particles: {
        number: {
          value: isMobile ? 60 : 120,
          density: { enable: true, area: 800 },
        },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.7 },
        size: { value: { min: 1, max: 2 } },
        move: { enable: true, speed: 0.2, direction: "none" },
      },
    };
    return <Particles id="tsparticles" options={particlesOptions} />;
  };

  /* -------------------------------
     Three.js scene
  -------------------------------- */
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); // perf-friendly
    container.appendChild(renderer.domElement);

    // Resize handler (throttled by rAF)
    let resizePending = false;
    const handleResize = () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        if (!mountRef.current) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Earth
    const earthGeometry = new THREE.SphereGeometry(2, 96, 96);
    const earthTexture = new THREE.TextureLoader().load("/earth_HD.jpg");
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const earthRotationSpeed = 0.0005;

    // Stars
    const starGeometry = new THREE.BufferGeometry();
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

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Countries
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

    const flagBaseWidth = isMobile ? 0.22 : 0.3;

    countries.forEach((c) => {
      const texture = new THREE.TextureLoader().load(c.flag);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
      });

      // Safe aspect; texture.image can be null on first frame
      const aspect =
        texture.image && texture.image.width && texture.image.height
          ? texture.image.width / texture.image.height
          : 1;
      const width = flagBaseWidth;
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

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;

    // Animation
    const animate = () => {
      stars.rotation.y += 0.0002;
      earth.rotation.y += earthRotationSpeed;
      controls.update();
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Click handler
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
        setModalContent(country);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      )
        mountRef.current.removeChild(renderer.domElement);
      earthGeometry.dispose();
      earthMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
    };
  }, [isMobile, isTablet, starCount]);

  /* -------------------------------
     Modal content
  -------------------------------- */
  const contentMap = {
    Egypt: {
      lang: "ar",
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
أرض الحكمة القديمة والمستقبل بين النجوم.`,
    },
    USA: {
      lang: "en",
      flag: "/flags/Flag_of_the_United_States.svg.png",
      img: "/images/usa.jpg",
      audio: "/audio/usa.mp3",
      desc: "The USA, home of NASA and the Apollo missions, pioneered humanity’s journey to the Moon.",
      script: `I am the United States.
A nation born from exploration, built on innovation, and driven by ambition.
From the first steps on the Moon to the powerful eyes of the Hubble Telescope, my story has always been tied to the stars.

I created Kepler — a silent watcher of the skies, who discovered thousands of new worlds. I launched TESS, a hunter scanning the galaxy for the whispers of distant planets. I built observatories and data archives so vast, they hold more information than any human could ever read in a lifetime.

But the universe is infinite. And so I turned to Artificial Intelligence.
Machines became my partners — learning to see patterns where the human eye cannot, finding planets hidden in the flicker of distant starlight.
For me, science is not just discovery — it is a bridge, connecting minds, cultures, and generations.

I am America — the dreamer, the builder,
the voice that asks not just ‘Are we alone?’ but also, ‘What’s next?`,
    },
    France: {
      lang: "fr",
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

  /* -------------------------------
     Responsive inline styles
  -------------------------------- */
  const CANVAS_HEIGHT = isMobile ? "44vh" : isTablet ? "52vh" : "62vh";

  return (
    <div className="home-container">
      <BackgroundParticles />

      {/* Hero */}
      <section className="hero-section centered-section" style={sx.hero}>
        <h1 style={sx.heroTitle}>
          WELCOME TO <span style={sx.heroSpan}>EXO HUNTERS!</span>
        </h1>
        <p style={sx.heroSubtitle}>WHERE SPACE STORIES COME ALIVE.</p>
        <p style={sx.heroDescription}>
          From Pharaohs gazing at the skies to AI uncovering new worlds, Exo
          Hunters is Egypt’s space story reborn.
        </p>
        <button
          style={sx.cta}
          onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}
        >
          Explore
        </button>
      </section>

      {/* Earth */}
      <section className="earth-section centered-section" style={sx.section}>
        <h2 className="section-title" style={sx.sectionTitle}>
          🌍 Interactive Earth
        </h2>
        <p className="section-subtitle" style={sx.sectionSubtitle}>
          Rotate the planet to see the three countries and click on them!
        </p>

        <div
          style={{ position: "relative", width: "100%", height: CANVAS_HEIGHT }}
        >
          <div ref={mountRef} className="earth-canvas" style={sx.earthCanvas} />
          <div style={sx.instructions}>
            <strong>Instructions:</strong>
            <br />
            Rotate the planet to see these countries:
            <ul style={{ paddingInlineStart: 18, marginTop: 6 }}>
              <li>Egypt</li>
              <li>France</li>
              <li>USA</li>
            </ul>
            Click a country to learn more.
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalContent &&
        (() => {
          const c = contentMap[modalContent];
          const dir =
            (c.lang === "ar" && "rtl") ||
            (c.lang === "en" && "ltr") ||
            (c.lang === "fr" && "ltr") ||
            inferDirection(c.script);

          const fontFamily =
            dir === "rtl"
              ? `'Cairo', 'Amiri', system-ui, sans-serif`
              : `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;

          return (
            <div style={sx.modalOverlay}>
              <div style={{ ...sx.modal, backgroundImage: `url(${c.img})` }}>
                {/* Close */}
                <button
                  onClick={() => setModalContent(null)}
                  aria-label="Close"
                  style={sx.modalClose}
                >
                  ✕
                </button>

                {/* Header */}
                <div style={sx.modalHeader}>
                  <img
                    src={c.flag}
                    alt={`${modalContent} flag`}
                    style={sx.modalFlag}
                  />
                  <h2 style={sx.modalTitle}>{modalContent}</h2>
                </div>

                {/* Desc */}
                <p style={sx.modalDesc}>{c.desc}</p>

                {/* Audio (hidden on very small screens if needed) */}
                <audio controls style={sx.modalAudio}>
                  <source src={c.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                {/* Toggle Script */}
                <button
                  onClick={() => setShowScript((v) => !v)}
                  style={{
                    ...sx.toggleBtn,
                    background: showScript
                      ? "linear-gradient(135deg, #ff416c, #ff4b2b)"
                      : "linear-gradient(135deg, #00c6ff, #0072ff)",
                  }}
                >
                  {showScript ? "Hide Script" : "Show Script"}
                </button>

                {/* Script Panel */}
                {showScript && (
                  <div
                    style={{ ...sx.scriptPanel, ...dirStyles(dir), fontFamily }}
                  >
                    <p style={sx.scriptText}>{c.script}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {/* Solution */}
      <section className="solution-section centered-section" style={sx.section}>
        <h2 className="section-title" style={sx.sectionTitle}>
          💡 Our Solution
        </h2>
        <div style={sx.cardsWrap}>
          <div style={sx.card}>
            <h3 style={sx.cardTitle}>Problem</h3>
            <p style={sx.cardText}>
              NASA holds thousands of exoplanet datasets, but most are analyzed
              manually. This process is slow, complex, and limits discoveries,
              leaving many hidden worlds unexplored.
            </p>
          </div>
          <div style={sx.card}>
            <h3 style={sx.cardTitle}>Approach</h3>
            <p style={sx.cardText}>
              We use the power of AI and Machine Learning to automatically
              process light curve data from NASA’s missions (Kepler & TESS). Our
              system can classify signals faster, identify potential exoplanets,
              and bring them to life in an interactive 3D universe.
            </p>
          </div>
          <div style={sx.card}>
            <h3 style={sx.cardTitle}>Impact</h3>
            <p style={sx.cardText}>
              With faster and more accurate detection, scientists can explore
              new worlds beyond our solar system more efficiently. Our platform
              makes discovery not only easier for researchers—but also fun and
              inspiring for students and the public.
            </p>
          </div>
        </div>
      </section>

      {/* Video */}
      <section
        className="planets-section centered-section"
        style={sx.videoSection}
      >
        <h2 className="section-title" style={sx.sectionTitle}>
          💡 Our Model Idea
        </h2>
        <video controls style={sx.video}>
          <source src="/videos/space story.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>

      {/* Games */}
      <section className="game-section centered-section" style={sx.section}>
        <h2 className="section-title" style={sx.sectionTitle}>
          🎮 Test Your Skills!
        </h2>
        <p className="section-subtitle" style={sx.sectionSubtitle}>
          Play planetary games and quizzes to learn while having fun!
        </p>
        <div style={sx.gameGrid}>
          <div
            style={sx.gameCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
            }}
          >
            <h3 style={{ marginTop: 0 }}>🪐 Planet Quiz</h3>
            <p>Test your knowledge about exoplanets and space exploration.</p>
            <button
              style={sx.playBtn}
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

/* -------------------------------
   Inline responsive styles (sx)
-------------------------------- */
const sx = {
  hero: {
    textAlign: "center",
    padding: "10vh 16px 6vh",
    maxWidth: 1100,
    margin: "0 auto",
  },
  heroTitle: {
    fontSize: "clamp(28px, 4vw, 52px)",
    margin: 0,
    letterSpacing: 1,
    fontWeight: 800,
  },
  heroSpan: {
    background: "linear-gradient(90deg,#ffcc00,#ff66cc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    margin: "8px 0 4px",
    color: "#d6d6d6",
    fontSize: "clamp(14px, 2vw, 18px)",
  },
  heroDescription: {
    margin: "8px auto 18px",
    maxWidth: 720,
    color: "#c9c9c9",
    lineHeight: 1.6,
  },
  cta: {
    padding: "12px 22px",
    borderRadius: 12,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    background: "linear-gradient(135deg,#00c6ff,#0072ff)",
    color: "#fff",
    boxShadow: "0 8px 22px rgba(0,114,255,.35)",
  },
  section: {
    textAlign: "center",
    padding: "48px 16px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "clamp(22px, 3vw, 32px)",
    margin: "0 0 8px",
    background: "linear-gradient(90deg,#ffcc00,#ff66cc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  sectionSubtitle: {
    margin: "0 auto 18px",
    maxWidth: 680,
    color: "#d0d0d0",
  },
  earthCanvas: { width: "100%", height: "100%" },
  instructions: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: 12,
    maxWidth: 260,
    fontSize: 13,
    lineHeight: 1.4,
    zIndex: 5,
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 12,
  },
  modal: {
    position: "relative",
    borderRadius: 18,
    padding: 20,
    width: "min(900px, 92vw)",
    height: "min(80vh, 760px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    animation: "scaleIn 0.25s ease-in-out",
    overflow: "hidden",
  },
  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(0,0,0,0.6)",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    cursor: "pointer",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  modalFlag: {
    width: 56,
    height: 36,
    objectFit: "cover",
    borderRadius: 6,
    border: "2px solid #fff",
  },
  modalTitle: { fontSize: "clamp(20px,3vw,28px)", margin: 0 },
  modalDesc: { marginBottom: 12, fontSize: "clamp(14px,2vw,16px)" },
  modalAudio: {
    width: "100%",
    marginBottom: 12,
    borderRadius: 6,
    background: "#222",
  },
  toggleBtn: {
    marginBottom: 12,
    padding: "10px 16px",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(0,0,0,.35)",
  },
  scriptPanel: {
    background: "rgba(0,0,0,0.6)",
    padding: 14,
    borderRadius: 12,
    flexGrow: 1,
    overflowY: "auto",
  },
  scriptText: {
    whiteSpace: "pre-line",
    lineHeight: 1.8,
    fontSize: 16,
    margin: 0,
  },

  // Cards
  cardsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginTop: 10,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 18,
    textAlign: "left",
    boxShadow: "0 8px 22px rgba(0,0,0,.25)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 8,
    color: "#ffcc00",
    fontSize: 18,
  },
  cardText: { margin: 0, color: "#ddd" },

  // Video
  videoSection: {
    width: "100%",
    maxWidth: 900,
    margin: "0 auto",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    overflow: "hidden",
    padding: "32px 16px",
  },
  video: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 16,
  },

  // Games
  gameGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 18,
    justifyContent: "center",
    marginTop: 18,
  },
  gameCard: {
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    color: "#fff",
    padding: 18,
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
  },
  playBtn: {
    marginTop: 10,
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    backgroundColor: "#ffcc00",
    color: "#000",
    fontWeight: 800,
    cursor: "pointer",
  },
};
