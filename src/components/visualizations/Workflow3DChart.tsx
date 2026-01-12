import { Component, useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface Workflow3DChartProps {
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
}

interface WorkflowNode {
  id: string;
  label: string;
  value: number;
  category: string;
  position: THREE.Vector3;
  color: string;
  connections: string[];
}

interface WorkflowLink {
  source: string;
  target: string;
  value: number;
}

type Workflow3DProblem = {
  title: string;
  message: string;
};

type DataShapeSummary = {
  kind: 'array' | 'object' | 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'unknown';
  rows?: number;
  sampleKeys?: string[];
};

class ThreeErrorBoundary extends Component<
  {
    children: React.ReactNode;
    fallback: (error: Error) => React.ReactNode;
    onError?: (error: Error) => void;
  },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) return this.props.fallback(this.state.error);
    return this.props.children;
  }
}

const CATEGORY_COLORS = [
  'hsl(199 89% 48%)', // primary
  'hsl(162 72% 45%)', // green
  'hsl(45 93% 58%)',  // accent
  'hsl(0 84% 60%)',   // destructive
  'hsl(262 83% 66%)', // purple
  'hsl(330 81% 60%)', // pink
  'hsl(188 78% 41%)', // cyan
  'hsl(84 81% 44%)',  // lime
];

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const summarizeDataShape = (raw: unknown): DataShapeSummary => {
  if (raw === null) return { kind: 'null' };
  if (raw === undefined) return { kind: 'undefined' };
  if (Array.isArray(raw)) {
    const first = raw.find(isRecord);
    return {
      kind: 'array',
      rows: raw.length,
      sampleKeys: first ? Object.keys(first).slice(0, 30) : [],
    };
  }
  if (isRecord(raw)) {
    return { kind: 'object', sampleKeys: Object.keys(raw).slice(0, 30) };
  }
  if (typeof raw === 'string') return { kind: 'string' };
  if (typeof raw === 'number') return { kind: 'number' };
  if (typeof raw === 'boolean') return { kind: 'boolean' };
  return { kind: 'unknown' };
};

const coerceString = (v: unknown, fallback: string) => {
  if (v === null || v === undefined) return fallback;
  const s = typeof v === 'string' ? v : String(v);
  const trimmed = s.trim();
  return trimmed.length ? trimmed : fallback;
};

const coerceNumber = (v: unknown, fallback: number) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (v === null || v === undefined) return fallback;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
};

