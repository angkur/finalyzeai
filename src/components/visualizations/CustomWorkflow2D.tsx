import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Monitor, Move, RotateCcw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowData, WorkflowNode, WorkflowLink } from "./WorkflowBuilder";

interface CustomWorkflow2DProps {
  workflowData: WorkflowData;
  zoom?: number;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  value: number;
  category: string;
  color: string;
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

const CustomWorkflow2D = ({
  workflowData,
  zoom = 1,
}: CustomWorkflow2DProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, undefined> | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [savedPositions, setSavedPositions] = useState<NodePosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasCustomLayout, setHasCustomLayout] = useState(false);

  const resetLayout = useCallback(() => {
    setSavedPositions([]);
    setHasCustomLayout(false);
  }, []);

  // Convert workflow data to simulation-compatible format
  const { nodes, links } = useMemo(() => {
    if (!workflowData || workflowData.nodes.length === 0) {
      return { nodes: [] as SimNode[], links: [] as { source: string; target: string; value: number }[] };
    }

    const simNodes: SimNode[] = workflowData.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      value: node.value,
      category: node.category,
      color: getCategoryColor(node.category),
    }));

    const simLinks = workflowData.links.map((link) => ({
      source: link.source,
      target: link.target,
      value: link.value,
    }));

    return { nodes: simNodes, links: simLinks };
  }, [workflowData]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 400;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Create gradient definitions
    const defs = svg.append("defs");
    nodes.forEach((node, i) => {
      const gradient = defs.append("radialGradient").attr("id", `customNodeGrad${i}`);
      gradient.append("stop").attr("offset", "0%").attr("stop-color", node.color).attr("stop-opacity", 1);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", node.color).attr("stop-opacity", 0.6);
    });

    // Arrow marker for directed links
    defs
      .append("marker")
      .attr("id", "customArrowhead")
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

    // Create node copies with saved positions
    const nodesCopy: SimNode[] = nodes.map((d) => {
      const savedPos = savedPositions.find((p) => p.id === d.id);
      return {
        ...d,
        x: savedPos?.x ?? undefined,
        y: savedPos?.y ?? undefined,
        fx: savedPos?.x ?? undefined,
        fy: savedPos?.y ?? undefined,
      };
    });

    const linksCopy = links.map((d) => ({ ...d }));

    // Create force simulation
    const simulation = d3
      .forceSimulation<SimNode>(nodesCopy)
      .force(
        "link",
        d3
          .forceLink<SimNode, d3.SimulationLinkDatum<SimNode>>(linksCopy as any)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", savedPositions.length > 0 ? null : d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    simulationRef.current = simulation;

    // Draw links
    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linksCopy)
      .join("line")
      .attr("stroke", "hsl(var(--muted-foreground))")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => Math.max(2, Math.sqrt(d.value) * 0.3))
      .attr("marker-end", "url(#customArrowhead)");

    // Draw nodes
    const nodeGroup = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodesCopy)
      .join("g")
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            setIsDragging(true);
            d3.select(event.sourceEvent.target.closest("g")).style("cursor", "grabbing");
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = event.x;
            d.fy = event.y;
            setIsDragging(false);
            setHasCustomLayout(true);
            d3.select(event.sourceEvent.target.closest("g")).style("cursor", "grab");
            const newPositions = nodesCopy.map((n) => ({
              id: n.id,
              x: n.x!,
              y: n.y!,
            }));
            setSavedPositions(newPositions);
          })
      );

    // Add circles to node groups
    nodeGroup
      .append("circle")
      .attr("r", (d) => Math.max(25, Math.sqrt(d.value) * 2 + 15))
      .attr("fill", (_, i) => `url(#customNodeGrad${i})`)
      .attr("stroke", "hsl(var(--background))")
      .attr("stroke-width", 3);

    // Add labels to node groups
    nodeGroup
      .append("text")
      .text((d) => (d.label.length > 15 ? d.label.slice(0, 12) + "..." : d.label))
      .attr("font-size", 11)
      .attr("font-weight", 500)
      .attr("fill", "hsl(var(--foreground))")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .style("pointer-events", "none");

    // Tooltip events on node groups
    nodeGroup
      .on("mouseenter", (event, d) => {
        const rect = container.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: `${d.label}: ${d.value} (${d.category})`,
        });
        d3.select(event.currentTarget).select("circle").attr("stroke", "hsl(var(--primary))").attr("stroke-width", 4);
      })
      .on("mouseleave", (event) => {
        setTooltip(null);
        d3.select(event.currentTarget).select("circle").attr("stroke", "hsl(var(--background))").attr("stroke-width", 3);
      });

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d) => {
        d.x = Math.max(40, Math.min(width - 40, d.x!));
        d.y = Math.max(40, Math.min(height - 40, d.y!));
        return `translate(${d.x}, ${d.y})`;
      });
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, zoom, savedPositions]);

  if (!workflowData || workflowData.nodes.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-secondary/30 rounded-xl">
        <div className="text-center text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No workflow data. Add nodes and connections in the builder above.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] relative bg-secondary/30 rounded-xl overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
    >
      {/* Header badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
        <Monitor className="w-4 h-4 text-primary" />
        <span className="text-xs text-primary font-medium">Custom Workflow 2D</span>
        <span className="text-xs text-muted-foreground">
          • {workflowData.nodes.length} nodes • {workflowData.links.length} connections
        </span>
        {hasCustomLayout && <span className="text-xs text-primary/70 ml-1">• Custom Layout</span>}
      </div>

      <svg ref={svgRef} className="w-full h-full" />

      {/* Tooltip */}
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
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
                <span className="text-xs text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {isDragging && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/20 border border-primary/30">
            <Move className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs text-primary">Dragging...</span>
          </div>
        )}
        {hasCustomLayout && !isDragging && (
          <Button variant="outline" size="sm" onClick={resetLayout} className="h-7 text-xs gap-1.5">
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

export default CustomWorkflow2D;
