import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

export function useWaveSurfer(containerRef, fileUrl, setRegion) {
  const waveRef = useRef(null);

  useEffect(() => {
    console.log("useWaveSurfer called, fileUrl:", fileUrl);

    if (!containerRef.current) {
      console.log("Container ref is null");
      return;
    }

    if (!fileUrl) {
      console.log("No fileUrl provided yet");
      return;
    }

    if (waveRef.current) {
      console.log("Destroying previous WaveSurfer instance");
      waveRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#77a",
      progressColor: "#337",
      plugins: [
        RegionsPlugin.create({
          dragSelection: true
        })
      ]
    });

    ws.on("region-created", r => {
      console.log("Region created:", r);
      // Only one region at a time
      Object.values(ws.regions.list).forEach(existing => {
        if (existing.id !== r.id) existing.remove();
      });

      setRegion(r);
    });

    ws.on("ready", () => {
      console.log("WaveSurfer ready, duration:", ws.getDuration());
    });

    ws.on("error", (e) => {
      console.error("WaveSurfer error:", e);
    });

    console.log("Loading file into WaveSurfer:", fileUrl);
    ws.load(fileUrl);

    waveRef.current = ws;

    return () => {
      console.log("Cleaning up WaveSurfer instance");
      ws.destroy();
    };
  }, [containerRef, fileUrl]);

  return waveRef;
}
