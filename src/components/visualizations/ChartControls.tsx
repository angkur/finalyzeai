import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChartControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  chartType: string;
}

const ChartControls = ({ 
  zoom, 
  onZoomChange, 
  isFullscreen, 
  onFullscreenToggle,
  chartType 
}: ChartControlsProps) => {
  
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.1, 0.5));
  };

  const handleReset = () => {
    onZoomChange(1);
  };

  const handleExport = () => {
    // Find the chart container and export as PNG
    const chartElement = document.querySelector('.recharts-wrapper, canvas');
    if (!chartElement) {
      toast.error("Unable to export chart");
      return;
    }

    // For SVG-based charts (Recharts)
    if (chartElement.classList.contains('recharts-wrapper')) {
      const svgElement = chartElement.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chartType}-chart.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("Chart exported as SVG");
        return;
      }
    }

    // For Canvas-based charts (3D)
    if (chartElement.tagName === 'CANVAS') {
      const canvas = chartElement as HTMLCanvasElement;
      const url = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartType}-chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Chart exported as PNG");
      return;
    }

    toast.error("Export not available for this chart type");
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="h-8 w-8 p-0"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <span className="text-xs text-muted-foreground w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="h-8 w-8 p-0"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-8 w-8 p-0"
        title="Reset View"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExport}
        className="h-8 w-8 p-0"
        title="Export Chart"
      >
        <Download className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreenToggle}
        className="h-8 w-8 p-0"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

export default ChartControls;
