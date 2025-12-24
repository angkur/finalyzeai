import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Columns, Plus, X, Eye, Trash2 } from "lucide-react";
import { ChartData } from "./ChartRenderer";

export interface ComparisonDataset {
  id: string;
  name: string;
  data: any[];
  color: string;
  visible: boolean;
  createdAt: Date;
}

interface ChartComparisonProps {
  datasets: ComparisonDataset[];
  onAddDataset: (dataset: Omit<ComparisonDataset, 'id' | 'createdAt'>) => void;
  onRemoveDataset: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  currentChartData?: ChartData | null;
}

const DATASET_COLORS = [
  { name: "Blue", value: "hsl(221, 83%, 53%)" },
  { name: "Green", value: "hsl(142, 76%, 36%)" },
  { name: "Orange", value: "hsl(24, 95%, 53%)" },
  { name: "Purple", value: "hsl(262, 83%, 58%)" },
  { name: "Pink", value: "hsl(330, 81%, 60%)" },
  { name: "Cyan", value: "hsl(186, 91%, 43%)" },
];

const ChartComparison = ({
  datasets,
  onAddDataset,
  onRemoveDataset,
  onToggleVisibility,
  isCompareMode,
  onToggleCompareMode,
  currentChartData,
}: ChartComparisonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState("");
  const [newDatasetColor, setNewDatasetColor] = useState(DATASET_COLORS[0].value);
  const [dataSource, setDataSource] = useState<"current" | "manual">("current");
  const [manualData, setManualData] = useState("");

  const handleAddDataset = useCallback(() => {
    if (!newDatasetName.trim()) return;

    let data: any[] = [];
    
    if (dataSource === "current" && currentChartData?.data) {
      data = [...currentChartData.data];
    } else if (dataSource === "manual") {
      try {
        data = JSON.parse(manualData);
        if (!Array.isArray(data)) {
          data = [data];
        }
      } catch {
        return;
      }
    }

    if (data.length === 0) return;

    onAddDataset({
      name: newDatasetName.trim(),
      data,
      color: newDatasetColor,
      visible: true,
    });

    setNewDatasetName("");
    setManualData("");
    setIsDialogOpen(false);
  }, [newDatasetName, newDatasetColor, dataSource, manualData, currentChartData, onAddDataset]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isCompareMode ? "default" : "outline"}
        size="sm"
        onClick={onToggleCompareMode}
        className="h-8 text-xs gap-1.5"
      >
        <Columns className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Compare</span>
        {datasets.length > 0 && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
            {datasets.length}
          </Badge>
        )}
      </Button>

      {isCompareMode && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Dataset</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Comparison Dataset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="dataset-name">Dataset Name</Label>
                  <Input
                    id="dataset-name"
                    placeholder="e.g., Q1 2024 Data"
                    value={newDatasetName}
                    onChange={(e) => setNewDatasetName(e.target.value)}
                    maxLength={30}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dataset Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DATASET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewDatasetColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newDatasetColor === color.value
                            ? "border-foreground scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data Source</Label>
                  <Select value={dataSource} onValueChange={(v) => setDataSource(v as "current" | "manual")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current" disabled={!currentChartData?.data}>
                        Current Chart Data {!currentChartData?.data && "(No data)"}
                      </SelectItem>
                      <SelectItem value="manual">Manual JSON Input</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dataSource === "manual" && (
                  <div className="space-y-2">
                    <Label htmlFor="manual-data">JSON Data</Label>
                    <Textarea
                      id="manual-data"
                      placeholder='[{"name": "A", "value": 100}, ...]'
                      value={manualData}
                      onChange={(e) => setManualData(e.target.value)}
                      className="font-mono text-xs h-24"
                    />
                  </div>
                )}

                <Button
                  onClick={handleAddDataset}
                  disabled={!newDatasetName.trim() || (dataSource === "manual" && !manualData.trim())}
                  className="w-full"
                >
                  Add Dataset
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {datasets.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Datasets</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm mb-3">Comparison Datasets</h4>
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-secondary/30"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dataset.color }}
                        />
                        <span className="text-sm truncate">{dataset.name}</span>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {dataset.data.length} pts
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 w-6 p-0 ${!dataset.visible ? 'opacity-50' : ''}`}
                          onClick={() => onToggleVisibility(dataset.id)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => onRemoveDataset(dataset.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </>
      )}
    </div>
  );
};

export default ChartComparison;
