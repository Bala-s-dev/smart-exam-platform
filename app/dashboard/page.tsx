/* app/dashboard/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsChart } from '@/components/analytics-chart';
import { BookOpen, Plus, Target, BarChart3, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const endpoint =
      user.role === 'INSTRUCTOR'
        ? '/api/analytics/instructor'
        : '/api/analytics/student';
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, [user]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 animate-pulse text-muted-foreground">
        Initializing Dashboard...
      </div>
    );
  if (!user)
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl text-red-600 font-bold border border-red-100">
        Access Denied. Please log in.
      </div>
    );

  const chartData =
    user.role === 'STUDENT' && stats?.history
      ? stats.history
          .map((h: any) => ({ name: h.examTitle, score: h.score }))
          .reverse()
      : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-muted-foreground">
            Here is what is happening with your exams today.
          </p>
        </div>
        {user.role === 'INSTRUCTOR' && (
          <Link href="/exams/create">
            <Button className="gap-2 shadow-lg shadow-primary/20 h-11 px-6 font-bold">
              <Plus className="h-5 w-5" /> Create New Exam
            </Button>
          </Link>
        )}
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label:
              user.role === 'INSTRUCTOR' ? 'Exams Created' : 'Exams Completed',
            value: stats?.totalExams || stats?.totalAttempts || 0,
            icon: BookOpen,
            color: 'text-blue-500',
          },
          {
            label: 'Average Score',
            value: `${stats?.avgScore || 0}%`,
            icon: BarChart3,
            color: 'text-purple-500',
          },
          {
            label:
              user.role === 'INSTRUCTOR'
                ? 'Student Passing Rate'
                : 'Primary Weakness',
            value:
              user.role === 'INSTRUCTOR'
                ? '84%'
                : stats?.weakTopics?.[0]?.name || 'N/A',
            icon: Target,
            color: stats?.weakTopics?.[0] ? 'text-red-500' : 'text-green-500',
          },
        ].map((item, i) => (
          <Card
            key={i}
            className="border-none shadow-sm bg-white/50 backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {user.role === 'STUDENT' && chartData.length > 0 && (
        <Card className="p-6 overflow-hidden">
          <CardHeader className="px-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Performance Trend
            </CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full mt-4">
            <AnalyticsChart data={chartData} />
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/exams" className="group">
          <Card className="p-8 border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-1">Browse All Exams</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View available test sessions and your history.
            </p>
            <Button variant="link" className="font-bold p-0">
              Go to Exams &rarr;
            </Button>
          </Card>
        </Link>

        {user.role === 'STUDENT' && (
          <Link href="/results" className="group">
            <Card className="p-8 border-2 border-dashed border-muted hover:border-indigo-500/50 hover:bg-indigo-50 transition-all text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold mb-1">Detailed Reports</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deep-dive into AI feedback and score predictions.
              </p>
              <Button variant="link" className="font-bold text-indigo-600 p-0">
                View Reports &rarr;
              </Button>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
