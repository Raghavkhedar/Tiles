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
  DollarSign,
  CreditCard,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShoppingCart,
  Building,
  Receipt,
  Loader2,
  Shield,
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
import { getInvoices } from "@/app/actions/billing";
import { getCustomers } from "@/app/actions/customers";
import { getProducts } from "@/app/actions/inventory";
import { getPayments } from "@/app/actions/billing";
import { getExpenses } from "@/app/actions/expenses";
import { getPurchaseOrders } from "@/app/actions/purchase-orders";
import { getDeliveries } from "@/app/actions/deliveries";
import { Suspense } from "react";

// Loading component for dashboard sections
function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-sm border border-navy-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-navy-200/50 rounded w-20 sm:w-24 animate-pulse"></div>
              <div className="h-4 w-4 bg-navy-200/50 rounded-full animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 sm:h-8 bg-navy-200/50 rounded w-16 sm:w-20 animate-pulse mb-2"></div>
              <div className="h-3 bg-navy-200/50 rounded w-24 sm:w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-sm border border-navy-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="h-6 bg-navy-200/50 rounded w-28 sm:w-32 animate-pulse mb-2"></div>
              <div className="h-4 bg-navy-200/50 rounded w-40 sm:w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 bg-navy-200/50 rounded-full animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-slate-200/70 rounded w-20 sm:w-24 animate-pulse mb-1"></div>
                        <div className="h-3 bg-slate-200/70 rounded w-28 sm:w-32 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200/70 rounded w-12 sm:w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Error component for dashboard sections
function DashboardError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-4 bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-sm rounded-lg border border-red-200/20 shadow-lg">
      <div className="text-center">
        <div className="text-4xl sm:text-6xl mb-4">⚠️</div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Dashboard Error</h2>
        <p className="text-sm sm:text-base text-slate-600 mb-4 px-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
          <Loader2 className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );
}

