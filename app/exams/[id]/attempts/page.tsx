'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Users, TrendingUp, AlertTriangle } from 'lucide-react'; // Ensure you install lucide-react
import Link from 'next/link';

export default function ExamAttemptsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examId, setExamId] = useState('');

  useEffect(() => {
    params.then((p) => {
      setExamId(p.id);

      // Fetch 1: List of Students
      fetch(`/api/exams/${p.id}/attempts`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAttempts(data);
        });

      // Fetch 2: Class Statistics (Average & Weak Topics)
      fetch(`/api/exams/${p.id}/stats`)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading)
    return <div className="p-10 text-center">Loading class performance...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/exams/${examId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Class Performance Report</h1>
      </div>

      {/* 1. CLASS INSIGHTS DASHBOARD */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Average Marks */}
          <Card
            className={
              stats.averageScore < 50
                ? 'border-red-500 bg-red-50'
                : 'bg-blue-50 border-blue-200'
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Class Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.averageScore}%</div>
              <Progress
                value={stats.averageScore}
                className="h-2 mt-3 bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                Based on {stats.totalAttempts} student submissions
              </p>
            </CardContent>
          </Card>

          {/* Card B: Pass Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {stats.passRate}%
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Students who scored above passing marks
              </p>
            </CardContent>
          </Card>

          {/* Card C: Weak Topics Analysis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Topic Analysis
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {stats.weakTopics.length > 0 ? (
                <div>
                  <div className="text-lg font-bold text-red-600 mb-1">
                    Needs Improvement
                  </div>
                  <p className="text-sm text-gray-600">
                    Students are struggling with:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stats.weakTopics.map((t: string) => (
                      <span
                        key={t}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold text-green-600 mb-1">
                    Strong Understanding
                  </div>
                  <p className="text-sm text-gray-600">
                    Class performance is good across all covered topics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. STUDENT LIST TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No students have taken this exam yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="p-3 font-medium rounded-tl-lg">
                      Student Name
                    </th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Date Taken</th>
                    <th className="p-3 font-medium">Score</th>
                    <th className="p-3 font-medium rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 font-medium">{attempt.user.name}</td>
                      <td className="p-3 text-sm text-gray-500">
                        {attempt.user.email}
                      </td>
                      <td className="p-3 text-sm">
                        {attempt.completedAt
                          ? formatDate(attempt.completedAt)
                          : '-'}
                      </td>
                      <td className="p-3 font-bold">
                        <span
                          className={
                            attempt.score >= 50
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {Math.round(attempt.score)}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            attempt.isPassed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {attempt.isPassed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
