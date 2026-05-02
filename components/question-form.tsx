/* components/question-form.tsx */
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
import { CheckCircle2, Loader2, PlusCircle } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function QuestionForm({
  examId,
  onQuestionAdded,
}: {
  examId: string;
  onQuestionAdded: () => void;
}) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState('0');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some((o) => !o.trim())) {
      alert('Please fill in all four options.');
      return;
    }
    setLoading(true);
    try {
      const formattedOptions = options.map((text, idx) => ({
        text,
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
      setOptions(['', '', '', '']);
      setCorrectIndex('0');
      setSaved(true);
      onQuestionAdded();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Failed to save question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-base p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[16px]">Add a question</h3>
          <p className="text-muted-foreground text-[13px] mt-0.5">Manually author a multiple-choice question.</p>
        </div>
        {saved && (
          <span
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'oklch(0.94 0.06 155)', color: 'oklch(0.40 0.14 155)' }}
          >
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question text */}
        <div>
          <label className="field-label">Question text</label>
          <Textarea
            placeholder="Enter your question here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            disabled={loading}
            className="min-h-[90px] rounded-xl border-border text-[14px] resize-none"
          />
        </div>

        {/* Options grid */}
        <div>
          <label className="field-label">Answer options</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => (
              <div key={idx} className="relative">
                <div
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: correctIndex === String(idx) ? 'oklch(0.52 0.22 264)' : 'oklch(0.93 0.01 255)',
                    color: correctIndex === String(idx) ? 'white' : 'oklch(0.52 0.04 258)',
                  }}
                >
                  {OPTION_LABELS[idx]}
                </div>
                <Input
                  placeholder={`Option ${OPTION_LABELS[idx]}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[idx] = e.target.value;
                    setOptions(next);
                  }}
                  required
                  disabled={loading}
                  className="pl-11 h-11 rounded-xl border-border text-[14px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Correct answer */}
        <div>
          <label className="field-label">Correct answer</label>
          <Select value={correctIndex} onValueChange={setCorrectIndex} disabled={loading}>
            <SelectTrigger className="h-11 rounded-xl border-border text-[14px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPTION_LABELS.map((label, idx) => (
                <SelectItem key={idx} value={String(idx)}>
                  Option {label}{options[idx] ? ` — ${options[idx].slice(0, 40)}${options[idx].length > 40 ? '…' : ''}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-[14px] font-semibold rounded-xl gap-2"
          style={{ background: 'oklch(0.52 0.22 264)' }}
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Saving…</>
          ) : (
            <><PlusCircle size={15} /> Save question</>
          )}
        </Button>
      </form>
    </div>
  );
}
