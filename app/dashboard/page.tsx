'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsChart } from '@/components/analytics-chart';
import {
  BookOpen,
  Plus,
  Target,
  BarChart3,
  TrendingUp,
  Trophy,
  Clock,
  Loader2,
  ChevronRight,
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
        // 1. Fetch Class/Student Stats based on Role
        const statsEndpoint =
          user.role === 'INSTRUCTOR'
            ? '/api/analytics/instructor'
            : '/api/analytics/student';
        const statsRes = await fetch(statsEndpoint);
        const statsData = await statsRes.json();
        setStats(statsData);

        // 2. Fetch Exams list for the Latest Release shortcut
        const examRes = await fetch('/api/exams');
        const exams = await examRes.json();

        if (Array.isArray(exams) && exams.length > 0) {
          const latest = exams[0];
          setLatestExam(latest);

          // 3. Fetch Top 5 Performers (Instructor Only)
          if (user.role === 'INSTRUCTOR') {
            const topRes = await fetch(
              `/api/exams/${latest.id}/top-performers`
            );
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

  // Loading state with Progress bar
  if (authLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Progress value={45} className="w-72 h-2 animate-pulse" />
        <div className="flex items-center gap-2 text-muted-foreground font-bold tracking-widest text-xs uppercase">
          <Loader2 className="h-4 w-4 animate-spin" /> Initializing Workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-red-50 rounded-xl text-red-600 font-bold border border-red-100">
        Access Denied. Please log in to view your dashboard.
      </div>
    );
  }

  const chartData =
    user.role === 'STUDENT' && stats?.history
      ? stats.history
          .map((h: any) => ({ name: h.examTitle, score: h.score }))
          .reverse()
      : [];

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground font-medium">
            Welcome back, {user.name}. Here is your current overview.
          </p>
        </div>
        {user.role === 'INSTRUCTOR' && (
          <Link href="/exams/create">
            <Button className="gap-2 shadow-lg shadow-primary/20 h-11 px-6 font-bold transition-all hover:translate-y-[-1px]">
              <Plus className="h-5 w-5" /> Create New Exam
            </Button>
          </Link>
        )}
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label:
              user.role === 'INSTRUCTOR' ? 'Exams Managed' : 'Exams Completed',
            value: stats?.totalExams || stats?.totalAttempts || 0,
            icon: BookOpen,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Average Score',
            value: `${stats?.avgScore || 0}%`,
            icon: BarChart3,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label:
              user.role === 'INSTRUCTOR' ? 'Class Pass Rate' : 'Primary Focus',
            value:
              user.role === 'INSTRUCTOR'
                ? '84%'
                : stats?.weakTopics?.[0]?.name || 'N/A',
            icon: Target,
            color: stats?.weakTopics?.[0]
              ? 'text-orange-600'
              : 'text-emerald-600',
            bg: stats?.weakTopics?.[0] ? 'bg-orange-50' : 'bg-emerald-50',
          },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  {item.label}
                </p>
                <div className="text-2xl font-black tracking-tight">
                  {item.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructor Feature: Top Performing Students */}
      {user.role === 'INSTRUCTOR' && latestExam && (
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-gray-50/50 flex flex-row items-center justify-between py-4 px-6">
            <div className="space-y-1">
              <CardTitle className="text-md font-bold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> Top Performers
              </CardTitle>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                Latest: {latestExam.title}
              </p>
            </div>
            <Link href={`/exams/${latestExam.id}/attempts`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-primary px-0 hover:bg-transparent"
              >
                Full Report <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {topPerformers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {topPerformers.map((student, idx) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 px-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-[10px] font-black w-5 ${
                          idx === 0 ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold leading-none mb-1">
                          {student.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-primary">
                        {student.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                No attempts recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Feature: Performance Trend Chart */}
      {user.role === 'STUDENT' && chartData.length > 0 && (
        <Card className="p-6 border-none shadow-sm bg-white">
          <CardHeader className="px-0 pb-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" /> Performance
              Over Time
            </CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full">
            <AnalyticsChart data={chartData} />
          </div>
        </Card>
      )}

      {/* Simple & Clean Navigation Cards */}
      <div className="grid md:grid-cols-2 gap-6 pb-10">
        {/* Browse Library Card */}
        <Card className="border-none shadow-md overflow-hidden bg-white group hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" /> Browse Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Explore all available assessments and your personal exam history.
            </p>
            {latestExam && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                    Newest Exam
                  </p>
                  <p className="text-sm font-bold line-clamp-1">
                    {latestExam.title}
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground font-bold flex flex-col items-end">
                  <Clock className="h-3 w-3 mb-1" />{' '}
                  {formatDate(latestExam.createdAt)}
                </div>
              </div>
            )}
            <Link href="/exams" className="block">
              <Button className="w-full font-bold h-11 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-none">
                Open Exam Library
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Detailed Reports Card (Student) or Quick Stats (Instructor) */}
        <Card className="border-none shadow-md overflow-hidden bg-white group hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              {user.role === 'STUDENT' ? 'Detailed Reports' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {user.role === 'STUDENT'
                ? 'Review AI-driven insights, topic weaknesses, and predictive analytics.'
                : 'Manage your topics and review overall platform performance data.'}
            </p>

            {/* FEATURE: Last 2 Marks for Students */}
            {user.role === 'STUDENT' && stats?.history?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {stats.history.slice(0, 2).map((attempt: any) => (
                  <div
                    key={attempt.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter truncate mb-1">
                      {attempt.examTitle}
                    </p>
                    <p
                      className={`text-xl font-black ${
                        attempt.score >= 50
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {Math.round(attempt.score)}%
                    </p>
                  </div>
                ))}
              </div>
            ) : user.role === 'INSTRUCTOR' ? (
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 italic text-xs text-indigo-700 font-medium">
                "You have {stats?.totalExams || 0} active assessments currently
                published to students."
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-xs text-gray-500">
                Complete an exam to see your recent marks here.
              </div>
            )}

            <Link
              href={user.role === 'STUDENT' ? '/results' : '/topics'}
              className="block"
            >
              <Button
                className={`w-full font-bold h-11 border-2 shadow-none
                ${
                  user.role === 'STUDENT'
                    ? 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                    : 'bg-white border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {user.role === 'STUDENT'
                  ? 'View Full Reports'
                  : 'Manage Topics'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