// 3D Node component
const WorkflowNodeMesh = ({ 
  node, 
  isHovered, 
  onHover 
}: { 
  node: WorkflowNode; 
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime + node.position.x) * 0.05;
      
      // Scale on hover
      const targetScale = isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    
    if (glowRef.current) {
      glowRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime + node.position.x) * 0.05;
      // Pulsing glow effect
      const pulseScale = 1.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });

  const nodeSize = Math.max(0.3, Math.min(0.8, node.value / 100));

  return (
    <group position={node.position}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 1.2, 16, 16]} />
        <meshBasicMaterial 
          color={node.color} 
          transparent 
          opacity={isHovered ? 0.3 : 0.15} 
        />
      </mesh>
      
      {/* Main node */}
      <mesh
        ref={meshRef}
        onPointerOver={() => onHover(node.id)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[nodeSize, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          metalness={0.4}
          roughness={0.3}
          emissive={node.color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* Label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, nodeSize + 0.3, 0]}
          fontSize={0.2}
          color="hsl(210 40% 98%)"
          anchorX="center"
          anchorY="middle"
        >
          {node.label}
        </Text>
        <Text
          position={[0, nodeSize + 0.1, 0]}
          fontSize={0.12}
          color="hsl(215 20% 65%)"
          anchorX="center"
          anchorY="middle"
        >
          {node.category}
        </Text>
      </Billboard>
      
      {/* Tooltip on hover */}
      {isHovered && (
        <Html position={[0, -nodeSize - 0.5, 0]} center>
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl min-w-[120px]">
            <div className="text-sm font-semibold text-foreground">{node.label}</div>
            <div className="text-xs text-muted-foreground">{node.category}</div>
            <div className="text-sm font-medium text-primary mt-1">
              Value: {node.value.toLocaleString()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Connection line with animation
const ConnectionLine = ({ 
  start, 
  end, 
  color,
  isHighlighted 
}: { 
  start: THREE.Vector3; 
  end: THREE.Vector3;
  color: string;
  isHighlighted: boolean;
}) => {
  const lineRef = useRef<any>(null);
  
  // Create curved line points
  const points = useMemo(() => {
    const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
    midPoint.y += 0.5; // Arc upward
    
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    return curve.getPoints(20);
  }, [start, end]);

  return (
    <Line
      ref={lineRef}
      points={points}
      color={isHighlighted ? '#60a5fa' : color}
      lineWidth={isHighlighted ? 3 : 1.5}
      transparent
      opacity={isHighlighted ? 1 : 0.5}
      dashed={false}
    />
  );
};

// Animated arrow particles along connections
const FlowParticle = ({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(Math.random());
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      progressRef.current += delta * 0.3;
      if (progressRef.current > 1) progressRef.current = 0;
      
      const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
      midPoint.y += 0.5;
      
      const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
      const point = curve.getPoint(progressRef.current);
      meshRef.current.position.copy(point);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Main scene component
const Scene = ({ nodes, links, hoveredNode, setHoveredNode }: { 
  nodes: WorkflowNode[]; 
  links: WorkflowLink[];
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Map node IDs to positions
  const nodePositions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    nodes.forEach(node => map.set(node.id, node.position));
    return map;
  }, [nodes]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} />
      
      {/* Grid floor */}
      <gridHelper args={[10, 20, '#374151', '#1f2937']} position={[0, -2, 0]} />
      
      {/* Connection lines */}
      {links.map((link, i) => {
        const startPos = nodePositions.get(link.source);
        const endPos = nodePositions.get(link.target);
        if (!startPos || !endPos) return null;
        
        const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;
        const sourceNode = nodes.find(n => n.id === link.source);
        
        return (
          <group key={`link-${i}`}>
            <ConnectionLine
              start={startPos}
              end={endPos}
              color={sourceNode?.color || '#60a5fa'}
              isHighlighted={isHighlighted}
            />
            <FlowParticle
              start={startPos}
              end={endPos}
              color={sourceNode?.color || '#60a5fa'}
            />
          </group>
        );
      })}
      
      {/* Workflow nodes */}
      {nodes.map((node) => (
        <WorkflowNodeMesh
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          onHover={setHoveredNode}
        />
      ))}
      
      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        autoRotate={!hoveredNode}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const Workflow3DChart = ({ data, config, zoom = 1 }: Workflow3DChartProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // WebGL availability check (avoid blank canvas on unsupported devices)
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    // Clear any prior render error when input changes
    setRenderError(null);
  }, [data, config]);

  const { nodes, links, problem, summary } = useMemo(() => {
    const summary = summarizeDataShape(data as unknown);

    // Validate input is an array of objects
    if (!Array.isArray(data)) {
      return {
        nodes: [] as WorkflowNode[],
        links: [] as WorkflowLink[],
        summary,
        problem: {
          title: 'Invalid visualization data',
          message: `workflow3d expects an array, but received: ${summary.kind}.`,
        } satisfies Workflow3DProblem,
      };
    }

    const safeItems = (data as unknown[]).filter(isRecord) as Record<string, unknown>[];

    if (data.length > 0 && safeItems.length === 0) {
      return {
        nodes: [] as WorkflowNode[],
        links: [] as WorkflowLink[],
        summary,
        problem: {
          title: 'Unsupported data rows',
          message: 'Your dataset rows are not objects (key/value pairs). Try uploading CSV/JSON that contains columns/fields.',
        } satisfies Workflow3DProblem,
      };
    }

    const processedNodes: WorkflowNode[] = [];
    const processedLinks: WorkflowLink[] = [];

    // Auto-detect keys from the first object row
    const detectKeys = (items: Record<string, unknown>[]) => {
      if (!items || items.length === 0) return { nodeKey: 'name', valueKey: 'value', categoryKey: 'category' };

      const sample = items[0];
      const keys = Object.keys(sample);

      const nodeKey =
        keys.find((k) =>
          ['name', 'label', 'id', 'title', 'step', 'node', 'stage', 'scrip', 'symbol', 'stock'].includes(k.toLowerCase())
        ) || keys[0];

      const valueKey =
        keys.find((k) => ['value', 'amount', 'count', 'total', 'volume', 'quantity', 'size'].includes(k.toLowerCase())) ||
        keys.find((k) => typeof (sample as any)[k] === 'number') ||
        'value';

      const categoryKey = keys.find((k) => ['category', 'type', 'group', 'status', 'phase', 'stage'].includes(k.toLowerCase())) ||
        'category';

      return { nodeKey, valueKey, categoryKey };
    };

    const detectedKeys = detectKeys(safeItems);
    const nodeKey = (config?.nodeKey || detectedKeys.nodeKey) as string;
    const valueKey = (config?.valueKey || detectedKeys.valueKey) as string;
    const categoryKey = (config?.categoryKey || detectedKeys.categoryKey) as string;
    const sourceKey = (config?.sourceKey || 'source') as string;
    const targetKey = (config?.targetKey || 'target') as string;

    // Empty input -> show sample (better than blank)
    if (!data || data.length === 0) {
      const sampleNodes = [
        { id: 'data_input', label: 'Data Input', value: 100, category: 'Input' },
        { id: 'validation', label: 'Validation', value: 95, category: 'Process' },
        { id: 'analysis', label: 'AI Analysis', value: 90, category: 'Process' },
        { id: 'prediction', label: 'Prediction', value: 85, category: 'AI' },
        { id: 'visualization', label: 'Visualization', value: 80, category: 'Output' },
        { id: 'report', label: 'Report Gen', value: 75, category: 'Output' },
        { id: 'decision', label: 'Decision', value: 70, category: 'Decision' },
      ];

      const sampleLinks = [
        { source: 'data_input', target: 'validation', value: 100 },
        { source: 'validation', target: 'analysis', value: 95 },
        { source: 'analysis', target: 'prediction', value: 90 },
        { source: 'analysis', target: 'visualization', value: 85 },
        { source: 'prediction', target: 'decision', value: 80 },
        { source: 'visualization', target: 'report', value: 75 },
        { source: 'report', target: 'decision', value: 70 },
      ];

      const categories = [...new Set(sampleNodes.map((n) => n.category))];
      sampleNodes.forEach((node, i) => {
        const categoryIndex = categories.indexOf(node.category);
        const nodesInCategory = sampleNodes.filter((n) => n.category === node.category);
        const indexInCategory = nodesInCategory.findIndex((n) => n.id === node.id);

        const x = (categoryIndex - categories.length / 2) * 2;
        const y = (indexInCategory - nodesInCategory.length / 2) * 1.5;
        const z = (i % 2) * 0.5 - 0.25;

        processedNodes.push({
          id: node.id,
          label: node.label,
          value: node.value,
          category: node.category,
          position: new THREE.Vector3(x, y, z),
          color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
          connections: sampleLinks.filter((l) => l.source === node.id).map((l) => l.target),
        });
      });

      processedLinks.push(...sampleLinks);

      return { nodes: processedNodes, links: processedLinks, problem: null as Workflow3DProblem | null, summary };
    }

    // Determine if this is link-based (source/target) or node-list data
    const hasLinks = safeItems.some((item) => item[sourceKey] != null && item[targetKey] != null);

    if (hasLinks) {
      const nodeMap = new Map<string, { label: string; value: number; category: string }>();

      safeItems.forEach((item) => {
        const source = coerceString(item[sourceKey], 'Source');
        const target = coerceString(item[targetKey], 'Mentioned');
        const value = Math.max(0, coerceNumber(item[valueKey], 50));
        const category = coerceString(item[categoryKey], 'Process');

        if (!nodeMap.has(source)) nodeMap.set(source, { label: source, value, category });
        if (!nodeMap.has(target)) nodeMap.set(target, { label: target, value: value * 0.9, category });

        processedLinks.push({ source, target, value });
      });

      const nodeArray = Array.from(nodeMap.entries());
      const categories = [...new Set(nodeArray.map(([, n]) => n.category))];

      nodeArray.forEach(([id, node], i) => {
        const categoryIndex = categories.indexOf(node.category);
        const angle = (i / Math.max(1, nodeArray.length)) * Math.PI * 2;
        const radius = 2 + categoryIndex * 0.5;

        processedNodes.push({
          id,
          label: node.label,
          value: node.value,
          category: node.category,
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * 0.5,
            (i % 3 - 1) * 0.5
          ),
          color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
          connections: processedLinks.filter((l) => l.source === id).map((l) => l.target),
        });
      });
    } else {
      // Flat data: create a simple sequential flow
      const sortedData = [...safeItems].sort((a, b) => {
        const valA = coerceNumber((a as any)[valueKey], 0);
        const valB = coerceNumber((b as any)[valueKey], 0);
        return valB - valA;
      });

      const categories = [...new Set(sortedData.map((item) => coerceString(item[categoryKey], 'Data')))];
      const maxValue = Math.max(...sortedData.map((item) => coerceNumber((item as any)[valueKey], 1)));

      sortedData.forEach((item, i) => {
        const nodeLabel = coerceString((item as any)[nodeKey], `Node ${i + 1}`);
        const id = `node_${i}_${nodeLabel.replace(/\s+/g, '_')}`;
        const category = coerceString(item[categoryKey], 'Data');
        const value = Math.max(0, coerceNumber((item as any)[valueKey], 50));
        const categoryIndex = categories.indexOf(category);

        const angle = (i / Math.max(1, sortedData.length)) * Math.PI * 2;
        const radius = 2.5 + (value / Math.max(1, maxValue)) * 0.5;

        processedNodes.push({
          id,
          label: nodeLabel,
          value,
          category,
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * 0.8,
            Math.sin(angle) * radius * 0.4
          ),
          color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
          connections: [],
        });

        if (i > 0) {
          processedLinks.push({ source: processedNodes[i - 1].id, target: id, value });
          processedNodes[i - 1].connections.push(id);
        }
      });

      if (processedNodes.length > 2) {
        processedLinks.push({
          source: processedNodes[processedNodes.length - 1].id,
          target: processedNodes[0].id,
          value: processedNodes[0].value,
        });
        processedNodes[processedNodes.length - 1].connections.push(processedNodes[0].id);
      }
    }

    if (processedNodes.length === 0) {
      return {
        nodes: [] as WorkflowNode[],
        links: [] as WorkflowLink[],
        summary,
        problem: {
          title: 'No nodes to render',
          message: 'The workflow generator could not extract any nodes from your uploaded data.',
        } satisfies Workflow3DProblem,
      };
    }

    return { nodes: processedNodes, links: processedLinks, problem: null as Workflow3DProblem | null, summary };
  }, [data, config]);

  const activeProblem: Workflow3DProblem | null = useMemo(() => {
    if (!webglSupported) {
      return {
        title: '3D not supported on this device',
        message: 'WebGL is unavailable. Try another browser/device or switch to a 2D chart type.',
      };
    }
    if (renderError) {
      return {
        title: '3D renderer crashed',
        message: renderError.message || 'An unknown rendering error occurred.',
      };
    }
    return problem;
  }, [problem, renderError, webglSupported]);

  return (
    <div className="w-full h-[400px] relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
      {activeProblem ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card/95 backdrop-blur-sm p-4 shadow-card">
            <div className="text-sm font-semibold text-foreground">{activeProblem.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{activeProblem.message}</div>

            <div className="mt-4 rounded-lg bg-secondary/30 border border-border/50 p-3">
              <div className="text-xs font-medium text-foreground">Received data shape</div>
              <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap break-words">
{JSON.stringify(
  {
    kind: summary.kind,
    rows: summary.rows,
    sampleKeys: summary.sampleKeys,
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Tip: for workflow3d, provide either <span className="text-foreground">source/target/value</span> columns (links) or <span className="text-foreground">name/value</span> (nodes).
            </div>
          </div>
        </div>
      ) : (
        <ThreeErrorBoundary
          onError={setRenderError}
          fallback={(error) => (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="w-full max-w-xl rounded-xl border border-border bg-card/95 backdrop-blur-sm p-4 shadow-card">
                <div className="text-sm font-semibold text-foreground">3D renderer crashed</div>
                <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
              </div>
            </div>
          )}
        >
          <Canvas camera={{ position: [0, 2, 6], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
            <Scene nodes={nodes} links={links} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />
          </Canvas>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="text-xs font-medium text-foreground mb-2">Workflow Categories</div>
            <div className="flex flex-wrap gap-2">
              {[...new Set(nodes.map((n) => n.category))].map((category, i) => (
                <div key={category} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">{category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/60 backdrop-blur-sm px-2 py-1 rounded">
            Drag to rotate • Scroll to zoom • Hover for details
          </div>
        </ThreeErrorBoundary>
      )}
    </div>
  );
};

export default Workflow3DChart;
