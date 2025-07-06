'use client'

import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit,
  Trash2,
  Calculator,
  Loader2,
  Download,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getProducts, deleteProduct, searchProducts, getLowStockProducts } from "../../actions/inventory";
import { ProductWithRelations } from "@/types/database";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { exportToCSV, exportToJSON } from "@/lib/utils";

export default function InventoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductWithRelations | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalValue: 0,
    categories: 0
  });
  
  // Performance optimizations
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Memoized filtered and sorted products
  const processedProducts = useMemo(() => {
    let filtered = filteredProducts;

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.name === categoryFilter
      );
    }

    // Apply stock filter
    if (stockFilter && stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(product => 
            (product.current_stock || 0) <= (product.min_stock || 0)
          );
          break;
        case 'out':
          filtered = filtered.filter(product => 
            (product.current_stock || 0) === 0
          );
          break;
        case 'in':
          filtered = filtered.filter(product => 
            (product.current_stock || 0) > (product.min_stock || 0)
          );
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ProductWithRelations];
      let bValue: any = b[sortBy as keyof ProductWithRelations];
      
      if (sortBy === 'category') {
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [filteredProducts, categoryFilter, stockFilter, sortBy, sortOrder]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedProducts, currentPage, itemsPerPage]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products.map(p => p.category?.name).filter((name): name is string => Boolean(name))
    );
    return Array.from(uniqueCategories).sort();
  }, [products]);

  // Load products with error handling and retry logic
  const loadProducts = useCallback(async (retryCount = 0) => {
    setLoading(true);
    try {
      const result = await getProducts();
      if (result.success) {
        setProducts(result.data || []);
        setFilteredProducts(result.data || []);
        calculateStats(result.data || []);
        setCurrentPage(1); // Reset to first page when data changes
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load products",
          variant: "destructive",
        });
        
        // Retry logic
        if (retryCount < 3) {
          setTimeout(() => loadProducts(retryCount + 1), 1000 * (retryCount + 1));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      
      if (retryCount < 3) {
        setTimeout(() => loadProducts(retryCount + 1), 1000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const calculateStats = (products: ProductWithRelations[]) => {
    const lowStockCount = products.filter(product => 
      (product.current_stock || 0) <= (product.min_stock || 0)
    ).length;
    
    const totalValue = products.reduce((sum, product) => 
      sum + ((product.current_stock || 0) * (product.price_per_box || 0)), 0
    );
    
    const categories = new Set(products.map(p => p.category?.name).filter(Boolean)).size;
    
    setStats({
      totalProducts: products.length,
      lowStockCount,
      totalValue,
      categories
    });
  };

  // Debounced search functionality
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      await loadProducts();
      return;
    }

    setLoading(true);
    try {
      const result = await searchProducts(searchQuery);
      if (result.success) {
        setFilteredProducts(result.data || []);
        setCurrentPage(1);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to search products",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loadProducts, toast]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        toast({
          title: "Success!",
          description: "Product deleted successfully",
        });
        await loadProducts(); // Reload the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const openDeleteDialog = (product: ProductWithRelations) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const getStockStatus = (product: ProductWithRelations) => {
    const currentStock = product.current_stock || 0;
    const minStock = product.min_stock || 0;
    
    if (currentStock <= minStock) {
      return { status: "Low Stock", variant: "destructive" as const };
    } else if (currentStock <= minStock * 1.5) {
      return { status: "Medium Stock", variant: "secondary" as const };
    } else {
      return { status: "In Stock", variant: "default" as const };
    }
  };

  const formatSize = (product: ProductWithRelations) => {
    if (product.length && product.width) {
      return `${product.length}x${product.width} cm`;
    }
    return "N/A";
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setCategoryFilter('all');
    setStockFilter('all');
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const handleExport = (format: 'csv' | 'json') => {
    try {
      const exportData = processedProducts.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name || 'N/A',
        brand: product.brand || 'N/A',
        length: product.length || 'N/A',
        width: product.width || 'N/A',
        thickness: product.thickness || 'N/A',
        tiles_per_box: product.tiles_per_box,
        area_per_box: product.area_per_box,
        weight_per_box: product.weight_per_box || 'N/A',
        price_per_box: product.price_per_box,
        current_stock: product.current_stock || 0,
        min_stock: product.min_stock || 0,
        max_stock: product.max_stock || 0,
        supplier: product.supplier?.name || 'N/A',
        created_at: new Date(product.created_at).toLocaleDateString(),
        updated_at: new Date(product.updated_at).toLocaleDateString()
      }));

      const filename = `inventory_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast({
        title: "Export Successful",
        description: `Inventory data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export inventory data",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Inventory Management" }]} />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Inventory Management
              </h1>
              <p className="text-muted-foreground">
                Manage your tile inventory with smart stock tracking
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={processedProducts.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('json')}
                disabled={processedProducts.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Link href="/dashboard/inventory/add">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalProducts}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.lowStockCount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Stock Value
                </CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{stats.totalValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categories
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories}</div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                    <SelectItem value="in">In Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Complete list of your tile products with stock levels
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
                    <p className="text-lg font-medium text-foreground">Loading Inventory</p>
                    <p className="text-sm text-muted-foreground mt-1">Fetching your product data...</p>
                  </div>
                </div>
              ) : processedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchQuery || (categoryFilter !== 'all') || (stockFilter !== 'all') ? 'No Products Found' : 'No Products Yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery || (categoryFilter !== 'all') || (stockFilter !== 'all')
                      ? 'No products match your current filters. Try adjusting your search criteria.'
                      : 'Get started by adding your first tile product to your inventory.'
                    }
                  </p>
                  {!searchQuery && categoryFilter === 'all' && stockFilter === 'all' ? (
                    <Link href="/dashboard/inventory/add">
                      <Button className="bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                          <TableHead 
                            className="font-semibold text-foreground cursor-pointer hover:bg-muted"
                            onClick={() => handleSort('name')}
                          >
                            Product Details {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead 
                            className="font-semibold text-foreground cursor-pointer hover:bg-muted"
                            onClick={() => handleSort('category')}
                          >
                            Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="font-semibold text-foreground">Size</TableHead>
                          <TableHead 
                            className="font-semibold text-foreground cursor-pointer hover:bg-muted"
                            onClick={() => handleSort('current_stock')}
                          >
                            Stock Level {sortBy === 'current_stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead 
                            className="font-semibold text-foreground cursor-pointer hover:bg-muted"
                            onClick={() => handleSort('price_per_box')}
                          >
                            Price/Box {sortBy === 'price_per_box' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="font-semibold text-foreground">Area/Box</TableHead>
                          <TableHead className="font-semibold text-foreground">Status</TableHead>
                          <TableHead className="font-semibold text-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.map((product, index) => {
                          const stockStatus = getStockStatus(product);
                          return (
                            <TableRow 
                              key={product.id} 
                              className={`hover:bg-gray-50 transition-colors duration-150 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                              }`}
                            >
                              <TableCell className="py-4">
                                <div>
                                  <div className="font-medium text-foreground">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    SKU: {product.sku}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Supplier: {product.supplier?.name || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-muted-foreground">{product.category?.name || 'N/A'}</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-muted-foreground">{formatSize(product)}</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <div>
                                  <div className="font-medium text-foreground">
                                    {product.current_stock || 0} boxes
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Min: {product.min_stock || 0} | Max: {product.max_stock || 100}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="font-medium text-foreground">
                                  ₹{(product.price_per_box || 0).toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-muted-foreground">{(product.area_per_box || 0).toFixed(2)} m²</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge variant={stockStatus.variant} className="font-medium">
                                  {stockStatus.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                    onClick={() => router.push(`/dashboard/inventory/edit/${product.id}`)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => openDeleteDialog(product)}
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
                  
                  {/* Pagination */}
                  {processedProducts.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedProducts.length)} of {processedProducts.length} products
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage * itemsPerPage >= processedProducts.length}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
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
