import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Plus, 
  Trash2, 
  Menu,
  Sparkles,
  TrendingUp,
  PieChart,
  AlertTriangle,
  Target,
  FileText,
  Brain,
  X,
  User,
  Bot,
  Paperclip,
  File,
  CheckCircle,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useConversation, Message } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import UsageTracker from "@/components/UsageTracker";
import ToolLanding from "@/components/ToolLanding";
import { aiPredictLanding } from "@/config/toolLandings";

interface AttachedFile {
  id: string;
  name: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

import { ShieldAlert } from "lucide-react";

const suggestionChips = [
  { icon: TrendingUp, label: "Market Analysis", query: "Analyze current market trends and provide investment insights" },
  { icon: PieChart, label: "Portfolio Review", query: "Review my portfolio allocation and suggest optimizations" },
  { icon: AlertTriangle, label: "Risk Assessment", query: "Assess the risk factors in my current investments" },
  { icon: Target, label: "Financial Planning", query: "Help me create a financial plan for my goals" },
  { icon: FileText, label: "Document Analysis", query: "Analyze my uploaded financial documents" },
  { icon: Sparkles, label: "AI Predictions", query: "What are your predictions for the market this quarter?" },
  { icon: ShieldAlert, label: "Fraud Analysis", query: "Analyze my uploaded financial documents for potential fraud indicators, anomalies, and suspicious patterns. Provide a fraud risk assessment with confidence levels." },
  { icon: FileText, label: "Statement Analysis", query: "Analyze the uploaded financial statements. Extract key financial data, calculate profitability ratios (gross margin, net margin, ROE), solvency ratios (debt-to-equity, interest coverage), and cash flow ratios. Score each category and provide an eligibility recommendation." },
];

const AiPredict = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    setIsLoading,
    setMessages,
    createConversation,
    addMessage,
    selectConversation,
    deleteConversation,
    clearCurrentConversation,
    getConversationHistory,
  } = useConversation();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [usageLimitMessage, setUsageLimitMessage] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<{ used: number; limit: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check usage limits on mount and after sending messages
  useEffect(() => {
    const checkUsageLimits = async () => {
      if (!user) return;
      
      try {
        // First check if user is blocked via ai_usage_limits
        const { data: blockData } = await supabase
          .from('ai_usage_limits')
          .select('is_blocked')
          .eq('user_id', user.id)
          .maybeSingle();

        if (blockData?.is_blocked) {
          setIsBlocked(true);
          setUsageLimitMessage("Your account has been restricted. Please contact support.");
          return;
        }

        // Get user's plan limits from user_plans table
        const { data: planData } = await supabase
          .from('user_plans')
          .select('daily_limit, monthly_limit')
          .eq('user_id', user.id)
          .maybeSingle();

        // Default to free plan limits (5 per month total)
        const dailyLimit = planData?.daily_limit ?? 5;
        const monthlyLimit = planData?.monthly_limit ?? 5;

        // Count today's interactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: dailyCount } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());

        // Count this month's interactions
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const { count: monthlyCount } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', monthStart.toISOString());

        // Update usage stats for display
        setUsageStats({ used: monthlyCount ?? 0, limit: monthlyLimit });

        if ((dailyCount || 0) >= dailyLimit) {
          setIsBlocked(true);
          setUsageLimitMessage(`Daily limit reached (${dailyLimit} analyses). Upgrade your plan for more.`);
        } else if ((monthlyCount || 0) >= monthlyLimit) {
          setIsBlocked(true);
          setUsageLimitMessage(`Monthly limit reached (${monthlyLimit} analyses). Upgrade your plan for more.`);
        } else {
          setIsBlocked(false);
          setUsageLimitMessage(null);
        }
      } catch (error) {
        console.error("Failed to check usage limits:", error);
      }
    };

    checkUsageLimits();
  }, [user, messages.length]); // Re-check after messages change

  // Log interaction for usage tracking
  const logInteraction = async (query: string, responseText: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-interaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            query,
            response: responseText,
            analysisType: 'ai-predict',
            userId: user?.id,
          }),
        }
      );
    } catch (error) {
      console.error("Failed to log interaction:", error);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = async (messageText?: string) => {
    if (!user) {
      toast.error("Please sign in to use AI Predict");
      navigate("/auth");
      return;
    }

    if (isBlocked) {
      toast.error(usageLimitMessage || "Usage limit reached. Please upgrade your plan.");
      return;
    }

    const userMessage = (messageText || input).trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      // Create conversation if needed
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) throw new Error("Failed to create conversation");
      }

      // Add user message
      await addMessage(conversationId, 'user', userMessage);

      // Get conversation history for context
      const history = getConversationHistory();

      // Call RAG endpoint with conversation history
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            query: userMessage,
            userId: user.id,
            conversationHistory: history,
          }),
        }
      );

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Query failed");
      }

      // Handle streaming response
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      // Add placeholder assistant message
      const tempMessage: Message = {
        id: 'temp-' + Date.now(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, tempMessage]);

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
              setMessages(prev => 
                prev.map(m => 
                  m.id === tempMessage.id 
                    ? { ...m, content: fullResponse }
                    : m
                )
              );
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save the complete assistant message
      if (fullResponse) {
        await addMessage(conversationId, 'assistant', fullResponse);
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        
        // Log interaction for usage tracking
        logInteraction(userMessage, fullResponse);
      }

    } catch (error) {
      console.error("AI Predict error:", error);
      toast.error(error instanceof Error ? error.message : "Query failed");
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    clearCurrentConversation();
    setInput('');
  };

  const handleSuggestionClick = (query: string) => {
    handleSend(query);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Please sign in to upload documents");
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    const allowedTypes = ['.pdf', '.txt', '.csv', '.json', '.md'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      toast.error("Unsupported file type. Please upload PDF, TXT, CSV, JSON, or MD files.");
      return;
    }

    const fileId = `file-${Date.now()}`;
    setAttachedFiles(prev => [...prev, { id: fileId, name: file.name, status: 'uploading' }]);
    setIsUploadingFile(true);

    try {
      // Read file content
      const content = await file.text();

      // Upload to storage with user folder
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // Create document record with user_id
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_path: filePath,
          file_type: extension,
          file_size: file.size,
          status: 'pending',
          user_id: user.id,
        })
        .select()
        .single();

      if (docError) {
        throw new Error(`Document record creation failed: ${docError.message}`);
      }

      // Update status to processing
      setAttachedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'processing' } : f)
      );

      // Trigger processing with user_id
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          documentId: docData.id,
          content: content,
          fileName: file.name,
          userId: user.id,
        },
      });

      if (processError) {
        console.error('Processing error:', processError);
        await supabase
          .from('documents')
          .update({ status: 'failed', error_message: processError.message })
          .eq('id', docData.id);
        setAttachedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
        );
        toast.error("Document processing failed");
      } else {
        // Poll for completion
        pollDocumentStatus(docData.id, fileId);
        toast.success(`"${file.name}" uploaded and processing!`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setAttachedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
      );
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const pollDocumentStatus = async (documentId: string, fileId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      const { data } = await supabase
        .from('documents')
        .select('status')
        .eq('id', documentId)
        .single();

      if (data?.status === 'completed') {
        setAttachedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'ready' } : f)
        );
        toast.success("Document ready for analysis!");
        return;
      }

      if (data?.status === 'failed') {
        setAttachedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
        );
        return;
      }

      attempts++;
      if (attempts < maxAttempts && data?.status === 'processing') {
        setTimeout(poll, 5000);
      }
    };

    setTimeout(poll, 3000);
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Show empty state (welcome screen) when no messages
  const showWelcome = messages.length === 0;

  // Usage counter component
  const UsageCounter = () => {
    if (!user || !usageStats) return null;
    
    const remaining = Math.max(0, usageStats.limit - usageStats.used);
    const usagePercent = (usageStats.used / usageStats.limit) * 100;
    const isNearLimit = usagePercent >= 80 && usagePercent < 100;
    const isAtLimit = usagePercent >= 100;
    
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/50 text-xs">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          isAtLimit ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : "bg-green-500"
        )} />
        <span className="text-muted-foreground">
          <span className={cn("font-semibold", isAtLimit && "text-destructive")}>
            {remaining}
          </span>
          /{usageStats.limit} left
        </span>
        {isNearLimit && (
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary p-0 h-auto text-xs" 
            onClick={() => navigate('/pricing')}
          >
            Upgrade
          </Button>
        )}
      </div>
    );
  };

  // Public, indexable marketing page for signed-out visitors
  if (!isAuthLoading && !user) {
    return <ToolLanding {...aiPredictLanding} />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile by default */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out md:relative",
          sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm sm:text-base text-foreground">FinanceAI</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-2 sm:p-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
            onClick={handleNewConversation}
          >
            <Plus className="w-4 h-4" />
            New chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-2">
            Recent conversations
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.slice(0, 20).map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm cursor-pointer transition-colors",
                    currentConversationId === conv.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                  onClick={() => selectConversation(conv.id)}
                >
                  <span className="truncate flex-1">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Tracker */}
        {user && (
          <div className="px-2 sm:px-3 py-2 border-t border-border/50">
            <UsageTracker />
          </div>
        )}

        {/* Sidebar Footer */}
        {user && (
          <div className="p-2 sm:p-3 border-t border-border/50">
            <div className="flex items-center gap-2 sm:gap-3 px-2 py-2 rounded-lg bg-secondary/30">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <h1 className="font-display font-semibold text-sm sm:text-base text-foreground">AI Predict</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <UsageCounter />
            </div>
            <ThemeToggle />
            {!user && (
              <Button variant="hero" size="sm" className="text-xs sm:text-sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {showWelcome ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4 py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 sm:mb-6 shadow-glow">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-2 sm:mb-3 text-center">
                What can I help with?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-6 sm:mb-8 px-2">
                Get AI-powered financial insights, market analysis, and personalized recommendations.
              </p>
              
              {/* Suggestion Chips */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-2xl w-full px-2">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSuggestionClick(chip.query)}
                    disabled={!user}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 bg-card/50 hover:bg-secondary/50 transition-all text-left group",
                      !user && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                      <chip.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground">{chip.label}</span>
                  </button>
                ))}
              </div>

              {!user && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
                  <button onClick={() => navigate('/auth')} className="text-primary hover:underline">
                    Sign in
                  </button>
                  {" "}to start chatting
                </p>
              )}
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-2 sm:gap-4 group">
                    <div className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === 'user' 
                        ? "bg-primary/20" 
                        : "bg-gradient-primary"
                    )}>
                      {message.role === 'user' ? (
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      ) : (
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                          {message.role === 'user' ? 'You' : 'FinanceAI'}
                        </p>
                        {message.role === 'assistant' && message.content && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast.success("Copied to clipboard!");
                            }}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            <span className="text-[10px] sm:text-xs">Copy</span>
                          </Button>
                        )}
                      </div>
                      <div className="text-foreground whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                        {message.content || (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            Thinking...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-sm border",
                      file.status === 'ready' && "bg-green-500/10 border-green-500/30 text-green-600",
                      file.status === 'uploading' && "bg-primary/10 border-primary/30 text-primary",
                      file.status === 'processing' && "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
                      file.status === 'error' && "bg-destructive/10 border-destructive/30 text-destructive"
                    )}
                  >
                    {file.status === 'uploading' || file.status === 'processing' ? (
                      <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                    ) : file.status === 'ready' ? (
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    ) : (
                      <File className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    )}
                    <span className="truncate max-w-[100px] sm:max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeAttachedFile(file.id)}
                      className="hover:opacity-70"
                    >
                      <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
              {/* File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.csv,.json,.md"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploadingFile || !user}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile || !user}
                className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl text-muted-foreground hover:text-foreground"
                title="Attach document"
              >
                {isUploadingFile ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData('text');
                  if (pastedText) {
                    e.preventDefault();
                    const target = e.currentTarget;
                    const start = target.selectionStart || 0;
                    const end = target.selectionEnd || 0;
                    const newValue = input.substring(0, start) + pastedText + input.substring(end);
                    setInput(newValue);
                    // Set cursor position after paste
                    setTimeout(() => {
                      target.selectionStart = target.selectionEnd = start + pastedText.length;
                    }, 0);
                  }
                }}
                placeholder="Ask anything about your finances..."
                className="min-h-[40px] sm:min-h-[44px] max-h-[150px] sm:max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2.5 sm:py-3 px-1.5 sm:px-2 text-sm"
                disabled={isLoading || !user}
                rows={1}
              />
              <Button
                variant="hero"
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || !user}
                className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 sm:mt-3">
              Attach documents (PDF, TXT, CSV, JSON, MD) • AI Predict can make mistakes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPredict;