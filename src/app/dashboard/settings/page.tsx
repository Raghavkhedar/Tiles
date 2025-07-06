"use client";

import React, { useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Settings,
  Building,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { useUser } from "@/contexts/user-context";
import { exportData } from "@/app/actions/settings";
import { exportToCSV, exportToJSON } from "@/lib/utils";

interface BusinessProfile {
  companyName: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

interface SystemPreferences {
  defaultTaxRate: number;
  invoicePrefix: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  autoBackup: boolean;
  backupFrequency: string;
  sessionTimeout: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
  deliveryUpdates: boolean;
  lowStockThreshold: number;
  reminderFrequency: string;
}

export default function SettingsPage() {
  const { user, hasPermission } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from database
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    companyName: "TileManager Pro",
    gstNumber: "22AAAAA0000A1Z5",
    address: "123 Business Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    phone: "+91 9876543210",
    email: "contact@tilemanager.com",
    website: "www.tilemanager.com",
  });

  const [systemPreferences, setSystemPreferences] = useState<SystemPreferences>({
    defaultTaxRate: 18,
    invoicePrefix: "INV",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    autoBackup: true,
    backupFrequency: "daily",
    sessionTimeout: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    paymentReminders: true,
    deliveryUpdates: true,
    lowStockThreshold: 10,
    reminderFrequency: "daily",
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile Updated",
        description: "Business profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Preferences Updated",
        description: "System preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notifications Updated",
        description: "Notification settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const result = await exportData("csv");
      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', result.filename || 'tilemanager-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: "Data has been exported as CSV successfully.",
        });
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setLoading(true);
    try {
      const result = await exportData("json");
      if (result.success && result.data) {
        // Create and download JSON file
        const blob = new Blob([result.data], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', result.filename || 'tilemanager-export.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: "Data has been exported as JSON successfully.",
        });
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const result = await exportData("excel");
      if (result.success && result.data) {
        // For Excel, we'll use the JSON data and let the browser handle it
        // In a real implementation, you might want to use a library like xlsx
        const blob = new Blob([result.data], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', result.filename || 'tilemanager-export.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: "Data has been exported as Excel successfully.",
        });
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canEditSettings = hasPermission("settings", "view");

  if (!canEditSettings) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-background min-h-screen pb-24">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to access settings.
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
          <Breadcrumb items={[{ label: "Settings" }]} />

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your business profile, system preferences, and notifications
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                All Changes Saved
              </Badge>
            </div>
          </div>

          {/* Settings Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={activeTab === "profile" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Business Profile
            </Button>
            <Button
              variant={activeTab === "preferences" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("preferences")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              System Preferences
            </Button>
            <Button
              variant={activeTab === "notifications" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("notifications")}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
            <Button
              variant={activeTab === "security" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("security")}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Security
            </Button>
            <Button
              variant={activeTab === "data" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("data")}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Data Management
            </Button>
          </div>

          {/* Settings Content */}
          <div className="space-y-8">
            {/* Business Profile */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Profile
                  </CardTitle>
                  <CardDescription>
                    Update your business information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={businessProfile.companyName}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, companyName: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={businessProfile.gstNumber}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, gstNumber: e.target.value })}
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={businessProfile.address}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                        placeholder="Enter business address"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={businessProfile.city}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, city: e.target.value })}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={businessProfile.state}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, state: e.target.value })}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={businessProfile.pincode}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, pincode: e.target.value })}
                        placeholder="Enter pincode"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={businessProfile.phone}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={businessProfile.email}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={businessProfile.website}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, website: e.target.value })}
                        placeholder="Enter website URL"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Preferences */}
            {activeTab === "preferences" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure system defaults and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                      <Input
                        id="defaultTaxRate"
                        type="number"
                        value={systemPreferences.defaultTaxRate}
                        onChange={(e) => setSystemPreferences({ ...systemPreferences, defaultTaxRate: Number(e.target.value) })}
                        placeholder="18"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                      <Input
                        id="invoicePrefix"
                        value={systemPreferences.invoicePrefix}
                        onChange={(e) => setSystemPreferences({ ...systemPreferences, invoicePrefix: e.target.value })}
                        placeholder="INV"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={systemPreferences.currency} onValueChange={(value) => setSystemPreferences({ ...systemPreferences, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select value={systemPreferences.dateFormat} onValueChange={(value) => setSystemPreferences({ ...systemPreferences, dateFormat: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <Select value={systemPreferences.timeFormat} onValueChange={(value) => setSystemPreferences({ ...systemPreferences, timeFormat: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 Hour</SelectItem>
                          <SelectItem value="12h">12 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={systemPreferences.sessionTimeout}
                        onChange={(e) => setSystemPreferences({ ...systemPreferences, sessionTimeout: Number(e.target.value) })}
                        placeholder="30"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoBackup">Automatic Backup</Label>
                        <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                      </div>
                      <Switch
                        id="autoBackup"
                        checked={systemPreferences.autoBackup}
                        onCheckedChange={(checked) => setSystemPreferences({ ...systemPreferences, autoBackup: checked })}
                      />
                    </div>
                    
                    {systemPreferences.autoBackup && (
                      <div>
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select value={systemPreferences.backupFrequency} onValueChange={(value) => setSystemPreferences({ ...systemPreferences, backupFrequency: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when items are low in stock</p>
                      </div>
                      <Switch
                        id="lowStockAlerts"
                        checked={notificationSettings.lowStockAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="paymentReminders">Payment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded about pending payments</p>
                      </div>
                      <Switch
                        id="paymentReminders"
                        checked={notificationSettings.paymentReminders}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, paymentReminders: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="deliveryUpdates">Delivery Updates</Label>
                        <p className="text-sm text-muted-foreground">Get updates on delivery status</p>
                      </div>
                      <Switch
                        id="deliveryUpdates"
                        checked={notificationSettings.deliveryUpdates}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, deliveryUpdates: checked })}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        value={notificationSettings.lowStockThreshold}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockThreshold: Number(e.target.value) })}
                        placeholder="10"
                      />
                      <p className="text-sm text-muted-foreground mt-1">Minimum stock level for alerts</p>
                    </div>
                    <div>
                      <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                      <Select value={notificationSettings.reminderFrequency} onValueChange={(value) => setNotificationSettings({ ...notificationSettings, reminderFrequency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Notifications
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage security preferences and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch id="twoFactor" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sessionTimeout">Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                      </div>
                      <Select value="30" onValueChange={() => {}}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Password Policy</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Minimum 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Include uppercase and lowercase letters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Include numbers and special characters</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Management */}
            {activeTab === "data" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Backup, export, and manage your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Export Data</CardTitle>
                        <CardDescription>Download your data in various formats</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={handleExportCSV}
                          disabled={loading}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {loading ? "Exporting..." : "Export as CSV"}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={handleExportJSON}
                          disabled={loading}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {loading ? "Exporting..." : "Export as JSON"}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={handleExportExcel}
                          disabled={loading}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {loading ? "Exporting..." : "Export as Excel"}
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Import Data</CardTitle>
                        <CardDescription>Import data from external sources</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Import from CSV
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Import from Excel
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Import from JSON
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Backup & Recovery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">Daily</div>
                        <div className="text-sm text-muted-foreground">Last backup: 2 hours ago</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">Weekly</div>
                        <div className="text-sm text-muted-foreground">Last backup: 3 days ago</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">Monthly</div>
                        <div className="text-sm text-muted-foreground">Last backup: 2 weeks ago</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
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