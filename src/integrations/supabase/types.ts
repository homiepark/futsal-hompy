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
      archive_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "archive_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "archive_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_posts: {
        Row: {
          author_user_id: string
          content: string
          created_at: string
          folder_id: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          team_id: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_user_id: string
          content: string
          created_at?: string
          folder_id?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          team_id: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_user_id?: string
          content?: string
          created_at?: string
          folder_id?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          team_id?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_applications: {
        Row: {
          applicant_team_id: string
          applied_by_user_id: string
          created_at: string
          id: string
          match_post_id: string
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_team_id: string
          applied_by_user_id: string
          created_at?: string
          id?: string
          match_post_id: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_team_id?: string
          applied_by_user_id?: string
          created_at?: string
          id?: string
          match_post_id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_applications_applicant_team_id_fkey"
            columns: ["applicant_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_applications_match_post_id_fkey"
            columns: ["match_post_id"]
            isOneToOne: false
            referencedRelation: "match_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      match_posts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location_address: string | null
          location_name: string
          location_type: string
          match_date: string
          match_time_end: string
          match_time_start: string
          posted_by_user_id: string
          status: string
          target_levels: string[]
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location_address?: string | null
          location_name: string
          location_type?: string
          match_date: string
          match_time_end: string
          match_time_start: string
          posted_by_user_id: string
          status?: string
          target_levels?: string[]
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location_address?: string | null
          location_name?: string
          location_type?: string
          match_date?: string
          match_time_end?: string
          match_time_start?: string
          posted_by_user_id?: string
          status?: string
          target_levels?: string[]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          team_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          team_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_guestbook_entries: {
        Row: {
          author_user_id: string
          created_at: string
          id: string
          message: string
          target_user_id: string
        }
        Insert: {
          author_user_id: string
          created_at?: string
          id?: string
          message: string
          target_user_id: string
        }
        Update: {
          author_user_id?: string
          created_at?: string
          id?: string
          message?: string
          target_user_id?: string
        }
        Relationships: []
      }
      player_guestbook_likes: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_guestbook_likes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "player_guestbook_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          district: string | null
          id: string
          is_pro_elite: boolean
          nickname: string
          nickname_tag: string | null
          preferred_position: string | null
          preferred_regions: Json | null
          real_name: string | null
          region: string | null
          updated_at: string
          user_id: string
          years_of_experience: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_pro_elite?: boolean
          nickname?: string
          nickname_tag?: string | null
          preferred_position?: string | null
          preferred_regions?: Json | null
          real_name?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
          years_of_experience?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_pro_elite?: boolean
          nickname?: string
          nickname_tag?: string | null
          preferred_position?: string | null
          preferred_regions?: Json | null
          real_name?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string
          id: string
          invited_by_user_id: string
          invited_user_id: string
          message: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by_user_id: string
          invited_user_id: string
          message?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by_user_id?: string
          invited_user_id?: string
          message?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_join_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          status: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_join_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_notices: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_notices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          admin_user_id: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          district: string | null
          emblem: string
          gender: string | null
          home_ground_address: string | null
          home_ground_name: string | null
          id: string
          instagram_url: string | null
          introduction: string | null
          level: string
          name: string
          photo_url: string | null
          region: string | null
          training_days: string[] | null
          training_end_time: string | null
          training_start_time: string | null
          training_time: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          admin_user_id?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          emblem?: string
          gender?: string | null
          home_ground_address?: string | null
          home_ground_name?: string | null
          id?: string
          instagram_url?: string | null
          introduction?: string | null
          level?: string
          name: string
          photo_url?: string | null
          region?: string | null
          training_days?: string[] | null
          training_end_time?: string | null
          training_start_time?: string | null
          training_time?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          admin_user_id?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          emblem?: string
          gender?: string | null
          home_ground_address?: string | null
          home_ground_name?: string | null
          id?: string
          instagram_url?: string | null
          introduction?: string | null
          level?: string
          name?: string
          photo_url?: string | null
          region?: string | null
          training_days?: string[] | null
          training_end_time?: string | null
          training_start_time?: string | null
          training_time?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_team_admins: { Args: { _team_id: string }; Returns: number }
      generate_nickname_tag: { Args: never; Returns: string }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
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
    Enums: {},
  },
} as const
