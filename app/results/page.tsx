/* app/results/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { TrendingUp, AlertCircle, Award, Loader2, ChevronRight, BarChart3, BookOpen } from 'lucide-react';

export default function StudentResultsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/results')
      .then((res) => res.json())
      .then((json) => { setData(json); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[14px] font-medium">Loading results…</span>
      </div>
    );
  }

  if (data?.empty) {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'oklch(0.93 0.01 255)' }}>
          <BookOpen size={22} className="text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">No history yet</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Complete your first exam to unlock analytics.</p>
        </div>
        <Link href="/exams">
          <Button className="rounded-xl" style={{ background: 'oklch(0.52 0.22 264)' }}>Browse exams</Button>
        </Link>
      </div>
    );
  }

  const recentThree = data.history.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-7 anim-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Learning progress</h1>
          <p className="text-muted-foreground text-[15px] mt-0.5">Your complete assessment history and analytics.</p>
        </div>
        <div className="card-base px-5 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mastery rate</p>
          <p className="text-[28px] font-bold gradient-text">{data.averageScore}%</p>
        </div>
      </div>

      {/* Recent 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 anim-up-1">
        {recentThree.map((exam: any, i: number) => (
          <div key={exam.id} className="card-base p-5 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-[3px]"
              style={{ background: exam.isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}
            />
            <div className="flex items-start justify-between mt-1">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Session {i + 1}
                </p>
                <p className="text-[14px] font-semibold truncate">{exam.title}</p>
              </div>
              <span
                className="text-[24px] font-bold tabular-nums ml-3"
                style={{ color: exam.isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}
              >
                {exam.score}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 anim-up-2">
        {/* Focus areas */}
        <div className="card-base p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.96 0.06 70)' }}>
              <AlertCircle size={16} style={{ color: 'oklch(0.62 0.18 55)' }} />
            </div>
            <h2 className="font-semibold text-[16px]">Focus areas</h2>
          </div>
          {data.weakTopics.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {data.weakTopics.map((t: any) => (
                  <span
                    key={t.name}
                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: 'oklch(0.96 0.06 70)', color: 'oklch(0.50 0.18 55)', border: '1px solid oklch(0.88 0.1 70)' }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
              <div className="p-4 rounded-xl text-[13px] italic leading-relaxed"
                style={{ background: 'oklch(0.97 0.003 255)', border: '1px solid oklch(0.91 0.01 255)', color: 'oklch(0.35 0.03 258)' }}
              >
                A focused review of <strong style={{ color: 'oklch(0.62 0.18 55)' }}>{data.weakTopics[0].name}</strong> is recommended before your next attempt.
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <Award size={28} style={{ color: 'oklch(0.50 0.14 155)' }} className="mx-auto" />
              <p className="font-semibold text-[15px]">Maximum proficiency!</p>
              <p className="text-muted-foreground text-[13px]">No weak areas detected.</p>
            </div>
          )}
        </div>

        {/* Session overview */}
        <div className="card-base p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.93 0.04 262)' }}>
              <BarChart3 size={16} style={{ color: 'oklch(0.52 0.22 264)' }} />
            </div>
            <h2 className="font-semibold text-[16px]">Session overview</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total assessments', value: data.totalAttempts },
              { label: 'Average score', value: `${data.averageScore}%` },
              { label: 'Latest score', value: `${data.history[0]?.score ?? 0}%` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-[14px] text-muted-foreground font-medium">{item.label}</span>
                <span className="text-[18px] font-bold tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="card-base overflow-hidden anim-up-3">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp size={16} className="text-muted-foreground" />
          <h2 className="font-semibold text-[15px]">Assessment registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'oklch(0.97 0.005 255)' }}>
                {['Assessment', 'Date', 'Score', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.history.map((item: any) => (
                <tr key={item.id} className="trow">
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-semibold">{item.title}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted-foreground font-medium whitespace-nowrap">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[18px] font-bold tabular-nums"
                        style={{ color: item.isPassed ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}
                      >
                        {item.score}%
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{
                          background: item.isPassed ? 'oklch(0.94 0.06 155)' : 'oklch(0.96 0.05 25)',
                          color: item.isPassed ? 'oklch(0.40 0.14 155)' : 'oklch(0.55 0.2 25)',
                        }}
                      >
                        {item.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/exams/${item.examId}/analytics?attemptId=${item.id}`}>
                      <Button variant="ghost" size="sm" className="text-[12px] font-semibold gap-1 text-muted-foreground hover:text-foreground h-7 px-3 rounded-lg">
                        Report <ChevronRight size={13} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
