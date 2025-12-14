import { useState, useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TreemapChartProps {
  data: any[];
  config?: {
    nameKey?: string;
    valueKey?: string;
    childrenKey?: string;
    title?: string;
  };
  zoom?: number;
}

const COLORS = [
  'hsl(200, 80%, 45%)',
  'hsl(45, 90%, 50%)',
  'hsl(160, 70%, 40%)',
  'hsl(280, 60%, 50%)',
  'hsl(350, 75%, 50%)',
  'hsl(180, 65%, 40%)',
  'hsl(30, 80%, 50%)',
  'hsl(120, 60%, 40%)',
];

interface TreemapNode {
  name: string;
  size?: number;
  children?: TreemapNode[];
  color?: string;
}

const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, name, size, depth } = props;

  if (width < 40 || height < 30) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: 'hsl(var(--background))',
            strokeWidth: 2,
            opacity: 0.8 - depth * 0.1,
          }}
        />
      </g>
    );
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: 'hsl(var(--background))',
          strokeWidth: 2,
          opacity: 0.8 - depth * 0.1,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 8}
        textAnchor="middle"
        fill="white"
        fontSize={Math.min(14, width / 6)}
        fontWeight="600"
      >
        {name?.length > 15 ? name.slice(0, 12) + '...' : name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="rgba(255,255,255,0.8)"
        fontSize={Math.min(12, width / 8)}
      >
        ${(size / 1000000).toFixed(1)}M
      </text>
    </g>
  );
};

const TreemapChart = ({ data, config, zoom = 1 }: TreemapChartProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<TreemapNode[]>([]);

  const treeData = useMemo(() => {
    if (!data || data.length === 0) {
      // Sample hierarchical data
      return {
        name: 'Portfolio',
        children: [
          {
            name: 'Technology',
            children: [
              { name: 'Software', size: 2500000 },
              { name: 'Hardware', size: 1800000 },
              { name: 'Services', size: 1200000 },
            ],
          },
          {
            name: 'Finance',
            children: [
              { name: 'Banking', size: 2100000 },
              { name: 'Insurance', size: 1600000 },
              { name: 'Fintech', size: 1400000 },
            ],
          },
          {
            name: 'Healthcare',
            children: [
              { name: 'Pharma', size: 1900000 },
              { name: 'Biotech', size: 1300000 },
              { name: 'Medical Devices', size: 900000 },
            ],
          },
          {
            name: 'Energy',
            children: [
              { name: 'Renewable', size: 1100000 },
              { name: 'Oil & Gas', size: 800000 },
            ],
          },
        ],
      };
    }

    // Convert flat data to hierarchical
    const nameKey = config?.nameKey || 'name';
    const valueKey = config?.valueKey || 'value';
    const childrenKey = config?.childrenKey || 'children';

    if (data[0]?.[childrenKey]) {
      return {
        name: 'Root',
        children: data,
      };
    }

    return {
      name: 'Data',
      children: data.map(item => ({
        name: item[nameKey] || 'Unknown',
        size: parseFloat(item[valueKey]) || 0,
      })),
    };
  }, [data, config]);

  const currentData = breadcrumbs.length > 0 
    ? breadcrumbs[breadcrumbs.length - 1]
    : treeData;

  const handleClick = (node: any) => {
    if (node.children && node.children.length > 0) {
      setBreadcrumbs([...breadcrumbs, node]);
    }
  };

  const handleBack = () => {
    setBreadcrumbs(breadcrumbs.slice(0, -1));
  };

  return (
    <div className="w-full h-[400px] flex flex-col">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {breadcrumbs.map(b => b.name).join(' → ')}
          </span>
        </div>
      )}

      <div className="flex-1" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={currentData.children || [currentData]}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="hsl(var(--background))"
            fill="hsl(var(--primary))"
            content={<CustomizedContent />}
            animationDuration={500}
            onClick={(node) => handleClick(node)}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Click on a section to drill down into subcategories
      </p>
    </div>
  );
};

export default TreemapChart;
