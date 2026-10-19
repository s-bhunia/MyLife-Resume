import React from "react";
import "./ResumeButton.css";

interface ResumeButtonProps {
  resumePath?: string;
}

export const ResumeButton: React.FC<ResumeButtonProps> = ({ resumePath = "/loader/Resume_S_Bhunia.pdf" }) => (
  <a className="magic-resume-btn" href={resumePath} target="_blank" rel="noopener noreferrer">
    <span className="dots_border" aria-hidden="true" />
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="resume-icon" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
    <span className="text_button">Resume</span>
  </a>
);
