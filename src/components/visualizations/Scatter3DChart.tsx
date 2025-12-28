import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface Scatter3DChartProps {
  data: any[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    zAxis?: string;
    colorKey?: string;
    sizeKey?: string;
    title?: string;
  };
  zoom?: number;
}

interface DataPoint {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  label: string;
  original: any;
}

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#22c55e', // green
];

function DataPointMesh({ point, onHover }: { point: DataPoint; onHover: (point: DataPoint | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.5 : 1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[point.x, point.y, point.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(point);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      <sphereGeometry args={[point.size * 0.15, 16, 16]} />
      <meshStandardMaterial
        color={point.color}
        emissive={point.color}
        emissiveIntensity={hovered ? 0.5 : 0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function AxisLines() {
  return (
    <group>
      {/* X axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-5, -5, -5, 5, -5, -5])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666" />
      </line>
      {/* Y axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-5, -5, -5, -5, 5, -5])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666" />
      </line>
      {/* Z axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-5, -5, -5, -5, -5, 5])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666" />
      </line>

      {/* Grid */}
      <gridHelper args={[10, 10, '#333', '#222']} position={[0, -5, 0]} />

      {/* Axis labels */}
      <Text position={[5.5, -5, -5]} fontSize={0.4} color="#888">X</Text>
      <Text position={[-5, 5.5, -5]} fontSize={0.4} color="#888">Y</Text>
      <Text position={[-5, -5, 5.5]} fontSize={0.4} color="#888">Z</Text>
    </group>
  );
}

function Scene({ points }: { points: DataPoint[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <AxisLines />

      {points.map((point, i) => (
        <DataPointMesh key={i} point={point} onHover={setHoveredPoint} />
      ))}

      {hoveredPoint && (
        <Html position={[hoveredPoint.x, hoveredPoint.y + 0.5, hoveredPoint.z]}>
          <div className="bg-popover border border-border rounded-lg p-2 text-xs whitespace-nowrap pointer-events-none">
            <p className="font-medium text-foreground">{hoveredPoint.label}</p>
            <p className="text-muted-foreground">
              X: {hoveredPoint.original.x?.toFixed(2)} | Y: {hoveredPoint.original.y?.toFixed(2)} | Z: {hoveredPoint.original.z?.toFixed(2)}
            </p>
          </div>
        </Html>
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
}

const Scatter3DChart = ({ data, config, zoom = 1 }: Scatter3DChartProps) => {
  const points = useMemo<DataPoint[]>(() => {
    // Check if data has valid content (not just empty objects)
    const hasValidData = data && data.length > 0 && data.some(item => 
      item && typeof item === 'object' && Object.keys(item).length > 0 &&
      (item.x !== undefined || item.y !== undefined || item.name || item.value)
    );

    if (!hasValidData) {
      // Generate sample 3D data
      const sampleData: DataPoint[] = [];
      const categories = ['Tech', 'Finance', 'Healthcare', 'Energy'];
      
      for (let i = 0; i < 50; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const x = (Math.random() - 0.5) * 8;
        const y = (Math.random() - 0.5) * 8;
        const z = (Math.random() - 0.5) * 8;
        
        sampleData.push({
          x,
          y,
          z,
          color: CATEGORY_COLORS[categories.indexOf(category)],
          size: 0.5 + Math.random() * 1.5,
          label: `${category} Asset ${i + 1}`,
          original: { x, y, z, category },
        });
      }
      
      return sampleData;
    }

    // Filter out empty objects
    const validData = data.filter(item => 
      item && typeof item === 'object' && Object.keys(item).length > 0
    );

    // Normalize real data to fit in -5 to 5 range
    const xKey = config?.xAxis || 'x';
    const yKey = config?.yAxis || 'y';
    const zKey = config?.zAxis || 'z';
    const colorKey = config?.colorKey || 'category';
    const sizeKey = config?.sizeKey || 'size';

    // Try to extract x, y, z or fall back to generated values
    const xValues = validData.map((d, i) => parseFloat(d[xKey]) || parseFloat(d.value) || i * 10);
    const yValues = validData.map((d, i) => parseFloat(d[yKey]) || parseFloat(d.value) * 0.5 || i * 5);
    const zValues = validData.map((d, i) => parseFloat(d[zKey]) || parseFloat(d.value) * 0.3 || i * 3);

    const normalize = (values: number[]) => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      return values.map(v => ((v - min) / range) * 10 - 5);
    };

    const normalizedX = normalize(xValues);
    const normalizedY = normalize(yValues);
    const normalizedZ = normalize(zValues);

    const categories = [...new Set(validData.map(d => d[colorKey] || d.name || d.label || 'Default'))];

    return validData.map((item, i) => ({
      x: normalizedX[i],
      y: normalizedY[i],
      z: normalizedZ[i],
      color: CATEGORY_COLORS[categories.indexOf(item[colorKey] || item.name || item.label || 'Default') % CATEGORY_COLORS.length],
      size: parseFloat(item[sizeKey]) || 1,
      label: item.name || item.label || `Point ${i + 1}`,
      original: item,
    }));
  }, [data, config]);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden bg-secondary/50" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
      <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
        <Scene points={points} />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Drag to rotate • Scroll to zoom • Click points for details
      </div>
    </div>
  );
};

export default Scatter3DChart;
