import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Plugins from "./pages/Plugins";


import TimelinePluginFunc from "./pages/plugins/TimelinePluginFunc";


import RecorderPlugin from "./pages/plugins/recorderplugin";
import AudioProcessing from "./pages/AudioProcessing";


export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/plugins/timelineplugin" element={<TimelinePluginFunc />} />
        <Route path="/plugins/recorderplugin" element={<RecorderPlugin />} />
        <Route path="/audioprocessing" element={<AudioProcessing />} />
      </Routes>
    </Layout>
  );
}