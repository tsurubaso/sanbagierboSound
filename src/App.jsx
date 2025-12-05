import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Basic from "./pages/Basic";
import Option from "./pages/Option";
import Events from "./pages/Events";
import Plugins from "./pages/Plugins";
import Other from "./pages/Other";
import HoverPlugin from "./pages/plugins/HoverPlugin";
import TimelinePluginFunc from "./pages/plugins/TimelinePluginFunc";
import RegionPluginFunc from "./pages/plugins/RegionPlugin";
import PitchPlugin from "./pages/plugins/pitchplugin";
import RecorderPlugin from "./pages/plugins/recorderplugin";
import AudioProcessing from "./pages/AudioProcessing";


export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/basic" element={<Basic />} />
        <Route path="/option" element={<Option />} />
        <Route path="/events" element={<Events />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/other" element={<Other />} />
        <Route path="/plugins/Hoverplugin" element={<HoverPlugin />} />
        <Route path="/plugins/timelineplugin" element={<TimelinePluginFunc />} />
        <Route path="/plugins/RegionPlugin" element={<RegionPluginFunc/>} />
        <Route path="/plugins/pitchplugin" element={<PitchPlugin />} />
        <Route path="/plugins/recorderplugin" element={<RecorderPlugin />} />
        <Route path="/audioprocessing" element={<AudioProcessing />} />
        
      </Routes>
    </Layout>
  );
}