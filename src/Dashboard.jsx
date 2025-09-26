import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import axios from "axios";
import planetsData from "./data/samplePlanets.json"; // keep your sample file or replace with backend fetch

// Optional charts (Scientist mode)
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

/*
  Dashboard_Enhanced.jsx
  - Single-file enhanced dashboard that you can drop into src/Dashboard.jsx
  - Features:
    • Full Three.js scene with Sun + orbiting planets (scaled, animated)
    • Raycast click to select a planet (shows info + triggers prediction)
    • Calls your FastAPI backend POST /predict_json with minimal payload
    • Kid mode (colorful) and Scientist mode (data panels + charts)
    • Simple controls: speed, pause/resume, toggle labels

  Dependencies to install (project root):
    npm i three axios recharts

  Notes:
    • If you want realistic textures use planetData.texture (url or local import path). The loader will try to use it.
    • If you already have a DataFetchingComponent in your project, you can replace planetsData import with a fetch.
*/

const BASE_URL = "https://EngBasel-kepler-ml-datasets.hf.space"; // change to your deployed backend

// Helper: call backend
async function predictPlanetAPI(planet) {
  try {
    const payload = {
      koi_period: Number(
        planet.koi_period || planet.pl_orbper || planet.pl_orbper
      ),
      koi_duration: Number(planet.koi_duration || planet.koi_duration || 0.1),
      koi_radius: Number(
        planet.koi_radius || planet.pl_rade || planet.koi_radius
      ),
      insolation: Number(planet.insolation || planet.insolation || 1.0),
      // add more fields if your backend requires them
    };

    const res = await axios.post(`${BASE_URL}/predict_json`, payload, {
      timeout: 8000,
    });
    return res.data; // { probability, label }
  } catch (err) {
    console.error("/predict_json error:", err?.response || err?.message || err);
    return null;
  }
}

// Create a synthetic light-curve for demonstration (scientist mode)
function synthesizeLightCurve(planet) {
  const points = [];
  const period = Number(planet.koi_period || planet.pl_orbper || 10);
  const amplitude = Math.max(
    0.01,
    (planet.koi_radius || planet.pl_rade || 1) * 0.02
  );
  for (let i = 0; i < 200; i++) {
    const x = i;
    const y =
      1 +
      amplitude *
        Math.sin((i / 200) * Math.PI * 2 * (200 / Math.max(1, period)));
    points.push({ x, y: Number(y.toFixed(4)) });
  }
  return points;
}

