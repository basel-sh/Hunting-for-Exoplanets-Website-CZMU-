// src/components/Dashboard/api.js
import axios from "axios";

const BASE_URL = "https://engbasel-kepler-ml-datasets.hf.space";

export async function predictPlanetAPI(planet) {
  try {
    const payload = {
      koi_period: Number(planet.koi_period || planet.pl_orbper || 0),
      koi_duration: Number(planet.koi_duration || 0.1),
      koi_radius: Number(planet.koi_radius || planet.pl_rade || 1),
      insolation: Number(planet.insolation || planet.pl_insol || 1.0),
    };

    const res = await axios.post(`${BASE_URL}/predict_json`, payload, {
      timeout: 10000,
    });

    // Adapt to backend response
    if (res.data?.predictions?.length > 0) {
      const pred = res.data.predictions[0];
      return {
        label: pred.final_label,
        probability: pred.prob_planet,
      };
    }

    return null;
  } catch (err) {
    console.error("/predict_json error:", err?.response || err?.message || err);
    return null;
  }
}

// Predict from CSV
export async function predictCSVAPI(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${BASE_URL}/predict_csv`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 20000,
    });

    return res.data;
  } catch (err) {
    console.error("/predict_csv error:", err?.response || err?.message || err);
    return null;
  }
}
