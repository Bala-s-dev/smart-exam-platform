'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // Ensure you have lucide-react, or remove icon

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

  useEffect(() => {
    // 1. Unwrap the Exam ID from params
    params.then((p) => {
      setExamId(p.id);
      loadData(p.id, urlAttemptId);
    });
  }, [params, urlAttemptId]);

  const loadData = async (eId: string, aId: string | null) => {
    try {
      let targetAttemptId = aId;

      // AUTO-DETECT: If no attempt ID in URL, find the latest one for this exam
      if (!targetAttemptId) {
        const res = await fetch('/api/attempts'); // Fetches user's history
        const history = await res.json();
        // Find latest attempt for this specific exam
        const latest = history.find(
          (h: any) => h.examId === eId && h.completedAt
        );

        if (latest) {
          targetAttemptId = latest.id;
        } else {
          setError('No completed attempts found for this exam.');
          setLoading(false);
          return;
        }
      }

      // 2. Fetch specific attempt details
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
    try {
      const res = await fetch('/api/ai/predict', { method: 'POST' });
      const json = await res.json();
      setPrediction(json);
    } catch (e) {
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
            {!prediction ? (
              <div className="text-center py-4">
                <p className="mb-4 text-sm text-gray-500">
                  Get personalized study tips based on this result.
                </p>
                <Button
                  onClick={getPrediction}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  ✨ Analyze Weaknesses
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in space-y-3">
                <div className="bg-purple-50 p-3 rounded border border-purple-100 text-sm italic text-gray-800">
                  "{prediction.feedback}"
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    Focus On:
                  </span>
                  <span className="font-medium text-sm">
                    {prediction.recommendedFocus}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    Predicted Next Score:
                  </span>
                  <span className="font-bold text-purple-600">
                    {prediction.predictedScore}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
