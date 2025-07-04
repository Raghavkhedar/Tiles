'use client'

import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCustomers, deleteCustomer, searchCustomers } from "../../actions/customers";
import { Customer } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";

export default function CustomersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOutstanding: 0,
    totalRevenue: 0
  });

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await getCustomers();
      if (result.success) {
        setCustomers(result.data || []);
        setFilteredCustomers(result.data || []);
        calculateStats(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load customers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customers: Customer[]) => {
    const activeCustomers = customers.filter(customer => customer.status === 'Active').length;
    
    setStats({
      totalCustomers: customers.length,
      activeCustomers,
      totalOutstanding: 0, // Will be calculated from invoices later
      totalRevenue: 0 // Will be calculated from invoices later
    });
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.gst_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadCustomers();
      return;
    }

    setLoading(true);
    try {
      const result = await searchCustomers(searchQuery);
      if (result.success) {
        setFilteredCustomers(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to search customers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      const result = await deleteCustomer(customerToDelete.id);
      if (result.success) {
        toast({
          title: "Success!",
          description: "Customer deleted successfully",
        });
        await loadCustomers(); // Reload the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete customer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return { variant: "default" as const, className: "bg-green-100 text-green-800" };
    } else if (status === 'Overdue') {
      return { variant: "destructive" as const, className: "bg-red-100 text-red-800" };
    } else {
      return { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" };
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    return address.split(',')[0]; // Show only first part of address
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Customer Management" }]} />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Customer Management
              </h1>
              <p className="text-gray-600">
                Manage customer relationships and track payments
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/dashboard/customers/add">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.activeCustomers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Amount
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{stats.totalOutstanding.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers by name, phone, or GST number..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={() => { setSearchQuery(''); loadCustomers(); }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>
                Complete list of your customers with payment tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                    <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-medium text-gray-900">Loading Customers</p>
                    <p className="text-sm text-gray-500 mt-1">Fetching your customer data...</p>
                  </div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No Customers Found' : 'No Customers Yet'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? `No customers found matching "${searchQuery}". Try adjusting your search terms.`
                      : 'Start building your customer base by adding your first customer.'
                    }
                  </p>
                  {!searchQuery ? (
                    <Link href="/dashboard/customers/add">
                      <Button className="bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Customer
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => { setSearchQuery(''); loadCustomers(); }}
                      className="hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Customer Details</TableHead>
                        <TableHead className="font-semibold text-gray-900">Contact Information</TableHead>
                        <TableHead className="font-semibold text-gray-900">GST Number</TableHead>
                        <TableHead className="font-semibold text-gray-900">Credit Info</TableHead>
                        <TableHead className="font-semibold text-gray-900">Outstanding</TableHead>
                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer, index) => {
                        const statusBadge = getStatusBadge(customer.status);
                        return (
                          <TableRow 
                            key={customer.id}
                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                            }`}
                          >
                            <TableCell className="py-4">
                              <div>
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">
                                  {customer.contact_person || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {formatAddress(customer.address)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-gray-700">{customer.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-gray-700">{customer.email || 'N/A'}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm font-mono text-gray-700">
                                {customer.gst_number || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div>
                                <div className="text-sm text-gray-500">
                                  Credit limit: ₹{(customer.credit_limit || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Terms: {customer.payment_terms || 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm text-gray-500">
                                ₹0 {/* Will be calculated from invoices later */}
                              </div>
                              <div className="text-sm text-gray-500">
                                Terms: {customer.payment_terms || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                {customer.status || 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                  onClick={() => router.push(`/dashboard/customers/view/${customer.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                  onClick={() => router.push(`/dashboard/customers/edit/${customer.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => openDeleteDialog(customer)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customerToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
