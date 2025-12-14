import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

interface AreaTimeChartProps {
  data: any[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    valueKey?: string;
    title?: string;
  };
  zoom?: number;
}

const COLORS = [
  { stroke: 'hsl(200, 80%, 50%)', fill: 'hsl(200, 80%, 50%)' },
  { stroke: 'hsl(45, 90%, 55%)', fill: 'hsl(45, 90%, 55%)' },
  { stroke: 'hsl(160, 70%, 45%)', fill: 'hsl(160, 70%, 45%)' },
  { stroke: 'hsl(280, 60%, 55%)', fill: 'hsl(280, 60%, 55%)' },
];

const AreaTimeChart = ({ data, config, zoom = 1 }: AreaTimeChartProps) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const { chartData, seriesKeys } = useMemo(() => {
    // Check if data is empty or contains only empty objects
    const hasValidData = data && data.length > 0 && data.some(item => 
      Object.keys(item).length > 0 && Object.values(item).some(v => v !== null && v !== undefined)
    );
    
    if (!hasValidData) {
      // Generate sample time series data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sampleData = months.map((month, i) => ({
        month,
        Revenue: 2000000 + Math.random() * 1500000 + i * 100000,
        Expenses: 1200000 + Math.random() * 800000 + i * 50000,
        Profit: 600000 + Math.random() * 500000 + i * 30000,
      }));
      return {
        chartData: sampleData,
        seriesKeys: ['Revenue', 'Expenses', 'Profit'],
      };
    }

    // Find the x-axis key (usually a date/time/period string)
    const xKey = config?.xAxis || Object.keys(data[0]).find(k => 
      typeof data[0][k] === 'string' || k.toLowerCase().includes('date') || 
      k.toLowerCase().includes('month') || k.toLowerCase().includes('year')
    ) || 'month';
    
    const valueKey = config?.valueKey || 'value';
    const firstItem = data[0];
    
    // Get numeric keys for series
    let keys = Object.keys(firstItem).filter(
      k => k !== xKey && (typeof firstItem[k] === 'number' || !isNaN(parseFloat(firstItem[k])))
    );
    
    // If no numeric keys found but we have valueKey, use that
    if (keys.length === 0 && firstItem[valueKey] !== undefined) {
      keys = [valueKey];
    }

    // Convert string numbers to actual numbers
    const processedData = data.map(item => {
      const processed: any = { [xKey]: item[xKey] };
      keys.forEach(k => {
        processed[k] = typeof item[k] === 'number' ? item[k] : parseFloat(item[k]) || 0;
      });
      return processed;
    });

    return {
      chartData: processedData,
      seriesKeys: keys.length > 0 ? keys : ['value'],
    };
  }, [data, config]);

  const handleLegendClick = (entry: any) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(entry.dataKey)) {
      newHidden.delete(entry.dataKey);
    } else {
      newHidden.add(entry.dataKey);
    }
    setHiddenSeries(newHidden);
  };

  const xKey = config?.xAxis || Object.keys(chartData[0] || {}).find(
    k => typeof chartData[0][k] === 'string'
  ) || 'month';

  return (
    <div className="w-full h-[400px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            {seriesKeys.map((key, index) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[index % COLORS.length].fill} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS[index % COLORS.length].fill} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey={xKey}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
              return `$${value}`;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name,
            ]}
          />
          <Legend 
            onClick={handleLegendClick}
            formatter={(value) => (
              <span className={`text-sm ${hiddenSeries.has(value) ? 'line-through opacity-50' : ''}`}>
                {value}
              </span>
            )}
          />
          {seriesKeys.map((key, index) => (
            !hiddenSeries.has(key) && (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length].stroke}
                fill={`url(#gradient-${key})`}
                strokeWidth={2}
                animationDuration={1000}
                dot={{ fill: COLORS[index % COLORS.length].stroke, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            )
          ))}
          {chartData.length > 12 && (
            <Brush 
              dataKey={xKey}
              height={30}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--secondary))"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaTimeChart;
