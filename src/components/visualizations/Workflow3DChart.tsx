import { useRef, useState, useMemo, useEffect } from 'react';
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

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green  
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

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
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {node.label}
        </Text>
        <Text
          position={[0, nodeSize + 0.1, 0]}
          fontSize={0.12}
          color="#9ca3af"
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
  
  // Process data into workflow nodes and links
  const { nodes, links } = useMemo(() => {
    const processedNodes: WorkflowNode[] = [];
    const processedLinks: WorkflowLink[] = [];
    
    console.log('Workflow3DChart received data:', data);
    console.log('Workflow3DChart config:', config);
    
    // Auto-detect keys from data
    const detectKeys = (items: any[]) => {
      if (!items || items.length === 0) return { nodeKey: 'name', valueKey: 'value', categoryKey: 'category' };
      
      const sample = items[0];
      const keys = Object.keys(sample);
      
      // Try common name/label keys
      const nodeKey = keys.find(k => 
        ['name', 'label', 'id', 'title', 'step', 'node', 'stage', 'scripps', 'symbol', 'stock'].includes(k.toLowerCase())
      ) || keys[0];
      
      // Try common value keys
      const valueKey = keys.find(k => 
        ['value', 'amount', 'count', 'total', 'volume', 'trading_volume', 'quantity', 'size'].includes(k.toLowerCase())
      ) || keys.find(k => typeof sample[k] === 'number') || 'value';
      
      // Try common category keys
      const categoryKey = keys.find(k => 
        ['category', 'type', 'group', 'status', 'phase', 'stage'].includes(k.toLowerCase())
      ) || 'category';
      
      return { nodeKey, valueKey, categoryKey };
    };
    
    const detectedKeys = detectKeys(data);
    const nodeKey = config?.nodeKey || detectedKeys.nodeKey;
    const valueKey = config?.valueKey || detectedKeys.valueKey;
    const categoryKey = config?.categoryKey || detectedKeys.categoryKey;
    const sourceKey = config?.sourceKey || 'source';
    const targetKey = config?.targetKey || 'target';
    
    console.log('Using keys:', { nodeKey, valueKey, categoryKey, sourceKey, targetKey });
    
    if (!data || data.length === 0) {
      // Generate sample workflow data
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
      
      // Position nodes in 3D space (layered layout)
      const categories = [...new Set(sampleNodes.map(n => n.category))];
      
      sampleNodes.forEach((node, i) => {
        const categoryIndex = categories.indexOf(node.category);
        const nodesInCategory = sampleNodes.filter(n => n.category === node.category);
        const indexInCategory = nodesInCategory.indexOf(node);
        
        const x = (categoryIndex - categories.length / 2) * 2;
        const y = (indexInCategory - nodesInCategory.length / 2) * 1.5;
        const z = (i % 2) * 0.5 - 0.25;
        
        processedNodes.push({
          ...node,
          position: new THREE.Vector3(x, y, z),
          color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
          connections: sampleLinks.filter(l => l.source === node.id).map(l => l.target),
        });
      });
      
      processedLinks.push(...sampleLinks);
      
      return { nodes: processedNodes, links: processedLinks };
    }
    
    // Check if data contains links (workflow structure)
    const hasLinks = data.some(item => item[sourceKey] && item[targetKey]);
    
    if (hasLinks) {
      // Process as workflow with links
      const nodeMap = new Map<string, { label: string; value: number; category: string }>();
      
      data.forEach(item => {
        const source = String(item[sourceKey]);
        const target = String(item[targetKey]);
        const value = Number(item[valueKey]) || 50;
        const category = item[categoryKey] || 'Process';
        
        if (!nodeMap.has(source)) {
          nodeMap.set(source, { label: source, value, category });
        }
        if (!nodeMap.has(target)) {
          nodeMap.set(target, { label: target, value: value * 0.9, category });
        }
        
        processedLinks.push({ source, target, value });
      });
      
      // Position nodes using force-directed layout simulation
      const nodeArray = Array.from(nodeMap.entries());
      const categories = [...new Set(nodeArray.map(([, n]) => n.category))];
      
      nodeArray.forEach(([id, node], i) => {
        const categoryIndex = categories.indexOf(node.category);
        const angle = (i / nodeArray.length) * Math.PI * 2;
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
          connections: processedLinks.filter(l => l.source === id).map(l => l.target),
        });
      });
    } else {
      // Process as flat node list - create a circular/flow layout
      // Get unique categories and sort data by value for better visualization
      const sortedData = [...data].sort((a, b) => {
        const valA = Number(a[valueKey]) || 0;
        const valB = Number(b[valueKey]) || 0;
        return valB - valA;
      });
      
      const categories = [...new Set(sortedData.map(item => item[categoryKey] || 'Data'))];
      const maxValue = Math.max(...sortedData.map(item => Number(item[valueKey]) || 1));
      
      console.log('Processing flat data:', { categories, maxValue, dataCount: sortedData.length });
      
      sortedData.forEach((item, i) => {
        const nodeLabel = String(item[nodeKey] || `Node ${i + 1}`);
        const id = `node_${i}_${nodeLabel.replace(/\s+/g, '_')}`;
        const category = String(item[categoryKey] || 'Data');
        const value = Number(item[valueKey]) || 50;
        const categoryIndex = categories.indexOf(category);
        
        // Circular layout for flat data - spread nodes around a circle
        const angle = (i / sortedData.length) * Math.PI * 2;
        const radius = 2.5 + (value / maxValue) * 0.5; // Vary radius by value
        
        processedNodes.push({
          id,
          label: nodeLabel,
          value,
          category,
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * 0.8, // Flatten the Y distribution
            Math.sin(angle) * radius * 0.4 // Add some depth
          ),
          color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
          connections: [],
        });
        
        // Create sequential links to form a flow
        if (i > 0) {
          processedLinks.push({
            source: processedNodes[i - 1].id,
            target: id,
            value,
          });
          processedNodes[i - 1].connections.push(id);
        }
      });
      
      // Close the loop if we have multiple nodes
      if (processedNodes.length > 2) {
        processedLinks.push({
          source: processedNodes[processedNodes.length - 1].id,
          target: processedNodes[0].id,
          value: processedNodes[0].value,
        });
        processedNodes[processedNodes.length - 1].connections.push(processedNodes[0].id);
      }
    }
    
    console.log('Processed nodes:', processedNodes.length);
    console.log('Processed links:', processedLinks.length);
    
    return { nodes: processedNodes, links: processedLinks };
  }, [data, config]);

  return (
    <div className="w-full h-[400px] relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
      <Canvas
        camera={{ position: [0, 2, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene
          nodes={nodes}
          links={links}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
        />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
        <div className="text-xs font-medium text-foreground mb-2">Workflow Categories</div>
        <div className="flex flex-wrap gap-2">
          {[...new Set(nodes.map(n => n.category))].map((category, i) => (
            <div key={category} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">{category}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/60 backdrop-blur-sm px-2 py-1 rounded">
        Drag to rotate • Scroll to zoom • Hover for details
      </div>
    </div>
  );
};

export default Workflow3DChart;
