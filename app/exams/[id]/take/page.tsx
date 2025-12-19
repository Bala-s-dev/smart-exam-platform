'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AttemptTimer } from '@/components/attempt-timer';
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
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-4 rounded-2xl border bg-white/80 sticky top-4 z-50">
        <div className="space-y-1">
          <h1 className="text-lg font-bold tracking-tight line-clamp-1">
            {exam.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Question {currentQIndex + 1} / {exam.questions.length}
            </span>
          </div>
        </div>
        <AttemptTimer
          durationMinutes={exam.durationMinutes}
          onTimeUp={handleSubmit}
        />
      </div>

      <Progress
        value={progress}
        className="h-2 rounded-full bg-secondary overflow-hidden shadow-inner"
      />

      <Card className="border-none shadow-2xl bg-white p-2 sm:p-6 overflow-hidden">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl font-bold leading-snug">
            {question.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            onValueChange={handleSelect}
            value={answers[question.id] || ''}
            className="grid gap-4"
          >
            {question.options.map((opt: any, idx: number) => (
              <Label
                key={idx}
                htmlFor={`opt-${idx}`}
                className={`
                flex items-center gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer group
                ${
                  answers[question.id] === opt.text
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-muted hover:border-primary/30 hover:bg-muted/30'
                }
              `}
              >
                <RadioGroupItem
                  value={opt.text}
                  id={`opt-${idx}`}
                  className="sr-only"
                />
                <div
                  className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                  ${
                    answers[question.id] === opt.text
                      ? 'border-primary bg-primary'
                      : 'border-muted group-hover:border-primary/50'
                  }
                `}
                >
                  {answers[question.id] === opt.text && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-lg font-medium leading-tight">
                  {opt.text}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          className="font-bold text-muted-foreground px-6"
          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQIndex === 0}
        >
          &larr; Previous
        </Button>
        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold px-10 h-12 shadow-xl shadow-emerald-600/20"
          >
            {submitting ? 'Encrypting Answers...' : 'Submit Final Assessment'}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQIndex((prev) => prev + 1)}
            className="font-bold px-10 h-12 shadow-lg shadow-primary/20"
          >
            Continue &rarr;
          </Button>
        )}
      </div>
    </div>
  );
}
