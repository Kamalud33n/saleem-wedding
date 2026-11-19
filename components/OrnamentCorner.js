export default function OrnamentCorner({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={`pointer-events-none text-marigold-dark/40 ${className}`}
      fill="none"
    >
      <path
        d="M8 56V28C8 16 16 8 28 8h28"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M20 44c6-10 14-16 24-20"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="44" cy="24" r="1.6" fill="currentColor" />
    </svg>
  );
}
