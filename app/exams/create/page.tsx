/* app/exams/create/page.tsx */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, Zap } from 'lucide-react';

export default function CreateExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    syllabus: '',
    topicName: '',
    questionCount: 5,
    durationMinutes: '30',
    passingScore: '50',
  });

  const set = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Creating exam structure…');
    try {
      const createRes = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.syllabus,
          customTopic: formData.topicName,
          durationMinutes: parseInt(formData.durationMinutes),
          passingScore: parseInt(formData.passingScore),
        }),
      });
      if (!createRes.ok) throw new Error('Failed to create exam');
      const exam = await createRes.json();

      setStatus(`Generating ${formData.questionCount} questions with AI…`);
      const genRes = await fetch(`/api/exams/${exam.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: formData.topicName, syllabus: formData.syllabus, count: formData.questionCount, difficulty: 'MEDIUM' }),
      });
      if (!genRes.ok) throw new Error('Failed to generate questions');
      router.push(`/exams/${exam.id}`);
    } catch (error) {
      alert('Something went wrong. Please try again.');
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      {/* Header */}
      <div className="anim-up">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.93 0.04 262)' }}>
            <Sparkles size={18} style={{ color: 'oklch(0.52 0.22 264)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create new exam</h1>
            <p className="text-muted-foreground text-[14px]">AI will generate questions from your syllabus</p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="card-base p-7 anim-up-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="field-label">Exam title</label>
            <Input
              placeholder="e.g. Mid-Term Physics — Wave Mechanics"
              required
              disabled={loading}
              value={formData.title}
              onChange={(e) => set('title', e.target.value)}
              className="h-11 rounded-xl border-border text-[14px]"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="field-label">Topic / subject</label>
            <Input
              placeholder="e.g. Quantum Mechanics"
              required
              disabled={loading}
              value={formData.topicName}
              onChange={(e) => set('topicName', e.target.value)}
              className="h-11 rounded-xl border-border text-[14px]"
            />
            <p className="text-[12px] text-muted-foreground mt-1.5">The specific subject area the AI will focus on.</p>
          </div>

          {/* Syllabus */}
          <div>
            <label className="field-label">Syllabus & description</label>
            <Textarea
              placeholder="Paste your chapter summary, key concepts, or curriculum outline here. The more detail you provide, the better the questions."
              className="min-h-[120px] rounded-xl border-border text-[14px] resize-none"
              required
              disabled={loading}
              value={formData.syllabus}
              onChange={(e) => set('syllabus', e.target.value)}
            />
          </div>

          {/* Settings row */}
          <div>
            <label className="field-label mb-3">Exam configuration</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1.5">Questions</p>
                <Input
                  type="number" min={1} max={20} required disabled={loading}
                  value={formData.questionCount}
                  onChange={(e) => set('questionCount', parseInt(e.target.value))}
                  className="h-10 rounded-xl border-border text-[14px] text-center"
                />
              </div>
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1.5">Duration (min)</p>
                <Input
                  type="number" required disabled={loading}
                  value={formData.durationMinutes}
                  onChange={(e) => set('durationMinutes', e.target.value)}
                  className="h-10 rounded-xl border-border text-[14px] text-center"
                />
              </div>
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1.5">Pass score (%)</p>
                <Input
                  type="number" required disabled={loading}
                  value={formData.passingScore}
                  onChange={(e) => set('passingScore', e.target.value)}
                  className="h-10 rounded-xl border-border text-[14px] text-center"
                />
              </div>
            </div>
          </div>

          {/* AI info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'oklch(0.93 0.04 262)', border: '1px solid oklch(0.87 0.06 264)' }}>
            <Zap size={16} style={{ color: 'oklch(0.52 0.22 264)' }} className="shrink-0 mt-0.5" />
            <p className="text-[13px]" style={{ color: 'oklch(0.35 0.12 264)' }}>
              <strong>Gemini 2.5 Flash</strong> will generate {formData.questionCount} multiple-choice questions based on your topic and syllabus. This typically takes 10–20 seconds.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-[15px] font-semibold rounded-xl gap-2"
            style={{ background: 'oklch(0.52 0.22 264)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {status}
              </span>
            ) : (
              <>
                <Sparkles size={16} />
                Generate exam with AI
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
