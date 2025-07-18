'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardNavbar from '@/components/dashboard-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Edit, Phone, Mail, MapPin, Building, IndianRupee, Calendar, FileText, Star, Package, Truck } from 'lucide-react'
import { getSupplier } from '../../../../actions/suppliers'
import { Supplier } from '@/types/database'
import Link from 'next/link'
import { Label } from '@/components/ui/label'

export default function SupplierViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supplierId = params.id as string

  const [loading, setLoading] = useState(true)
  const [supplier, setSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    loadSupplier()
  }, [supplierId])

  const loadSupplier = async () => {
    setLoading(true)
    try {
      const result = await getSupplier(supplierId)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to load supplier",
          variant: "destructive",
        })
        router.push('/dashboard/suppliers')
        return
      }

      setSupplier(result.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load supplier",
        variant: "destructive",
      })
      router.push('/dashboard/suppliers')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return { variant: "default" as const, className: "bg-green-100 text-green-800" };
    } else if (status === 'Inactive') {
      return { variant: "secondary" as const, className: "bg-muted text-muted-foreground" };
    } else {
      return { variant: "destructive" as const, className: "bg-red-100 text-red-800" };
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return 'N/A';
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="text-lg font-semibold">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-background min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading supplier...</span>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!supplier) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-background min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Supplier not found</p>
              <Link href="/dashboard/suppliers">
                <Button className="mt-4">Back to Suppliers</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  const statusBadge = getStatusBadge(supplier.status || 'Active')

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/suppliers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{supplier.name}</h1>
                <p className="text-muted-foreground">Supplier Details</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/dashboard/suppliers/edit/${supplier.id}`}>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Supplier
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Supplier Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                      <p className="text-lg font-semibold">{supplier.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                      <p className="text-lg">{supplier.contact_person || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">GST Number</Label>
                      <p className="text-lg font-mono">{supplier.gst_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">PAN Number</Label>
                      <p className="text-lg font-mono">{supplier.pan_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                      {renderRating(supplier.rating)}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant={statusBadge.variant} className={statusBadge.className}>
                        {supplier.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <p className="text-lg">{supplier.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-lg">{supplier.email || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Complete Address</Label>
                    <p className="text-lg">{supplier.address || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">City</Label>
                      <p className="text-lg">{supplier.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">State</Label>
                      <p className="text-lg">{supplier.state || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">PIN Code</Label>
                      <p className="text-lg">{supplier.pincode || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Credit Limit</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(supplier.credit_limit || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Payment Terms</Label>
                    <p className="text-lg">{supplier.payment_terms || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created On</Label>
                    <p className="text-lg">
                      {new Date(supplier.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/dashboard/purchase-orders/create?supplier=${supplier.id}`}>
                    <Button className="w-full" variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      Create Purchase Order
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline" disabled>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Delivery
                  </Button>
                  <Button className="w-full" variant="outline" disabled>
                    <IndianRupee className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Metrics - Placeholder for future implementation */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Supplier performance and purchase history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4" />
                <p>Performance metrics will be available when purchase order system is implemented</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
} 