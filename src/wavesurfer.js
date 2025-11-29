import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

export function useWaveSurfer(containerRef, file, setRegion) {
  const waveRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !file) return;

    if (waveRef.current) {
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
      // Only one region at a time
      Object.values(ws.regions.list).forEach(existing => {
        if (existing.id !== r.id) existing.remove();
      });

      setRegion(r);
    });

    ws.load(file);
    waveRef.current = ws;

    return () => {
      ws.destroy();
    };

  }, [containerRef, file]);

  return waveRef;
}
