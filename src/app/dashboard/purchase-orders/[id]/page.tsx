'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Printer, Download, Send, Check, X, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { getPurchaseOrder, getPurchaseOrderItems, updatePurchaseOrderStatus, recordPurchaseOrderPayment } from '@/app/actions/purchase-orders'
import { PurchaseOrderWithRelations, PurchaseOrderItemWithProduct } from '@/types/database'
import Link from 'next/link'

export default function PurchaseOrderViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderWithRelations | null>(null)
  const [items, setItems] = useState<PurchaseOrderItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const poId = params.id as string

  useEffect(() => {
    if (poId) {
      loadPurchaseOrder()
    }
  }, [poId])

  const loadPurchaseOrder = async () => {
    setLoading(true)
    try {
      const [poResult, itemsResult] = await Promise.all([
        getPurchaseOrder(poId),
        getPurchaseOrderItems(poId)
      ])

      if (poResult.success) {
        setPurchaseOrder(poResult.data)
      } else {
        toast({
          title: 'Error',
          description: poResult.error || 'Failed to load purchase order',
          variant: 'destructive'
        })
      }

      if (itemsResult.success) {
        setItems(itemsResult.data || [])
      }
    } catch (error) {
      console.error('Error loading purchase order:', error)
      toast({
        title: 'Error',
        description: 'Failed to load purchase order',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(true)
    try {
      const result = await updatePurchaseOrderStatus(poId, newStatus)
      if (result.success) {
        setPurchaseOrder(result.data)
        toast({
          title: 'Success',
          description: `Purchase order status updated to ${newStatus}`
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update status',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handlePayment = async (amount: number) => {
    setActionLoading(true)
    try {
      const result = await recordPurchaseOrderPayment(poId, amount)
      if (result.success) {
        setPurchaseOrder(result.data)
        toast({
          title: 'Success',
          description: `Payment of ₹${amount.toFixed(2)} recorded successfully`
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to record payment',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Draft': { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      'Sent': { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      'Confirmed': { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      'Partially Received': { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      'Received': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Cancelled': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft']
    return <Badge className={config.color}>{status}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!purchaseOrder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchase-orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Order Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">The purchase order you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchase-orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{purchaseOrder.po_number}</h1>
            <p className="text-muted-foreground">Purchase Order Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {purchaseOrder.status === 'Draft' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('Sent')}
                disabled={actionLoading}
              >
                <Send className="mr-2 h-4 w-4" />
                Send PO
              </Button>
              <Link href={`/dashboard/purchase-orders/${poId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </>
          )}
          {purchaseOrder.status === 'Sent' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('Confirmed')}
                disabled={actionLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark Confirmed
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('Cancelled')}
                disabled={actionLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
          {purchaseOrder.balance_amount > 0 && (
            <Button
              variant="outline"
              onClick={() => handlePayment(purchaseOrder.balance_amount)}
              disabled={actionLoading}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Pay Full Amount
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Purchase Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              {getStatusBadge(purchaseOrder.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date:</span>
              <span>{formatDate(purchaseOrder.order_date)}</span>
            </div>
            {purchaseOrder.expected_delivery_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Delivery:</span>
                <span>{formatDate(purchaseOrder.expected_delivery_date)}</span>
              </div>
            )}
            {purchaseOrder.payment_terms && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Terms:</span>
                <span>{purchaseOrder.payment_terms}</span>
              </div>
            )}
            {purchaseOrder.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Notes:</div>
                <p className="text-sm">{purchaseOrder.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">{purchaseOrder.supplier?.name}</div>
              {purchaseOrder.supplier?.contact_person && (
                <div className="text-sm text-muted-foreground">
                  Contact: {purchaseOrder.supplier.contact_person}
                </div>
              )}
              {purchaseOrder.supplier?.phone && (
                <div className="text-sm text-muted-foreground">
                  Phone: {purchaseOrder.supplier.phone}
                </div>
              )}
            </div>
            {purchaseOrder.delivery_address && (
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Delivery Address:</div>
                <p className="text-sm">{purchaseOrder.delivery_address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Subtotal</div>
              <div className="text-2xl font-bold">{formatCurrency(purchaseOrder.subtotal)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">GST Amount</div>
              <div className="text-2xl font-bold">{formatCurrency(purchaseOrder.gst_amount)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">{formatCurrency(purchaseOrder.total_amount)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Paid Amount</div>
              <div className="text-2xl font-bold">{formatCurrency(purchaseOrder.paid_amount)}</div>
            </div>
          </div>
          {purchaseOrder.balance_amount > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-red-600">Outstanding Amount</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(purchaseOrder.balance_amount)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{items.length} items in this purchase order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium">{item.product_name}</div>
                    {item.sku && (
                      <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} boxes | Area: {item.area.toFixed(2)} sq ft | Unit Price: {formatCurrency(item.unit_price)}
                    </div>
                    {item.received_quantity > 0 && (
                      <div className="text-sm text-green-600">
                        Received: {item.received_quantity}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{formatCurrency(item.total_price)}</div>
                    {item.received_quantity < item.quantity && (
                      <div className="text-sm text-muted-foreground">
                        Pending: {item.quantity - item.received_quantity}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 