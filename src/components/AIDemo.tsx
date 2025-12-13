import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, LineChart, FileText, Database, Shield, Sparkles, Send, Loader2, Upload, X, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

type AnalysisType = 'data-analysis' | 'report-generation' | 'predictive-modeling' | 'rag-query' | 'credit-scoring';

const analysisTypes = [
  { id: 'data-analysis' as AnalysisType, label: 'Data Analysis', icon: LineChart, description: 'Analyze financial data for insights' },
  { id: 'report-generation' as AnalysisType, label: 'Report Generation', icon: FileText, description: 'Generate professional reports' },
  { id: 'predictive-modeling' as AnalysisType, label: 'Predictive Modeling', icon: Brain, description: 'Forecast trends and patterns' },
  { id: 'rag-query' as AnalysisType, label: 'Knowledge Query', icon: Database, description: 'Query financial knowledge base' },
  { id: 'credit-scoring' as AnalysisType, label: 'Credit Scoring', icon: Shield, description: 'Assess creditworthiness' },
];

const samplePrompts: Record<AnalysisType, string> = {
  'data-analysis': 'Analyze this quarterly data:\nQ1: Revenue $2.3M, Expenses $1.8M\nQ2: Revenue $2.8M, Expenses $2.0M\nQ3: Revenue $3.1M, Expenses $2.2M\nQ4: Revenue $2.9M, Expenses $2.4M',
  'report-generation': 'Generate an executive summary for a company with:\n- Annual revenue: $12M\n- YoY growth: 18%\n- EBITDA margin: 22%\n- Customer retention: 94%',
  'predictive-modeling': 'Based on this 3-year trend:\n2022: $8M revenue, 15% growth\n2023: $10M revenue, 25% growth\n2024: $12M revenue, 20% growth\nPredict 2025 performance.',
  'rag-query': 'Explain the key differences between Basel III and Basel IV regulations and their impact on bank capital requirements.',
  'credit-scoring': 'Assess credit risk for:\n- Business age: 5 years\n- Annual revenue: $500K\n- Debt-to-equity: 1.2\n- Payment history: 2 late payments in 3 years\n- Industry: SaaS',
};

const parseCSV = (text: string): string => {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return text;
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] || '';
      return obj;
    }, {} as Record<string, string>);
  });

  // Create a formatted summary
  let summary = `Dataset with ${rows.length} rows and ${headers.length} columns.\n\n`;
  summary += `Columns: ${headers.join(', ')}\n\n`;
  summary += `Sample data (first 10 rows):\n`;
  
  rows.slice(0, 10).forEach((row, i) => {
    summary += `Row ${i + 1}: ${JSON.stringify(row)}\n`;
  });

  if (rows.length > 10) {
    summary += `\n... and ${rows.length - 10} more rows.`;
  }

  // Add basic statistics for numeric columns
  const numericColumns = headers.filter(h => {
    return rows.every(r => !isNaN(parseFloat(r[h])) || r[h] === '');
  });

  if (numericColumns.length > 0) {
    summary += '\n\nNumeric Column Statistics:\n';
    numericColumns.forEach(col => {
      const values = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        summary += `${col}: Min=${min.toFixed(2)}, Max=${max.toFixed(2)}, Avg=${avg.toFixed(2)}, Sum=${sum.toFixed(2)}\n`;
      }
    });
  }

  return summary;
};

const AIDemo = () => {
  const [selectedType, setSelectedType] = useState<AnalysisType>('data-analysis');
  const [input, setInput] = useState(samplePrompts['data-analysis']);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (type: AnalysisType) => {
    setSelectedType(type);
    setInput(samplePrompts[type]);
    setResponse('');
    setUploadedFile(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    const allowedTypes = ['.csv', '.txt', '.json'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(extension)) {
      toast.error("Unsupported file type. Please upload CSV, TXT, or JSON files.");
      return;
    }

    try {
      const text = await file.text();
      let parsedContent = text;

      if (extension === '.csv') {
        parsedContent = parseCSV(text);
      } else if (extension === '.json') {
        try {
          const json = JSON.parse(text);
          parsedContent = `JSON Data:\n${JSON.stringify(json, null, 2).slice(0, 5000)}`;
          if (text.length > 5000) {
            parsedContent += '\n... (truncated for preview)';
          }
        } catch {
          parsedContent = text;
        }
      }

      setUploadedFile({ name: file.name, content: parsedContent });
      setInput(`Analyze this uploaded dataset (${file.name}):\n\n${parsedContent}`);
      toast.success(`File "${file.name}" uploaded successfully!`);
    } catch (error) {
      toast.error("Failed to read file");
      console.error(error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setInput(samplePrompts[selectedType]);
  };

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast.error("Please enter some data to analyze");
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          analysisType: selectedType,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-32 relative overflow-hidden bg-secondary/20">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Live AI Demo</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Experience </span>
            <span className="text-gradient-primary">AI in Action</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Upload your dataset or enter data manually. Our AI will analyze and provide actionable insights.
          </p>
        </div>

        {/* Analysis Type Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {analysisTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-300 ${
                selectedType === type.id
                  ? 'bg-primary/10 border-primary text-foreground shadow-glow'
                  : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Demo Interface */}
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Input Data</h3>
              </div>
              
              {/* File Upload Button */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm font-medium cursor-pointer hover:bg-accent/20 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </label>
              </div>
            </div>

            {/* Uploaded File Indicator */}
            {uploadedFile && (
              <div className="flex items-center justify-between px-3 py-2 mb-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-accent" />
                  <span className="text-sm text-foreground">{uploadedFile.name}</span>
                </div>
                <button
                  onClick={clearFile}
                  className="p-1 rounded hover:bg-accent/20 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your financial data, paste CSV content, or upload a file..."
              className="min-h-[200px] bg-secondary/50 border-border/50 resize-none mb-4 text-sm"
            />
            
            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                className="w-full"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Run Analysis
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Supports CSV, TXT, and JSON files up to 5MB
              </p>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground">AI Analysis Results</h3>
            </div>
            <div className="min-h-[280px] max-h-[400px] bg-secondary/30 rounded-xl p-4 border border-border/30 overflow-auto">
              {response ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">
                    {response}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span>Analyzing your data...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <span>Upload a file or enter data to see AI analysis</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <Upload className="w-6 h-6 mx-auto mb-2 text-primary" />
            <h4 className="font-medium text-sm text-foreground mb-1">Upload Datasets</h4>
            <p className="text-xs text-muted-foreground">CSV, JSON, or TXT files</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-accent" />
            <h4 className="font-medium text-sm text-foreground mb-1">AI Analysis</h4>
            <p className="text-xs text-muted-foreground">Instant pattern detection</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
            <h4 className="font-medium text-sm text-foreground mb-1">Actionable Insights</h4>
            <p className="text-xs text-muted-foreground">Get recommendations</p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          This is a demonstration of AI capabilities. For production financial analysis, 
          models are fine-tuned on domain-specific data with rigorous validation.
        </p>
      </div>
    </section>
  );
};

export default AIDemo;
