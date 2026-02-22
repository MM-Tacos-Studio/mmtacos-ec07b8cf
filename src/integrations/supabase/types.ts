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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cash_sessions: {
        Row: {
          cashier_name: string | null
          closed_at: string | null
          id: string
          notes: string | null
          opened_at: string
          opened_by: string | null
          operational_day_id: string | null
          session_code: string
          status: string
          total_orders: number | null
          total_sales: number | null
        }
        Insert: {
          cashier_name?: string | null
          closed_at?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          operational_day_id?: string | null
          session_code: string
          status?: string
          total_orders?: number | null
          total_sales?: number | null
        }
        Update: {
          cashier_name?: string | null
          closed_at?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          operational_day_id?: string | null
          session_code?: string
          status?: string
          total_orders?: number | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_operational_day_id_fkey"
            columns: ["operational_day_id"]
            isOneToOne: false
            referencedRelation: "operational_days"
            referencedColumns: ["id"]
          },
        ]
      }
      client_orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_type: string
          id: string
          order_details: Json
          order_type: string
          phone: string
          status: string
          total: number
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_type: string
          id?: string
          order_details?: Json
          order_type?: string
          phone: string
          status?: string
          total?: number
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_type?: string
          id?: string
          order_details?: Json
          order_type?: string
          phone?: string
          status?: string
          total?: number
        }
        Relationships: []
      }
      operational_days: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          day_code: string
          id: string
          opened_at: string
          opened_by: string | null
          status: string
          total_orders: number | null
          total_sales: number | null
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          day_code: string
          id?: string
          opened_at?: string
          opened_by?: string | null
          status?: string
          total_orders?: number | null
          total_sales?: number | null
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          day_code?: string
          id?: string
          opened_at?: string
          opened_by?: string | null
          status?: string
          total_orders?: number | null
          total_sales?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_paid: number
          change_amount: number
          client_name: string | null
          created_at: string
          created_by: string | null
          daily_sequence: number
          id: string
          items: Json
          note: string | null
          order_date: string
          order_number: string
          payment_method: string
          served_by: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          ticket_code: string | null
          total: number
        }
        Insert: {
          amount_paid?: number
          change_amount?: number
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          daily_sequence: number
          id?: string
          items?: Json
          note?: string | null
          order_date?: string
          order_number: string
          payment_method?: string
          served_by?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          ticket_code?: string | null
          total?: number
        }
        Update: {
          amount_paid?: number
          change_amount?: number
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          daily_sequence?: number
          id?: string
          items?: Json
          note?: string | null
          order_date?: string
          order_number?: string
          payment_method?: string
          served_by?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          ticket_code?: string | null
          total?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_daily_sequence: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
