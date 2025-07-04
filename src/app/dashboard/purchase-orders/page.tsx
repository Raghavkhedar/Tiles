'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { getPurchaseOrders, deletePurchaseOrder, searchPurchaseOrders, getPurchaseOrdersByStatus, getPurchaseOrderStats } from '@/app/actions/purchase-orders'
import { PurchaseOrderWithRelations } from '@/types/database'
import Link from 'next/link'

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithRelations[]>([])
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPurchaseOrders()
    loadStats()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [purchaseOrders, searchQuery, statusFilter])

  const loadPurchaseOrders = async () => {
    setLoading(true)
    const result = await getPurchaseOrders()
    if (result.success) {
      setPurchaseOrders(result.data || [])
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load purchase orders',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const loadStats = async () => {
    const result = await getPurchaseOrderStats()
    if (result.success) {
      setStats(result.data)
    }
  }

  const filterOrders = () => {
    let filtered = [...purchaseOrders]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(po => 
        po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(po => po.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadPurchaseOrders()
      return
    }

    setLoading(true)
    const result = await searchPurchaseOrders(searchQuery)
    if (result.success) {
      setPurchaseOrders(result.data || [])
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to search purchase orders',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status)
    if (status === 'all') {
      await loadPurchaseOrders()
      return
    }

    setLoading(true)
    const result = await getPurchaseOrdersByStatus(status)
    if (result.success) {
      setPurchaseOrders(result.data || [])
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to filter purchase orders',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const result = await deletePurchaseOrder(id)
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Purchase order deleted successfully'
      })
      await loadPurchaseOrders()
      await loadStats()
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete purchase order',
        variant: 'destructive'
      })
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage your purchase orders and supplier relationships</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">...</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your purchase orders and supplier relationships</p>
        </div>
        <Link href="/dashboard/purchase-orders/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPOs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft POs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftPOs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Partially Received">Partially Received</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No purchase orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first purchase order'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/dashboard/purchase-orders/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Purchase Order
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((po) => (
            <Card key={po.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{po.po_number}</h3>
                      {getStatusBadge(po.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Supplier: {po.supplier?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Order Date: {formatDate(po.order_date)}
                      {po.expected_delivery_date && ` • Expected: ${formatDate(po.expected_delivery_date)}`}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-semibold">
                      {formatCurrency(po.total_amount)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Paid: {formatCurrency(po.paid_amount)}
                    </p>
                    {po.balance_amount > 0 && (
                      <p className="text-sm text-red-600 font-medium">
                        Outstanding: {formatCurrency(po.balance_amount)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Link href={`/dashboard/purchase-orders/${po.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/purchase-orders/${po.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this purchase order? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(po.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 