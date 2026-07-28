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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          ballot_number: number | null
          created_at: string | null
          full_name: string
          id: string
          party: string
          photo_source_url: string | null
          photo_url: string | null
          position: string
          tse_candidate_id: string | null
        }
        Insert: {
          ballot_number?: number | null
          created_at?: string | null
          full_name: string
          id?: string
          party: string
          photo_source_url?: string | null
          photo_url?: string | null
          position: string
          tse_candidate_id?: string | null
        }
        Update: {
          ballot_number?: number | null
          created_at?: string | null
          full_name?: string
          id?: string
          party?: string
          photo_source_url?: string | null
          photo_url?: string | null
          position?: string
          tse_candidate_id?: string | null
        }
        Relationships: []
      }
      claims: {
        Row: {
          candidate_id: string | null
          category: string
          confidence_score: number
          content: string
          created_at: string | null
          id: string
          previous_version_id: string | null
          published_at: string | null
          source_char_offset: number | null
          source_document_id: string | null
          status: string
        }
        Insert: {
          candidate_id?: string | null
          category: string
          confidence_score: number
          content: string
          created_at?: string | null
          id?: string
          previous_version_id?: string | null
          published_at?: string | null
          source_char_offset?: number | null
          source_document_id?: string | null
          status?: string
        }
        Update: {
          candidate_id?: string | null
          category?: string
          confidence_score?: number
          content?: string
          created_at?: string | null
          id?: string
          previous_version_id?: string | null
          published_at?: string | null
          source_char_offset?: number | null
          source_document_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "raw_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      editor_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      editorial_reviews: {
        Row: {
          claim_id: string | null
          decision: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
        }
        Insert: {
          claim_id?: string | null
          decision: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Update: {
          claim_id?: string | null
          decision?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_reviews_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_errors: {
        Row: {
          error_message: string
          id: string
          occurred_at: string | null
          resolved: boolean | null
          source_name: string
        }
        Insert: {
          error_message: string
          id?: string
          occurred_at?: string | null
          resolved?: boolean | null
          source_name: string
        }
        Update: {
          error_message?: string
          id?: string
          occurred_at?: string | null
          resolved?: boolean | null
          source_name?: string
        }
        Relationships: []
      }
      raw_documents: {
        Row: {
          content_hash: string
          fetched_at: string
          id: string
          raw_content: string
          source_category: string
          source_name: string
          url: string | null
        }
        Insert: {
          content_hash: string
          fetched_at?: string
          id?: string
          raw_content: string
          source_category: string
          source_name: string
          url?: string | null
        }
        Update: {
          content_hash?: string
          fetched_at?: string
          id?: string
          raw_content?: string
          source_category?: string
          source_name?: string
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

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
    Enums: {},
  },
} as const