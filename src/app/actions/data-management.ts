"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";

export interface BackupSchedule {
  id?: string;
  user_id?: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string; // HH:MM format
  enabled: boolean;
  retention_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface DataImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

export interface DataValidationRule {
  field: string;
  type: "required" | "email" | "phone" | "number" | "date" | "custom";
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: (value: any) => boolean;
}

// Create automated backup
export async function createAutomatedBackup() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get all user data
    const [
      { data: products },
      { data: customers },
      { data: suppliers },
      { data: invoices },
      { data: purchaseOrders },
      { data: deliveries },
      { data: payments },
      { data: expenses },
      { data: businessProfile },
      { data: systemPreferences },
      { data: notificationSettings }
    ] = await Promise.all([
      supabase.from("products").select("*").eq("user_id", user.id),
      supabase.from("customers").select("*").eq("user_id", user.id),
      supabase.from("suppliers").select("*").eq("user_id", user.id),
      supabase.from("invoices").select("*").eq("user_id", user.id),
      supabase.from("purchase_orders").select("*").eq("user_id", user.id),
      supabase.from("deliveries").select("*").eq("user_id", user.id),
      supabase.from("payments").select("*").eq("user_id", user.id),
      supabase.from("expenses").select("*").eq("user_id", user.id),
      supabase.from("business_profiles").select("*").eq("user_id", user.id),
      supabase.from("system_preferences").select("*").eq("user_id", user.id),
      supabase.from("notification_settings").select("*").eq("user_id", user.id)
    ]);

    const backupData = {
      products: products || [],
      customers: customers || [],
      suppliers: suppliers || [],
      invoices: invoices || [],
      purchaseOrders: purchaseOrders || [],
      deliveries: deliveries || [],
      payments: payments || [],
      expenses: expenses || [],
      businessProfile: businessProfile || null,
      systemPreferences: systemPreferences || null,
      notificationSettings: notificationSettings || null,
      backupDate: new Date().toISOString(),
      userId: user.id
    };

    // Create backup record
    const { data: backupRecord, error: backupError } = await supabase
      .from("backups")
      .insert({
        user_id: user.id,
        backup_type: "automatic",
        status: "completed",
        file_size: JSON.stringify(backupData).length,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (backupError) {
      return { success: false, error: backupError.message };
    }

    // Store backup data in a separate table or file storage
    const { error: dataError } = await supabase
      .from("backup_data")
      .insert({
        backup_id: backupRecord.id,
        data: backupData,
        created_at: new Date().toISOString(),
      });

    if (dataError) {
      console.error("Error storing backup data:", dataError);
    }

    return { success: true, data: backupRecord };
  } catch (error) {
    console.error("Error creating automated backup:", error);
    return { success: false, error: "Failed to create automated backup" };
  }
}

// Get backup schedule
export async function getBackupSchedule() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("backup_schedules")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return { success: false, error: error.message };
    }

    // Return default schedule if none exists
    const defaultSchedule: BackupSchedule = {
      frequency: "daily",
      time: "02:00",
      enabled: true,
      retention_days: 30,
    };

    return { success: true, data: data || defaultSchedule };
  } catch (error) {
    console.error("Error getting backup schedule:", error);
    return { success: false, error: "Failed to get backup schedule" };
  }
}

// Update backup schedule
export async function updateBackupSchedule(schedule: Partial<BackupSchedule>) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("backup_schedules")
      .upsert({
        user_id: user.id,
        ...schedule,
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
    console.error("Error updating backup schedule:", error);
    return { success: false, error: "Failed to update backup schedule" };
  }
}

// Import data from various formats
export async function importData(
  data: any,
  format: "csv" | "json" | "excel",
  table: string
): Promise<DataImportResult> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, imported: 0, failed: 0, errors: ["Not authenticated"], warnings: [] };
    }

    let records: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse data based on format
    switch (format) {
      case "json":
        records = Array.isArray(data) ? data : [data];
        break;
      case "csv":
        records = parseCSVData(data);
        break;
      case "excel":
        records = parseExcelData(data);
        break;
      default:
        return { success: false, imported: 0, failed: 0, errors: ["Unsupported format"], warnings: [] };
    }

    // Validate and transform records
    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const validation = validateRecord(record, table);
      
      if (validation.isValid) {
        validatedRecords.push({
          ...record,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        errors.push(`Row ${i + 1}: ${validation.errors.join(", ")}`);
      }
    }

    // Insert validated records
    if (validatedRecords.length > 0) {
      const { error: insertError } = await supabase
        .from(table)
        .insert(validatedRecords);

      if (insertError) {
        errors.push(`Database error: ${insertError.message}`);
      }
    }

    const success = errors.length === 0;
    const imported = validatedRecords.length;
    const failed = records.length - validatedRecords.length;

    if (success) {
      revalidatePath("/dashboard");
    }

    return {
      success,
      imported,
      failed,
      errors,
      warnings,
    };
  } catch (error) {
    console.error("Error importing data:", error);
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: ["Failed to import data"],
      warnings: [],
    };
  }
}

