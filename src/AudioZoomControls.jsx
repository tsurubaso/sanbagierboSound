export default function AudioZoomControls({ zoom, setZoom, onChange }) {
  const ZOOM_STEP = 50;
  const MIN_ZOOM = 20;
  const MAX_ZOOM = 2000;

  const zoomIn = () => {
    const z = Math.min(MAX_ZOOM, zoom + ZOOM_STEP);
    console.log("Zoom in →", z);
    setZoom(z);
    onChange(z);
  };

  const zoomOut = () => {
    const z = Math.max(MIN_ZOOM, zoom - ZOOM_STEP);
    console.log("Zoom out →", z);
    setZoom(z);
    onChange(z);
  };

  const resetZoom = () => {
    console.log("Zoom reset → 100");
    setZoom(100);
    onChange(100);
  };

  return (
    <div className="flex gap-2 mt-2">
      <button onClick={zoomOut} className="px-3 py-1 bg-gray-300 rounded">➖ Zoom Out</button>
      <button onClick={zoomIn} className="px-3 py-1 bg-gray-300 rounded">➕ Zoom In</button>
      <button onClick={resetZoom} className="px-3 py-1 bg-gray-300 rounded">🔄 Reset</button>
    </div>
  );
}
