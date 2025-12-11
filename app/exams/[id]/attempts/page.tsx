'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function ExamAttemptsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      fetch(`/api/exams/${p.id}/attempts`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAttempts(data);
          setLoading(false);
        });
    });
  }, [params]);

  if (loading)
    return <div className="p-10 text-center">Loading student list...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Student Results</h1>

      <Card>
        <CardHeader>
          <CardTitle>Who Attended ({attempts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-gray-500">
              No students have taken this exam yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 font-medium">Student Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Date Taken</th>
                    <th className="p-3 font-medium">Score</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{attempt.user.name}</td>
                      <td className="p-3 text-sm text-gray-500">
                        {attempt.user.email}
                      </td>
                      <td className="p-3 text-sm">
                        {attempt.completedAt
                          ? formatDate(attempt.completedAt)
                          : '-'}
                      </td>
                      <td className="p-3 font-bold">
                        {Math.round(attempt.score)}%
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            attempt.isPassed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
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
