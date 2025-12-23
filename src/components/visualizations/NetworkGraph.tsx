import { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";

interface NetworkGraphProps {
  data: any[];
  config?: {
    nodeKey?: string;
    linkSourceKey?: string;
    linkTargetKey?: string;
    valueKey?: string;
    title?: string;
  };
  zoom?: number;
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  value: number;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  value: number;
}

const COLORS = [
  'hsl(200, 80%, 50%)',
  'hsl(45, 90%, 55%)',
  'hsl(160, 70%, 45%)',
  'hsl(280, 60%, 55%)',
  'hsl(350, 75%, 55%)',
  'hsl(180, 65%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(120, 60%, 45%)',
];

const NetworkGraph = ({ data, config, zoom = 1 }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const { nodes, links } = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample network data
      const sampleNodes: NetworkNode[] = [
        { id: 'Technology', group: 0, value: 100 },
        { id: 'AI/ML', group: 0, value: 80 },
        { id: 'Blockchain', group: 0, value: 60 },
        { id: 'Cloud', group: 0, value: 70 },
        { id: 'Finance', group: 1, value: 90 },
        { id: 'Banking', group: 1, value: 75 },
        { id: 'Fintech', group: 1, value: 65 },
        { id: 'Insurance', group: 1, value: 55 },
        { id: 'Healthcare', group: 2, value: 85 },
        { id: 'Pharma', group: 2, value: 70 },
        { id: 'Biotech', group: 2, value: 60 },
        { id: 'Energy', group: 3, value: 75 },
        { id: 'Renewable', group: 3, value: 50 },
        { id: 'Oil & Gas', group: 3, value: 40 },
      ];

      const sampleLinks: NetworkLink[] = [
        { source: 'Technology', target: 'AI/ML', value: 8 },
        { source: 'Technology', target: 'Blockchain', value: 6 },
        { source: 'Technology', target: 'Cloud', value: 9 },
        { source: 'Technology', target: 'Finance', value: 5 },
        { source: 'Finance', target: 'Banking', value: 7 },
        { source: 'Finance', target: 'Fintech', value: 8 },
        { source: 'Finance', target: 'Insurance', value: 5 },
        { source: 'Fintech', target: 'Blockchain', value: 6 },
        { source: 'Fintech', target: 'AI/ML', value: 7 },
        { source: 'Healthcare', target: 'Pharma', value: 8 },
        { source: 'Healthcare', target: 'Biotech', value: 7 },
        { source: 'Healthcare', target: 'AI/ML', value: 4 },
        { source: 'Biotech', target: 'Pharma', value: 6 },
        { source: 'Energy', target: 'Renewable', value: 6 },
        { source: 'Energy', target: 'Oil & Gas', value: 5 },
        { source: 'Technology', target: 'Energy', value: 3 },
        { source: 'Cloud', target: 'Healthcare', value: 4 },
      ];

      return { nodes: sampleNodes, links: sampleLinks };
    }

    // Parse provided data
    const nodeKey = config?.nodeKey || 'id';
    const linkSourceKey = config?.linkSourceKey || 'source';
    const linkTargetKey = config?.linkTargetKey || 'target';
    const valueKey = config?.valueKey || 'value';

    // Check if data has nodes and links structure
    if (data[0]?.nodes && data[0]?.links) {
      return {
        nodes: data[0].nodes.map((n: Record<string, unknown>, i: number) => ({
          id: String(n[nodeKey] || n.id || `node${i}`),
          group: Number(n.group) || 0,
          value: Number(n[valueKey]) || 50,
        })),
        links: data[0].links.map((l: Record<string, unknown>) => ({
          source: String(l[linkSourceKey] || l.source),
          target: String(l[linkTargetKey] || l.target),
          value: Number(l[valueKey]) || 1,
        })),
      };
    }

    // Try to extract network from flat data
    const nodeSet = new Set<string>();
    const extractedLinks: NetworkLink[] = [];

    data.forEach((item) => {
      const source = item[linkSourceKey];
      const target = item[linkTargetKey];
      if (source && target) {
        nodeSet.add(source);
        nodeSet.add(target);
        extractedLinks.push({
          source,
          target,
          value: item[valueKey] || 1,
        });
      }
    });

    const extractedNodes: NetworkNode[] = Array.from(nodeSet).map((id, i) => ({
      id,
      group: i % 4,
      value: 50,
    }));

    return { nodes: extractedNodes, links: extractedLinks };
  }, [data, config]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Create a copy of nodes and links for simulation
    const nodesCopy: NetworkNode[] = nodes.map(d => ({ ...d }));
    const linksCopy: NetworkLink[] = links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation<NetworkNode>(nodesCopy)
      .force("link", d3.forceLink<NetworkNode, NetworkLink>(linksCopy).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Add gradient definitions
    const defs = svg.append("defs");
    
    COLORS.forEach((color, i) => {
      const gradient = defs.append("radialGradient")
        .attr("id", `nodeGradient${i}`);
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 1);
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.6);
    });

    // Draw links
    const link = svg.append("g")
      .selectAll<SVGLineElement, NetworkLink>("line")
      .data(linksCopy)
      .join("line")
      .attr("stroke", "hsl(var(--muted-foreground))")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Draw nodes
    const node = svg.append("g")
      .selectAll<SVGCircleElement, NetworkNode>("circle")
      .data(nodesCopy)
      .join("circle")
      .attr("r", d => Math.sqrt(d.value) * 2 + 8)
      .attr("fill", d => `url(#nodeGradient${d.group % COLORS.length})`)
      .attr("stroke", "hsl(var(--background))")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag<SVGCircleElement, NetworkNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.on("mouseenter", (event, d) => {
      const rect = container.getBoundingClientRect();
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        content: `${d.id}: ${d.value}`,
      });
    }).on("mouseleave", () => {
      setTooltip(null);
    });

    // Draw labels
    const labels = svg.append("g")
      .selectAll<SVGTextElement, NetworkNode>("text")
      .data(nodesCopy)
      .join("text")
      .text(d => d.id.length > 12 ? d.id.slice(0, 10) + '...' : d.id)
      .attr("font-size", 10)
      .attr("fill", "hsl(var(--foreground))")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as NetworkNode).x!)
        .attr("y1", d => (d.source as NetworkNode).y!)
        .attr("x2", d => (d.target as NetworkNode).x!)
        .attr("y2", d => (d.target as NetworkNode).y!);

      node
        .attr("cx", d => d.x = Math.max(20, Math.min(width - 20, d.x!)))
        .attr("cy", d => d.y = Math.max(20, Math.min(height - 20, d.y!)));

      labels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, zoom]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-[400px] relative bg-secondary/30 rounded-xl overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
    >
      <svg ref={svgRef} className="w-full h-full" />
      {tooltip && (
        <div 
          className="absolute pointer-events-none bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.content}
        </div>
      )}
      <p className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Drag nodes to rearrange • Hover for details
      </p>
    </div>
  );
};

export default NetworkGraph;
