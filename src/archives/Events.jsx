// File: src/pages/Events.jsx
import React from "react";


const eventDescriptions = [
{
category: "Loading",
events: [
{ name: "load", desc: "Fires when audio loading begins." },
{ name: "loading", desc: "Continuously emits loading progress as a percentage." },
{ name: "decode", desc: "Emitted when the audio file is decoded into PCM." },
{ name: "ready", desc: "Audio is decoded and ready to play." },
],
},
{
category: "Rendering",
events: [
{ name: "redraw", desc: "Waveform drawing begins." },
{ name: "redrawcomplete", desc: "All waveform channels are drawn completely." },
],
},
{
category: "Playback",
events: [
{ name: "play", desc: "Playback starts." },
{ name: "pause", desc: "Playback pauses." },
{ name: "finish", desc: "Playback reaches the end of the audio file." },
{ name: "timeupdate", desc: "Emits continuously as the playback position changes." },
],
},
{
category: "User Interaction",
events: [
{ name: "seeking", desc: "User jumps to a new position in the waveform." },
{ name: "interaction", desc: "User interacts with the waveform (click or drag)." },
{ name: "click", desc: "User clicks somewhere on the waveform." },
{ name: "drag", desc: "User drags the cursor across the waveform." },
{ name: "scroll", desc: "The visible portion of the waveform scrolls/pans." },
],
},
{
category: "Controls",
events: [
{ name: "zoom", desc: "Fires when zoom level changes (minPxPerSec)." },
],
},
{
category: "Lifecycle",
events: [
{ name: "destroy", desc: "Right before the WaveSurfer instance is destroyed." },
],
},
];


export default function Events() {
return (
<div className="p-6 text-gray-200 space-y-6">
<h1 className="text-3xl font-bold mb-4">WaveSurfer Events</h1>


{eventDescriptions.map((group) => (
<div key={group.category} className="bg-gray-800 p-4 rounded-lg shadow">
<h2 className="text-xl font-semibold mb-3 text-indigo-300">
{group.category}
</h2>
<ul className="list-disc ml-6 space-y-2 text-gray-300">
{group.events.map((ev) => (
<li key={ev.name}>
<span className="font-bold text-white">{ev.name}</span>
<span className="text-gray-400"> — {ev.desc}</span>
</li>
))}
</ul>
</div>
))}
</div>
);
}