import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function CommitChart({ commitData = [] }) {
  // Gracefully handle minimal or empty commit data
  const hasCommits = commitData.length > 0 && commitData.some((w) => w.total > 0);

  if (!hasCommits) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] border border-antigravity-border bg-antigravity-panel/50 rounded-2xl p-6">
        <p className="text-gray-400 text-sm">No commit history data found or calculation is pending.</p>
        <p className="text-xs text-gray-500 mt-1">This can happen for very fresh repos or when the stats API is building cache.</p>
      </div>
    );
  }

  // Format Unix timestamps to dates
  const formattedData = commitData.map((d) => {
    const dateObj = new Date(d.week * 1000);
    return {
      ...d,
      formattedDate: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
      shortDate: dateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c0f17] border border-[#1b2234] px-3.5 py-2.5 rounded-lg shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-gray-400">{data.formattedDate}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f2fe]"></span>
            <span className="text-gray-200 font-bold font-mono text-[13px]">{data.total} commits</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-antigravity-border bg-antigravity-panel rounded-2xl p-5 flex flex-col justify-between h-[320px] transition-all duration-300 hover:border-gray-800">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800/50 pb-3">
        <h4 className="text-[14.5px] font-bold tracking-wide uppercase text-gray-400">
          Commit Activity & Trends
        </h4>
        <span className="text-xs text-gray-500">
          Last 52 Weeks
        </span>
      </div>

      <div className="flex-1 h-[210px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1b2234" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="shortDate"
              stroke="#4b5563"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#4b5563"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2d3a', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#00f2fe"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCommits)"
              dot={{ r: 0 }}
              activeDot={{ r: 5, stroke: '#05070a', strokeWidth: 1.5, fill: '#00f2fe' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
