import { useEffect } from "react";
import { RocketLogo } from "@/components/RocketLogo";
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
          <RocketLogo idPrefix="splash-rocket" className="splash-rocket" exhaust />
          <span className="splash-impact-ring" />
        </span>
        <span className="splash-word splash-word-after">auncher</span>
      </div>
    </div>
  );
}
