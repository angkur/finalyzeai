import { useState, RefObject } from "react";
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
  containerRef?: RefObject<HTMLDivElement>;
}

const ChartControls = ({ 
  zoom, 
  onZoomChange, 
  isFullscreen, 
  onFullscreenToggle,
  chartType,
  chartData = [],
  containerRef
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

  const exportAsImage = async () => {
    // Use containerRef if provided, otherwise search the document
    const searchRoot = containerRef?.current || document;
    
    // Try to find chart elements in order of priority
    // 1. Canvas for 3D charts (Three.js)
    const canvas = searchRoot.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      try {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chartType}-chart-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Chart exported as PNG");
        return;
      } catch (error) {
        console.error('Canvas export error:', error);
      }
    }

    // 2. SVG elements for D3-based charts (Network, Sankey, Word Cloud)
    const svgElement = searchRoot.querySelector('svg') as SVGSVGElement;
    if (svgElement) {
      try {
        // Clone the SVG and add necessary styles
        const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
        
        // Get computed styles and embed them
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // Convert SVG to PNG for better compatibility
        const img = new window.Image();
        img.onload = () => {
          const tempCanvas = document.createElement('canvas');
          const width = svgElement.clientWidth || svgElement.getBoundingClientRect().width || 800;
          const height = svgElement.clientHeight || svgElement.getBoundingClientRect().height || 600;
          tempCanvas.width = width * 2; // 2x for retina
          tempCanvas.height = height * 2;
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            // Fill with dark background for visibility
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = tempCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${chartType}-chart-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Chart exported as PNG");
          }
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          // Fallback: export as SVG if PNG conversion fails
          const link = document.createElement('a');
          link.href = url;
          link.download = `${chartType}-chart-${new Date().toISOString().slice(0, 10)}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("Chart exported as SVG");
        };
        img.src = url;
        return;
      } catch (error) {
        console.error('SVG export error:', error);
      }
    }

    // 3. Recharts wrapper
    const rechartsElement = searchRoot.querySelector('.recharts-wrapper');
    if (rechartsElement) {
      const rechartsSvg = rechartsElement.querySelector('svg');
      if (rechartsSvg) {
        const svgData = new XMLSerializer().serializeToString(rechartsSvg);
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

    toast.error("Unable to export chart image. Please try again.");
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
