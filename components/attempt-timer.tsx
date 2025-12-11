'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
}

export function AttemptTimer({ durationMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      className={`font-mono text-xl font-bold ${
        timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
