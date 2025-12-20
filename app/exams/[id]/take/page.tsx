'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AttemptTimer } from '@/components/attempt-timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Code2,
} from 'lucide-react';

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId) return;

    fetch(`/api/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        setExam(data.exam);
        setLoading(false);
      })
      .catch((err) => console.error('Failed to load exam'));
  }, [attemptId]);

  const handleSelect = (value: string) => {
    const questionId = exam.questions[currentQIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
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

  /**
   * Logic to format text: 
   * 1. Detects if code exists (semicolons or 'javascript' keyword).
   * 2. Splits by semicolon to create new lines.
   * 3. Separates the intro/outro text from the code block.
   */
  const renderFormattedQuestion = (text: string) => {
    if (!text.includes(';') && !text.toLowerCase().includes('javascript')) {
      return <span className="leading-relaxed">{text}</span>;
    }

    // Attempt to separate intro text (e.g., "Consider the following...") from code
    const parts = text.split(/(javascript|var|let|const|function)/i);
    const intro = parts[0];
    const codeAndOutro = text.substring(intro.length);

    // Find the last question mark to separate the code from the actual question
    const lastQuestionMark = codeAndOutro.lastIndexOf('?');
    const codePart = lastQuestionMark !== -1 
      ? codeAndOutro.substring(0, lastQuestionMark + 1).split(' ').slice(0, -5).join(' ') 
      : codeAndOutro;
    
    const outro = text.replace(intro, '').replace(codePart, '').trim();

    // Split code lines by semicolon
    const codeLines = codePart.replace(/javascript/i, '').split(';').map(l => l.trim()).filter(l => l.length > 0);

    return (
      <div className="space-y-4 w-full">
        {intro && <p className="text-slate-700 leading-relaxed font-normal">{intro.trim()}</p>}
        
        <div className="relative group">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <div className="bg-slate-950 text-slate-200 p-4 md:p-6 rounded-xl font-mono text-xs md:text-sm overflow-x-auto shadow-inner border border-slate-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-slate-500">
              <Code2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Source Snippet</span>
            </div>
            {codeLines.map((line, i) => (
              <div key={i} className="flex gap-4 group/line">
                <span className="text-slate-600 select-none w-4 text-right tabular-nums">{i + 1}</span>
                <span className="text-emerald-400">
                  {line}<span className="text-slate-500">;</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {outro && <p className="text-slate-900 font-bold leading-relaxed pt-2">{outro}</p>}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Securing session...
        </p>
      </div>
    );

  const question = exam.questions[currentQIndex];
  const progress = ((currentQIndex + 1) / exam.questions.length) * 100;
  const isLastQuestion = currentQIndex === exam.questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-4 md:py-10 px-3 md:px-6 space-y-4 md:space-y-6">
      <header className="sticky top-2 z-50 backdrop-blur-lg bg-white/80 border border-slate-200/60 shadow-sm rounded-2xl p-3 md:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-primary">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <h1 className="text-sm md:text-base font-bold tracking-tight truncate">
                {exam.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                Q {currentQIndex + 1} / {exam.questions.length}
              </span>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <AttemptTimer
            durationMinutes={exam.durationMinutes}
            onTimeUp={handleSubmit}
          />
        </div>
        <Progress value={progress} className="h-1 mt-3 bg-slate-100" />
      </header>

      <div
        key={currentQIndex}
        className="animate-in fade-in slide-in-from-right-4 duration-500"
      >
        <Card className="border-none shadow-sm md:shadow-md bg-white rounded-2xl md:rounded-3xl overflow-hidden">
          <CardHeader className="pt-6 pb-4 px-5 md:px-10">
            <CardTitle className="text-lg md:text-xl font-semibold leading-snug text-slate-800">
              {renderFormattedQuestion(question.text)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-10 pb-8">
            <RadioGroup
              onValueChange={handleSelect}
              value={answers[question.id] || ''}
              className="grid gap-2.5"
            >
              {question.options.map((opt: any, idx: number) => {
                const isSelected = answers[question.id] === opt.text;
                return (
                  <Label
                    key={idx}
                    htmlFor={`opt-${idx}`}
                    className={`
                      group relative flex items-center gap-3 p-4 md:p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${isSelected ? 'border-primary bg-primary/[0.02] ring-1 ring-primary/10' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                    `}
                  >
                    <RadioGroupItem value={opt.text} id={`opt-${idx}`} className="sr-only" />
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-sm md:text-base font-medium leading-snug pr-6 transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                      {opt.text}
                    </span>
                    {isSelected && <CheckCircle2 className="absolute right-4 w-4 h-4 md:w-5 md:h-5 text-primary animate-in zoom-in" />}
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <footer className="flex justify-between items-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="lg"
          className="rounded-xl font-bold text-slate-500 hover:bg-slate-100 px-4 md:px-8 h-11 md:h-12 transition-all active:scale-95"
          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQIndex === 0}
        >
          <ChevronLeft className="w-5 h-5 md:mr-2" />
          <span className="hidden md:inline">Previous</span>
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-8 md:px-12 h-11 md:h-12 shadow-lg transition-all active:scale-95"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Assessment'}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQIndex((prev) => prev + 1)}
            size="lg"
            className="rounded-xl font-bold px-8 md:px-12 h-11 md:h-12 shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            Next <ChevronRight className="w-5 h-5 md:ml-2" />
          </Button>
        )}
      </footer>
    </div>
  );
}