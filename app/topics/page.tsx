/* app/topics/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Users, ChevronRight, Clock, BarChart3, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function ManageTopicsPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch('/api/instructor/exams-history')
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => { if (Array.isArray(data)) setHistory(data); })
      .catch((err) => console.error('Fetch Error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[14px] font-medium">Loading exam history…</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-10 anim-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground h-8 px-3">
              <ArrowLeft size={15} />
            </Button>
          </Link>
          <div className="w-px h-5 bg-border" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Exam history</h1>
            <p className="text-muted-foreground text-[14px]">
              Manage assessments and track student performance.
            </p>
          </div>
        </div>
        {/* Search */}
        <div className="relative w-[60%] ">
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 h-9 mr-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
          />
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 anim-up-1">
        {[
          {
            label: 'Total exams',
            value: history.length,
            icon: BarChart3,
            color: 'oklch(0.52 0.22 264)',
            bg: 'oklch(0.93 0.04 262)',
          },
          {
            label: 'Avg. class score',
            value:
              history.length > 0
                ? `${Math.round(history.reduce((a, e) => a + (e.averageScore || 0), 0) / history.length)}%`
                : 'N/A',
            icon: BarChart3,
            color: 'oklch(0.50 0.14 155)',
            bg: 'oklch(0.94 0.06 155)',
          },
          {
            label: 'Total students',
            value: history.reduce((a, e) => a + (e.totalStudents || 0), 0),
            icon: Users,
            color: 'oklch(0.55 0.2 300)',
            bg: 'oklch(0.94 0.04 300)',
          },
        ].map((s, i) => (
          <div key={i} className="card-base p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg }}
            >
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="text-[20px] font-bold tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden anim-up-2">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-[15px]">All assessments</h2>
          <span className="text-[12px] text-muted-foreground font-medium">
            {filteredHistory.length} result
            {filteredHistory.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'oklch(0.97 0.005 255)' }}>
                {['Assessment', 'Created', 'Students', 'Avg. score', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredHistory.map((exam) => (
                <tr key={exam.id} className="trow">
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-semibold">{exam.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium whitespace-nowrap">
                      <Clock size={11} /> {formatDate(exam.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[14px] font-semibold whitespace-nowrap">
                      <Users size={13} className="text-muted-foreground" />
                      {exam.totalStudents}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <span
                        className="text-[18px] font-bold tabular-nums"
                        style={{
                          color:
                            exam.averageScore >= 60
                              ? 'oklch(0.50 0.14 155)'
                              : 'oklch(0.62 0.18 55)',
                        }}
                      >
                        {exam.averageScore}%
                      </span>
                      <div
                        className="w-20 h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'oklch(0.93 0.01 255)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${exam.averageScore}%`,
                            background:
                              exam.averageScore >= 60
                                ? 'oklch(0.50 0.14 155)'
                                : 'oklch(0.62 0.18 55)',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/exams/${exam.id}/attempts`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[12px] font-semibold gap-1 h-7 px-3 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        View results <ChevronRight size={13} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-[14px]">
              {search
                ? `No exams matching "${search}".`
                : 'No exam history found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
