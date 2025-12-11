import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, Brain, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 1. SIMPLE HERO SECTION */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-white">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-gray-900">
          Smart Exams. <span className="text-blue-600">Real Results.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-10">
          The AI-powered platform where instructors generate tests in seconds
          and students get predictive analytics to improve their grades.
        </p>

        <div className="flex gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              Log In
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. THREE KEY FEATURES */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Instant Generation</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              Instructors just type a topic. AI builds the entire exam
              instantly.
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit mb-2">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI Prediction</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              We analyze your answers to predict your next score and fix weak
              spots.
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              Visual reports show exactly who attended and where the class is
              struggling.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. MINIMAL FOOTER */}
      <footer className="py-6 text-center text-gray-400 text-sm bg-white border-t">
        <p>© 2025 SmartExam AI Platform</p>
      </footer>
    </div>
  );
}
