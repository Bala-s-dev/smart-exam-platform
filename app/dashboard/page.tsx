/* app/dashboard/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsChart } from '@/components/analytics-chart';
import {
  BookOpen, Plus, Target, BarChart3, TrendingUp,
  Trophy, Clock, Loader2, ChevronRight, Users, ArrowRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [latestExam, setLatestExam] = useState<any>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const statsEndpoint = user.role === 'INSTRUCTOR' ? '/api/analytics/instructor' : '/api/analytics/student';
        const [statsRes, examRes] = await Promise.all([fetch(statsEndpoint), fetch('/api/exams')]);
        const [statsData, exams] = await Promise.all([statsRes.json(), examRes.json()]);
        setStats(statsData);
        if (Array.isArray(exams) && exams.length > 0) {
          const latest = exams[0];
          setLatestExam(latest);
          if (user.role === 'INSTRUCTOR') {
            const topRes = await fetch(`/api/exams/${latest.id}/top-performers`);
            const topData = await topRes.json();
            setTopPerformers(topData.performers || []);
          }
        }
      } catch (error) {
        console.error('Dashboard data sync failed:', error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (authLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'oklch(0.93 0.04 262)' }}>
            <Loader2 className="animate-spin" size={22} style={{ color: 'oklch(0.52 0.22 264)' }} />
          </div>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-[13px] font-semibold text-muted-foreground">Loading your workspace…</p>
          <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'oklch(0.93 0.01 255)' }}>
            <div className="h-full rounded-full shimmer" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto mt-20 p-6 text-center rounded-2xl border"
        style={{ background: 'oklch(0.96 0.05 25)', borderColor: 'oklch(0.88 0.08 25)', color: 'oklch(0.55 0.2 25)' }}
      >
        <p className="font-semibold">Access denied — please log in.</p>
      </div>
    );
  }

  const chartData = user.role === 'STUDENT' && stats?.history
    ? stats.history.map((h: any) => ({ name: h.examTitle, score: h.score })).reverse()
    : [];

  const statCards = [
    {
      label: user.role === 'INSTRUCTOR' ? 'Exams managed' : 'Exams completed',
      value: String(stats?.totalExams ?? stats?.totalAttempts ?? 0),
      icon: BookOpen,
      color: 'oklch(0.52 0.22 264)',
      bg: 'oklch(0.93 0.04 262)',
    },
    {
      label: 'Average score',
      value: `${stats?.avgScore ?? 0}%`,
      icon: BarChart3,
      color: 'oklch(0.55 0.2 300)',
      bg: 'oklch(0.94 0.04 300)',
    },
    {
      label: user.role === 'INSTRUCTOR' ? 'Class pass rate' : 'Focus area',
      value: user.role === 'INSTRUCTOR' ? '84%' : (stats?.weakTopics?.[0]?.name ?? 'N/A'),
      icon: Target,
      color: stats?.weakTopics?.[0] ? 'oklch(0.62 0.18 55)' : 'oklch(0.50 0.14 155)',
      bg: stats?.weakTopics?.[0] ? 'oklch(0.96 0.06 70)' : 'oklch(0.94 0.06 155)',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 anim-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-[15px] mt-0.5">
            Good to see you, <span className="font-semibold text-foreground">{user.name}</span>.
          </p>
        </div>
        {user.role === 'INSTRUCTOR' && (
          <Link href="/exams/create">
            <Button
              className="gap-2 h-10 px-5 text-[14px] font-semibold rounded-xl"
              style={{ background: 'oklch(0.52 0.22 264)' }}
            >
              <Plus size={16} />
              New exam
            </Button>
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 anim-up-1">
        {statCards.map((item, i) => (
          <div key={i} className="card-base p-5 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: item.bg }}
            >
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="text-[22px] font-bold tracking-tight truncate mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-5 gap-5 anim-up-2">
        {/* Left: chart or top performers */}
        <div className="md:col-span-3">
          {user.role === 'STUDENT' && chartData.length > 0 ? (
            <div className="card-base p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={17} style={{ color: 'oklch(0.52 0.22 264)' }} />
                <h2 className="font-semibold text-[16px]">Performance trend</h2>
              </div>
              <div className="h-[260px]">
                <AnalyticsChart data={chartData} />
              </div>
            </div>
          ) : user.role === 'INSTRUCTOR' && latestExam ? (
            <div className="card-base overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={16} style={{ color: 'oklch(0.7 0.15 70)' }} />
                  <div>
                    <h2 className="font-semibold text-[15px]">Top performers</h2>
                    <p className="text-[11px] text-muted-foreground">{latestExam.title}</p>
                  </div>
                </div>
                <Link href={`/exams/${latestExam.id}/attempts`}>
                  <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground gap-1 h-7 px-2">
                    View all <ChevronRight size={13} />
                  </Button>
                </Link>
              </div>
              <div>
                {topPerformers.length > 0 ? (
                  topPerformers.map((student, idx) => (
                    <div key={student.id} className="trow flex items-center justify-between px-6 py-3.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold w-4 tabular-nums text-muted-foreground">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                          style={{ background: idx === 0 ? 'oklch(0.7 0.15 70)' : 'oklch(0.75 0.04 258)' }}
                        >
                          {student.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold">{student.name}</p>
                          <p className="text-[11px] text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <span className="text-[18px] font-bold tabular-nums" style={{ color: 'oklch(0.52 0.22 264)' }}>
                        {student.score}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-muted-foreground text-[14px]">
                    No attempts recorded yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-base p-8 flex flex-col items-center justify-center h-full min-h-[240px] text-center gap-3">
              <BarChart3 size={32} className="text-muted-foreground opacity-40" />
              <p className="text-muted-foreground text-[14px]">Complete an exam to see your performance trend here.</p>
              <Link href="/exams">
                <Button size="sm" variant="outline" className="rounded-lg text-[13px] mt-1">Browse exams</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right: quick nav */}
        <div className="md:col-span-2 space-y-4">
          {/* Browse Library */}
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.93 0.04 262)' }}>
                <BookOpen size={15} style={{ color: 'oklch(0.52 0.22 264)' }} />
              </div>
              <h3 className="font-semibold text-[15px]">Exam library</h3>
            </div>
            {latestExam && (
              <div className="p-3.5 rounded-xl border border-border" style={{ background: 'oklch(0.97 0.005 255)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Latest exam</p>
                <p className="text-[13px] font-semibold truncate">{latestExam.title}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock size={10} /> {formatDate(latestExam.createdAt)}
                </p>
              </div>
            )}
            <Link href="/exams" className="block">
              <Button variant="outline" className="w-full h-9 text-[13px] font-semibold rounded-xl gap-1.5">
                View all exams <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {/* Reports / Topics */}
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.94 0.06 155)' }}>
                {user.role === 'STUDENT'
                  ? <TrendingUp size={15} style={{ color: 'oklch(0.50 0.14 155)' }} />
                  : <Users size={15} style={{ color: 'oklch(0.50 0.14 155)' }} />
                }
              </div>
              <h3 className="font-semibold text-[15px]">
                {user.role === 'STUDENT' ? 'My results' : 'Exam history'}
              </h3>
            </div>

            {user.role === 'STUDENT' && stats?.history?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {stats.history.slice(0, 2).map((attempt: any) => (
                  <div key={attempt.id} className="p-3 rounded-xl border border-border" style={{ background: 'oklch(0.97 0.005 255)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate mb-1">
                      {attempt.examTitle}
                    </p>
                    <p className={`text-[20px] font-bold tabular-nums ${attempt.score >= 50 ? 'score-pass' : 'score-fail'}`}>
                      {Math.round(attempt.score)}%
                    </p>
                  </div>
                ))}
              </div>
            ) : user.role === 'INSTRUCTOR' ? (
              <p className="text-[13px] text-muted-foreground">
                {stats?.totalExams ?? 0} active assessments published to students.
              </p>
            ) : (
              <p className="text-[13px] text-muted-foreground">Complete an exam to see your recent marks here.</p>
            )}

            <Link href={user.role === 'STUDENT' ? '/results' : '/topics'} className="block">
              <Button variant="outline" className="w-full h-9 text-[13px] font-semibold rounded-xl gap-1.5">
                {user.role === 'STUDENT' ? 'Full reports' : 'Manage history'}
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
