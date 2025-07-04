import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Users,
  Save,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../../supabase/server";
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

export default async function AddCustomerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the customer's basic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">
                        Company/Business Name *
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="Sharma Construction"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Rajesh Sharma"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerType">Customer Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retailer">Retailer</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="builder">Builder</SelectItem>
                          <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        placeholder="27AABCS1234C1Z5"
                        maxLength={15}
                      />
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
                      <Label htmlFor="phone">Primary Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="altPhone">Alternate Phone</Label>
                      <Input
                        id="altPhone"
                        type="tel"
                        placeholder="+91 87654 32109"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="rajesh@sharmaconstruction.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="www.sharmaconstruction.com"
                      />
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
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="123 MG Road, Commercial Complex"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" placeholder="Mumbai" required />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maharashtra">
                            Maharashtra
                          </SelectItem>
                          <SelectItem value="gujarat">Gujarat</SelectItem>
                          <SelectItem value="rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <Input
                        id="pincode"
                        placeholder="400001"
                        maxLength={6}
                        required
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
                    <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="15days">15 Days</SelectItem>
                        <SelectItem value="30days">30 Days</SelectItem>
                        <SelectItem value="45days">45 Days</SelectItem>
                        <SelectItem value="60days">60 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount">Default Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      placeholder="5"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceCategory">Price Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail Price</SelectItem>
                        <SelectItem value="wholesale">
                          Wholesale Price
                        </SelectItem>
                        <SelectItem value="contractor">
                          Contractor Price
                        </SelectItem>
                        <SelectItem value="special">Special Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about the customer..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referredBy">Referred By</Label>
                    <Input id="referredBy" placeholder="Reference source" />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Customer
                </Button>
                <Button variant="outline" className="w-full">
                  Save & Add Another
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
