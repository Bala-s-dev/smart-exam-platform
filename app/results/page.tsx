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
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">My Learning Progress</h1>

      {/* 1. RECOMMENDATION ENGINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A: Focus Areas */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-800">
              Priority Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.weakTopics.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Based on your past exams, you should review these topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.weakTopics.map((t: any) => (
                    <Badge
                      key={t.name}
                      variant="destructive"
                      className="text-sm py-1 px-3"
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
                <div className="bg-white p-3 rounded border border-orange-100 mt-2">
                  <h4 className="font-semibold text-xs text-gray-500 uppercase mb-1">
                    Recommendation
                  </h4>
                  <p className="text-sm font-medium text-gray-800">
                    Try finding study materials or asking your instructor for
                    more practice questions on
                    <span className="font-bold text-orange-600">
                      {' '}
                      {data.weakTopics[0].name}
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-green-700 font-medium">
                Great job! You are showing consistent performance across all
                topics.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card B: Overall Stats */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end border-b border-blue-200 pb-2">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className="text-3xl font-bold text-blue-700">
                {data.averageScore}%
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-600">Exams Completed</span>
              <span className="text-2xl font-bold text-gray-800">
                {data.totalAttempts}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. EXAM HISTORY TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          <CardTitle>Exam History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm uppercase text-gray-500">
                <tr>
                  <th className="p-3">Exam Title</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.history.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.title}</td>
                    <td className="p-3 text-gray-500">
                      {formatDate(item.date)}
                    </td>
                    <td
                      className={`p-3 font-bold ${
                        item.score >= 50 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.score}%
                    </td>
                    <td className="p-3">
                      {item.isPassed ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Passed
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-800 hover:bg-red-100"
                        >
                          Failed
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/exams/${item.examId}/analytics?attemptId=${item.id}`}
                      >
                        <Button variant="outline" size="sm">
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
