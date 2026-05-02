/* app/exams/[id]/take/page.tsx */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AttemptTimer } from '@/components/attempt-timer';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, ShieldCheck, CheckCircle2, Loader2, Code2, AlertTriangle } from 'lucide-react';

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
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
      .then((data) => { setExam(data.exam); setLoading(false); })
      .catch((err) => console.error('Failed to load exam', err));
  }, [attemptId]);

  const handleSelect = (value: string) => {
    const questionId = exam.questions[currentQIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({ questionId: qId, selectedOption: val }));
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

  const renderFormattedQuestion = (text: string) => {
    if (!text.includes(';') && !text.toLowerCase().includes('javascript')) {
      return <span className="leading-relaxed">{text}</span>;
    }
    const parts = text.split(/(javascript|var|let|const|function)/i);
    const intro = parts[0];
    const codeAndOutro = text.substring(intro.length);
    const lastQuestionMark = codeAndOutro.lastIndexOf('?');
    const codePart = lastQuestionMark !== -1
      ? codeAndOutro.substring(0, lastQuestionMark + 1).split(' ').slice(0, -5).join(' ')
      : codeAndOutro;
    const outro = text.replace(intro, '').replace(codePart, '').trim();
    const codeLines = codePart.replace(/javascript/i, '').split(';').map(l => l.trim()).filter(l => l.length > 0);
    return (
      <div className="space-y-4 w-full">
        {intro && <p className="text-foreground leading-relaxed font-normal">{intro.trim()}</p>}
        <div className="rounded-xl overflow-hidden border" style={{ background: 'oklch(0.13 0.02 260)', borderColor: 'oklch(0.22 0.03 258)' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: 'oklch(0.22 0.03 258)' }}>
            <Code2 size={13} style={{ color: 'oklch(0.52 0.04 258)' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.52 0.04 258)' }}>Source snippet</span>
          </div>
          <div className="p-4 font-mono text-[13px] overflow-x-auto">
            {codeLines.map((line, i) => (
              <div key={i} className="flex gap-4">
                <span className="select-none w-5 text-right tabular-nums shrink-0" style={{ color: 'oklch(0.40 0.03 258)' }}>{i + 1}</span>
                <span style={{ color: 'oklch(0.75 0.12 155)' }}>{line}<span style={{ color: 'oklch(0.40 0.03 258)' }}>;</span></span>
              </div>
            ))}
          </div>
        </div>
        {outro && <p className="text-foreground font-semibold leading-relaxed">{outro}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={26} className="animate-spin" style={{ color: 'oklch(0.52 0.22 264)' }} />
        <p className="text-[14px] font-medium text-muted-foreground">Securing exam session…</p>
      </div>
    );
  }

  const question = exam.questions[currentQIndex];
  const progress = ((currentQIndex + 1) / exam.questions.length) * 100;
  const isLastQuestion = currentQIndex === exam.questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-8 space-y-4">
      {/* Sticky header */}
      <header className="sticky top-[60px] z-40 card-base px-4 md:px-6 py-3.5 mb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck size={16} style={{ color: 'oklch(0.52 0.22 264)' }} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold truncate">{exam.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: 'oklch(0.93 0.04 262)', color: 'oklch(0.40 0.15 264)' }}>
                  Q{currentQIndex + 1} / {exam.questions.length}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {answeredCount} answered
                </span>
              </div>
            </div>
          </div>
          <AttemptTimer durationMinutes={exam.durationMinutes} onTimeUp={handleSubmit} />
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.93 0.01 255)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'oklch(0.52 0.22 264)' }}
          />
        </div>
      </header>

      {/* Question card */}
      <div key={currentQIndex} className="animate-in fade-in slide-in-from-right-3 duration-300">
        <div className="card-base p-6 md:p-8 space-y-6">
          {/* Question text */}
          <div className="text-[16px] md:text-[17px] font-medium leading-relaxed text-foreground">
            {renderFormattedQuestion(question.text)}
          </div>

          {/* Options */}
          <RadioGroup onValueChange={handleSelect} value={answers[question.id] || ''} className="space-y-2.5">
            {question.options.map((opt: any, idx: number) => {
              const isSelected = answers[question.id] === opt.text;
              const labels = ['A', 'B', 'C', 'D'];
              return (
                <Label
                  key={idx}
                  htmlFor={`opt-${idx}`}
                  className="group relative flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: isSelected ? 'oklch(0.52 0.22 264)' : 'oklch(0.91 0.012 255)',
                    background: isSelected ? 'oklch(0.93 0.04 262)' : 'white',
                  }}
                >
                  <RadioGroupItem value={opt.text} id={`opt-${idx}`} className="sr-only" />
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 transition-all"
                    style={{
                      background: isSelected ? 'oklch(0.52 0.22 264)' : 'oklch(0.95 0.01 255)',
                      color: isSelected ? 'white' : 'oklch(0.52 0.04 258)',
                    }}
                  >
                    {isSelected ? <CheckCircle2 size={14} /> : labels[idx]}
                  </div>
                  <span className="text-[14px] md:text-[15px] leading-relaxed font-medium pt-0.5 flex-1" style={{ color: isSelected ? 'oklch(0.30 0.12 264)' : 'oklch(0.35 0.03 258)' }}>
                    {opt.text}
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQIndex === 0}
          className="gap-1.5 rounded-xl h-10 px-5 text-[14px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Question dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center flex-1 max-w-xs">
          {exam.questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQIndex(i)}
              className="w-6 h-6 rounded-md text-[10px] font-bold transition-all"
              style={{
                background: i === currentQIndex
                  ? 'oklch(0.52 0.22 264)'
                  : answers[exam.questions[i].id]
                  ? 'oklch(0.50 0.14 155)'
                  : 'oklch(0.93 0.01 255)',
                color: i === currentQIndex || answers[exam.questions[i].id] ? 'white' : 'oklch(0.52 0.04 258)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-1.5 rounded-xl h-10 px-5 text-[14px] font-semibold"
            style={{ background: 'oklch(0.50 0.14 155)', color: 'white' }}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Submit'}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQIndex((prev) => prev + 1)}
            className="gap-1.5 rounded-xl h-10 px-5 text-[14px] font-semibold"
            style={{ background: 'oklch(0.52 0.22 264)' }}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {/* Unanswered warning */}
      {isLastQuestion && Object.keys(answers).length < exam.questions.length && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl text-[13px] font-medium anim-up"
          style={{ background: 'oklch(0.96 0.06 70)', color: 'oklch(0.50 0.14 70)', border: '1px solid oklch(0.88 0.1 70)' }}
        >
          <AlertTriangle size={15} className="shrink-0" />
          You have {exam.questions.length - Object.keys(answers).length} unanswered question(s).
        </div>
      )}
    </div>
  );
}
