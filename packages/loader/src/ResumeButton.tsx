import React from "react";

interface ResumeButtonProps {
  onClick?: () => void;
}

export const ResumeButton: React.FC<ResumeButtonProps> = ({ onClick }) => {
  return (
    <>
      <style>{`
        .magic-resume-btn {
          --black-700: hsla(0 0% 12% / 1);
          --border_radius: 9999px;
          --transtion: 0.3s ease-in-out;
          --offset: 2px;

          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transform-origin: center;
          padding: 1rem 2rem;
          background-color: transparent;
          border: none;
          border-radius: var(--border_radius);
          transform: scale(calc(1 + (var(--active, 0) * 0.1)));
          transition: transform var(--transtion);
        }

        .magic-resume-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: var(--black-700);
          border-radius: var(--border_radius);
          box-shadow: inset 0 0.5px hsl(0, 0%, 100%), inset 0 -1px 2px 0 hsl(0, 0%, 0%),
            0px 4px 10px -4px hsla(0 0% 0% / calc(1 - var(--active, 0))),
            0 0 0 calc(var(--active, 0) * 0.375rem) hsl(260 97% 50% / 0.75);
          transition: all var(--transtion);
          z-index: 0;
        }

        .magic-resume-btn::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: hsla(260 97% 61% / 0.75);
          background-image: radial-gradient(at 51% 89%, hsla(266, 45%, 74%, 1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(266, 36%, 60%, 1) 0px, transparent 50%),
            radial-gradient(at 22% 91%, hsla(266, 36%, 60%, 1) 0px, transparent 50%);
          background-position: top;
          opacity: var(--active, 0);
          border-radius: var(--border_radius);
          transition: opacity var(--transtion);
          z-index: 2;
        }

        .magic-resume-btn:is(:hover, :focus-visible) {
          --active: 1;
        }
        
        .magic-resume-btn:active {
          transform: scale(1);
        }

        .magic-resume-btn .dots_border {
          --size_border: calc(100% + 2px);
          overflow: hidden;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: var(--size_border);
          height: var(--size_border);
          background-color: transparent;
          border-radius: var(--border_radius);
          z-index: -10;
        }

        .magic-resume-btn .dots_border::before {
          content: "";
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: left;
          transform: rotate(0deg);
          width: 100%;
          height: 2rem;
          background-color: white;
          mask: linear-gradient(transparent 0%, white 120%);
          -webkit-mask: linear-gradient(transparent 0%, white 120%);
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          to { transform: rotate(360deg); }
        }

        .magic-resume-btn .resume-icon {
          position: relative;
          z-index: 10;
          width: 1.5rem;
          color: hsl(0, 0%, 100%);
        }

        .magic-resume-btn .text_button {
          position: relative;
          z-index: 10;
          background-image: linear-gradient(
            90deg,
            hsla(0 0% 100% / 1) 0%,
            hsla(0 0% 100% / var(--active, 0)) 120%
          );
          background-clip: text;
          -webkit-background-clip: text;
          font-size: 1rem;
          font-weight: 600;
          color: transparent;
        }
      `}</style>

      <button className="magic-resume-btn" onClick={onClick}>
        <div className="dots_border"></div>

        {/* Replace this SVG with your preferred Resume icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="resume-icon"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>

        <span className="text_button">Resume</span>
      </button>
    </>
  );
};
