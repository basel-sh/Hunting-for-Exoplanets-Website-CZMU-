// src/components/Dashboard/ThreeScene.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SunTexture from "../../Assets/Sun.jpg";
import SpaceTexture from "../../Assets/Space.png";
import GanymedeTexture from "../../Assets/ganymede.jpg";

const textureCache = {};
function loadTexture(url) {
  if (!textureCache[url])
    textureCache[url] = new THREE.TextureLoader().load(url);
  return textureCache[url];
}

export default function ThreeScene({ planets, speed, paused, onSelectPlanet }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const planetsRef = useRef([]);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);

  const [toolsOpen, setToolsOpen] = useState(false);
  const [cameraSettings, setCameraSettings] = useState({
    enableRotate: true,
    enableZoom: true,
    enablePan: true,
    dampingFactor: 0.08,
    rotateSpeed: 1,
    zoomSpeed: 1.2,
    panSpeed: 1,
    fov: 60,
    depth: 5000,
  });

  const [panelPos, setPanelPos] = useState({ x: 10, y: 10 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const initialCameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Update refs
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Initialize Three.js
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const spaceTex = loadTexture(SpaceTexture);
    spaceTex.wrapS = spaceTex.wrapT = THREE.RepeatWrapping;
    spaceTex.repeat.set(8, 8);
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(2000, 64, 64),
        new THREE.MeshBasicMaterial({ map: spaceTex, side: THREE.BackSide })
      )
    );

    const camera = new THREE.PerspectiveCamera(
      cameraSettings.fov,
      mount.clientWidth / mount.clientHeight,
      0.1,
      cameraSettings.depth
    );
    camera.position.set(0, 60, 180);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const sunLight = new THREE.PointLight(0xfff0c0, 3, 1500, 2);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(25, 64, 64),
      new THREE.MeshBasicMaterial({ map: loadTexture(SunTexture) })
    );
    scene.add(sun);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(makeGlowCanvas(512)),
        color: 0xffdd99,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    sprite.scale.set(150, 150, 1);
    scene.add(sprite);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    updateControls(controls, cameraSettings);
    controlsRef.current = controls;

    // Enable Ctrl + Left click pan (move center)
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.screenSpacePanning = false;
    window.addEventListener("keydown", (e) => {
      if (e.key === "Control") controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Control") controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    });

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(
        planetsRef.current.map((p) => p.mesh)
      );
      if (hits.length) {
        const hit = hits[0].object;
        const original = hit.scale.clone();
        hit.scale.set(original.x * 1.2, original.y * 1.2, original.z * 1.2);
        setTimeout(() => hit.scale.copy(original), 300);
        onSelectPlanet?.(hit.userData);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    // Animation
    let raf = null;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!pausedRef.current) {
        if (sun) sun.rotation.y += 0.002 * speedRef.current;
        planetsRef.current.forEach(({ mesh }) => {
          const { semiMajor, eccentricity } = mesh.userData;
          mesh.userData.anomaly +=
            0.08 * speedRef.current * mesh.userData.orbitSpeed;

          let M = mesh.userData.anomaly;
          let E = M;
          for (let i = 0; i < 6; i++)
            E =
              E -
              (E - eccentricity * Math.sin(E) - M) /
                (1 - eccentricity * Math.cos(E));

          const trueAnomaly =
            2 *
            Math.atan2(
              Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
              Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
            );
          const r = semiMajor * (1 - eccentricity * Math.cos(E));
          mesh.position.set(
            r * Math.cos(trueAnomaly),
            0,
            r * Math.sin(trueAnomaly)
          );
          mesh.rotation.y += 0.01 * speedRef.current;
        });
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Update camera and controls
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    const c = controlsRef.current;
    const cam = cameraRef.current;
    c.enableRotate = cameraSettings.enableRotate;
    c.enableZoom = cameraSettings.enableZoom;
    c.enablePan = cameraSettings.enablePan;
    c.dampingFactor = cameraSettings.dampingFactor;
    c.rotateSpeed = cameraSettings.rotateSpeed;
    c.zoomSpeed = cameraSettings.zoomSpeed;
    c.panSpeed = cameraSettings.panSpeed;
    cam.fov = cameraSettings.fov;
    cam.far = cameraSettings.depth;
    cam.updateProjectionMatrix();
  }, [cameraSettings]);

  // Planets update
  useEffect(() => {
    if (!sceneRef.current) return;
    const ORBIT_SCALE = 12,
      PLANET_SIZE_SCALE = 10;

    planets.forEach((p, i) => {
      if (planetsRef.current.some((pl) => pl.data.kepoi_name === p.kepoi_name))
        return;

      const orbitBase = Number(p.pl_orbsmax || p.koi_period || (i + 1) * 0.6);
      const semiMajor = Math.max(6, orbitBase * ORBIT_SCALE);
      const eccentricity = 0.5;
      const semiMinor = semiMajor * Math.sqrt(1 - eccentricity ** 2);
      const size = Math.max(
        0.3,
        Number(p.koi_radius || p.pl_rade || 1) * PLANET_SIZE_SCALE
      );

      const geo = new THREE.SphereGeometry(size, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        map: loadTexture(GanymedeTexture),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = {
        ...p,
        semiMajor,
        semiMinor,
        eccentricity,
        orbitSpeed:
          1 / Math.max(0.01, Number(p.pl_orbper || p.koi_period || i + 1)),
        anomaly: Math.random() * Math.PI * 2,
        index: i,
      };
      sceneRef.current.add(mesh);

      const segments = 256;
      const positions = new Float32Array(segments * 3);
      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        positions[s * 3] =
          semiMajor * Math.cos(theta) - semiMajor * eccentricity;
        positions[s * 3 + 1] = 0;
        positions[s * 3 + 2] = semiMinor * Math.sin(theta);
      }
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        ),
        new THREE.LineBasicMaterial({
          color: 0xffaa33,
          transparent: true,
          opacity: 0.3,
        })
      );
      sceneRef.current.add(orbitLine);

      planetsRef.current.push({ mesh, orbitLine, data: p });
    });

    planetsRef.current = planetsRef.current.filter(
      ({ data, mesh, orbitLine }) => {
        const exists = planets.some((p) => p.kepoi_name === data.kepoi_name);
        if (!exists) {
          sceneRef.current.remove(mesh);
          sceneRef.current.remove(orbitLine);
        }
        return exists;
      }
    );
  }, [planets]);

  // Drag panel handlers
  const handleMouseDown = (e) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y,
    };
  };
  const handleMouseMove = (e) =>
    dragging &&
    setPanelPos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  const handleMouseUp = () => setDragging(false);

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Camera Tools Panel */}
      <div
        style={{
          position: "absolute",
          top: panelPos.y,
          left: panelPos.x,
          zIndex: 100,
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <div
          onMouseDown={handleMouseDown}
          style={{
            background: "#1e1e1e",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "5px 5px 0 0",
            fontWeight: "bold",
          }}
          onClick={() => setToolsOpen(!toolsOpen)}
        >
          Camera Tools {toolsOpen ? "▲" : "▼"}
        </div>

        {toolsOpen && (
          <div
            style={{
              background: "#2c2c2c",
              borderRadius: "0 0 5px 5px",
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, color: "#aaa" }}>
              Hold Shift + Left-click + Drag to move the camera center
            </div>
            <ControlCheckbox
              label="Enable Rotate"
              checked={cameraSettings.enableRotate}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, enableRotate: val }))
              }
            />
            <ControlCheckbox
              label="Enable Zoom"
              checked={cameraSettings.enableZoom}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, enableZoom: val }))
              }
            />
            <ControlCheckbox
              label="Enable Pan"
              checked={cameraSettings.enablePan}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, enablePan: val }))
              }
            />
            <ControlSlider
              label="Damping Factor"
              min={0}
              max={0.2}
              step={0.01}
              value={cameraSettings.dampingFactor}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, dampingFactor: val }))
              }
            />
            <ControlSlider
              label="Rotate Speed"
              min={0}
              max={5}
              step={0.1}
              value={cameraSettings.rotateSpeed}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, rotateSpeed: val }))
              }
            />
            <ControlSlider
              label="Zoom Speed"
              min={0}
              max={5}
              step={0.1}
              value={cameraSettings.zoomSpeed}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, zoomSpeed: val }))
              }
            />
            <ControlSlider
              label="Pan Speed"
              min={0}
              max={5}
              step={0.1}
              value={cameraSettings.panSpeed}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, panSpeed: val }))
              }
            />
            <ControlSlider
              label="FOV"
              min={10}
              max={120}
              step={1}
              value={cameraSettings.fov}
              onChange={(val) => setCameraSettings((s) => ({ ...s, fov: val }))}
            />
            <ControlSlider
              label="Depth"
              min={500}
              max={10000}
              step={100}
              value={cameraSettings.depth}
              onChange={(val) =>
                setCameraSettings((s) => ({ ...s, depth: val }))
              }
            />
            <button
              style={{
                marginTop: 5,
                padding: "6px 12px",
                background: "#444",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
              onClick={() => {
                controlsRef.current.target.copy(initialCameraTarget.current);
                cameraRef.current.position.set(0, 60, 180);
              }}
            >
              Reset Camera Center
            </button>
            <button
              style={{
                marginTop: 5,
                padding: "6px 12px",
                background: "#444",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
              onClick={() =>
                setCameraSettings({
                  enableRotate: true,
                  enableZoom: true,
                  enablePan: true,
                  dampingFactor: 0.08,
                  rotateSpeed: 1,
                  zoomSpeed: 1.2,
                  panSpeed: 1,
                  fov: 60,
                  depth: 5000,
                })
              }
            >
              Reset Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ControlCheckbox({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {label}{" "}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function ControlSlider({ label, min, max, step, value, onChange }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", fontSize: 13 }}>
      {label}: {value}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

function makeGlowCanvas(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,240,200,0.95)");
  gradient.addColorStop(0.2, "rgba(255,200,100,0.6)");
  gradient.addColorStop(0.5, "rgba(255,120,10,0.12)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

function updateControls(controls, settings) {
  controls.enableRotate = settings.enableRotate;
  controls.enableZoom = settings.enableZoom;
  controls.enablePan = settings.enablePan;
  controls.dampingFactor = settings.dampingFactor;
  controls.rotateSpeed = settings.rotateSpeed;
  controls.zoomSpeed = settings.zoomSpeed;
  controls.panSpeed = settings.panSpeed;
}
