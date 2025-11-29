import React, { useRef, useState } from "react";

export default function AudioPlayer({ file }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    const audio = audioRef.current;

    if (!audio) {
      console.log("❌ No audio element");
      return;
    }

    if (isPlaying) {
      console.log("⏸️ Pausing audio");
      audio.pause();
      setIsPlaying(false);
    } else {
      console.log("▶️ Playing audio");
      audio.play().catch((err) => console.error("Audio play error:", err));
      setIsPlaying(true);
    }
  };

  console.log("🎵 Rendering AudioPlayer with file:", file?.name);

  return (
    <div style={{ marginTop: "20px" }}>
      <audio
        ref={audioRef}
        src={file ? URL.createObjectURL(file) : undefined}
        onEnded={() => {
          console.log("🔚 Audio ended");
          setIsPlaying(false);
        }}
      />

      <button
        onClick={handlePlayPause}
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
