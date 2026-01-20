import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageSquare, Plus, Trash2, History, Lightbulb, FileText, TrendingUp, Search, BarChart3, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useConversation, Message } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface RAGChatProps {
  className?: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  file_type: string;
  status: string;
}

// Generate smart example prompts based on document types
const getExamplePrompts = (documents: DocumentInfo[]) => {
  const hasCSV = documents.some(d => d.file_type === '.csv');
  const hasPDF = documents.some(d => d.file_type === '.pdf');
  const hasJSON = documents.some(d => d.file_type === '.json');
  const docNames = documents.map(d => d.name.replace(/\.[^/.]+$/, '')).slice(0, 2);
  
  const prompts: { icon: React.ReactNode; text: string; query: string }[] = [];
  
  if (hasCSV) {
    prompts.push(
      { icon: <BarChart3 className="w-3.5 h-3.5" />, text: "Summarize key metrics", query: "What are the key metrics and statistics from my CSV data? Show me the main trends and patterns." },
      { icon: <TrendingUp className="w-3.5 h-3.5" />, text: "Find trends", query: "Analyze the trends in my data. What patterns do you see over time?" }
    );
  }
  
  if (hasPDF) {
    prompts.push(
      { icon: <FileText className="w-3.5 h-3.5" />, text: "Summarize document", query: "Give me a comprehensive summary of the main points from my uploaded documents." },
      { icon: <Search className="w-3.5 h-3.5" />, text: "Extract key insights", query: "What are the most important insights and takeaways from my documents?" }
    );
  }
  
  if (hasJSON) {
    prompts.push(
      { icon: <BarChart3 className="w-3.5 h-3.5" />, text: "Analyze structure", query: "Analyze the structure and key data points from my JSON files." }
    );
  }
  
  // Default prompts if no specific types or to fill gaps
  if (prompts.length < 4) {
    const defaults = [
      { icon: <FileText className="w-3.5 h-3.5" />, text: "What's in my docs?", query: "Give me an overview of what information is contained in my uploaded documents." },
      { icon: <TrendingUp className="w-3.5 h-3.5" />, text: "Find financial data", query: "What financial figures, revenue, or cost data can you find in my documents?" },
      { icon: <Search className="w-3.5 h-3.5" />, text: "Key takeaways", query: "What are the most important takeaways from my uploaded documents?" },
      { icon: <BarChart3 className="w-3.5 h-3.5" />, text: "Compare data", query: "Compare and contrast the key information across my uploaded documents." },
    ];
    
    for (const d of defaults) {
      if (prompts.length >= 4) break;
      if (!prompts.some(p => p.text === d.text)) {
        prompts.push(d);
      }
    }
  }
  
  // Add document-specific prompt if we have names
  if (docNames.length > 0 && prompts.length < 4) {
    prompts.push({
      icon: <Lightbulb className="w-3.5 h-3.5" />,
      text: `About ${docNames[0]}`,
      query: `Tell me the key information from the "${docNames[0]}" document.`
    });
  }
  
  return prompts.slice(0, 4);
};

const RAGChat = ({ className }: RAGChatProps) => {
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
  const [showHistory, setShowHistory] = useState(false);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user's documents
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  // Fetch AI-generated questions when documents change
  useEffect(() => {
    if (documents.length > 0 && messages.length === 0) {
      fetchAIQuestions();
    }
  }, [documents, messages.length]);

  const fetchDocuments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('documents')
      .select('id, name, file_type, status')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setDocuments(data);
  };

  const fetchAIQuestions = async () => {
    if (!user || loadingQuestions) return;
    
    setLoadingQuestions(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-doc-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setAiQuestions(data.questions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch AI questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePromptClick = (query: string) => {
    setInput(query);
    textareaRef.current?.focus();
  };

  const handleSend = async () => {
    if (!user) {
      toast.error("Please sign in to use the knowledge query");
      navigate("/auth");
      return;
    }

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
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
              // Update the temporary message
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
        // Remove temp message as addMessage will add the real one
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }

    } catch (error) {
      console.error("RAG query error:", error);
      toast.error(error instanceof Error ? error.message : "Query failed");
      // Remove temp message on error
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

  if (!user) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-2">Sign in to chat</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to query your knowledge base with conversation memory
        </p>
        <Button variant="hero" size="sm" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Knowledge Chat</h3>
          {currentConversationId && (
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
              {messages.length} messages
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className="h-8 w-8"
            title="Conversation history"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewConversation}
            className="h-8 w-8"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      {showHistory && (
        <div className="absolute top-14 right-4 w-64 max-h-80 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="p-3 border-b border-border/30">
            <h4 className="text-sm font-medium">Recent Conversations</h4>
          </div>
          <ScrollArea className="h-64">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">No conversations yet</p>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.slice(0, 10).map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg text-sm cursor-pointer hover:bg-secondary/50 transition-colors",
                      currentConversationId === conv.id && "bg-primary/10"
                    )}
                    onClick={() => {
                      selectConversation(conv.id);
                      setShowHistory(false);
                    }}
                  >
                    <span className="truncate flex-1 text-foreground">{conv.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
          </ScrollArea>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <MessageSquare className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              Ask questions about your uploaded documents
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Follow-up questions will use conversation context
            </p>
            
            {/* Example prompts based on uploaded documents */}
            {documents.length > 0 && (
              <div className="w-full max-w-md mt-4 space-y-4">
                {/* AI-Generated Questions */}
                {(aiQuestions.length > 0 || loadingQuestions) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-medium">AI-Suggested Questions</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchAIQuestions}
                        disabled={loadingQuestions}
                        className="h-6 w-6"
                        title="Refresh suggestions"
                      >
                        <RefreshCw className={cn("w-3 h-3", loadingQuestions && "animate-spin")} />
                      </Button>
                    </div>
                    {loadingQuestions ? (
                      <div className="flex items-center justify-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                        <span className="text-xs text-muted-foreground">Analyzing your documents...</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {aiQuestions.slice(0, 4).map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handlePromptClick(question)}
                            className="w-full flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-all text-left group"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-foreground/90 group-hover:text-foreground line-clamp-2">
                              {question}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback: Type-based prompts */}
                {aiQuestions.length === 0 && !loadingQuestions && (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Try asking:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {getExamplePrompts(documents).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt.query)}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/30 hover:border-primary/30 transition-all text-left group"
                        >
                          <span className="text-primary/70 group-hover:text-primary transition-colors">
                            {prompt.icon}
                          </span>
                          <span className="text-xs text-foreground/80 group-hover:text-foreground truncate">
                            {prompt.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-[10px] text-muted-foreground/70 text-center">
                  Based on {documents.length} document{documents.length > 1 ? 's' : ''} in your knowledge base
                </p>
              </div>
            )}
            
            {documents.length === 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 max-w-xs">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Upload documents first to ask questions about them
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary/50 text-foreground rounded-bl-md'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/30">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            className="min-h-[44px] max-h-32 resize-none bg-secondary/30"
            disabled={isLoading}
          />
          <Button
            variant="hero"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default RAGChat;
