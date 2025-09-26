// src/components/Dashboard/utils.js
export function synthesizeLightCurve(planet) {
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
