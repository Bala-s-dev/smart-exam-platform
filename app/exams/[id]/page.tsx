'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Note: Next.js 16 Client Component params unwrapping
export default function ExamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [examId, setExamId] = useState<string>('');

  // Unwarp params
  useEffect(() => {
    params.then((p) => {
      setExamId(p.id);
      fetch(`/api/exams/${p.id}`)
        .then((res) => res.json())
        .then((data) => setExam(data));
    });
  }, [params]);

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/exams/${examId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Use the first topic name for generation
        body: JSON.stringify({
          topic: exam.topics[0]?.topic.name || 'General',
          count: 5,
          difficulty: 'MEDIUM',
        }),
      });
      if (res.ok) {
        alert('Questions Generated!');
        window.location.reload();
      }
    } catch (e) {
      alert('Error generating questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartExam = async () => {
    const res = await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId }),
    });

    if (res.ok) {
      const attempt = await res.json();
      router.push(`/exams/${examId}/take?attemptId=${attempt.id}`);
    } else {
      alert('Failed to start exam');
    }
  };

  if (!exam) return <div className="p-8">Loading Exam...</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{exam.title}</h1>
        <p className="text-gray-600">{exam.description}</p>
        <div className="mt-2 flex gap-4 text-sm text-gray-500">
          <span>⏱ {exam.durationMinutes} mins</span>
          <span>🎯 Pass: {exam.passingScore}%</span>
        </div>
      </div>

      {user?.role === 'INSTRUCTOR' ? (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-semibold mb-2">Instructor Actions</h3>
          {/* ... existing generation button ... */}

          <div className="flex gap-4 mt-4">
            <Button onClick={handleGenerateAI} disabled={generating}>
              {generating ? 'Generating...' : '✨ Generate Questions'}
            </Button>

            {/* NEW BUTTON */}
            <Button
              variant="secondary"
              onClick={() => router.push(`/exams/${examId}/attempts`)}
            >
              View Student Results 👥
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center">
          <h3 className="font-semibold mb-2">Ready to take this test?</h3>
          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={handleStartExam}
          >
            Start Exam Now
          </Button>
        </div>
      )}
    </div>
  );
}
