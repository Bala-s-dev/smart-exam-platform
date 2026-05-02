/* components/analytics-chart.tsx */
'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts';

interface AnalyticsChartProps {
  data: { name: string; score: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    return (
      <div
        className="px-3 py-2.5 rounded-xl shadow-lg text-[13px]"
        style={{
          background: 'white',
          border: '1px solid oklch(0.91 0.012 255)',
          boxShadow: '0 4px 16px oklch(0.14 0.025 260 / 0.10)',
        }}
      >
        <p className="text-muted-foreground text-[11px] font-medium truncate max-w-[140px] mb-1">{label}</p>
        <p className="font-bold text-[16px]" style={{ color: score >= 50 ? 'oklch(0.50 0.14 155)' : 'oklch(0.55 0.2 25)' }}>
          {score}%
        </p>
      </div>
    );
  }
  return null;
};

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[14px]">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.52 0.22 264)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="oklch(0.52 0.22 264)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="0"
          stroke="oklch(0.93 0.01 255)"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'oklch(0.53 0.04 258)', fontFamily: 'DM Sans, sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: 'oklch(0.53 0.04 258)', fontFamily: 'DM Sans, sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <ReferenceLine
          y={50}
          stroke="oklch(0.62 0.18 55)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: 'Pass', fill: 'oklch(0.62 0.18 55)', fontSize: 10, fontWeight: 600 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'oklch(0.52 0.22 264)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="oklch(0.52 0.22 264)"
          strokeWidth={2.5}
          fill="url(#scoreGradient)"
          dot={{ fill: 'oklch(0.52 0.22 264)', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: 'oklch(0.52 0.22 264)', stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
