/* components/attempt-timer.tsx */
'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
}

export function AttemptTimer({ durationMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) { onTimeUp(); return; }
    const id = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 120;
  const isDanger = timeLeft < 60;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[15px] font-bold tabular-nums transition-all"
      style={{
        background: isDanger
          ? 'oklch(0.96 0.05 25)'
          : isWarning
          ? 'oklch(0.96 0.06 70)'
          : 'oklch(0.93 0.04 262)',
        color: isDanger
          ? 'oklch(0.55 0.2 25)'
          : isWarning
          ? 'oklch(0.50 0.18 55)'
          : 'oklch(0.40 0.15 264)',
        animation: isDanger ? 'pulse 1s infinite' : 'none',
      }}
    >
      {isDanger
        ? <AlertTriangle size={13} className="shrink-0" />
        : <Clock size={13} className="shrink-0" />
      }
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
