import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/jetbrains-mono/500.css";
import "./index.css";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import NotFound from "./components/NotFound";
import MindApp from "./MindApp";

const QuickView = lazy(() => import("./quick/QuickView"));

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MindApp />} />
          <Route
            path="/quick"
            element={
              <Suspense fallback={<div className="page-fallback" />}>
                <QuickView />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </AppErrorBoundary>
  </StrictMode>,
);
