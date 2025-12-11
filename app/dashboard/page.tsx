'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsChart } from '@/components/analytics-chart';

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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please log in.</div>;

  // Format history for the chart (Student only)
  const chartData =
    user.role === 'STUDENT' && stats?.history
      ? stats.history
          .map((h: any) => ({ name: h.examTitle, score: h.score }))
          .reverse()
      : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user.role === 'INSTRUCTOR' && (
          <Link href="/exams/create">
            <Button>+ Create New Exam</Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {user.role === 'INSTRUCTOR' ? 'Total Exams' : 'Tests Taken'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats?.totalExams || stats?.totalAttempts || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats?.avgScore || 0}%
          </CardContent>
        </Card>

        {user.role === 'STUDENT' && (
          <Card>
            <CardHeader>
              <CardTitle>Focus Topic</CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-red-600 font-medium">
              {stats?.weakTopics?.[0]?.name || 'N/A'}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chart Section - Only visible for Students with data */}
      {user.role === 'STUDENT' && (
        <div className="mt-6">
          <AnalyticsChart data={chartData} />
        </div>
      )}

      {/* Action Links */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          {user.role === 'INSTRUCTOR' ? 'Your Exams' : 'Available Actions'}
        </h2>
        <Link href="/exams">
          <Button variant="outline" className="w-full h-16 text-lg">
            View All Exams &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
}
