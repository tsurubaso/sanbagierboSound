import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

// Helper function: Give regions a random color
const random = (min, max) => Math.random() * (max - min) + min;
const randomColor = () =>
  `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

export default function RegionPluginFunc() {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const regionsRef = useRef(null);
  useEffect(() => {
    // 1. Check if container is ready
    if (!containerRef.current) return; // 2. Create the plugin instance (must be done before WaveSurfer.create)

    const ws = WaveSurfer.create({
      // Correctly use the React ref for the container
      container: containerRef.current,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
      minPxPerSec: zoom, // Set initial zoom level

      height: 150,
      responsive: true,
    });

    const regions = ws.registerPlugin(
      RegionsPlugin.create({
        dragSelection: true,
      })
    );
    wsRef.current = ws; // Load audio via Electron preload (using the assumed pattern)
    regionsRef.current = regions;

    if (window.electronAPI && window.electronAPI.openAudio) {
      window.electronAPI.openAudio().then((audio) => {
        if (!audio) return;
        ws.load(audio.url);
      });
    } else {
      // Fallback for testing/debugging
      console.warn(
        "Electron API not found. Using placeholder audio URL for testing."
      );
    } // Global WaveSurfer Events

    ws.on("interaction", () => ws.play());
    ws.on("finish", () => ws.setTime(0)); // --- Region Plugin Logic ---

    regions.enableDragSelection({
      color: "rgba(255, 0, 0, 0.1)",
      minWidth: 2,
    }); // Create initial regions when audio is decoded

    let activeRegion = null;
    regions.on("region-in", (region) => {
      activeRegion = region;
    });
    regions.on("region-clicked", (region, e) => {
      e.stopPropagation(); // Prevent triggering a click on the waveform
      activeRegion = region;
      region.play(true); // Play immediately
      region.setOptions({ color: randomColor() });
    });
    regions.on("region-updated", (region) => {
      console.log("Updated region", region);
    }); // Reset the active region when the user clicks anywhere in the waveform

    ws.on("interaction", () => {
      activeRegion = null;
    }); // Cleanup function

    return () => {
      ws.destroy();
    };
  }, []);

  const handleZoomChange = (e) => {
    const value = e.target.valueAsNumber;
    setZoom(value); // Apply the zoom directly to the WaveSurfer instance
    if (wsRef.current) wsRef.current.zoom(value);
  }; // Function to delete all regions

  // Function to delete all regions
  const handleDeleteAll = () => {
    // ACCÈS DIRECT à l'instance stockée
    const regionsPlugin = regionsRef.current;
    if (regionsPlugin) {
      regionsPlugin.clearRegions(); // <-- APPEL DIRECT
      console.log("All regions cleared.");
    }
  };

  return (
    <div className="p-6 space-y-4 bg-gray-900 min-h-screen font-sans">
           {" "}
      <h1 className="text-3xl font-extrabold text-gray-900">
        WaveSurfer Éditeur de Régions
      </h1>
           {" "}
      <p className="text-gray-600 max-w-3xl">
                Démonstration de la sélection, du redimensionnement et de la
        boucle de régions à l'aide du plugin Regions de WaveSurfer.js. **Glissez
        sur la forme d'onde pour créer une nouvelle région.** Cliquez sur une
        région existante pour la lire.      {" "}
      </p>
            {/* Controls */}     {" "}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-700 rounded-xl shadow-lg">
                {/* Zoom slider */}       {" "}
        <label className="flex items-center gap-4 w-full sm:w-64">
                   {" "}
          <span className="text-gray-700 font-medium whitespace-nowrap">
            Zoom:
          </span>
                   {" "}
          <input
            type="range"
            min={10}
            max={1000}
            value={zoom}
            onChange={handleZoomChange}
            className="flex-1 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer range-lg"
          />
                   {" "}
          <span className="text-blue-600 font-semibold w-10 text-right">
            {zoom}
          </span>
                 {" "}
        </label>
        {/* Delete Button */}
        <button
          onClick={handleDeleteAll}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-150 transform hover:scale-[1.02]"
        >
          Effacer Toutes les Régions
        </button>
             {" "}
      </div>
            {/* WaveSurfer Container */}     {" "}
      <div className="rounded-xl bg-gray-800 p-4 shadow-2xl border-4 border-indigo-500/50 transition duration-300">
               {" "}
        <div
          ref={containerRef}
          className="w-full h-[150px]"
          id="waveform"
        ></div>
             {" "}
      </div>
           {" "}
      <a
        className="text-blue-500 hover:text-blue-700 hover:underline inline-block mt-4"
        href="https://wavesurfer.xyz/docs/modules/plugins_regions"
        target="_blank"
      >
        Documentation du Plugin Régions
      </a>
         {" "}
    </div>
  );
}
