export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

export type Database = {
  public: {
    Tables: {
      annotation_pages: {
        Row: {
          club_book_id: string;
          created_at: string;
          id: string;
          page_index: number;
          revision: number;
          strokes: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          club_book_id: string;
          created_at?: string;
          id?: string;
          page_index: number;
          revision?: number;
          strokes?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          club_book_id?: string;
          created_at?: string;
          id?: string;
          page_index?: number;
          revision?: number;
          strokes?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      book_files: {
        Row: {
          book_id: string;
          created_at: string;
          file_hash: string;
          id: string;
          mime_type: string;
          page_count: number;
          storage_path: string;
        };
        Insert: {
          book_id: string;
          created_at?: string;
          file_hash: string;
          id?: string;
          mime_type: string;
          page_count: number;
          storage_path: string;
        };
        Update: {
          book_id?: string;
          created_at?: string;
          file_hash?: string;
          id?: string;
          mime_type?: string;
          page_count?: number;
          storage_path?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          author: string | null;
          created_at: string;
          created_by_user_id: string;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author?: string | null;
          created_at?: string;
          created_by_user_id: string;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author?: string | null;
          created_at?: string;
          created_by_user_id?: string;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      club_books: {
        Row: {
          added_by_user_id: string | null;
          book_file_id: string | null;
          book_id: string;
          club_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          added_by_user_id?: string | null;
          book_file_id?: string | null;
          book_id: string;
          club_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          added_by_user_id?: string | null;
          book_file_id?: string | null;
          book_id?: string;
          club_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      club_members: {
        Row: {
          club_id: string;
          joined_at: string;
          role: "admin" | "member" | "owner";
          user_id: string;
        };
        Insert: {
          club_id: string;
          joined_at?: string;
          role?: "admin" | "member" | "owner";
          user_id: string;
        };
        Update: {
          club_id?: string;
          joined_at?: string;
          role?: "admin" | "member" | "owner";
          user_id?: string;
        };
        Relationships: [];
      };
      clubs: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_user_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner_user_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_user_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      page_annotation_summaries: {
        Row: {
          club_book_id: string;
          last_annotated_at: string;
          page_index: number;
          stroke_count: number;
          user_id: string;
        };
        Insert: {
          club_book_id: string;
          last_annotated_at?: string;
          page_index: number;
          stroke_count?: number;
          user_id: string;
        };
        Update: {
          club_book_id?: string;
          last_annotated_at?: string;
          page_index?: number;
          stroke_count?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_club_with_owner: {
        Args: { club_name: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
