import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

export function useWaveSurfer(containerRef, file, setRegion, zoom) {
  const waveRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !file) return;

    if (waveRef.current) {
      waveRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#d1d5db",
      progressColor: "#3b82f6",
      height: 120,
      responsive: true,
      plugins: [
        RegionsPlugin.create({
          dragSelection: true, // <-- enables user to drag & create regions
          regions: [
            {
              start: 2,
              end: 5,
              color: "rgba(255, 0, 0, 0.3)",
              drag: true,
              resize: true,
            },
          ],
        }),
      ],
    });

    ws.on("ready", () => {
      ws.zoom(zoom);
    });

    ws.on("region-created", (r) => {
      // Keep only one region
      Object.values(ws.regions.list).forEach((existing) => {
        if (existing.id !== r.id) {
          existing.remove();
        }
      });
      setRegion(r);
    });

    ws.load(file.url);
    waveRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [containerRef, file]);

  useEffect(() => {
    if (waveRef.current) {
      waveRef.current.zoom(zoom);
    }
  }, [zoom]);

  return waveRef;
}
