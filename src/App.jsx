import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Basic from "./pages/Basic";
import Option from "./pages/Option";
import Events from "./pages/Events";
import Plugins from "./pages/Plugins";
import HoverPlugin from "./pages/plugins/HoverPlugin";
import TimelinePluginFunc from "./pages/plugins/TimelinePluginFunc";


export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/basic" element={<Basic />} />
        <Route path="/option" element={<Option />} />
        <Route path="/events" element={<Events />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/plugins/Hoverplugin" element={<HoverPlugin />} />
        <Route path="/plugins/timelineplugin" element={<TimelinePluginFunc />} />
      </Routes>
    </Layout>
  );
}