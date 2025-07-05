"use client";

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
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import Breadcrumb from "@/components/breadcrumb";
import { getInvoices } from "@/app/actions/billing";
import { getCustomers } from "@/app/actions/customers";
import { getProducts } from "@/app/actions/inventory";
import { InvoiceWithRelations, Customer, Product } from "@/types/database";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesResult, customersResult, productsResult] = await Promise.all([
        getInvoices(),
        getCustomers(),
        getProducts()
      ]);

      if (invoicesResult.success) {
        setInvoices(invoicesResult.data || []);
      }
      if (customersResult.success) {
        setCustomers(customersResult.data || []);
      }
      if (productsResult.success) {
        setProducts(productsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real report data
  const calculateSalesData = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoice_date);
      return invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear;
    });

    const lastMonthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoice_date);
      return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastYear;
    });

    const thisMonthRevenue = thisMonthInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

    const thisMonthCustomers = new Set(thisMonthInvoices.map(invoice => invoice.customer_id)).size;
    const lastMonthCustomers = new Set(lastMonthInvoices.map(invoice => invoice.customer_id)).size;

    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    const ordersGrowth = lastMonthInvoices.length > 0 ? ((thisMonthInvoices.length - lastMonthInvoices.length) / lastMonthInvoices.length) * 100 : 0;
    const customersGrowth = lastMonthCustomers > 0 ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

    return {
      thisMonth: {
        revenue: thisMonthRevenue,
        orders: thisMonthInvoices.length,
        customers: thisMonthCustomers,
        avgOrderValue: thisMonthInvoices.length > 0 ? thisMonthRevenue / thisMonthInvoices.length : 0,
      },
      lastMonth: {
        revenue: lastMonthRevenue,
        orders: lastMonthInvoices.length,
        customers: lastMonthCustomers,
        avgOrderValue: lastMonthInvoices.length > 0 ? lastMonthRevenue / lastMonthInvoices.length : 0,
      },
      growth: {
        revenue: revenueGrowth,
        orders: ordersGrowth,
        customers: customersGrowth,
        avgOrderValue: 0, // Calculate if needed
      },
    };
  };

  const salesData = calculateSalesData();

  const calculateTopProducts = () => {
    const productSales: { [key: string]: { name: string; sales: number; quantity: number } } = {};

    invoices.forEach(invoice => {
      invoice.items?.forEach(item => {
        const productId = item.product_id;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.product_name,
              sales: 0,
              quantity: 0,
            };
          }
          productSales[productId].sales += item.total_price;
          productSales[productId].quantity += item.quantity;
        }
      });
    });

    const totalSales = Object.values(productSales).reduce((sum, product) => sum + product.sales, 0);

    return Object.values(productSales)
      .map(product => ({
        ...product,
        percentage: totalSales > 0 ? (product.sales / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  const topProducts = calculateTopProducts();

  const calculateTopCustomers = () => {
    const customerData: { [key: string]: { name: string; purchases: number; orders: number; lastOrder: string } } = {};

    invoices.forEach(invoice => {
      const customerId = invoice.customer_id;
      const customerName = invoice.customer?.name || 'Unknown Customer';
      
      if (!customerData[customerId]) {
        customerData[customerId] = {
          name: customerName,
          purchases: 0,
          orders: 0,
          lastOrder: invoice.invoice_date,
        };
      }
      
      customerData[customerId].purchases += invoice.total_amount;
      customerData[customerId].orders += 1;
      
      // Update last order date if this invoice is more recent
      if (new Date(invoice.invoice_date) > new Date(customerData[customerId].lastOrder)) {
        customerData[customerId].lastOrder = invoice.invoice_date;
      }
    });

    return Object.values(customerData)
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 5);
  };

  const topCustomers = calculateTopCustomers();

  const calculateGSTReport = () => {
    const monthlyData: { [key: string]: { 
      month: string; 
      taxableAmount: number; 
      cgst: number; 
      sgst: number; 
      igst: number; 
      totalGst: number; 
      totalAmount: number; 
    } } = {};

    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.invoice_date);
      const monthKey = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = invoiceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          taxableAmount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalGst: 0,
          totalAmount: 0,
        };
      }
      
      const taxableAmount = invoice.total_amount - (invoice.cgst_amount + invoice.sgst_amount + invoice.igst_amount);
      monthlyData[monthKey].taxableAmount += taxableAmount;
      monthlyData[monthKey].cgst += invoice.cgst_amount;
      monthlyData[monthKey].sgst += invoice.sgst_amount;
      monthlyData[monthKey].igst += invoice.igst_amount;
      monthlyData[monthKey].totalGst += (invoice.cgst_amount + invoice.sgst_amount + invoice.igst_amount);
      monthlyData[monthKey].totalAmount += invoice.total_amount;
    });

    return Object.values(monthlyData)
      .sort((a, b) => {
        const [aYear, aMonth] = a.month.split(' ');
        const [bYear, bMonth] = b.month.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
      })
      .slice(-3); // Last 3 months
  };

  const gstReport = calculateGSTReport();

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen pb-24">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading reports...</span>
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
      <main className="w-full bg-gray-50 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Reports & Analytics" }]} />
          
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