export default function Dashboard() {
  const mountRef = useRef(null);
  const [mode, setMode] = useState("kid"); // "kid" | "scientist"
  const [speed, setSpeed] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [planets, setPlanets] = useState(planetsData || []);
  const [showLabels, setShowLabels] = useState(true);

  // Scene refs to persist between renders
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const planetsRef = useRef([]); // array of {mesh, pivot, data}
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const animationIdRef = useRef(null);

  // scale helpers
  const ORBIT_SCALE = 60; // adjust to spread planets in view
  const PLANET_SIZE_SCALE = 2.2;

  // Setup Three.js scene
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // basic scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
    camera.position.set(0, 80, 160);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Add background (simple dark gradient via color)
    scene.background = new THREE.Color(0x01010a);

    // ambient + point light
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);
    const point = new THREE.PointLight(0xffffff, 2.5, 1000);
    point.position.set(0, 0, 0);
    scene.add(point);

    // Sun at center
    const sunGeo = new THREE.SphereGeometry(12, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd66 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.name = "SUN";
    scene.add(sun);

    // Create orbiting planets group
    planetsRef.current = [];

    const textureLoader = new THREE.TextureLoader();

    planets.forEach((p, i) => {
      // scale orbit radius using available fields (pl_orbsmax or koi_period or index)
      const orbitValue = Number(p.pl_orbsmax || p.koi_period || (i + 1) * 0.6);
      const orbitRadius = Math.max(6, orbitValue * ORBIT_SCALE);

      // create pivot (object3D that rotates for orbit)
      const pivot = new THREE.Object3D();
      scene.add(pivot);

      // planet mesh
      const size = Math.max(
        0.4,
        Number(p.koi_radius || p.pl_rade || 1) * PLANET_SIZE_SCALE
      );
      const geo = new THREE.SphereGeometry(size, 32, 32);

      // try load texture if available, otherwise use color material
      let mat;
      if (p.texture) {
        mat = new THREE.MeshStandardMaterial({
          map: textureLoader.load(p.texture),
        });
      } else {
        // assign a pleasing color depending on index and kid/scientist mode
        const color =
          mode === "kid"
            ? new THREE.Color(`hsl(${(i * 47) % 360} 80% 60%)`)
            : new THREE.Color(`hsl(${(i * 47) % 360} 50% 40%)`);
        mat = new THREE.MeshStandardMaterial({ color });
      }

      const mesh = new THREE.Mesh(geo, mat);

      // position planet out on its orbit
      mesh.position.set(orbitRadius, 0, 0);

      // attach simple label on mesh.userData for showing later
      mesh.userData = {
        ...p,
        orbitRadius,
        orbitSpeed: Number(
          1 / Math.max(0.01, p.pl_orbper || p.koi_period || i + 1)
        ),
        index: i,
      };

      // optionally add a simple ring for larger planets
      if ((p.koi_radius || p.pl_rade || 0) > 6) {
        const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2.1, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.08,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      pivot.add(mesh);

      // store refs
      planetsRef.current.push({ mesh, pivot, data: p });

      // optional orbit helper circle (thin line)
      const orbitCurve = new THREE.CircleGeometry(orbitRadius, 128);

      // remove the center vertex (index 0) by converting to BufferGeometry
      const positions = orbitCurve.attributes.position.array;
      const newPositions = positions.slice(3); // skip first vertex (x,y,z)
      const newGeometry = new THREE.BufferGeometry();
      newGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(newPositions, 3)
      );

      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x444444,
        opacity: 0.6,
        transparent: true,
      });
      const orbitLine = new THREE.LineLoop(newGeometry, orbitMat);
      orbitLine.rotation.x = Math.PI / 2;
      scene.add(orbitLine);
    });

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // responsive resize
    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // interaction
    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        planetsRef.current.map((p) => p.mesh)
      );
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const info = hit.userData;
        setSelected(info);

        // visual feedback: pulse scale
        const originalScale = hit.scale.clone();
        hit.scale.setScalar(originalScale.x * 1.15);
        setTimeout(() => hit.scale.copy(originalScale), 350);

        // call prediction
        predictPlanetAPI(info).then((res) => {
          setPrediction(res);
        });
      }
    };

    renderer.domElement.addEventListener("click", onClick);

    // animation loop
    const clock = new THREE.Clock();

    function animate() {
      animationIdRef.current = requestAnimationFrame(animate);
      if (!paused) {
        // rotate sun slowly
        const sun = scene.getObjectByName("SUN");
        if (sun) sun.rotation.y += 0.002 * speed;

        // rotate planets
        planetsRef.current.forEach(({ mesh, pivot }) => {
          // spin planet
          mesh.rotation.y += 0.01 * speed;
          // orbit pivot rotation: use orbitSpeed stored in userData
          const orbitSpeed = mesh.userData.orbitSpeed || 0.01;
          pivot.rotation.y += orbitSpeed * 0.0005 * speed; // tuned factor
        });
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // cleanup on unmount
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      // dispose
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, [planets, mode, paused, speed]);

  // Planet selection side panel content
  const SelectedInfo = () => {
    if (!selected)
      return <div style={{ padding: 12 }}>Click a planet to inspect it.</div>;

    const lc = synthesizeLightCurve(selected);

    return (
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: 0 }}>
          {selected.pl_name ||
            selected.name ||
            selected.koi_name ||
            selected.kepoi_name}
        </h3>
        <p style={{ margin: "6px 0" }}>
          Period: {selected.pl_orbper || selected.koi_period}
        </p>
        <p style={{ margin: "6px 0" }}>
          Radius: {selected.pl_rade || selected.koi_radius}
        </p>
        <p style={{ margin: "6px 0" }}>
          Insolation: {selected.insolation || "—"}
        </p>

        {prediction && (
          <div style={{ marginTop: 8 }}>
            <strong>AI:</strong> {prediction.label} <br />
            <small>Prob: {Number(prediction.probability).toFixed(3)}</small>
          </div>
        )}

        <div style={{ width: "100%", height: 160, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={lc}
              margin={{ left: 6, right: 6, top: 6, bottom: 6 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" hide />
              <YAxis
                domain={["dataMin - 0.05", "dataMax + 0.05"]}
                hide={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#ff7300"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Scientist overview chart (radius vs insolation)
  const ScientistOverview = () => {
    const scatterData = planets
      .map((p, i) => ({
        x: Number(p.insolation || p.pl_insol || i + 1),
        y: Number(p.koi_radius || p.pl_rade || 1),
        name: p.pl_name || p.kepoi_name || `P${i + 1}`,
      }))
      .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

    return (
      <div style={{ padding: 12 }}>
        <h4 style={{ margin: 0 }}>Scientist Charts</h4>
        <div style={{ width: "100%", height: 200, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="x" name="insolation" />
              <YAxis dataKey="y" name="radius" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", gap: 12 }}>
      {/* Left: 3D canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 5 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setMode(mode === "kid" ? "scientist" : "kid")}
            >
              {mode === "kid" ? "Switch to Scientist" : "Switch to Kid"}
            </button>
            <button onClick={() => setPaused(!paused)}>
              {paused ? "Resume" : "Pause"}
            </button>
            <button onClick={() => setSpeed((s) => Math.max(0.1, s - 0.25))}>
              - Speed
            </button>
            <button onClick={() => setSpeed((s) => Math.min(4, s + 0.25))}>
              + Speed
            </button>
            <label
              style={{
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Labels
            </label>
          </div>
          <div style={{ marginTop: 8, color: "#ddd" }}>
            Speed: {speed.toFixed(2)}
          </div>
        </div>

        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

        {/* optional small legend bottom-left */}
        <div
          style={{ position: "absolute", left: 12, bottom: 12, color: "#aaa" }}
        >
          <div>Click a planet for AI prediction</div>
        </div>
      </div>

      {/* Right: panels */}
      <div
        style={{
          width: 360,
          background:
            "linear-gradient(180deg, rgba(20,20,30,0.95), rgba(12,12,18,0.95))",
          color: "#fff",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>CZMU Dashboard</h2>
          <p style={{ marginTop: 4, marginBottom: 12 }}>
            Mode: <strong>{mode}</strong>
          </p>

          {selected ? (
            <div
              style={{
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                padding: 8,
              }}
            >
              <SelectedInfo />
            </div>
          ) : (
            <div
              style={{
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                padding: 12,
              }}
            >
              <h4>No planet selected</h4>
              <p>
                Click any planet in the 3D view to inspect it and get an AI
                prediction.
              </p>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <ScientistOverview />
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>All Planets</h4>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {planets.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 6,
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // focus camera on planet
                    const entry = planetsRef.current[idx];
                    if (entry && cameraRef.current) {
                      const worldPos = new THREE.Vector3();
                      entry.mesh.getWorldPosition(worldPos);
                      cameraRef.current.position.set(
                        worldPos.x + 40,
                        worldPos.y + 18,
                        worldPos.z + 40
                      );
                    }
                  }}
                >
                  <strong>
                    {p.pl_name || p.kepoi_name || p.name || p.kepid}
                  </strong>
                  <div style={{ fontSize: 12, color: "#bbb" }}>
                    Period: {p.koi_period || p.pl_orbper || "—"} days
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <small style={{ color: "#888" }}>
              Tip: switch to Scientist mode for charts and detailed readouts.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
