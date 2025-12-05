// src/pages/Plugins.jsx
import { Link } from "react-router-dom";

export default function Plugins() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-gray-500 text-3xl font-bold">WaveSurfer Plugins</h1>

            <p className="text-gray-300 max-w-2xl">
                WaveSurfer provides multiple plugins that extend the core player with
                additional UI and interactions. Below is an overview, with links to
                detailed pages.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to="/plugins/hoverplugin"
                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 shadow"
                >
                    <h2 className="text-xl font-semibold">Hover Plugin</h2>
                    <p className="text-gray-400 text-sm">
                        Displays a time indicator at the mouse position while hovering over
                        the waveform.
                    </p>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to="/plugins/timelineplugin"
                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 shadow"
                >
                    <h2 className="text-xl font-semibold">Timeline Plugin</h2>
                    <p className="text-gray-400 text-sm">
                        Displays a visual timeline above the waveform showing time markers
                        along the track.
                    </p>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to="/plugins/regionplugin"
                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 shadow"
                >
                    <h2 className="text-xl font-semibold">Region Plugin</h2>
                    <p className="text-gray-400 text-sm">
                        Displays a region helping the visualisation of a selection
                    </p>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to="/plugins/pitchplugin"
                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 shadow"
                >
                    <h2 className="text-xl font-semibold">Pitch Plugin</h2>
                    <p className="text-gray-400 text-sm">
                        Displays visualisation of the voice pitch
                    </p>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to="/plugins/recorderplugin"
                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 shadow"
                >
                    <h2 className="text-xl font-semibold">Record Plugin</h2>
                    <p className="text-gray-400 text-sm">
                        For record and visualize the waveform in real time
                    </p>
                </Link>
            </div>
        </div>
    );
}
