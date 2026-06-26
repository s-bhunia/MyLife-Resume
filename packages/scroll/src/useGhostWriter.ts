import { useState, useEffect } from 'react';

export const useGhostWriter = (text: string = "", wordSpeedMs: number = 100) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }
    
    setIsTyping(true);
    setDisplayedText(""); // Reset on new text

    // THE FIX: Matches Links | Bold | Headings | List Items | Whole Words | Stray Spaces
    const tokenRegex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(#{1,6}\s)|(-\s)|(\S+\s*)|(\s+)/g;
    
    // Convert the text into an array of words and markdown blocks
    const tokensArray = Array.from(text.matchAll(tokenRegex)).map(m => m[0]);

    let currentTokenIndex = 0;
    let currentString = '';

    const interval = setInterval(() => {
      if (currentTokenIndex >= tokensArray.length) {
        clearInterval(interval);
        setIsTyping(false);
        return;
      }
      
      // Append the next token (a full word or a full markdown block)
      currentString += tokensArray[currentTokenIndex];
      setDisplayedText(currentString);
      
      currentTokenIndex++;
    }, wordSpeedMs);

    return () => clearInterval(interval);
  }, [text, wordSpeedMs]);

  return { displayedText, isTyping };
};