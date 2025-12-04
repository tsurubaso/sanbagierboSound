// public/workers/pitch-worker.js
// Basic autocorrelation pitch per window (sufficient for speech)
self.onmessage = (ev) => {
  console.log("Worker received message:", ev.data);
  const { peaks, sampleRate, hopSize = 1024 } = ev.data;

  // convert to Float32Array if needed (structured clone gives Float32Array)
  const data = peaks;
  const len = data.length;
  const windowSize = 2048;
  const step = hopSize;

  console.log("Processing:", len, "samples at", sampleRate, "Hz");

  const frequencies = [];

  for (let i = 0; i < len - windowSize; i += step) {
    const slice = data.subarray(i, i + windowSize);
    const f = detectPitch(slice, sampleRate);
    frequencies.push(f || 0);
  }

  console.log("Computed", frequencies.length, "pitch values");
  const validCount = frequencies.filter(f => f > 0).length;
  console.log("Valid pitches:", validCount, "/", frequencies.length);

  self.postMessage({ frequencies, sampleRate });
};

// simple autocorrelation-based pitch detection
function detectPitch(buffer, sampleRate) {
  const SIZE = buffer.length;
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  // Calcul RMS pour détecter le silence
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  
  // CORRECTION: Seuil plus bas pour capturer plus de sons
  if (rms < 0.001) return null; // était 0.01, maintenant 0.001

  // Autocorrélation
  for (let offset = 20; offset < 1000; offset++) {
    let correlation = 0;
    for (let i = 0; i < SIZE - offset; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / (SIZE - offset);
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  // CORRECTION: Seuil de corrélation plus bas et vérification de plage
  if (bestCorrelation > 0.15 && bestOffset > 0) {
    const frequency = sampleRate / bestOffset;
    // Vérifier que la fréquence est dans une plage réaliste
    if (frequency >= 50 && frequency <= 5000) {
      return frequency;
    }
  }
  
  return null;
}

console.log("Pitch worker loaded and ready");