import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Package,
  FileText,
  Users,
  Truck,
  Calculator,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  WifiOff,
  CheckCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock data for demonstration
  const stats = {
    totalProducts: 156,
    lowStockItems: 8,
    pendingOrders: 12,
    monthlyRevenue: 245000,
    pendingDeliveries: 5,
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening with your tile business.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Badge variant="outline" className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Offline Ready
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-green-600"
              >
                <CheckCircle className="w-3 h-3" />
                Synced
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Active inventory items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Alert
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.lowStockItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items need restocking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Orders to process
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for your tile business
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/inventory">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2"
                  >
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Manage Inventory</span>
                  </Button>
                </Link>
                <Link href="/dashboard/billing">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Create Invoice</span>
                  </Button>
                </Link>
                <Link href="/dashboard/customers">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2"
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Customer Ledger</span>
                  </Button>
                </Link>
                <Link href="/dashboard/deliveries">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2"
                  >
                    <Truck className="h-6 w-6" />
                    <span className="text-sm">Track Deliveries</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        New order from Sharma Tiles
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹15,000 • 2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Low stock: Ceramic Floor Tiles
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Only 5 boxes remaining
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Delivery completed</p>
                      <p className="text-xs text-muted-foreground">
                        Order #1234 delivered successfully
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/inventory">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Inventory Management
                      </CardTitle>
                      <CardDescription>
                        Track tiles, manage stock levels
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/billing">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Billing & Invoices
                      </CardTitle>
                      <CardDescription>
                        GST compliant billing system
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/customers">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Customer Management
                      </CardTitle>
                      <CardDescription>
                        Manage customer relationships
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/suppliers">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Supplier Management
                      </CardTitle>
                      <CardDescription>
                        Track supplier relationships
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/deliveries">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Delivery Tracking
                      </CardTitle>
                      <CardDescription>Monitor delivery status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/reports">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Reports & Analytics
                      </CardTitle>
                      <CardDescription>
                        Business insights and reports
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
