import React, { useRef, useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

export default function PitchPlugin() {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const freqCanvasRef = useRef(null);
  const overlayRef = useRef(null);
  const workerRef = useRef(null);
  const frequenciesRef = useRef(null);

  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const MIN_PX_PER_SEC = 50; // REDUCED from 200 to make canvas smaller

  useEffect(() => {
    return () => {
      if (waveRef.current) {
        waveRef.current.destroy();
        waveRef.current = null;
      }
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch {}
        workerRef.current = null;
      }
    };
  }, []);

  const addDebug = (msg) => {
    console.log(msg);
    setDebugInfo(prev => prev + "\n" + msg);
  };

  const loadAudio = async () => {
    setDebugInfo(""); // Clear previous debug
    addDebug("1. Starting loadAudio...");
    
    const audio = await window.electronAPI.openAudio();
    if (!audio) {
      addDebug("ERROR: No audio file selected");
      return;
    }

    addDebug("2. Audio file selected: " + audio.path);
    setFile(audio);

    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }
    if (workerRef.current) {
      try {
        workerRef.current.terminate();
      } catch {}
      workerRef.current = null;
    }

    addDebug("3. Creating WaveSurfer...");
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(200,200,200,0.6)",
      progressColor: "rgba(80,160,255,0.9)",
      height: 150,
      minPxPerSec: MIN_PX_PER_SEC,
      scrollParent: true,
      hideScrollbar: false, // Show scrollbar for easier navigation
    });

    waveRef.current = ws;
    addDebug("4. WaveSurfer created");

    addDebug("5. Creating Worker...");
    try {
      const w = new Worker("/workers/pitch-worker.js");
      workerRef.current = w;
      addDebug("6. Worker created successfully");

      w.onmessage = (ev) => {
        addDebug("11. Worker response received!");
        const { frequencies, sampleRate } = ev.data;
        frequenciesRef.current = frequencies;
        
        const validCount = frequencies.filter(f => f > 0).length;
        addDebug(`12. Frequencies: ${frequencies.length} total, ${validCount} valid`);
        
        if (validCount === 0) {
          addDebug("WARNING: No valid pitch detected! Audio might be too quiet or noisy.");
        } else {
          addDebug(`13. Sample frequencies: ${frequencies.slice(0, 5).map(f => f.toFixed(1)).join(", ")}...`);
        }
        
        drawPitchCanvas(frequencies, sampleRate, ws);
        setProcessing(false);
      };

      w.onerror = (error) => {
        addDebug("ERROR in Worker: " + error.message);
        setProcessing(false);
      };
    } catch (err) {
      addDebug("ERROR creating Worker: " + err.message);
      return;
    }

    addDebug("7. Loading audio into WaveSurfer...");
    ws.load(audio.url);

    ws.on("decode", () => {
      addDebug("8. Audio decoded!");
      const decoded = ws.getDecodedData();
      const ch0 = decoded.getChannelData(0);
      
      addDebug(`9. Channel data: ${ch0.length} samples, ${decoded.sampleRate} Hz`);
      addDebug(`   Duration: ${(ch0.length / decoded.sampleRate).toFixed(2)}s`);
      
      // Check audio levels
      let max = 0;
      let sum = 0;
      for (let i = 0; i < ch0.length; i++) {
        const abs = Math.abs(ch0[i]);
        if (abs > max) max = abs;
        sum += abs;
      }
      const avg = sum / ch0.length;
      addDebug(`   Audio levels - Max: ${max.toFixed(3)}, Avg: ${avg.toFixed(3)}`);
      
      if (max < 0.01) {
        addDebug("WARNING: Audio is very quiet!");
      }
      
      setProcessing(true);
      addDebug("10. Sending data to worker...");

      workerRef.current.postMessage({
        peaks: ch0,
        sampleRate: decoded.sampleRate,
        hopSize: 1024,
      });
    });

    ws.on("timeupdate", () => {
      drawCursor(ws);
    });

    ws.on("seek", () => drawCursor(ws));
    ws.on("zoom", () => drawCursor(ws));
    ws.on("click", () => ws.playPause());
  };

  const drawPitchCanvas = (frequencies, sampleRate, ws) => {
    addDebug("14. Drawing pitch canvas...");
    
    const duration = ws.getDuration() || 0.0001;
    const pxPerSec = ws.params?.minPxPerSec || MIN_PX_PER_SEC;
    const width = Math.max(1, Math.round(duration * pxPerSec));
    const height = 120;

    addDebug(`15. Canvas size: ${width}x${height}px`);

    let canvas = freqCanvasRef.current;
    const isNewCanvas = !canvas;
    
    if (!canvas) {
      addDebug("16. Creating new canvas element...");
      canvas = document.createElement("canvas");
      freqCanvasRef.current = canvas;
 const wrapper = ws.renderer.getWrapper();
 // lower wavesurfer internal canvas layers
wrapper.querySelectorAll("canvas").forEach((c) => {
  c.style.zIndex = 1;
});

if (!wrapper) {
  addDebug("ERROR: Cannot find WaveSurfer wrapper!");
  return;
}

// 🟩 FIX: allow pitch canvas to be visible
wrapper.style.overflowX = "auto";
wrapper.style.overflowY = "hidden";
wrapper.style.position = "relative";

// the wrapper must size itself to match WaveSurfer width
wrapper.style.width = width + "px";
wrapper.style.minWidth = "100%";

addDebug("WRAPPER FIX APPLIED: overflow + dynamic width");
      
      canvas.style.position = "absolute";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.zIndex = "10";
      canvas.style.pointerEvents = "none";
      wrapper.appendChild(canvas);
      addDebug("17. Canvas added to wrapper");

      const overlay = document.createElement("canvas");
      overlayRef.current = overlay;
      overlay.style.position = "absolute";
      overlay.style.left = "0";
      overlay.style.top = "0";
      overlay.style.zIndex = "11";
      overlay.style.pointerEvents = "none";
      wrapper.appendChild(overlay);
      addDebug("18. Overlay canvas added");
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const overlay = overlayRef.current;
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    overlay.style.width = canvas.style.width;
    overlay.style.height = canvas.style.height;

    addDebug(`19. Canvas actual size: ${canvas.width}x${canvas.height} (dpr: ${dpr})`);

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Background - lighter and more visible
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // Light semi-transparent
    ctx.fillRect(0, 0, width, height);
    
    // Add border for visibility
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    addDebug("20. Background drawn");

    const n = frequencies.length;
    let validFreqCount = 0;
    let drawnCount = 0;

    for (let i = 0; i < n; i++) {
      const f = frequencies[i];
      if (!f || f <= 0) continue;
      
      validFreqCount++;
      const x = Math.floor((i / n) * width);

      const minF = 50;
      const maxF = 5000;
      const norm = Math.log(Math.max(f, minF) / minF) / Math.log(maxF / minF);
      const y = height - Math.round(norm * height);

      const hue = 220 - Math.min(220, Math.round(norm * 220));
      ctx.fillStyle = `hsl(${hue}, 90%, 60%)`; // More saturated and brighter
      ctx.fillRect(x, y, Math.max(2, Math.ceil(width / n)), 4); // Taller bars
      drawnCount++;
    }

    addDebug(`21. Vertical bars: ${drawnCount} drawn (${validFreqCount} valid frequencies)`);

    // Draw pitch curve with more visible colors
    ctx.strokeStyle = "rgba(255,255,0,1)"; // Bright yellow line
    ctx.lineWidth = 3; // Thicker line

    let prevX = null;
    let prevY = null;
    let pointsDrawn = 0;

    for (let i = 0; i < n; i++) {
      const f = frequencies[i];
      if (!f || f <= 0) continue;

      const x = Math.floor((i / n) * width);
      const minF = 50;
      const maxF = 5000;
      const norm = Math.log(Math.max(f, minF) / minF) / Math.log(maxF / minF);
      const y = height - Math.round(norm * height);

      // Draw point - bigger and brighter
      ctx.fillStyle = "rgba(255,255,100,1)"; // Bright yellow
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2); // Bigger radius
      ctx.fill();
      pointsDrawn++;

      // Draw line
      if (prevX !== null) {
        ctx.strokeStyle = "rgba(255,255,0,1)"; // Bright yellow
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      prevX = x;
      prevY = y;
    }

    addDebug(`22. Points drawn: ${pointsDrawn}`);

    canvas.style.top = "0px"; // Position at TOP of wrapper, not above it
    overlay.style.top = "0px";
    
    addDebug(`23. Canvas positioned at top: ${canvas.style.top}`);
    addDebug(`    Canvas is ${width}px wide - scroll horizontally to see all!`);
    addDebug("24. ✓ Drawing complete!");
    
    // Final check
    if (isNewCanvas) {
      setTimeout(() => {
        const computedStyle = window.getComputedStyle(canvas);
        addDebug(`25. Canvas computed style - display: ${computedStyle.display}, visibility: ${computedStyle.visibility}, opacity: ${computedStyle.opacity}`);
      }, 100);
    }
  };

  const drawCursor = (ws) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const duration = ws.getDuration() || 1;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const current = ws.getCurrentTime() || 0;
    const x = Math.floor((current / duration) * width);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "rgba(255,80,80,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();

    ctx.restore();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pitch Detection Plugin</h1>

      <div className="flex gap-3">
        <button
          onClick={loadAudio}
          disabled={processing}
          className={
            "px-4 py-2 rounded text-white " +
            (processing ? "bg-gray-500" : "bg-blue-600")
          }
        >
          {processing ? "Processing..." : "Load audio"}
        </button>
        <button
          onClick={() => waveRef.current?.playPause()}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Play / Pause
        </button>
        <div className="text-sm text-gray-200 self-center">
          {processing
            ? "Processing pitch..."
            : file
            ? file.path.split("/").pop()
            : "No file"}
        </div>
      </div>

      {/* Debug console */}
      <div className="bg-gray-900 p-3 rounded text-xs font-mono text-green-400 h-48 overflow-auto whitespace-pre-wrap">
        {debugInfo || "Waiting for audio..."}
      </div>

      <div style={{ position: "relative", width: "100%", height: 300, overflow: "auto", border: "1px solid #444" }}>
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 150,
          }}
        />
      </div>
    </div>
  );
}