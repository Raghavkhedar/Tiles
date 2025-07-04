'use client'

import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Users,
  Save,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomer } from "../../../actions/customers";
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

export default function AddCustomerPage() {
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
    credit_limit: '',
    payment_terms: '',
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

      // Prepare customer data
      const customerData = {
        name: formData.name,
        contact_person: formData.contact_person,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        gst_number: formData.gst_number || null,
        credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : 0,
        payment_terms: formData.payment_terms || '30 days',
        status: formData.status
      };

      const result = await createCustomer(customerData);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Customer created successfully",
        });
        router.push('/dashboard/customers');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create customer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Customer Management", href: "/dashboard/customers" },
            { label: "Add Customer" }
          ]} />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/customers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Customer
              </h1>
              <p className="text-gray-600">
                Create a new customer profile for your business
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Customer Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Enter the customer's basic details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Company/Business Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Sharma Construction"
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
                          placeholder="Rajesh Sharma"
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
                          placeholder="27AABCS1234C1Z5"
                          maxLength={15}
                          className="focus:ring-2 focus:ring-orange-500"
                        />
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
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Primary contact details for the customer
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
                          placeholder="rajesh@sharmaconstruction.com"
                          className="focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="border-b bg-gray-50">
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
                        placeholder="123 MG Road, Commercial Complex"
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
                          placeholder="Mumbai" 
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
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Gujarat">Gujarat</SelectItem>
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
                          placeholder="400001"
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
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-orange-600" />
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
                        placeholder="50000"
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

                <div className="space-y-3">
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Customer
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/customers">
                    <Button variant="outline" className="w-full hover:bg-gray-50">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
