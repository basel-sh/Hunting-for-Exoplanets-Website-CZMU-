// src/components/Dashboard/ThreeScene.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SunTexture from "../../Assets/Sun.jpg";
import SpaceTexture from "../../Assets/Space.png";
import GanymedeTexture from "../../Assets/ganymede.jpg";

export default function ThreeScene({
  planets,
  mode,
  speed,
  paused,
  onSelectPlanet,
}) {
  const mountRef = useRef(null);
  const planetsRef = useRef([]);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sunRef = useRef(null);
  const controlsRef = useRef(null);

  // store speed & paused without reloading scene
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Space background sphere
    const spaceTex = new THREE.TextureLoader().load(SpaceTexture);
    spaceTex.wrapS = THREE.RepeatWrapping;
    spaceTex.wrapT = THREE.RepeatWrapping;
    spaceTex.repeat.set(8, 8);

    const spaceGeo = new THREE.SphereGeometry(2000, 64, 64);
    const spaceMat = new THREE.MeshBasicMaterial({
      map: spaceTex,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(spaceGeo, spaceMat));
    sceneRef.current = scene;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
    camera.position.set(0, 60, 140);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const point = new THREE.PointLight(0xfff0c0, 2.2, 1000);
    point.position.set(0, 0, 0);
    scene.add(point);

    // Sun
    const sunTex = new THREE.TextureLoader().load(SunTexture);
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(10, 48, 48),
      new THREE.MeshBasicMaterial({ map: sunTex })
    );
    scene.add(sun);
    sunRef.current = sun;

    // Glow
    const spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(makeGlowCanvas(256)),
      color: 0xffdd99,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(80, 80, 1);
    scene.add(sprite);

    // Planets
    planetsRef.current = [];
    const ORBIT_SCALE = 12;
    const PLANET_SIZE_SCALE = 6;
    const textureLoader = new THREE.TextureLoader();

    planets.forEach((p, i) => {
      const orbitBase = Number(p.pl_orbsmax || p.koi_period || (i + 1) * 0.6);
      const orbitRadius = Math.max(6, orbitBase * ORBIT_SCALE);

      const pivot = new THREE.Object3D();
      scene.add(pivot);

      const size = Math.max(
        0.3,
        Number(p.koi_radius || p.pl_rade || 1) * PLANET_SIZE_SCALE
      );
      const geo = new THREE.SphereGeometry(size, 32, 32);

      // ✅ Force all planets to use ganymede.jpg
      const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(GanymedeTexture),
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(orbitRadius, 0, 0);
      mesh.userData = {
        ...p,
        orbitRadius,
        orbitSpeed:
          1 / Math.max(0.01, Number(p.pl_orbper || p.koi_period || i + 1)),
        index: i,
      };

      pivot.add(mesh);
      planetsRef.current.push({ mesh, pivot, data: p });

      // Orbit line
      const segments = 128;
      const positions = new Float32Array(segments * 3);
      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        positions[s * 3] = Math.cos(theta) * orbitRadius;
        positions[s * 3 + 1] = 0;
        positions[s * 3 + 2] = Math.sin(theta) * orbitRadius;
      }
      const orbitGeom = new THREE.BufferGeometry();
      orbitGeom.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      const orbitLine = new THREE.LineLoop(
        orbitGeom,
        new THREE.LineBasicMaterial({
          color: 0x333444,
          opacity: 0.6,
          transparent: true,
        })
      );
      orbitLine.rotation.y = Math.PI / 2;
      scene.add(orbitLine);
    });

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(e) {
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
        hit.scale.set(original.x * 1.18, original.y * 1.18, original.z * 1.18);
        setTimeout(() => hit.scale.copy(original), 300);
        onSelectPlanet(hit.userData);
      }
    }
    renderer.domElement.addEventListener("click", onClick);

    // Animate
    let raf = null;
    function animate() {
      raf = requestAnimationFrame(animate);
      if (!pausedRef.current) {
        if (sunRef.current)
          sunRef.current.rotation.y += 0.002 * speedRef.current;
        planetsRef.current.forEach(({ mesh, pivot }) => {
          mesh.rotation.y += 0.012 * speedRef.current;
          pivot.rotation.y +=
            mesh.userData.orbitSpeed * 0.048 * speedRef.current;
        });
      }
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [planets, onSelectPlanet]); // keep deps minimal

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// Glow helper
function makeGlowCanvas(size = 256) {
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
