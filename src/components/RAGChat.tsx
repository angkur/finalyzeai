import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageSquare, Plus, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useConversation, Message } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";

interface RAGChatProps {
  className?: string;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <MessageSquare className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Ask questions about your uploaded documents
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Follow-up questions will use conversation context
            </p>
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
