"use client";

import React from "react";
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
  DollarSign,
  CreditCard,
  AlertCircle,
  Printer,
  Plus,
  Info,
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
import { getPayments } from "@/app/actions/billing";
import { getExpenses, calculateMonthlyExpenses } from "@/app/actions/expenses";
import { getPurchaseOrders } from "@/app/actions/purchase-orders";
import { InvoiceWithRelations, Customer, Product } from "@/types/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { exportToCSV, exportToJSON } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesResult, customersResult, productsResult, paymentsResult, expensesResult, purchaseOrdersResult] = await Promise.all([
        getInvoices(),
        getCustomers(),
        getProducts(),
        getPayments(),
        getExpenses(),
        getPurchaseOrders()
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
      if (paymentsResult.success) {
        setPayments(paymentsResult.data || []);
      }
      if (expensesResult.success) {
        setExpenses(expensesResult.data || []);
      }
      if (purchaseOrdersResult.success) {
        setPurchaseOrders(purchaseOrdersResult.data || []);
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
        avgOrderValue: 0,
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
    const customerSales: { [key: string]: { name: string; sales: number; orders: number } } = {};

    invoices.forEach(invoice => {
      const customerId = invoice.customer_id;
      if (customerId) {
        if (!customerSales[customerId]) {
          customerSales[customerId] = {
            name: invoice.customer?.name || 'Unknown Customer',
            sales: 0,
            orders: 0,
          };
        }
        customerSales[customerId].sales += invoice.total_amount || 0;
        customerSales[customerId].orders += 1;
      }
    });

    return Object.values(customerSales)
      .sort((a, b) => b.sales - a.sales)
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
      .slice(-3);
  };

  const gstReport = calculateGSTReport();

  // Financial Reports Calculations
  const calculateProfitLoss = () => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    // Filter invoices for current month
    const monthlyInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoice_date);
      return invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear;
    });

    // Calculate revenue
    const totalRevenue = monthlyInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    
    // Calculate COGS based on actual purchase costs
    let totalCOGS = 0;
    monthlyInvoices.forEach(invoice => {
      invoice.items?.forEach(item => {
        // Find the product to get its purchase cost
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          // Use purchase price per box (assuming this is the cost)
          const costPerBox = product.price_per_box || 0;
          totalCOGS += (item.quantity * costPerBox);
        }
      });
    });
    
    // Calculate gross profit
    const grossProfit = totalRevenue - totalCOGS;
    
    // Get actual expenses for the month
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });

    // Group expenses by category
    const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const totalOperatingExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate net profit
    const netProfit = grossProfit - totalOperatingExpenses;
    
    return {
      revenue: totalRevenue,
      costOfGoodsSold: totalCOGS,
      grossProfit,
      operatingExpenses: expensesByCategory,
      totalOperatingExpenses,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      expenseBreakdown: monthlyExpenses,
    };
  };

  const profitLossData = calculateProfitLoss();

  const calculateCashFlow = () => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    // Filter data for current month
    const monthlyInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoice_date);
      return invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear;
    });

    const monthlyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    });

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });

    const monthlyPurchaseOrders = purchaseOrders.filter(po => {
      const poDate = new Date(po.order_date);
      return poDate.getMonth() === thisMonth && poDate.getFullYear() === thisYear;
    });

    // Cash inflows
    const cashInflows = {
      customerPayments: monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
      cashSales: monthlyInvoices.filter(invoice => 
        invoice.status === 'Paid' && invoice.payment_terms === 'Immediate'
      ).reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0),
      other: 0,
    };

    const totalCashInflows = Object.values(cashInflows).reduce((sum, inflow) => sum + inflow, 0);

    // Cash outflows
    const cashOutflows = {
      inventoryPurchases: monthlyPurchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0),
      operatingExpenses: monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      taxes: monthlyInvoices.reduce((sum, invoice) => 
        sum + (invoice.cgst_amount + invoice.sgst_amount + invoice.igst_amount), 0),
      other: 0,
    };

    const totalCashOutflows = Object.values(cashOutflows).reduce((sum, outflow) => sum + outflow, 0);

    // Net cash flow
    const netCashFlow = totalCashInflows - totalCashOutflows;

    return {
      inflows: cashInflows,
      totalInflows: totalCashInflows,
      outflows: cashOutflows,
      totalOutflows: totalCashOutflows,
      netCashFlow,
    };
  };

  const cashFlowData = calculateCashFlow();

  const calculateAccountsReceivable = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Calculate outstanding invoices with proper payment tracking
    const outstandingInvoices = invoices.filter(invoice => {
      // Calculate total paid amount for this invoice
      const totalPaid = payments
        .filter(payment => payment.invoice_id === invoice.id)
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      // Outstanding amount = total invoice amount - total paid
      const outstandingAmount = (invoice.total_amount || 0) - totalPaid;
      
      return outstandingAmount > 0;
    });

    // Categorize by age based on due date
    const current = outstandingInvoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      return dueDate >= thirtyDaysAgo;
    });

    const thirtyDays = outstandingInvoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      return dueDate < thirtyDaysAgo && dueDate >= sixtyDaysAgo;
    });

    const sixtyDays = outstandingInvoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      return dueDate < sixtyDaysAgo && dueDate >= ninetyDaysAgo;
    });

    const overNinetyDays = outstandingInvoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      return dueDate < ninetyDaysAgo;
    });

    // Calculate outstanding amounts with proper payment tracking
    const calculateOutstandingAmount = (invoiceList: any[]) => {
      return invoiceList.reduce((sum, invoice) => {
        const totalPaid = payments
          .filter(payment => payment.invoice_id === invoice.id)
          .reduce((paymentSum, payment) => paymentSum + (payment.amount || 0), 0);
        
        const outstandingAmount = (invoice.total_amount || 0) - totalPaid;
        return sum + Math.max(outstandingAmount, 0);
      }, 0);
    };

    const totalOutstanding = calculateOutstandingAmount(outstandingInvoices);

    return {
      current: {
        count: current.length,
        amount: calculateOutstandingAmount(current),
      },
      thirtyDays: {
        count: thirtyDays.length,
        amount: calculateOutstandingAmount(thirtyDays),
      },
      sixtyDays: {
        count: sixtyDays.length,
        amount: calculateOutstandingAmount(sixtyDays),
      },
      overNinetyDays: {
        count: overNinetyDays.length,
        amount: calculateOutstandingAmount(overNinetyDays),
      },
      totalOutstanding,
    };
  };

  const accountsReceivableData = calculateAccountsReceivable();

  // Inventory Reports Calculations
  const calculateStockReport = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate stock value and movement
    const stockData = products.map(product => {
      const stockValue = (product.current_stock || 0) * (product.price_per_box || 0);
      const reorderPoint = product.min_stock || 0;
      const maxStock = product.max_stock || 0;
      const stockLevel = (product.current_stock || 0) / maxStock * 100;
      
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock: product.current_stock || 0,
        minStock: product.min_stock || 0,
        maxStock: product.max_stock || 0,
        stockValue,
        reorderPoint,
        stockLevel,
        status: product.current_stock <= product.min_stock ? 'Low' : 
                product.current_stock >= product.max_stock ? 'Overstocked' : 'Normal',
      };
    });

    const totalStockValue = stockData.reduce((sum, item) => sum + item.stockValue, 0);
    const lowStockItems = stockData.filter(item => item.status === 'Low');
    const overstockedItems = stockData.filter(item => item.status === 'Overstocked');
    const normalStockItems = stockData.filter(item => item.status === 'Normal');

    return {
      stockData,
      totalStockValue,
      lowStockItems,
      overstockedItems,
      normalStockItems,
      totalItems: stockData.length,
      lowStockCount: lowStockItems.length,
      overstockedCount: overstockedItems.length,
      normalStockCount: normalStockItems.length,
    };
  };

  const stockReportData = calculateStockReport();

  const calculateLowStockReport = () => {
    const lowStockProducts = products.filter(product => 
      (product.current_stock || 0) <= (product.min_stock || 0)
    );

    const lowStockData = lowStockProducts.map(product => {
      const currentStock = product.current_stock || 0;
      const minStock = product.min_stock || 0;
      const maxStock = product.max_stock || 0;
      const reorderQuantity = Math.max(minStock - currentStock, 1);
      const stockDeficit = minStock - currentStock;
      
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock,
        minStock,
        maxStock,
        reorderQuantity,
        stockDeficit,
        urgency: stockDeficit > 0 ? 'Critical' : 'Low',
        supplier: product.supplier_id ? 'Supplier Info' : 'No Supplier',
      };
    });

    const criticalItems = lowStockData.filter(item => item.urgency === 'Critical');
    const lowItems = lowStockData.filter(item => item.urgency === 'Low');

    return {
      lowStockData,
      criticalItems,
      lowItems,
      totalLowStock: lowStockData.length,
      criticalCount: criticalItems.length,
      lowCount: lowItems.length,
    };
  };

  const lowStockReportData = calculateLowStockReport();

  const calculateDeadStockReport = () => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Find products with current stock > 0
    const productsWithStock = products.filter(product => (product.current_stock || 0) > 0);

    // Check for recent sales and purchases
    const deadStockProducts = productsWithStock.filter(product => {
      // Check for recent sales in invoices (last 90 days)
      const recentSales = invoices.some(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        return invoiceDate >= ninetyDaysAgo && 
               invoice.items?.some(item => item.product_id === product.id);
      });

      // Check for recent purchases (last 90 days)
      const recentPurchases = purchaseOrders.some(po => {
        const poDate = new Date(po.order_date);
        return poDate >= ninetyDaysAgo && 
               po.items?.some((item: any) => item.product_id === product.id);
      });

      // Product is dead stock if:
      // 1. Has current stock > 0
      // 2. No recent sales in last 90 days
      // 3. No recent purchases in last 90 days
      return !recentSales && !recentPurchases;
    });

    const deadStockData = deadStockProducts.map(product => {
      const currentStock = product.current_stock || 0;
      const stockValue = currentStock * (product.price_per_box || 0);
      
      // Calculate stock age based on last movement
      const lastSaleInvoice = invoices
        .filter(invoice => 
          invoice.items?.some(item => item.product_id === product.id)
        )
        .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())[0];

      const stockAge = lastSaleInvoice 
        ? Math.floor((now.getTime() - new Date(lastSaleInvoice.invoice_date).getTime()) / (24 * 60 * 60 * 1000))
        : 90;
      
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock,
        stockValue,
        stockAge,
        lastMovement: lastSaleInvoice 
          ? new Date(lastSaleInvoice.invoice_date).toLocaleDateString()
          : 'No recent movement',
        disposalRecommendation: stockAge > 180 ? 'Consider disposal' : 'Monitor closely',
      };
    });

    const totalDeadStockValue = deadStockData.reduce((sum, item) => sum + item.stockValue, 0);
    const criticalDeadStock = deadStockData.filter(item => item.stockAge > 180);
    const moderateDeadStock = deadStockData.filter(item => item.stockAge <= 180 && item.stockAge > 90);

    return {
      deadStockData,
      totalDeadStockValue,
      criticalDeadStock,
      moderateDeadStock,
      totalDeadStock: deadStockData.length,
      criticalCount: criticalDeadStock.length,
      moderateCount: moderateDeadStock.length,
    };
  };

  const deadStockReportData = calculateDeadStockReport();

  // Export functions
  const handleExportSalesReport = (format: 'csv' | 'json') => {
    try {
      const exportData = [
        {
          metric: 'Monthly Revenue',
          value: salesData.thisMonth.revenue,
          growth: salesData.growth.revenue,
          unit: '₹'
        },
        {
          metric: 'Total Orders',
          value: salesData.thisMonth.orders,
          growth: salesData.growth.orders,
          unit: ''
        },
        {
          metric: 'Active Customers',
          value: salesData.thisMonth.customers,
          growth: salesData.growth.customers,
          unit: ''
        },
        {
          metric: 'Average Order Value',
          value: salesData.thisMonth.avgOrderValue,
          growth: salesData.growth.avgOrderValue,
          unit: '₹'
        }
      ];

      const filename = `sales_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Sales report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export sales report",
        variant: "destructive",
      });
    }
  };

  const handleExportProductAnalysis = (format: 'csv' | 'json') => {
    try {
      const exportData = topProducts.map(product => ({
        product_name: product.name,
        sales_amount: product.sales,
        quantity_sold: product.quantity,
        market_share_percentage: product.percentage,
        unit: 'boxes'
      }));

      const filename = `product_analysis_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Product analysis exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export product analysis",
        variant: "destructive",
      });
    }
  };

  const handleExportGSTReport = (format: 'csv' | 'json') => {
    try {
      const exportData = gstReport.map(month => ({
        month: month.month,
        taxable_amount: month.taxableAmount,
        cgst: month.cgst,
        sgst: month.sgst,
        igst: month.igst,
        total_gst: month.totalGst,
        total_amount: month.totalAmount
      }));

      const filename = `gst_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `GST report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export GST report",
        variant: "destructive",
      });
    }
  };

  const handleExportProfitLoss = (format: 'csv' | 'json') => {
    try {
      const exportData = [
        {
          category: 'Revenue',
          amount: profitLossData.revenue,
          type: 'income'
        },
        {
          category: 'Cost of Goods Sold',
          amount: profitLossData.costOfGoodsSold,
          type: 'expense'
        },
        {
          category: 'Gross Profit',
          amount: profitLossData.grossProfit,
          type: 'profit'
        },
        ...Object.entries(profitLossData.operatingExpenses).map(([category, amount]) => ({
          category: `Operating Expense - ${category}`,
          amount: amount,
          type: 'expense'
        })),
        {
          category: 'Total Operating Expenses',
          amount: profitLossData.totalOperatingExpenses,
          type: 'expense'
        },
        {
          category: 'Net Profit',
          amount: profitLossData.netProfit,
          type: 'profit'
        },
        {
          category: 'Profit Margin',
          amount: profitLossData.profitMargin,
          type: 'percentage'
        }
      ];

      const filename = `profit_loss_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Profit & Loss report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export Profit & Loss report",
        variant: "destructive",
      });
    }
  };

  const handleExportCashFlow = (format: 'csv' | 'json') => {
    try {
      const exportData = [
        {
          category: 'Cash Inflows',
          customer_payments: cashFlowData.inflows.customerPayments,
          cash_sales: cashFlowData.inflows.cashSales,
          other_income: cashFlowData.inflows.other,
          total_inflows: cashFlowData.totalInflows
        },
        {
          category: 'Cash Outflows',
          inventory_purchases: cashFlowData.outflows.inventoryPurchases,
          operating_expenses: cashFlowData.outflows.operatingExpenses,
          tax_payments: cashFlowData.outflows.taxes,
          total_outflows: cashFlowData.totalOutflows
        },
        {
          category: 'Net Cash Flow',
          net_cash_flow: cashFlowData.netCashFlow,
          type: 'summary'
        }
      ];

      const filename = `cash_flow_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Cash Flow report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export Cash Flow report",
        variant: "destructive",
      });
    }
  };

  const handleExportAccountsReceivable = (format: 'csv' | 'json') => {
    try {
      const exportData = [
        {
          aging_category: 'Current (0-30 days)',
          invoice_count: accountsReceivableData.current.count,
          outstanding_amount: accountsReceivableData.current.amount,
          percentage: accountsReceivableData.totalOutstanding > 0 
            ? ((accountsReceivableData.current.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
            : 0
        },
        {
          aging_category: '31-60 days',
          invoice_count: accountsReceivableData.thirtyDays.count,
          outstanding_amount: accountsReceivableData.thirtyDays.amount,
          percentage: accountsReceivableData.totalOutstanding > 0 
            ? ((accountsReceivableData.thirtyDays.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
            : 0
        },
        {
          aging_category: '61-90 days',
          invoice_count: accountsReceivableData.sixtyDays.count,
          outstanding_amount: accountsReceivableData.sixtyDays.amount,
          percentage: accountsReceivableData.totalOutstanding > 0 
            ? ((accountsReceivableData.sixtyDays.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
            : 0
        },
        {
          aging_category: 'Over 90 days',
          invoice_count: accountsReceivableData.overNinetyDays.count,
          outstanding_amount: accountsReceivableData.overNinetyDays.amount,
          percentage: accountsReceivableData.totalOutstanding > 0 
            ? ((accountsReceivableData.overNinetyDays.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
            : 0
        },
        {
          aging_category: 'Total Outstanding',
          invoice_count: accountsReceivableData.current.count + accountsReceivableData.thirtyDays.count + accountsReceivableData.sixtyDays.count + accountsReceivableData.overNinetyDays.count,
          outstanding_amount: accountsReceivableData.totalOutstanding,
          percentage: 100
        }
      ];

      const filename = `accounts_receivable_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Accounts Receivable report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export Accounts Receivable report",
        variant: "destructive",
      });
    }
  };

  const handleExportStockReport = (format: 'csv' | 'json') => {
    try {
      const exportData = stockReportData.stockData.map(item => ({
        product_name: item.name,
        sku: item.sku,
        current_stock: item.currentStock,
        min_stock: item.minStock,
        max_stock: item.maxStock,
        stock_value: item.stockValue,
        stock_level_percentage: item.stockLevel,
        status: item.status
      }));

      const filename = `stock_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Stock report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export stock report",
        variant: "destructive",
      });
    }
  };

  const handleExportLowStockReport = (format: 'csv' | 'json') => {
    try {
      const exportData = lowStockReportData.lowStockData.map(item => ({
        product_name: item.name,
        sku: item.sku,
        current_stock: item.currentStock,
        min_stock: item.minStock,
        max_stock: item.maxStock,
        reorder_quantity: item.reorderQuantity,
        stock_deficit: item.stockDeficit,
        urgency: item.urgency,
        supplier: item.supplier
      }));

      const filename = `low_stock_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Low stock report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export low stock report",
        variant: "destructive",
      });
    }
  };

  const handleExportDeadStockReport = (format: 'csv' | 'json') => {
    try {
      const exportData = deadStockReportData.deadStockData.map(item => ({
        product_name: item.name,
        sku: item.sku,
        current_stock: item.currentStock,
        stock_value: item.stockValue,
        stock_age_days: item.stockAge,
        last_movement: item.lastMovement,
        disposal_recommendation: item.disposalRecommendation
      }));

      const filename = `dead_stock_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Dead stock report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export dead stock report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <React.Fragment>
        <DashboardNavbar />
        <main className="w-full bg-background min-h-screen pb-24">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading reports...</span>
              </div>
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen pb-24">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Reports
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportSalesReport('csv')}>
                    Sales Report (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportProductAnalysis('csv')}>
                    Product Analysis (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportGSTReport('csv')}>
                    GST Report (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportProfitLoss('csv')}>
                    Profit & Loss (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportCashFlow('csv')}>
                    Cash Flow (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAccountsReceivable('csv')}>
                    Accounts Receivable (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportStockReport('csv')}>
                    Stock Report (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportLowStockReport('csv')}>
                    Low Stock Report (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportDeadStockReport('csv')}>
                    Dead Stock Report (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

          {/* Reports Tabs */}
          <Tabs defaultValue="sales" className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="sales">Sales Report</TabsTrigger>
              <TabsTrigger value="products">Product Analysis</TabsTrigger>
              <TabsTrigger value="customers">Customer Report</TabsTrigger>
              <TabsTrigger value="gst">GST Report</TabsTrigger>
              <TabsTrigger value="profit-loss">P&L Report</TabsTrigger>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
              <TabsTrigger value="receivables">A/R Report</TabsTrigger>
              <TabsTrigger value="stock">Stock Report</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="dead-stock">Dead Stock</TabsTrigger>
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
                    <div className="h-64 flex items-center justify-center bg-muted rounded">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Sales Chart Placeholder</p>
                        <p className="text-sm">
                          Chart visualization coming soon
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sales Summary</CardTitle>
                    <CardDescription>
                      Key sales metrics for this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="font-bold text-green-600">
                        ₹{salesData.thisMonth.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Orders</span>
                      <span className="font-bold">{salesData.thisMonth.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Order Value</span>
                      <span className="font-bold">
                        ₹{salesData.thisMonth.avgOrderValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Customers</span>
                      <span className="font-bold">{salesData.thisMonth.customers}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Top Performing Products</CardTitle>
                      <CardDescription>
                        Best selling products by revenue
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExportProductAnalysis('csv')}>
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportProductAnalysis('json')}>
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Market Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>₹{product.sales.toLocaleString()}</TableCell>
                          <TableCell>{product.quantity} boxes</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {product.percentage.toFixed(1)}%
                            </Badge>
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
                    Best customers by total purchases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total Purchases</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Last Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCustomers.map((customer, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {customer.name}
                          </TableCell>
                          <TableCell>₹{customer.sales.toLocaleString()}</TableCell>
                          <TableCell>{customer.orders}</TableCell>
                          <TableCell>
                            {new Date().toLocaleDateString()}
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>GST Collection Report</CardTitle>
                      <CardDescription>
                        Monthly GST collection breakdown
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExportGSTReport('csv')}>
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportGSTReport('json')}>
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Taxable Amount</TableHead>
                        <TableHead>CGST</TableHead>
                        <TableHead>SGST</TableHead>
                        <TableHead>IGST</TableHead>
                        <TableHead>Total GST</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gstReport.map((month, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {month.month}
                          </TableCell>
                          <TableCell>₹{month.taxableAmount.toLocaleString()}</TableCell>
                          <TableCell>₹{month.cgst.toLocaleString()}</TableCell>
                          <TableCell>₹{month.sgst.toLocaleString()}</TableCell>
                          <TableCell>₹{month.igst.toLocaleString()}</TableCell>
                          <TableCell>₹{month.totalGst.toLocaleString()}</TableCell>
                          <TableCell>₹{month.totalAmount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profit-loss">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Profit & Loss Statement</CardTitle>
                        <CardDescription>
                          Monthly profit and loss breakdown
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleExportProfitLoss('csv')}>
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportProfitLoss('json')}>
                            Export as JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Revenue</span>
                        <span className="font-bold text-green-600">
                          ₹{profitLossData.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Cost of Goods Sold</span>
                        <span>₹{profitLossData.costOfGoodsSold.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-medium">
                          <span>Gross Profit</span>
                          <span className="text-green-600">
                            ₹{profitLossData.grossProfit.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="text-sm font-medium text-gray-700">Operating Expenses</div>
                      <div className="space-y-2">
                        {Object.entries(profitLossData.operatingExpenses).map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center text-sm">
                            <span>{category}</span>
                            <span>₹{(amount as number).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total Operating Expenses</span>
                          <span>₹{profitLossData.totalOperatingExpenses.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Net Profit</span>
                        <span className={profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ₹{profitLossData.netProfit.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Profit Margin: {profitLossData.profitMargin.toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profit Analysis</CardTitle>
                    <CardDescription>
                      Key profitability metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {profitLossData.profitMargin.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Profit Margin</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{profitLossData.grossProfit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Gross Profit</div>
                      </div>
                    </div>
                    <div className="h-48 flex items-center justify-center bg-muted rounded">
                      <div className="text-center text-gray-500">
                        <PieChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Profit Chart Placeholder</p>
                        <p className="text-sm">Chart visualization coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cash-flow">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Cash Flow Statement</CardTitle>
                      <CardDescription>
                        Monthly cash flow breakdown
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExportCashFlow('csv')}>
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportCashFlow('json')}>
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cash Flow Statement</CardTitle>
                        <CardDescription>
                          Monthly cash flow breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-700">Cash Inflows</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span>Customer Payments</span>
                              <span className="text-green-600">
                                ₹{cashFlowData.inflows.customerPayments.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Cash Sales</span>
                              <span className="text-green-600">
                                ₹{cashFlowData.inflows.cashSales.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Other Income</span>
                              <span className="text-green-600">
                                ₹{cashFlowData.inflows.other.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center font-medium">
                              <span>Total Cash Inflows</span>
                              <span className="text-green-600 font-bold">
                                ₹{cashFlowData.totalInflows.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                          <div className="text-sm font-medium text-gray-700">Cash Outflows</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span>Inventory Purchases</span>
                              <span className="text-red-600">
                                ₹{cashFlowData.outflows.inventoryPurchases.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Operating Expenses</span>
                              <span className="text-red-600">
                                ₹{cashFlowData.outflows.operatingExpenses.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Taxes</span>
                              <span className="text-red-600">
                                ₹{cashFlowData.outflows.taxes.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Other</span>
                              <span className="text-red-600">
                                ₹{cashFlowData.outflows.other.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center font-medium">
                              <span>Total Cash Outflows</span>
                              <span className="text-red-600 font-bold">
                                ₹{cashFlowData.totalOutflows.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Net Cash Flow</span>
                            <span className={cashFlowData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ₹{cashFlowData.netCashFlow.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cash Flow Analysis</CardTitle>
                        <CardDescription>
                          Key cash flow metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              ₹{cashFlowData.totalInflows.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Inflows</div>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              ₹{cashFlowData.totalOutflows.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Outflows</div>
                          </div>
                        </div>
                        <div className="h-48 flex items-center justify-center bg-muted rounded">
                          <div className="text-center text-gray-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                            <p>Cash Flow Chart Placeholder</p>
                            <p className="text-sm">Chart visualization coming soon</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Report</CardTitle>
                  <CardDescription>Stock levels and inventory status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stockReportData.totalItems}</div>
                      <div className="text-sm text-gray-600">Total Items</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stockReportData.lowStockCount}</div>
                      <div className="text-sm text-gray-600">Low Stock Items</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹{stockReportData.totalStockValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Stock Value</div>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockReportData.stockData.slice(0, 10).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.currentStock} boxes</TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'Low' ? 'destructive' : 'default'}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receivables">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Accounts Receivable Aging</CardTitle>
                        <CardDescription>
                          Outstanding invoices by age
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleExportAccountsReceivable('csv')}>
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportAccountsReceivable('json')}>
                            Export as JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Age</TableHead>
                          <TableHead>Invoices</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Current (0-30 days)</TableCell>
                          <TableCell>{accountsReceivableData.current.count}</TableCell>
                          <TableCell>₹{accountsReceivableData.current.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {accountsReceivableData.totalOutstanding > 0 
                              ? ((accountsReceivableData.current.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">31-60 days</TableCell>
                          <TableCell>{accountsReceivableData.thirtyDays.count}</TableCell>
                          <TableCell>₹{accountsReceivableData.thirtyDays.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {accountsReceivableData.totalOutstanding > 0 
                              ? ((accountsReceivableData.thirtyDays.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">61-90 days</TableCell>
                          <TableCell>{accountsReceivableData.sixtyDays.count}</TableCell>
                          <TableCell>₹{accountsReceivableData.sixtyDays.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {accountsReceivableData.totalOutstanding > 0 
                              ? ((accountsReceivableData.sixtyDays.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Over 90 days</TableCell>
                          <TableCell>{accountsReceivableData.overNinetyDays.count}</TableCell>
                          <TableCell>₹{accountsReceivableData.overNinetyDays.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {accountsReceivableData.totalOutstanding > 0 
                              ? ((accountsReceivableData.overNinetyDays.amount / accountsReceivableData.totalOutstanding) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receivables Summary</CardTitle>
                    <CardDescription>
                      Key accounts receivable metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">
                        ₹{accountsReceivableData.totalOutstanding.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Outstanding</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {accountsReceivableData.current.count}
                        </div>
                        <div className="text-sm text-gray-600">Current</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">
                          {accountsReceivableData.thirtyDays.count + accountsReceivableData.sixtyDays.count}
                        </div>
                        <div className="text-sm text-gray-600">Overdue</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Current (0-30 days)</span>
                        <span className="font-medium">
                          ₹{accountsReceivableData.current.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>31-60 days</span>
                        <span className="font-medium text-yellow-600">
                          ₹{accountsReceivableData.thirtyDays.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>61-90 days</span>
                        <span className="font-medium text-orange-600">
                          ₹{accountsReceivableData.sixtyDays.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Over 90 days</span>
                        <span className="font-medium text-red-600">
                          ₹{accountsReceivableData.overNinetyDays.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stock">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Stock Report</CardTitle>
                      <CardDescription>
                        Overview of current inventory levels and status
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExportStockReport('csv')}>
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportStockReport('json')}>
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stockReportData.totalItems}</div>
                      <div className="text-sm text-gray-600">Total Items</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stockReportData.lowStockCount}</div>
                      <div className="text-sm text-gray-600">Low Stock Items</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stockReportData.overstockedCount}</div>
                      <div className="text-sm text-gray-600">Overstocked Items</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹{stockReportData.totalStockValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Stock Value</div>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Min Stock</TableHead>
                        <TableHead>Max Stock</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockReportData.stockData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.currentStock} boxes</TableCell>
                          <TableCell>{item.minStock} boxes</TableCell>
                          <TableCell>{item.maxStock} boxes</TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'Low' ? 'destructive' : item.status === 'Overstocked' ? 'secondary' : 'default'}>
                              {item.stockLevel.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{item.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="low-stock">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Low Stock Items</CardTitle>
                      <CardDescription>
                        Products with current stock below minimum stock
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExportLowStockReport('csv')}>
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportLowStockReport('json')}>
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{lowStockReportData.totalLowStock}</div>
                      <div className="text-sm text-gray-600">Total Low Stock Items</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{lowStockReportData.criticalCount}</div>
                      <div className="text-sm text-gray-600">Critical Items</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{lowStockReportData.lowCount}</div>
                      <div className="text-sm text-gray-600">Low Priority Items</div>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Min Stock</TableHead>
                        <TableHead>Reorder Quantity</TableHead>
                        <TableHead>Stock Deficit</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Supplier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockReportData.lowStockData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.currentStock} boxes</TableCell>
                          <TableCell>{item.minStock} boxes</TableCell>
                          <TableCell>{item.reorderQuantity} boxes</TableCell>
                          <TableCell>{item.stockDeficit} boxes</TableCell>
                          <TableCell>
                            <Badge variant={item.urgency === 'Critical' ? 'destructive' : 'secondary'}>
                              {item.urgency}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.supplier}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dead-stock">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Dead Stock Items</CardTitle>
                      <CardDescription>
                        Products with no recent sales and current stock greater than 0
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExportDeadStockReport('csv')}>
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportDeadStockReport('json')}>
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{deadStockReportData.totalDeadStock}</div>
                      <div className="text-sm text-gray-600">Total Dead Stock Items</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{deadStockReportData.criticalCount}</div>
                      <div className="text-sm text-gray-600">Critical Items</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">₹{deadStockReportData.totalDeadStockValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Dead Stock Value</div>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Stock Value</TableHead>
                        <TableHead>Stock Age (Days)</TableHead>
                        <TableHead>Last Movement</TableHead>
                        <TableHead>Disposal Recommendation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deadStockReportData.deadStockData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.currentStock} boxes</TableCell>
                          <TableCell>₹{item.stockValue.toLocaleString()}</TableCell>
                          <TableCell>{item.stockAge} days</TableCell>
                          <TableCell>{item.lastMovement}</TableCell>
                          <TableCell>
                            <Badge variant={item.disposalRecommendation === 'Consider disposal' ? 'destructive' : 'secondary'}>
                              {item.disposalRecommendation}
                            </Badge>
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
    </React.Fragment>
  );
}
