import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeatmapChart from "./HeatmapChart";
import PieBarChart from "./PieBarChart";
import AreaTimeChart from "./AreaTimeChart";
import TreemapChart from "./TreemapChart";
import DualAxisChart from "./DualAxisChart";
import Scatter3DChart from "./Scatter3DChart";
import ChartControls from "./ChartControls";
import { BarChart3, PieChart, TrendingUp, Grid3X3, Layers, Box } from "lucide-react";

export interface ChartData {
  chartType: 'heatmap' | 'bar' | 'pie' | 'area' | 'treemap' | 'dualAxis' | 'scatter3d';
  data: any[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    zAxis?: string;
    colorKey?: string;
    labelKey?: string;
    valueKey?: string;
    title?: string;
  };
  insights?: string;
}

interface ChartRendererProps {
  chartData: ChartData | null;
  isLoading?: boolean;
}

const chartTypeIcons = {
  heatmap: Grid3X3,
  bar: BarChart3,
  pie: PieChart,
  area: TrendingUp,
  treemap: Layers,
  dualAxis: BarChart3,
  scatter3d: Box,
};

const chartTypeLabels = {
  heatmap: "Heatmap",
  bar: "Bar Chart",
  pie: "Pie Chart",
  area: "Time Series",
  treemap: "Treemap",
  dualAxis: "Dual Axis",
  scatter3d: "3D Scatter",
};

const ChartRenderer = ({ chartData, isLoading }: ChartRendererProps) => {
  const [selectedChart, setSelectedChart] = useState<ChartData['chartType'] | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-secondary/30 rounded-xl border border-border/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Generating visualization...</span>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-secondary/30 rounded-xl border border-border/30">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <span className="text-sm text-muted-foreground">
            Run data visualization to see charts
          </span>
        </div>
      </div>
    );
  }

  const activeChart = selectedChart || chartData.chartType;

  const renderChart = (type: ChartData['chartType']) => {
    const commonProps = { data: chartData.data, config: chartData.config, zoom };

    switch (type) {
      case 'heatmap':
        return <HeatmapChart {...commonProps} />;
      case 'bar':
      case 'pie':
        return <PieBarChart {...commonProps} type={type} />;
      case 'area':
        return <AreaTimeChart {...commonProps} />;
      case 'treemap':
        return <TreemapChart {...commonProps} />;
      case 'dualAxis':
        return <DualAxisChart {...commonProps} />;
      case 'scatter3d':
        return <Scatter3DChart {...commonProps} />;
      default:
        return <PieBarChart {...commonProps} type="bar" />;
    }
  };

  const availableCharts: ChartData['chartType'][] = ['bar', 'pie', 'area', 'heatmap', 'treemap', 'dualAxis', 'scatter3d'];

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
      {/* Chart Type Selector */}
      <Tabs value={activeChart} onValueChange={(v) => setSelectedChart(v as ChartData['chartType'])} className="w-full">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <TabsList className="bg-secondary/50 p-1 h-auto flex-wrap">
            {availableCharts.map((type) => {
              const Icon = chartTypeIcons[type];
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{chartTypeLabels[type]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <ChartControls
            zoom={zoom}
            onZoomChange={setZoom}
            isFullscreen={isFullscreen}
            onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            chartType={activeChart}
          />
        </div>

        {/* Chart Container */}
        <div className="bg-secondary/30 rounded-xl border border-border/30 p-4 min-h-[400px]">
          {availableCharts.map((type) => (
            <TabsContent key={type} value={type} className="mt-0 h-full">
              {renderChart(type)}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Insights */}
      {chartData.insights && (
        <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/30">
          <h4 className="text-sm font-medium text-accent mb-2">AI Insights</h4>
          <p className="text-sm text-foreground/80">{chartData.insights}</p>
        </div>
      )}
    </div>
  );
};

export default ChartRenderer;
