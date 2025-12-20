/* app/exams/[id]/page.tsx */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress'; // Added for loading state
import {
  Sparkles,
  Users,
  Clock,
  Target,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function ExamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false); // New success state
  const [examId, setExamId] = useState<string>('');

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
        body: JSON.stringify({
          topic: exam.topics[0]?.topic.name || 'General',
          count: 5,
          difficulty: 'MEDIUM',
        }),
      });

      if (res.ok) {
        setSuccess(true);
        // Delay reload so user can see the success message
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error('Failed to generate');
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
    }
  };

  if (!exam)
    return (
      <div className="max-w-4xl mx-auto py-20 space-y-4 flex flex-col items-center">
        <Progress value={40} className="w-64 h-2 animate-pulse" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Loading Exam Details...
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/exams"
        className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Library
      </Link>

      {/* SUCCESS MESSAGE BANNER */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="font-bold text-sm">
            Questions generated successfully! Refreshing exam content...
          </span>
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">{exam.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {exam.description}
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Badge variant="secondary" className="px-3 py-1 gap-2">
            <Clock className="h-4 w-4" /> {exam.durationMinutes} Minutes
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 gap-2">
            <Target className="h-4 w-4" /> Passing Score: {exam.passingScore}%
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Curriculum Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {exam.topics.map((t: any) => (
                <span
                  key={t.topicId}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wide border border-primary/20"
                >
                  {t.topic.name}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {user?.role === 'INSTRUCTOR' ? (
            <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Management Console
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleGenerateAI}
                  disabled={generating || success}
                  className="w-full bg-primary hover:bg-primary/90 font-bold gap-2 h-11 shadow-lg shadow-primary/20"
                >
                  <Sparkles className="h-4 w-4" />{' '}
                  {generating
                    ? 'Processing...'
                    : success
                    ? 'Completed'
                    : 'Auto-Gen Questions'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 font-bold h-11 gap-2"
                  onClick={() => router.push(`/exams/${examId}/attempts`)}
                >
                  <Users className="h-4 w-4" /> Student Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-xl shadow-emerald-500/5">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-bold">
                  Ready to Start?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-lg h-14 shadow-lg shadow-emerald-600/20"
                  onClick={handleStartExam}
                >
                  Launch Exam Environment
                </Button>
                <p className="text-[10px] text-center mt-4 uppercase font-bold tracking-widest text-emerald-700/60">
                  Timer starts immediately on click
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
