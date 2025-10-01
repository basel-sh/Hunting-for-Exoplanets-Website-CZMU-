import React, { useState, useEffect, useRef } from "react";
import "./PlanetGame.css";

export default function PlanetGame({ objects }) {
  // حالات اللعبة: 'story', 'playing', 'end'
  const [gameState, setGameState] = useState("story");
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentObject, setCurrentObject] = useState(null);
  const [showAlien, setShowAlien] = useState(false);
  const [dialogueQueue, setDialogueQueue] = useState([]);
  const [dialogue, setDialogue] = useState("");
  const [isWaiting, setIsWaiting] = useState(false); // لتعطيل الأزرار أثناء الانتظار

  const audioRef = useRef(null);

  // الحوارات منظمة في صفوف (queues) لتسلسل العرض
  const dialogues = {
    start: [
      {
        text: "👩‍🚀 Let’s start exploring the universe!",
        audio: "/audio/start1.mp3",
      },
      {
        text: "👽 I’ll test you with some mysterious objects!",
        audio: "/audio/start2.mp3",
      },
    ],
    correct: [
      {
        text: "👽 Confirmed! This is a real planet 🚀",
        audio: "/audio/correct1.mp3",
      },
      { text: "👩‍🚀 Great job, co-pilot!", audio: "/audio/correct2.mp3" },
    ],
    wrong: [
      { text: "👽 Oops, that’s not right ❌", audio: "/audio/wrong1.mp3" },
      { text: "👩‍🚀 Don’t worry, we’ll try again!", audio: "/audio/wrong2.mp3" },
    ],
    end: [
      {
        text: "👩‍🚀 We explored the galaxy together. Thanks, astronaut!",
        audio: "/audio/end1.mp3",
      },
      {
        text: "👽 That was fun! Until next mission 👋",
        audio: "/audio/end2.mp3",
      },
    ],
  };

  // تشغيل الصوت مع إدارة المرجع
  const playAudio = (src) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (src) {
      audioRef.current = new Audio(src);
      audioRef.current.play();
    }
  };

  // عرض الحوار التالي في الصف
  const playNextDialogue = () => {
    if (dialogueQueue.length === 0) {
      setDialogue("");
      return;
    }
    const [next, ...rest] = dialogueQueue;
    setDialogue(next.text);
    playAudio(next.audio);
    setDialogueQueue(rest);
  };

  // عند تغيير صف الحوارات، نبدأ تشغيل أول حوار
  useEffect(() => {
    if (dialogueQueue.length > 0) {
      playNextDialogue();
    }
    // eslint-disable-next-line
  }, [dialogueQueue]);

  // عند انتهاء الصوت، ننتقل للحوار التالي تلقائياً
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      playNextDialogue();
    };

    audioRef.current.addEventListener("ended", handleEnded);
    return () => {
      if (audioRef.current)
        audioRef.current.removeEventListener("ended", handleEnded);
    };
  }, [dialogueQueue]);

  // بدء اللعبة بعد انتهاء القصة أو تخطيها
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setCurrentIndex(0);
    setShowAlien(false);
    setDialogueQueue([...dialogues.start]);
  };

  // تحديث الكائن الحالي عند تغير currentIndex أو objects
  useEffect(() => {
    if (gameState === "playing" && objects && currentIndex < objects.length) {
      setCurrentObject(objects[currentIndex]);
      setShowAlien(false);
      setIsWaiting(false);
    } else if (gameState === "playing" && currentIndex >= objects.length) {
      // نهاية اللعبة
      setGameState("end");
      setDialogueQueue([...dialogues.end]);
      setShowAlien(true);
    }
    // eslint-disable-next-line
  }, [currentIndex, objects, gameState]);

  // التعامل مع إجابة اللاعب
  const handleAnswer = (choice) => {
    if (isWaiting || !currentObject) return;

    setIsWaiting(true);
    const isCorrect = choice === currentObject.isPlanet;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setDialogueQueue([...dialogues.correct]);
    } else {
      setDialogueQueue([...dialogues.wrong]);
    }

    setShowAlien(true);

    // بعد انتهاء الحوارات (نقدر نستخدم setTimeout تقريبي)
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setShowAlien(false);
      setIsWaiting(false);
    }, 2500);
  };

  // اختيار صورة الشخصية حسب الحالة
  const getCharacterImage = () =>
    showAlien ? "/character/alien.png" : "/character/astronaut.png";

  // --- JSX ---

  if (gameState === "story") {
    return (
      <div className="planet-game" aria-label="Space Story Video">
        <h2>🚀 Space Story</h2>
        <video
          width="640"
          height="360"
          controls
          onEnded={startGame}
          aria-describedby="story-desc"
        >
          <source src="/video/planet_story.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <p id="story-desc" className="loading" style={{ marginTop: "10px" }}>
          Watch the story or skip to start the game.
        </p>
        <button onClick={startGame} aria-label="Skip story and start game">
          Skip & Start Game
        </button>
      </div>
    );
  }

  if (gameState === "end") {
    return (
      <div className="planet-game" role="main" aria-live="polite">
        <h2>Game Over!</h2>
        <p>
          Your Score: {score} / {objects.length}
        </p>
        <div className="character-container">
          <img
            src="/character/alien.png"
            alt="Alien"
            className="character-img"
          />
          <div className="speech-bubble">
            {dialogue || "Thanks for playing!"}
          </div>
        </div>
        <button onClick={() => setGameState("story")} aria-label="Play again">
          Play Again
        </button>
      </div>
    );
  }

  // حالة اللعب
  return (
    <div className="planet-game" role="main" aria-live="polite">
      <h2>Is this object a planet?</h2>

      <div className="character-container">
        <img
          src={getCharacterImage()}
          alt={showAlien ? "Alien" : "Astronaut"}
          className="character-img"
          aria-hidden="true"
        />
        <div className="speech-bubble" aria-live="assertive" aria-atomic="true">
          {dialogue || "Make your choice!"}
        </div>
      </div>

      {currentObject ? (
        <>
          <img
            src={currentObject.image}
            alt={currentObject.name}
            className="planet-img"
            loading="lazy"
          />
          <h3>{currentObject.name}</h3>
          <p>Radius: {currentObject.radius}</p>
          <p>Distance: {currentObject.distance}</p>

          <div
            className="game-buttons"
            role="group"
            aria-label="Answer options"
          >
            <button
              onClick={() => handleAnswer(true)}
              disabled={isWaiting}
              aria-disabled={isWaiting}
              aria-label="Yes, this is a planet"
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={isWaiting}
              aria-disabled={isWaiting}
              aria-label="No, this is not a planet"
            >
              No
            </button>
          </div>

          <p
            aria-live="polite"
            aria-atomic="true"
            style={{ marginTop: "15px" }}
          >
            Score: {score}
          </p>
        </>
      ) : (
        <p className="loading">Loading object data...</p>
      )}
    </div>
  );
}
