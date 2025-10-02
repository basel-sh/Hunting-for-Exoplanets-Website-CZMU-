import React from "react";
import Navbar from "./Header";




export default function About_us() {
  return (
    <div className="storytelling-container">
      <Navbar />
      <section className="storytelling">
        <h1>Our Journey to Discover New Worlds</h1>
        <p>
          We started with NASA’s open data, using AI to explore thousands of stars
          and exoplanets. Step by step, we built tools to visualize and predict
          which worlds might be habitable.
        </p>
        <p>
          This is not just science, it’s storytelling. Each planet has a story
          waiting to be discovered.
        </p>
      </section>
    </div>
  );
}
