// Basic autocorrelation pitch detection

function autoCorrelate(samples, sampleRate) {
  let SIZE = samples.length;
  let maxSamples = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = samples[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.02) return null;

  let lastCorrelation = 1;
  let foundGoodCorrelation = false;

  for (let offset = 1; offset < maxSamples; offset++) {
    let correlation = 0;

    for (let i = 0; i < maxSamples; i++) {
      correlation += Math.abs(samples[i] - samples[i + offset]);
    }
    correlation = 1 - correlation / maxSamples;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      const frequency = sampleRate / bestOffset;
      return frequency;
    }
    lastCorrelation = correlation;
  }

  return null;
}

onmessage = (e) => {
  const { peaks, sampleRate } = e.data;

  const frequencies = [];
  const windowSize = 4096;
  const hopSize = 256;      // more precise hop

  for (let i = 0; i < peaks.length - windowSize; i += hopSize) {
    const slice = peaks.subarray(i, i + windowSize);
    const freq = autoCorrelate(slice, sampleRate);
    frequencies.push(freq || 0);
  }

  const base = frequencies.filter(f => f > 0)[0] || 100;

  postMessage({ frequencies, baseFrequency: base });
};
