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
import { getInvoices, deleteInvoice, updateInvoice } from "@/app/actions/billing";
import { InvoiceWithRelations } from "@/types/database";
import { Download, Eye, Edit, Trash2, Filter, Search, Plus } from "lucide-react";
import { exportToCSV, exportToJSON } from "@/lib/utils";
import { downloadInvoicePDF, getBusinessSettingsForPDF } from "@/lib/pdf-generator";

const PAGE_SIZE = 10;

export default function BillingPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      const result = await getInvoices();
      if (result.success) {
        setInvoices(result.data || []);
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to load invoices", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load invoices", 
        variant: "destructive" 
      });
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
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'Draft' || inv.status === 'Sent');
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');

  // Actions
  const handleDeleteInvoice = async (id: string) => {
    try {
      const result = await deleteInvoice(id);
      if (result.success) {
        toast({ title: "Success", description: "Invoice deleted successfully" });
        loadInvoices();
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to delete invoice", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete invoice", 
        variant: "destructive" 
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const result = await updateInvoice(id, { status: newStatus });
      if (result.success) {
        toast({ title: "Success", description: "Invoice status updated" });
        loadInvoices();
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to update invoice status", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update invoice status", 
        variant: "destructive" 
      });
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Customer</label>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" /> CSV
              </Button>
              <Button variant="outline" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" /> JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Invoice #</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{invoice.invoice_number}</td>
                        <td className="p-2">{invoice.customer?.name}</td>
                        <td className="p-2">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                        <td className="p-2">₹{invoice.total_amount.toLocaleString()}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              invoice.status === 'Paid' ? 'bg-green-500' :
                              invoice.status === 'Overdue' ? 'bg-red-500' :
                              invoice.status === 'Draft' ? 'bg-gray-500' :
                              invoice.status === 'Sent' ? 'bg-blue-500' :
                              invoice.status === 'Cancelled' ? 'bg-gray-400' :
                              'bg-yellow-500'
                            }`} />
                            <Select 
                              value={invoice.status} 
                              onValueChange={(newStatus) => handleStatusChange(invoice.id, newStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Sent">Sent</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Overdue">Overdue</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/dashboard/billing/view/${invoice.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/dashboard/billing/edit/${invoice.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  const businessOptions = await getBusinessSettingsForPDF();
                                  await downloadInvoicePDF(invoice, businessOptions);
                                  toast({ title: "Success", description: "Invoice PDF downloaded" });
                                } catch (error) {
                                  toast({ 
                                    title: "Error", 
                                    description: "Failed to download PDF", 
                                    variant: "destructive" 
                                  });
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
