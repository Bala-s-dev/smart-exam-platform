'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Ensure this is imported
import { Loader2, Sparkles } from 'lucide-react';

export default function ExamAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();
  const urlAttemptId = searchParams.get('attemptId');

  const [examId, setExamId] = useState<string>('');
  const [attempt, setAttempt] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NEW: States for AI Loading Animation
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
        const latest = history.find(
          (h: any) => h.examId === eId && h.completedAt
        );

        if (latest) targetAttemptId = latest.id;
        else {
          setError('No completed attempts found for this exam.');
          setLoading(false);
          return;
        }
      }

      if (targetAttemptId) {
        const res = await fetch(`/api/attempts/${targetAttemptId}`);
        if (!res.ok) throw new Error('Failed to load attempt');
        const data = await res.json();
        setAttempt(data);
      }
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = async () => {
    if (!attempt) return;

    // 1. Start Animation
    setAnalyzing(true);
    setProgress(0);

    // Simulate progress bar filling up to 90%
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 500);

    try {
      const res = await fetch('/api/ai/predict', { method: 'POST' });
      const json = await res.json();

      // 2. Finish Animation
      clearInterval(interval);
      setProgress(100);

      // Small delay to let user see 100%
      setTimeout(() => {
        setPrediction(json);
        setAnalyzing(false);
      }, 500);
    } catch (e) {
      clearInterval(interval);
      setAnalyzing(false);
      alert('AI Service Unavailable');
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center flex justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading Report...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Link href="/dashboard">
          <Button variant="outline">Go Dashboard</Button>
        </Link>
      </div>
    );

  const scoreColor =
    (attempt.score || 0) >= attempt.exam.passingScore
      ? 'text-green-600'
      : 'text-red-600';

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Report</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Card */}
        <Card>
          <CardHeader>
            <CardTitle>Result Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className={`text-6xl font-bold mb-2 ${scoreColor}`}>
              {Math.round(attempt.score || 0)}%
            </div>
            <p className="text-gray-500 uppercase tracking-wide font-semibold">
              {attempt.isPassed ? 'PASSED' : 'FAILED'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Exam: {attempt.exam.title}
            </p>
          </CardContent>
        </Card>

        {/* AI Insight Card */}
        <Card>
          <CardHeader>
            <CardTitle>AI Coach</CardTitle>
          </CardHeader>
          <CardContent>
            {/* STATE 1: Not Started */}
            {!prediction && !analyzing && (
              <div className="text-center py-4">
                <p className="mb-4 text-sm text-gray-500">
                  Get personalized study tips based on this result.
                </p>
                <Button
                  onClick={getPrediction}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Analyze Weaknesses
                </Button>
              </div>
            )}

            {/* STATE 2: Loading (Progress Bar) */}
            {analyzing && (
              <div className="space-y-4 py-4">
                <p className="text-sm font-medium text-center text-purple-700 animate-pulse">
                  Gemini AI is analyzing your answers...
                </p>
                <Progress value={progress} className="h-2 w-full bg-gray-100" />
                <p className="text-xs text-center text-gray-400">
                  This usually takes about 5-10 seconds.
                </p>
              </div>
            )}

            {/* STATE 3: Result Shown */}
            {prediction && (
              <div className="animate-in fade-in space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm italic text-gray-800 relative">
                  <Sparkles className="h-4 w-4 text-purple-500 absolute top-2 right-2" />
                  "{prediction.feedback}"
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Focus On
                    </span>
                    <span className="font-medium text-sm block leading-tight">
                      {prediction.recommendedFocus}
                    </span>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Next Predicted
                    </span>
                    <span className="font-bold text-xl text-purple-600">
                      {prediction.predictedScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
