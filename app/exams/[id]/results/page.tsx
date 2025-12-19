'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, History, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  if (!result)
    return <div className="p-10 text-center">Calculating results...</div>;

  const isPassed = result.isPassed;

  return (
    <div className="max-w-xl mx-auto py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl mb-4
        ${
          isPassed
            ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20'
            : 'bg-red-100 text-red-600 shadow-red-500/20'
        }`}
      >
        {isPassed ? '🏆' : '📚'}
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {isPassed ? 'Performance Verified!' : 'Session Concluded'}
        </h1>
        <p className="text-muted-foreground font-medium">
          Exam Attempt: {result.exam.title}
        </p>
      </div>

      <Card
        className={`w-full border-2 p-8 overflow-hidden relative
        ${
          isPassed
            ? 'border-emerald-200 bg-emerald-50/30'
            : 'border-red-200 bg-red-50/30'
        }`}
      >
        <div className="text-8xl font-black tracking-tighter mb-4 tabular-nums">
          {Math.round(result.score)}
          <span className="text-4xl text-muted-foreground/40">%</span>
        </div>
        <p
          className={`font-bold uppercase tracking-widest text-xs py-1 px-3 rounded-full inline-block
          ${
            isPassed
              ? 'bg-emerald-200 text-emerald-700'
              : 'bg-red-200 text-red-700'
          }`}
        >
          {isPassed ? 'Standard Achieved' : 'Criteria Not Met'}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 w-full pt-4">
        <Link href="/dashboard" className="w-full">
          <Button variant="outline" className="w-full h-14 font-bold border-2">
            Exit to Portal
          </Button>
        </Link>
        <Link
          href={`/exams/${result.examId}/analytics?attemptId=${attemptId}`}
          className="w-full"
        >
          <Button className="w-full h-14 font-bold shadow-lg shadow-primary/20 gap-2">
            <TrendingUp className="h-5 w-5" /> AI Feedback
          </Button>
        </Link>
      </div>
    </div>
  );
}
