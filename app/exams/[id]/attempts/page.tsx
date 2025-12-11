'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ExamAttemptsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<{
    attempts: any[];
    examTopics: string[];
  } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examId, setExamId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    params.then((p) => {
      setExamId(p.id);

      // Fetch 1: Students & Topics
      fetch(`/api/exams/${p.id}/attempts`)
        .then((res) => res.json())
        .then((json) => {
          if (json.attempts) setData(json);
        });

      // Fetch 2: Class Stats
      fetch(`/api/exams/${p.id}/stats`)
        .then((res) => res.json())
        .then((json) => setStats(json))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="p-10 text-center">Loading Report...</div>;

  // Filter students based on search
  const filteredAttempts =
    data?.attempts.filter(
      (a) =>
        a.user.name.toLowerCase().includes(search.toLowerCase()) ||
        a.user.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/exams/${examId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Student Insight Report</h1>
        </div>
      </div>

      {/* 1. CLASS STATS (Keep existing dashboard) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className={
              stats.averageScore < 50
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Class Average
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.averageScore}%</div>
              <Progress
                value={stats.averageScore}
                className="h-2 mt-2 bg-white/50"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {stats.passRate}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Struggling With
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.weakTopics.length > 0 ? (
                  stats.weakTopics.map((t: string) => (
                    <span
                      key={t}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-bold"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-green-600 font-medium">
                    No major weak topics!
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. DETAILED STUDENT TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Individual Performance Analysis</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search student..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttempts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No matching records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    <th className="p-4 rounded-tl-lg">Student</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 w-1/3">Weak Areas / Lacking Topics</th>
                    <th className="p-4 rounded-tr-lg text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y">
                  {filteredAttempts.map((attempt) => {
                    const isLowScore = attempt.score < 75;
                    const isFail = !attempt.isPassed;

                    return (
                      <tr
                        key={attempt.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {attempt.user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {attempt.user.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className={`text-lg font-bold ${
                              isFail ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {Math.round(attempt.score)}%
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isFail
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {isFail ? 'Failed' : 'Passed'}
                          </span>
                        </td>

                        {/* NEW: Topic Weakness Column */}
                        <td className="p-4">
                          {isFail ? (
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-red-600 uppercase">
                                Critical Attention Needed:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {data?.examTopics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 text-xs rounded"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : isLowScore ? (
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-orange-600 uppercase">
                                Review Recommended:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {data?.examTopics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 text-xs rounded"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              None - Mastery shown
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right text-gray-500">
                          {formatDate(attempt.completedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
