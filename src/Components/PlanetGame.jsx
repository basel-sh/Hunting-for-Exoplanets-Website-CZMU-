import React, { useState, useEffect } from "react";
import "./PlanetGame.css";

// أصوات للعبة
//import correctSound from "../assets/correct.mp3";
//import wrongSound from "../assets/wrong.mp3";

export default function PlanetGame({ planets }) {
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPlanet, setCurrentPlanet] = useState(null);

  useEffect(() => {
    if (planets && planets.length > 0 && currentIndex < planets.length) {
      setCurrentPlanet(planets[currentIndex]);
    } else {
      setCurrentPlanet(null);
    }
  }, [planets, currentIndex]);

  //  const audio = new Audio(type === "correct" ? correctSound : wrongSound);
  //audio.play();
  //الي تحت هيتمسح لما احمل الساوندس

  const playSound = (type) => {
    // مؤقتًا مش هنشغل صوت
    return;
  };

  const handleAnswer = (choice) => {
    if (!currentPlanet) return;
    if (choice === currentPlanet.habitable) {
      setScore(score + 1);
      playSound("correct");
    } else {
      playSound("wrong");
    }
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
    }, 500);
  };

  if (!planets || planets.length === 0) {
    return <p>Loading planets data...</p>;
  }

  if (currentIndex >= planets.length) {
    return (
      <div className="planet-game">
        <h2>Game Over!</h2>
        <p>
          Your Score: {score} / {planets.length}
        </p>
        <button
          onClick={() => {
            setScore(0);
            setCurrentIndex(0);
          }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="planet-game">
      <h2>Is this planet habitable?</h2>

      {currentPlanet ? (
        <>
          <img
            src={currentPlanet.image}
            alt={currentPlanet.name}
            className="planet-img"
          />
          <h3>{currentPlanet.name}</h3>
          <p>Radius: {currentPlanet.radius}</p>
          <p>Distance: {currentPlanet.distance}</p>

          <div className="game-buttons">
            <button onClick={() => handleAnswer(true)}>Yes</button>
            <button onClick={() => handleAnswer(false)}>No</button>
          </div>

          <p>Score: {score}</p>
        </>
      ) : (
        <p>Loading planet data...</p>
      )}
    </div>
  );
}
