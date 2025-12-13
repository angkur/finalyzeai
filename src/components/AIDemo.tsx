import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, LineChart, FileText, Database, Shield, Sparkles, Send, Loader2 } from "lucide-react";
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

const AIDemo = () => {
  const [selectedType, setSelectedType] = useState<AnalysisType>('data-analysis');
  const [input, setInput] = useState(samplePrompts['data-analysis']);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeChange = (type: AnalysisType) => {
    setSelectedType(type);
    setInput(samplePrompts[type]);
    setResponse('');
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
            Try our AI-powered financial analysis tools. Select a service and see real-time results.
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
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Input Data</h3>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your financial data or question..."
              className="min-h-[240px] bg-secondary/50 border-border/50 resize-none mb-4"
            />
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
          </div>

          {/* Output Panel */}
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground">AI Response</h3>
            </div>
            <div className="min-h-[280px] bg-secondary/30 rounded-xl p-4 border border-border/30 overflow-auto">
              {response ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">
                    {response}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span>Processing your request...</span>
                    </div>
                  ) : (
                    <span>AI response will appear here</span>
                  )}
                </div>
              )}
            </div>
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
