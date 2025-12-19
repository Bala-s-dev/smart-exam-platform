'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Sparkles, BarChart, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Master Your Exams with{' '}
            <span className="text-blue-600">AI-Powered</span> Insights
          </h1>
          <p className="text-xl text-gray-600">
            Generate smart exams, track your performance, and get personalized
            feedback from Gemini AI to improve your scores.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            {loading ? (
              /* Prevent layout shift while checking auth */
              <Button size="lg" disabled className="px-8">
                Loading...
              </Button>
            ) : user ? (
              /* Show this if user is logged in */
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              /* Show this if user is logged out */
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="px-8 bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Sparkles className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Generation</h3>
            <p className="text-gray-500 text-sm">
              Automatically create challenging MCQs from your study topics using
              Google Gemini Pro.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <BarChart className="h-10 w-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Analytics</h3>
            <p className="text-gray-500 text-sm">
              Identify weak topics and receive score predictions based on your
              past performance.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <ShieldCheck className="h-10 w-10 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Testing</h3>
            <p className="text-gray-500 text-sm">
              Timed exam attempts with server-side grading and immediate,
              detailed feedback.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
