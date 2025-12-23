import { useEffect, useRef, useMemo, useState } from "react";

interface WordCloudProps {
  data: any[];
  config?: {
    textKey?: string;
    valueKey?: string;
    title?: string;
  };
  zoom?: number;
}

interface WordItem {
  text: string;
  value: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
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
  'hsl(220, 70%, 55%)',
  'hsl(60, 80%, 50%)',
];

const WordCloud = ({ data, config, zoom = 1 }: WordCloudProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredWord, setHoveredWord] = useState<WordItem | null>(null);

  const words = useMemo<WordItem[]>(() => {
    let wordData: { text: string; value: number }[] = [];

    if (!data || data.length === 0) {
      // Sample financial terms
      wordData = [
        { text: 'Investment', value: 100 },
        { text: 'Portfolio', value: 85 },
        { text: 'Risk', value: 75 },
        { text: 'Returns', value: 90 },
        { text: 'Diversification', value: 70 },
        { text: 'Analysis', value: 80 },
        { text: 'Market', value: 95 },
        { text: 'Growth', value: 82 },
        { text: 'Assets', value: 78 },
        { text: 'Revenue', value: 88 },
        { text: 'Equity', value: 65 },
        { text: 'Bonds', value: 55 },
        { text: 'Stocks', value: 72 },
        { text: 'Dividends', value: 60 },
        { text: 'Valuation', value: 68 },
        { text: 'Cash Flow', value: 76 },
        { text: 'Profit', value: 84 },
        { text: 'Capital', value: 70 },
        { text: 'Hedge', value: 50 },
        { text: 'Options', value: 58 },
        { text: 'Futures', value: 52 },
        { text: 'ETF', value: 62 },
        { text: 'Index', value: 66 },
        { text: 'Yield', value: 64 },
        { text: 'Liquidity', value: 56 },
        { text: 'Volatility', value: 74 },
        { text: 'Strategy', value: 77 },
        { text: 'Allocation', value: 63 },
        { text: 'Performance', value: 79 },
        { text: 'Benchmark', value: 54 },
      ];
    } else {
      const textKey = config?.textKey || 'text';
      const valueKey = config?.valueKey || 'value';
      
      wordData = data.map(item => ({
        text: String(item[textKey] || item.name || item.word || 'Unknown'),
        value: parseFloat(item[valueKey]) || Math.random() * 100,
      }));
    }

    // Sort by value descending
    wordData.sort((a, b) => b.value - a.value);

    // Limit to top 40 words
    wordData = wordData.slice(0, 40);

    // Calculate font sizes
    const maxValue = Math.max(...wordData.map(w => w.value));
    const minValue = Math.min(...wordData.map(w => w.value));
    const valueRange = maxValue - minValue || 1;

    // Simple spiral layout
    const width = 600;
    const height = 350;
    const centerX = width / 2;
    const centerY = height / 2;

    const placedWords: WordItem[] = [];
    const usedRects: { x: number; y: number; width: number; height: number }[] = [];

    wordData.forEach((word, index) => {
      const normalizedValue = (word.value - minValue) / valueRange;
      const fontSize = Math.round(14 + normalizedValue * 36);
      const rotation = Math.random() > 0.7 ? (Math.random() > 0.5 ? 90 : -90) : 0;
      
      // Estimate word dimensions
      const wordWidth = word.text.length * fontSize * 0.6;
      const wordHeight = fontSize * 1.2;

      // Spiral placement
      let placed = false;
      let angle = index * 0.5;
      let radius = 0;

      while (!placed && radius < 300) {
        const x = centerX + Math.cos(angle) * radius - wordWidth / 2;
        const y = centerY + Math.sin(angle) * radius - wordHeight / 2;

        const newRect = { x, y, width: wordWidth, height: wordHeight };
        
        // Check collision with existing words
        const hasCollision = usedRects.some(rect => 
          !(newRect.x + newRect.width < rect.x ||
            newRect.x > rect.x + rect.width ||
            newRect.y + newRect.height < rect.y ||
            newRect.y > rect.y + rect.height)
        );

        if (!hasCollision && x > 0 && x + wordWidth < width && y > 0 && y + wordHeight < height) {
          placedWords.push({
            text: word.text,
            value: word.value,
            x: x + wordWidth / 2,
            y: y + wordHeight / 2,
            fontSize,
            color: COLORS[index % COLORS.length],
            rotation,
          });
          usedRects.push(newRect);
          placed = true;
        }

        angle += 0.2;
        radius += 2;
      }
    });

    return placedWords;
  }, [data, config]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-[400px] relative bg-secondary/30 rounded-xl overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
    >
      <svg viewBox="0 0 600 350" className="w-full h-full">
        {words.map((word, i) => (
          <text
            key={i}
            x={word.x}
            y={word.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={word.fontSize}
            fill={word.color}
            transform={`rotate(${word.rotation}, ${word.x}, ${word.y})`}
            className="cursor-pointer transition-all duration-200 hover:opacity-80"
            style={{ 
              fontWeight: word.fontSize > 30 ? 700 : 500,
              opacity: hoveredWord && hoveredWord.text !== word.text ? 0.4 : 1,
            }}
            onMouseEnter={() => setHoveredWord(word)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            {word.text}
          </text>
        ))}
      </svg>
      
      {hoveredWord && (
        <div className="absolute top-4 right-4 bg-popover border border-border rounded-lg px-4 py-2 shadow-lg">
          <p className="font-medium text-foreground">{hoveredWord.text}</p>
          <p className="text-sm text-muted-foreground">
            Value: {hoveredWord.value.toFixed(0)}
          </p>
        </div>
      )}

      <p className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Hover words to see values • Larger words = higher values
      </p>
    </div>
  );
};

export default WordCloud;