// Validate data record
function validateRecord(record: any, table: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validationRules = getValidationRules(table);

  for (const rule of validationRules) {
    const value = record[rule.field];
    
    if (rule.type === "required" && (!value || value.toString().trim() === "")) {
      errors.push(`${rule.field} is required`);
      continue;
    }

    if (value && rule.type === "email" && !isValidEmail(value)) {
      errors.push(`${rule.field} must be a valid email`);
    }

    if (value && rule.type === "phone" && !isValidPhone(value)) {
      errors.push(`${rule.field} must be a valid phone number`);
    }

    if (value && rule.type === "number") {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${rule.field} must be a number`);
      } else if (rule.min !== undefined && numValue < rule.min) {
        errors.push(`${rule.field} must be at least ${rule.min}`);
      } else if (rule.max !== undefined && numValue > rule.max) {
        errors.push(`${rule.field} must be at most ${rule.max}`);
      }
    }

    if (value && rule.type === "date" && !isValidDate(value)) {
      errors.push(`${rule.field} must be a valid date`);
    }

    if (value && rule.pattern && !new RegExp(rule.pattern).test(value)) {
      errors.push(`${rule.field} format is invalid`);
    }

    if (value && rule.customValidator && !rule.customValidator(value)) {
      errors.push(`${rule.field} validation failed`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Get validation rules for different tables
function getValidationRules(table: string): DataValidationRule[] {
  const commonRules: DataValidationRule[] = [
    { field: "created_at", type: "date" },
    { field: "updated_at", type: "date" },
  ];

  switch (table) {
    case "products":
      return [
        { field: "name", type: "required" },
        { field: "price", type: "number", min: 0 },
        { field: "stock_quantity", type: "number", min: 0 },
        ...commonRules,
      ];
    case "customers":
      return [
        { field: "name", type: "required" },
        { field: "email", type: "email" },
        { field: "phone", type: "phone" },
        ...commonRules,
      ];
    case "suppliers":
      return [
        { field: "name", type: "required" },
        { field: "email", type: "email" },
        { field: "phone", type: "phone" },
        ...commonRules,
      ];
    case "invoices":
      return [
        { field: "invoice_number", type: "required" },
        { field: "total_amount", type: "number", min: 0 },
        { field: "customer_id", type: "required" },
        ...commonRules,
      ];
    default:
      return commonRules;
  }
}

// Helper validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

function isValidDate(date: string): boolean {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

// Parse CSV data
function parseCSVData(csvString: string): any[] {
  const lines = csvString.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }
  }

  return records;
}

// Parse Excel data (simplified - in real app, use a library like xlsx)
function parseExcelData(data: any): any[] {
  // This is a simplified implementation
  // In a real application, you would use a library like 'xlsx'
  return Array.isArray(data) ? data : [data];
}

// Bulk delete records
export async function bulkDeleteRecords(table: string, recordIds: string[]) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .in("id", recordIds)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, deleted: recordIds.length };
  } catch (error) {
    console.error("Error bulk deleting records:", error);
    return { success: false, error: "Failed to delete records" };
  }
}

// Bulk update records
export async function bulkUpdateRecords(
  table: string,
  recordIds: string[],
  updates: any
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from(table)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in("id", recordIds)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, updated: recordIds.length };
  } catch (error) {
    console.error("Error bulk updating records:", error);
    return { success: false, error: "Failed to update records" };
  }
}

// Get data retention statistics
export async function getDataRetentionStats() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const [
      { count: productsCount },
      { count: customersCount },
      { count: suppliersCount },
      { count: invoicesCount },
      { count: backupsCount },
      { count: auditLogsCount }
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("suppliers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("backups").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("audit_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id)
    ]);

    return {
      success: true,
      data: {
        products: productsCount || 0,
        customers: customersCount || 0,
        suppliers: suppliersCount || 0,
        invoices: invoicesCount || 0,
        backups: backupsCount || 0,
        auditLogs: auditLogsCount || 0,
        totalRecords: (productsCount || 0) + (customersCount || 0) + (suppliersCount || 0) + (invoicesCount || 0),
      }
    };
  } catch (error) {
    console.error("Error getting data retention stats:", error);
    return { success: false, error: "Failed to get data retention stats" };
  }
}

// Clean up old data based on retention policy
export async function cleanupOldData(retentionDays: number = 365) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Clean up old audit logs
    const { error: auditError } = await supabase
      .from("audit_logs")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", cutoffDate.toISOString());

    if (auditError) {
      console.error("Error cleaning up audit logs:", auditError);
    }

    // Clean up old backups
    const { error: backupError } = await supabase
      .from("backups")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", cutoffDate.toISOString());

    if (backupError) {
      console.error("Error cleaning up backups:", backupError);
    }

    return { success: true, cleaned: true };
  } catch (error) {
    console.error("Error cleaning up old data:", error);
    return { success: false, error: "Failed to clean up old data" };
  }
} 