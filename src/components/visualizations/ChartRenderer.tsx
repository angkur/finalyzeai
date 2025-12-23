import { forwardRef, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeatmapChart from "./HeatmapChart";
import PieBarChart from "./PieBarChart";
import AreaTimeChart from "./AreaTimeChart";
import TreemapChart from "./TreemapChart";
import DualAxisChart from "./DualAxisChart";
import Scatter3DChart from "./Scatter3DChart";
import NetworkGraph from "./NetworkGraph";
import SankeyChart from "./SankeyChart";
import WordCloud from "./WordCloud";
import ChartControls from "./ChartControls";
import ChartAnnotations, { Annotation } from "./ChartAnnotations";
import { BarChart3, PieChart, TrendingUp, Grid3X3, Layers, Box, Network, GitBranch, Cloud } from "lucide-react";

export interface ChartData {
  chartType: 'heatmap' | 'bar' | 'pie' | 'area' | 'treemap' | 'dualAxis' | 'scatter3d' | 'network' | 'sankey' | 'wordcloud';
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
  network: Network,
  sankey: GitBranch,
  wordcloud: Cloud,
};

const chartTypeLabels = {
  heatmap: "Heatmap",
  bar: "Bar Chart",
  pie: "Pie Chart",
  area: "Time Series",
  treemap: "Treemap",
  dualAxis: "Dual Axis",
  scatter3d: "3D Scatter",
  network: "Network",
  sankey: "Sankey",
  wordcloud: "Word Cloud",
};

const ChartRenderer = forwardRef<HTMLDivElement, ChartRendererProps>(({ chartData, isLoading }, ref) => {
  const [selectedChart, setSelectedChart] = useState<ChartData['chartType'] | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Extract data points for annotation linking
  const dataPoints = useMemo(() => {
    if (!chartData?.data || chartData.data.length === 0) return [];
    
    const labelKey = chartData.config?.labelKey || chartData.config?.xAxis || 'name';
    return chartData.data
      .map(item => item[labelKey] || item.name || item.label)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .slice(0, 20)
      .map(String);
  }, [chartData]);

  const handleAddAnnotation = (annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const handleRemoveAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  if (isLoading) {
    return (
      <div ref={ref} className="flex items-center justify-center h-[400px] bg-secondary/30 rounded-xl border border-border/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Generating visualization...</span>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div ref={ref} className="flex items-center justify-center h-[400px] bg-secondary/30 rounded-xl border border-border/30">
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
      case 'network':
        return <NetworkGraph {...commonProps} />;
      case 'sankey':
        return <SankeyChart {...commonProps} />;
      case 'wordcloud':
        return <WordCloud {...commonProps} />;
      default:
        return <PieBarChart {...commonProps} type="bar" />;
    }
  };

  const availableCharts: ChartData['chartType'][] = ['bar', 'pie', 'area', 'heatmap', 'treemap', 'dualAxis', 'scatter3d', 'network', 'sankey', 'wordcloud'];

  return (
    <div ref={ref} className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
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
          
          <div className="flex items-center gap-2 flex-wrap">
            <ChartAnnotations
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
              onRemoveAnnotation={handleRemoveAnnotation}
              dataPoints={dataPoints}
            />
            <div className="w-px h-6 bg-border hidden sm:block" />
            <ChartControls
              zoom={zoom}
              onZoomChange={setZoom}
              isFullscreen={isFullscreen}
              onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
              chartType={activeChart}
              chartData={chartData.data}
            />
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl border border-border/30 p-4 min-h-[400px] relative">
          {availableCharts.map((type) => (
            <TabsContent key={type} value={type} className="mt-0 h-full">
              {renderChart(type)}
            </TabsContent>
          ))}
          
          {/* Render annotation badges on the chart */}
          {annotations.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[200px] pointer-events-none">
              {annotations.filter(a => a.type === 'label').slice(0, 5).map((annotation) => (
                <div
                  key={annotation.id}
                  className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg"
                  style={{ backgroundColor: annotation.color }}
                >
                  {annotation.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Notes section */}
      {annotations.filter(a => a.type === 'note').length > 0 && (
        <div className="mt-4 space-y-2">
          {annotations.filter(a => a.type === 'note').map((note) => (
            <div 
              key={note.id}
              className="p-3 rounded-lg border text-sm"
              style={{ borderColor: note.color, backgroundColor: `${note.color}10` }}
            >
              <span className="font-medium" style={{ color: note.color }}>Note:</span>{' '}
              {note.text}
              {note.dataPoint && (
                <span className="text-muted-foreground"> (Re: {note.dataPoint})</span>
              )}
            </div>
          ))}
        </div>
      )}

      {chartData.insights && (
        <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/30">
          <h4 className="text-sm font-medium text-accent mb-2">AI Insights</h4>
          <p className="text-sm text-foreground/80">{chartData.insights}</p>
        </div>
      )}
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;
