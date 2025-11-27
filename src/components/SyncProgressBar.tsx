import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface SyncProgressBarProps {
  onExpired?: () => void;
}

export const SyncProgressBar = ({ onExpired }: SyncProgressBarProps) => {
  const [remainingMs, setRemainingMs] = useState<number>(15 * 60 * 1000);
  const totalDuration = 15 * 60 * 1000; // 15 minutos en ms

  useEffect(() => {
    const fetchRemaining = async () => {
      try {
        const ms = await invoke<number>("get_sync_remaining_time");
        setRemainingMs(ms);

        if (ms === 0 && onExpired) {
          onExpired();
        }
      } catch (error) {
        console.error("Failed to get remaining time:", error);
      }
    };

    fetchRemaining();
    const interval = setInterval(fetchRemaining, 1000);

    return () => clearInterval(interval);
  }, [onExpired]);

  const progress = (remainingMs / totalDuration) * 100;
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-600 h-8">
      <div
        className="h-full bg-neutral-50 transition-all duration-1000 ease-linear relative bg-blend-difference"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-mono font-medium text-neutral-900 mix-blend-difference">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
};
