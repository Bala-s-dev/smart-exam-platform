/* app/results/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { TrendingUp, History, AlertCircle, Award } from 'lucide-react';

export default function StudentResultsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/results')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 space-y-4 flex flex-col items-center">
        <p className="text-muted-foreground font-medium animate-pulse">
          Analyzing Progress...
        </p>
        <Progress value={60} className="w-64 h-2 animate-bounce" />
      </div>
    );
  }

  if (data?.empty) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto text-muted-foreground text-2xl">
          ?
        </div>
        <h1 className="text-3xl font-bold">No History Found</h1>
        <p className="text-muted-foreground">
          Complete your first exam to unlock predictive analytics.
        </p>
        <Link href="/exams">
          <Button size="lg" className="font-bold">
            Browse Exams
          </Button>
        </Link>
      </div>
    );
  }

  // FEATURE: Last 3 Exam Data
  const recentThree = data.history.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Learning Progress
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Visualizing your path to mastery.
          </p>
        </div>
        <Card className="px-6 py-3 border-none shadow-sm bg-primary text-primary-foreground text-center">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
            Mastery Rate
          </p>
          <p className="text-3xl font-black">{data.averageScore}%</p>
        </Card>
      </div>

      {/* FEATURE: Last 3 Exam Marks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recentThree.map((exam: any, i: number) => (
          <Card
            key={exam.id}
            className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-sm relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div
              className={`absolute top-0 left-0 w-1.5 h-full ${
                exam.isPassed ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Recent Session {i + 1}
                </p>
                <p className="text-sm font-bold truncate max-w-[140px]">
                  {exam.title}
                </p>
              </div>
              <div
                className={`text-2xl font-black tabular-nums ${
                  exam.isPassed ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {exam.score}%
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-bold">Focus Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.weakTopics.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {data.weakTopics.map((t: any) => (
                    <Badge
                      key={t.name}
                      className="bg-orange-600 font-bold uppercase tracking-wider px-3 py-1"
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
                <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm italic text-sm text-gray-700 leading-relaxed">
                  "Based on your results in{' '}
                  <span className="text-orange-600 font-black">
                    {data.weakTopics[0].name}
                  </span>
                  , a focused review of these concepts is recommended before
                  your next attempt."
                </div>
              </>
            ) : (
              <div className="text-emerald-700 font-bold py-10 text-center flex flex-col items-center gap-2">
                <Award className="h-10 w-10" /> 🏆 Maximum Proficiency Detected!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold">
              Session Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Total Assessments
              </span>
              <span className="text-2xl font-black">{data.totalAttempts}</span>
            </div>
            <div className="flex justify-between items-end border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Latest Score
              </span>
              <span className="text-2xl font-black">
                {data.history[0]?.score}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white/40">
        <CardHeader className="bg-white/60 border-b">
          <CardTitle className="font-bold">Assessment Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-y text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-5">Assessment Title</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Score</th>
                  <th className="p-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.history.map((item: any) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-5 font-bold">{item.title}</td>
                    <td className="p-5 text-muted-foreground font-medium">
                      {formatDate(item.date)}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xl font-black tabular-nums ${
                            item.isPassed ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {item.score}%
                        </span>
                        <Badge
                          className={`border-none ${
                            item.isPassed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.isPassed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <Link
                        href={`/exams/${item.examId}/analytics?attemptId=${item.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold border-2 hover:bg-white group-hover:border-primary"
                        >
                          View Report
                        </Button>
                      </Link>
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
