// Hand-written to match supabase/migrations/0001_init.sql and 0002_rls.sql.
// Once the Supabase project is linked, regenerate with:
//   npx supabase gen types typescript --linked > lib/types.ts
//
// Relationships are left empty (rather than precisely modeled) since hand
// -maintaining postgrest-js's embedded-select type inference isn't worth it
// for a stub that's replaced by the real generated types after setup.

export type MemberRole = "owner" | "editor" | "viewer";
export type MemberStatus = "invited" | "active";
export type BidStatus = "sent" | "estimate" | "actual";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
        };
        Update: {
          display_name?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          sqft: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          sqft?: number | null;
          created_by: string;
        };
        Update: {
          name?: string;
          address?: string | null;
          sqft?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string | null;
          invited_email: string;
          role: MemberRole;
          status: MemberStatus;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          invited_email: string;
          role?: MemberRole;
          invited_by?: string | null;
        };
        Update: {
          role?: MemberRole;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          notes: string | null;
          category_names: string[];
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          notes?: string | null;
          category_names?: string[];
          created_by?: string | null;
        };
        Update: {
          name?: string;
          notes?: string | null;
          category_names?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trades: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          qty: number;
          sort_order: number;
          excluded_from_vertical: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          qty?: number;
          sort_order?: number;
          excluded_from_vertical?: boolean;
        };
        Update: {
          name?: string;
          qty?: number;
          sort_order?: number;
          excluded_from_vertical?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "trades_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      bids: {
        Row: {
          id: string;
          trade_id: string;
          company_id: string | null;
          amount: number | null;
          status: BidStatus;
          is_winner: boolean;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trade_id: string;
          company_id?: string | null;
          amount?: number | null;
          status?: BidStatus;
          is_winner?: boolean;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          company_id?: string | null;
          amount?: number | null;
          status?: BidStatus;
          is_winner?: boolean;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bids_trade_id_fkey";
            columns: ["trade_id"];
            isOneToOne: false;
            referencedRelation: "trades";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bids_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bids_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      company_contacts: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          sort_order?: number;
        };
        Update: {
          name?: string;
          phone?: string | null;
          email?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "company_contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      project_totals: {
        Row: {
          project_id: string;
          grand_total: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      accept_project_invite: {
        Args: { p_project_id: string };
        Returns: void;
      };
    };
  };
}
