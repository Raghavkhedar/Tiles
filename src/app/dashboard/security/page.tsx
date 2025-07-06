"use client";

import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Activity,
  Clock,
  MapPin,
  User,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { useUser } from "@/contexts/user-context";
import {
  getAuditLogs,
  getSecurityDashboard,
  exportSecurityLogs,
  getSecuritySettings,
  updateSecuritySettings,
  validatePasswordStrength,
} from "@/app/actions/security";

interface SecurityDashboard {
  recentLogs: any[];
  failedLoginsCount: number;
  uniqueIPs: number;
  lastLogin: string;
  securityScore: number;
}

interface SecuritySettings {
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
  ip_whitelist: string[];
}

export default function SecurityPage() {
  const { user, hasPermission } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<SecurityDashboard | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    table_name: "",
    date_from: "",
    date_to: "",
  });

  const canAccessSecurity = hasPermission("security", "view");

  useEffect(() => {
    if (canAccessSecurity) {
      loadDashboardData();
      loadAuditLogs();
      loadSecuritySettings();
    }
  }, [canAccessSecurity]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const result = await getSecurityDashboard();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs(currentPage, 20, filters);
      if (result.success) {
        setAuditLogs(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const result = await getSecuritySettings();
      if (result.success) {
        setSecuritySettings(result.data);
      }
    } catch (error) {
      console.error("Error loading security settings:", error);
    }
  };

  const handleExportLogs = async (format: "csv" | "json") => {
    setLoading(true);
    try {
      const result = await exportSecurityLogs(format);
      if (result.success) {
        // Create and download file
        const blob = new Blob([result.data], { type: format === "json" ? "application/json" : "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: `Security logs exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export security logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecuritySettings = async (settings: Partial<SecuritySettings>) => {
    setLoading(true);
    try {
      const result = await updateSecuritySettings(settings);
      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Security settings have been updated successfully.",
        });
        loadSecuritySettings();
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Define a type-safe mapping for action to variant
  const actionToVariant: Record<string, "success" | "info" | "error" | "secondary"> = {
    INSERT: "success",
    UPDATE: "info",
    DELETE: "error",
    LOGIN_SUCCESS: "success",
    LOGIN_FAILED: "error",
  };
  const getActionVariant = (action: string) => actionToVariant[action] || "secondary";

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-status-success";
    if (score >= 60) return "text-status-warning";
    return "text-status-error";
  };

  if (!canAccessSecurity) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-muted min-h-screen pb-24">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">
                  You don't have permission to access security features.
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Security" }]} />

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Security Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor security events, audit logs, and manage security settings
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Security Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "audit" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("audit")}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Audit Logs
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Security Settings
            </Button>
          </div>

          {/* Security Content */}
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === "overview" && dashboardData && (
              <div className="space-y-6">
                {/* Security Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Score
                    </CardTitle>
                    <CardDescription>
                      Overall security health of your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-6xl font-bold mb-4 ${getSecurityScoreColor(dashboardData.securityScore)}`}>
                        {dashboardData.securityScore}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">out of 100</div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dashboardData.securityScore >= 80 ? "bg-status-success" :
                            dashboardData.securityScore >= 60 ? "bg-status-warning" : "bg-status-error"
                          }`}
                          style={{ width: `${dashboardData.securityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Failed Login Attempts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-status-error">
                          {dashboardData.failedLoginsCount}
                        </div>
                        <AlertTriangle className="w-5 h-5 text-status-error" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Unique IP Addresses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-status-info">
                          {dashboardData.uniqueIPs}
                        </div>
                        <MapPin className="w-5 h-5 text-status-info" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Last Login
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {dashboardData.lastLogin ? new Date(dashboardData.lastLogin).toLocaleDateString() : "N/A"}
                        </div>
                        <Clock className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Recent activity</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest security events and activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentLogs.slice(0, 5).map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={getActionVariant(log.action)}>
                              {log.action}
                            </Badge>
                            <div>
                              <div className="font-medium">{log.table_name || "System"}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(log.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.ip_address}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === "audit" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription>
                    Detailed log of all security events and activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <Label htmlFor="action-filter">Action</Label>
                      <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Actions</SelectItem>
                          <SelectItem value="INSERT">Insert</SelectItem>
                          <SelectItem value="UPDATE">Update</SelectItem>
                          <SelectItem value="DELETE">Delete</SelectItem>
                          <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
                          <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="table-filter">Table</Label>
                      <Select value={filters.table_name} onValueChange={(value) => setFilters({ ...filters, table_name: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Tables" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Tables</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="customers">Customers</SelectItem>
                          <SelectItem value="suppliers">Suppliers</SelectItem>
                          <SelectItem value="invoices">Invoices</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date-from">From Date</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-to">To Date</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportLogs("csv")}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportLogs("json")}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="space-y-4">
                    {auditLogs.map((log, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getActionVariant(log.action)}>
                              {log.action}
                            </Badge>
                            {log.table_name && (
                              <Badge variant="outline">{log.table_name}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">IP Address:</span> {log.ip_address}
                          </div>
                          <div>
                            <span className="font-medium">User Agent:</span> {log.user_agent?.substring(0, 50)}...
                          </div>
                          {log.record_id && (
                            <div>
                              <span className="font-medium">Record ID:</span> {log.record_id}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings Tab */}
            {activeTab === "settings" && securitySettings && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure security preferences and policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {securitySettings.two_factor_enabled ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Lock className="w-3 h-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateSecuritySettings({
                          two_factor_enabled: !securitySettings.two_factor_enabled
                        })}
                        disabled={loading}
                      >
                        {securitySettings.two_factor_enabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Session Timeout */}
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="session-timeout"
                        type="number"
                        value={securitySettings.session_timeout}
                        onChange={(e) => handleUpdateSecuritySettings({
                          session_timeout: Number(e.target.value)
                        })}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500">minutes</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Password Policy */}
                  <div>
                    <Label>Password Policy</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="min-length">Minimum Length</Label>
                        <Input
                          id="min-length"
                          type="number"
                          value={securitySettings.password_policy.min_length}
                          onChange={(e) => handleUpdateSecuritySettings({
                            password_policy: {
                              ...securitySettings.password_policy,
                              min_length: Number(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="require-uppercase"
                            checked={securitySettings.password_policy.require_uppercase}
                            onChange={(e) => handleUpdateSecuritySettings({
                              password_policy: {
                                ...securitySettings.password_policy,
                                require_uppercase: e.target.checked
                              }
                            })}
                          />
                          <Label htmlFor="require-uppercase">Require Uppercase</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="require-lowercase"
                            checked={securitySettings.password_policy.require_lowercase}
                            onChange={(e) => handleUpdateSecuritySettings({
                              password_policy: {
                                ...securitySettings.password_policy,
                                require_lowercase: e.target.checked
                              }
                            })}
                          />
                          <Label htmlFor="require-lowercase">Require Lowercase</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="require-numbers"
                            checked={securitySettings.password_policy.require_numbers}
                            onChange={(e) => handleUpdateSecuritySettings({
                              password_policy: {
                                ...securitySettings.password_policy,
                                require_numbers: e.target.checked
                              }
                            })}
                          />
                          <Label htmlFor="require-numbers">Require Numbers</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="require-special"
                            checked={securitySettings.password_policy.require_special}
                            onChange={(e) => handleUpdateSecuritySettings({
                              password_policy: {
                                ...securitySettings.password_policy,
                                require_special: e.target.checked
                              }
                            })}
                          />
                          <Label htmlFor="require-special">Require Special Characters</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 