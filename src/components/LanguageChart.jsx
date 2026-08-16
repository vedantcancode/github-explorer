import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function LanguageChart({ languages = {} }) {
  const totalBytes = Object.values(languages).reduce((sum, val) => sum + val, 0);

  if (totalBytes === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] border border-antigravity-border bg-antigravity-panel/50 rounded-2xl p-6">
        <p className="text-gray-400 text-sm">No language data available for this repository.</p>
      </div>
    );
  }

  // Transform languages into an array of { name, value, percentage }
  const dataList = Object.entries(languages).map(([name, bytes]) => {
    return {
      name,
      value: bytes,
      percentage: ((bytes / totalBytes) * 100).toFixed(1),
    };
  });

  // Sort by usage and limit to top 5, grouping the rest into "Others"
  const sortedData = dataList.sort((a, b) => b.value - a.value);
  let chartData = [];
  if (sortedData.length > 5) {
    chartData = sortedData.slice(0, 5);
    const otherBytes = sortedData.slice(5).reduce((sum, d) => sum + d.value, 0);
    chartData.push({
      name: 'Others',
      value: otherBytes,
      percentage: ((otherBytes / totalBytes) * 100).toFixed(1),
    });
  } else {
    chartData = sortedData;
  }

  // Premium neon color palette matching Antigravity UI
  const NEON_COLORS = [
    '#00f2fe', // Bright Cyan
    '#ff007f', // Deep Pink/Magenta
    '#a855f7', // Purple
    '#3b82f6', // Indigo/Blue
    '#10b981', // Emerald Green
    '#f59e0b', // Amber/Yellow
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c0f17] border border-[#1b2234] px-3 py-2 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-bold text-gray-200">{data.name}</p>
          <p className="text-gray-400">
            Bytes: <span className="text-gray-200 font-mono">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-[#00f2fe] font-semibold">{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-antigravity-border bg-antigravity-panel rounded-2xl p-5 flex flex-col justify-between h-[320px] transition-all duration-300 hover:border-gray-800">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800/50 pb-3">
        <h4 className="text-[14.5px] font-bold tracking-wide uppercase text-gray-400">
          Language Distribution
        </h4>
        <span className="text-xs text-gray-500 font-mono">
          {Object.keys(languages).length} Total
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-4">
        {/* Chart View */}
        <div className="md:col-span-3 h-[200px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} className="focus:outline-none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="md:col-span-2 space-y-2 flex flex-col justify-center max-h-[200px] overflow-y-auto pr-1">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: NEON_COLORS[index % NEON_COLORS.length] }}
                />
                <span className="text-gray-300 font-medium truncate">{entry.name}</span>
              </div>
              <span className="text-gray-400 font-mono ml-2 font-semibold">{entry.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
