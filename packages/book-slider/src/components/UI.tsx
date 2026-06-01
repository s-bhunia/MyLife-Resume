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
  const pages: PageData[] = [{ front: "cover1.jpg", back: pictures[0] }];
  for (let i = 1; i < pictures.length - 1; i += 2) {
    pages.push({ front: pictures[i % pictures.length], back: pictures[(i + 1) % pictures.length] });
  }
  pages.push({ front: pictures[pictures.length - 1], back: "book-back.jpg" });
  return pages;
};

export const picturesAtom = atom<Record<number, string[]>>({ 0: [], 1: [] });

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
  const [pages] = useAtom(pagesAtom);
  const [flipping, setFlipping] = useState(false);
  const previousPageRef = useRef<number>(page);

  // Fetch the specific book's JSON
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchBookData(bookName);
      if (Object.keys(data).length > 0) {
        setPicturesByLang(data);
        setPage(0); // Reset to cover when data loads
      }
    };
    loadData();
  }, [bookName, setPicturesByLang, setPage]);

  // Play page flip sound when page changes
  useEffect(() => {
    if (previousPageRef.current !== page && previousPageRef.current >= 0) {
      const audio = new Audio("/book-slider/audios/page-flip-01a.mp3");
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch((err) => console.warn("Failed to play page flip sound:", err));
    }
    previousPageRef.current = page;
  }, [page]);

  return (
    <>
      {/* Flip animation style */}
      <style>{`
        .flip-btn {
          perspective: 600px;
          display: inline-block;
        }
        .flip-inner {
          display: inline-block;
          transition: transform 0.5s cubic-bezier(.4,2,.6,1);
          transform-style: preserve-3d;
        }
        .flip-btn.flipping .flip-inner {
          transform: rotateY(90deg);
        }
        .flip-front, .flip-back {
          backface-visibility: hidden;
          position: absolute;
          left: 0; right: 0; top: 0; bottom: 0;
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .flip-back {
          transform: rotateY(180deg);
        }
           @keyframes logo-pulse {
    0% { filter: drop-shadow(0 0 5px #ffd74d); }
    50% { filter: drop-shadow(0 0 15px #ffd74d); }
    100% { filter: drop-shadow(0 0 5px #ffd74d); }
  }
  .logo-container:hover {
    transform: scale(1.1) rotate(8deg);
    box-shadow: 0 0 40px rgba(255, 215, 77, 0.8);
  }
      `}</style>
      <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <div className="flex justify-between items-center w-full">
          {/* Close Button / Back to Bookshelf */}
          <button
            onClick={onClose}
            className="pointer-events-auto mt-10 ml-10 px-4 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg"
          >
            ← Back to Bookshelf
          </button>
        </div>

        {/* Logo button - fixed at top right */}
        <a
          className="pointer-events-auto"
          href="https://github.com/s-bhunia"
        >
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
              transformStyle: "preserve-3d",
            }}
          />
        </a>
        {/* Language change button - fixed to the left of logo */}
        <span
          className={`flip-btn pointer-events-auto px-3 py-2 rounded-full bg-white/80 text-black font-bold border border-black hover:bg-amber-100 transition-all duration-300 ${flipping ? "flipping" : ""}`}
          style={{
            position: "fixed",
            top: "20px",
            right: "100px",
            minWidth: 120,
            minHeight: 48,
            cursor: "pointer",
            zIndex: 999,
          }}
          onClick={() => {
            setFlipping(true);
            setTimeout(() => setFlipping(false), 600);
            setLanguage((l) => (l === 0 ? 1 : 0));
            setPage(0);
          }}
        >
          <span
            className="flip-inner"
            style={{
              position: "relative",
              display: "inline-block",
              width: "100%",
              height: "100%",
            }}
          >
            <span
              className="flip-front"
              style={{ position: "absolute", width: "100%", height: "100%" }}
            >
              {language === 0 ? "ENGLISH" : "BENGALI"}
            </span>
            <span
              className="flip-back"
              style={{ position: "absolute", width: "100%", height: "100%" }}
            >
              {language === 0 ? "BENGALI" : "ENGLISH"}
            </span>
          </span>
        </span>
        
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>
    </>
  );
};
