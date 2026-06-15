import React, { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { isMobileAtom } from "@mylife/core-engine";

export interface GlitchGreetingProps {
  wordSpeedMs?: number;
  pauseDurationMs?: number;
  textSize?: string;
}

export const GlitchGreeting: React.FC<GlitchGreetingProps> = ({
  wordSpeedMs = 250,
  pauseDurationMs = 3000,
  textSize = "2.2rem",
}) => {
  const isMobile = useAtomValue(isMobileAtom);
  const [messages, setMessages] = useState<string[]>(["SYSTEM READY..."]);
  const [messageIndex, setMessageIndex] = useState(0);

  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  // Guard against React StrictMode double‑invoke of effects in development.
  // The ref persists across the double render and ensures the JSON is fetched only once.
  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetch("/loader/loader_text.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) setMessages(data);
      })
      .catch(() => setMessages(["SYSTEM READY", "AWAITING INPUT..."]));
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const currentFullMessage = messages[messageIndex];
    const wordsArray = currentFullMessage.split(" ");

    if (wordIndex < wordsArray.length) {
      const typingTimer = setTimeout(() => {
        setDisplayedText((prev) =>
          prev === ""
            ? wordsArray[wordIndex]
            : prev + " " + wordsArray[wordIndex],
        );
        setWordIndex((prev) => prev + 1);
      }, wordSpeedMs);

      return () => clearTimeout(typingTimer);
    } else {
      const pauseTimer = setTimeout(() => {
        setDisplayedText("");
        setWordIndex(0);
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, pauseDurationMs);

      return () => clearTimeout(pauseTimer);
    }
  }, [wordIndex, messageIndex, messages, wordSpeedMs, pauseDurationMs]);

  return (
    <div
      className="glitch-container"
      style={{
        // Let the engine dictate the scale directly
        transform: `scale(${isMobile ? 0.6 : 1})`,
        transformOrigin: "center center",
      }}
    >
      <div className="greeting-container">
        {/* The terminal-box keeps the center of gravity stable. 
        It prevents the text from shifting left as new words are typed.
      */}
        <div className="terminal-box">
          <span className="glitch-text" data-text={displayedText}>
            {displayedText}
          </span>
          <span className="cursor">_</span>
        </div>

        <style>{`
        .greeting-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          width: 80vw;
          display: flex;
          justify-content: center;
        }

        .terminal-box {
          text-align: left;
          /* Adjust this min-width if your JSON sentences are very long */
          min-width: 400px; 
          display: flex;
          align-items: center;
        }

        .glitch-text {
          font-family: 'Courier New', Courier, monospace;
          color: #ffffff;
          font-size: ${textSize};
          letter-spacing: 2px;
          position: relative;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          white-space: pre-wrap; /* Ensures spaces between words are respected */
        }

        .cursor {
          font-family: 'Courier New', Courier, monospace;
          color: #ffffff;
          font-size: ${textSize};
          margin-left: 6px;
          animation: blink 1s step-end infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text); 
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #0d0d14; /* Masks the original text during the glitch */
          white-space: pre-wrap;
        }

        .glitch-text::before {
          left: 2px;
          text-shadow: -1px 0 rgba(0, 255, 255, 0.7);
          clip: rect(24px, 550px, 90px, 0);
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }

        .glitch-text::after {
          left: -2px;
          text-shadow: -1px 0 rgba(255, 255, 255, 0.7);
          clip: rect(85px, 550px, 140px, 0);
          animation: glitch-anim 2.5s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim {
          0% { clip: rect(10px, 9999px, 44px, 0); }
          20% { clip: rect(65px, 9999px, 89px, 0); }
          40% { clip: rect(4px, 9999px, 98px, 0); }
          60% { clip: rect(21px, 9999px, 12px, 0); }
          80% { clip: rect(87px, 9999px, 5px, 0); }
          100% { clip: rect(33px, 9999px, 67px, 0); }
        }

        @keyframes glitch-anim-2 {
          0% { clip: rect(32px, 9999px, 98px, 0); }
          20% { clip: rect(12px, 9999px, 44px, 0); }
          40% { clip: rect(76px, 9999px, 11px, 0); }
          60% { clip: rect(4px, 9999px, 89px, 0); }
          80% { clip: rect(55px, 9999px, 2px, 0); }
          100% { clip: rect(88px, 9999px, 66px, 0); }
        }
      `}</style>
      </div>
    </div>
  );
};
