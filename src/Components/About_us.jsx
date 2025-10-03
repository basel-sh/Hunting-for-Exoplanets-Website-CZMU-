// AboutUs.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Header";

export default function AboutUs() {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      name: "Mariam Ahmed",
      role: "Hardware & Prototyping",
      desc: "Interactive toy demo",
      img: "/team/mariam.jpg",
      linkedin: "https://www.linkedin.com/in/mariam-ahmed-424229318/",
      education:
        "BSc in Electronics and Electrical Communication Engineering - Cairo University",
      more: "Prototyping innovative devices for interactive exhibitions.",
    },
    {
      name: "Basel Shrief",
      role: "Frontend & Backend Developer",
      desc: "3D Explorer & Dashboard integration & BackEnd API's",
      img: "/team/basel.jpg",
      linkedin: "https://www.linkedin.com/in/basel-shrief",
      education:
        "BSc in Electronics and Electrical Communication Engineering - Cairo University",
      more: "Full-stack dev, integrating 3D planet explorers and backend APIs.",
    },
    {
      name: "Ali Ibrahim",
      role: "AI/ML Engineer",
      desc: "Exoplanet classification ML Model",
      img: "/team/ali_new.jpg",
      linkedin: "https://www.linkedin.com/in/ali-khedr-773087205/",
      education: "BSc in Biomedical Engineering - Cairo University",
      more: "Develops ML models to classify exoplanets and analyze astronomical data.",
    },
    {
      name: "Aya Moahamed",
      role: "Web/UI Designer",
      desc: "UX & Front Ideas interface polish",
      img: "/team/aya.jpg",
      linkedin:
        "https://www.linkedin.com/in/aya-mohamed-samir-5780a9267?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      education: "Bachelor of computer science - Mansoura University",
      more: "Specializes in UI/UX for interactive dashboards and immersive interfaces.",
    },
    {
      name: "Farah Elhebeishy",
      role: "Storytelling & Presentation",
      desc: "Connecting science & culture",
      img: "/team/farah.jpg",
      linkedin: "https://www.linkedin.com/in/farah-elhebeishy/",
      education: "Computer & Communications Engineering - Cairo University",
      more: "Where technology meets imagination.",
    },
    {
      name: "Nour Wael",
      role: "Documentation & Scripts",
      desc: "Editing Video and Display our Idea",
      img: "/team/nour.jpg",
      linkedin:
        "https://www.linkedin.com/in/nour-wael-3b359a2b3?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      education: "BSc in Engineering - University of Science and Technology",
      more: "Creates educational content, scripts, and video tutorials.",
    },
  ];

  const achievements = [
    {
      title: "100+ Exoplanets Analyzed",
      desc: "Our AI models processed massive datasets from NASA.",
    },
    {
      title: "3D Interactive Dashboard",
      desc: "Visualize exoplanets in real-time with our 3D planet explorer.",
    },
    {
      title: "Community Engagement",
      desc: "Inspiring students worldwide with interactive workshops.",
    },
  ];

  // Close modal with ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedMember(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="about-wrap">
      <style>{styles}</style>
      <Navbar />

      {/* Hero */}
      <header className="hero">
        <div className="halo" />
        <h1 className="hero-title">
          Meet the Crew <span>Behind Exo Hunters</span>
        </h1>
        <p className="hero-sub">
          Designers, engineers, and storytellers on a mission to make space
          discovery modern, playful, and accessible.
        </p>
      </header>

      {/* Team */}
      <section className="section">
        <h2 className="section-title">Core Team</h2>
        <div className="team-grid">
          {teamMembers.map((m, i) => (
            <article
              key={i}
              className="neo-card"
              onClick={() => setSelectedMember(m)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedMember(m)}
            >
              {/* animated border glow (behind) */}
              <span className="border-anim" aria-hidden="true" />

              {/* top spacer so ribbon never overlaps text */}
              <div className="ribbon-safe" />

              {/* floating role ribbon (moved higher & smaller to avoid overlap) */}
              <span className="ribbon" aria-hidden="true">
                {m.role}
              </span>

              <div className="card-top">
                <div className="avatar-shadow">
                  <img className="avatar" src={m.img} alt={m.name} />
                </div>
                <div className="id">
                  <h3 className="name" title={m.name}>
                    {m.name}
                  </h3>
                  <p className="desc" title={m.desc}>
                    {m.desc}
                  </p>
                </div>
              </div>

              <div className="chips">
                <span className="chip">{m.role}</span>
              </div>

              <div className="card-bottom">
                <button
                  className="btn primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMember(m);
                  }}
                >
                  View Details
                </button>
                <a
                  className="btn ghost"
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  LinkedIn
                </a>
              </div>

              {/* tiny decorative stars */}
              <span className="spark s1" aria-hidden="true">
                ✦
              </span>
              <span className="spark s2" aria-hidden="true">
                ✦
              </span>
              <span className="spark s3" aria-hidden="true">
                ✦
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="section">
        <h2 className="section-title">What We’ve Built</h2>
        <div className="ach-grid">
          {achievements.map((a, i) => (
            <div key={i} className="ach">
              <div className="ach-icon">🚀</div>
              <div>
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedMember && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedMember(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {/* gradient header bar */}
            <div className="modal-headbar" />

            <button
              className="close"
              onClick={() => setSelectedMember(null)}
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>

            {/* split panel */}
            <div className="modal-body-split">
              <div className="modal-left">
                <img
                  className="modal-avatar"
                  src={selectedMember.img}
                  alt={selectedMember.name}
                />
                <div className="modal-left-info">
                  <h3 className="modal-name">{selectedMember.name}</h3>
                  <span className="badge">{selectedMember.role}</span>
                </div>
              </div>

              <div className="modal-right">
                <div className="kv">
                  <div className="kv-key">About</div>
                  <div className="kv-value">{selectedMember.desc}</div>
                </div>
                <div className="kv">
                  <div className="kv-key">Highlights</div>
                  <div className="kv-value">{selectedMember.more}</div>
                </div>
                <div className="kv">
                  <div className="kv-key">Education</div>
                  <div className="kv-value">{selectedMember.education}</div>
                </div>

                <div className="modal-actions">
                  <a
                    className="btn primary wide"
                    href={selectedMember.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit LinkedIn
                  </a>
                  <button
                    className="btn soft"
                    onClick={() => setSelectedMember(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = `
:root{
  --bg:#0b0f1f; --bg2:#0e1631;
  --card: rgba(255,255,255,.06);
  --ink:#eef2ff; --muted:#9fb1d1;
  --brand:#7ad1ff; --accent:#ffd479; --rose:#ff8ab3;
  --line:#ffffff1f;
}

/* page */
.about-wrap{
  min-height:100vh;
  background:
    radial-gradient(900px 600px at 10% -10%, rgba(122,209,255,.18), transparent 60%),
    radial-gradient(1200px 700px at 90% -20%, rgba(255,138,179,.14), transparent 60%),
    linear-gradient(180deg, var(--bg), var(--bg2));
  color:var(--ink);
  font-family:"Poppins", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

/* hero */
.hero{ max-width:1100px; margin:0 auto; padding:72px 20px 36px; text-align:center; position:relative; }
.halo{ position:absolute; inset:-10% 0 auto 0; height:340px; z-index:-1; filter:blur(40px);
  background:
    radial-gradient(closest-side, rgba(122,209,255,.22), transparent),
    radial-gradient(closest-side, rgba(255,212,121,.18), transparent 60%);
}
.hero-title{ font-size:clamp(28px,5vw,44px); margin:0 0 10px; letter-spacing:.2px; }
.hero-title span{ background:linear-gradient(90deg,var(--brand),var(--accent)); -webkit-background-clip:text; background-clip:text; color:transparent; }
.hero-sub{ color:var(--muted); max-width:800px; margin:0 auto; }

/* sections */
.section{ max-width:1180px; margin:0 auto; padding:28px 20px 56px; }
.section-title{
  text-align:center; margin:0 0 22px;
  font-size:clamp(22px,3.8vw,34px);
  background:linear-gradient(90deg,var(--accent),var(--rose));
  -webkit-background-clip:text; background-clip:text; color:transparent;
}

/* team grid */
.team-grid{
  display:grid; gap:22px;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
}

/* card */
.neo-card{
  position:relative; overflow:hidden; border-radius:20px;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid rgba(255,255,255,.12);
  padding:16px 16px 14px; display:flex; flex-direction:column; gap:14px;
  box-shadow: 0 18px 40px rgba(0,0,0,.35);
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.neo-card:hover{ transform: translateY(-8px); box-shadow: 0 28px 60px rgba(0,0,0,.45); border-color: rgba(255,255,255,.18); }

/* animated border glow (behind content) */
.border-anim{
  content:""; position:absolute; inset:-2px; border-radius:22px; z-index:0;
  background: conic-gradient(from 120deg, var(--brand), var(--accent), var(--rose), var(--brand));
  filter: blur(16px); opacity:.16;
  animation: spin 8s linear infinite;
}
@keyframes spin{ to { transform: rotate(360deg);} }

/* keeps ribbon from overlapping text by reserving space */
.ribbon-safe{ height: 8px; }

/* ribbon moved up & smaller */
.ribbon{
  position:absolute; top:8px; right:-6px; z-index:2;
  background:linear-gradient(135deg, var(--brand), var(--accent));
  color:#111; font-weight:800; font-size:11px; padding:6px 12px 6px 16px;
  border-top-left-radius:999px; border-bottom-left-radius:999px;
  box-shadow: 0 6px 16px rgba(0,0,0,.35); pointer-events:none;
}

/* top row */
.card-top{ position:relative; z-index:1; display:flex; gap:14px; align-items:center; }
.avatar-shadow{ position:relative; }
.avatar{
  width:88px; height:88px; border-radius:14px; object-fit:cover; display:block;
  border:3px solid rgba(255,255,255,.9); box-shadow: 0 10px 24px rgba(0,0,0,.35);
}
.id{ flex:1; min-width:0; }
.name{
  margin:0 0 6px; font-size:18px; letter-spacing:.2px; line-height:1.3;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.desc{
  margin:0; color:var(--muted); font-size:14px; line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}

/* chips row */
.chips{ display:flex; gap:8px; flex-wrap:wrap; z-index:1; }
.chip{
  font-size:12px; font-weight:800; color:#111;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  padding:6px 10px; border-radius:999px;
}

/* bottom row buttons */
.card-bottom{ display:flex; gap:10px; z-index:1; }
.btn{
  appearance:none; border:1px solid rgba(255,255,255,.25); color:var(--ink); background:transparent;
  padding:10px 12px; border-radius:12px; font-weight:800; font-size:14px; cursor:pointer;
  transition: transform .2s, background .2s, border-color .2s, box-shadow .2s;
}
.btn:hover{ transform: translateY(-2px); border-color: rgba(255,255,255,.45); box-shadow: 0 6px 16px rgba(0,0,0,.25); }
.btn.primary{ border:none; color:#111; background:linear-gradient(135deg, var(--brand), var(--accent)); }
.btn.ghost{ background:rgba(255,255,255,.06); }

/* tiny decorative stars */
.spark{ position:absolute; font-size:12px; opacity:.45; }
.s1{ top:16px; left:16px; }
.s2{ bottom:18px; right:22px; }
.s3{ bottom:10px; left:26px; }

/* achievements */
.ach-grid{
  display:grid; gap:18px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.ach{
  display:flex; gap:12px; align-items:flex-start; padding:16px 18px;
  background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
  border-radius:16px; backdrop-filter: blur(8px);
}
.ach-icon{ font-size:22px; }
.ach-title{ font-weight:800; margin-bottom:4px; }
.ach-desc{ color:var(--muted); font-size:14px; }

/* modal overlay */
.overlay{
  position:fixed; inset:0; background:rgba(5,8,20,.72); backdrop-filter: blur(8px);
  display:flex; align-items:center; justify-content:center; padding:16px; z-index:1000; animation: fade .2s ease;
}
@keyframes fade{ from{opacity:0} to{opacity:1} }

/* modal shell */
.modal{
  width:min(980px, 96vw); border-radius:20px; overflow:hidden;
  background: linear-gradient(180deg, rgba(20,24,52,.96), rgba(10,14,34,.96));
  border:1px solid rgba(255,255,255,.12); box-shadow:0 30px 80px rgba(0,0,0,.55);
  animation: pop .22s ease; position:relative;
}
@keyframes pop{ from{transform: scale(.96); opacity:.7} to{transform: scale(1); opacity:1} }

/* gradient header bar */
.modal-headbar{
  height:10px; background:linear-gradient(90deg, var(--brand), var(--accent), var(--rose));
}

/* close button */
.close{
  position:absolute; right:14px; top:14px; font-size:20px; line-height:1;
  background:rgba(255,255,255,.1); border:1px solid var(--line); color:#fff; cursor:pointer;
  width:36px; height:36px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  transition: transform .15s, background .2s, border-color .2s;
}
.close:hover{ transform: translateY(-1px); background:rgba(255,255,255,.16); border-color:#ffffff42; }

/* split panel */
.modal-body-split{
  display:grid; grid-template-columns: 340px 1fr; gap:0; align-items:stretch;
}
.modal-left{
  padding:18px 18px 22px; border-right:1px solid var(--line); display:flex; flex-direction:column; align-items:center; gap:14px;
  background: radial-gradient(400px 240px at 50% -10%, rgba(122,209,255,.15), transparent 60%);
}
.modal-avatar{
  width:220px; height:220px; border-radius:16px; object-fit:cover; border:3px solid rgba(255,255,255,.9);
  box-shadow: 0 20px 40px rgba(0,0,0,.45);
}
.modal-left-info{ text-align:center; }
.modal-name{ margin:10px 0 6px; font-size:22px; letter-spacing:.2px; }
.badge{
  display:inline-block; font-size:12px; font-weight:900; letter-spacing:.2px; color:#111;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  padding:6px 10px; border-radius:999px;
}

.modal-right{
  padding:18px 20px 20px; display:flex; flex-direction:column; gap:14px;
}
.kv{ display:grid; grid-template-columns: 120px 1fr; gap:10px; align-items:start; }
.kv + .kv{ border-top:1px dashed var(--line); padding-top:12px; }
.kv-key{ color:#cfe2ff; font-weight:800; font-size:13px; text-transform:uppercase; letter-spacing:.6px; }
.kv-value{ color:var(--ink); opacity:.9; }

.modal-actions{
  margin-top:auto; display:flex; gap:10px; justify-content:flex-end; padding-top:8px;
}
.btn.wide{ min-width:180px; }
.btn.soft{
  background:rgba(255,255,255,.06); border:1px solid var(--line);
}

/* responsive */
@media (max-width: 800px){
  .modal-body-split{ grid-template-columns: 1fr; }
  .modal-left{ border-right:none; border-bottom:1px solid var(--line); }
  .modal-avatar{ width:180px; height:180px; }
  .kv{ grid-template-columns: 1fr; }
}

@media (max-width:560px){
  .card-top{ gap:12px; }
  .avatar{ width:84px; height:84px; border-radius:12px; }
  .chips{ gap:6px; }
  .chip{ font-size:11px; padding:5px 9px; }
  .ribbon{ top:6px; font-size:10px; }
}

/* ===== RESPONSIVE ENHANCEMENTS — APPEND AFTER YOUR EXISTING styles ===== */

/* Large tablets / small laptops */
@media (max-width: 1200px){
  .section{ padding:24px 16px 48px; }
  .team-grid{ grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:20px; }
  .neo-card{ padding:14px; }
  .name{ font-size:clamp(16px, 2.2vw, 18px); }
  .desc{ font-size:clamp(13px, 1.8vw, 14px); }
}

/* Tablets */
@media (max-width: 992px){
  .hero{ padding:64px 16px 32px; }
  .section{ padding:22px 16px 44px; }
  .team-grid{ grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:18px; }
  .avatar{ width:80px; height:80px; border-radius:12px; }
  .ribbon{ top:6px; right:-6px; font-size:10px; padding:6px 10px 6px 14px; }
  .btn{ font-size:13px; padding:9px 10px; }
  .ach-grid{ grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .modal{ width:min(860px, 96vw); }
  .modal-avatar{ width:200px; height:200px; }
}

/* Large phones / small tablets */
@media (max-width: 768px){
  .hero{ padding:56px 14px 28px; }
  .section{ padding:20px 14px 40px; }
  .team-grid{ grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; }
  .neo-card{ padding:12px; border-radius:16px; }
  .card-top{ gap:12px; }
  .avatar{ width:74px; height:74px; }
  .name{ font-size:16px; }
  .desc{ -webkit-line-clamp:3; }
  .chips{ gap:6px; }
  .chip{ font-size:11px; padding:5px 9px; }
  .ribbon{ top:6px; font-size:10px; transform: translateX(0); }
  .ach{ padding:14px 16px; }
  .ach-title{ font-size:15px; }
  .ach-desc{ font-size:13px; }
  .modal{ width:94vw; }
  .modal-avatar{ width:180px; height:180px; }
  .kv{ grid-template-columns: 1fr; gap:8px; }
  .modal-actions{ flex-direction:column; align-items:stretch; }
  .btn.wide{ min-width:0; width:100%; }
}

/* Phones */
@media (max-width: 560px){
  .hero{ padding:48px 12px 24px; }
  .hero-title{ font-size:clamp(24px, 7vw, 32px); }
  .section{ padding:18px 12px 36px; }
  .team-grid{ grid-template-columns: 1fr; }
  .neo-card{ padding:12px; }
  .avatar{ width:68px; height:68px; }
  .name{ font-size:15px; }
  .desc{ font-size:13px; }
  .ribbon{
    top:6px; right:8px; border-radius:999px;
    padding:4px 10px; font-size:10px; box-shadow:none;
  }
  .card-bottom{ gap:8px; }
  .btn{ font-size:13px; padding:9px 10px; }
  .ach-grid{ grid-template-columns: 1fr; }
  .ach{ padding:12px 14px; }
  .overlay{ padding:10px; }
  .modal{ width:96vw; }
  .modal-avatar{ width:160px; height:160px; }
}

/* Very small phones */
@media (max-width: 380px){
  .hero-title{ font-size:clamp(22px, 8vw, 28px); }
  .avatar{ width:60px; height:60px; }
  .name{ font-size:14px; }
  .desc{ font-size:12px; }
  .btn{ font-size:12px; padding:8px 9px; }
  .modal-avatar{ width:140px; height:140px; }
}

/* Safe-area padding (iOS notch, etc.) */
.about-wrap{
  padding-left: max(0px, env(safe-area-inset-left));
  padding-right: max(0px, env(safe-area-inset-right));
}

/* Keyboard/focus friendliness on touch devices */
@media (hover:none){
  .btn:hover{ transform:none; box-shadow:none; }
  .neo-card:hover{ transform:none; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce){
  .border-anim,
  .overlay,
  .modal{ animation:none !important; }
}
`;
