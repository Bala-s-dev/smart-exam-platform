/* app/exams/[id]/attempts/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Search, Users, Loader2, CheckCircle2, XCircle, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ExamAttemptsPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<{ attempts: any[]; examTopics: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [examId, setExamId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    params.then((p) => {
      setExamId(p.id);
      Promise.all([
        fetch(`/api/exams/${p.id}/attempts`).then((r) => r.json()),
        fetch(`/api/exams/${p.id}/stats`).then((r) => r.json()),
      ]).then(([attemptsJson]) => {
        if (attemptsJson.attempts) setData(attemptsJson);
        setLoading(false);
      });
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[14px] font-medium">Loading report…</span>
      </div>
    );
  }

  const filteredAttempts = data?.attempts.filter((a) =>
    a.user.name.toLowerCase().includes(search.toLowerCase()) ||
    a.user.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const passCount = filteredAttempts.filter((a) => a.isPassed).length;
  const avgScore = filteredAttempts.length > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + a.score, 0) / filteredAttempts.length)
    : 0;
  const passRate = filteredAttempts.length ? Math.round((passCount / filteredAttempts.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-7 anim-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/exams/${examId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Exam Attempts</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 anim-up-1">
        {[
          { label: 'Total attempts', value: filteredAttempts.length, icon: Users, color: 'oklch(0.52 0.22 264)', bg: 'oklch(0.93 0.04 262)' },
          { label: 'Pass rate', value: filteredAttempts.length ? `${passRate}%` : '—', icon: TrendingUp, color: 'oklch(0.50 0.14 155)', bg: 'oklch(0.94 0.06 155)' },
          { label: 'Average score', value: `${avgScore}%`, icon: BarChart3, color: 'oklch(0.55 0.2 300)', bg: 'oklch(0.94 0.04 300)' },
          { label: 'Passed', value: passCount, icon: CheckCircle2, color: 'oklch(0.50 0.14 155)', bg: 'oklch(0.94 0.06 155)' },
        ].map((item) => (
          <div key={item.label} className="card-base p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.bg }}>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="text-[20px] font-bold tabular-nums">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="card-base anim-up-2">
        <div className="flex items-center justify-between mb-5 p-3">
          <h2 className="text-lg font-semibold tracking-tight pl-3">Attempt details</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 h-9 mr-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {filteredAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: 'oklch(0.97 0.005 255)' }}>
                  {['Student', 'Score', 'Topics', 'Completed'].map((h) => (
                    <th key={h} className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="trow">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                          style={{ background: attempt.isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}
                        >
                          {attempt.user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold">{attempt.user.name}</p>
                          <p className="text-[11px] text-muted-foreground">{attempt.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[18px] font-bold tabular-nums"
                          style={{ color: attempt.isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}
                        >
                          {Math.round(attempt.score)}%
                        </span>
                        <div className="flex items-center gap-1" style={{ color: attempt.isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}>
                          {attempt.isPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span className="text-[11px] font-semibold">{attempt.isPassed ? 'Pass' : 'Fail'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {data?.examTopics.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                            style={{
                              background: attempt.score < 50 ? 'oklch(0.96 0.05 25)' : 'oklch(0.93 0.04 262)',
                              color: attempt.score < 50 ? 'oklch(0.55 0.2 25)' : 'oklch(0.40 0.15 264)',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-muted-foreground font-medium whitespace-nowrap">
                      {formatDate(attempt.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Users size={28} className="text-muted-foreground opacity-40" />
            <p className="font-medium text-muted-foreground text-[14px]">
              {search ? 'No students match your search.' : 'No attempts recorded yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
