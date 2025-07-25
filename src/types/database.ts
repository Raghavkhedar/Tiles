// Database types for TileManager Pro
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          gst_number: string | null
          credit_limit: number
          payment_terms: string
          status: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          credit_limit?: number
          payment_terms?: string
          status?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          credit_limit?: number
          payment_terms?: string
          status?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          gst_number: string | null
          pan_number: string | null
          credit_limit: number
          payment_terms: string | null
          rating: number
          status: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          pan_number?: string | null
          credit_limit?: number
          payment_terms?: string | null
          rating?: number
          status?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          pan_number?: string | null
          credit_limit?: number
          payment_terms?: string | null
          rating?: number
          status?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string
          category_id: string | null
          brand: string | null
          description: string | null
          length: number | null
          width: number | null
          thickness: number | null
          tiles_per_box: number
          area_per_box: number
          weight_per_box: number | null
          price_per_box: number
          current_stock: number
          min_stock: number
          max_stock: number
          supplier_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku: string
          category_id?: string | null
          brand?: string | null
          description?: string | null
          length?: number | null
          width?: number | null
          thickness?: number | null
          tiles_per_box: number
          area_per_box: number
          weight_per_box?: number | null
          price_per_box: number
          current_stock?: number
          min_stock?: number
          max_stock?: number
          supplier_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          category_id?: string | null
          brand?: string | null
          description?: string | null
          length?: number | null
          width?: number | null
          thickness?: number | null
          tiles_per_box?: number
          area_per_box?: number
          weight_per_box?: number | null
          price_per_box?: number
          current_stock?: number
          min_stock?: number
          max_stock?: number
          supplier_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          business_name: string | null
          business_address: string | null
          business_phone: string | null
          business_email: string | null
          gst_number: string | null
          pan_number: string | null
          gst_rate: number
          invoice_prefix: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name?: string | null
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          gst_number?: string | null
          pan_number?: string | null
          gst_rate?: number
          invoice_prefix?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          gst_number?: string | null
          pan_number?: string | null
          gst_rate?: number
          invoice_prefix?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      purchase_orders: {
        Row: {
          id: string
          po_number: string
          supplier_id: string
          order_date: string
          expected_delivery_date: string | null
          delivery_address: string | null
          contact_person: string | null
          phone: string | null
          subtotal: number
          gst_amount: number
          total_amount: number
          paid_amount: number
          balance_amount: number
          status: string
          payment_terms: string | null
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          po_number?: string
          supplier_id: string
          order_date: string
          expected_delivery_date?: string | null
          delivery_address?: string | null
          contact_person?: string | null
          phone?: string | null
          subtotal?: number
          gst_amount?: number
          total_amount?: number
          paid_amount?: number
          balance_amount?: number
          status?: string
          payment_terms?: string | null
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          po_number?: string
          supplier_id?: string
          order_date?: string
          expected_delivery_date?: string | null
          delivery_address?: string | null
          contact_person?: string | null
          phone?: string | null
          subtotal?: number
          gst_amount?: number
          total_amount?: number
          paid_amount?: number
          balance_amount?: number
          status?: string
          payment_terms?: string | null
          notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          product_id: string | null
          product_name: string
          sku: string | null
          quantity: number
          area: number
          unit_price: number
          total_price: number
          received_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          product_id?: string | null
          product_name: string
          sku?: string | null
          quantity: number
          area?: number
          unit_price: number
          total_price: number
          received_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          product_id?: string | null
          product_name?: string
          sku?: string | null
          quantity?: number
          area?: number
          unit_price?: number
          total_price?: number
          received_quantity?: number
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          customer_id: string
          invoice_date: string
          due_date: string
          subtotal: number
          cgst_amount: number
          sgst_amount: number
          igst_amount: number
          total_amount: number
          discount_amount: number
          tax_rate: number
          paid_amount: number
          balance_amount: number
          payment_terms: string
          status: string
          notes: string | null
          terms_conditions: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number?: string
          customer_id: string
          invoice_date: string
          due_date: string
          subtotal?: number
          cgst_amount?: number
          sgst_amount?: number
          igst_amount?: number
          total_amount?: number
          discount_amount?: number
          tax_rate?: number
          paid_amount?: number
          balance_amount?: number
          payment_terms?: string
          status?: string
          notes?: string | null
          terms_conditions?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_id?: string
          invoice_date?: string
          due_date?: string
          subtotal?: number
          cgst_amount?: number
          sgst_amount?: number
          igst_amount?: number
          total_amount?: number
          discount_amount?: number
          tax_rate?: number
          paid_amount?: number
          balance_amount?: number
          payment_terms?: string
          status?: string
          notes?: string | null
          terms_conditions?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_price: number
          total_price: number
          tax_rate: number
          tax_amount: number
          discount_percent: number
          discount_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          unit_price: number
          total_price: number
          tax_rate?: number
          tax_amount?: number
          discount_percent?: number
          discount_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          tax_rate?: number
          tax_amount?: number
          discount_percent?: number
          discount_amount?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          payment_date: string
          amount: number
          payment_method: string
          reference_number: string | null
          notes: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          payment_date: string
          amount: number
          payment_method: string
          reference_number?: string | null
          notes?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          payment_date?: string
          amount?: number
          payment_method?: string
          reference_number?: string | null
          notes?: string | null
          user_id?: string
          created_at?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          delivery_number: string
          customer_id: string
          delivery_date: string
          delivery_address: string | null
          contact_person: string | null
          phone: string | null
          status: string
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          delivery_number: string
          customer_id: string
          delivery_date: string
          delivery_address?: string | null
          contact_person?: string | null
          phone?: string | null
          status?: string
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          delivery_number?: string
          customer_id?: string
          delivery_date?: string
          delivery_address?: string | null
          contact_person?: string | null
          phone?: string | null
          status?: string
          notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      delivery_items: {
        Row: {
          id: string
          delivery_id: string
          product_id: string
          quantity: number
          area_covered: number | null
          created_at: string
        }
        Insert: {
          id?: string
          delivery_id: string
          product_id: string
          quantity: number
          area_covered?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          delivery_id?: string
          product_id?: string
          quantity?: number
          area_covered?: number | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          expense_date: string
          category: string
          description: string
          amount: number
          payment_method: string
          reference_number: string | null
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expense_date: string
          category: string
          description: string
          amount: number
          payment_method?: string
          reference_number?: string | null
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expense_date?: string
          category?: string
          description?: string
          amount?: number
          payment_method?: string
          reference_number?: string | null
          notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      expense_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
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
  }
}

// Type aliases for easier use
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Setting = Database['public']['Tables']['settings']['Row']
export type SettingInsert = Database['public']['Tables']['settings']['Insert']
export type SettingUpdate = Database['public']['Tables']['settings']['Update']

export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert']
export type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update']

export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row']
export type PurchaseOrderItemInsert = Database['public']['Tables']['purchase_order_items']['Insert']
export type PurchaseOrderItemUpdate = Database['public']['Tables']['purchase_order_items']['Update']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert']
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export type Delivery = Database['public']['Tables']['deliveries']['Row']
export type DeliveryInsert = Database['public']['Tables']['deliveries']['Insert']
export type DeliveryUpdate = Database['public']['Tables']['deliveries']['Update']

export type DeliveryItem = Database['public']['Tables']['delivery_items']['Row']
export type DeliveryItemInsert = Database['public']['Tables']['delivery_items']['Insert']
export type DeliveryItemUpdate = Database['public']['Tables']['delivery_items']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
export type ExpenseCategoryInsert = Database['public']['Tables']['expense_categories']['Insert']
export type ExpenseCategoryUpdate = Database['public']['Tables']['expense_categories']['Update']

// Extended types with relationships
export interface ProductWithRelations extends Product {
  category?: Category
  supplier?: Supplier
}

export interface PurchaseOrderWithRelations extends PurchaseOrder {
  supplier?: Supplier
  items?: PurchaseOrderItemWithProduct[]
}

export interface PurchaseOrderItemWithProduct extends PurchaseOrderItem {
  product?: Product
}

export interface InvoiceWithRelations extends Invoice {
  customer?: Customer
  items?: InvoiceItemWithProduct[]
  payments?: Payment[]
}

export interface InvoiceItemWithProduct extends InvoiceItem {
  product?: Product
}

export interface DeliveryWithRelations extends Delivery {
  customer?: Customer
  items?: DeliveryItemWithProduct[]
}

export interface DeliveryItemWithProduct extends DeliveryItem {
  product?: Product
}

// Tax Rate type for GST slabs
export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Updated extended types for new billing system
export interface PaymentWithRelations extends Payment {
  invoice?: InvoiceWithRelations;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface UserPermissions {
  inventory: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  customers: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  suppliers: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  billing: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  purchase_orders: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  deliveries: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  reports: {
    view: boolean;
    export: boolean;
  };
  settings: {
    view: boolean;
    edit: boolean;
  };
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  security: {
    view: boolean;
    edit: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
} 

 