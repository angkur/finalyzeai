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
  Bot
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useConversation, Message } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const suggestionChips = [
  { icon: TrendingUp, label: "Market Analysis", query: "Analyze current market trends and provide investment insights" },
  { icon: PieChart, label: "Portfolio Review", query: "Review my portfolio allocation and suggest optimizations" },
  { icon: AlertTriangle, label: "Risk Assessment", query: "Assess the risk factors in my current investments" },
  { icon: Target, label: "Financial Planning", query: "Help me create a financial plan for my goals" },
  { icon: FileText, label: "Document Analysis", query: "Analyze my uploaded financial documents" },
  { icon: Sparkles, label: "AI Predictions", query: "What are your predictions for the market this quarter?" },
];

const AiPredict = () => {
  const { user } = useAuth();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Show empty state (welcome screen) when no messages
  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">FinanceAI</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
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
                    "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
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

        {/* Sidebar Footer */}
        {user && (
          <div className="p-3 border-t border-border/50">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <h1 className="font-display font-semibold text-foreground">AI Predict</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!user && (
              <Button variant="hero" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {showWelcome ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-center">
                What can I help with?
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Get AI-powered financial insights, market analysis, and personalized recommendations.
              </p>
              
              {/* Suggestion Chips */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl w-full">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSuggestionClick(chip.query)}
                    disabled={!user}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-secondary/50 transition-all text-left group",
                      !user && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                      <chip.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{chip.label}</span>
                  </button>
                ))}
              </div>

              {!user && (
                <p className="text-sm text-muted-foreground mt-8">
                  <button onClick={() => navigate('/auth')} className="text-primary hover:underline">
                    Sign in
                  </button>
                  {" "}to start chatting
                </p>
              )}
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === 'user' 
                        ? "bg-primary/20" 
                        : "bg-gradient-primary"
                    )}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-primary" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {message.role === 'user' ? 'You' : 'FinanceAI'}
                      </p>
                      <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content || (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
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
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-border bg-card shadow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your finances..."
                className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-3 px-2"
                disabled={isLoading || !user}
                rows={1}
              />
              <Button
                variant="hero"
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || !user}
                className="h-10 w-10 shrink-0 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              AI Predict can make mistakes. Verify important financial decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPredict;