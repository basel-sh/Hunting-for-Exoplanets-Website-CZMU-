// PlanetGame.jsx — animated level characters + win dance + modern UI
import React, { useState, useEffect, useCallback, useRef } from "react";
import Papa from "papaparse";

export default function PlanetGame({ csvUrl = "/candidates_scored.csv" }) {
  const [rows, setRows] = useState([]);
  const [used, setUsed] = useState(new Set());
  const [level, setLevel] = useState(1);
  const [openLevels, setOpenLevels] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const levelRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!levelRef.current) return;
      if (!levelRef.current.contains(e.target)) setOpenLevels(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ----------------- QUIZ CONFIG -----------------
  const REQUIRED_BY_LEVEL = {
    1: ["mission", "planet_radius_rearth", "orbital_period_days"],
    2: ["transit_depth_ppm", "transit_duration_hours", "stellar_teff_k"],
    3: ["transit_depth_ppm", "planet_radius_rearth"],
  };

  const NUMERIC_FIELDS = new Set([
    "orbital_period_days",
    "transit_duration_hours",
    "transit_depth_ppm",
    "planet_radius_rearth",
    "impact_param",
    "snr",
    "stellar_teff_k",
    "stellar_logg_cgs",
    "stellar_radius_rsun",
    "stellar_metallicity",
    "fpflag_nt",
    "fpflag_ss",
    "fpflag_co",
    "fpflag_ec",
  ]);

  const ID_CANDIDATES = [
    "planet_id",
    "kepoi_name",
    "koi_name",
    "epic_name",
    "toi",
    "pl_name",
    "tic_id",
  ];

  const POINTS_RIGHT = { 1: 5, 2: 10, 3: 20 };
  const POINTS_WRONG = -5;
  const WIN_SCORE = 100;

  const fmtNum = (x, d = 2) => {
    const v = Number(x);
    return Number.isFinite(v) ? v.toFixed(d) : "unknown";
  };
  const bucketTemp = (teff) => {
    const t = Number(teff);
    if (!Number.isFinite(t)) return "unknown";
    if (t < 4500) return "cool";
    if (t < 6000) return "sun-like";
    return "hot";
  };
  const bucketRadius = (rp) => {
    const r = Number(rp);
    if (!Number.isFinite(r)) return "unknown";
    if (r < 1.5) return "Earth-size";
    if (r < 3) return "Super-Earth";
    if (r < 6) return "Mini-Neptune";
    if (r < 12) return "Neptune-to-Sub-Jupiter";
    return "Gas giant";
  };
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const choices = (correct, pool, k = 3) => {
    const alt = shuffle(pool.filter((p) => p !== correct)).slice(0, k);
    return shuffle([correct, ...alt]);
  };
  const numTol = (value, rel = 0.1, absMin = 0) => {
    const v = Number(value);
    if (!Number.isFinite(v)) return { value: null, tol: null };
    return { value: v, tol: Math.max(Math.abs(v) * rel, absMin) };
  };
  const ensureColumns = (row) => {
    const cols = [
      "planet_id",
      "mission",
      "orbital_period_days",
      "transit_duration_hours",
      "transit_depth_ppm",
      "planet_radius_rearth",
      "impact_param",
      "snr",
      "stellar_teff_k",
      "stellar_logg_cgs",
      "stellar_radius_rsun",
      "stellar_metallicity",
      "fpflag_nt",
      "fpflag_ss",
      "fpflag_co",
      "fpflag_ec",
    ];
    const out = { ...row };
    for (const c of cols) if (!(c in out)) out[c] = null;
    return out;
  };
  const attachPlanetId = (row, idx = 0) => {
    for (const k of ID_CANDIDATES) {
      if (row[k] != null && String(row[k]).trim().length > 0) {
        return { ...row, planet_id: String(row[k]) };
      }
    }
    const mission = row.mission ? String(row.mission) : "X";
    return { ...row, planet_id: `${mission}_${idx}` };
  };

  // ----------------- QUIZ GENERATION -----------------
  const generateQuizForRow = useCallback((row, level = 1) => {
    const r = ensureColumns(row);
    const {
      mission = "Unknown",
      orbital_period_days: P,
      transit_duration_hours: Tdur,
      transit_depth_ppm: depth,
      planet_radius_rearth: rp,
      impact_param: b,
      stellar_teff_k: teff,
    } = r;

    const depthFrac =
      depth != null && Number.isFinite(+depth) && +depth >= 0
        ? Math.sqrt(+depth / 1e6)
        : null;

    const q1 = [];
    if (mission !== "Unknown") {
      q1.push({
        difficulty: 1,
        type: "mcq",
        question: "Which NASA survey spotted this candidate exoplanet?",
        choices: choices(String(mission), [
          "Kepler",
          "K2",
          "TESS",
          "Hubble",
          "JWST",
          "Gaia",
        ]),
        correct_answer: String(mission),
      });
    }
    const rb = bucketRadius(rp);
    if (rb !== "unknown") {
      q1.push({
        difficulty: 1,
        type: "mcq",
        question: "About how big is this planet compared to Earth?",
        choices: choices(rb, [
          "Earth-size",
          "Super-Earth",
          "Mini-Neptune",
          "Gas giant",
        ]),
        correct_answer: rb,
      });
    }
    if (P != null && Number.isFinite(+P)) {
      q1.push({
        difficulty: 1,
        type: "true_false",
        question: `True or False: This planet takes < 10 days to orbit (≈${fmtNum(
          P,
          1
        )} d).`,
        correct_answer: +P < 10 ? "True" : "False",
      });
    }

    const q2 = [];
    if (depth != null && Number.isFinite(+depth)) {
      const dval = Math.round(+depth);
      const opts = new Set([
        `${dval.toLocaleString()} ppm`,
        `${Math.round(dval * 0.5).toLocaleString()} ppm`,
        `${Math.round(dval * 1.5).toLocaleString()} ppm`,
        `${Math.round(dval * 0.2).toLocaleString()} ppm`,
      ]);
      q2.push({
        difficulty: 2,
        type: "mcq",
        question: "Approximate transit depth?",
        choices: shuffle([...opts]).slice(0, 4),
        correct_answer: `${dval.toLocaleString()} ppm`,
      });
    }
    const tb = bucketTemp(teff);
    if (tb !== "unknown") {
      q2.push({
        difficulty: 2,
        type: "mcq",
        question: "Based on T_eff, the host star is:",
        choices: choices(tb, ["cool", "sun-like", "hot"]),
        correct_answer: tb,
      });
    }
    if (Tdur != null && Number.isFinite(+Tdur)) {
      const base = Math.max(0.1, Math.round(+Tdur * 10) / 10);
      const distract = [base - 1.5, base + 1.2, base + 3.0, base - 2.4]
        .filter((x) => x > 0)
        .map((x) => `${x.toFixed(1)} hr`);
      q2.push({
        difficulty: 2,
        type: "mcq",
        question: "Which option is closest to the transit duration?",
        choices: shuffle([`${base.toFixed(1)} hr`, ...distract]).slice(0, 4),
        correct_answer: `${base.toFixed(1)} hr`,
      });
    }

    const q3 = [];
    if (depthFrac != null && Number.isFinite(+depthFrac)) {
      const { value, tol } = numTol(depthFrac, 0.15, 0.01);
      q3.push({
        difficulty: 3,
        type: "numeric",
        question: "Estimate Rp/R* using Rp/R* ≈ sqrt(depth).",
        correct_answer: value,
        tolerance: tol,
      });
    }
    if (rp != null && Number.isFinite(+rp)) {
      const { value, tol } = numTol(rp, 0.1, 0.1);
      q3.push({
        difficulty: 3,
        type: "numeric",
        question: "What is the planet’s radius in Earth radii (R⊕)?",
        correct_answer: value,
        tolerance: tol,
      });
    }
    if (b != null && Number.isFinite(+b)) {
      const bb = +b;
      const correct =
        bb >= 0.8
          ? "Near grazing"
          : bb <= 0.3
          ? "Central-ish"
          : "Intermediate chord";
      q3.push({
        difficulty: 3,
        type: "mcq",
        question: "Given impact parameter b, what is the transit geometry?",
        choices: choices(correct, [
          "Central-ish",
          "Intermediate chord",
          "Near grazing",
        ]),
        correct_answer: correct,
      });
    }

    if (level === 1) return q1.slice(0, 3);
    if (level === 2)
      return q2.length >= 3 ? q2.slice(0, 3) : [...q2, ...q1].slice(0, 3);
    if (level === 3)
      return q3.length >= 3
        ? q3.slice(0, 3)
        : [...q3, ...q2, ...q1].slice(0, 3);
    return [...q1, ...q2, ...q3].slice(0, 3);
  }, []);

  const pickRandomCandidate = useCallback(
    (rows, usedSet = new Set(), level = 1) => {
      const req = REQUIRED_BY_LEVEL[level] || REQUIRED_BY_LEVEL[1];
      const ok = rows.filter(
        (r) =>
          req.every((c) =>
            NUMERIC_FIELDS.has(c)
              ? Number.isFinite(Number(r[c]))
              : r[c] != null && String(r[c]).trim().length > 0
          ) && !usedSet.has(String(r.planet_id))
      );
      const pool = ok.length ? ok : rows;
      if (!pool.length) return { planet_id: "none", mission: "Unknown" };
      const row = pool[Math.floor(Math.random() * pool.length)];
      usedSet.add(String(row.planet_id));
      return row;
    },
    []
  );

  // ----------------- LOAD CSV -----------------
  useEffect(() => {
    setStatus("loading");
    Papa.parse(csvUrl, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          const raw = res.data.filter((r) => Object.keys(r).length > 1);
          const withIds = raw.map((r, i) =>
            attachPlanetId(ensureColumns(r), i)
          );
          setRows(withIds);
          setStatus("ready");
        } catch (e) {
          console.error(e);
          setStatus("error");
        }
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        setStatus("error");
      },
    });
  }, [csvUrl]);

  // ----------------- ACTIONS / SCORING -----------------
  const newQuiz = () => {
    if (!rows.length || won) return;
    const row = pickRandomCandidate(rows, new Set(used), level);
    if (!row || row.planet_id === "none") return;
    setUsed((prev) => new Set(prev).add(row.planet_id));
    setCurrentRow(row);
    setQuestions(generateQuizForRow(row, level));
  };

  const applyScore = (isCorrect) => {
    const delta = isCorrect ? POINTS_RIGHT[level] ?? 0 : POINTS_WRONG;
    const next = Math.max(0, score + delta);
    setScore(next);
    if (next >= WIN_SCORE) setWon(true);
  };

  const handleAnswer = (qIdx, answer) => {
    if (won) return;
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx || q.userAnswer) return q;
        const isCorrect =
          q.type === "numeric"
            ? Math.abs(Number(answer) - Number(q.correct_answer)) <=
              (q.tolerance ?? 0)
            : String(answer) === String(q.correct_answer);
        applyScore(isCorrect);
        return { ...q, userAnswer: answer, correct: isCorrect };
      })
    );
  };

  const resetScore = () => {
    setScore(0);
    setWon(false);
  };

  // ----------------- CHARACTER PANEL -----------------
  const LEVEL_LABELS = {
    1: "Level 1 — Kids (+5 / −5)",
    2: "Level 2 — Intermediate (+10 / −5)",
    3: "Level 3 — Scientist (+20 / −5)",
  };

  const CharacterPanel = ({ level, won, score }) => {
    let title = "";
    let emojiLeft = "";
    let emojiRight = "";
    let tagline = "";

    if (level === 1) {
      title = "Space Buddy";
      emojiLeft = "🛸";
      emojiRight = "🚀";
      tagline = won
        ? "YOU DID IT! Dance time!"
        : "Answer and earn points — you got this!";
    } else if (level === 2) {
      title = "Mission Control";
      emojiLeft = "🤖";
      emojiRight = "🛰️";
      tagline = won
        ? "Mission accomplished — excellent work."
        : "Maintain trajectory. Precision matters!";
    } else {
      title = "Chief Scientist";
      emojiLeft = "🧑‍🚀";
      emojiRight = "🔬";
      tagline = won
        ? "Breakthrough achieved — outstanding!"
        : "Form a hypothesis… then test it!";
    }

    return (
      <div style={ui.charWrap}>
        <div style={ui.charCard}>
          <div style={ui.charHeader}>
            <span style={ui.charBadge}>{title}</span>
            <span style={ui.charScore}>Score: {score}</span>
          </div>

          <div style={ui.charScene}>
            {/* floating particles */}
            <div className="sparkle s1">✦</div>
            <div className="sparkle s2">✺</div>
            <div className="sparkle s3">✸</div>

            {/* character cluster */}
            <div
              className={`avatar ${
                won
                  ? "dance"
                  : level === 1
                  ? "bounce"
                  : level === 2
                  ? "bob"
                  : "drift"
              }`}
            >
              <span className="emoji left">{emojiLeft}</span>
              <span className="centerFace">
                {level === 1 ? "👾" : level === 2 ? "🤖" : "🧑‍🚀"}
              </span>
              <span className="emoji right">{emojiRight}</span>
            </div>

            {/* speech bubble */}
            <div className={`bubble ${won ? "celebrate" : ""}`}>
              {won ? "🎉 100 points! You win!" : tagline}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------- RENDER -----------------
  return (
    <div style={ui.page}>
      <style>{css}</style>

      <div style={ui.wrap}>
        <header style={ui.header}>
          <h1 style={ui.title}>🌌 Exoplanet Quiz</h1>
          <p style={ui.subtitle}>
            Earn points as you learn. Reach <b>{WIN_SCORE}</b> to win!
          </p>
        </header>

        <CharacterPanel level={level} won={won} score={score} />

        {/* Score + Controls */}
        <section style={ui.scoreboard}>
          <div style={ui.scoreBox}>
            <div style={ui.scoreLabel}>Progress</div>
            <div style={ui.scoreValue}>{score}</div>
            <div style={ui.progressWrap}>
              <div
                style={{
                  ...ui.progressBar,
                  width: `${Math.min(100, (score / WIN_SCORE) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div style={ui.controlsRight}>
            {/* Custom dropdown */}
            <div style={ui.selectWrap} ref={levelRef}>
              <label style={ui.label}>Difficulty</label>
              <button
                type="button"
                role="combobox"
                aria-expanded={openLevels}
                onClick={() => setOpenLevels((s) => !s)}
                disabled={won}
                style={ui.selectButton}
              >
                <span>{LEVEL_LABELS[level]}</span>
                <span style={ui.caret} aria-hidden>
                  ▾
                </span>
              </button>

              {openLevels && (
                <div role="listbox" style={ui.menu}>
                  {[1, 2, 3].map((lv) => (
                    <div
                      role="option"
                      aria-selected={level === lv}
                      key={lv}
                      style={ui.menuItem(level === lv)}
                      onClick={() => {
                        setLevel(lv);
                        setOpenLevels(false);
                      }}
                    >
                      {LEVEL_LABELS[lv]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={ui.btnRow}>
              <button
                style={ui.primaryBtn}
                className="jelly"
                onClick={newQuiz}
                disabled={status !== "ready" || won}
              >
                <span style={{ marginRight: 8 }}>🪐</span>
                New Question Set
              </button>
              <button style={ui.ghostBtn} onClick={resetScore}>
                Reset Score
              </button>
            </div>
          </div>
        </section>

        {won && (
          <div style={ui.winBanner}>
            🎉 You reached {WIN_SCORE} points — You win! Keep playing or reset
            your score.
          </div>
        )}

        {status === "loading" && <div style={ui.note}>Loading dataset…</div>}
        {status === "error" && (
          <div style={ui.error}>
            Couldn’t load <code>{csvUrl}</code>. Ensure the file is in{" "}
            <code>public/</code> and the path is correct.
          </div>
        )}

        {currentRow && (
          <div style={ui.card}>
            <div style={ui.cardHeader}>
              <span style={ui.pill}>{currentRow.mission}</span>
              <span style={ui.kv}>
                <strong>ID</strong> {currentRow.planet_id}
              </span>
            </div>
            <div style={ui.cardBody}>
              <div style={ui.kv}>
                <strong>P</strong> {fmtNum(currentRow.orbital_period_days, 2)} d
              </div>
              <div style={ui.kv}>
                <strong>Tdur</strong>{" "}
                {fmtNum(currentRow.transit_duration_hours, 2)} hr
              </div>
              <div style={ui.kv}>
                <strong>Depth</strong> {fmtNum(currentRow.transit_depth_ppm, 0)}{" "}
                ppm
              </div>
            </div>
          </div>
        )}

        <div className="qgrid" style={ui.qgrid}>
          {questions.map((q, idx) => (
            <div key={idx} style={ui.card}>
              <div style={ui.qTitle}>
                <span style={ui.qIndex}>Q{idx + 1}</span>
                <span>{q.question}</span>
              </div>

              {q.type === "mcq" && (
                <div style={ui.choices}>
                  {q.choices.map((ch) => (
                    <button
                      key={ch}
                      style={ui.choiceBtn(
                        q.userAnswer,
                        ch === q.correct_answer
                      )}
                      onClick={() => handleAnswer(idx, ch)}
                      disabled={q.userAnswer || won}
                      className="pop"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "true_false" && (
                <div style={ui.choices}>
                  {["True", "False"].map((ch) => (
                    <button
                      key={ch}
                      style={ui.choiceBtn(
                        q.userAnswer,
                        ch === q.correct_answer
                      )}
                      onClick={() => handleAnswer(idx, ch)}
                      disabled={q.userAnswer || won}
                      className="pop"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "numeric" && (
                <div style={ui.choices}>
                  <input
                    type="number"
                    step="any"
                    placeholder="Type your estimate…"
                    onBlur={(e) => handleAnswer(idx, e.target.value)}
                    disabled={q.userAnswer || won}
                    style={ui.input}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------
   Styles (centered + animated)
   ---------------------------- */
const ui = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% -10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(900px 500px at 120% 10%, rgba(16,185,129,0.20), transparent 50%), #0b1020",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6vh 16px",
    color: "#e9eef9",
  },
  wrap: { width: "100%", maxWidth: 980, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 16 },
  title: {
    fontSize: "clamp(24px, 4vw, 40px)",
    fontWeight: 800,
    letterSpacing: 0.3,
    margin: 0,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.85,
    fontSize: "clamp(14px, 1.8vw, 16px)",
  },

  scoreboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1.3fr",
    gap: 16,
    alignItems: "stretch",
    marginBottom: 20,
  },
  scoreBox: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06))",
    border: "1px solid rgba(255,255,255,.16)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  },
  scoreLabel: { opacity: 0.85, marginBottom: 6, fontSize: 13 },
  scoreValue: { fontSize: 36, fontWeight: 800, lineHeight: 1 },
  progressWrap: {
    marginTop: 12,
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,.12)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.16)",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #a3e635)",
    transition: "width .3s ease",
  },

  controlsRight: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06))",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 18,
    padding: 16,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  },

  /* Custom dropdown */
  selectWrap: { position: "relative", display: "grid", gap: 6 },
  label: { fontSize: 13, opacity: 0.9 },
  selectButton: {
    appearance: "none",
    textAlign: "left",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: 12,
    padding: "12px 14px",
    outline: "none",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  caret: { marginLeft: 12, opacity: 0.85 },
  menu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 6,
    background: "rgba(10,15,30,.9)",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 12,
    boxShadow: "0 16px 40px rgba(0,0,0,.45)",
    overflow: "hidden",
    zIndex: 30,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },
  menuItem: (active) => ({
    padding: "10px 14px",
    cursor: "pointer",
    background: active
      ? "linear-gradient(135deg, rgba(99,102,241,.25), rgba(99,102,241,.12))"
      : "transparent",
    color: active ? "#e5e7ff" : "#e9eef9",
    borderBottom: "1px solid rgba(255,255,255,.06)",
  }),

  btnRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: {
    appearance: "none",
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 700,
    letterSpacing: 0.3,
    background:
      "linear-gradient(135deg, #22c55e 0%, #84cc16 35%, #a3e635 100%)",
    color: "#0b1324",
    cursor: "pointer",
    boxShadow:
      "0 10px 25px rgba(34,197,94,.35), inset 0 1px 0 rgba(255,255,255,.3)",
    transform: "translateZ(0)",
    transition: "transform .12s ease, box-shadow .2s ease, filter .2s ease",
  },
  ghostBtn: {
    appearance: "none",
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 700,
    letterSpacing: 0.3,
    background: "transparent",
    color: "#e9eef9",
    border: "1px solid rgba(255,255,255,.25)",
    cursor: "pointer",
    transition: "transform .12s ease, box-shadow .2s ease, filter .2s ease",
  },

  card: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06))",
    border: "1px solid rgba(255,255,255,.16)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  },
  cardHeader: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  cardBody: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
    marginTop: 8,
  },
  pill: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background:
      "linear-gradient(135deg, rgba(59,130,246,.25), rgba(59,130,246,.10))",
    border: "1px solid rgba(59,130,246,.35)",
    fontSize: 13,
    color: "#dbeafe",
  },
  kv: { opacity: 0.95 },

  qgrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  qTitle: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontWeight: 700,
    marginBottom: 12,
  },
  qIndex: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(99,102,241,.25)",
    border: "1px solid rgba(99,102,241,.45)",
  },
  choices: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  choiceBtn: (answered, isCorrect) => ({
    appearance: "none",
    border: "1px solid rgba(255,255,255,.16)",
    background: answered
      ? isCorrect
        ? "linear-gradient(135deg, rgba(34,197,94,.35), rgba(34,197,94,.18))"
        : "linear-gradient(135deg, rgba(239,68,68,.35), rgba(239,68,68,.18))"
      : "linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.06))",
    color: "#e9eef9",
    padding: "12px 14px",
    borderRadius: 12,
    cursor: answered ? "default" : "pointer",
    transition:
      "transform .12s ease, box-shadow .2s ease, border-color .2s ease, filter .2s ease",
    boxShadow: answered ? "none" : "0 8px 20px rgba(0,0,0,.25)",
  }),
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: 12,
    outline: "none",
  },

  note: { opacity: 0.9, marginBottom: 16 },
  error: {
    background: "rgba(239,68,68,.15)",
    border: "1px solid rgba(239,68,68,.35)",
    color: "#fecaca",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  winBanner: {
    background:
      "linear-gradient(135deg, rgba(34,197,94,.35), rgba(34,197,94,.18))",
    border: "1px solid rgba(34,197,94,.45)",
    color: "#eaffea",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontWeight: 700,
    textAlign: "center",
  },

  /* Character Panel */
  charWrap: { margin: "0 0 18px 0" },
  charCard: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06))",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  },
  charHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  charBadge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(99,102,241,.25)",
    border: "1px solid rgba(99,102,241,.35)",
  },
  charScore: { fontWeight: 700, opacity: 0.9 },
  charScene: {
    position: "relative",
    overflow: "hidden",
    minHeight: 92,
    display: "flex",
    alignItems: "center",
  },
};

const css = `
  @media (max-width: 860px) {
    section { grid-template-columns: 1fr !important; }
  }
  button[disabled] { filter: grayscale(.2) brightness(.9); cursor: not-allowed !important; opacity: .75; }
  button:hover:not([disabled]) { filter: brightness(1.05); }
  button:active:not([disabled]) { transform: translateY(1px) scale(0.995); }

  /* Fun button micro-animations */
  .jelly:hover { animation: jelly .5s ease both; }
  .pop:hover { transform: translateY(-1px) scale(1.02); }
  @keyframes jelly {
    0%,100%{ transform: scale(1,1); }
    25%{ transform: scale(0.98,1.02); }
    50%{ transform: scale(1.02,0.98); }
    75%{ transform: scale(0.99,1.01); }
  }

  /* Character animations */
  .avatar { display:flex; align-items:center; gap:14px; font-size:32px; }
  .avatar .centerFace { font-size:44px; filter: drop-shadow(0 4px 12px rgba(0,0,0,.35)); }
  .avatar.bounce { animation: bounce 1.8s ease-in-out infinite; }
  .avatar.bob { animation: bob 3.2s ease-in-out infinite; }
  .avatar.drift { animation: drift 6s ease-in-out infinite; }
  .avatar.dance { animation: dance 0.9s ease-in-out infinite; }
  @keyframes bounce { 0%{transform:translateY(0)} 50%{transform:translateY(-8px)} 100%{transform:translateY(0)} }
  @keyframes bob { 0%{transform:translateY(0)} 50%{transform:translateY(-4px)} 100%{transform:translateY(0)} }
  @keyframes drift { 0%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(1deg)} 100%{transform:translateY(0) rotate(0deg)} }
  @keyframes dance {
    0%{transform: rotate(0) scale(1)}
    25%{transform: rotate(8deg) scale(1.05)}
    50%{transform: rotate(0) scale(1.08)}
    75%{transform: rotate(-8deg) scale(1.05)}
    100%{transform: rotate(0) scale(1)}
  }

  /* Sparkles */
  .sparkle { position:absolute; opacity:.8; font-size:14px; pointer-events:none; }
  .s1 { left: 10px; top: 10px; animation: floatUp 4.5s linear infinite; }
  .s2 { left: 40%; top: 50%; animation: floatUp 5.2s linear infinite; }
  .s3 { right: 16px; bottom: 8px; animation: floatUp 6s linear infinite; }
  @keyframes floatUp { 
    0%{ transform: translateY(10px); opacity:.0 } 
    20%{ opacity:.6 } 
    80%{ opacity:.6 } 
    100%{ transform: translateY(-18px); opacity:0 } 
  }

  /* Speech bubble */
  .bubble {
    position:absolute; right: 10px; top: 8px;
    max-width: 60%; padding: 10px 12px; border-radius: 12px;
    background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18);
    font-size: 13px; line-height: 1.25; backdrop-filter: blur(6px);
    animation: bubbleIn .25s ease both;
  }
  .bubble.celebrate { background: rgba(34,197,94,.20); border-color: rgba(34,197,94,.45); }
  @keyframes bubbleIn { from { opacity: 0; transform: translateY(-6px);} to { opacity: 1; transform: translateY(0);} }
`;
