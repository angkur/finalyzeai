import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowRight, Play, RotateCcw, Workflow, Link2 } from "lucide-react";
import { toast } from "sonner";

export interface WorkflowNode {
  id: string;
  label: string;
  value: number;
  category: string;
}

export interface WorkflowLink {
  source: string;
  target: string;
  value: number;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  links: WorkflowLink[];
}

interface WorkflowBuilderProps {
  onBuild: (data: WorkflowData) => void;
  initialData?: WorkflowData;
}

const CATEGORIES = [
  "Input",
  "Process",
  "Decision",
  "AI",
  "Output",
  "Storage",
  "Integration",
  "Custom",
];

const CATEGORY_COLORS: Record<string, string> = {
  Input: "bg-blue-500",
  Process: "bg-green-500",
  Decision: "bg-yellow-500",
  AI: "bg-purple-500",
  Output: "bg-orange-500",
  Storage: "bg-cyan-500",
  Integration: "bg-pink-500",
  Custom: "bg-gray-500",
};

const WorkflowBuilder = ({ onBuild, initialData }: WorkflowBuilderProps) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialData?.nodes || []);
  const [links, setLinks] = useState<WorkflowLink[]>(initialData?.links || []);
  
  // New node form state
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeValue, setNewNodeValue] = useState(50);
  const [newNodeCategory, setNewNodeCategory] = useState("Process");
  
  // New link form state
  const [linkSource, setLinkSource] = useState("");
  const [linkTarget, setLinkTarget] = useState("");
  const [linkValue, setLinkValue] = useState(50);

  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddNode = useCallback(() => {
    if (!newNodeLabel.trim()) {
      toast.error("Please enter a node label");
      return;
    }

    const newNode: WorkflowNode = {
      id: generateId(),
      label: newNodeLabel.trim(),
      value: newNodeValue,
      category: newNodeCategory,
    };

    setNodes((prev) => [...prev, newNode]);
    setNewNodeLabel("");
    setNewNodeValue(50);
    toast.success(`Added node: ${newNode.label}`);
  }, [newNodeLabel, newNodeValue, newNodeCategory]);

  const handleRemoveNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setLinks((prev) => prev.filter((l) => l.source !== id && l.target !== id));
    toast.info("Node and connected links removed");
  }, []);

  const handleAddLink = useCallback(() => {
    if (!linkSource || !linkTarget) {
      toast.error("Please select source and target nodes");
      return;
    }

    if (linkSource === linkTarget) {
      toast.error("Source and target must be different");
      return;
    }

    const exists = links.some(
      (l) => l.source === linkSource && l.target === linkTarget
    );
    if (exists) {
      toast.error("This connection already exists");
      return;
    }

    const newLink: WorkflowLink = {
      source: linkSource,
      target: linkTarget,
      value: linkValue,
    };

    setLinks((prev) => [...prev, newLink]);
    setLinkSource("");
    setLinkTarget("");
    setLinkValue(50);
    toast.success("Connection added");
  }, [linkSource, linkTarget, linkValue, links]);

  const handleRemoveLink = useCallback((index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
    toast.info("Connection removed");
  }, []);

  const handleBuild = useCallback(() => {
    if (nodes.length === 0) {
      toast.error("Add at least one node to build workflow");
      return;
    }

    onBuild({ nodes, links });
    toast.success("Workflow built successfully!");
  }, [nodes, links, onBuild]);

  const handleReset = useCallback(() => {
    setNodes([]);
    setLinks([]);
    setNewNodeLabel("");
    setNewNodeValue(50);
    setLinkSource("");
    setLinkTarget("");
    toast.info("Workflow reset");
  }, []);

  const getNodeLabel = (id: string) => nodes.find((n) => n.id === id)?.label || id;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Workflow Builder</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button variant="hero" size="sm" onClick={handleBuild} disabled={nodes.length === 0}>
            <Play className="w-4 h-4 mr-1" />
            Build Workflow
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Add Node Form */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add Step (Node)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="e.g., Data Input, Analysis, Report"
                className="h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={newNodeCategory} onValueChange={setNewNodeCategory}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  type="number"
                  value={newNodeValue}
                  onChange={(e) => setNewNodeValue(Number(e.target.value))}
                  min={1}
                  max={1000}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleAddNode}>
              <Plus className="w-4 h-4 mr-1" />
              Add Node
            </Button>
          </CardContent>
        </Card>

        {/* Add Link Form */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-accent" />
              Add Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Select value={linkSource} onValueChange={setLinkSource} disabled={nodes.length < 2}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Select value={linkTarget} onValueChange={setLinkTarget} disabled={nodes.length < 2}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.filter((n) => n.id !== linkSource).map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Flow Value</Label>
              <Input
                type="number"
                value={linkValue}
                onChange={(e) => setLinkValue(Number(e.target.value))}
                min={1}
                max={1000}
                className="h-8 text-sm"
              />
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleAddLink} disabled={nodes.length < 2}>
              <ArrowRight className="w-4 h-4 mr-1" />
              Add Connection
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Current Nodes */}
      {nodes.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Steps ({nodes.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {nodes.map((node) => (
                <Badge
                  key={node.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Custom}`} />
                  <span className="text-sm">{node.label}</span>
                  <span className="text-xs text-muted-foreground">({node.value})</span>
                  <button
                    onClick={() => handleRemoveNode(node.id)}
                    className="ml-1 p-0.5 rounded hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Links */}
      {links.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Connections ({links.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30 border border-border/30"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">{getNodeLabel(link.source)}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{getNodeLabel(link.target)}</span>
                    <span className="text-xs text-muted-foreground">({link.value})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveLink(index)}
                    className="p-1 rounded hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Workflow className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Start by adding steps to your workflow</p>
          <p className="text-xs mt-1">Then connect them to visualize the flow</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
