export function NoiseOverlay({ contained = false }: { contained?: boolean }) {
  return <div aria-hidden="true" className={`orbit-grain pointer-events-none inset-0 z-50 select-none [background-image:var(--noise-texture)] [mix-blend-mode:soft-light] [opacity:var(--noise-opacity)] ${contained ? "absolute" : "fixed"}`} />;
}
