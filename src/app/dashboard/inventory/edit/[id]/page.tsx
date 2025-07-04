'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import DashboardNavbar from '@/components/dashboard-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Save, X } from 'lucide-react'
import { getProduct, updateProduct, getCategories, getSuppliers } from '../../../../actions/inventory'
import { ProductWithRelations, Category, Supplier } from '@/types/database'
import Link from 'next/link'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    supplier_id: '',
    brand: '',
    length: '',
    width: '',
    thickness: '',
    price_per_box: '',
    tiles_per_box: '',
    area_per_box: '',
    current_stock: '',
    min_stock: '',
    max_stock: '',
    weight_per_box: '',
    color: '',
    finish: '',
    material: ''
  })

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load product data
      const productResult = await getProduct(productId)
      if (!productResult.success) {
        toast({
          title: "Error",
          description: productResult.error || "Failed to load product",
          variant: "destructive",
        })
        router.push('/dashboard/inventory')
        return
      }

      const productData = productResult.data
      setProduct(productData)

      // Set form data
      setFormData({
        name: productData.name || '',
        sku: productData.sku || '',
        description: productData.description || '',
        category_id: productData.category_id || '',
        supplier_id: productData.supplier_id || '',
        brand: productData.brand || '',
        length: productData.length?.toString() || '',
        width: productData.width?.toString() || '',
        thickness: productData.thickness?.toString() || '',
        price_per_box: productData.price_per_box?.toString() || '',
        tiles_per_box: productData.tiles_per_box?.toString() || '',
        area_per_box: productData.area_per_box?.toString() || '',
        current_stock: productData.current_stock?.toString() || '',
        min_stock: productData.min_stock?.toString() || '',
        max_stock: productData.max_stock?.toString() || '',
        weight_per_box: productData.weight_per_box?.toString() || '',
        color: productData.color || '',
        finish: productData.finish || '',
        material: productData.material || ''
      })

      // Load categories and suppliers
      const [categoriesResult, suppliersResult] = await Promise.all([
        getCategories(),
        getSuppliers()
      ])

      if (categoriesResult.success) {
        setCategories(categoriesResult.data || [])
      }

      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data || [])
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      })
      router.push('/dashboard/inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateAreaPerBox = () => {
    const length = parseFloat(formData.length) || 0
    const width = parseFloat(formData.width) || 0
    const tilesPerBox = parseFloat(formData.tiles_per_box) || 0
    
    if (length && width && tilesPerBox) {
      const areaPerTile = (length * width) / 10000 // Convert to square meters
      const areaPerBox = areaPerTile * tilesPerBox
      setFormData(prev => ({
        ...prev,
        area_per_box: areaPerBox.toFixed(2)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.sku) {
        toast({
          title: "Validation Error",
          description: "Name and SKU are required fields",
          variant: "destructive",
        })
        return
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
        brand: formData.brand,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        thickness: formData.thickness ? parseFloat(formData.thickness) : null,
        price_per_box: formData.price_per_box ? parseFloat(formData.price_per_box) : null,
        tiles_per_box: formData.tiles_per_box ? parseInt(formData.tiles_per_box) : null,
        area_per_box: formData.area_per_box ? parseFloat(formData.area_per_box) : null,
        current_stock: formData.current_stock ? parseInt(formData.current_stock) : null,
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : null,
        max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
        weight_per_box: formData.weight_per_box ? parseFloat(formData.weight_per_box) : null,
        color: formData.color,
        finish: formData.finish,
        material: formData.material
      }

      const result = await updateProduct(productId, updateData)
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Product updated successfully",
        })
        router.push('/dashboard/inventory')
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update product",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading product...</span>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-8">
              <p className="text-gray-600">Product not found</p>
              <Link href="/dashboard/inventory">
                <Button className="mt-4">Back to Inventory</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/inventory">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600">Update product information</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/inventory">
                <Button variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button 
                onClick={handleSubmit} 
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential product details and identification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Ceramic Floor Tiles - White"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="e.g., CFT-WHT-001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="e.g., ABC Ceramics"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => handleInputChange('category_id', value)}
                      >
                        <SelectTrigger>
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

                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select
                        value={formData.supplier_id}
                        onValueChange={(value) => handleInputChange('supplier_id', value)}
                      >
                        <SelectTrigger>
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
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                  <CardDescription>
                    Physical dimensions and material properties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length (cm)</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.1"
                        value={formData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        onBlur={calculateAreaPerBox}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Width (cm)</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.1"
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        onBlur={calculateAreaPerBox}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="thickness">Thickness (mm)</Label>
                      <Input
                        id="thickness"
                        type="number"
                        step="0.1"
                        value={formData.thickness}
                        onChange={(e) => handleInputChange('thickness', e.target.value)}
                        placeholder="8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={formData.material}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                        placeholder="e.g., Ceramic, Vitrified"
                      />
                    </div>
                    <div>
                      <Label htmlFor="finish">Finish</Label>
                      <Input
                        id="finish"
                        value={formData.finish}
                        onChange={(e) => handleInputChange('finish', e.target.value)}
                        placeholder="e.g., Glossy, Matte"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="e.g., White, Blue, Black"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Stock */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Stock</CardTitle>
                  <CardDescription>
                    Cost information and inventory management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price_per_box">Price per Box (₹)</Label>
                    <Input
                      id="price_per_box"
                      type="number"
                      step="0.01"
                      value={formData.price_per_box}
                      onChange={(e) => handleInputChange('price_per_box', e.target.value)}
                      placeholder="1200.00"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tiles_per_box">Tiles per Box</Label>
                      <Input
                        id="tiles_per_box"
                        type="number"
                        value={formData.tiles_per_box}
                        onChange={(e) => handleInputChange('tiles_per_box', e.target.value)}
                        onBlur={calculateAreaPerBox}
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="area_per_box">Area per Box (m²)</Label>
                      <Input
                        id="area_per_box"
                        type="number"
                        step="0.01"
                        value={formData.area_per_box}
                        onChange={(e) => handleInputChange('area_per_box', e.target.value)}
                        placeholder="1.44"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="current_stock">Current Stock</Label>
                      <Input
                        id="current_stock"
                        type="number"
                        value={formData.current_stock}
                        onChange={(e) => handleInputChange('current_stock', e.target.value)}
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_stock">Min Stock</Label>
                      <Input
                        id="min_stock"
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) => handleInputChange('min_stock', e.target.value)}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_stock">Max Stock</Label>
                      <Input
                        id="max_stock"
                        type="number"
                        value={formData.max_stock}
                        onChange={(e) => handleInputChange('max_stock', e.target.value)}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight_per_box">Weight per Box (kg)</Label>
                    <Input
                      id="weight_per_box"
                      type="number"
                      step="0.1"
                      value={formData.weight_per_box}
                      onChange={(e) => handleInputChange('weight_per_box', e.target.value)}
                      placeholder="25.5"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
    </>
  )
} 