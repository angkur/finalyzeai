export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          page_path: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          page_path?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          page_path?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_limits: {
        Row: {
          created_at: string
          daily_limit: number
          id: string
          is_blocked: boolean
          monthly_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number
          id?: string
          is_blocked?: boolean
          monthly_limit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_limit?: number
          id?: string
          is_blocked?: boolean
          monthly_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          chunk_position: string | null
          confidence_score: number | null
          content: string
          created_at: string
          document_id: string
          document_type: string | null
          embedding: string | null
          entities: Json | null
          id: string
          metadata: Json | null
          sentence_count: number | null
          user_id: string | null
          word_count: number | null
        }
        Insert: {
          chunk_index: number
          chunk_position?: string | null
          confidence_score?: number | null
          content: string
          created_at?: string
          document_id: string
          document_type?: string | null
          embedding?: string | null
          entities?: Json | null
          id?: string
          metadata?: Json | null
          sentence_count?: number | null
          user_id?: string | null
          word_count?: number | null
        }
        Update: {
          chunk_index?: number
          chunk_position?: string | null
          confidence_score?: number | null
          content?: string
          created_at?: string
          document_id?: string
          document_type?: string | null
          embedding?: string | null
          entities?: Json | null
          id?: string
          metadata?: Json | null
          sentence_count?: number | null
          user_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          error_message: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      few_shot_examples: {
        Row: {
          answer: string
          created_at: string
          embedding: string | null
          id: string
          quality_score: number | null
          question: string
          topic: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          answer: string
          created_at?: string
          embedding?: string | null
          id?: string
          quality_score?: number | null
          question: string
          topic: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          answer?: string
          created_at?: string
          embedding?: string | null
          id?: string
          quality_score?: number | null
          question?: string
          topic?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      interactions: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          metadata: Json | null
          query: string
          rating: number | null
          response: string
          user_id: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          query: string
          rating?: number | null
          response: string
          user_id?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          query?: string
          rating?: number | null
          response?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          is_active: boolean | null
          performance_score: number | null
          template: string
          updated_at: string
          version: number
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          performance_score?: number | null
          template: string
          updated_at?: string
          version?: number
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          performance_score?: number | null
          template?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string
          daily_limit: number
          expires_at: string | null
          history_retention_days: number
          id: string
          monthly_limit: number
          plan_name: string
          started_at: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          upload_limit_mb: number
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number
          expires_at?: string | null
          history_retention_days?: number
          id?: string
          monthly_limit?: number
          plan_name?: string
          started_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          upload_limit_mb?: number
          user_id: string
        }
        Update: {
          created_at?: string
          daily_limit?: number
          expires_at?: string | null
          history_retention_days?: number
          id?: string
          monthly_limit?: number
          plan_name?: string
          started_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          upload_limit_mb?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_plans_safe: {
        Row: {
          created_at: string | null
          daily_limit: number | null
          expires_at: string | null
          has_customer: boolean | null
          has_subscription: boolean | null
          history_retention_days: number | null
          id: string | null
          monthly_limit: number | null
          plan_name: string | null
          started_at: string | null
          updated_at: string | null
          upload_limit_mb: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          daily_limit?: number | null
          expires_at?: string | null
          has_customer?: never
          has_subscription?: never
          history_retention_days?: number | null
          id?: string | null
          monthly_limit?: number | null
          plan_name?: string | null
          started_at?: string | null
          updated_at?: string | null
          upload_limit_mb?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          daily_limit?: number | null
          expires_at?: string | null
          has_customer?: never
          has_subscription?: never
          history_retention_days?: number | null
          id?: string | null
          monthly_limit?: number | null
          plan_name?: string | null
          started_at?: string | null
          updated_at?: string | null
          upload_limit_mb?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hybrid_search_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_user_id?: string
          query_embedding: string
          search_keywords: string[]
        }
        Returns: {
          chunk_position: string
          combined_score: number
          confidence_score: number
          content: string
          document_id: string
          document_type: string
          id: string
          keyword_score: number
          metadata: Json
          similarity: number
        }[]
      }
      is_admin_or_moderator: { Args: { _user_id: string }; Returns: boolean }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_few_shot_examples: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          answer: string
          id: string
          quality_score: number
          question: string
          similarity: number
          topic: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
