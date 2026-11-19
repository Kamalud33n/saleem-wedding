export default function SectionBridge({ from = "parchment", to = "peacock" }) {
  const gradients = {
    "parchment-peacock":
      "linear-gradient(180deg, var(--color-parchment) 0%, color-mix(in srgb, var(--color-peacock-dark) 35%, var(--color-parchment)) 55%, var(--color-peacock-dark) 100%)",
    "peacock-parchment":
      "linear-gradient(180deg, var(--color-peacock-dark) 0%, color-mix(in srgb, var(--color-peacock-dark) 40%, var(--color-parchment)) 50%, var(--color-parchment) 100%)",
    "parchment-soft":
      "linear-gradient(180deg, var(--color-parchment) 0%, var(--color-parchment-dark) 100%)",
    "soft-parchment":
      "linear-gradient(180deg, color-mix(in srgb, var(--color-parchment-dark) 55%, transparent) 0%, var(--color-parchment) 100%)",
  };

  const key = `${from}-${to}`;
  const background = gradients[key] || gradients["parchment-soft"];

  return (
    <div
      aria-hidden="true"
      className="h-10 sm:h-14 w-full pointer-events-none"
      style={{ background }}
    />
  );
}
