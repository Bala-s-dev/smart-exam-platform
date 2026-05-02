/* app/exams/[id]/results/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TrendingUp, Home, Loader2, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!attemptId) return;
    fetch(`/api/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((data) => setResult(data));
  }, [attemptId]);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[14px] font-medium">Calculating results…</span>
      </div>
    );
  }

  const isPassed = result.isPassed;
  const score = Math.round(result.score);

  return (
    <div className="max-w-md mx-auto py-12 flex flex-col items-center text-center space-y-7 anim-up">
      {/* Score ring */}
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="68" fill="none" stroke="oklch(0.93 0.01 255)" strokeWidth="10" />
          <circle
            cx="80" cy="80" r="68"
            fill="none"
            stroke={isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 68}`}
            strokeDashoffset={`${2 * Math.PI * 68 * (1 - score / 100)}`}
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums">{score}<span className="text-xl text-muted-foreground">%</span></span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Score</span>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          {isPassed
            ? <CheckCircle2 size={22} style={{ color: 'oklch(0.50 0.14 155)' }} />
            : <XCircle size={22} style={{ color: 'oklch(0.55 0.2 25)' }} />
          }
          <h1 className="text-2xl font-bold tracking-tight">
            {isPassed ? 'Well done!' : 'Keep going!'}
          </h1>
        </div>
        <p className="text-muted-foreground text-[15px]">{result.exam.title}</p>
        <span
          className="inline-flex px-3 py-1 rounded-full text-[12px] font-semibold"
          style={{
            background: isPassed ? 'oklch(0.94 0.06 155)' : 'oklch(0.96 0.05 25)',
            color: isPassed ? 'oklch(0.40 0.14 155)' : 'oklch(0.55 0.2 25)',
          }}
        >
          {isPassed ? 'Passed — standard achieved' : 'Failed — criteria not met'}
        </span>
      </div>

      {/* Details */}
      <div className="w-full card-base p-5 grid grid-cols-2 gap-4 text-left">
        <div className="p-3 rounded-xl" style={{ background: 'oklch(0.97 0.005 255)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Your score</p>
          <p className="text-[24px] font-bold tabular-nums" style={{ color: isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}>
            {score}%
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'oklch(0.97 0.005 255)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pass mark</p>
          <p className="text-[24px] font-bold tabular-nums">{result.exam.passingScore}%</p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full grid grid-cols-2 gap-3">
        <Link href="/dashboard" className="contents">
          <Button variant="outline" className="h-11 font-semibold rounded-xl text-[14px] gap-1.5">
            <Home size={15} /> Dashboard
          </Button>
        </Link>
        <Link href={`/exams/${result.examId}/analytics?attemptId=${attemptId}`} className="contents">
          <Button
            className="h-11 font-semibold rounded-xl text-[14px] gap-1.5"
            style={{ background: 'oklch(0.52 0.22 264)' }}
          >
            <TrendingUp size={15} /> AI feedback
          </Button>
        </Link>
      </div>

      {/* Secondary */}
      <Link href="/exams" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
        Browse more exams →
      </Link>
    </div>
  );
}
