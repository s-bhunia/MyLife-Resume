// src/components/UI.tsx
import React, { useState, useEffect, useRef } from "react";
import { atom, useAtom } from "jotai";
import { fetchBookData } from "../services/api";

interface PageData {
  front: string;
  back: string;
}

export const pageAtom = atom(0);
export const languageAtom = atom(0);

const buildPages = (pictures: string[]): PageData[] => {
  if (!pictures || pictures.length === 0) return [];
  const pages: PageData[] = [{ front: "cover.webp", back: pictures[0] }];
  for (let i = 1; i < pictures.length - 1; i += 2) {
    pages.push({
      front: pictures[i % pictures.length],
      back: pictures[(i + 1) % pictures.length],
    });
  }
  pages.push({ front: pictures[pictures.length - 1], back: "book-back.webp" });
  return pages;
};

// Store pictures mapped to language IDs
export const picturesAtom = atom<Record<number, string[]>>({});
// NEW: Store language metadata (id, name, code) from the JSON
export const languagesMetaAtom = atom<{ id: number; name: string }[]>([]);

export const pagesAtom = atom((get) => {
  const language = get(languageAtom);
  const picturesByLang = get(picturesAtom);
  return buildPages(picturesByLang[language] || []);
});

interface UIProps {
  bookName: string;
  onClose: () => void;
}

