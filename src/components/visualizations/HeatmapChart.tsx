import { useMemo, useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapChartProps {
  data: any[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    valueKey?: string;
    title?: string;
  };
  zoom?: number;
}

const HeatmapChart = ({ data, config, zoom = 1 }: HeatmapChartProps) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const { matrix, rowLabels, colLabels, minValue, maxValue } = useMemo(() => {
    // Check if data is empty or contains only empty objects
    const hasValidData = data && data.length > 0 && data.some(item => 
      Object.keys(item).length > 0 && Object.values(item).some(v => v !== null && v !== undefined)
    );
    
    if (!hasValidData) {
      // Generate sample correlation matrix
      const sampleLabels = ['Revenue', 'Expenses', 'Profit', 'Growth', 'Risk'];
      const sampleMatrix = [
        [1.0, 0.75, 0.85, 0.62, -0.45],
        [0.75, 1.0, -0.35, 0.28, 0.15],
        [0.85, -0.35, 1.0, 0.72, -0.38],
        [0.62, 0.28, 0.72, 1.0, -0.22],
        [-0.45, 0.15, -0.38, -0.22, 1.0],
      ];
      return {
        matrix: sampleMatrix,
        rowLabels: sampleLabels,
        colLabels: sampleLabels,
        minValue: -1,
        maxValue: 1,
      };
    }

    // If data is already a matrix format
    if (Array.isArray(data[0]) && typeof data[0][0] === 'number') {
      const values = data.flat();
      return {
        matrix: data,
        rowLabels: data.map((_, i) => `Row ${i + 1}`),
        colLabels: data[0].map((_: any, i: number) => `Col ${i + 1}`),
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
      };
    }

    // Convert object array to matrix
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
    const numericData = data.map(row => keys.map(k => row[k] || 0));
    const values = numericData.flat();
    
    return {
      matrix: numericData,
      rowLabels: data.map((_, i) => `Item ${i + 1}`),
      colLabels: keys,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [data]);

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    
    // Blue to Red gradient via white
    if (normalized < 0.5) {
      const intensity = (0.5 - normalized) * 2;
      return `hsl(220, ${70 + intensity * 30}%, ${50 + (1 - intensity) * 45}%)`;
    } else {
      const intensity = (normalized - 0.5) * 2;
      return `hsl(${45 - intensity * 45}, ${70 + intensity * 30}%, ${50 + (1 - intensity) * 45}%)`;
    }
  };

  const cellSize = Math.min(60 * zoom, 100);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center w-full overflow-auto">
        {config?.title && (
          <h3 className="text-lg font-semibold text-foreground mb-4">{config.title}</h3>
        )}
        
        <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          {/* Column labels */}
          <div className="flex ml-20 mb-2">
            {colLabels.map((label, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground truncate text-center"
                style={{ width: cellSize, minWidth: cellSize }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Matrix */}
          <div className="flex">
            {/* Row labels */}
            <div className="flex flex-col mr-2" style={{ width: 72 }}>
              {rowLabels.map((label, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground truncate text-right pr-2 flex items-center justify-end"
                  style={{ height: cellSize }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex flex-col">
              {matrix.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {row.map((value: number, colIdx: number) => (
                    <Tooltip key={colIdx}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer border border-background/20"
                          style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: getColor(value),
                            color: Math.abs(value - (minValue + maxValue) / 2) > (maxValue - minValue) / 4 
                              ? 'white' 
                              : 'hsl(var(--foreground))',
                            transform: hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx 
                              ? 'scale(1.1)' 
                              : 'scale(1)',
                            zIndex: hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx ? 10 : 1,
                          }}
                          onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {value.toFixed(2)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border border-border">
                        <div className="text-sm">
                          <p className="font-medium">{rowLabels[rowIdx]} × {colLabels[colIdx]}</p>
                          <p className="text-muted-foreground">Value: {value.toFixed(4)}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center mt-6 gap-2">
            <span className="text-xs text-muted-foreground">{minValue.toFixed(2)}</span>
            <div className="w-48 h-4 rounded" style={{
              background: `linear-gradient(to right, hsl(220, 100%, 50%), hsl(0, 0%, 95%), hsl(0, 100%, 50%))`
            }} />
            <span className="text-xs text-muted-foreground">{maxValue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default HeatmapChart;
