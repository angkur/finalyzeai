import { useState } from "react";
import { Plus, X, Tag, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Annotation {
  id: string;
  type: 'label' | 'note';
  text: string;
  color: string;
  dataPoint?: string;
  createdAt: Date;
}

interface ChartAnnotationsProps {
  annotations: Annotation[];
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  onRemoveAnnotation: (id: string) => void;
  dataPoints?: string[];
}

const ANNOTATION_COLORS = [
  { name: 'Blue', value: 'hsl(200, 80%, 50%)' },
  { name: 'Green', value: 'hsl(160, 70%, 45%)' },
  { name: 'Yellow', value: 'hsl(45, 90%, 55%)' },
  { name: 'Red', value: 'hsl(350, 75%, 55%)' },
  { name: 'Purple', value: 'hsl(280, 60%, 55%)' },
  { name: 'Cyan', value: 'hsl(180, 65%, 45%)' },
];

const ChartAnnotations = ({ 
  annotations, 
  onAddAnnotation, 
  onRemoveAnnotation,
  dataPoints = []
}: ChartAnnotationsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    type: 'label' as 'label' | 'note',
    text: '',
    color: ANNOTATION_COLORS[0].value,
    dataPoint: '',
  });

  const handleAddAnnotation = () => {
    if (!newAnnotation.text.trim()) return;

    onAddAnnotation({
      type: newAnnotation.type,
      text: newAnnotation.text.trim(),
      color: newAnnotation.color,
      dataPoint: newAnnotation.dataPoint || undefined,
    });

    setNewAnnotation({
      type: 'label',
      text: '',
      color: ANNOTATION_COLORS[0].value,
      dataPoint: '',
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Existing annotations as badges */}
      <div className="flex items-center gap-1 flex-wrap max-w-[300px]">
        {annotations.slice(0, 3).map((annotation) => (
          <Popover key={annotation.id}>
            <PopoverTrigger asChild>
              <Badge 
                variant="secondary" 
                className="cursor-pointer text-xs px-2 py-0.5 flex items-center gap-1"
                style={{ borderColor: annotation.color, borderWidth: 1 }}
              >
                {annotation.type === 'label' ? (
                  <Tag className="w-3 h-3" style={{ color: annotation.color }} />
                ) : (
                  <MessageSquare className="w-3 h-3" style={{ color: annotation.color }} />
                )}
                <span className="max-w-[60px] truncate">{annotation.text}</span>
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {annotation.type === 'label' ? (
                      <Tag className="w-4 h-4" style={{ color: annotation.color }} />
                    ) : (
                      <MessageSquare className="w-4 h-4" style={{ color: annotation.color }} />
                    )}
                    <span className="text-sm font-medium capitalize">{annotation.type}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveAnnotation(annotation.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm">{annotation.text}</p>
                {annotation.dataPoint && (
                  <p className="text-xs text-muted-foreground">
                    Data point: {annotation.dataPoint}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Added: {annotation.createdAt.toLocaleDateString()}
                </p>
              </div>
            </PopoverContent>
          </Popover>
        ))}
        {annotations.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{annotations.length - 3} more
          </Badge>
        )}
      </div>

      {/* Add annotation dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Add Note</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Chart Annotation</DialogTitle>
            <DialogDescription>
              Add a label or note to highlight key data points in your chart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newAnnotation.type === 'label' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewAnnotation(prev => ({ ...prev, type: 'label' }))}
                  className="flex-1"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Label
                </Button>
                <Button
                  type="button"
                  variant={newAnnotation.type === 'note' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewAnnotation(prev => ({ ...prev, type: 'note' }))}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Note
                </Button>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 flex-wrap">
                {ANNOTATION_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setNewAnnotation(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newAnnotation.color === color.value 
                        ? 'border-foreground scale-110' 
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Data Point Selection */}
            {dataPoints.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Link to Data Point (Optional)</label>
                <select
                  value={newAnnotation.dataPoint}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, dataPoint: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">None</option>
                  {dataPoints.map((point, i) => (
                    <option key={i} value={point}>{point}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {newAnnotation.type === 'label' ? 'Label Text' : 'Note'}
              </label>
              {newAnnotation.type === 'label' ? (
                <Input
                  value={newAnnotation.text}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter label text..."
                  maxLength={50}
                />
              ) : (
                <Textarea
                  value={newAnnotation.text}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter your note..."
                  rows={3}
                  maxLength={200}
                />
              )}
              <p className="text-xs text-muted-foreground text-right">
                {newAnnotation.text.length}/{newAnnotation.type === 'label' ? 50 : 200}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAnnotation} disabled={!newAnnotation.text.trim()}>
              Add Annotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View all annotations */}
      {annotations.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{annotations.length}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">All Annotations</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {annotations.map((annotation) => (
                    <div 
                      key={annotation.id}
                      className="flex items-start justify-between p-2 rounded-md bg-secondary/50"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        {annotation.type === 'label' ? (
                          <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: annotation.color }} />
                        ) : (
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: annotation.color }} />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm break-words">{annotation.text}</p>
                          {annotation.dataPoint && (
                            <p className="text-xs text-muted-foreground">
                              → {annotation.dataPoint}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveAnnotation(annotation.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default ChartAnnotations;
