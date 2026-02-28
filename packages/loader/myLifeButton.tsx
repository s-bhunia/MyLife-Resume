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
          color: #ddebf0; /* Matches your UI aesthetic */
          cursor: pointer;
          font-family: inherit;
          font-size: 1.1rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          /* Smoothly animates any padding or gap changes */
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* The container for your downloaded image */
        .house-wrapper {
          overflow: hidden;
          height: 0;
          opacity: 0;
          /* The cubic-bezier gives it a slight springy feel as it opens */
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .house-img {
          width: 85px; /* Adjust width as needed */
          height: auto;
          /* Adds a slight glow to the white sketch so it pops against the dark background */
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
        }

        /* The Hover State: expands the image container and pushes text down */
        .house-scanner-btn:hover .house-wrapper {
          height: 85px; 
          opacity: 1;
          margin-bottom: 12px;
        }

        .house-scanner-btn:hover {
          transform: translateY(-5px);
        }

        .text-wrapper {
          position: relative;
          padding-bottom: 10px; /* Gives room for the scanner line */
        }

        .btn-text {
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }

        .house-scanner-btn:hover .btn-text {
          color: #ffffff;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        /* The looping scanner line */
        .scanner-track {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.1); /* Faint background track */
          border-radius: 2px;
          overflow: hidden;
        }

        .scanner-track::before {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 50%;
          height: 100%;
          background: #ffffff;
          box-shadow: 0 0 10px #ffffff;
          /* Loops back and forth */
          animation: scan 1.5s ease-in-out infinite alternate;
        }

        @keyframes scan {
          0% { left: -50%; }
          100% { left: 100%; }
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
