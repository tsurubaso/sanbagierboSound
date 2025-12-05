import RNNoise from "rnnoise-wasm";

export async function denoiseAudioBuffer(audioBuffer) {
  const denoiser = await RNNoise.create();

  const input = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

   // RNNoise fonctionne UNIQUEMENT en 48 kHz — sinon il faut resampler !
  if (sampleRate !== 48000) {
    throw new Error("RNNoise requires 48kHz input.");
  }

  const frameSize = 480;
  const frames = Math.floor(input.length / frameSize);

  const output = new Float32Array(frames * frameSize);

  for (let i = 0; i < frames; i++) {
    const start = i * frameSize;
    const frame = input.slice(start, start + frameSize);

    const cleaned = denoiser.process(frame);
    output.set(cleaned, start);
  }

  const cleanAB = new AudioBuffer({
    length: output.length,
    sampleRate,
  });

  cleanAB.copyToChannel(output, 0);

  return cleanAB;
}
