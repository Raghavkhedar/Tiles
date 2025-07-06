"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";

export interface BusinessProfile {
  id?: string;
  company_name: string;
  gst_number?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SystemPreferences {
  id?: string;
  default_tax_rate: number;
  invoice_prefix: string;
  currency: string;
  date_format: string;
  time_format: string;
  auto_backup: boolean;
  backup_frequency: string;
  session_timeout: number;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationSettings {
  id?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  low_stock_alerts: boolean;
  payment_reminders: boolean;
  delivery_updates: boolean;
  low_stock_threshold: number;
  reminder_frequency: string;
  created_at?: string;
  updated_at?: string;
}

// Get business profile
export async function getBusinessProfile() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error) {
    console.error("Error getting business profile:", error);
    return { success: false, error: "Failed to get business profile" };
  }
}

// Update business profile
export async function updateBusinessProfile(profile: Partial<BusinessProfile>) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("business_profiles")
      .upsert({
        user_id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating business profile:", error);
    return { success: false, error: "Failed to update business profile" };
  }
}

// Get system preferences
export async function getSystemPreferences() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("system_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error) {
    console.error("Error getting system preferences:", error);
    return { success: false, error: "Failed to get system preferences" };
  }
}

// Update system preferences
export async function updateSystemPreferences(preferences: Partial<SystemPreferences>) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("system_preferences")
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating system preferences:", error);
    return { success: false, error: "Failed to update system preferences" };
  }
}

// Get notification settings
export async function getNotificationSettings() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return { success: false, error: "Failed to get notification settings" };
  }
}

// Update notification settings
export async function updateNotificationSettings(settings: Partial<NotificationSettings>) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("notification_settings")
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
}

// Export data
export async function exportData(format: "csv" | "json" | "excel") {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get all data for the user
    const [
      { data: products },
      { data: customers },
      { data: suppliers },
      { data: invoices },
      { data: purchaseOrders },
      { data: deliveries },
      { data: payments },
      { data: expenses }
    ] = await Promise.all([
      supabase.from("products").select("*").eq("user_id", user.id),
      supabase.from("customers").select("*").eq("user_id", user.id),
      supabase.from("suppliers").select("*").eq("user_id", user.id),
      supabase.from("invoices").select("*").eq("user_id", user.id),
      supabase.from("purchase_orders").select("*").eq("user_id", user.id),
      supabase.from("deliveries").select("*").eq("user_id", user.id),
      supabase.from("payments").select("*").eq("user_id", user.id),
      supabase.from("expenses").select("*").eq("user_id", user.id)
    ]);

    const exportData = {
      products: products || [],
      customers: customers || [],
      suppliers: suppliers || [],
      invoices: invoices || [],
      purchaseOrders: purchaseOrders || [],
      deliveries: deliveries || [],
      payments: payments || [],
      expenses: expenses || [],
      exportedAt: new Date().toISOString(),
      userId: user.id
    };

    let data: string;
    let filename: string;

    switch (format) {
      case "json":
        data = JSON.stringify(exportData, null, 2);
        filename = `tilemanager-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case "csv":
        // Convert to CSV format
        const csvData = convertToCSV(exportData);
        data = csvData;
        filename = `tilemanager-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case "excel":
        // For Excel, we'll return JSON and let the frontend handle conversion
        data = JSON.stringify(exportData, null, 2);
        filename = `tilemanager-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;
      default:
        return { success: false, error: "Unsupported format" };
    }

    return { success: true, data, filename };
  } catch (error) {
    console.error("Error exporting data:", error);
    return { success: false, error: "Failed to export data" };
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  const csvRows = [];
  
  // Add header
  csvRows.push("Table,Record Count,Last Updated");
  
  // Add data for each table
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      csvRows.push(`${key},${data[key].length},${new Date().toISOString()}`);
    }
  });
  
  return csvRows.join('\n');
}

// Backup data
export async function createBackup() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Create backup record
    const { data, error } = await supabase
      .from("backups")
      .insert({
        user_id: user.id,
        backup_type: "manual",
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating backup:", error);
    return { success: false, error: "Failed to create backup" };
  }
}

// Get backup history
export async function getBackupHistory() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("backups")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error getting backup history:", error);
    return { success: false, error: "Failed to get backup history" };
  }
} 