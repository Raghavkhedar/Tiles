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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

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

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts();
      if (result.success) {
        setProducts(result.data || []);
        setFilteredProducts(result.data || []);
        calculateStats(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load products",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadProducts();
      return;
    }

    setLoading(true);
    try {
      const result = await searchProducts(searchQuery);
      if (result.success) {
        setFilteredProducts(result.data || []);
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
  };

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

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Inventory Management
              </h1>
              <p className="text-gray-600">
                Manage your tile inventory with smart stock tracking
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
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

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name, SKU, or category..."
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
                <Button variant="outline" onClick={() => { setSearchQuery(''); loadProducts(); }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
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
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading products...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {searchQuery ? 'No products found matching your search.' : 'No products in inventory yet.'}
                  </p>
                  {!searchQuery && (
                    <Link href="/dashboard/inventory/add">
                      <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Details</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Price/Box</TableHead>
                      <TableHead>Area/Box</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                SKU: {product.sku}
                              </div>
                              <div className="text-sm text-gray-500">
                                Supplier: {product.supplier?.name || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category?.name || 'N/A'}</TableCell>
                          <TableCell>{formatSize(product)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {product.current_stock || 0} boxes
                              </div>
                              <div className="text-sm text-gray-500">
                                Min: {product.min_stock || 0} | Max: {product.max_stock || 100}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            ₹{(product.price_per_box || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>{(product.area_per_box || 0).toFixed(2)} m²</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => router.push(`/dashboard/inventory/edit/${product.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
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
