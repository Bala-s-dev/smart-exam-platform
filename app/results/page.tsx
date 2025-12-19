'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { BookOpen, TrendingUp, History, AlertCircle } from 'lucide-react';

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

  if (loading)
    return <div className="p-10 text-center">Loading your progress...</div>;

  if (data?.empty) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">No Exam History</h1>
        <p className="text-gray-500 mb-6">You haven't taken any exams yet.</p>
        <Link href="/exams">
          <Button>Browse Available Exams</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Learning Progress
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Data-driven evidence of your academic growth.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border text-center">
            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Mastery Rate
            </div>
            <div className="text-2xl font-black text-primary">
              {data.averageScore}%
            </div>
          </div>
        </div>
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
                  "Mastery in{' '}
                  <span className="text-orange-600 font-black">
                    {data.weakTopics[0].name}
                  </span>{' '}
                  is the next step to increasing your overall average. Consider
                  reviewing the AI feedback from your last attempt."
                </div>
              </>
            ) : (
              <div className="text-emerald-700 font-bold py-10 text-center">
                🏆 Maximum Proficiency Detected!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Similar styling for Overall Performance Card... */}
      </div>

      {/* Modernized Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="font-bold">Assessment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-y text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-5">Assessment</th>
                  <th className="p-5">Completion Date</th>
                  <th className="p-5">Performance</th>
                  <th className="p-5 text-right">Insights</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.history.map((item: any) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-5 font-bold text-md">{item.title}</td>
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
                          className={
                            item.isPassed
                              ? 'bg-emerald-100 text-emerald-700 border-none'
                              : 'bg-red-100 text-red-700 border-none'
                          }
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
