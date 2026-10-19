import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "@mylife/loader";
import { hoverStore } from "@mylife/core-engine/hover";
import { useWidgetStore } from "@mylife/chatbot/store";
import { profile } from "@mylife/profile";
import { ACTION_VIEWS } from "./config/views";
import { selectOverlayOpen, useMind } from "./state/mind";
import { Hud } from "./ui/Hud";
import { Tooltip } from "./ui/Tooltip";
import { ControlsHint } from "./ui/ControlsHint";
import { RotateNotice } from "./ui/RotateNotice";

const MindScene = lazy(() => import("./scene/MindScene"));
const ScrollUI = lazy(() => import("@mylife/scroll").then((m) => ({ default: m.ScrollUI })));
const BookViewer = lazy(() => import("@mylife/book-slider").then((m) => ({ default: m.BookViewer })));
const AssistantWidget = lazy(() => import("@mylife/chatbot").then((m) => ({ default: m.AssistantWidget })));
const SoulOverlay = lazy(() => import("./ui/SoulOverlay"));

const EXIT_MS = 320;
const SCENE_DELAY_MS = 1800;

function useExit(close: () => void) {
  const [leaving, setLeaving] = useState(false);
  const request = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      close();
      setLeaving(false);
    }, EXIT_MS);
  }, [close]);
  return [leaving, request] as const;
}

function useCreep(active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setValue((v) => v + (0.42 - v) * 0.06), 120);
    return () => window.clearInterval(id);
  }, [active]);
  return value;
}

export default function MindApp() {
  const navigate = useNavigate();
  const phase = useMind((s) => s.phase);
  const progress = useMind((s) => s.progress);
  const scrollId = useMind((s) => s.scrollId);
  const book = useMind((s) => s.book);
  const soul = useMind((s) => s.soul);
  const overlay = useMind(selectOverlayOpen);
  const { closeScroll, closeBook, closeSoul } = useMind.getState();
  const [showLoader, setShowLoader] = useState(() => useMind.getState().phase !== "exploring");
  const [sceneMounted, setSceneMounted] = useState(() => useMind.getState().phase === "exploring");

  useEffect(() => {
    if (sceneMounted) return;
    const id = window.setTimeout(() => setSceneMounted(true), SCENE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [sceneMounted]);
  const creep = useCreep(phase === "loading");

  const [scrollLeaving, requestCloseScroll] = useExit(closeScroll);
  const [bookLeaving, requestCloseBook] = useExit(closeBook);
  const [soulLeaving, requestCloseSoul] = useExit(closeSoul);

  const enter = useCallback(() => {
    if (useMind.getState().phase !== "ready") return;
    useMind.getState().enter();
    window.setTimeout(() => setShowLoader(false), 1100);
    import("@mylife/chatbot").then((m) => m.ChatbotAPI.healthCheck()).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (overlay) hoverStore.set(null);
  }, [overlay]);

  useEffect(
    () =>
      useWidgetStore.subscribe((state) => {
        const action = state.targetAction;
        if (!action) return;
        const mind = useMind.getState();
        const view = ACTION_VIEWS[action];
        if (view) mind.goTo(view);
        else if (action === "OPEN_RESUME") window.open(profile.resumeUrl, "_blank", "noopener,noreferrer");
        else if (action === "OPEN_QUICK_VIEW") navigate("/quick");
        else if (action === "OPEN_SOUL") mind.openSoul();
        else if (action.startsWith("OPEN_SCROLL:")) mind.openScroll(action.slice("OPEN_SCROLL:".length));
        useWidgetStore.getState().setTargetAction(null);
      }),
    [navigate],
  );

  useEffect(() => {
    if (!scrollId && !book) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (book) requestCloseBook();
      else requestCloseScroll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollId, book, requestCloseBook, requestCloseScroll]);

  const exploring = phase === "exploring";

  return (
    <div className={`mind-root${exploring ? " is-exploring" : ""}`}>
      {sceneMounted && (
        <Suspense fallback={null}>
          <MindScene />
        </Suspense>
      )}

      {exploring && <Hud />}
      {exploring && <ControlsHint />}
      <Tooltip />

      {exploring && (
        <Suspense fallback={null}>
          <AssistantWidget />
        </Suspense>
      )}

      {scrollId && (
        <Suspense fallback={null}>
          <div className={`layer${scrollLeaving ? " is-leaving" : ""}`}>
            <ScrollUI id={scrollId} onClose={requestCloseScroll} />
          </div>
        </Suspense>
      )}

      {book && (
        <Suspense fallback={<div className="layer layer-book" />}>
          <div className={`layer layer-book${bookLeaving ? " is-leaving" : ""}`}>
            <BookViewer bookName={book} onClose={requestCloseBook} />
          </div>
        </Suspense>
      )}

      {soul && (
        <Suspense fallback={<div className="layer soul-wait">lighting the diya…</div>}>
          <SoulOverlay leaving={soulLeaving} onClose={requestCloseSoul} />
        </Suspense>
      )}

      {showLoader && (
        <Loader
          progress={phase === "loading" ? Math.max(progress, creep) : 1}
          isSceneReady={phase !== "loading"}
          leaving={phase === "entering" || exploring}
          onEnter={enter}
          onQuickView={() => navigate("/quick")}
        />
      )}

      {exploring && <RotateNotice />}
    </div>
  );
}
