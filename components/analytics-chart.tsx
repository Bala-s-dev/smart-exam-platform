'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AnalyticsChart({ data }: { data: any[] }) {
  // data format: [{ name: "Exam 1", score: 85 }, { name: "Exam 2", score: 60 }]

  if (!data || data.length === 0) {
    return (
      <Card className="w-full h-[350px] flex items-center justify-center text-gray-400">
        No data available to chart
      </Card>
    );
  }

  return (
    <Card className="w-full h-[350px]">
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
