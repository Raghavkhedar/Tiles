import DashboardNavbar from "@/components/dashboard-navbar";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Filter,
  IndianRupee,
  Package,
  Users,
  FileText,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock report data
  const salesData = {
    thisMonth: {
      revenue: 245000,
      orders: 28,
      customers: 12,
      avgOrderValue: 8750,
    },
    lastMonth: {
      revenue: 218000,
      orders: 24,
      customers: 10,
      avgOrderValue: 9083,
    },
    growth: {
      revenue: 12.4,
      orders: 16.7,
      customers: 20.0,
      avgOrderValue: -3.7,
    },
  };

  const topProducts = [
    {
      name: "Ceramic Floor Tiles - White",
      sales: 45000,
      quantity: 120,
      percentage: 18.4,
    },
    {
      name: "Vitrified Tiles - Marble Finish",
      sales: 38000,
      quantity: 85,
      percentage: 15.5,
    },
    {
      name: "Wall Tiles - Glossy Blue",
      sales: 32000,
      quantity: 95,
      percentage: 13.1,
    },
    {
      name: "Granite Tiles - Black Pearl",
      sales: 28000,
      quantity: 65,
      percentage: 11.4,
    },
    {
      name: "Designer Wall Tiles",
      sales: 25000,
      quantity: 78,
      percentage: 10.2,
    },
  ];

  const topCustomers = [
    {
      name: "Elite Builders",
      purchases: 85000,
      orders: 8,
      lastOrder: "2024-01-17",
    },
    {
      name: "Sharma Construction",
      purchases: 72000,
      orders: 6,
      lastOrder: "2024-01-15",
    },
    {
      name: "Modern Interiors",
      purchases: 58000,
      orders: 5,
      lastOrder: "2024-01-16",
    },
    {
      name: "Home Decor Solutions",
      purchases: 45000,
      orders: 4,
      lastOrder: "2024-01-10",
    },
    {
      name: "Premium Builders",
      purchases: 38000,
      orders: 3,
      lastOrder: "2024-01-12",
    },
  ];

  const gstReport = [
    {
      month: "January 2024",
      taxableAmount: 207627,
      cgst: 18687,
      sgst: 18687,
      igst: 0,
      totalGst: 37374,
      totalAmount: 245000,
    },
    {
      month: "December 2023",
      taxableAmount: 184746,
      cgst: 16627,
      sgst: 16627,
      igst: 0,
      totalGst: 33254,
      totalAmount: 218000,
    },
    {
      month: "November 2023",
      taxableAmount: 169492,
      cgst: 15254,
      sgst: 15254,
      igst: 0,
      totalGst: 30508,
      totalAmount: 200000,
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-600">
                Business insights and performance analytics
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{salesData.thisMonth.revenue.toLocaleString()}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{salesData.growth.revenue}%
                  </span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salesData.thisMonth.orders}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{salesData.growth.orders}%
                  </span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salesData.thisMonth.customers}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{salesData.growth.customers}%
                  </span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Order Value
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{salesData.thisMonth.avgOrderValue.toLocaleString()}
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-red-600">
                    -{Math.abs(salesData.growth.avgOrderValue)}%
                  </span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <Tabs defaultValue="sales" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sales">Sales Report</TabsTrigger>
              <TabsTrigger value="products">Product Analysis</TabsTrigger>
              <TabsTrigger value="customers">Customer Report</TabsTrigger>
              <TabsTrigger value="gst">GST Report</TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Sales Trend</CardTitle>
                    <CardDescription>
                      Revenue comparison over the last 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Sales Chart Placeholder</p>
                        <p className="text-sm">
                          Chart visualization would be implemented here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                    <CardDescription>
                      Revenue breakdown by tile categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                      <div className="text-center text-gray-500">
                        <PieChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Category Chart Placeholder</p>
                        <p className="text-sm">
                          Pie chart visualization would be implemented here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>
                    Best performing products by sales volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Sales Amount</TableHead>
                        <TableHead>Quantity Sold</TableHead>
                        <TableHead>Market Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            ₹{product.sales.toLocaleString()}
                          </TableCell>
                          <TableCell>{product.quantity} boxes</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-600 h-2 rounded-full"
                                  style={{ width: `${product.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">
                                {product.percentage}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>
                    Highest value customers by purchase amount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Total Purchases</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCustomers.map((customer, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {customer.name}
                          </TableCell>
                          <TableCell>
                            ₹{customer.purchases.toLocaleString()}
                          </TableCell>
                          <TableCell>{customer.orders}</TableCell>
                          <TableCell>
                            {new Date(customer.lastOrder).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gst">
              <Card>
                <CardHeader>
                  <CardTitle>GST Report</CardTitle>
                  <CardDescription>
                    Monthly GST collection and compliance report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Taxable Amount</TableHead>
                        <TableHead>CGST (9%)</TableHead>
                        <TableHead>SGST (9%)</TableHead>
                        <TableHead>IGST (18%)</TableHead>
                        <TableHead>Total GST</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gstReport.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {report.month}
                          </TableCell>
                          <TableCell>
                            ₹{report.taxableAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>₹{report.cgst.toLocaleString()}</TableCell>
                          <TableCell>₹{report.sgst.toLocaleString()}</TableCell>
                          <TableCell>₹{report.igst.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">
                            ₹{report.totalGst.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-bold">
                            ₹{report.totalAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
