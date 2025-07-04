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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default async function AddSupplierPage() {
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
            <Link href="/dashboard/suppliers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Suppliers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Supplier
              </h1>
              <p className="text-gray-600">
                Create a new supplier profile for your business
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Supplier Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Enter the supplier's basic company details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="ABC Ceramics Ltd"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Ramesh Gupta"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierType">Supplier Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manufacturer">
                            Manufacturer
                          </SelectItem>
                          <SelectItem value="distributor">
                            Distributor
                          </SelectItem>
                          <SelectItem value="wholesaler">Wholesaler</SelectItem>
                          <SelectItem value="importer">Importer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number *</Label>
                      <Input
                        id="gstNumber"
                        placeholder="24AABCA1234B1Z5"
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        placeholder="AABCA1234B"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label htmlFor="establishedYear">Established Year</Label>
                      <Input
                        id="establishedYear"
                        type="number"
                        placeholder="2010"
                        min="1900"
                        max={new Date().getFullYear()}
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
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ramesh@abcceramics.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="www.abcceramics.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fax">Fax Number</Label>
                      <Input id="fax" placeholder="+91 2822 123456" />
                    </div>
                    <div>
                      <Label htmlFor="designation">
                        Contact Person Designation
                      </Label>
                      <Input id="designation" placeholder="Sales Manager" />
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
                      placeholder="Industrial Area, Phase 1, Morbi"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" placeholder="Morbi" required />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gujarat">Gujarat</SelectItem>
                          <SelectItem value="maharashtra">
                            Maharashtra
                          </SelectItem>
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
                        placeholder="363641"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="china">China</SelectItem>
                          <SelectItem value="italy">Italy</SelectItem>
                          <SelectItem value="spain">Spain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="region">Region/Zone</Label>
                      <Input id="region" placeholder="Western India" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Categories
                  </CardTitle>
                  <CardDescription>
                    Select the types of products this supplier provides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      "Ceramic Floor Tiles",
                      "Wall Tiles",
                      "Vitrified Tiles",
                      "Granite Tiles",
                      "Marble Tiles",
                      "Bathroom Tiles",
                      "Kitchen Tiles",
                      "Designer Tiles",
                      "Natural Stone",
                    ].map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category.toLowerCase().replace(/\s+/g, "-")}
                        />
                        <Label
                          htmlFor={category.toLowerCase().replace(/\s+/g, "-")}
                          className="text-sm font-normal"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Terms</CardTitle>
                  <CardDescription>
                    Configure payment and business terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      placeholder="100000"
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
                        <SelectItem value="advance">100% Advance</SelectItem>
                        <SelectItem value="15days">15 Days</SelectItem>
                        <SelectItem value="30days">30 Days</SelectItem>
                        <SelectItem value="45days">45 Days</SelectItem>
                        <SelectItem value="60days">60 Days</SelectItem>
                        <SelectItem value="90days">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">INR (₹)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="minOrderValue">
                      Minimum Order Value (₹)
                    </Label>
                    <Input
                      id="minOrderValue"
                      type="number"
                      placeholder="10000"
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supplier Rating</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Overall Rating</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                        <SelectItem value="2">⭐⭐ Below Average</SelectItem>
                        <SelectItem value="1">⭐ Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leadTime">Average Lead Time (Days)</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      placeholder="7"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryReliability">
                      Delivery Reliability
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reliability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
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
                      placeholder="Any additional notes about the supplier..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referredBy">Referred By</Label>
                    <Input id="referredBy" placeholder="Reference source" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="preferredSupplier" />
                    <Label htmlFor="preferredSupplier" className="text-sm">
                      Mark as Preferred Supplier
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Supplier
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
