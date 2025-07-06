'use client'

import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Package,
  Save,
  ArrowLeft,
  Calculator,
  Image,
  Barcode,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createProduct, getCategories, getSuppliers } from "../../../actions/inventory";
import { ProductInsert } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    brand: '',
    description: '',
    length: '',
    width: '',
    thickness: '',
    tiles_per_box: '',
    area_per_box: '',
    weight_per_box: '',
    price_per_box: '',
    current_stock: '',
    min_stock: '',
    max_stock: '',
    supplier_id: '',
  });

  // Load categories and suppliers
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResult, suppliersResult] = await Promise.all([
          getCategories(),
          getSuppliers()
        ]);

        if (categoriesResult.success) {
          setCategories(categoriesResult.data || []);
        }

        if (suppliersResult.success) {
          setSuppliers(suppliersResult.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['name', 'sku', 'tiles_per_box', 'area_per_box', 'price_per_box', 'min_stock'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Validate numeric fields
    const numericFields = ['tiles_per_box', 'area_per_box', 'price_per_box', 'current_stock', 'min_stock', 'max_stock'];
    for (const field of numericFields) {
      const value = formData[field as keyof typeof formData];
      if (value && isNaN(Number(value))) {
        toast({
          title: "Validation Error",
          description: `${field.replace('_', ' ')} must be a valid number`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData: Omit<ProductInsert, 'user_id'> = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category_id || null,
        brand: formData.brand || null,
        description: formData.description || null,
        length: formData.length ? Number(formData.length) : null,
        width: formData.width ? Number(formData.width) : null,
        thickness: formData.thickness ? Number(formData.thickness) : null,
        tiles_per_box: Number(formData.tiles_per_box),
        area_per_box: Number(formData.area_per_box),
        weight_per_box: formData.weight_per_box ? Number(formData.weight_per_box) : null,
        price_per_box: Number(formData.price_per_box),
        current_stock: formData.current_stock ? Number(formData.current_stock) : 0,
        min_stock: Number(formData.min_stock),
        max_stock: formData.max_stock ? Number(formData.max_stock) : 100,
        supplier_id: formData.supplier_id || null,
      };

      const result = await createProduct(productData);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Product created successfully",
        });
        router.push('/dashboard/inventory');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create product",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Inventory Management", href: "/dashboard/inventory" },
            { label: "Add Product" }
          ]} />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/inventory">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Inventory
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Add New Product
              </h1>
              <p className="text-muted-foreground">
                Add a new tile product to your inventory
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Product Information
                    </CardTitle>
                    <CardDescription>
                      Enter the basic details of the tile product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName" className="text-sm font-medium">
                          Product Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="productName"
                          placeholder="Ceramic Floor Tiles - White"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-orange-500"
                          aria-describedby="productName-help"
                        />
                        <p id="productName-help" className="text-xs text-muted-foreground mt-1">
                          Enter the full product name as it appears on packaging
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku" className="text-sm font-medium">
                          SKU/Product Code <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="sku" 
                          placeholder="CFT-WHT-001" 
                          value={formData.sku}
                          onChange={(e) => handleInputChange('sku', e.target.value)}
                          required 
                          className="focus:ring-2 focus:ring-orange-500"
                          aria-describedby="sku-help"
                        />
                        <p id="sku-help" className="text-xs text-muted-foreground mt-1">
                          Unique product identifier code
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                        <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                          <SelectTrigger className="focus:ring-2 focus:ring-orange-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
                        <Input 
                          id="brand" 
                          placeholder="Kajaria, Somany, etc." 
                          value={formData.brand}
                          onChange={(e) => handleInputChange('brand', e.target.value)}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed description of the tile product..."
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      Tile Specifications
                    </CardTitle>
                    <CardDescription>
                      Enter size and packaging details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length" className="text-sm font-medium">Length (cm)</Label>
                        <Input
                          id="length"
                          type="number"
                          placeholder="60"
                          value={formData.length}
                          onChange={(e) => handleInputChange('length', e.target.value)}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="width" className="text-sm font-medium">Width (cm)</Label>
                        <Input
                          id="width"
                          type="number"
                          placeholder="60"
                          value={formData.width}
                          onChange={(e) => handleInputChange('width', e.target.value)}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="thickness" className="text-sm font-medium">Thickness (mm)</Label>
                        <Input
                          id="thickness"
                          type="number"
                          placeholder="8"
                          step="0.1"
                          value={formData.thickness}
                          onChange={(e) => handleInputChange('thickness', e.target.value)}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tilesPerBox" className="text-sm font-medium">
                          Tiles per Box <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="tilesPerBox"
                          type="number"
                          placeholder="4"
                          value={formData.tiles_per_box}
                          onChange={(e) => handleInputChange('tiles_per_box', e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="areaPerBox" className="text-sm font-medium">
                          Area per Box (m²) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="areaPerBox"
                          type="number"
                          placeholder="1.44"
                          step="0.01"
                          value={formData.area_per_box}
                          onChange={(e) => handleInputChange('area_per_box', e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weightPerBox" className="text-sm font-medium">Weight per Box (kg)</Label>
                        <Input
                          id="weightPerBox"
                          type="number"
                          placeholder="25"
                          step="0.1"
                          value={formData.weight_per_box}
                          onChange={(e) => handleInputChange('weight_per_box', e.target.value)}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Supplier Information */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      Supplier Information
                    </CardTitle>
                    <CardDescription>
                      Select the primary supplier for this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplier" className="text-sm font-medium">Primary Supplier</Label>
                        <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange('supplier_id', value)}>
                          <SelectTrigger className="focus:ring-2 focus:ring-orange-500">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplierCode" className="text-sm font-medium">
                          Supplier Product Code
                        </Label>
                        <Input id="supplierCode" placeholder="SUP-CFT-001" className="focus:ring-2 focus:ring-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pricing and Stock */}
              <div className="space-y-6">
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-orange-600" />
                      Pricing Information
                    </CardTitle>
                    <CardDescription>
                      Set purchase and selling prices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice" className="text-sm font-medium">
                        Selling Price per Box (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        placeholder="1200"
                        min="0"
                        step="0.01"
                        value={formData.price_per_box}
                        onChange={(e) => handleInputChange('price_per_box', e.target.value)}
                        required
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Stock Management
                    </CardTitle>
                    <CardDescription>
                      Set initial stock and reorder levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="initialStock" className="text-sm font-medium">Initial Stock (Boxes)</Label>
                      <Input
                        id="initialStock"
                        type="number"
                        placeholder="50"
                        min="0"
                        value={formData.current_stock}
                        onChange={(e) => handleInputChange('current_stock', e.target.value)}
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock" className="text-sm font-medium">
                        Minimum Stock Level <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minStock"
                        type="number"
                        placeholder="10"
                        min="0"
                        value={formData.min_stock}
                        onChange={(e) => handleInputChange('min_stock', e.target.value)}
                        required
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStock" className="text-sm font-medium">Maximum Stock Level</Label>
                      <Input
                        id="maxStock"
                        type="number"
                        placeholder="100"
                        min="0"
                        value={formData.max_stock}
                        onChange={(e) => handleInputChange('max_stock', e.target.value)}
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-pink-600" />
                      Product Images
                    </CardTitle>
                    <CardDescription>
                      Upload product images for better presentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                      <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload product images
                      </p>
                      <Button variant="outline" size="sm" type="button" className="hover:bg-orange-50">
                        Choose Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Product
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full hover:bg-muted" type="button">
                    Save & Add Another
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
