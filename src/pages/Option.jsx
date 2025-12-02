// File: src/pages/Option.jsx
import { useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Option() {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
 container: null, // will be set dynamically
    height: 128,
    width: null, // allow full container width
    splitChannels: false,
    normalize: false,
    waveColor: '#ff4e00',
    progressColor: '#dd5e98',
    cursorColor: '#ddd5e9',
    cursorWidth: 2,
    barWidth: NaN,
    barGap: NaN,
    barRadius: NaN,
    barHeight: NaN,
    barAlign: '',
    minPxPerSec: 1,
    fillParent: true,
    url: null,
    mediaControls: true,
    autoplay: false,
    interact: true,
    dragToSeek: false,
    hideScrollbar: false,
    audioRate: 1,
    autoScroll: true,
    autoCenter: true,
    sampleRate: 8000,
  });

  const loadAudio = async () => {
    const audio = await window.electronAPI.openAudio();
    if (!audio) return;

    setFile(audio);

    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    const wsOptions = { ...options, container: containerRef.current, url: audio.url };
    const ws = WaveSurfer.create(wsOptions);
    waveRef.current = ws;

    ws.on('ready', () => {
      ws.setTime(10); // example of setting initial time
    });
  };

  const handleOptionChange = (key, rawValue, type) => {
    setOptions(prev => {
      let value = rawValue;
      if (type === 'number') {
        // Empty string -> store NaN so WaveSurfer treats it as unset
        value = rawValue === '' ? NaN : Number(rawValue);
      } else if (type === 'boolean') {
        value = Boolean(rawValue);
      }

      const newOptions = { ...prev, [key]: value };
      if (waveRef.current) waveRef.current.setOptions(newOptions);
      return newOptions;
    });
  };

  const renderInputForKey = (key) => {
    const val = options[key];
    const isColor = key.toLowerCase().includes('color');
    const isBoolean = typeof val === 'boolean';
    const isNumber = typeof val === 'number' && !Number.isNaN(val);

    // For numeric values that are NaN, show empty string in input
    const displayValue = typeof val === 'number' ? (Number.isNaN(val) ? '' : String(val)) : val ?? '';

    if (isColor) {
      return (
        <input
          type="color"
          value={displayValue || '#000000'}
          onChange={(e) => handleOptionChange(key, e.target.value, 'text')}
        />
      );
    }

    if (isBoolean) {
      return (
        <input
          type="checkbox"
          checked={Boolean(val)}
          onChange={(e) => handleOptionChange(key, e.target.checked, 'boolean')}
        />
      );
    }

    // numeric inputs: use range for some keys, number for others
    if (typeof val === 'number') {
      return (
        <input
          type="text"
          value={displayValue}
          onChange={(e) => handleOptionChange(key, e.target.value, 'number')}
          placeholder="(empty = unset)"
          className="flex-1 bg-gray-800 text-gray-200 p-1 rounded"
        />
      );
    }

    // default text input
    return (
      <input
        type="text"
        value={displayValue}
        onChange={(e) => handleOptionChange(key, e.target.value, 'text')}
        className="flex-1 bg-gray-800 text-gray-200 p-1 rounded"
      />
    );
  };

  return (
    <div className="p-6 text-gray-200 space-y-15">
      <h1 className="text-3xl font-bold">Wavesurfer Options</h1>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={loadAudio}
      >
        Open Audio
      </button>

      <div ref={containerRef} className="w-full h-[150px] border border-gray-700 rounded" />

      <div className="space-y-2 mt-4">
        {Object.keys(options).map(key => (
          <div key={key} className="flex items-center gap-2">
            <label className="w-40 capitalize">{key}:</label>
            {renderInputForKey(key)}
          </div>
        ))}
      </div>

      <textarea
        className="w-full h-40 mt-4 bg-gray-900 text-gray-200 p-2 rounded"
        value={JSON.stringify(options, null, 2)}
        readOnly
      />
    </div>
  );
}
