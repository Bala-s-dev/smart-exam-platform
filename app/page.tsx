/* app/page.tsx */
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowRight,
  Zap,
  Brain,
  BarChart3,
  CheckCircle,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant AI Generation',
    desc: 'Paste a syllabus and watch Gemini build a complete, balanced assessment in under 10 seconds.',
    color: 'oklch(0.52 0.22 264)',
    bg: 'oklch(0.93 0.04 262)',
  },
  {
    icon: Brain,
    title: 'Cognitive Analytics',
    desc: 'Move beyond grades. Identify knowledge gaps at a granular level with deep response analysis.',
    color: 'oklch(0.55 0.2 300)',
    bg: 'oklch(0.94 0.04 300)',
  },
  {
    icon: BarChart3,
    title: 'Predictive Insights',
    desc: 'AI coaches students with personalized feedback and predicted performance scores.',
    color: 'oklch(0.50 0.14 155)',
    bg: 'oklch(0.94 0.06 155)',
  },
];

const stats = [
  { value: '10s', label: 'Avg. exam generation time' },
  { value: '99%', label: 'Uptime reliability' },
  { value: '50+', label: 'Subjects supported' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="absolute inset-0 dot-pattern opacity-50 -z-10" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] -z-10 rounded-full blur-[120px] opacity-10"
          style={{ background: 'oklch(0.52 0.22 264)' }}
        />

        <div className="text-center space-y-7 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide anim-up"
            style={{
              borderColor: 'oklch(0.52 0.22 264 / 0.25)',
              color: 'oklch(0.52 0.22 264)',
              background: 'oklch(0.93 0.04 262)',
            }}
          >
            <Sparkles size={12} />
            Powered by Gemini 2.5 Flash
          </div>

          <h1 className="anim-up-1 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-balance">
            The smartest way to{' '}
            <span className="gradient-text">assess & learn</span>
          </h1>

          <p className="anim-up-2 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            SmartExam AI gives instructors instant AI-generated assessments and
            gives students predictive coaching — all in one platform.
          </p>

          {/* CTA — changes based on auth state */}
          <div className="anim-up-3 flex flex-col sm:flex-row justify-center gap-3 pt-2">
            {!loading && user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 px-8 text-[15px] font-semibold rounded-xl gap-2 group"
                  style={{ background: 'oklch(0.52 0.22 264)' }}
                >
                  <LayoutDashboard size={16} />
                  Go to dashboard
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Button>
              </Link>
            ) : !loading ? (
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-[15px] font-semibold rounded-xl gap-2 group"
                    style={{ background: 'oklch(0.52 0.22 264)' }}
                  >
                    Start for free
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-[15px] font-medium rounded-xl border-border"
                  >
                    Sign in
                  </Button>
                </Link>
              </>
            ) : (
              <div className="h-12 w-48 rounded-xl shimmer" />
            )}
          </div>

          {!loading && !user && (
            <div className="anim-up-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
              {[
                'No credit card required',
                'Free tier available',
                'GDPR compliant',
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle
                    size={13}
                    style={{ color: 'oklch(0.50 0.14 155)' }}
                  />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border">
        <div className="grid grid-cols-3 divide-x divide-border max-w-2xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-6">
              <div className="text-3xl font-bold tracking-tight gradient-text">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="text-center mb-14 space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'oklch(0.52 0.22 264)' }}
          >
            Platform capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for educators & learners
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every feature is designed to reduce busywork and surface the
            insights that actually matter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="card-base card-hover p-7 space-y-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: f.bg }}
              >
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold tracking-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band — only when logged out */}
      {!loading && !user && (
        <section className="py-16">
          <div
            className="rounded-2xl p-10 md:p-14 text-center space-y-6 relative overflow-hidden"
            style={{ background: 'oklch(0.52 0.22 264)' }}
          >
            <div className="absolute inset-0 dot-pattern opacity-10" />
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight relative z-10">
              Ready to transform your classroom?
            </h2>
            <p className="text-white/75 max-w-lg mx-auto leading-relaxed relative z-10">
              Join educators worldwide using SmartExam AI to build better
              assessments.
            </p>
            <div className="relative z-10">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white font-semibold rounded-xl text-[15px] gap-2 group"
                  style={{ color: 'oklch(0.52 0.22 264)' }}
                >
                  Create free account
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-muted-foreground">
        <p>© 2025 SmartExam AI Platform. All rights reserved.</p>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Help'].map((l) => (
            <Link
              key={l}
              href="#"
              className="hover:text-foreground transition-colors font-medium"
            >
              {l}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
