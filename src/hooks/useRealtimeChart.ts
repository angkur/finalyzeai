import { useState, useEffect, useCallback, useRef } from 'react';
import { ChartData } from '@/components/visualizations/ChartRenderer';

export interface StreamConfig {
  enabled: boolean;
  intervalMs: number;
  maxDataPoints: number;
  dataGenerator?: () => any;
  chartType?: ChartData['chartType'];
}

const defaultStreamConfig: StreamConfig = {
  enabled: false,
  intervalMs: 1000,
  maxDataPoints: 50,
};

export const useRealtimeChart = (
  initialData: ChartData | null,
  config: Partial<StreamConfig> = {}
) => {
  const streamConfig = { ...defaultStreamConfig, ...config };
  const [chartData, setChartData] = useState<ChartData | null>(initialData);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStats, setStreamStats] = useState({
    dataPointsReceived: 0,
    lastUpdateTime: null as Date | null,
    streamDuration: 0,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const dataPointCountRef = useRef(0);
  const timeSeriesIndexRef = useRef(0);

  // Generate chart-type-specific data
  const generateNewDataPoint = useCallback((chartType?: ChartData['chartType']) => {
    if (config.dataGenerator) {
      return config.dataGenerator();
    }

    const categories = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial'];
    const timestamp = new Date().toISOString();
    const value = Math.round(Math.random() * 10000000) + 1000000;
    const value2 = Math.round(Math.random() * 5000000) + 500000;

    // Time Series / Area chart - needs consistent time-based x-axis
    if (chartType === 'area') {
      timeSeriesIndexRef.current += 1;
      return {
        time: new Date().toLocaleTimeString(),
        timestamp,
        Revenue: Math.round(2000000 + Math.random() * 1500000),
        Expenses: Math.round(1200000 + Math.random() * 800000),
        Profit: Math.round(600000 + Math.random() * 500000),
      };
    }

    // Heatmap - needs consistent row/column structure with numeric values
    if (chartType === 'heatmap') {
      const metrics = ['Revenue', 'Expenses', 'Profit', 'Growth', 'Risk'];
      const row: any = {};
      metrics.forEach(metric => {
        row[metric] = parseFloat((Math.random() * 2 - 1).toFixed(2)); // -1 to 1 for correlation
      });
      return row;
    }

    // Dual Axis - needs two value series with time
    if (chartType === 'dualAxis') {
      return {
        time: new Date().toLocaleTimeString(),
        timestamp,
        value1: value,
        value2: value2,
        name: `Point ${dataPointCountRef.current + 1}`,
      };
    }

    // 3D Scatter - needs x, y, z coordinates
    if (chartType === 'scatter3d') {
      const category = categories[Math.floor(Math.random() * categories.length)];
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 100,
        category,
        name: category,
        size: value / 100000,
      };
    }

    // Network - needs source/target pairs with distinct nodes
    if (chartType === 'network') {
      const sourceIdx = Math.floor(Math.random() * categories.length);
      let targetIdx = Math.floor(Math.random() * categories.length);
      while (targetIdx === sourceIdx) {
        targetIdx = Math.floor(Math.random() * categories.length);
      }
      return {
        source: categories[sourceIdx],
        target: categories[targetIdx],
        value: Math.round(Math.random() * 100),
      };
    }

    // Sankey - needs source/target flow data (avoiding circular refs)
    if (chartType === 'sankey') {
      const stages = ['Awareness', 'Interest', 'Consideration', 'Intent', 'Purchase'];
      const stageIdx = Math.floor(Math.random() * (stages.length - 1));
      return {
        source: stages[stageIdx],
        target: stages[stageIdx + 1],
        value: Math.round(Math.random() * 1000) + 100,
      };
    }

    // Word Cloud - needs text and size/value
    if (chartType === 'wordcloud') {
      const words = ['Growth', 'Innovation', 'Strategy', 'Revenue', 'Profit', 'Market', 'Investment', 'Technology', 'Finance', 'Analytics', 'Performance', 'Success'];
      const word = words[Math.floor(Math.random() * words.length)];
      return {
        text: word,
        name: word,
        value: Math.round(Math.random() * 100) + 10,
        size: Math.round(Math.random() * 100) + 10,
      };
    }

    // Treemap - needs hierarchical-like data with name and value
    if (chartType === 'treemap') {
      const category = categories[Math.floor(Math.random() * categories.length)];
      return {
        name: category,
        value: value,
        category: category,
      };
    }

    // Default for bar/pie charts
    const category = categories[Math.floor(Math.random() * categories.length)];
    return {
      name: category,
      label: category,
      text: category,
      value,
      value1: value,
      value2: value2,
      size: value,
      timestamp,
      time: new Date().toLocaleTimeString(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      category,
      source: categories[Math.floor(Math.random() * categories.length)],
      target: categories[Math.floor(Math.random() * categories.length)],
    };
  }, [config.dataGenerator]);

  // Start streaming
  const startStream = useCallback(() => {
    if (isStreaming || !chartData) return;

    setIsStreaming(true);
    startTimeRef.current = new Date();
    dataPointCountRef.current = 0;
    timeSeriesIndexRef.current = 0;

    const activeChartType = streamConfig.chartType || chartData.chartType;

    intervalRef.current = setInterval(() => {
      const newPoint = generateNewDataPoint(activeChartType);
      dataPointCountRef.current += 1;

      setChartData((prev) => {
        if (!prev) return prev;

        const newData = [...prev.data, newPoint];
        
        // Limit data points to maxDataPoints
        const trimmedData = newData.slice(-streamConfig.maxDataPoints);

        return {
          ...prev,
          data: trimmedData,
        };
      });

      setStreamStats({
        dataPointsReceived: dataPointCountRef.current,
        lastUpdateTime: new Date(),
        streamDuration: startTimeRef.current
          ? Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
          : 0,
      });
    }, streamConfig.intervalMs);
  }, [isStreaming, chartData, generateNewDataPoint, streamConfig.intervalMs, streamConfig.maxDataPoints, streamConfig.chartType]);

  // Stop streaming
  const stopStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Toggle streaming
  const toggleStream = useCallback(() => {
    if (isStreaming) {
      stopStream();
    } else {
      startStream();
    }
  }, [isStreaming, startStream, stopStream]);

  // Add single data point manually
  const addDataPoint = useCallback((dataPoint: any) => {
    setChartData((prev) => {
      if (!prev) return prev;

      const newData = [...prev.data, dataPoint].slice(-streamConfig.maxDataPoints);

      return {
        ...prev,
        data: newData,
      };
    });

    setStreamStats((prev) => ({
      ...prev,
      dataPointsReceived: prev.dataPointsReceived + 1,
      lastUpdateTime: new Date(),
    }));
  }, [streamConfig.maxDataPoints]);

  // Clear all data
  const clearData = useCallback(() => {
    setChartData((prev) => {
      if (!prev) return prev;
      return { ...prev, data: [] };
    });
    setStreamStats({
      dataPointsReceived: 0,
      lastUpdateTime: null,
      streamDuration: 0,
    });
    dataPointCountRef.current = 0;
  }, []);

  // Reset to initial data
  const resetData = useCallback(() => {
    setChartData(initialData);
    setStreamStats({
      dataPointsReceived: 0,
      lastUpdateTime: null,
      streamDuration: 0,
    });
    dataPointCountRef.current = 0;
  }, [initialData]);

  // Update chart data from external source
  const updateChartData = useCallback((newChartData: ChartData) => {
    setChartData(newChartData);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sync with initial data changes
  useEffect(() => {
    if (initialData && !isStreaming) {
      setChartData(initialData);
    }
  }, [initialData, isStreaming]);

  return {
    chartData,
    isStreaming,
    streamStats,
    startStream,
    stopStream,
    toggleStream,
    addDataPoint,
    clearData,
    resetData,
    updateChartData,
  };
};

export default useRealtimeChart;
