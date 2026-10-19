import { useEffect, useRef, useState } from "react";
import type { Currency } from "../types/generated/Currency";
import { formatMinor } from "./ledger-utils";

export type AnimatedMoneyProps = {
  value: number | bigint;
  code: string;
  currencies: readonly Currency[];
  className?: string;
  delayMs?: number;
};

const DURATION_MS = 650;
const DURATION = BigInt(DURATION_MS);
const SCALE = DURATION ** 3n;

export function AnimatedMoney({ value, code, currencies, className, delayMs = 0 }: AnimatedMoneyProps) {
  // Validate number inputs with the same safe-integer rules as every other money display.
  const finalText = formatMinor(value, code, currencies);
  const target = BigInt(value);
  const [shown, setShown] = useState({ code, value: 0n });
  const current = useRef({ code, value: 0n });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const from = current.current.code === code ? current.current.value : 0n;
    const start = performance.now() + (Number.isFinite(delayMs) ? Math.max(0, delayMs) : 0);
    let frame = 0;
    let stopped = false;

    function display(amount: bigint) {
      current.current = { code, value: amount };
      setShown(current.current);
    }
    function stop() {
      stopped = true;
      window.cancelAnimationFrame(frame);
    }
    function finishOnMotionChange() {
      stop();
      display(target);
    }
    function tick(now: number) {
      if (stopped) return;
      const elapsed = Math.min(DURATION_MS, Math.max(0, Math.round(now - start)));
      // Cubic ease-out as an integer ratio: money never passes through floating point.
      const remaining = BigInt(DURATION_MS - elapsed);
      const progress = SCALE - remaining ** 3n;
      display(from + (target - from) * progress / SCALE);
      if (elapsed < DURATION_MS) frame = window.requestAnimationFrame(tick);
    }

    motion.addEventListener("change", finishOnMotionChange);
    if (motion.matches || from === target) display(target);
    else {
      display(from);
      frame = window.requestAnimationFrame(tick);
    }
    return () => {
      stop();
      motion.removeEventListener("change", finishOnMotionChange);
    };
  }, [target, code, delayMs]);

  return <span className={className}>
    <span aria-hidden="true">{formatMinor(shown.code === code ? shown.value : 0n, code, currencies)}</span>
    <span className="sr-only">{finalText}</span>
  </span>;
}
