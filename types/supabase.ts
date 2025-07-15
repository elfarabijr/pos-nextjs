export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          permissions: string[]
          status: string
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: string
          permissions?: string[]
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          permissions?: string[]
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string
          color: string
          icon: string
          parent_id: number | null
          is_active: boolean
          sort_order: number
          product_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          color: string
          icon: string
          parent_id?: number | null
          is_active?: boolean
          sort_order?: number
          product_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          color?: string
          icon?: string
          parent_id?: number | null
          is_active?: boolean
          sort_order?: number
          product_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          category: string
          stock: number
          barcode: string
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          price: number
          category: string
          stock: number
          barcode: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price?: number
          category?: string
          stock?: number
          barcode?: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          customer_name: string | null
          customer_email: string | null
          total_amount: number
          tax_amount: number
          discount_amount: number
          payment_method: string
          status: string
          items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          customer_name?: string | null
          customer_email?: string | null
          total_amount: number
          tax_amount?: number
          discount_amount?: number
          payment_method: string
          status?: string
          items: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          customer_name?: string | null
          customer_email?: string | null
          total_amount?: number
          tax_amount?: number
          discount_amount?: number
          payment_method?: string
          status?: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
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
