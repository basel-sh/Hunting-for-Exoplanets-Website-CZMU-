import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ----------------- DATA -----------------
const confusionMatrix = {
  headers: ["Pred: False Positive", "Pred: Confirmed"],
  rows: [
    ["True: False Positive", 832, 91],
    ["True: Confirmed", 51, 1149],
  ],
};

const barData = [
  { name: "NASA Candidates", value: 876 },
  { name: "Resolved by Model", value: 658 },
  { name: "Confirmed (Model)", value: 384 },
  { name: "False Positive (Model)", value: 274 },
  { name: "Undecided", value: 218 },
];

const missionResolutionData = [
  { mission: "K2", percentage: 78.9 },
  { mission: "Kepler", percentage: 75.0 },
  { mission: "TESS", percentage: 68.9 },
];

// ----------------- REUSABLE Info Button -----------------
function InfoButton({ text }) {
  const [show, setShow] = useState(false);

  const styles = {
    container: {
      position: "relative",
      display: "inline-block",
      marginLeft: "10px",
    },
    button: {
      background: "#facc15",
      color: "#111827",
      border: "none",
      borderRadius: "50%",
      width: "26px",
      height: "26px",
      cursor: "pointer",
      fontWeight: "bold",
      textAlign: "center",
      lineHeight: "26px",
      fontSize: "14px",
    },
    tooltip: {
      position: "absolute",
      top: "35px",
      left: "0",
      background: "#1f2937",
      color: "#e5e7eb",
      padding: "12px",
      borderRadius: "8px",
      fontSize: "0.9rem",
      width: "220px",
      zIndex: 50,
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      transition: "opacity 0.2s ease-in-out",
      opacity: show ? 1 : 0,
      visibility: show ? "visible" : "hidden",
    },
  };

  return (
    <div
      style={styles.container}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button style={styles.button}>i</button>
      <div style={styles.tooltip}>{text}</div>
    </div>
  );
}

// ----------------- COMPONENT -----------------
export default function OurModel() {
  const styles = {
    container: {
      padding: "40px",
      background: "#111827", // Dark slate
      minHeight: "100vh",
      color: "#e5e7eb",
      fontFamily: "Inter, sans-serif",
    },
    title: {
      fontSize: "2.5rem",
      textAlign: "center",
      marginBottom: "30px",
      color: "#facc15", // Amber accent
      fontWeight: "600",
    },
    section: {
      background: "#1f2937",
      padding: "24px",
      borderRadius: "16px",
      marginBottom: "40px",
      lineHeight: "1.7",
      fontSize: "1.05rem",
    },
    sectionTitle: {
      fontSize: "1.75rem",
      textAlign: "center",
      marginBottom: "16px",
      color: "#facc15",
    },
    sectionSubtitle: {
      textAlign: "center",
      marginBottom: "24px",
      color: "#9ca3af",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "center",
    },
    th: {
      border: "1px solid #374151",
      padding: "12px",
      background: "#111827",
      color: "#facc15",
    },
    td: {
      border: "1px solid #374151",
      padding: "12px",
    },
    chartCard: {
      background: "#1f2937",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "40px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Title */}
      <h1 style={styles.title}>🚀 Our Exoplanet Vetting Model</h1>

      {/* Model Description */}
      <section style={styles.section}>
        <p>
          We model exoplanet vetting as a <b>supervised classification task</b>{" "}
          using <b>physically motivated features</b> computed by NASA’s
          transit‐photometry pipelines. Instead of raw light curves, we merge
          Kepler KOI, K2, and TESS TOI catalogs into a standardized schema.
        </p>
        <p style={{ marginTop: "15px" }}>
          Features include: <b>orbital period</b>, <b>transit duration</b>,{" "}
          <b>transit depth</b>, <b>impact parameter</b>, <b>SNR</b>,{" "}
          <b>planet radius</b>, and <b>stellar parameters</b>. Metadata from
          NASA vetting flags are also incorporated.
        </p>
        <p style={{ marginTop: "15px" }}>
          Labels are harmonized to <b>CONFIRMED (1)</b> vs{" "}
          <b>FALSE POSITIVE (0)</b>. Candidates are held out for scoring. We use{" "}
          <b>group‐by‐host cross-validation</b> with <b>isotonic regression</b>{" "}
          for calibrated probabilities.
        </p>
      </section>

      {/* Confusion Matrix */}
      <h1 style={styles.sectionTitle}>
        📊 Confusion Matrix
        <InfoButton text="The confusion matrix shows how well the model distinguishes between true confirmed planets and false positives." />
      </h1>
      <p style={styles.sectionSubtitle}>
        Evaluated on held-out CONFIRMED vs FALSE POSITIVE labels.
      </p>

      <div style={styles.chartCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}></th>
              {confusionMatrix.headers.map((h, i) => (
                <th key={i} style={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {confusionMatrix.rows.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td key={j} style={styles.td}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidate Resolution */}
      <h1 style={styles.sectionTitle}>
        📈 Candidate Resolution
        <InfoButton text="This graph explains how many candidates were resolved into confirmed planets, false positives, or left undecided." />
      </h1>
      <p style={styles.sectionSubtitle}>
        From <b>876 NASA Candidates</b>, our model resolves <b>75.1%</b>:
        Confirmed = 384, False Positive = 274, Undecided = 218.
      </p>

      <div style={styles.chartCard}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              formatter={(val) => [`${val}`, "Count"]}
              contentStyle={{ background: "#111827", border: "none" }}
            />
            <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mission Resolution */}
      <h1 style={styles.sectionTitle}>
        🌌 Resolved Candidates by Mission
        <InfoButton text="This shows resolution performance across missions (K2, Kepler, TESS), demonstrating model generalization." />
      </h1>
      <p style={styles.sectionSubtitle}>
        Resolution by mission: K2 = 78.9%, Kepler = 75%, TESS = 68.9%.
      </p>

      <div style={styles.chartCard}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            layout="vertical"
            data={missionResolutionData}
            margin={{ left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
            <YAxis type="category" dataKey="mission" stroke="#9ca3af" />
            <Tooltip
              formatter={(val) => [`${val}%`, "Resolution"]}
              contentStyle={{ background: "#111827", border: "none" }}
            />
            <Bar dataKey="percentage" fill="#34d399" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
