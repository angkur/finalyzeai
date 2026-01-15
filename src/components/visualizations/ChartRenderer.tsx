import { forwardRef, useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import HeatmapChart from "./HeatmapChart";
import PieBarChart from "./PieBarChart";
import AreaTimeChart from "./AreaTimeChart";
import TreemapChart from "./TreemapChart";
import DualAxisChart from "./DualAxisChart";
import Scatter3DChart from "./Scatter3DChart";
import NetworkGraph from "./NetworkGraph";
import SankeyChart from "./SankeyChart";
import WordCloud from "./WordCloud";
import Workflow3DChart from "./Workflow3DChart";
import Workflow2DFallback from "./Workflow2DFallback";
import CustomWorkflow2D from "./CustomWorkflow2D";
import WorkflowBuilder, { WorkflowData } from "./WorkflowBuilder";
import ChartControls from "./ChartControls";
import ChartAnnotations, { Annotation } from "./ChartAnnotations";
import RealtimeControls from "./RealtimeControls";
import ChartComparison, { ComparisonDataset } from "./ChartComparison";
import useRealtimeChart from "@/hooks/useRealtimeChart";
import { BarChart3, PieChart, TrendingUp, Grid3X3, Layers, Box, Network, GitBranch, Cloud, Workflow, Wrench, Monitor, Database, HelpCircle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export interface ChartData {
  chartType: 'heatmap' | 'bar' | 'pie' | 'area' | 'treemap' | 'dualAxis' | 'scatter3d' | 'network' | 'sankey' | 'wordcloud' | 'workflow3d';
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
  enableRealtime?: boolean;
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
  workflow3d: Workflow,
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
  workflow3d: "3D Workflow",
};

const ChartRenderer = forwardRef<HTMLDivElement, ChartRendererProps>(({ chartData: initialChartData, isLoading, enableRealtime = true }, ref) => {
  const [selectedChart, setSelectedChart] = useState<ChartData['chartType'] | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [intervalMs, setIntervalMs] = useState(1000);
  const [maxDataPoints, setMaxDataPoints] = useState(50);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparisonDatasets, setComparisonDatasets] = useState<ComparisonDataset[]>([]);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [customWorkflowData, setCustomWorkflowData] = useState<WorkflowData | null>(null);
  const [workflowRenderMode, setWorkflowRenderMode] = useState<"3d" | "2d">("3d");
  const [workflowDataSource, setWorkflowDataSource] = useState<"uploaded" | "custom">("uploaded");
  const containerRef = useRef<HTMLDivElement>(null);
  const workflowChartRef = useRef<HTMLDivElement>(null);
  
  // Forward the ref to the container
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  // Handle fullscreen toggle using browser API
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        const element = containerRef.current;
        if (element) {
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen();
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen();
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback to CSS fullscreen if browser API fails
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Real-time streaming hook
  const {
    chartData,
    isStreaming,
    streamStats,
    toggleStream,
    clearData,
    resetData,
  } = useRealtimeChart(initialChartData, {
    intervalMs,
    maxDataPoints,
    chartType: selectedChart || initialChartData?.chartType,
  });

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

  const handleAddAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  }, []);

  const handleRemoveAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleAddComparisonDataset = useCallback((dataset: Omit<ComparisonDataset, 'id' | 'createdAt'>) => {
    const newDataset: ComparisonDataset = {
      ...dataset,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setComparisonDatasets(prev => [...prev, newDataset]);
  }, []);

  const handleRemoveComparisonDataset = useCallback((id: string) => {
    setComparisonDatasets(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleToggleDatasetVisibility = useCallback((id: string) => {
    setComparisonDatasets(prev => prev.map(d => 
      d.id === id ? { ...d, visible: !d.visible } : d
    ));
  }, []);

  // Merge datasets for comparison rendering
  const mergedChartData = useMemo(() => {
    if (!isCompareMode || comparisonDatasets.length === 0 || !chartData) {
      return chartData;
    }
    
    const visibleDatasets = comparisonDatasets.filter(d => d.visible);
    if (visibleDatasets.length === 0) return chartData;

    // Create merged data with dataset identifiers
    const mergedData = [...chartData.data.map(item => ({ ...item, _dataset: 'primary' }))];
    
    visibleDatasets.forEach(dataset => {
      dataset.data.forEach(item => {
        mergedData.push({ ...item, _dataset: dataset.name, _color: dataset.color });
      });
    });

    return { ...chartData, data: mergedData };
  }, [chartData, comparisonDatasets, isCompareMode]);

  // Handle workflow builder output
  const handleWorkflowBuild = useCallback((workflowData: WorkflowData) => {
    setCustomWorkflowData(workflowData);
    setWorkflowDataSource("custom");
    setWorkflowRenderMode("2d"); // Default to 2D for custom workflows - more reliable
    setSelectedChart('workflow3d');
    toast.success(`Workflow built! ${workflowData.nodes.length} nodes, ${workflowData.links.length} connections.`);
    // Don't close builder so user can see both the builder and visualization
  }, []);

  // Export workflow as image
  const handleExportWorkflowImage = useCallback(async () => {
    const chartContainer = workflowChartRef.current;
    if (!chartContainer) {
      toast.error("No workflow visualization to export. Please build the workflow first.");
      return;
    }

    try {
      // For 3D Canvas, we need to capture the canvas element
      const canvas = chartContainer.querySelector('canvas');
      const svgElement = chartContainer.querySelector('svg');
      
      if (canvas) {
        // Export 3D canvas
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `workflow_3d_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Workflow image exported successfully!");
      } else if (svgElement) {
        // Export 2D SVG as PNG
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new window.Image();
        img.onload = () => {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = svgElement.clientWidth * 2;
          tempCanvas.height = svgElement.clientHeight * 2;
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            const dataUrl = tempCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `workflow_2d_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Workflow image exported successfully!");
          }
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } else {
        toast.error("Could not find workflow visualization to export");
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export image. Please try again.");
    }
  }, []);

  // Convert custom workflow data to chart format
  const workflowChartData = useMemo(() => {
    if (!customWorkflowData) return null;
    
    const { nodes, links } = customWorkflowData;
    
    // Create proper link format with source/target labels
    return links.map((link) => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      return {
        source: sourceNode?.label || link.source,
        target: targetNode?.label || link.target,
        value: link.value,
        category: sourceNode?.category || "Process",
      };
    }).concat(
      // Add nodes without outgoing links
      nodes.filter(n => !links.some(l => l.source === n.id)).map(node => ({
        source: node.label,
        target: "",
        value: node.value,
        category: node.category,
      }))
    );
  }, [customWorkflowData]);

  // Determine which data to use for workflow
  const activeWorkflowData = useMemo(() => {
    if (workflowDataSource === "custom" && workflowChartData && workflowChartData.length > 0) {
      return workflowChartData;
    }
    return mergedChartData?.data || [];
  }, [workflowDataSource, workflowChartData, mergedChartData]);

  if (isLoading) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-[400px] bg-secondary/30 rounded-xl border border-border/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Generating visualization...</span>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-[400px] bg-secondary/30 rounded-xl border border-border/30">
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

  const renderChart = (type: ChartData['chartType'], data: any[] = mergedChartData?.data || [], isWorkflowRef = false) => {
    // Use workflow-specific data for workflow charts
    const chartDataToUse = type === 'workflow3d' ? activeWorkflowData : data;
    const commonProps = { data: chartDataToUse, config: chartData.config, zoom };

    const chartElement = (() => {
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
        case 'workflow3d':
          // For custom workflows, use the dedicated CustomWorkflow2D component in 2D mode
          if (workflowDataSource === "custom" && customWorkflowData && customWorkflowData.nodes.length > 0) {
            if (workflowRenderMode === "2d") {
              return <CustomWorkflow2D workflowData={customWorkflowData} zoom={zoom} />;
            }
            // For 3D, pass the converted data
            return <Workflow3DChart {...commonProps} />;
          }
          // For uploaded data
          if (workflowRenderMode === "2d") {
            return <Workflow2DFallback {...commonProps} isManualMode={true} />;
          }
          return <Workflow3DChart {...commonProps} />;
        default:
          return <PieBarChart {...commonProps} type="bar" />;
      }
    })();

    // Wrap workflow charts in a ref for image export
    if (type === 'workflow3d' && isWorkflowRef) {
      return <div ref={workflowChartRef}>{chartElement}</div>;
    }

    return chartElement;
  };

  const availableCharts: ChartData['chartType'][] = ['bar', 'pie', 'area', 'heatmap', 'treemap', 'dualAxis', 'scatter3d', 'network', 'sankey', 'wordcloud', 'workflow3d'];

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col ${isFullscreen ? 'bg-background p-6 h-full overflow-auto' : ''}`}
    >
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
            {enableRealtime && (
              <>
                <RealtimeControls
                  isStreaming={isStreaming}
                  onToggleStream={toggleStream}
                  onReset={resetData}
                  onClear={clearData}
                  streamStats={streamStats}
                  intervalMs={intervalMs}
                  onIntervalChange={setIntervalMs}
                  maxDataPoints={maxDataPoints}
                  onMaxDataPointsChange={setMaxDataPoints}
                />
                <div className="w-px h-6 bg-border hidden sm:block" />
              </>
            )}
            <ChartComparison
              datasets={comparisonDatasets}
              onAddDataset={handleAddComparisonDataset}
              onRemoveDataset={handleRemoveComparisonDataset}
              onToggleVisibility={handleToggleDatasetVisibility}
              isCompareMode={isCompareMode}
              onToggleCompareMode={() => setIsCompareMode(!isCompareMode)}
              currentChartData={chartData}
            />
            <div className="w-px h-6 bg-border hidden sm:block" />
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
              onFullscreenToggle={toggleFullscreen}
              chartType={activeChart}
              chartData={chartData.data}
            />
            {/* Workflow Builder Toggle and Controls */}
            {activeChart === 'workflow3d' && (
              <>
                <div className="w-px h-6 bg-border hidden sm:block" />
                
                {/* 3D/2D Toggle with Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ToggleGroup 
                          type="single" 
                          value={workflowRenderMode}
                          onValueChange={(value) => value && setWorkflowRenderMode(value as "3d" | "2d")}
                          className="bg-secondary/50 p-0.5 rounded-md"
                        >
                          <ToggleGroupItem value="3d" size="sm" className="px-3 py-1 text-xs data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                            <Box className="w-3.5 h-3.5 mr-1" />
                            3D
                          </ToggleGroupItem>
                          <ToggleGroupItem value="2d" size="sm" className="px-3 py-1 text-xs data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                            <Monitor className="w-3.5 h-3.5 mr-1" />
                            2D
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch between 3D (interactive rotate) and 2D (drag nodes) views</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Data Source Toggle with Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <ToggleGroup 
                          type="single" 
                          value={workflowDataSource}
                          onValueChange={(value) => value && setWorkflowDataSource(value as "uploaded" | "custom")}
                          className="bg-secondary/50 p-0.5 rounded-md"
                        >
                          <ToggleGroupItem value="uploaded" size="sm" className="px-3 py-1 text-xs data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                            <Database className="w-3.5 h-3.5 mr-1" />
                            Uploaded
                          </ToggleGroupItem>
                          <ToggleGroupItem value="custom" size="sm" className="px-3 py-1 text-xs data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                            <Wrench className="w-3.5 h-3.5 mr-1" />
                            Custom
                          </ToggleGroupItem>
                        </ToggleGroup>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium mb-1">Data Source Options:</p>
                            <p className="text-xs"><strong>Uploaded:</strong> Visualize data from your uploaded CSV/JSON files</p>
                            <p className="text-xs"><strong>Custom:</strong> Use workflows you create in the Builder panel</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose between uploaded data or custom-built workflow</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant={showWorkflowBuilder ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowWorkflowBuilder(!showWorkflowBuilder)}
                  className="flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span className="hidden sm:inline">Builder</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Workflow Builder Panel */}
        {showWorkflowBuilder && activeChart === 'workflow3d' && (
          <div className="mb-4 p-4 bg-card/50 rounded-xl border border-border/50">
            <WorkflowBuilder 
              onBuild={handleWorkflowBuild} 
              initialData={customWorkflowData || undefined}
              onExportImage={handleExportWorkflowImage}
              canExportImage={customWorkflowData !== null && customWorkflowData.nodes.length > 0}
            />
          </div>
        )}

        <div className={`bg-secondary/30 rounded-xl border border-border/30 p-4 min-h-[400px] relative ${isCompareMode && comparisonDatasets.filter(d => d.visible).length > 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}`}>
          {isCompareMode && comparisonDatasets.filter(d => d.visible).length > 0 ? (
            <>
              {/* Primary dataset */}
              <div className="relative border border-border/50 rounded-lg p-3">
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded">
                  Primary
                </div>
                <TabsContent value={activeChart} className="mt-0 h-full pt-6">
                  {renderChart(activeChart, chartData.data)}
                </TabsContent>
              </div>
              
              {/* Comparison datasets */}
              {comparisonDatasets.filter(d => d.visible).map((dataset) => (
                <div key={dataset.id} className="relative border border-border/50 rounded-lg p-3">
                  <div 
                    className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-medium rounded text-white"
                    style={{ backgroundColor: dataset.color }}
                  >
                    {dataset.name}
                  </div>
                  <TabsContent value={activeChart} className="mt-0 h-full pt-6">
                    {renderChart(activeChart, dataset.data)}
                  </TabsContent>
                </div>
              ))}
            </>
          ) : (
            availableCharts.map((type) => (
              <TabsContent key={type} value={type} className="mt-0 h-full">
                {renderChart(type, mergedChartData?.data || [], type === 'workflow3d')}
              </TabsContent>
            ))
          )}
          
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
