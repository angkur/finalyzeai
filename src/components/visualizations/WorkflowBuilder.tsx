import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowRight, Play, RotateCcw, Workflow, Link2, Download, Upload, FileJson, LayoutTemplate, Image, Info } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  /** Live-preview updates (no “Build” click required). */
  onPreview?: (data: WorkflowData) => void;
  initialData?: WorkflowData;
  onExportImage?: () => void;
  canExportImage?: boolean;
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

// Pre-built workflow templates
const WORKFLOW_TEMPLATES: Record<string, WorkflowData> = {
  financial_analysis: {
    nodes: [
      { id: "data_input", label: "Market Data Input", value: 100, category: "Input" },
      { id: "validation", label: "Data Validation", value: 95, category: "Process" },
      { id: "preprocessing", label: "Preprocessing", value: 90, category: "Process" },
      { id: "risk_analysis", label: "Risk Analysis", value: 85, category: "AI" },
      { id: "trend_detection", label: "Trend Detection", value: 80, category: "AI" },
      { id: "portfolio_opt", label: "Portfolio Optimization", value: 75, category: "Decision" },
      { id: "report_gen", label: "Report Generation", value: 70, category: "Output" },
      { id: "storage", label: "Results Storage", value: 65, category: "Storage" },
    ],
    links: [
      { source: "data_input", target: "validation", value: 100 },
      { source: "validation", target: "preprocessing", value: 95 },
      { source: "preprocessing", target: "risk_analysis", value: 90 },
      { source: "preprocessing", target: "trend_detection", value: 85 },
      { source: "risk_analysis", target: "portfolio_opt", value: 80 },
      { source: "trend_detection", target: "portfolio_opt", value: 75 },
      { source: "portfolio_opt", target: "report_gen", value: 70 },
      { source: "report_gen", target: "storage", value: 65 },
    ],
  },
  data_processing: {
    nodes: [
      { id: "raw_data", label: "Raw Data", value: 100, category: "Input" },
      { id: "etl", label: "ETL Process", value: 95, category: "Process" },
      { id: "clean", label: "Data Cleaning", value: 90, category: "Process" },
      { id: "transform", label: "Transformation", value: 85, category: "Process" },
      { id: "quality", label: "Quality Check", value: 80, category: "Decision" },
      { id: "enrichment", label: "Data Enrichment", value: 75, category: "Integration" },
      { id: "warehouse", label: "Data Warehouse", value: 70, category: "Storage" },
      { id: "analytics", label: "Analytics Ready", value: 65, category: "Output" },
    ],
    links: [
      { source: "raw_data", target: "etl", value: 100 },
      { source: "etl", target: "clean", value: 95 },
      { source: "clean", target: "transform", value: 90 },
      { source: "transform", target: "quality", value: 85 },
      { source: "quality", target: "enrichment", value: 80 },
      { source: "enrichment", target: "warehouse", value: 75 },
      { source: "warehouse", target: "analytics", value: 70 },
    ],
  },
  risk_assessment: {
    nodes: [
      { id: "inputs", label: "Risk Inputs", value: 100, category: "Input" },
      { id: "historical", label: "Historical Data", value: 95, category: "Storage" },
      { id: "market_risk", label: "Market Risk", value: 90, category: "AI" },
      { id: "credit_risk", label: "Credit Risk", value: 85, category: "AI" },
      { id: "operational", label: "Operational Risk", value: 80, category: "AI" },
      { id: "aggregation", label: "Risk Aggregation", value: 75, category: "Process" },
      { id: "scoring", label: "Risk Scoring", value: 70, category: "Decision" },
      { id: "mitigation", label: "Mitigation Plan", value: 65, category: "Output" },
      { id: "dashboard", label: "Risk Dashboard", value: 60, category: "Output" },
    ],
    links: [
      { source: "inputs", target: "market_risk", value: 100 },
      { source: "inputs", target: "credit_risk", value: 95 },
      { source: "inputs", target: "operational", value: 90 },
      { source: "historical", target: "market_risk", value: 85 },
      { source: "historical", target: "credit_risk", value: 80 },
      { source: "market_risk", target: "aggregation", value: 75 },
      { source: "credit_risk", target: "aggregation", value: 70 },
      { source: "operational", target: "aggregation", value: 65 },
      { source: "aggregation", target: "scoring", value: 60 },
      { source: "scoring", target: "mitigation", value: 55 },
      { source: "scoring", target: "dashboard", value: 50 },
    ],
  },
  ml_pipeline: {
    nodes: [
      { id: "data_source", label: "Data Source", value: 100, category: "Input" },
      { id: "feature_eng", label: "Feature Engineering", value: 95, category: "Process" },
      { id: "train_split", label: "Train/Test Split", value: 90, category: "Process" },
      { id: "model_train", label: "Model Training", value: 85, category: "AI" },
      { id: "validation", label: "Validation", value: 80, category: "Decision" },
      { id: "hypertuning", label: "Hyperparameter Tuning", value: 75, category: "AI" },
      { id: "evaluation", label: "Model Evaluation", value: 70, category: "Process" },
      { id: "deployment", label: "Deployment", value: 65, category: "Integration" },
      { id: "monitoring", label: "Monitoring", value: 60, category: "Output" },
    ],
    links: [
      { source: "data_source", target: "feature_eng", value: 100 },
      { source: "feature_eng", target: "train_split", value: 95 },
      { source: "train_split", target: "model_train", value: 90 },
      { source: "model_train", target: "validation", value: 85 },
      { source: "validation", target: "hypertuning", value: 80 },
      { source: "hypertuning", target: "model_train", value: 75 },
      { source: "validation", target: "evaluation", value: 70 },
      { source: "evaluation", target: "deployment", value: 65 },
      { source: "deployment", target: "monitoring", value: 60 },
    ],
  },
};

