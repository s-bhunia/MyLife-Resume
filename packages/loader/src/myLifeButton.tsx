import React from "react";
import "./myLifeButton.css";

interface ExploreHouseButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
}

export const ExploreHouseButton: React.FC<ExploreHouseButtonProps> = ({ onClick, disabled, label = "Explore myLife" }) => (
  <button type="button" className="house-scanner-btn" onClick={onClick} disabled={disabled}>
    <span className="house-wrapper" aria-hidden="true">
      <img src="/loader/home.png" alt="" className="house-img" />
    </span>
    <span className="text-wrapper">
      <span className="btn-text">{label}</span>
      <span className="scanner-track" />
    </span>
  </button>
);
