/* app/exams/[id]/analytics/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ArrowLeft, Target, Brain, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

export default function ExamAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const urlAttemptId = searchParams.get('attemptId');
  const [examId, setExamId] = useState<string>('');
  const [attempt, setAttempt] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    params.then((p) => {
      setExamId(p.id);
      loadData(p.id, urlAttemptId);
    });
  }, [params, urlAttemptId]);

  const loadData = async (eId: string, aId: string | null) => {
    try {
      let targetAttemptId = aId;
      if (!targetAttemptId) {
        const res = await fetch('/api/attempts');
        const history = await res.json();
        const latest = history.find((h: any) => h.examId === eId && h.completedAt);
        if (latest) targetAttemptId = latest.id;
        else { setError('No completed attempts found for this exam.'); setLoading(false); return; }
      }
      if (targetAttemptId) {
        const res = await fetch(`/api/attempts/${targetAttemptId}`);
        if (!res.ok) throw new Error('Failed to load attempt');
        setAttempt(await res.json());
      }
    } catch { setError('Failed to load analytics data.'); }
    finally { setLoading(false); }
  };

  const getPrediction = async () => {
    if (!attempt) return;
    setAnalyzing(true);
    setProgress(0);
    const interval = setInterval(() => setProgress((prev) => Math.min(prev + 8, 88)), 400);
    try {
      const res = await fetch('/api/ai/predict', { method: 'POST' });
      const json = await res.json();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setPrediction(json); setAnalyzing(false); }, 400);
    } catch {
      clearInterval(interval);
      setAnalyzing(false);
      alert('AI service unavailable.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[14px] font-medium">Loading report…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center space-y-4">
        <p className="text-[15px] font-medium text-muted-foreground">{error}</p>
        <Link href="/dashboard"><Button variant="outline" className="rounded-xl">Back to dashboard</Button></Link>
      </div>
    );
  }

  const score = Math.round(attempt.score || 0);
  const isPassed = attempt.isPassed;

  return (
    <div className="max-w-4xl mx-auto space-y-7 anim-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground">
              <ArrowLeft size={15} /> Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Performance report</h1>
            <p className="text-muted-foreground text-[14px]">{attempt.exam.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Score card */}
        <div className="card-base p-7 flex flex-col items-center justify-center text-center gap-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: isPassed ? 'oklch(0.94 0.06 155)' : 'oklch(0.96 0.05 25)' }}
          >
            {isPassed
              ? <CheckCircle2 size={36} style={{ color: 'oklch(0.50 0.14 155)' }} />
              : <XCircle size={36} style={{ color: 'oklch(0.55 0.2 25)' }} />
            }
          </div>
          <div>
            <div className="text-[56px] font-bold tabular-nums leading-none"
              style={{ color: isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}
            >
              {score}<span className="text-[28px] text-muted-foreground">%</span>
            </div>
            <div
              className="inline-flex mt-2 px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: isPassed ? 'oklch(0.94 0.06 155)' : 'oklch(0.96 0.05 25)',
                color: isPassed ? 'oklch(0.40 0.14 155)' : 'oklch(0.55 0.2 25)',
              }}
            >
              {isPassed ? 'Passed' : 'Failed'} — passing score: {attempt.exam.passingScore}%
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            <Link href="/exams" className="contents">
              <Button variant="outline" className="h-9 text-[13px] rounded-xl font-medium">Browse more</Button>
            </Link>
            <Link href="/results" className="contents">
              <Button className="h-9 text-[13px] rounded-xl font-medium" style={{ background: 'oklch(0.52 0.22 264)' }}>
                All results
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Coach card */}
        <div className="card-base p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.94 0.04 300)' }}>
              <Brain size={16} style={{ color: 'oklch(0.55 0.2 300)' }} />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">AI coach</h2>
              <p className="text-[12px] text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>

          {/* Not started */}
          {!prediction && !analyzing && (
            <div className="space-y-4">
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Get personalised study recommendations and a predicted score for your next attempt based on this result.
              </p>
              <Button
                onClick={getPrediction}
                className="w-full h-11 font-semibold rounded-xl text-[14px] gap-2"
                style={{ background: 'oklch(0.55 0.2 300)' }}
              >
                <Sparkles size={16} /> Analyse my performance
              </Button>
            </div>
          )}

          {/* Loading */}
          {analyzing && (
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium" style={{ color: 'oklch(0.55 0.2 300)' }}>Gemini is analysing your answers…</span>
                  <span className="text-muted-foreground font-semibold">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.93 0.01 255)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, background: 'oklch(0.55 0.2 300)' }}
                  />
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground">This usually takes 5–10 seconds.</p>
            </div>
          )}

          {/* Result */}
          {prediction && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="p-4 rounded-xl border text-[14px] leading-relaxed italic"
                style={{ background: 'oklch(0.94 0.04 300)', borderColor: 'oklch(0.88 0.06 300)', color: 'oklch(0.25 0.08 300)' }}
              >
                <Sparkles size={13} className="inline mr-2 mb-0.5" style={{ color: 'oklch(0.55 0.2 300)' }} />
                {prediction.feedback}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-border" style={{ background: 'oklch(0.97 0.005 255)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Target size={12} className="text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Focus on</p>
                  </div>
                  <p className="text-[14px] font-semibold">{prediction.recommendedFocus}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border" style={{ background: 'oklch(0.97 0.005 255)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={12} className="text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Predicted next</p>
                  </div>
                  <p className="text-[24px] font-bold tabular-nums" style={{ color: 'oklch(0.55 0.2 300)' }}>
                    {prediction.predictedScore}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
