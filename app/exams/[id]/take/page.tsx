'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export default function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [exam, setExam] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: optionText }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Exam & Questions via the Attempt API (to ensure secure access)
  useEffect(() => {
    if (!attemptId) return;

    fetch(`/api/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        setExam(data.exam);
        setLoading(false);
      })
      .catch((err) => alert('Failed to load exam'));
  }, [attemptId]);

  const handleSelect = (value: string) => {
    const questionId = exam.questions[currentQIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Format answers for API
    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
      questionId: qId,
      selectedOption: val,
    }));

    const res = await fetch(`/api/attempts/${attemptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: formattedAnswers }),
    });

    if (res.ok) {
      router.push(`/exams/${exam.id}/results?attemptId=${attemptId}`);
    } else {
      alert('Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading your exam...</div>;

  const question = exam.questions[currentQIndex];
  const progress = ((currentQIndex + 1) / exam.questions.length) * 100;
  const isLastQuestion = currentQIndex === exam.questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header & Progress */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-end">
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <span className="text-sm text-gray-500">
            Question {currentQIndex + 1} of {exam.questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            onValueChange={handleSelect}
            value={answers[question.id] || ''}
            className="space-y-3"
          >
            {question.options.map((opt: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
              >
                <RadioGroupItem value={opt.text} id={`opt-${idx}`} />
                <Label
                  htmlFor={`opt-${idx}`}
                  className="flex-grow cursor-pointer font-normal"
                >
                  {opt.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQIndex === 0}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Finish & Submit'}
          </Button>
        ) : (
          <Button onClick={() => setCurrentQIndex((prev) => prev + 1)}>
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
