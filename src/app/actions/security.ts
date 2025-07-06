"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export interface AuditLog {
  id?: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface SecuritySettings {
  id?: string;
  user_id?: string;
  two_factor_enabled: boolean;
  session_timeout: number;
  max_login_attempts: number;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
  };
  ip_whitelist?: string[];
  created_at?: string;
  updated_at?: string;
}

// Log audit event
export async function logAuditEvent(auditData: Omit<AuditLog, "id" | "created_at">) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const auditLog: Omit<AuditLog, "id" | "created_at"> = {
      user_id: user?.id,
      action: auditData.action,
      table_name: auditData.table_name,
      record_id: auditData.record_id,
      old_values: auditData.old_values,
      new_values: auditData.new_values,
      ip_address: headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown",
      user_agent: headersList.get("user-agent") || "unknown",
    };

    const { error } = await supabase
      .from("audit_logs")
      .insert(auditLog);

    if (error) {
      console.error("Error logging audit event:", error);
    }
  } catch (error) {
    console.error("Error in audit logging:", error);
  }
}

// Get audit logs
export async function getAuditLogs(
  page: number = 1,
  limit: number = 50,
  filters?: {
    action?: string;
    table_name?: string;
    date_from?: string;
    date_to?: string;
  }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.action && filters.action !== "all") {
      query = query.eq("action", filters.action);
    }
    if (filters?.table_name && filters.table_name !== "all") {
      query = query.eq("table_name", filters.table_name);
    }
    if (filters?.date_from) {
      query = query.gte("created_at", filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte("created_at", filters.date_to);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: data || [], 
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error("Error getting audit logs:", error);
    return { success: false, error: "Failed to get audit logs" };
  }
}

// Get security settings
export async function getSecuritySettings() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("security_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return { success: false, error: error.message };
    }

    // Return default settings if none exist
    const defaultSettings: SecuritySettings = {
      two_factor_enabled: false,
      session_timeout: 30,
      max_login_attempts: 5,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_special: true,
      },
      ip_whitelist: [],
    };

    return { success: true, data: data || defaultSettings };
  } catch (error) {
    console.error("Error getting security settings:", error);
    return { success: false, error: "Failed to get security settings" };
  }
}

// Update security settings
export async function updateSecuritySettings(settings: Partial<SecuritySettings>) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("security_settings")
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

    // Log the security settings update
    await logAuditEvent({
      action: "UPDATE",
      table_name: "security_settings",
      record_id: data.id,
      new_values: settings,
    });

    revalidatePath("/dashboard/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating security settings:", error);
    return { success: false, error: "Failed to update security settings" };
  }
}

// Validate password strength
export async function validatePasswordStrength(password: string) {
  const checks = {
    min_length: password.length >= 8,
    has_uppercase: /[A-Z]/.test(password),
    has_lowercase: /[a-z]/.test(password),
    has_number: /\d/.test(password),
    has_special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValid = Object.values(checks).every(Boolean);
  const score = Object.values(checks).filter(Boolean).length;

  return {
    isValid,
    score,
    checks,
    strength: score < 3 ? "weak" : score < 5 ? "medium" : "strong",
  };
}

// Check for suspicious activity
export async function checkSuspiciousActivity(userId: string) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

    // Check for multiple failed login attempts
    const { data: failedLogins, error: loginError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("action", "LOGIN_FAILED")
      .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

    if (loginError) {
      console.error("Error checking failed logins:", loginError);
      return { suspicious: false };
    }

    // Check for unusual IP addresses
    const { data: recentLogins, error: ipError } = await supabase
      .from("audit_logs")
      .select("ip_address, created_at")
      .eq("user_id", userId)
      .eq("action", "LOGIN_SUCCESS")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order("created_at", { ascending: false })
      .limit(10);

    if (ipError) {
      console.error("Error checking IP addresses:", ipError);
      return { suspicious: false };
    }

    const suspiciousActivity = {
      multiple_failed_attempts: (failedLogins?.length || 0) > 5,
      unusual_ip: recentLogins && recentLogins.length > 0 && 
                  !recentLogins.some(login => login.ip_address === ipAddress),
    };

    const isSuspicious = Object.values(suspiciousActivity).some(Boolean);

    return {
      suspicious: isSuspicious,
      details: suspiciousActivity,
      failed_attempts: failedLogins?.length || 0,
      recent_ips: recentLogins?.map(login => login.ip_address) || [],
    };
  } catch (error) {
    console.error("Error checking suspicious activity:", error);
    return { suspicious: false };
  }
}

// Rate limiting helper
export async function checkRateLimit(action: string, userId: string, limit: number = 10, windowMs: number = 60000) {
  try {
    const supabase = await createClient();
    const windowStart = new Date(Date.now() - windowMs).toISOString();

    const { data, error } = await supabase
      .from("audit_logs")
      .select("created_at")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", windowStart);

    if (error) {
      console.error("Error checking rate limit:", error);
      return { allowed: true };
    }

    const attempts = data?.length || 0;
    const allowed = attempts < limit;

    return {
      allowed,
      attempts,
      limit,
      remaining: Math.max(0, limit - attempts),
      resetTime: new Date(Date.now() + windowMs),
    };
  } catch (error) {
    console.error("Error in rate limiting:", error);
    return { allowed: true };
  }
}

// Get security dashboard data
export async function getSecurityDashboard() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get recent audit logs
    const { data: recentLogs } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get failed login attempts in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: failedLogins } = await supabase
      .from("audit_logs")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("action", "LOGIN_FAILED")
      .gte("created_at", yesterday);

    // Get unique IP addresses in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: ipAddresses } = await supabase
      .from("audit_logs")
      .select("ip_address")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo);

    const uniqueIPs = [...new Set(ipAddresses?.map(log => log.ip_address) || [])];

    return {
      success: true,
      data: {
        recentLogs: recentLogs || [],
        failedLoginsCount: failedLogins?.length || 0,
        uniqueIPs: uniqueIPs.length,
        lastLogin: recentLogs?.[0]?.created_at,
        securityScore: calculateSecurityScore(failedLogins?.length || 0, uniqueIPs.length),
      },
    };
  } catch (error) {
    console.error("Error getting security dashboard:", error);
    return { success: false, error: "Failed to get security dashboard" };
  }
}

// Calculate security score
function calculateSecurityScore(failedLogins: number, uniqueIPs: number): number {
  let score = 100;
  
  // Deduct points for failed logins
  score -= Math.min(30, failedLogins * 5);
  
  // Deduct points for too many unique IPs (potential security risk)
  if (uniqueIPs > 5) {
    score -= Math.min(20, (uniqueIPs - 5) * 2);
  }
  
  return Math.max(0, score);
}

// Export security logs
export async function exportSecurityLogs(format: "csv" | "json") {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const logs = data || [];
    let exportData: string;
    let filename: string;

    if (format === "csv") {
      const headers = ["Action", "Table", "Record ID", "IP Address", "User Agent", "Created At"];
      const csvContent = [
        headers.join(","),
        ...logs.map(log => [
          log.action,
          log.table_name || "",
          log.record_id || "",
          log.ip_address || "",
          (log.user_agent || "").replace(/"/g, '""'),
          new Date(log.created_at).toISOString()
        ].join(","))
      ].join("\n");
      
      exportData = csvContent;
      filename = `security_logs_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      exportData = JSON.stringify(logs, null, 2);
      filename = `security_logs_${new Date().toISOString().split('T')[0]}.json`;
    }

    return { success: true, data: exportData, filename };
  } catch (error) {
    console.error("Error exporting security logs:", error);
    return { success: false, error: "Failed to export security logs" };
  }
} 