import React, { useEffect, useState, useRef } from "react";

export default function CandidatesList({
  listTitle = "Candidates",
  fetchCandidates,
  loadedPlanets,
  onLoadCandidate,
  onUnloadCandidate,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const listRef = useRef(null);
  const LIMIT = 10;

  // 🔹 Load data with current offset
  const loadData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchCandidates(offset, LIMIT);
      if (data.length > 0) {
        setRows((prev) => [...prev, ...data]);
        setOffset((prev) => prev + LIMIT); // increment offset only after successful fetch
      }
    } catch (err) {
      console.error("CandidatesList loadData error:", err);
    }
    setLoading(false);
  };

  // 🔹 Initial load
  useEffect(() => {
    setRows([]);
    setOffset(0);
    loadData();
    // eslint-disable-next-line
  }, [fetchCandidates]);

  // 🔹 Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        loadData();
      }
    };

    const el = listRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => el && el.removeEventListener("scroll", handleScroll);
  }, [rows, loading]); // listen to rows & loading to avoid duplicate fetches

  return (
    <div style={{ padding: 8, marginBottom: 16 }}>
      <h4>{listTitle}</h4>
      <div
        ref={listRef}
        style={{
          maxHeight: 300,
          overflowY: "auto",
          borderTop: "1px solid #222",
        }}
      >
        {rows.length === 0 && !loading && (
          <div style={{ padding: 8 }}>No results</div>
        )}
        {rows.map((r, i) => {
          const id = r.kepoi_name || r.pl_name || r.kepid || `row-${i}`;
          const isLoaded = loadedPlanets.some(
            (p) => p.kepoi_name === r.kepoi_name
          );
          return (
            <div
              key={id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 8,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: isLoaded ? "rgba(0, 120, 255, 0.2)" : "transparent",
                borderRadius: "6px",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{id}</div>
                <div style={{ fontSize: 12, color: "#bbb" }}>
                  Period: {r.koi_period || r.pl_orbper || "—"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {isLoaded ? (
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      background: isLoaded
                        ? "linear-gradient(90deg, #ff4d4d, #ff1a1a)"
                        : "linear-gradient(90deg, #4da6ff, #1a8cff)",
                      color: "#fff",
                      transition: "0.2s",
                    }}
                    onClick={() =>
                      isLoaded ? onUnloadCandidate(r) : onLoadCandidate(r)
                    }
                  >
                    {isLoaded ? "Unload" : "Load"}
                  </button>
                ) : (
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      background: isLoaded
                        ? "linear-gradient(90deg, #ff4d4d, #ff1a1a)"
                        : "linear-gradient(90deg, #4da6ff, #1a8cff)",
                      color: "#fff",
                      transition: "0.2s",
                    }}
                    onClick={() =>
                      isLoaded ? onUnloadCandidate(r) : onLoadCandidate(r)
                    }
                  >
                    {isLoaded ? "Unload" : "Load"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {loading && <div style={{ padding: 8 }}>Loading...</div>}
      </div>
    </div>
  );
}
