'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export function QuestionForm({
  examId,
  onQuestionAdded,
}: {
  examId: string;
  onQuestionAdded: () => void;
}) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [correctIndex, setCorrectIndex] = useState('0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark the selected index as true
    const formattedOptions = options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx.toString() === correctIndex,
    }));

    await fetch(`/api/exams/${examId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        type: 'MCQ',
        difficulty: 'MEDIUM',
        options: formattedOptions,
      }),
    });

    setText('');
    setOptions(options.map((o) => ({ ...o, text: '' })));
    onQuestionAdded();
    alert('Question added!');
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h3 className="font-bold mb-4">Add Manual Question</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Enter question text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, idx) => (
              <Input
                key={idx}
                placeholder={`Option ${idx + 1}`}
                value={opt.text}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[idx].text = e.target.value;
                  setOptions(newOpts);
                }}
                required
              />
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Correct Answer:</label>
            <Select value={correctIndex} onValueChange={setCorrectIndex}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Option 1</SelectItem>
                <SelectItem value="1">Option 2</SelectItem>
                <SelectItem value="2">Option 3</SelectItem>
                <SelectItem value="3">Option 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="secondary" className="w-full">
            Save Question
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
