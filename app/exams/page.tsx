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
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1 text-lg group-hover:text-blue-600">
                      {exam.title}
                    </CardTitle>
                    {exam.isPublished ? (
                      <Badge variant="default" className="bg-green-600">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {exam.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exam.topics.map((t: any) => (
                      <Badge key={t.topicId} variant="outline">
                        {t.topic.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-auto">
                    <span>⏱ {exam.durationMinutes}m</span>
                    <span>Questions: {exam._count?.questions || 0}</span>
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
