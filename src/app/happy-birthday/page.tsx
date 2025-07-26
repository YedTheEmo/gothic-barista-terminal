"use client";
import { useState, useEffect, useRef } from "react";

export default function HappyBirthday() {
  const [musicPlaying, setMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      if (musicPlaying) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [musicPlaying]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center">
      {musicPlaying && (
        <audio ref={audioRef} src="/hbd.mp3" loop style={{ display: "none" }} />
      )}
      <div className="flex items-center justify-center gap-4 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold neon-green">🎉 Happy Birthday! 🎉</h1>
        <button
          aria-label={musicPlaying ? "Pause background music" : "Play background music"}
          onClick={() => setMusicPlaying((p) => !p)}
          className="hover-glow text-2xl focus:outline-none"
          style={{ color: musicPlaying ? "#00ff41" : "#555" }}
        >
          {musicPlaying ? (
            <span title="Pause music">🎵</span>
          ) : (
            <span title="Play music">🔇</span>
          )}
        </button>
      </div>
      <p className="text-xl neon-blue mb-8">Wishing you a wonderful year ahead!</p>
      <div className="ascii-art text-lg">
        {`
        ╔══════════════════════════════╗
        ║  🎂  HAPPY BIRTHDAY!  🎂   ║
        ║  May your day be filled     ║
        ║  with joy, love, and        ║
        ║  delicious coffee!          ║
        ╚══════════════════════════════╝
        `}
      </div>
    </div>
  );
}