// Dashboard content component with error boundaries
async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  try {
    // Fetch real data from database with error handling
    const [invoicesResult, customersResult, productsResult, paymentsResult, expensesResult, purchaseOrdersResult, deliveriesResult] = await Promise.allSettled([
      getInvoices(),
      getCustomers(),
      getProducts(),
      getPayments(),
      getExpenses(),
      getPurchaseOrders(),
      getDeliveries()
    ]);

    // Handle failed requests gracefully
    const invoices = invoicesResult.status === 'fulfilled' ? (invoicesResult.value.success ? invoicesResult.value.data || [] : []) : [];
    const customers = customersResult.status === 'fulfilled' ? (customersResult.value.success ? customersResult.value.data || [] : []) : [];
    const products = productsResult.status === 'fulfilled' ? (productsResult.value.success ? productsResult.value.data || [] : []) : [];
    const payments = paymentsResult.status === 'fulfilled' ? (paymentsResult.value.success ? paymentsResult.value.data || [] : []) : [];
    const expenses = expensesResult.status === 'fulfilled' ? (expensesResult.value.success ? expensesResult.value.data || [] : []) : [];
    const purchaseOrders = purchaseOrdersResult.status === 'fulfilled' ? (purchaseOrdersResult.value.success ? purchaseOrdersResult.value.data || [] : []) : [];
    const deliveries = deliveriesResult.status === 'fulfilled' ? (deliveriesResult.value.success ? deliveriesResult.value.data || [] : []) : [];

    // Calculate real analytics with error handling
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // Monthly revenue calculation
    const thisMonthInvoices = invoices.filter(invoice => {
      try {
        const invoiceDate = new Date(invoice.invoice_date);
        return invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear;
      } catch {
        return false;
      }
    });

    const lastMonthInvoices = invoices.filter(invoice => {
      try {
        const invoiceDate = new Date(invoice.invoice_date);
        return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastYear;
      } catch {
        return false;
      }
    });

    const thisMonthRevenue = thisMonthInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Low stock items
    const lowStockItems = products.filter(product => 
      (product.current_stock || 0) <= (product.min_stock || 0)
    );

    // Pending orders (purchase orders)
    const pendingOrders = purchaseOrders.filter(po => 
      po.status === 'Draft' || po.status === 'Sent' || po.status === 'Confirmed'
    );

    // Pending deliveries
    const pendingDeliveries = deliveries.filter(delivery => 
      delivery.status === 'Scheduled' || delivery.status === 'In Transit'
    );

    // Outstanding payments
    const outstandingInvoices = invoices.filter(invoice => {
      const totalPaid = payments
        .filter(payment => payment.invoice_id === invoice.id)
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      return (invoice.total_amount || 0) - totalPaid > 0;
    });

    const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => {
      const totalPaid = payments
        .filter(payment => payment.invoice_id === invoice.id)
        .reduce((paymentSum, payment) => paymentSum + (payment.amount || 0), 0);
      return sum + Math.max((invoice.total_amount || 0) - totalPaid, 0);
    }, 0);

    // Recent activity (last 5 invoices)
    const recentInvoices = invoices
      .sort((a, b) => {
        try {
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
        } catch {
          return 0;
        }
      })
      .slice(0, 5);

    // Top customers
    const customerSales = customers.map(customer => {
      const customerInvoices = invoices.filter(invoice => invoice.customer_id === customer.id);
      const totalSales = customerInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
      return {
        ...customer,
        totalSales,
        orderCount: customerInvoices.length
      };
    }).sort((a, b) => b.totalSales - a.totalSales).slice(0, 3);

    // Monthly expenses
    const thisMonthExpenses = expenses.filter(expense => {
      try {
        const expenseDate = new Date(expense.expense_date);
        return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
      } catch {
        return false;
      }
    });

    const totalExpenses = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Profit calculation
    const grossProfit = thisMonthRevenue - totalExpenses;
    const profitMargin = thisMonthRevenue > 0 ? (grossProfit / thisMonthRevenue) * 100 : 0;

    const stats = {
      totalProducts: products.length,
      lowStockItems: lowStockItems.length,
      pendingOrders: pendingOrders.length,
      monthlyRevenue: thisMonthRevenue,
      pendingDeliveries: pendingDeliveries.length,
      totalCustomers: customers.length,
      outstandingAmount: totalOutstanding,
      totalExpenses,
      grossProfit,
      profitMargin,
      revenueGrowth,
    };

    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 bg-gradient-to-b from-navy-50/30 to-white/90 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-navy-900 to-navy-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-navy-600">
              Welcome back! Here's what's happening with your tile business.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border-navy-200/40 shadow-sm">
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline Ready</span>
              <span className="sm:hidden">Offline</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-green-600 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border-green-200/40 shadow-sm"
            >
              <CheckCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Synced</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-sm border border-navy-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-navy-700">
                Monthly Revenue
              </CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-100/50 to-green-50/30 rounded-full">
                <IndianRupee className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-slate-600">
                {stats.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className="hidden sm:inline">{Math.abs(stats.revenueGrowth).toFixed(1)}% from last month</span>
                <span className="sm:hidden">{Math.abs(stats.revenueGrowth).toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[120px] sm:min-h-[140px] bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Gross Profit
              </CardTitle>
              <div className="p-2 bg-blue-100/50 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ₹{stats.grossProfit.toLocaleString()}
              </div>
              <div className="text-xs text-navy-600">
                {stats.profitMargin.toFixed(1)}% margin
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[120px] sm:min-h-[140px] bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Outstanding
              </CardTitle>
              <div className="p-2 bg-orange-100/50 rounded-full">
                <CreditCard className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                ₹{stats.outstandingAmount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-600">
                {outstandingInvoices.length} pending
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[120px] sm:min-h-[140px] bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Products
              </CardTitle>
              <div className="p-2 bg-slate-100/50 rounded-full">
                <Package className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                {stats.totalProducts}
              </div>
              <div className="text-xs text-slate-600">
                {stats.lowStockItems} need restock
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="min-h-[100px] sm:min-h-[120px] bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-sm border border-navy-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Low Stock
              </CardTitle>
              <div className="p-2 bg-orange-100/50 rounded-full">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {stats.lowStockItems}
              </div>
              <p className="text-xs text-slate-600">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-[120px] bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Orders
              </CardTitle>
              <div className="p-2 bg-slate-100/50 rounded-full">
                <FileText className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                {stats.pendingOrders}
              </div>
              <p className="text-xs text-slate-600">
                To process
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-[120px] bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Deliveries
              </CardTitle>
              <div className="p-2 bg-purple-100/50 rounded-full">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                {stats.pendingDeliveries}
              </div>
              <p className="text-xs text-slate-600">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-[120px] bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                Customers
              </CardTitle>
              <div className="p-2 bg-cyan-100/50 rounded-full">
                <Users className="h-4 w-4 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                {stats.totalCustomers}
              </div>
              <p className="text-xs text-slate-600">
                Active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-sm border border-navy-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-black">Quick Actions</CardTitle>
              <CardDescription className="text-sm text-navy-600">
                Common tasks for your tile business
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link href="/dashboard/purchase-orders">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <span className="text-navy-700">Orders</span>
                </Button>
              </Link>
              <Link href="/dashboard/suppliers">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  <span className="text-navy-700">Suppliers</span>
                </Button>
              </Link>
              <Link href="/dashboard/customers">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600" />
                  <span className="text-navy-700">Customers</span>
                </Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  <span className="text-navy-700">Billing</span>
                </Button>
              </Link>
              <Link href="/dashboard/payments">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <span className="text-navy-700">Payments</span>
                </Button>
              </Link>
              <Link href="/dashboard/expenses">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  <span className="text-navy-700">Expenses</span>
                </Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  <span className="text-navy-700">Inventory</span>
                </Button>
              </Link>
              <Link href="/dashboard/deliveries">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <span className="text-navy-700">Deliveries</span>
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm bg-white/60 backdrop-blur-sm border border-navy-200/40 hover:bg-navy-50/50 hover:border-navy-300/40 transition-all duration-300">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                  <span className="text-navy-700">Reports</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Recent Activity</CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Latest updates from your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-navy-200/30 hover:bg-white/50 transition-all duration-300">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-navy-800 truncate">
                          #{invoice.invoice_number}
                        </p>
                        <p className="text-xs text-navy-600 truncate">
                          {invoice.customer?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-medium text-slate-800">
                        ₹{invoice.total_amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-navy-600">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No recent invoices</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Top Customers</CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Best performing customers this month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {customerSales.length > 0 ? (
                customerSales.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-slate-200/40 hover:bg-white/40 transition-all duration-200">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-navy-100/50 to-navy-50/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{customer.name}</p>
                        <p className="text-xs text-slate-600">
                          {customer.orderCount} orders
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs sm:text-sm font-medium text-slate-800">
                          ₹{customer.totalSales.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-600">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No customer data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Financial Overview</CardTitle>
              <CardDescription className="text-sm">
                This month's financial performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50/80 to-green-50/50 rounded-lg border border-green-100/20 shadow-sm">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    ₹{stats.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Revenue</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50/80 to-red-50/50 rounded-lg border border-red-100/20 shadow-sm">
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    ₹{stats.totalExpenses.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Expenses</div>
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-navy-50/80 to-navy-50/50 rounded-lg border border-navy-100/20 shadow-sm">
                <div className="text-xl sm:text-3xl font-bold text-blue-600">
                  ₹{stats.grossProfit.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Net Profit ({stats.profitMargin.toFixed(1)}% margin)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Business Alerts</CardTitle>
              <CardDescription className="text-sm">
                Important notifications for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-5 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-orange-700">
                      Low Stock Alert
                    </p>
                    <p className="text-xs text-orange-600">
                      {stats.lowStockItems} items need restocking
                    </p>
                  </div>
                </div>
              )}
              
              {stats.outstandingAmount > 0 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <CreditCard className="h-4 w-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-blue-700">
                      Outstanding Payments
                    </p>
                    <p className="text-xs text-blue-600">
                      ₹{stats.outstandingAmount.toLocaleString()} pending
                    </p>
                  </div>
                </div>
              )}

              {stats.pendingOrders > 0 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-yellow-50 rounded-lg">
                  <FileText className="h-4 w-5 text-yellow-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-yellow-700">
                      Pending Orders
                    </p>
                    <p className="text-xs text-yellow-600">
                      {stats.pendingOrders} orders to process
                    </p>
                  </div>
                </div>
              )}

              {stats.pendingDeliveries > 0 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <Truck className="h-4 w-5 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-purple-700">
                      Active Deliveries
                    </p>
                    <p className="text-xs text-purple-600">
                      {stats.pendingDeliveries} deliveries in progress
                    </p>
                  </div>
                </div>
              )}

              {stats.lowStockItems === 0 && stats.outstandingAmount === 0 && 
               stats.pendingOrders === 0 && stats.pendingDeliveries === 0 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-green-700">
                      All Good!
                    </p>
                    <p className="text-xs text-green-600">
                      No urgent alerts at the moment
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return <DashboardError error="Failed to load dashboard data. Please try again." />;
  }
}

export default async function Dashboard() {
  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen pb-24">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </>
  );
}
