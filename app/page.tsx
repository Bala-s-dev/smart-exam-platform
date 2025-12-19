/* app/page.tsx */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, Brain, TrendingUp, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-5" />

        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest animate-bounce">
            <Zap className="h-3 w-3" /> Now Powered by Gemini 2.5
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-[1.1]">
            Elevate Learning with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Generative Intelligence
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The AI-powered ecosystem where instructors build complex assessments
            in seconds and students unlock their full potential with predictive
            data.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold rounded-xl shadow-xl shadow-primary/25 group"
              >
                Start Building Free{' '}
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-lg font-semibold rounded-xl border-2"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: 'Instant Generation',
              color: 'blue',
              desc: 'Type any topic. AI generates rigorous, balanced exams across any subject in under 10 seconds.',
            },
            {
              icon: Brain,
              title: 'Cognitive Insights',
              color: 'purple',
              desc: 'Move beyond grades. Analyze deep neural patterns in student responses to predict future outcomes.',
            },
            {
              icon: TrendingUp,
              title: 'Growth Analytics',
              color: 'green',
              desc: 'Interactive dashboards highlight specific knowledge gaps for both instructors and learners.',
            },
          ].map((feature, i) => (
            <Card key={i} className="card-hover border-border/50 bg-white/50">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4`}
                >
                  <feature.icon
                    className={`h-6 w-6 text-${feature.color}-600`}
                  />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="py-12 border-t mt-12 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm gap-4">
        <p>© 2025 SmartExam AI Platform. Empowering educators worldwide.</p>
        <div className="flex gap-6 font-medium">
          <Link href="#" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Help
          </Link>
        </div>
      </footer>
    </div>
  );
}
