'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CreateExamPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: '30',
    passingScore: '50',
    topicIds: [] as string[],
    isPublished: true,
  });

  // Fetch topics for dropdown
  useEffect(() => {
    fetch('/api/topics')
      .then((res) => res.json())
      .then((data) => setTopics(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure at least one topic is selected
    if (formData.topicIds.length === 0 && topics.length > 0) {
      alert('Please select a topic');
      return;
    }

    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        durationMinutes: parseInt(formData.durationMinutes),
        passingScore: parseInt(formData.passingScore),
      }),
    });

    if (res.ok) {
      const exam = await res.json();
      // Redirect to the exam details page to generate questions
      router.push(`/exams/${exam.id}`);
    } else {
      alert('Failed to create exam');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Exam Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Duration (Minutes)
                </label>
                <Input
                  type="number"
                  required
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Passing Score (%)</label>
                <Input
                  type="number"
                  required
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({ ...formData, passingScore: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Topic</label>
              <Select
                onValueChange={(val) =>
                  setFormData({ ...formData, topicIds: [val] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Create Draft
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
