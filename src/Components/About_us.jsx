import React, { useState } from "react";
import Navbar from "./Header";

export default function AboutUs() {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      name: "Aya Moahamed",
      role: "Web/UI Designer",
      desc: "UX & Front Ideas interface polish",
      img: "/team/aya.jpg",
      linkedin:
        "https://www.linkedin.com/in/aya-mohamed-samir-5780a9267?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      education: "Bachelor of computer science  - mansora University",
      more: "Specializes in UI/UX for interactive dashboards and immersive interfaces.",
    },

    {
      name: "Ali Ibrahim",
      role: "AI/ML Engineer",
      desc: "Exoplanet classification ML Model",
      img: "/team/ali_new.jpg",
      linkedin: "https://www.linkedin.com/in/ali-khedr-773087205/",
      education: "BSc in Biomedical Engineering  - Cairo University",
      more: "Develops ML models to classify exoplanets and analyze astronomical data.",
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
      education: "BSc in Engineering - university of science and technology ",
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

  return (
    <div className="storytelling-container">
      <style>{`
        .storytelling-container {
          padding: 40px 20px;
          background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
          color: #fff;
          font-family: "Poppins", sans-serif;
        }

        .centered-section {
          text-align: center;
          position: relative;
        }

        .section-title {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(90deg, #ffcc00, #ff66cc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #ccc;
          max-width: 700px;
          margin: 0 auto 40px auto;
        }

        /* Team Cards */
        .team-cards-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 30px;
        }

        .team-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10%;
          padding: 25px;
          width: 180px;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.5);
          transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
          cursor: pointer;
        }

        .team-card:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 16px 40px rgba(255,204,0,0.5);
          background: rgba(255, 255, 255, 0.1);
        }

        .team-img-container {
          width: 100px;
          height: 100px;
          margin-bottom: 10px;
          overflow: hidden;
          border-radius: 50%;
          border: 3px solid #ffcc00;
          box-shadow: 0 0 15px rgba(255,204,0,0.5);
        }

        .team-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .team-card h3 {
          font-size: 1rem;
          color: #ffcc00;
          margin: 5px 0;
        }

        .team-card h4 {
          font-size: 0.85rem;
          color: #fff;
          font-weight: 400;
        }

        .team-card button {
          margin-top: 10px;
          padding: 6px 12px;
          background: #ffcc00;
          color: #000;
          border: none;
          border-radius: 20px;
          font-weight: bold;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .team-card button:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px #ffcc00;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-content {
          background: #1e1b3a;
          border-radius: 20px;
          max-width: 800px;
          width: 95%;
          padding: 40px;
          text-align: center;
          position: relative;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .modal-content img {
          width: 350px;
          height: 350px;
          object-fit: cover;
          border-radius: 8px;
          border: 4px solid #ffcc00;
          margin-bottom: 25px;
        }

        .modal-content h2 {
          font-size: 2.5rem;
          color: #ffcc00;
          margin-bottom: 10px;
        }

        .modal-content h4 {
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 20px;
        }

        .modal-content p {
          font-size: 1.1rem;
          color: #ccc;
          margin: 6px 0;
          line-height: 1.5;
        }

        .modal-content a {
          color: #ffcc00;
          text-decoration: none;
          margin: 0 12px;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 2rem;
          cursor: pointer;
          color: #ffcc00;
        }

        /* Achievements Section */
        .achievements-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 25px;
          margin-top: 30px;
        }

        .achievement-card {
          background: rgba(255,255,255,0.05);
          border-radius: 15px;
          padding: 25px;
          width: 260px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .achievement-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(255,204,0,0.5);
        }

        .achievement-card h3 {
          font-size: 1.2rem;
          color: #ffcc00;
          margin-bottom: 8px;
        }

        .achievement-card p {
          font-size: 0.95rem;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .team-cards-container, .achievements-container {
            gap: 15px;
          }
          .team-card, .achievement-card {
            width: 48%;
          }
          .modal-content img {
            width: 250px;
            height: 250px;
          }
        }

        @media (max-width: 480px) {
          .team-card, .achievement-card {
            width: 100%;
          }
          .modal-content img {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>

      <Navbar />

      {/* Intro */}
      <section className="team-intro centered-section">
        <h2 className="section-title">👩‍🚀 Meet Our Team</h2>
        <p className="section-subtitle">
          The brilliant minds powering CZMU's mission to explore the universe!
        </p>
      </section>

      {/* Team Cards */}
      <section className="team-section centered-section">
        <div className="team-cards-container">
          {teamMembers.map((member, idx) => (
            <div className="team-card" key={idx}>
              <div className="team-img-container">
                <img src={member.img} alt={member.name} className="team-img" />
              </div>
              <h3>{member.name}</h3>
              <h4>{member.role}</h4>
              <button onClick={() => setSelectedMember(member)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section centered-section">
        <h2 className="section-title">🏆 Our Achievements</h2>
        <div className="achievements-container">
          {achievements.map((item, idx) => (
            <div className="achievement-card" key={idx}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span
              className="modal-close"
              onClick={() => setSelectedMember(null)}
            >
              &times;
            </span>
            <img src={selectedMember.img} alt={selectedMember.name} />
            <h2>👤 {selectedMember.name}</h2>
            <h4>💼 {selectedMember.role}</h4>
            <p>📝 {selectedMember.desc}</p>
            <p>📚 {selectedMember.more}</p>
            <p>🎓 {selectedMember.education}</p>
            <p>
              🔗{" "}
              <a href={selectedMember.linkedin} target="_blank">
                LinkedIn
              </a>
              | 🐱{" "}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
