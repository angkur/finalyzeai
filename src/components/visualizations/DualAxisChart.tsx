import { useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DualAxisChartProps {
  data: any[];
  config?: {
    xAxis?: string;
    leftAxis?: string;
    rightAxis?: string;
    title?: string;
  };
  zoom?: number;
}

const DualAxisChart = ({ data, config, zoom = 1 }: DualAxisChartProps) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const { chartData, leftKey, rightKey, xKey } = useMemo(() => {
    // Check if data has valid content (not just empty objects)
    const hasValidData = data && data.length > 0 && data.some(item => 
      item && typeof item === 'object' && Object.keys(item).length > 0 &&
      Object.values(item).some(v => typeof v === 'number' || typeof v === 'string')
    );

    if (!hasValidData) {
      // Generate sample dual-axis data
      const quarters = ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'];
      const sampleData = quarters.map((quarter, i) => ({
        quarter,
        Revenue: 2500000 + i * 300000 + Math.random() * 500000,
        GrowthRate: 15 + i * 2 + Math.random() * 5,
      }));
      return {
        chartData: sampleData,
        leftKey: 'Revenue',
        rightKey: 'GrowthRate',
        xKey: 'quarter',
      };
    }

    // Filter out empty objects
    const validData = data.filter(item => 
      item && typeof item === 'object' && Object.keys(item).length > 0
    );

    const keys = Object.keys(validData[0] || {});
    const numericKeys = keys.filter(k => typeof validData[0][k] === 'number');
    const stringKey = keys.find(k => typeof validData[0][k] === 'string') || keys[0];

    return {
      chartData: validData,
      leftKey: config?.leftAxis || numericKeys[0] || 'value1',
      rightKey: config?.rightAxis || numericKeys[1] || 'value2',
      xKey: config?.xAxis || stringKey,
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

  // Calculate domains
  const leftValues = chartData.map(d => d[leftKey]).filter(v => typeof v === 'number');
  const rightValues = chartData.map(d => d[rightKey]).filter(v => typeof v === 'number');

  const leftMax = Math.max(...leftValues) * 1.1;
  const rightMax = Math.max(...rightValues) * 1.1;

  return (
    <div className="w-full h-[400px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey={xKey}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
              return `$${value}`;
            }}
            domain={[0, leftMax]}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            domain={[0, rightMax]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === rightKey) return [`${value.toFixed(1)}%`, name];
              return [`$${value.toLocaleString()}`, name];
            }}
          />
          <Legend 
            onClick={handleLegendClick}
            formatter={(value) => (
              <span className={`text-sm ${hiddenSeries.has(value) ? 'line-through opacity-50' : ''}`}>
                {value}
              </span>
            )}
          />
          {!hiddenSeries.has(leftKey) && (
            <Bar 
              yAxisId="left"
              dataKey={leftKey}
              fill="hsl(200, 80%, 50%)"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              opacity={0.8}
            />
          )}
          {!hiddenSeries.has(rightKey) && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={rightKey}
              stroke="hsl(45, 90%, 55%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(45, 90%, 55%)', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 8, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              animationDuration={1000}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DualAxisChart;
