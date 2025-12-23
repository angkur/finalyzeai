import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, RotateCcw, FileJson, FileSpreadsheet, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ChartControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  chartType: string;
  chartData?: any[];
}

const ChartControls = ({ 
  zoom, 
  onZoomChange, 
  isFullscreen, 
  onFullscreenToggle,
  chartType,
  chartData = []
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

  const exportAsCSV = () => {
    if (!chartData || chartData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    try {
      // Get all unique keys from the data
      const allKeys = new Set<string>();
      chartData.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });
      const headers = Array.from(allKeys);

      // Create CSV content
      const csvRows = [
        headers.join(','), // Header row
        ...chartData.map(item => 
          headers.map(header => {
            const value = item[header];
            // Handle values that might contain commas or quotes
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartType}-data-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported as CSV");
    } catch (error) {
      toast.error("Failed to export CSV");
      console.error(error);
    }
  };

  const exportAsJSON = () => {
    if (!chartData || chartData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    try {
      const jsonContent = JSON.stringify(chartData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartType}-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported as JSON");
    } catch (error) {
      toast.error("Failed to export JSON");
      console.error(error);
    }
  };

  const exportAsImage = () => {
    // Find the chart container and export as PNG/SVG
    const chartElement = document.querySelector('.recharts-wrapper, canvas');
    if (!chartElement) {
      toast.error("Unable to export chart image");
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
        link.download = `${chartType}-chart-${new Date().toISOString().slice(0, 10)}.svg`;
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
      link.download = `${chartType}-chart-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Chart exported as PNG");
      return;
    }

    toast.error("Image export not available for this chart type");
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportAsCSV} className="cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer">
            <FileJson className="w-4 h-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportAsImage} className="cursor-pointer">
            <Image className="w-4 h-4 mr-2" />
            Export as Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
