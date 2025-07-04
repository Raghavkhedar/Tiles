'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardNavbar from '@/components/dashboard-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Edit, Phone, Mail, MapPin, Building, IndianRupee, Calendar, FileText } from 'lucide-react'
import { getCustomer } from '../../../../actions/customers'
import { Customer } from '@/types/database'
import Link from 'next/link'
import { Label } from '@/components/ui/label'

export default function CustomerViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const customerId = params.id as string

  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    loadCustomer()
  }, [customerId])

  const loadCustomer = async () => {
    setLoading(true)
    try {
      const result = await getCustomer(customerId)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to load customer",
          variant: "destructive",
        })
        router.push('/dashboard/customers')
        return
      }

      setCustomer(result.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer",
        variant: "destructive",
      })
      router.push('/dashboard/customers')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return { variant: "default" as const, className: "bg-green-100 text-green-800" };
    } else if (status === 'Overdue') {
      return { variant: "destructive" as const, className: "bg-red-100 text-red-800" };
    } else {
      return { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" };
    }
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading customer...</span>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!customer) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-8">
              <p className="text-gray-600">Customer not found</p>
              <Link href="/dashboard/customers">
                <Button className="mt-4">Back to Customers</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  const statusBadge = getStatusBadge(customer.status || 'Active')

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-gray-600">Customer Details</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/dashboard/customers/edit/${customer.id}`}>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information */}
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
                      <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                      <p className="text-lg font-semibold">{customer.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Contact Person</Label>
                      <p className="text-lg">{customer.contact_person || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">GST Number</Label>
                      <p className="text-lg font-mono">{customer.gst_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge variant={statusBadge.variant} className={statusBadge.className}>
                        {customer.status || 'Active'}
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
                      <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <p className="text-lg">{customer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-lg">{customer.email || 'N/A'}</p>
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
                    <Label className="text-sm font-medium text-gray-500">Complete Address</Label>
                    <p className="text-lg">{customer.address || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">City</Label>
                      <p className="text-lg">{customer.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">State</Label>
                      <p className="text-lg">{customer.state || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">PIN Code</Label>
                      <p className="text-lg">{customer.pincode || 'N/A'}</p>
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
                    <IndianRupee className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Credit Limit</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(customer.credit_limit || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Terms</Label>
                    <p className="text-lg">{customer.payment_terms || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created On</Label>
                    <p className="text-lg">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Delivery
                  </Button>
                  <Button className="w-full" variant="outline">
                    <IndianRupee className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Purchase History - Placeholder for future implementation */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                Recent invoices and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Purchase history will be available when billing system is implemented</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
} 