export const UI = ({ bookName, onClose }: UIProps): React.JSX.Element => {
  const [page, setPage] = useAtom(pageAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const [, setPicturesByLang] = useAtom(picturesAtom);
  const [languagesMeta, setLanguagesMeta] = useAtom(languagesMetaAtom);
  const [pages] = useAtom(pagesAtom);
  const [flipping, setFlipping] = useState(false);
  const previousPageRef = useRef<number>(page);

  // Fetch and parse the dynamic JSON structure
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchBookData(bookName);

      // Parse the new JSON structure { languages: [...] }
      if (data && Array.isArray(data.languages)) {
        const pics: Record<number, string[]> = {};
        const meta: { id: number; name: string }[] = [];

        data.languages.forEach((lang: any) => {
          pics[lang.id] = lang.pictures;
          meta.push({ id: lang.id, name: lang.name });
        });

        setPicturesByLang(pics);
        setLanguagesMeta(meta);

        // Ensure default language is set correctly
        if (meta.length > 0 && !meta.find((m) => m.id === language)) {
          setLanguage(meta[0].id);
        }
        setPage(0);
      }
    };
    loadData();
  }, [
    bookName,
    setPicturesByLang,
    setLanguagesMeta,
    setPage,
    language,
    setLanguage,
  ]);

  // Play page flip sound
  useEffect(() => {
    if (previousPageRef.current !== page && previousPageRef.current >= 0) {
      const audio = new Audio("/book-slider/audios/page-flip-01a.mp3");
      audio.volume = 0.5;
      audio
        .play()
        .catch((err) => console.warn("Failed to play page flip sound:", err));
    }
    previousPageRef.current = page;
  }, [page]);

  // Calculate dynamic language display logic
  const currentLangIndex = languagesMeta.findIndex((l) => l.id === language);
  const safeIndex = currentLangIndex >= 0 ? currentLangIndex : 0;
  const nextLangIndex = (safeIndex + 1) % Math.max(1, languagesMeta.length);
  const currentLangName = languagesMeta[safeIndex]?.name || "LOADING...";

  return (
    <>
      <style>{`
        @keyframes logo-pulse {
          0% { filter: drop-shadow(0 0 5px #ffd74d); }
          50% { filter: drop-shadow(0 0 15px #ffd74d); }
          100% { filter: drop-shadow(0 0 5px #ffd74d); }
        }
        .logo-container:hover {
          transform: scale(1.1) rotate(8deg);
          box-shadow: 0 0 40px rgba(255, 215, 77, 0.8);
        }
        
        /* Custom Range Slider Styling (Responsive to Viewport Height) */
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: clamp(16px, 3vh, 32px);
          height: clamp(16px, 3vh, 32px);
          border-radius: 50%;
          background: #ffd74d;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 215, 77, 0.8);
          transition: width 0.2s, height 0.2s;
        }

        input[type=range]::-moz-range-thumb {
          appearance: none;
          width: clamp(16px, 3vh, 32px);
          height: clamp(16px, 3vh, 32px);
          border-radius: 50%;
          background: #ffd74d;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(255, 215, 77, 0.8);
          transition: width 0.2s, height 0.2s;
        }
      `}</style>

      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <div className="flex justify-between items-center w-full">
          <button
            onClick={onClose}
            className="pointer-events-auto mt-10 ml-10 px-4 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg"
          >
            ← Back to Bookshelf
          </button>
        </div>

        <a className="pointer-events-auto" href="https://github.com/s-bhunia">
          <img
            src="book-slider/images/logo.jpg"
            alt="Logo"
            className="logo-container"
            style={{
              width: "60px",
              height: "60px",
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              cursor: "pointer",
              borderRadius: "50%",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s ease",
              animation: "logo-pulse 2s infinite",
              boxShadow: "0 0 20px rgba(255, 215, 77, 0.5)",
            }}
          />
        </a>

        {/* Dynamic Language Flip Button */}
        {languagesMeta.length > 1 && (
          <button
            className="pointer-events-auto px-4 py-2 rounded-full bg-white/90 text-black font-bold border border-black hover:bg-amber-100 transition-colors shadow-lg flex justify-center items-center"
            style={{
              position: "fixed",
              top: "28px",
              right: "100px",
              minWidth: "120px",
              zIndex: 999,
              perspective: "600px",
            }}
            onClick={() => {
              if (flipping) return;
              setFlipping(true);
              // Swap text exactly when the button is flipped 90 degrees (invisible)
              setTimeout(() => {
                setLanguage(languagesMeta[nextLangIndex].id);
                setPage(0);
                setFlipping(false);
              }, 150);
            }}
          >
            <span
              className="block transition-transform duration-150 ease-in-out"
              style={{
                transform: flipping ? "rotateX(90deg)" : "rotateX(0deg)",
              }}
            >
              {currentLangName}
            </span>
          </button>
        )}
        {/* New Pagination Slider System */}
        <div className="w-full pointer-events-auto flex justify-center items-center pb-[clamp(1rem,4vh,2rem)] pt-[clamp(1.5rem,6vh,3rem)] bg-gradient-to-t from-black/80 to-transparent transition-all duration-300">
          <div className="flex items-center gap-[clamp(0.5rem,2vh,1rem)] w-full max-w-2xl px-[clamp(1rem,3vh,1.5rem)] py-[clamp(0.5rem,2vh,1rem)] bg-black/40 backdrop-blur-md border border-white/20 rounded-full shadow-2xl transition-all duration-300">
            {/* Previous Page Button */}
            <button
              className="w-[clamp(2rem,6vh,3rem)] h-[clamp(2rem,6vh,3rem)] flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-colors font-bold text-[clamp(1rem,3vh,1.5rem)] disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              &larr;
            </button>

            {/* Slider and Text Container */}
            <div className="flex-1 flex flex-col items-center gap-[clamp(2px,1vh,4px)]">
              <span className="text-white/90 font-medium tracking-widest uppercase text-[clamp(0.6rem,1.5vh,0.85rem)] transition-all duration-300">
                {page === 0
                  ? "Front Cover"
                  : page === pages.length
                    ? "Back Cover"
                    : `Page ${page} of ${pages.length - 1}`}
              </span>
              <input
                type="range"
                min={0}
                max={pages.length}
                value={page}
                onChange={(e) => setPage(parseInt(e.target.value))}
                className="w-full h-[clamp(4px,0.8vh,8px)] bg-white/30 rounded-lg appearance-none cursor-pointer transition-all duration-300"
              />
            </div>

            {/* Next Page Button */}
            <button
              className="w-[clamp(2rem,6vh,3rem)] h-[clamp(2rem,6vh,3rem)] flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-colors font-bold text-[clamp(1rem,3vh,1.5rem)] disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
              onClick={() => setPage((p) => Math.min(pages.length, p + 1))}
              disabled={page === pages.length}
            >
              &rarr;
            </button>
          </div>
        </div>
      </main>
    </>
  );
};
