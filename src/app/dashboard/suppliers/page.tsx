'use client'

import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Package,
  Calendar,
  Loader2,
  Trash2,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSuppliers, deleteSupplier, searchSuppliers, getSupplierStats } from "../../actions/suppliers";
import { Supplier } from "@/types/database";
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

export default function SuppliersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    averageRating: 0,
    totalCreditLimit: 0
  });

  // Load suppliers
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const result = await getSuppliers();
      if (result.success) {
        setSuppliers(result.data || []);
        setFilteredSuppliers(result.data || []);
        calculateStats(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load suppliers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (suppliers: Supplier[]) => {
    const activeSuppliers = suppliers.filter(supplier => supplier.status === 'Active').length;
    const averageRating = suppliers.length > 0 
      ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length 
      : 0;
    const totalCreditLimit = suppliers.reduce((sum, s) => sum + (s.credit_limit || 0), 0);
    
    setStats({
      totalSuppliers: suppliers.length,
      activeSuppliers,
      averageRating: Math.round(averageRating * 10) / 10,
      totalCreditLimit
    });
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.gst_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  }, [searchQuery, suppliers]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadSuppliers();
      return;
    }

    setLoading(true);
    try {
      const result = await searchSuppliers(searchQuery);
      if (result.success) {
        setFilteredSuppliers(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to search suppliers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const result = await deleteSupplier(supplierToDelete.id);
      if (result.success) {
        toast({
          title: "Success!",
          description: "Supplier deleted successfully",
        });
        await loadSuppliers(); // Reload the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return { variant: "default" as const, className: "bg-green-100 text-green-800" };
    } else if (status === 'Inactive') {
      return { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" };
    } else {
      return { variant: "destructive" as const, className: "bg-red-100 text-red-800" };
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    return address.split(',')[0]; // Show only first part of address
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return 'N/A';
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{rating}</span>
      </div>
    );
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Supplier Management
              </h1>
              <p className="text-gray-600">
                Manage supplier relationships and track purchase orders
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/dashboard/suppliers/add">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Suppliers
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Suppliers
                </CardTitle>
                <Truck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.activeSuppliers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Rating
                </CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Credit Limit
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{stats.totalCreditLimit.toLocaleString()}
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
                    placeholder="Search suppliers by name, phone, or GST number..."
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
                <Button variant="outline" onClick={() => { setSearchQuery(''); loadSuppliers(); }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>
                Complete list of your suppliers with performance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading suppliers...</span>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {searchQuery ? 'No suppliers found matching your search.' : 'No suppliers added yet.'}
                  </p>
                  {!searchQuery && (
                    <Link href="/dashboard/suppliers/add">
                      <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Supplier
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier Details</TableHead>
                      <TableHead>Contact Information</TableHead>
                      <TableHead>GST/PAN</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Credit Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => {
                      const statusBadge = getStatusBadge(supplier.status);
                      return (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-sm text-gray-500">
                                {supplier.contact_person || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {formatAddress(supplier.address)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {supplier.phone || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {supplier.email || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-mono">
                                GST: {supplier.gst_number || 'N/A'}
                              </div>
                              <div className="text-sm font-mono">
                                PAN: {supplier.pan_number || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderRating(supplier.rating)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-500">
                                Credit limit: ₹{(supplier.credit_limit || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                Terms: {supplier.payment_terms || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant} className={statusBadge.className}>
                              {supplier.status || 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => router.push(`/dashboard/suppliers/view/${supplier.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => router.push(`/dashboard/suppliers/edit/${supplier.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openDeleteDialog(supplier)}
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{supplierToDelete?.name}"? This action cannot be undone.
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
