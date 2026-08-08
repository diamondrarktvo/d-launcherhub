import { useEffect } from "react";
import "./splash-screen.css";

const TOTAL_DURATION_MS = 2350;
const REDUCED_MOTION_DURATION_MS = 600;

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const timer = setTimeout(
      onFinish,
      prefersReducedMotion ? REDUCED_MOTION_DURATION_MS : TOTAL_DURATION_MS,
    );

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-overlay">
      <div className="splash-stage">
        <span className="splash-word splash-word-before">The&nbsp;</span>
        <span className="splash-rocket-slot">
          <span className="splash-glow" />
          <svg
            className="splash-rocket"
            viewBox="336 280 352 510"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="splash-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F5F6F8" />
                <stop offset="1" stopColor="#CBD2D8" />
              </linearGradient>
              <radialGradient id="splash-win" cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#B9F1F7" />
                <stop offset="0.5" stopColor="#39D6E0" />
                <stop offset="1" stopColor="#1587A8" />
              </radialGradient>
              <linearGradient id="splash-fin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#39D6E0" />
                <stop offset="1" stopColor="#1587A8" />
              </linearGradient>
            </defs>
            <g className="splash-exhaust">
              <rect x="490" y="646" width="44" height="44" rx="9" fill="#5BE3ED" opacity="0.85" />
              <rect x="497" y="704" width="30" height="30" rx="7" fill="#39C4D6" opacity="0.55" />
              <rect x="503" y="748" width="18" height="18" rx="5" fill="#2AA0C2" opacity="0.32" />
            </g>
            <polygon points="432,556 432,642 356,668" fill="url(#splash-fin)" />
            <polygon points="592,556 592,642 668,668" fill="url(#splash-fin)" />
            <rect x="432" y="300" width="160" height="340" rx="80" fill="url(#splash-body)" />
            <circle cx="512" cy="382" r="44" fill="url(#splash-win)" />
            <circle cx="497" cy="367" r="13" fill="#FFFFFF" opacity="0.55" />
          </svg>
          <span className="splash-impact-ring" />
        </span>
        <span className="splash-word splash-word-after">auncher</span>
      </div>
    </div>
  );
}
