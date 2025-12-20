'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CreateExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); 

  const [formData, setFormData] = useState({
    title: '',
    syllabus: '', 
    topicName: '', 
    questionCount: 5,
    durationMinutes: '30',
    passingScore: '50',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Creating Exam Shell...');

    try {
      // 1. Create the Exam (and Topic)
      const createRes = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.syllabus, 
          customTopic: formData.topicName, 
          durationMinutes: parseInt(formData.durationMinutes),
          passingScore: parseInt(formData.passingScore),
        }),
      });

      if (!createRes.ok) throw new Error('Failed to create exam');
      const exam = await createRes.json();

      // 2. Generate Questions Immediately
      setStatus(`Generating ${formData.questionCount} Questions with AI...`);

      const genRes = await fetch(`/api/exams/${exam.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topicName,
          syllabus: formData.syllabus, 
          count: formData.questionCount,
          difficulty: 'MEDIUM',
        }),
      });

      if (!genRes.ok) throw new Error('Failed to generate questions');

      // 3. Redirect
      router.push(`/exams/${exam.id}`);
    } catch (error) {
      alert('Something went wrong. Please try again.');
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create & Generate Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam Title</label>
              <Input
                placeholder="e.g. Mid-Term Physics"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Custom Topic */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic / Subject</label>
              <Input
                placeholder="e.g. Quantum Mechanics"
                required
                value={formData.topicName}
                onChange={(e) =>
                  setFormData({ ...formData, topicName: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Type the specific subject area.
              </p>
            </div>

            {/* Syllabus */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Syllabus & Description
              </label>
              <Textarea
                placeholder="Paste the chapter summary, key concepts, or syllabus here. The AI will use this to write relevant questions."
                className="h-32"
                required
                value={formData.syllabus}
                onChange={(e) =>
                  setFormData({ ...formData, syllabus: e.target.value })
                }
              />
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Questions</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={formData.questionCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionCount: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Mins)</label>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Pass Score (%)</label>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> {status}
                </span>
              ) : (
                'Create Exam & Generate Questions'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
