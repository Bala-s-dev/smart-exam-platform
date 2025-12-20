/* app/topics/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  History,
  BarChart3,
  Users,
  ArrowLeft,
  Search,
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function ManageTopicsPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;

    fetch('/api/instructor/exams-history')
      .then((res) => {
        if (!res.ok) {
          // Log the status to help debug (e.g., 404 or 403)
          console.error(`API Error: ${res.status}`);
          throw new Error('Failed to fetch');
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch((err) => console.error('Fetch Error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Progress value={70} className="w-72 h-2 animate-pulse" />
        <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase">
          Syncing Exam Data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-2 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Exam History
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage assessments and view student performance.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by exam title..."
            className="w-full pl-10 h-10 rounded-xl bg-white border-2 border-gray-100 focus:border-primary text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg font-bold">
            Historical Performance Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                <tr>
                  <th className="p-6">Assessment Title</th>
                  <th className="p-6">Participation</th>
                  <th className="p-6">Avg Mark</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((exam) => (
                  <tr
                    key={exam.id}
                    className="hover:bg-gray-50/50 transition-colors group text-sm"
                  >
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="font-bold tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                          {exam.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" /> Created{' '}
                          {formatDate(exam.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-bold flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />{' '}
                      {exam.totalStudents} Students
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p
                          className={`text-xl font-black tabular-nums ${
                            exam.averageScore >= 60
                              ? 'text-emerald-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {exam.averageScore}%
                        </p>
                        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              exam.averageScore >= 60
                                ? 'bg-emerald-500'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${exam.averageScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <Link href={`/exams/${exam.id}/attempts`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-bold text-xs hover:text-primary"
                        >
                          Detailed Results{' '}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredHistory.length === 0 && (
            <div className="p-20 text-center italic text-muted-foreground">
              No exam history found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
