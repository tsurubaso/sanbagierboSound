import React, { Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import PersonLayout from "@/layout/layout";

// Lazy load pages
const Rules = lazy(() => import("@/pages/Rules"));
const IllustrationList = lazy(() => import("@/pages/illustrationlist"));
const Reader = lazy(() => import("@/pages/Reader"));
const Editor = lazy(() => import("@/pages/Editor"));
const GridPage = lazy(() => import("@/pages/GridPage"));
const Creator = lazy(() => import("@/pages/Creator"));
const Lecturer = lazy(() => import("@/pages/Lecturer"));
const Merger = lazy(() => import("@/pages/Merger"));
const SoundWork = lazy(() => import("@/pages/SoundWork"));
const AudioProcessing = lazy(() => import("@/pages/AudioProcessing"));

function App() {
  return (
    <>
      <Suspense fallback={<div className="p-6">Chargement...</div>}>
        <Routes>
          {/* 🏠 Home page - does not need layout */}
          <Route path="/" element={<Home />} />

          {/* Wrap all "person pages" with PersonLayout */}
          <Route
            path="/*"
            element={
              <PersonLayout>
                <Routes>
                  {/* 🏠 Page principale */}
                  <Route path="/" element={<Home />} />

                  {/* 📘 Règles */}
                  <Route path="/:person/Rules" element={<Rules />} />

                  {/* 🖼️ Illustrations */}
                  <Route
                    path="/:person/illustrationlist"
                    element={<IllustrationList />}
                  />

                  {/* 📚 Liste générique (draft, story, fragment, etc.) */}
                  <Route path="/:person/:statuslist" element={<GridPage />} />

                  {/* 📖 Reader */}
                  <Route
                    path="/:person/:statuslist/:link/reader"
                    element={<Reader />}
                  />

                  {/* ✏️ Editor */}
                  <Route
                    path="/:person/:statuslist/:link/editor"
                    element={<Editor />}
                  />
                  {/* 🔄 Merger */}
                  <Route
                    path="/:person/:statuslist/:link/merger"
                    element={<Merger />}
                  />

                  {/* 🌈 Creator */}
                  <Route
                    path="/:person/:statuslist/:link/creator"
                    element={<Creator />}
                  />
                  {/* 🎤 Lecturer*/}
                  <Route
                    path="/:person/:statuslist/:link/lecturer"
                    element={<Lecturer />}
                  />
                  {/* 🎵 Sound Work*/}
                  <Route
                    path="/:person/:statuslist/:link/soundwork"
                    element={<SoundWork />}
                  />
                  {/* 🎵 Audio Processing*/}
                  <Route
                    path="/:person/:statuslist/:link/audioprocessing"
                    element={<AudioProcessing />}
                  />
                </Routes>
              </PersonLayout>
            }
          />

          {/* ⚠️ Fallback */}
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
