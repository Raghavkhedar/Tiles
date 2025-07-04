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
import DashboardNavbar from '@/components/dashboard-navbar'
import Breadcrumb from "@/components/breadcrumb";

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

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Purchase Orders" }]} />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Purchase Orders
              </h1>
              <p className="text-gray-600">
                Manage your purchase orders and supplier relationships
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/dashboard/purchase-orders/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by PO number or supplier..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
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
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); loadPurchaseOrders(); }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-2">Loading purchase orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No purchase orders found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating your first purchase order'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link href="/dashboard/purchase-orders/create">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Purchase Order
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((po) => (
                <Card key={po.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{po.po_number}</h3>
                          {getStatusBadge(po.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          Supplier: {po.supplier?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Order Date: {formatDate(po.order_date)}
                          {po.expected_delivery_date && ` • Expected: ${formatDate(po.expected_delivery_date)}`}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold">
                          {formatCurrency(po.total_amount)}
                        </div>
                        <p className="text-sm text-gray-500">
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
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
} 