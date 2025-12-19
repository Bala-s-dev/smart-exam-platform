'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export default function ExamsListPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setExams(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading exams...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {user?.role === 'INSTRUCTOR' ? 'My Created Exams' : 'Available Exams'}
        </h1>
        {user?.role === 'INSTRUCTOR' && (
          <Link href="/exams/create">
            <Button>+ Create New Exam</Button>
          </Link>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500 mb-4">No exams found.</p>
          {user?.role === 'INSTRUCTOR' && (
            <Link href="/exams/create">
              <Button variant="outline">Create your first exam</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Link
              href={`/exams/${exam.id}`}
              key={exam.id}
              className="block group"
            >
              <Card className="h-full card-hover bg-white/50 border-border/60">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                      {exam.title}
                    </CardTitle>
                    {exam.isPublished ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 font-bold uppercase text-[10px]">
                        Live
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="px-2 py-0.5 text-[10px] uppercase font-bold"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {exam.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {exam.topics.map((t: any) => (
                      <span
                        key={t.topicId}
                        className="px-2 py-0.5 bg-secondary rounded text-[11px] font-bold text-secondary-foreground uppercase"
                      >
                        {t.topic.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-muted">
                    <div className="flex gap-4 text-muted-foreground font-medium text-xs">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {exam.durationMinutes}
                        m
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />{' '}
                        {exam._count?.questions || 0} Qs
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="font-bold text-primary p-0 h-auto"
                    >
                      View &rarr;
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
