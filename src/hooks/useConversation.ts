import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useConversation() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    setConversations(data.map(c => ({
      id: c.id,
      title: c.title,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    })));
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: new Date(m.created_at),
    })));
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: title || 'New Conversation',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }

    const newConversation: Conversation = {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(data.id);
    setMessages([]);
    
    return data.id;
  }, [user]);

  // Add message to conversation
  const addMessage = useCallback(async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ) => {
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    const newMessage: Message = {
      id: data.id,
      role: data.role as 'user' | 'assistant',
      content: data.content,
      createdAt: new Date(data.created_at),
    };

    setMessages(prev => [...prev, newMessage]);

    // Update conversation title if first user message
    if (role === 'user') {
      const messageCount = messages.filter(m => m.role === 'user').length;
      if (messageCount === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
        
        setConversations(prev => prev.map(c => 
          c.id === conversationId ? { ...c, title } : c
        ));
      } else {
        // Just update the timestamp
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    }

    return newMessage;
  }, [messages]);

  // Select conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await fetchMessages(conversationId);
  }, [fetchMessages]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }

    toast.success('Conversation deleted');
  }, [currentConversationId]);

  // Clear current conversation (start fresh without saving)
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Get conversation history for API calls
  const getConversationHistory = useCallback(() => {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [user, fetchConversations]);

  return {
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
    fetchConversations,
  };
}
