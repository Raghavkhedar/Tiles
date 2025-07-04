'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createPurchaseOrder, addPurchaseOrderItem } from '@/app/actions/purchase-orders'
import { getSuppliers } from '@/app/actions/suppliers'
import { getProducts } from '@/app/actions/inventory'
import { Supplier, Product } from '@/types/database'
import Link from 'next/link'

interface PurchaseOrderItem {
  product_id?: string
  product_name: string
  sku?: string
  purchase_type: 'boxes' | 'area'
  quantity: number // boxes
  area: number // area in sq ft
  unit_price: number
  total_price: number
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    delivery_address: '',
    contact_person: '',
    phone: '',
    payment_terms: '',
    notes: ''
  })

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      product_name: '',
      purchase_type: 'boxes',
      quantity: 1,
      area: 0,
      unit_price: 0,
      total_price: 0
    }
  ])

  useEffect(() => {
    loadSuppliers()
    loadProducts()
  }, [])

  useEffect(() => {
    // Check for supplier parameter in URL after suppliers are loaded
    if (suppliers.length > 0) {
      const urlParams = new URLSearchParams(window.location.search)
      const supplierId = urlParams.get('supplier')
      if (supplierId) {
        handleSupplierChange(supplierId)
      }
    }
  }, [suppliers])

  useEffect(() => {
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        delivery_address: selectedSupplier.address || '',
        contact_person: selectedSupplier.contact_person || '',
        phone: selectedSupplier.phone || '',
        payment_terms: selectedSupplier.payment_terms || ''
      }))
    }
  }, [selectedSupplier])

  const loadSuppliers = async () => {
    const result = await getSuppliers()
    if (result.success) {
      setSuppliers(result.data || [])
    }
  }

  const loadProducts = async () => {
    const result = await getProducts()
    if (result.success) {
      setProducts(result.data || [])
    }
  }

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    setSelectedSupplier(supplier || null)
    setFormData(prev => ({ ...prev, supplier_id: supplierId }))
  }

  const addItem = () => {
    setItems([...items, {
      product_name: '',
      purchase_type: 'boxes',
      quantity: 1,
      area: 0,
      unit_price: 0,
      total_price: 0
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Calculate total price
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity
      const unitPrice = field === 'unit_price' ? value : updatedItems[index].unit_price
      updatedItems[index].total_price = quantity * unitPrice
    }
    
    setItems(updatedItems)
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      const updatedItems = [...items]
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: productId,
        product_name: product.name,
        sku: product.sku,
        unit_price: product.price_per_box,
        total_price: product.price_per_box * updatedItems[index].quantity
      }
      setItems(updatedItems)
    }
  }

  const calculateQuantityFromArea = (area: number, areaPerBox: number): number => {
    return Math.ceil(area / areaPerBox)
  }

  const calculateAreaFromQuantity = (quantity: number, areaPerBox: number): number => {
    return quantity * areaPerBox
  }

  const handlePurchaseTypeChange = (index: number, purchaseType: 'boxes' | 'area') => {
    const item = items[index]
    const product = products.find(p => p.id === item.product_id)
    const updatedItems = [...items]
    
    if (product) {
      if (purchaseType === 'area') {
        // Convert current quantity to area
        const area = calculateAreaFromQuantity(item.quantity, product.area_per_box)
        updatedItems[index] = {
          ...updatedItems[index],
          purchase_type: purchaseType,
          area: area
        }
      } else {
        // Convert current area to quantity
        const quantity = calculateQuantityFromArea(item.area, product.area_per_box)
        updatedItems[index] = {
          ...updatedItems[index],
          purchase_type: purchaseType,
          quantity: quantity
        }
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        purchase_type: purchaseType
      }
    }
    
    setItems(updatedItems)
  }

  const handleQuantityChange = (index: number, value: number) => {
    const item = items[index]
    const product = products.find(p => p.id === item.product_id)
    const updatedItems = [...items]
    
    if (product) {
      const area = calculateAreaFromQuantity(value, product.area_per_box)
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: value,
        area: area,
        total_price: value * item.unit_price
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: value,
        total_price: value * item.unit_price
      }
    }
    
    setItems(updatedItems)
  }

  const handleAreaChange = (index: number, value: number) => {
    const item = items[index]
    const product = products.find(p => p.id === item.product_id)
    const updatedItems = [...items]
    
    if (product) {
      const quantity = calculateQuantityFromArea(value, product.area_per_box)
      updatedItems[index] = {
        ...updatedItems[index],
        area: value,
        quantity: quantity,
        total_price: quantity * item.unit_price
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        area: value,
        total_price: value * item.unit_price
      }
    }
    
    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const gstRate = 0.18 // 18% GST
    const gstAmount = subtotal * gstRate
    const total = subtotal + gstAmount
    
    return { subtotal, gstAmount, total }
  }

  const validateForm = () => {
    if (!formData.supplier_id) {
      toast({
        title: 'Error',
        description: 'Please select a supplier',
        variant: 'destructive'
      })
      return false
    }

    if (!formData.order_date || formData.order_date === '') {
      toast({
        title: 'Error',
        description: 'Please select an order date',
        variant: 'destructive'
      })
      return false
    }

    const validItems = items.filter(item => 
      item.product_name && item.product_id && 
      ((item.purchase_type === 'boxes' && item.quantity > 0) || 
       (item.purchase_type === 'area' && item.area > 0)) && 
      item.unit_price > 0
    )

    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form data before validation:', formData)
    
    if (!validateForm()) return

    setLoading(true)

    try {
      // Create purchase order
      const poData = {
        ...formData,
        order_date: formData.order_date || new Date().toISOString().split('T')[0],
        subtotal: calculateTotals().subtotal,
        gst_amount: calculateTotals().gstAmount,
        total_amount: calculateTotals().total,
        paid_amount: 0,
        balance_amount: calculateTotals().total,
        status: 'Draft'
      }

      console.log('Submitting PO data:', poData)
      const poResult = await createPurchaseOrder(poData)
      
      if (!poResult.success) {
        throw new Error(poResult.error)
      }

      // Add items
      const validItems = items.filter(item => 
        item.product_name && item.product_id && 
        ((item.purchase_type === 'boxes' && item.quantity > 0) || 
         (item.purchase_type === 'area' && item.area > 0)) && 
        item.unit_price > 0
      )

      for (const item of validItems) {
        const itemData = {
          purchase_order_id: poResult.data.id,
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          quantity: item.quantity,
          area: item.area,
          unit_price: item.unit_price,
          total_price: item.total_price,
          received_quantity: 0
        }

        const itemResult = await addPurchaseOrderItem(itemData)
        if (!itemResult.success) {
          console.error('Error adding item:', itemResult.error)
        }
      }

      toast({
        title: 'Success',
        description: 'Purchase order created successfully'
      })

      router.push('/dashboard/purchase-orders')
    } catch (error) {
      console.error('Error creating purchase order:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create purchase order',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, gstAmount, total } = calculateTotals()

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchase-orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
          <p className="text-muted-foreground">Create a new purchase order for your supplier</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
            <CardDescription>Select supplier and enter order details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={formData.supplier_id} onValueChange={handleSupplierChange}>
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

              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date *</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                <Input
                  id="expected_delivery_date"
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                  placeholder="e.g., Net 30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Textarea
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Additional notes or special instructions..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Add products to your purchase order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={item.product_id || ''} onValueChange={(value) => handleProductSelect(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product">
                          {item.product_name ? `${item.product_name} (${item.sku})` : 'Select product'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Purchase Type</Label>
                    <Select value={item.purchase_type} onValueChange={(value) => handlePurchaseTypeChange(index, value as 'boxes' | 'area')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boxes">By Boxes</SelectItem>
                        <SelectItem value="area">By Area (sq ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{item.purchase_type === 'boxes' ? 'Quantity (Boxes)' : 'Area (sq ft)'}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.purchase_type === 'boxes' ? item.quantity : item.area}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (item.purchase_type === 'boxes') {
                          handleQuantityChange(index, value)
                        } else {
                          handleAreaChange(index, value)
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Display calculated values */}
                {item.product_id && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                    <div>
                      <Label className="text-sm text-gray-600">Boxes Required</Label>
                      <div className="font-semibold">{item.quantity}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Area Coverage</Label>
                      <div className="font-semibold">{item.area.toFixed(2)} sq ft</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Unit Price</Label>
                      <div className="font-semibold">₹{item.unit_price.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <div className="text-lg font-semibold">
                    Total: ₹{item.total_price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/purchase-orders">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </div>
  )
} 