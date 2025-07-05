import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Settings,
  User,
  Building,
  Shield,
  Bell,
  Palette,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/breadcrumb";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Settings" }]} />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your business settings and preferences
              </p>
            </div>
          </div>

          {/* Settings Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle>Profile Settings</CardTitle>
                </div>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-green-600" />
                  <CardTitle>Business Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure your business information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Business Name</span>
                    <Badge variant="outline">TileManager Pro</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GST Number</span>
                    <span className="text-sm font-medium">Not Set</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = '/dashboard/settings/business'}>
                    Configure Business
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>
                  Manage your account security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Two-Factor Auth</span>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm font-medium">Today</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Configure your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Alerts</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock Alerts</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-pink-600" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Theme</span>
                    <Badge variant="outline">Light</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Language</span>
                    <span className="text-sm font-medium">English</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Appearance Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <CardTitle>Advanced</CardTitle>
                </div>
                <CardDescription>
                  Advanced settings and system configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Export</span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Backup</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Advanced Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Notice */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  We're working on implementing comprehensive settings for your tile business. 
                  This will include business profile, security, notifications, and more.
                </p>
                <Badge variant="outline">In Development</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
} 