import OrbitLogo from "./orbit-logo";

interface SplashScreenProps {
  /** Message shown under the wordmark. Defaults to a Spanish loading message. */
  message?: string;
}

/**
 * Orbit desktop app splash screen.
 *
 * - Centered white logo + "Orbit" wordmark with an animated glow.
 * - Black hole background image at 15% opacity.
 * - Loading status text with an indeterminate progress bar.
 *
 * Animations are implemented with pure CSS keyframes (defined in App.css),
 * so there is no animation library dependency to ship in a lightweight
 * desktop splash window.
 */
export function SplashScreen({ message = "Iniciando aplicación" }: SplashScreenProps) {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Background: black hole at 15% opacity */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <img src="/black-hole.png" alt="" sizes="100vw" className="object-cover opacity-15" />
        {/* Vignette to keep the center legible */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Foreground content */}
      <div className="animate-orbit-fade-up relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Logo with breathing halo */}
        <div className="relative flex items-center justify-center">
          <span aria-hidden="true" className="animate-orbit-halo absolute h-28 w-28 rounded-full bg-white/25 blur-2xl" />
          <div className="animate-orbit-float relative w-20 h-20 drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]">
            <OrbitLogo size="large" color="white" />
          </div>
        </div>

        {/* Wordmark with animated glow */}
        <h1 className="animate-orbit-text-glow text-4xl font-semibold tracking-[0.2em] text-white">Orbit</h1>

        {/* Loading status */}
        <div className="flex flex-col items-center gap-4">
          <p className="flex items-center gap-1 text-sm font-medium tracking-wide text-white/70">
            <span>{message}</span>
            <span className="animate-orbit-dot" style={{ animationDelay: "0ms" }}>
              .
            </span>
            <span className="animate-orbit-dot" style={{ animationDelay: "200ms" }}>
              .
            </span>
            <span className="animate-orbit-dot" style={{ animationDelay: "400ms" }}>
              .
            </span>
          </p>

          {/* Indeterminate progress bar */}
          <div className="h-px w-44 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Cargando">
            <div className="animate-orbit-progress h-full w-1/4 rounded-full bg-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
