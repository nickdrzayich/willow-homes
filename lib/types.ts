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
export type ExpenseCategory =
  | "subcontractor"
  | "material"
  | "permit_fee"
  | "general_conditions"
  | "change_order"
  | "allowance_overage"
  | "unforeseen_condition"
  | "other";
export type ExpensePaidStatus = "unpaid" | "paid";
export type InvoiceStatus = "draft" | "sent" | "paid";
export type TransactionType = "deposit" | "withdrawal";

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
          builder_fee_percent: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          sqft?: number | null;
          builder_fee_percent?: number;
          created_by: string;
        };
        Update: {
          name?: string;
          address?: string | null;
          sqft?: number | null;
          builder_fee_percent?: number;
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
          archived_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          notes?: string | null;
          category_names?: string[];
          archived_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          notes?: string | null;
          category_names?: string[];
          archived_at?: string | null;
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
      monthly_invoices: {
        Row: {
          id: string;
          project_id: string;
          period_start: string;
          period_end: string;
          status: InvoiceStatus;
          subtotal: number;
          builder_fee_percent: number;
          builder_fee_amount: number;
          total: number;
          sent_at: string | null;
          paid_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          period_start: string;
          period_end: string;
          status?: InvoiceStatus;
          subtotal?: number;
          builder_fee_percent: number;
          builder_fee_amount?: number;
          total?: number;
          sent_at?: string | null;
          paid_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          status?: InvoiceStatus;
          sent_at?: string | null;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "monthly_invoices_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          project_id: string;
          invoice_id: string | null;
          expense_date: string;
          category: ExpenseCategory;
          vendor_name: string | null;
          description: string | null;
          amount: number;
          billable: boolean;
          paid_status: ExpensePaidStatus;
          paid_date: string | null;
          invoice_file_path: string | null;
          invoice_file_name: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          invoice_id?: string | null;
          expense_date?: string;
          category?: ExpenseCategory;
          vendor_name?: string | null;
          description?: string | null;
          amount: number;
          billable?: boolean;
          paid_status?: ExpensePaidStatus;
          paid_date?: string | null;
          invoice_file_path?: string | null;
          invoice_file_name?: string | null;
          created_by?: string | null;
        };
        Update: {
          invoice_id?: string | null;
          expense_date?: string;
          category?: ExpenseCategory;
          vendor_name?: string | null;
          description?: string | null;
          amount?: number;
          billable?: boolean;
          paid_status?: ExpensePaidStatus;
          paid_date?: string | null;
          invoice_file_path?: string | null;
          invoice_file_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "monthly_invoices";
            referencedColumns: ["id"];
          },
        ];
      };
      account_transactions: {
        Row: {
          id: string;
          project_id: string;
          transaction_date: string;
          type: TransactionType;
          amount: number;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          transaction_date?: string;
          type: TransactionType;
          amount: number;
          description?: string | null;
          created_by?: string | null;
        };
        Update: {
          transaction_date?: string;
          type?: TransactionType;
          amount?: number;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "account_transactions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
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
