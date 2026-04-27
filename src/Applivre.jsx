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

function App() {
  return (
    <HashRouter>
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
                </Routes>
              </PersonLayout>
            }
          />

          {/* ⚠️ Fallback */}
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
