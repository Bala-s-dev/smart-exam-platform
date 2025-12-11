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

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <Card
        className={
          result.isPassed
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
        }
      >
        <CardHeader>
          <CardTitle className="text-2xl">
            {result.isPassed ? '🎉 Passed!' : '😔 Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold mb-2">
            {Math.round(result.score)}%
          </div>
          <p className="text-gray-600">
            Passing Score: {result.exam.passingScore}%
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        <Link href={`/exams/${result.examId}/analytics?attemptId=${attemptId}`}>
          <Button>View Detailed Analytics</Button>
        </Link>
      </div>
    </div>
  );
}
