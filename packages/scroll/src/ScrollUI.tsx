import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useScrollData } from './useScrollData';
import { useGhostWriter } from './useGhostWriter';
import './ScrollUI.css';

export interface ScrollUIProps {
  id: string | null;
  onClose: () => void;
  speed?: number;
}

// Custom link component that opens in new tab
const CustomLink = ({ href, children }: { href?: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export const ScrollUI: React.FC<ScrollUIProps> = ({ id, onClose, speed = 80 }) => {
  const { data, loading, error } = useScrollData(id);
  const { displayedText } = useGhostWriter(data?.content, speed);

  if (!id) return null;

  return (
    <div className="mylife-scroll-overlay" onClick={onClose}>
      {/* The main wrapper that holds the rollers and the paper */}
      <div className="mylife-scroll-wrapper" onClick={(e) => e.stopPropagation()}>
        
        {/* --- Top Wooden Roller --- */}
        <div className="mylife-scroll-roller top">
          <div className="roller-cap left"></div>
          <div className="roller-cap right"></div>
        </div>

        {/* --- The Paper --- */}
        <div className="mylife-scroll-paper">
          <button className="mylife-scroll-close" onClick={onClose}>&times;</button>

          {loading && <div className="mylife-scroll-status">Unrolling...</div>}
          {error && <div className="mylife-scroll-status error">{error}</div>}
          
          {!loading && !error && data && (
            <>
              <h2 className="mylife-scroll-title">{data.title}</h2>
              <div className="mylife-scroll-content">
                <ReactMarkdown components={{ a: CustomLink }}>
                  {displayedText}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>

        {/* --- Bottom Wooden Roller --- */}
        <div className="mylife-scroll-roller bottom">
          <div className="roller-cap left"></div>
          <div className="roller-cap right"></div>
        </div>

      </div>
    </div>
  );
};