type RocketLogoProps = {
  className?: string
  idPrefix?: string
  /** Ajoute le panache de flammes utilisé par le splash screen au décollage. */
  exhaust?: boolean
}

export function RocketLogo({ className, idPrefix = "rocket-logo", exhaust }: RocketLogoProps) {
  const bodyId = `${idPrefix}-body`
  const winId = `${idPrefix}-win`
  const finId = `${idPrefix}-fin`

  return (
    <svg className={className} viewBox="336 280 352 510" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5F6F8" />
          <stop offset="1" stopColor="#CBD2D8" />
        </linearGradient>
        <radialGradient id={winId} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#B9F1F7" />
          <stop offset="0.5" stopColor="#39D6E0" />
          <stop offset="1" stopColor="#1587A8" />
        </radialGradient>
        <linearGradient id={finId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#39D6E0" />
          <stop offset="1" stopColor="#1587A8" />
        </linearGradient>
      </defs>
      {exhaust && (
        <g className="splash-exhaust">
          <rect x="490" y="646" width="44" height="44" rx="9" fill="#5BE3ED" opacity="0.85" />
          <rect x="497" y="704" width="30" height="30" rx="7" fill="#39C4D6" opacity="0.55" />
          <rect x="503" y="748" width="18" height="18" rx="5" fill="#2AA0C2" opacity="0.32" />
        </g>
      )}
      <polygon points="432,556 432,642 356,668" fill={`url(#${finId})`} />
      <polygon points="592,556 592,642 668,668" fill={`url(#${finId})`} />
      <rect x="432" y="300" width="160" height="340" rx="80" fill={`url(#${bodyId})`} />
      <circle cx="512" cy="382" r="44" fill={`url(#${winId})`} />
      <circle cx="497" cy="367" r="13" fill="#FFFFFF" opacity="0.55" />
    </svg>
  )
}