const WorkflowBuilder = ({
  onBuild,
  onPreview,
  initialData,
  onExportImage,
  canExportImage,
}: WorkflowBuilderProps) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialData?.nodes || []);
  const [links, setLinks] = useState<WorkflowLink[]>(initialData?.links || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasBuilt, setHasBuilt] = useState(false);
  const [livePreview, setLivePreview] = useState(true);

  // New node form state
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeValue, setNewNodeValue] = useState(50);
  const [newNodeCategory, setNewNodeCategory] = useState("Process");
  
  // Auto-build when initialData changes (e.g., from template or import)
  useEffect(() => {
    if (initialData && initialData.nodes.length > 0) {
      setNodes(initialData.nodes);
      setLinks(initialData.links);
    }
  }, [initialData]);

  // Live preview (updates visualization without requiring “Build Workflow”)
  useEffect(() => {
    if (!onPreview || !livePreview) return;

    // Allow clearing preview on reset
    const timeout = window.setTimeout(() => {
      onPreview({ nodes, links });
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [nodes, links, livePreview, onPreview]);

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
    setHasBuilt(true);
    toast.success("Workflow built! Check the visualization below.");
  }, [nodes, links, onBuild]);

  const handleReset = useCallback(() => {
    setNodes([]);
    setLinks([]);
    setNewNodeLabel("");
    setNewNodeValue(50);
    setLinkSource("");
    setLinkTarget("");
    setHasBuilt(false);
    onPreview?.({ nodes: [], links: [] });
    toast.info("Workflow reset");
  }, [onPreview]);

  // Template loading - auto-build after loading
  const handleLoadTemplate = useCallback((templateKey: string) => {
    const template = WORKFLOW_TEMPLATES[templateKey];
    if (template) {
      setNodes(template.nodes);
      setLinks(template.links);
      // Auto-build the template
      setTimeout(() => {
        onBuild(template);
        setHasBuilt(true);
      }, 100);
      toast.success(`Loaded and built template: ${templateKey.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}`);
    }
  }, [onBuild]);

  // Export workflow as JSON
  const handleExport = useCallback(() => {
    if (nodes.length === 0) {
      toast.error("No workflow to export");
      return;
    }

    const workflowData: WorkflowData = { nodes, links };
    const dataStr = JSON.stringify(workflowData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Workflow exported successfully!");
  }, [nodes, links]);

  // Import workflow from JSON - auto-build after import
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as WorkflowData;
        
        if (!Array.isArray(data.nodes) || !Array.isArray(data.links)) {
          throw new Error("Invalid workflow format");
        }
        
        setNodes(data.nodes);
        setLinks(data.links);
        // Auto-build the imported workflow
        setTimeout(() => {
          onBuild(data);
          setHasBuilt(true);
        }, 100);
        toast.success("Workflow imported and built! Check the visualization below.");
      } catch (error) {
        toast.error("Failed to import workflow: Invalid file format");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onBuild]);

  const getNodeLabel = (id: string) => nodes.find((n) => n.id === id)?.label || id;

  return (
    <div className="space-y-4">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Workflow Builder</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Templates Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutTemplate className="w-4 h-4 mr-1" />
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Load Template</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleLoadTemplate("financial_analysis")}>
                <FileJson className="w-4 h-4 mr-2 text-blue-500" />
                Financial Analysis Pipeline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLoadTemplate("data_processing")}>
                <FileJson className="w-4 h-4 mr-2 text-green-500" />
                Data Processing Flow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLoadTemplate("risk_assessment")}>
                <FileJson className="w-4 h-4 mr-2 text-orange-500" />
                Risk Assessment Workflow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLoadTemplate("ml_pipeline")}>
                <FileJson className="w-4 h-4 mr-2 text-purple-500" />
                ML Pipeline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live preview toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-secondary/30 border border-border/30">
                  <span className="text-xs text-muted-foreground">Live preview</span>
                  <Switch checked={livePreview} onCheckedChange={setLivePreview} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>When enabled, manual nodes/connections render immediately in the canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Export Dropdown */}
          <TooltipProvider>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={nodes.length === 0}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export workflow as JSON or Image</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onExportImage} 
                  disabled={!canExportImage || !hasBuilt}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Export as Image
                  {!hasBuilt && <span className="text-xs text-muted-foreground ml-1">(Build first)</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>

          {/* Import Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import a previously exported JSON workflow file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-6 bg-border" />

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
          <p className="text-sm">Start by adding steps or load a template</p>
          <p className="text-xs mt-1">Then connect them to visualize the flow</p>
        </div>
      )}

      {/* Visual Preview Mini-diagram */}
      {nodes.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Workflow className="w-4 h-4 text-primary" />
              Workflow Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="relative bg-secondary/30 rounded-lg p-4 min-h-[150px] overflow-x-auto">
              <div className="flex items-center gap-3 flex-wrap">
                {nodes.map((node, index) => {
                  const hasOutgoingLink = links.some(l => l.source === node.id);
                  const hasIncomingLink = links.some(l => l.target === node.id);
                  const isConnected = hasOutgoingLink || hasIncomingLink;
                  
                  return (
                    <div key={node.id} className="flex items-center gap-2">
                      <div 
                        className={`relative px-3 py-2 rounded-lg border-2 transition-all ${
                          isConnected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-dashed border-muted-foreground/30 bg-muted/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Custom}`} />
                          <span className="text-xs font-medium whitespace-nowrap">{node.label}</span>
                        </div>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                          {node.category}
                        </span>
                      </div>
                      {index < nodes.length - 1 && links.some(l => l.source === node.id) && (
                        <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              {links.length === 0 && nodes.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center px-4">
                    Add connections between nodes to see the flow
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">How to use the Workflow Builder:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Add steps (nodes) using the form above or load a template</li>
                  <li>Create connections between steps</li>
                  <li>Click "Build Workflow" to visualize in 3D/2D below</li>
                  <li>Use "Custom" toggle to view your built workflow</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Build Status Indicator */}
      {hasBuilt && nodes.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-600 dark:text-green-400">
            Workflow built! Scroll down to see the visualization. Make sure "Custom" is selected in the data source toggle.
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;