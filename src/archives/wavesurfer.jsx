import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

export function useWaveSurfer(containerRef, file, setRegion, zoom) {
  const waveRef = useRef(null);

  useEffect(() => {
    console.log("useWaveSurfer called, file:", file);

    if (!containerRef.current || !file) {
      console.log("No container or no file — skipping WaveSurfer init");
      return;
    }

    // Destroy previous instance
    if (waveRef.current) {
      console.log("Destroying previous WaveSurfer instance");
      waveRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#77a",
      progressColor: "#337",
      plugins: [RegionsPlugin.create({ dragSelection: true })],
    });

    console.log("WaveSurfer instance created");

    ws.on("ready", () => {
      console.log("WaveSurfer ready → applying zoom:", zoom);
      ws.zoom(zoom);
    });

    ws.on("region-created", (r) => {
      console.log("Region created:", r);

      // Only one region
      Object.values(ws.regions.list).forEach((existing) => {
        if (existing.id !== r.id) {
          console.log("Removing old region:", existing);
          existing.remove();
        }
      });

      setRegion(r);
    });

    ws.on("error", (err) => {
      console.error("WaveSurfer error:", err);
    });

    console.log("Loading blob URL into WaveSurfer:", file.url);
    ws.load(file.url);

    waveRef.current = ws;

    return () => {
      console.log("Cleaning up WaveSurfer instance...");
      ws.destroy();
    };
  }, [containerRef, file]);

  // Apply zoom when changed
  useEffect(() => {
    if (!waveRef.current) return;
    console.log("Zoom changed →", zoom);
    waveRef.current.zoom(zoom);
  }, [zoom]);

  return waveRef;
}
