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
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/exams/${examId}`}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-12 w-12 border-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Instructor Insight
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
              Real-time student performance analytics
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section with improved Progress Bar and typography... */}

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white/50 px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold">
              Candidate Registry
            </CardTitle>
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 h-10 rounded-xl bg-muted/50 border-none group-focus-within:bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                <tr>
                  <th className="p-8">Student Candidate</th>
                  <th className="p-8">Performance Score</th>
                  <th className="p-8">Cognitive Weaknesses</th>
                  <th className="p-8 text-right">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAttempts.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight">
                          {attempt.user.name}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {attempt.user.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-2xl font-black tabular-nums ${
                            attempt.isPassed
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {Math.round(attempt.score)}%
                        </span>
                        <Badge
                          className={`border-none font-bold ${
                            attempt.isPassed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {attempt.isPassed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-8 max-w-xs">
                      {/* Redesigned Weakness Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {data?.examTopics.map((t) => (
                          <span
                            key={t}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border
                              ${
                                attempt.score < 50
                                  ? 'bg-red-50 text-red-700 border-red-100'
                                  : 'bg-orange-50 text-orange-700 border-orange-100'
                              }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-8 text-right font-medium text-muted-foreground tabular-nums">
                      {formatDate(attempt.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
