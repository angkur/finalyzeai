import { Play, Pause, RotateCcw, Trash2, Radio, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

interface RealtimeControlsProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  onReset: () => void;
  onClear: () => void;
  streamStats: {
    dataPointsReceived: number;
    lastUpdateTime: Date | null;
    streamDuration: number;
  };
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  maxDataPoints: number;
  onMaxDataPointsChange: (max: number) => void;
}

const RealtimeControls = ({
  isStreaming,
  onToggleStream,
  onReset,
  onClear,
  streamStats,
  intervalMs,
  onIntervalChange,
  maxDataPoints,
  onMaxDataPointsChange,
}: RealtimeControlsProps) => {
  const [localInterval, setLocalInterval] = useState(intervalMs);
  const [localMaxPoints, setLocalMaxPoints] = useState(maxDataPoints);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleIntervalChange = (value: number[]) => {
    setLocalInterval(value[0]);
  };

  const handleIntervalCommit = () => {
    onIntervalChange(localInterval);
  };

  const handleMaxPointsChange = (value: number[]) => {
    setLocalMaxPoints(value[0]);
  };

  const handleMaxPointsCommit = () => {
    onMaxDataPointsChange(localMaxPoints);
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {/* Streaming Status Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50 border border-border/30">
          <Radio 
            className={`w-3 h-3 ${isStreaming ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} 
          />
          <span className="text-xs font-medium">
            {isStreaming ? 'Live' : 'Paused'}
          </span>
        </div>

        {/* Play/Pause Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleStream}
              className={`h-8 w-8 p-0 ${isStreaming ? 'border-green-500/50 text-green-500 hover:bg-green-500/10' : ''}`}
            >
              {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isStreaming ? 'Pause stream' : 'Start stream'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Stream Settings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-xs hidden sm:inline">Settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Stream Settings</h4>
              
              {/* Update Interval */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Update Interval</span>
                  <span className="font-medium">{localInterval}ms</span>
                </div>
                <Slider
                  value={[localInterval]}
                  min={100}
                  max={5000}
                  step={100}
                  onValueChange={handleIntervalChange}
                  onValueCommit={handleIntervalCommit}
                  disabled={isStreaming}
                />
                <p className="text-xs text-muted-foreground">
                  {isStreaming ? 'Stop stream to change' : 'How often to add new data'}
                </p>
              </div>

              {/* Max Data Points */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max Data Points</span>
                  <span className="font-medium">{localMaxPoints}</span>
                </div>
                <Slider
                  value={[localMaxPoints]}
                  min={10}
                  max={200}
                  step={10}
                  onValueChange={handleMaxPointsChange}
                  onValueCommit={handleMaxPointsCommit}
                />
                <p className="text-xs text-muted-foreground">
                  Older points will be removed
                </p>
              </div>

              {/* Stream Stats */}
              <div className="pt-2 border-t border-border/50 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Points received
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {streamStats.dataPointsReceived}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Stream duration
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {formatDuration(streamStats.streamDuration)}
                  </Badge>
                </div>
                {streamStats.lastUpdateTime && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last update</span>
                    <span className="font-mono text-xs">
                      {streamStats.lastUpdateTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-8 w-8 p-0"
              disabled={isStreaming}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset to original data</p>
          </TooltipContent>
        </Tooltip>

        {/* Clear Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="h-8 w-8 p-0 hover:text-destructive hover:border-destructive/50"
              disabled={isStreaming}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear all data</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default RealtimeControls;
