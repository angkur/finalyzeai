import { useState, useEffect, useCallback, useRef } from 'react';
import { ChartData } from '@/components/visualizations/ChartRenderer';

export interface StreamConfig {
  enabled: boolean;
  intervalMs: number;
  maxDataPoints: number;
  dataGenerator?: () => any;
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

  // Default data generator based on chart type
  const generateNewDataPoint = useCallback(() => {
    if (config.dataGenerator) {
      return config.dataGenerator();
    }

    // Generate data based on chart type
    const timestamp = new Date().toISOString();
    const value = Math.round(Math.random() * 100);
    
    return {
      timestamp,
      time: new Date().toLocaleTimeString(),
      value,
      metric: `Metric ${Math.floor(Math.random() * 5) + 1}`,
      category: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
    };
  }, [config.dataGenerator]);

  // Start streaming
  const startStream = useCallback(() => {
    if (isStreaming || !chartData) return;

    setIsStreaming(true);
    startTimeRef.current = new Date();
    dataPointCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      const newPoint = generateNewDataPoint();
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
  }, [isStreaming, chartData, generateNewDataPoint, streamConfig.intervalMs, streamConfig.maxDataPoints]);

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
