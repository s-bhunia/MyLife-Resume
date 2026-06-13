import React from "react";

interface ExploreHouseButtonProps {
  onClick?: () => void;
}

export const ExploreHouseButton: React.FC<ExploreHouseButtonProps> = ({
  onClick,
}) => {
  return (
    <>
      <style>{`
        .house-scanner-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          background: transparent;
          border: none;
          color: #ffffff;
          cursor: pointer;
          font-family: inherit;
          font-size: 1.1rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .house-scanner-btn:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }

        .house-wrapper {
          /* Position absolutely so it does not affect the layout of sibling buttons */
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          overflow: hidden;
          height: 85px; /* reserve space for the image */
          opacity: 0;
          transition: opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .house-img {
          width: 85px;
          height: auto;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
        }

        .house-scanner-btn:hover .house-wrapper {
          opacity: 1;
        }

        .house-scanner-btn:hover {
          transform: translateY(-5px);
        }

        .text-wrapper {
          position: relative;
          padding-bottom: 10px;
        }

        .btn-text {
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }

        .house-scanner-btn:hover .btn-text {
          color: #ffffff;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .scanner-track {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .scanner-track::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: #ffffff;
          box-shadow: 0 0 10px #ffffff;
          animation: scan 1.5s ease-in-out infinite alternate;
          transform: translateX(-100%);
        }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .house-scanner-btn,
          .house-wrapper,
          .btn-text,
          .scanner-track::before {
            animation: none;
            transition: none;
          }
        }
      `}</style>

      <button className="house-scanner-btn" onClick={onClick}>
        <div className="house-wrapper">
          <img
            src="/loader/home-negate.png"
            alt="House sketch"
            className="house-img"
          />
        </div>
        <div className="text-wrapper">
          <span className="btn-text">Explore myLife</span>
          <div className="scanner-track"></div>
        </div>
      </button>
    </>
  );
};
