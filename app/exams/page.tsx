/* app/exams/page.tsx */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Plus, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ExamsListPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setExams(data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[14px] font-medium">Loading exams…</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 anim-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {user?.role === 'INSTRUCTOR' ? 'My exams' : 'Exam library'}
          </h1>
          <p className="text-muted-foreground text-[15px] mt-0.5">
            {user?.role === 'INSTRUCTOR'
              ? 'Manage and monitor all your created assessments.'
              : 'Browse and take available assessments.'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams…"
              className="input-base pl-9 text-[13px] h-9 w-full sm:w-56"
            />
          </div>
          {user?.role === 'INSTRUCTOR' && (
            <Link href="/exams/create">
              <Button
                className="gap-1.5 h-9 px-4 text-[13px] font-semibold rounded-xl shrink-0"
                style={{ background: 'oklch(0.52 0.22 264)' }}
              >
                <Plus size={15} /> New exam
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center border border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'oklch(0.93 0.01 255)' }}>
            <BookOpen size={22} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-[16px]">{search ? 'No matching exams' : 'No exams yet'}</p>
            <p className="text-muted-foreground text-[14px] mt-1">
              {search ? 'Try adjusting your search query.' : user?.role === 'INSTRUCTOR' ? 'Create your first exam to get started.' : 'Check back later for available assessments.'}
            </p>
          </div>
          {!search && user?.role === 'INSTRUCTOR' && (
            <Link href="/exams/create">
              <Button className="rounded-xl text-[13px]" style={{ background: 'oklch(0.52 0.22 264)' }}>
                Create your first exam
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 anim-up-1">
          {filtered.map((exam) => (
            <Link href={`/exams/${exam.id}`} key={exam.id} className="block group">
              <div className="card-base card-hover p-5 h-full flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1" style={{ '--tw-text-opacity': 1 } as any}>
                    {exam.title}
                  </h3>
                  {exam.isPublished
                    ? <span className="badge-live shrink-0">Live</span>
                    : <span className="badge-draft shrink-0">Draft</span>
                  }
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 flex-1">
                  {exam.description || 'No description provided.'}
                </p>

                {/* Topics */}
                {exam.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {exam.topics.slice(0, 3).map((t: any) => (
                      <span
                        key={t.topicId}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide"
                        style={{ background: 'oklch(0.93 0.04 262)', color: 'oklch(0.40 0.15 264)' }}
                      >
                        {t.topic.name}
                      </span>
                    ))}
                    {exam.topics.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-muted-foreground bg-secondary">
                        +{exam.topics.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border text-[12px] text-muted-foreground font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {exam.durationMinutes}m
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> {exam._count?.questions ?? 0}q
                    </span>
                  </div>
                  <span className="font-semibold text-[12px]" style={{ color: 'oklch(0.52 0.22 264)' }}>
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
