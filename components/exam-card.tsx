/* components/exam-card.tsx */
import Link from 'next/link';
import { Clock, BookOpen } from 'lucide-react';

interface ExamCardProps {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  questionCount?: number;
  topics?: { topic: { name: string } }[];
  isPublished?: boolean;
}

export function ExamCard({
  id,
  title,
  description,
  durationMinutes,
  questionCount = 0,
  topics = [],
  isPublished,
}: ExamCardProps) {
  return (
    <Link href={`/exams/${id}`} className="block group">
      <div className="card-base card-hover h-full p-5 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
            {title}
          </h3>
          {isPublished != null && (
            isPublished
              ? <span className="badge-live shrink-0">Live</span>
              : <span className="badge-draft shrink-0">Draft</span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 flex-1">
            {description}
          </p>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topics.slice(0, 3).map((t) => (
              <span
                key={t.topic.name}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: 'oklch(0.93 0.04 262)', color: 'oklch(0.40 0.15 264)' }}
              >
                {t.topic.name}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-muted-foreground bg-secondary">
                +{topics.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-[12px] text-muted-foreground font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {durationMinutes}m
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={11} /> {questionCount}q
            </span>
          </div>
          <span
            className="text-[12px] font-semibold transition-transform group-hover:translate-x-0.5"
            style={{ color: 'oklch(0.52 0.22 264)' }}
          >
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
