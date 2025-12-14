import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

interface PieBarChartProps {
  data: any[];
  config?: {
    labelKey?: string;
    valueKey?: string;
    title?: string;
  };
  zoom?: number;
  type: 'bar' | 'pie';
}

const COLORS = [
  'hsl(200, 80%, 50%)',
  'hsl(45, 90%, 55%)',
  'hsl(160, 70%, 45%)',
  'hsl(280, 60%, 55%)',
  'hsl(350, 75%, 55%)',
  'hsl(180, 65%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(120, 60%, 45%)',
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {`${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 18}
        fill={fill}
      />
    </g>
  );
};

const PieBarChart = ({ data, config, zoom = 1, type }: PieBarChartProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Sample data
      return [
        { name: 'Revenue', value: 4500000 },
        { name: 'Expenses', value: 2800000 },
        { name: 'Profit', value: 1700000 },
        { name: 'Investments', value: 900000 },
        { name: 'Savings', value: 600000 },
      ];
    }

    const labelKey = config?.labelKey || 'name';
    const valueKey = config?.valueKey || 'value';

    return data.map((item, idx) => ({
      name: item[labelKey] || item.name || item.label || `Item ${idx + 1}`,
      value: parseFloat(item[valueKey] || item.value || item.amount || 0),
      ...item,
    }));
  }, [data, config]);

  const filteredData = chartData.filter(item => !hiddenSeries.has(item.name));

  const handleLegendClick = (entry: any) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(entry.value)) {
      newHidden.delete(entry.value);
    } else {
      newHidden.add(entry.value);
    }
    setHiddenSeries(newHidden);
  };

  if (type === 'pie') {
    return (
      <div className="w-full h-[400px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              fill="hsl(var(--primary))"
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              paddingAngle={2}
            >
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Legend
              onClick={handleLegendClick}
              formatter={(value) => (
                <span className={`text-sm ${hiddenSeries.has(value) ? 'line-through opacity-50' : ''}`}>
                  {value}
                </span>
              )}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
          />
          <Legend onClick={handleLegendClick} />
          <Bar 
            dataKey="value" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieBarChart;
