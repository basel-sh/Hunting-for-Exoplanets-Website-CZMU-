import React from "react";
import Particles from "@tsparticles/react";

export default function BackgroundParticles() {
  const particlesOptions = {
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: { value: "#000011" } },
    particles: {
      number: { value: 100, density: { enable: true, area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.8 },
      size: { value: { min: 1, max: 2 } },
      move: { enable: true, speed: 0.2, direction: "none" },
    },
  };

  return <Particles id="tsparticles" options={particlesOptions} />;
}

