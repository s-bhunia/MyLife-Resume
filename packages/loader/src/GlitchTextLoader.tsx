import React, { useEffect, useRef, useState } from "react";

export interface GlitchGreetingProps {
  wordSpeedMs?: number;
  pauseDurationMs?: number;
}

export const GlitchGreeting: React.FC<GlitchGreetingProps> = ({ wordSpeedMs = 220, pauseDurationMs = 2600 }) => {
  const [messages, setMessages] = useState<string[]>(["SYSTEM READY..."]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch("/loader/loader_text.json")
      .then((res) => res.json())
      .then((data: string[]) => data?.length && setMessages(data))
      .catch(() => setMessages(["SYSTEM READY", "AWAITING INPUT..."]));
  }, []);

  useEffect(() => {
    const words = messages[messageIndex].split(" ");
    if (wordIndex < words.length) {
      const typing = setTimeout(() => {
        setDisplayedText((prev) => (prev ? `${prev} ${words[wordIndex]}` : words[wordIndex]));
        setWordIndex((i) => i + 1);
      }, wordSpeedMs);
      return () => clearTimeout(typing);
    }
    const pause = setTimeout(() => {
      setDisplayedText("");
      setWordIndex(0);
      setMessageIndex((i) => (i + 1) % messages.length);
    }, pauseDurationMs);
    return () => clearTimeout(pause);
  }, [wordIndex, messageIndex, messages, wordSpeedMs, pauseDurationMs]);

  return (
    <div className="glitch-greeting" aria-live="polite">
      <span className="glitch-text" data-text={displayedText}>
        {displayedText}
      </span>
      <span className="glitch-cursor">_</span>
    </div>
  );
};
