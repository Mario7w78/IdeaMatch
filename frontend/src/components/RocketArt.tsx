/**
 * Ilustración del cohete (placeholder vectorial). Reemplazar por la imagen
 * 3D del diseño cuando esté disponible en /public.
 */
export function RocketArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 480" className={className} role="img" aria-label="Cohete despegando">
      <defs>
        <linearGradient id="ra-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3c6ff" />
          <stop offset="0.55" stopColor="#c86cf5" />
          <stop offset="1" stopColor="#7a3df0" />
        </linearGradient>
        <linearGradient id="ra-fin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7be5" />
          <stop offset="1" stopColor="#d63ad1" />
        </linearGradient>
        <linearGradient id="ra-trail" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ff2f9a" />
          <stop offset="1" stopColor="#ff7ac4" />
        </linearGradient>
        <radialGradient id="ra-glow" cx="0.3" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#ffd3ec" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="480" fill="url(#ra-glow)" />
      {/* estela de bloques */}
      <g fill="url(#ra-trail)">
        <rect x="20" y="370" width="70" height="70" rx="6" transform="rotate(-18 55 405)" />
        <rect x="80" y="330" width="78" height="78" rx="6" transform="rotate(12 119 369)" opacity="0.92" />
        <rect x="140" y="300" width="64" height="64" rx="6" transform="rotate(-8 172 332)" />
        <rect x="190" y="268" width="56" height="56" rx="6" transform="rotate(20 218 296)" opacity="0.9" />
        <rect x="40" y="420" width="96" height="60" rx="6" opacity="0.85" />
        <rect x="128" y="392" width="88" height="88" rx="6" transform="rotate(6 172 436)" />
      </g>
      {/* cohete */}
      <g transform="translate(250 60) rotate(40 110 160)">
        <path d="M70 200 L20 300 L90 250 Z" fill="url(#ra-fin)" />
        <path d="M150 200 L200 300 L130 250 Z" fill="url(#ra-fin)" />
        <path d="M110 0 C170 60 170 190 145 255 L75 255 C50 190 50 60 110 0 Z" fill="url(#ra-body)" />
        <ellipse cx="110" cy="95" rx="24" ry="26" fill="#f7e9ff" stroke="#b06cf0" strokeWidth="8" />
        <rect x="80" y="252" width="60" height="22" rx="8" fill="#8a4ff0" />
      </g>
      {/* destellos */}
      <g stroke="#1f1d2b" strokeLinecap="round">
        <path d="M150 90 v40 M130 110 h40" strokeWidth="2.5" />
        <path d="M172 136 v10 M167 141 h10" strokeWidth="1.5" />
      </g>
    </svg>
  )
}
