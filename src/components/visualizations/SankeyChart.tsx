import { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from "d3-sankey";

interface SankeyChartProps {
  data: any[];
  config?: {
    sourceKey?: string;
    targetKey?: string;
    valueKey?: string;
    title?: string;
  };
  zoom?: number;
}

interface SNode {
  name: string;
  category?: number;
}

interface SLink {
  source: number;
  target: number;
  value: number;
}

type SankeyNodeExtended = SankeyNode<SNode, SLink>;
type SankeyLinkExtended = SankeyLink<SNode, SLink>;

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

const SankeyChart = ({ data, config, zoom = 1 }: SankeyChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const { nodes, links } = useMemo(() => {
    if (!data || data.length === 0) {
      // Sample Sankey data - financial flow
      const sampleNodes: SNode[] = [
        { name: 'Revenue', category: 0 },
        { name: 'Products', category: 1 },
        { name: 'Services', category: 1 },
        { name: 'Licensing', category: 1 },
        { name: 'Operating Costs', category: 2 },
        { name: 'R&D', category: 2 },
        { name: 'Marketing', category: 2 },
        { name: 'Net Profit', category: 3 },
        { name: 'Dividends', category: 4 },
        { name: 'Reinvestment', category: 4 },
      ];

      const sampleLinks: SLink[] = [
        { source: 0, target: 1, value: 450 },
        { source: 0, target: 2, value: 350 },
        { source: 0, target: 3, value: 200 },
        { source: 1, target: 4, value: 180 },
        { source: 1, target: 5, value: 120 },
        { source: 1, target: 7, value: 150 },
        { source: 2, target: 4, value: 140 },
        { source: 2, target: 6, value: 100 },
        { source: 2, target: 7, value: 110 },
        { source: 3, target: 5, value: 80 },
        { source: 3, target: 7, value: 120 },
        { source: 7, target: 8, value: 150 },
        { source: 7, target: 9, value: 230 },
      ];

      return { nodes: sampleNodes, links: sampleLinks };
    }

    const sourceKey = config?.sourceKey || 'source';
    const targetKey = config?.targetKey || 'target';
    const valueKey = config?.valueKey || 'value';

    // Build nodes and links from data
    const nodeNames = new Set<string>();
    data.forEach(d => {
      if (d[sourceKey]) nodeNames.add(d[sourceKey]);
      if (d[targetKey]) nodeNames.add(d[targetKey]);
    });

    const nodeArray = Array.from(nodeNames);
    const parsedNodes: SNode[] = nodeArray.map((name, i) => ({ 
      name, 
      category: Math.floor(i / Math.ceil(nodeArray.length / 4)) 
    }));

    const parsedLinks: SLink[] = data
      .filter(d => d[sourceKey] && d[targetKey])
      .map(d => ({
        source: nodeArray.indexOf(d[sourceKey]),
        target: nodeArray.indexOf(d[targetKey]),
        value: parseFloat(d[valueKey]) || 1,
      }));

    return { nodes: parsedNodes, links: parsedLinks };
  }, [data, config]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create sankey generator
    const sankeyGenerator = sankey<SNode, SLink>()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    // Generate layout
    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d })),
    });

    // Add gradient definitions
    const defs = svg.append("defs");

    sankeyLinks.forEach((link, i) => {
      const sourceNode = link.source as SankeyNodeExtended;
      const targetNode = link.target as SankeyNodeExtended;
      
      const gradient = defs.append("linearGradient")
        .attr("id", `linkGradient${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", sourceNode.x1)
        .attr("x2", targetNode.x0);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", COLORS[(sourceNode.category || 0) % COLORS.length])
        .attr("stop-opacity", 0.5);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", COLORS[(targetNode.category || 0) % COLORS.length])
        .attr("stop-opacity", 0.5);
    });

    // Draw links
    svg.append("g")
      .selectAll<SVGPathElement, SankeyLinkExtended>("path")
      .data(sankeyLinks)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (_, i) => `url(#linkGradient${i})`)
      .attr("stroke-width", d => Math.max(1, d.width || 1))
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const rect = container.getBoundingClientRect();
        const sourceNode = d.source as SankeyNodeExtended;
        const targetNode = d.target as SankeyNodeExtended;
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: `${sourceNode.name} → ${targetNode.name}: ${d.value.toLocaleString()}`,
        });
      })
      .on("mouseleave", () => setTooltip(null));

    // Draw nodes
    svg.append("g")
      .selectAll<SVGRectElement, SankeyNodeExtended>("rect")
      .data(sankeyNodes)
      .join("rect")
      .attr("x", d => d.x0!)
      .attr("y", d => d.y0!)
      .attr("width", d => d.x1! - d.x0!)
      .attr("height", d => Math.max(1, d.y1! - d.y0!))
      .attr("fill", d => COLORS[(d.category || 0) % COLORS.length])
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const rect = container.getBoundingClientRect();
        const value = d.value || 0;
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: `${d.name}: ${value.toLocaleString()}`,
        });
      })
      .on("mouseleave", () => setTooltip(null));

    // Draw labels
    svg.append("g")
      .selectAll<SVGTextElement, SankeyNodeExtended>("text")
      .data(sankeyNodes)
      .join("text")
      .attr("x", d => d.x0! < width / 2 ? d.x0! - 6 : d.x1! + 6)
      .attr("y", d => (d.y0! + d.y1!) / 2)
      .attr("text-anchor", d => d.x0! < width / 2 ? "end" : "start")
      .attr("dy", "0.35em")
      .attr("font-size", 11)
      .attr("fill", "hsl(var(--foreground))")
      .text(d => d.name.length > 15 ? d.name.slice(0, 12) + '...' : d.name);

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
          className="absolute pointer-events-none bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-lg z-10"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.content}
        </div>
      )}
      <p className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Hover to see flow values
      </p>
    </div>
  );
};

export default SankeyChart;
