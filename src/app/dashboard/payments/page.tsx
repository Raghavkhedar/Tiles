"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getPayments, deletePayment, syncInvoiceStatuses } from "@/app/actions/billing";
import { getInvoices } from "@/app/actions/billing";
import { PaymentWithRelations, InvoiceWithRelations } from "@/types/database";
import { Download, Eye, Edit, Trash2, Filter, Search, Plus, Calendar, DollarSign, CreditCard, Receipt } from "lucide-react";
import { exportToCSV, exportToJSON } from "@/lib/utils";
import { format } from "date-fns";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "method">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Auto-sync invoice statuses when loading payments page
      console.log('Auto-syncing invoice statuses...');
      await syncInvoiceStatuses();
      
      const [paymentsResult, invoicesResult] = await Promise.all([
        getPayments(),
        getInvoices()
      ]);
      
      if (paymentsResult.success) {
        setPayments(paymentsResult.data || []);
      } else {
        toast({ 
          title: "Error", 
          description: paymentsResult.error || "Failed to load payments", 
          variant: "destructive" 
        });
      }

      if (invoicesResult.success) {
        setInvoices(invoicesResult.data || []);
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load data", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice?.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter;
      const matchesDateFrom = !dateFrom || new Date(payment.payment_date) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(payment.payment_date) <= new Date(dateTo);
      return matchesSearch && matchesMethod && matchesDateFrom && matchesDateTo;
    });
  }, [payments, searchTerm, methodFilter, dateFrom, dateTo]);

  // Sorting
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      if (sortBy === "date") {
        return sortDir === "asc"
          ? new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
          : new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
      } else if (sortBy === "amount") {
        return sortDir === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortBy === "method") {
        return sortDir === "asc"
          ? a.payment_method.localeCompare(b.payment_method)
          : b.payment_method.localeCompare(a.payment_method);
      }
      return 0;
    });
  }, [filteredPayments, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedPayments.length / PAGE_SIZE);
  const paginatedPayments = sortedPayments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const thisMonthPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.payment_date);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const paymentMethods = {
    'Cash': payments.filter(p => p.payment_method === 'Cash').length,
    'Bank Transfer': payments.filter(p => p.payment_method === 'Bank Transfer').length,
    'Cheque': payments.filter(p => p.payment_method === 'Cheque').length,
    'UPI': payments.filter(p => p.payment_method === 'UPI').length,
    'Card': payments.filter(p => p.payment_method === 'Card').length,
  };

  // Actions
  const handleDeletePayment = async (id: string) => {
    try {
      const result = await deletePayment(id);
      if (result.success) {
        toast({ title: "Success", description: "Payment deleted successfully" });
        loadData();
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to delete payment", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete payment", 
        variant: "destructive" 
      });
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <DollarSign className="w-4 h-4" />;
      case 'Bank Transfer': return <CreditCard className="w-4 h-4" />;
      case 'Cheque': return <Receipt className="w-4 h-4" />;
      case 'UPI': return <CreditCard className="w-4 h-4" />;
      case 'Card': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-muted text-muted-foreground';
      case 'Sent': return 'bg-orange-100 text-orange-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Export
  const handleExportCSV = () => {
    exportToCSV(sortedPayments, "payments.csv");
  };
  const handleExportJSON = () => {
    exportToJSON(sortedPayments, "payments.json");
  };



  if (loading) {
    return (
      <div className="space-y-6 p-6 pb-20">
        <Breadcrumb items={[{ label: "Payments" }]} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Payments" }]} />

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">Track and manage customer payments</p>
        </div>
        <Button onClick={() => router.push("/dashboard/payments/record")}>
          <Plus className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{payments.length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{thisMonthTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{thisMonthPayments.length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{payments.length > 0 ? (totalPayments / payments.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">per payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(paymentMethods).length}</div>
            <p className="text-xs text-muted-foreground">different methods</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Payment History</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" onClick={handleExportJSON}>
                <Download className="mr-2 h-4 w-4" /> Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Invoice</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Reference</th>
                  <th className="text-left p-2">Invoice Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted">
                    <td className="p-2">
                      {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-2">
                      <span className="font-medium">{payment.invoice?.invoice_number}</span>
                    </td>
                    <td className="p-2">
                      {payment.invoice?.customer?.name}
                    </td>
                    <td className="p-2">
                      <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.payment_method)}
                        <span>{payment.payment_method}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-sm text-gray-600">{payment.reference_number || '-'}</span>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(payment.invoice?.status || 'Unknown')}>
                        {payment.invoice?.status || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/payments/view/${payment.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/payments/edit/${payment.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this payment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePayment(payment.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 