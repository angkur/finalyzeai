import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { AlertCircle, Monitor, Layers, RotateCcw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Workflow2DFallbackProps {
  data: any[];
  config?: {
    nodeKey?: string;
    valueKey?: string;
    categoryKey?: string;
    sourceKey?: string;
    targetKey?: string;
    title?: string;
  };
  zoom?: number;
  renderMode?: "sankey" | "network";
  errorMessage?: string;
  isManualMode?: boolean; // When user explicitly chose 2D
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface FlowNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  value: number;
  category: string;
  color: string;
}

interface FlowLink {
  source: string | FlowNode;
  target: string | FlowNode;
  value: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Input: "hsl(199, 89%, 48%)",
  Process: "hsl(162, 72%, 45%)",
  Decision: "hsl(45, 93%, 58%)",
  AI: "hsl(262, 83%, 66%)",
  Output: "hsl(30, 80%, 55%)",
  Storage: "hsl(188, 78%, 41%)",
  Integration: "hsl(330, 81%, 60%)",
  Custom: "hsl(215, 20%, 65%)",
  Data: "hsl(200, 80%, 50%)",
  Default: "hsl(200, 80%, 50%)",
};

const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const coerceString = (v: unknown, fallback: string) => {
  if (v === null || v === undefined) return fallback;
  const s = typeof v === "string" ? v : String(v);
  return s.trim() || fallback;
};

const coerceNumber = (v: unknown, fallback: number) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (v === null || v === undefined) return fallback;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

const Workflow2DFallback = ({
  data,
  config,
  zoom = 1,
  renderMode = "network",
  errorMessage,
  isManualMode = false,
}: Workflow2DFallbackProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<FlowNode, undefined> | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [savedPositions, setSavedPositions] = useState<NodePosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasCustomLayout, setHasCustomLayout] = useState(false);
  const layoutVersion = useRef(0);

  // Reset layout to force-directed positioning
  const resetLayout = () => {
    setSavedPositions([]);
    setHasCustomLayout(false);
    layoutVersion.current += 1;
  };

  const { nodes, links, problem } = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        nodes: [] as FlowNode[],
        links: [] as FlowLink[],
        problem: "Invalid data format",
      };
    }

    const safeItems = data.filter(isRecord) as Record<string, unknown>[];

    if (safeItems.length === 0) {
      // Generate sample workflow data
      const sampleNodes: FlowNode[] = [
        { id: "input", label: "Data Input", value: 100, category: "Input", color: getCategoryColor("Input") },
        { id: "validate", label: "Validation", value: 95, category: "Process", color: getCategoryColor("Process") },
        { id: "analyze", label: "AI Analysis", value: 90, category: "AI", color: getCategoryColor("AI") },
        { id: "decision", label: "Decision", value: 85, category: "Decision", color: getCategoryColor("Decision") },
        { id: "output", label: "Report", value: 80, category: "Output", color: getCategoryColor("Output") },
      ];

      const sampleLinks: FlowLink[] = [
        { source: "input", target: "validate", value: 100 },
        { source: "validate", target: "analyze", value: 95 },
        { source: "analyze", target: "decision", value: 90 },
        { source: "decision", target: "output", value: 85 },
      ];

      return { nodes: sampleNodes, links: sampleLinks, problem: null };
    }

    // Detect keys
    const sample = safeItems[0];
    const keys = Object.keys(sample);

    const nodeKey =
      config?.nodeKey ||
      keys.find((k) =>
        ["name", "label", "id", "title", "step", "node", "stage", "symbol"].includes(k.toLowerCase())
      ) ||
      keys[0];

    const valueKey =
      config?.valueKey ||
      keys.find((k) => ["value", "amount", "count", "total", "volume"].includes(k.toLowerCase())) ||
      keys.find((k) => typeof sample[k] === "number") ||
      "value";

    const categoryKey =
      config?.categoryKey ||
      keys.find((k) => ["category", "type", "group", "status", "phase"].includes(k.toLowerCase())) ||
      "category";

    const sourceKey = config?.sourceKey || "source";
    const targetKey = config?.targetKey || "target";

    const hasLinks = safeItems.some((item) => item[sourceKey] != null && item[targetKey] != null);
    const processedNodes: FlowNode[] = [];
    const processedLinks: FlowLink[] = [];

    if (hasLinks) {
      const nodeMap = new Map<string, { label: string; value: number; category: string }>();

      safeItems.forEach((item) => {
        const source = coerceString(item[sourceKey], "Source");
        const target = coerceString(item[targetKey], "Target");
        const value = Math.max(0, coerceNumber(item[valueKey], 50));
        const category = coerceString(item[categoryKey], "Process");

        if (!nodeMap.has(source)) nodeMap.set(source, { label: source, value, category });
        if (!nodeMap.has(target)) nodeMap.set(target, { label: target, value: value * 0.9, category });

        processedLinks.push({ source, target, value });
      });

      Array.from(nodeMap.entries()).forEach(([id, node]) => {
        processedNodes.push({
          id,
          label: node.label,
          value: node.value,
          category: node.category,
          color: getCategoryColor(node.category),
        });
      });
    } else {
      // Flat data: create sequential flow
      safeItems.slice(0, 12).forEach((item, i) => {
        const label = coerceString(item[nodeKey], `Step ${i + 1}`);
        const id = `node_${i}`;
        const value = Math.max(0, coerceNumber(item[valueKey], 50));
        const category = coerceString(item[categoryKey], "Data");

        processedNodes.push({
          id,
          label,
          value,
          category,
          color: getCategoryColor(category),
        });

        if (i > 0) {
          processedLinks.push({
            source: `node_${i - 1}`,
            target: id,
            value,
          });
        }
      });
    }

    return { nodes: processedNodes, links: processedLinks, problem: null };
  }, [data, config]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Create gradient definitions
    const defs = svg.append("defs");
    nodes.forEach((node, i) => {
      const gradient = defs.append("radialGradient").attr("id", `nodeGrad2d${i}`);
      gradient.append("stop").attr("offset", "0%").attr("stop-color", node.color).attr("stop-opacity", 1);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", node.color).attr("stop-opacity", 0.6);
    });

    // Create links with source/target as objects for simulation
    const nodesCopy: FlowNode[] = nodes.map((d) => {
      // Apply saved positions if available
      const savedPos = savedPositions.find(p => p.id === d.id);
      return {
        ...d,
        x: savedPos?.x,
        y: savedPos?.y,
        fx: savedPos?.x, // Fix position if saved
        fy: savedPos?.y,
      };
    });
    const linksCopy = links.map((d) => ({
      source: typeof d.source === "string" ? d.source : d.source.id,
      target: typeof d.target === "string" ? d.target : d.target.id,
      value: d.value,
    }));

    const simulation = d3
      .forceSimulation<FlowNode>(nodesCopy)
      .force(
        "link",
        d3
          .forceLink<FlowNode, d3.SimulationLinkDatum<FlowNode>>(linksCopy as any)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", savedPositions.length > 0 ? null : d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Draw links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(linksCopy)
      .join("line")
      .attr("stroke", "hsl(var(--muted-foreground))")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => Math.max(1, Math.sqrt(d.value) * 0.5))
      .attr("marker-end", "url(#arrowhead)");

    // Arrow marker
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .append("path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "hsl(var(--muted-foreground))")
      .attr("opacity", 0.6);

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodesCopy)
      .join("circle")
      .attr("r", (d) => Math.max(15, Math.sqrt(d.value) * 2 + 10))
      .attr("fill", (_, i) => `url(#nodeGrad2d${i})`)
      .attr("stroke", "hsl(var(--background))")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGCircleElement, FlowNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            setIsDragging(true);
            // Highlight dragged node
            d3.select(event.sourceEvent.target).attr("stroke", "hsl(var(--primary))").attr("stroke-width", 3);
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            // Keep the position fixed (persist the layout)
            d.fx = event.x;
            d.fy = event.y;
            setIsDragging(false);
            setHasCustomLayout(true);
            // Reset stroke
            d3.select(event.sourceEvent.target).attr("stroke", "hsl(var(--background))").attr("stroke-width", 2);
            // Save all current positions
            const newPositions = nodesCopy.map(n => ({
              id: n.id,
              x: n.x!,
              y: n.y!,
            }));
            setSavedPositions(newPositions);
          })
      );

    node
      .on("mouseenter", (event, d) => {
        const rect = container.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: `${d.label}: ${d.value} (${d.category})`,
        });
      })
      .on("mouseleave", () => setTooltip(null));

    // Draw labels
    const labels = svg
      .append("g")
      .selectAll("text")
      .data(nodesCopy)
      .join("text")
      .text((d) => (d.label.length > 12 ? d.label.slice(0, 10) + "..." : d.label))
      .attr("font-size", 10)
      .attr("fill", "hsl(var(--foreground))")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d) => (d.x = Math.max(30, Math.min(width - 30, d.x!))))
        .attr("cy", (d) => (d.y = Math.max(30, Math.min(height - 30, d.y!))));

      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, zoom, savedPositions, layoutVersion.current]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] relative bg-secondary/30 rounded-xl overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
    >
      {/* Mode notice - only show for fallback, not manual 2D selection */}
      {!isManualMode && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            2D Fallback Mode {errorMessage && `(${errorMessage})`}
          </span>
        </div>
      )}
      {isManualMode && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
          <Monitor className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary">2D Network View</span>
          {hasCustomLayout && (
            <span className="text-xs text-primary/70 ml-1">• Custom Layout</span>
          )}
        </div>
      )}

      {problem ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{problem}</p>
          </div>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full h-full" />
      )}

      {tooltip && (
        <div
          className="absolute pointer-events-none bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-lg z-20"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
          <div className="text-xs font-medium text-foreground mb-2">Categories</div>
          <div className="flex flex-wrap gap-2">
            {[...new Set(nodes.map((n) => n.category))].map((category) => (
              <div key={category} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span className="text-xs text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drag indicator and Reset button */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {isDragging && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/20 border border-primary/30">
            <Move className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs text-primary">Dragging...</span>
          </div>
        )}
        {hasCustomLayout && !isDragging && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetLayout}
            className="h-7 text-xs gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Layout
          </Button>
        )}
        <p className="text-xs text-muted-foreground bg-card/60 backdrop-blur-sm px-2 py-1 rounded">
          Drag nodes to rearrange • Hover for details
        </p>
      </div>
    </div>
  );
};

export default Workflow2DFallback;
