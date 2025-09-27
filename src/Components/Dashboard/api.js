import axios from "axios";

const BASE_URL = "https://engbasel-kepler-ml-datasets.hf.space";

// 🔹 Fetch Kepler candidates with pagination
export async function fetchKeplerCandidatesAPI(offset = 0, limit = 10) {
  try {
    const res = await axios.get(
      `${BASE_URL}/candidates_kepler_only?offset=${offset}&limit=${limit}`,
      { timeout: 20000 }
    );
    return res.data ?? [];
  } catch (err) {
    console.error(
      "fetchKeplerCandidatesAPI error:",
      err?.response || err?.message || err
    );
    return [];
  }
}

// 🔹 Fetch TESS candidates with pagination
export async function fetchTESSCandidatesAPI(offset = 0, limit = 10) {
  try {
    const res = await axios.get(
      `${BASE_URL}/candidates_tess_only?offset=${offset}&limit=${limit}`,
      { timeout: 20000 }
    );
    const data = res.data ?? [];

    // Map keys to match Kepler for ThreeScene
    return data.map((planet) => ({
      kepoi_name: planet.toidisplay || planet.toi || planet.tid,
      pl_orbper: planet.pl_orbper,
      pl_rade: planet.pl_rade,
      pl_insol: planet.pl_insol,
      pl_eqt: planet.pl_eqt,
      pl_trandurh: planet.pl_trandurh,
      pl_trandep: planet.pl_trandep,
      st_dist: planet.st_dist,
      st_teff: planet.st_teff,
      st_rad: planet.st_rad,
      // add any other keys you need for display or prediction
    }));
  } catch (err) {
    console.error(
      "fetchTESSCandidatesAPI error:",
      err?.response || err?.message || err
    );
    return [];
  }
}

// 🔹 Predict from JSON row
export async function predictPlanetAPI(planet) {
  try {
    const payload = {
      koi_period: Number(planet.koi_period || planet.pl_orbper || 0),
      koi_duration: Number(planet.koi_duration || 0.1),
      koi_radius: Number(planet.koi_prad || planet.pl_rade || 1),
      insolation: Number(planet.koi_insol || planet.pl_insol || 1.0),
    };
    const res = await axios.post(`${BASE_URL}/predict_json`, payload, {
      timeout: 10000,
    });
    if (res.data?.predictions?.length > 0) {
      const pred = res.data.predictions[0];
      return { label: pred.final_label, probability: pred.prob_planet };
    }
    return null;
  } catch (err) {
    console.error("/predict_json error:", err?.response || err?.message || err);
    return null;
  }
}

// 🔹 Predict from CSV upload
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
