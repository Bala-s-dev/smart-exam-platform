/* app/exams/[id]/page.tsx */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Users, Clock, Target, ArrowLeft, CheckCircle2, Loader2, BookOpen, Play } from 'lucide-react';
import Link from 'next/link';

export default function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [examId, setExamId] = useState<string>('');
  const [starting, setStarting] = useState(false);

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
    setSuccess(false);
    try {
      const res = await fetch(`/api/exams/${examId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: exam.topics[0]?.topic.name || 'General', count: 5, difficulty: 'MEDIUM' }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => window.location.reload(), 2000);
      } else throw new Error();
    } catch {
      alert('Error generating questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartExam = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId }),
      });
      if (res.ok) {
        const attempt = await res.json();
        router.push(`/exams/${examId}/take?attemptId=${attempt.id}`);
      }
    } catch {
      setStarting(false);
    }
  };

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[14px] font-medium">Loading exam…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7 anim-up">
      {/* Back */}
      <Link href="/exams" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={15} /> Back to library
      </Link>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-[14px] font-medium anim-up"
          style={{ background: 'oklch(0.94 0.06 155)', color: 'oklch(0.40 0.14 155)', border: '1px solid oklch(0.87 0.09 155)' }}
        >
          <CheckCircle2 size={17} />
          Questions generated successfully! Refreshing…
        </div>
      )}

      {/* Hero */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {exam.isPublished
            ? <span className="badge-live">Live</span>
            : <span className="badge-draft">Draft</span>
          }
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{exam.title}</h1>
        <p className="text-muted-foreground text-[16px] leading-relaxed max-w-2xl">
          {exam.description || 'No description provided.'}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary border border-border">
            <Clock size={14} /> {exam.durationMinutes} minutes
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary border border-border">
            <Target size={14} /> Pass: {exam.passingScore}%
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary border border-border">
            <BookOpen size={14} /> {exam._count?.questions ?? 0} questions
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Topics */}
        <div className="md:col-span-2 card-base p-6 space-y-4">
          <h2 className="font-semibold text-[16px]">Curriculum topics</h2>
          {exam.topics?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {exam.topics.map((t: any) => (
                <span
                  key={t.topicId}
                  className="px-3 py-1 rounded-full text-[13px] font-semibold"
                  style={{ background: 'oklch(0.93 0.04 262)', color: 'oklch(0.40 0.15 264)', border: '1px solid oklch(0.87 0.06 264)' }}
                >
                  {t.topic.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-[14px]">No topics assigned.</p>
          )}
        </div>

        {/* Action panel */}
        <div>
          {user?.role === 'INSTRUCTOR' ? (
            <div className="card-base p-5 space-y-3">
              <h2 className="font-semibold text-[15px]">Management</h2>
              <Button
                onClick={handleGenerateAI}
                disabled={generating || success}
                className="w-full h-10 text-[13px] font-semibold rounded-xl gap-2"
                style={{ background: 'oklch(0.52 0.22 264)' }}
              >
                {generating ? <><Loader2 size={14} className="animate-spin" /> Generating…</> :
                 success ? <><CheckCircle2 size={14} /> Generated!</> :
                 <><Sparkles size={14} /> Auto-generate questions</>}
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 text-[13px] font-semibold rounded-xl gap-2"
                onClick={() => router.push(`/exams/${examId}/attempts`)}
              >
                <Users size={14} /> View student results
              </Button>
            </div>
          ) : (
            <div className="card-base p-5 space-y-4">
              <div className="space-y-1">
                <h2 className="font-semibold text-[16px]">Ready to begin?</h2>
                <p className="text-[13px] text-muted-foreground">Timer starts immediately upon clicking.</p>
              </div>
              <Button
                size="lg"
                onClick={handleStartExam}
                disabled={starting}
                className="w-full h-12 text-[15px] font-semibold rounded-xl gap-2"
                style={{ background: 'oklch(0.50 0.14 155)', color: 'white' }}
              >
                {starting ? <><Loader2 size={16} className="animate-spin" /> Starting…</> :
                 <><Play size={16} /> Start exam</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
