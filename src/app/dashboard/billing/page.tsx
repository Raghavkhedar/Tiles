"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getInvoices, deleteInvoice, updateInvoice } from "@/app/actions";
import { InvoiceWithRelations } from "@/types/database";
import { Download, Eye, Edit, Trash2, Filter, Search, Plus } from "lucide-react";
import { exportToCSV, exportToJSON } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function BillingPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await getInvoices();
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else if (data) {
        setInvoices(data);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load invoices", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Unique customers for filter
  const customers = useMemo(() => {
    const map = new Map();
    invoices.forEach(inv => {
      if (inv.customer) map.set(inv.customer_id, inv.customer.name);
    });
    return Array.from(map.entries());
  }, [invoices]);

  // Filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer?.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      const matchesCustomer = customerFilter === "all" || invoice.customer_id === customerFilter;
      const matchesDateFrom = !dateFrom || new Date(invoice.invoice_date) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(invoice.invoice_date) <= new Date(dateTo);
      return matchesSearch && matchesStatus && matchesCustomer && matchesDateFrom && matchesDateTo;
    });
  }, [invoices, searchTerm, statusFilter, customerFilter, dateFrom, dateTo]);

  // Sorting
  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      if (sortBy === "date") {
        return sortDir === "asc"
          ? new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime()
          : new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
      } else if (sortBy === "amount") {
        return sortDir === "asc"
          ? a.total_amount - b.total_amount
          : b.total_amount - a.total_amount;
      } else if (sortBy === "status") {
        return sortDir === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });
  }, [filteredInvoices, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / PAGE_SIZE);
  const paginatedInvoices = sortedInvoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

  // Actions
  const handleDeleteInvoice = async (id: string) => {
    try {
      const { error } = await deleteInvoice(id);
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Invoice deleted successfully" });
        loadInvoices();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete invoice", variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await updateInvoice(id, { status: newStatus });
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Invoice status updated" });
        loadInvoices();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update invoice status", variant: "destructive" });
    }
  };

  // Export
  const handleExportCSV = () => {
    exportToCSV(sortedInvoices, "invoices.csv");
  };
  const handleExportJSON = () => {
    exportToJSON(sortedInvoices, "invoices.json");
  };

  // UI
  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Billing & Invoices" }]} />

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage customer invoices and payments</p>
        </div>
        <Button onClick={() => router.push("/dashboard/billing/create")}> <Plus className="mr-2 h-4 w-4" /> Create Invoice </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInvoiced.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidInvoices.length}</div>
            <p className="text-xs text-muted-foreground">₹{paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground">₹{pendingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">₹{overdueInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filters & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by customer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
            <Button variant="outline" onClick={handleExportJSON}><Download className="h-4 w-4 mr-2" />Export JSON</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sortedInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No invoices found</p>
              <Button onClick={() => router.push("/dashboard/billing/create")} className="mt-2">Create your first invoice</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 cursor-pointer" onClick={() => { setSortBy("date"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Date</th>
                    <th className="text-left p-2">Invoice #</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => { setSortBy("amount"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                      <td className="p-2 font-medium">{invoice.invoice_number}</td>
                      <td className="p-2">{invoice.customer?.name || "-"}</td>
                      <td className="p-2 font-medium">₹{invoice.total_amount?.toLocaleString() ?? "0"}</td>
                      <td className="p-2">
                        <Select value={invoice.status} onValueChange={value => handleStatusChange(invoice.id, value)}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/billing/${invoice.id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/billing/${invoice.id}/edit`)}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to delete this invoice? This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
          <span className="px-2 py-1">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
