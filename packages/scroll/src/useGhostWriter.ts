import { useState, useEffect } from 'react';

export const useGhostWriter = (text: string = "", wordSpeedMs: number = 100) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setIsTyping(true);
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    setDisplayedText(""); // Reset on new text

    const interval = setInterval(() => {
      // Re-join the array up to the current word
      const currentString = words.slice(0, currentWordIndex + 1).join(' ');
      setDisplayedText(currentString);
      
      currentWordIndex++;

      if (currentWordIndex >= words.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, wordSpeedMs);

    return () => clearInterval(interval);
  }, [text, wordSpeedMs]);

  return { displayedText, isTyping };
};