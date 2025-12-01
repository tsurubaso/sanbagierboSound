import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

export function useWaveSurfer(containerRef, file, setRegion, zoom) {
  const waveRef = useRef(null);

  useEffect(() => {
    console.log("useEffect: Running setup for WaveSurfer.");
    if (!containerRef.current || !file) return;

    if (waveRef.current) {
      console.log("useEffect: Destroying existing WaveSurfer instance.");
      waveRef.current.destroy();
    }

    // 1. Define the initial regions to create later
    const initialRegions = [
      {
        start: 2,
        end: 5,
        color: "rgba(255, 0, 0, 0.3)",
        drag: true,
        resize: true,
      },
    ];

    console.log("useEffect: Creating new WaveSurfer instance...");
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#d1d5db",
      progressColor: "#3b82f6",
      height: 120,
      responsive: true,
      plugins: [
        // 2. IMPORTANT: Do NOT define regions in the plugin creation here.
        // We will create them manually after the 'ready' event.
        RegionsPlugin.create({
          dragSelection: true, color: 'rgba(0,128,255,0.3)' // Keep this to allow user dragging
          // regions: initialRegions, // <-- REMOVED THIS LINE
        }),
      ],
    });
    console.log("useEffect: WaveSurfer instance created.", ws);

    // 3. Create Regions ONLY after the 'ready' event
    ws.on("ready", () => {
      console.log("Event: 'ready' fired. Audio loaded and visualized.");
      console.log(`Event: Applying initial zoom level: ${zoom}`);
      ws.zoom(zoom);
      
      // Manually add the predefined regions here
      console.log("Event: Creating predefined regions after 'ready'.");
      const initialRegion = ws.plugins[0].addRegion(initialRegions[0]);
      setRegion(initialRegion); // Set the initial region in your state
    });

    ws.on("region-created", (r) => {
      console.log(`Event: 'region-created' fired. New region ID: ${r.id}`);
      
      // Keep only one region (modified to work with plugin structure)
      Object.values(ws.plugins[0].regions.list).forEach((existing) => {
        if (existing.id !== r.id) {
          console.log(`Event: Removing existing region ID: ${existing.id}`);
          existing.remove();
        }
      });
      setRegion(r);
      console.log("Event: setRegion called with the new region.");
    });

    // 4. Proceed with loading
    console.log(`useEffect: Loading audio from URL: ${file.url}`);
    ws.load(file.url);
    waveRef.current = ws;

    return () => {
      console.log("useEffect: Running cleanup. Destroying WaveSurfer instance.");
      ws.destroy();
    };
  }, [containerRef, file]);

  // (The zoom useEffect hook remains the same)
  useEffect(() => {
    if (waveRef.current) {
      waveRef.current.zoom(zoom);
    }
  }, [zoom]);

  return waveRef;
}