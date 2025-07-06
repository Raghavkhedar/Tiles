'use client'

import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Truck,
  Save,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building,
  Package,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupplier } from "../../../actions/suppliers";
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
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";

export default function AddSupplierPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
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
    payment_terms: '30 days',
    rating: '4.0',
    status: 'Active'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.contact_person || !formData.phone) {
        toast({
          title: "Validation Error",
          description: "Company name, contact person, and phone are required fields",
          variant: "destructive",
        });
        return;
      }

      // Prepare supplier data
      const supplierData = {
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
        payment_terms: formData.payment_terms,
        rating: parseFloat(formData.rating),
        status: formData.status
      };

      const result = await createSupplier(supplierData);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Supplier created successfully",
        });
        router.push('/dashboard/suppliers');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Supplier Management", href: "/dashboard/suppliers" },
            { label: "Add Supplier" }
          ]} />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/suppliers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Suppliers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Add New Supplier
              </h1>
              <p className="text-muted-foreground">
                Create a new supplier profile for your business
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Supplier Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Company Information
                    </CardTitle>
                    <CardDescription>
                      Enter the supplier's basic company details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="ABC Ceramics Ltd"
                          required
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_person" className="text-sm font-medium">
                          Contact Person <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="contact_person"
                          value={formData.contact_person}
                          onChange={(e) => handleInputChange('contact_person', e.target.value)}
                          placeholder="Ramesh Gupta"
                          required
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gst_number" className="text-sm font-medium">GST Number</Label>
                        <Input
                          id="gst_number"
                          value={formData.gst_number}
                          onChange={(e) => handleInputChange('gst_number', e.target.value)}
                          placeholder="24AABCA1234B1Z5"
                          maxLength={15}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pan_number" className="text-sm font-medium">PAN Number</Label>
                        <Input
                          id="pan_number"
                          value={formData.pan_number}
                          onChange={(e) => handleInputChange('pan_number', e.target.value)}
                          placeholder="AABCA1234B"
                          maxLength={10}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rating" className="text-sm font-medium">Rating</Label>
                        <Select
                          value={formData.rating}
                          onValueChange={(value) => handleInputChange('rating', value)}
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-orange-500">
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
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleInputChange('status', value)}
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-orange-500">
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
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Primary contact details for the supplier
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Primary Phone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="ramesh@abcceramics.com"
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      Address Information
                    </CardTitle>
                    <CardDescription>
                      Complete address details for delivery and billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">Complete Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Industrial Area, Phase 1, Morbi, Gujarat 363641"
                        rows={3}
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">City</Label>
                        <Input 
                          id="city" 
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Morbi" 
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">State</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => handleInputChange('state', value)}
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-orange-500">
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
                      <div className="space-y-2">
                        <Label htmlFor="pincode" className="text-sm font-medium">PIN Code</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          placeholder="363641"
                          maxLength={6}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Settings */}
              <div className="space-y-6">
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-muted">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      Business Settings
                    </CardTitle>
                    <CardDescription>
                      Configure payment and credit terms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="credit_limit" className="text-sm font-medium">Credit Limit (₹)</Label>
                      <Input
                        id="credit_limit"
                        type="number"
                        value={formData.credit_limit}
                        onChange={(e) => handleInputChange('credit_limit', e.target.value)}
                        placeholder="100000"
                        min="0"
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_terms" className="text-sm font-medium">Payment Terms</Label>
                      <Select
                        value={formData.payment_terms}
                        onValueChange={(value) => handleInputChange('payment_terms', value)}
                      >
                        <SelectTrigger className="focus:ring-2 focus:ring-orange-500">
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

                {/* Save Button */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Supplier...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Supplier
                          </>
                        )}
                      </Button>
                      <Link href="/dashboard/suppliers">
                        <Button variant="outline" className="w-full hover:bg-muted">
                          Cancel
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
