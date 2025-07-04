'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardNavbar from '@/components/dashboard-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Save, X } from 'lucide-react'
import { getSupplier, updateSupplier } from '../../../../actions/suppliers'
import { Supplier } from '@/types/database'
import Link from 'next/link'

export default function EditSupplierPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supplierId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
    pan_number: '',
    credit_limit: '',
    payment_terms: '',
    rating: '',
    status: 'Active'
  })

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

      const supplierData = result.data
      setSupplier(supplierData)

      // Set form data
      setFormData({
        name: supplierData.name || '',
        contact_person: supplierData.contact_person || '',
        phone: supplierData.phone || '',
        email: supplierData.email || '',
        address: supplierData.address || '',
        city: supplierData.city || '',
        state: supplierData.state || '',
        pincode: supplierData.pincode || '',
        gst_number: supplierData.gst_number || '',
        pan_number: supplierData.pan_number || '',
        credit_limit: supplierData.credit_limit?.toString() || '',
        payment_terms: supplierData.payment_terms || '',
        rating: supplierData.rating?.toString() || '',
        status: supplierData.status || 'Active'
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load supplier data",
        variant: "destructive",
      })
      router.push('/dashboard/suppliers')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.contact_person || !formData.phone) {
        toast({
          title: "Validation Error",
          description: "Company name, contact person, and phone are required fields",
          variant: "destructive",
        })
        return
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        contact_person: formData.contact_person,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        gst_number: formData.gst_number || null,
        pan_number: formData.pan_number || null,
        credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : 0,
        payment_terms: formData.payment_terms || '30 days',
        rating: formData.rating ? parseFloat(formData.rating) : 4.0,
        status: formData.status
      }

      const result = await updateSupplier(supplierId, updateData)
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Supplier updated successfully",
        })
        router.push('/dashboard/suppliers')
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update supplier",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update supplier",
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
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-8">
              <p className="text-gray-600">Supplier not found</p>
              <Link href="/dashboard/suppliers">
                <Button className="mt-4">Back to Suppliers</Button>
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
              <Link href="/dashboard/suppliers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Supplier</h1>
                <p className="text-gray-600">Update supplier information</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/suppliers">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Supplier Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Enter the supplier's basic details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">
                          Company Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="ABC Ceramics Ltd"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_person">Contact Person *</Label>
                        <Input
                          id="contact_person"
                          value={formData.contact_person}
                          onChange={(e) => handleInputChange('contact_person', e.target.value)}
                          placeholder="Ramesh Gupta"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gst_number">GST Number</Label>
                        <Input
                          id="gst_number"
                          value={formData.gst_number}
                          onChange={(e) => handleInputChange('gst_number', e.target.value)}
                          placeholder="24AABCA1234B1Z5"
                          maxLength={15}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pan_number">PAN Number</Label>
                        <Input
                          id="pan_number"
                          value={formData.pan_number}
                          onChange={(e) => handleInputChange('pan_number', e.target.value)}
                          placeholder="AABCA1234B"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rating">Rating</Label>
                        <Select
                          value={formData.rating}
                          onValueChange={(value) => handleInputChange('rating', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5.0">5.0 - Excellent</SelectItem>
                            <SelectItem value="4.5">4.5 - Very Good</SelectItem>
                            <SelectItem value="4.0">4.0 - Good</SelectItem>
                            <SelectItem value="3.5">3.5 - Average</SelectItem>
                            <SelectItem value="3.0">3.0 - Below Average</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleInputChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Primary Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="ramesh@abcceramics.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Complete Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Industrial Area, Phase 1, Morbi, Gujarat 363641"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Morbi" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => handleInputChange('state', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Gujarat">Gujarat</SelectItem>
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="Telangana">Telangana</SelectItem>
                            <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                            <SelectItem value="Kerala">Kerala</SelectItem>
                            <SelectItem value="West Bengal">West Bengal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          placeholder="363641"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Settings */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Settings</CardTitle>
                    <CardDescription>
                      Configure payment and credit terms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
                      <Input
                        id="credit_limit"
                        type="number"
                        value={formData.credit_limit}
                        onChange={(e) => handleInputChange('credit_limit', e.target.value)}
                        placeholder="100000"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment_terms">Payment Terms</Label>
                      <Select
                        value={formData.payment_terms}
                        onValueChange={(value) => handleInputChange('payment_terms', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Immediate">Immediate</SelectItem>
                          <SelectItem value="15 days">15 Days</SelectItem>
                          <SelectItem value="30 days">30 Days</SelectItem>
                          <SelectItem value="45 days">45 Days</SelectItem>
                          <SelectItem value="60 days">60 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  )
} 