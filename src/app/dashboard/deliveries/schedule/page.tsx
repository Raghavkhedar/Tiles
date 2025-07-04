import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Truck,
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function ScheduleDeliveryPage() {
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
            <Link href="/dashboard/deliveries">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deliveries
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Schedule New Delivery
              </h1>
              <p className="text-gray-600">
                Create a delivery schedule for tile orders
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Delivery Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Select Order/Invoice
                  </CardTitle>
                  <CardDescription>
                    Choose the invoice for which delivery needs to be scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invoice">Invoice Number *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inv-001">
                            INV-2024-001 - Sharma Construction
                          </SelectItem>
                          <SelectItem value="inv-002">
                            INV-2024-002 - Modern Interiors
                          </SelectItem>
                          <SelectItem value="inv-003">
                            INV-2024-003 - Elite Builders
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customer">Customer</Label>
                      <Input
                        id="customer"
                        value="Sharma Construction"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Invoice Items</Label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Weight</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Ceramic Floor Tiles - White</TableCell>
                            <TableCell>10 boxes</TableCell>
                            <TableCell>250 kg</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Delivery Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryDate">Delivery Date *</Label>
                      <Input id="deliveryDate" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="deliveryTime">Preferred Time *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            Morning (9:00 AM - 12:00 PM)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            Afternoon (12:00 PM - 4:00 PM)
                          </SelectItem>
                          <SelectItem value="evening">
                            Evening (4:00 PM - 7:00 PM)
                          </SelectItem>
                          <SelectItem value="custom">Custom Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Delivery Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="deliveryType">Delivery Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">
                            Standard Delivery
                          </SelectItem>
                          <SelectItem value="installation">
                            Delivery + Installation
                          </SelectItem>
                          <SelectItem value="pickup">
                            Customer Pickup
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryAddress">Complete Address *</Label>
                    <Textarea
                      id="deliveryAddress"
                      placeholder="123 MG Road, Mumbai, Maharashtra 400001"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Rajesh Sharma"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="landmarks">Landmarks/Directions</Label>
                    <Textarea
                      id="landmarks"
                      placeholder="Near City Mall, opposite to ABC Bank"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle & Driver */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Vehicle & Driver Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="driver">Assign Driver</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ramesh">Ramesh Kumar</SelectItem>
                          <SelectItem value="suresh">Suresh Patel</SelectItem>
                          <SelectItem value="vikram">Vikram Singh</SelectItem>
                          <SelectItem value="ravi">Ravi Sharma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vehicle">Vehicle Number</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mh01ab1234">
                            MH-01-AB-1234
                          </SelectItem>
                          <SelectItem value="dl02cd5678">
                            DL-02-CD-5678
                          </SelectItem>
                          <SelectItem value="ka03ef9012">
                            KA-03-EF-9012
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup Truck</SelectItem>
                          <SelectItem value="mini">Mini Truck</SelectItem>
                          <SelectItem value="large">Large Truck</SelectItem>
                          <SelectItem value="tempo">Tempo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="capacity">Vehicle Capacity</Label>
                      <Input
                        id="capacity"
                        placeholder="1000 kg"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Invoice Amount:</span>
                      <span className="font-medium">₹14,160</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Weight:</span>
                      <span className="font-medium">250 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Boxes:</span>
                      <span className="font-medium">10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Charges:</span>
                      <span className="font-medium">₹500</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>₹14,660</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Handle with care, call before delivery, etc."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMode">Payment Collection</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Already Paid</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="cheque">
                          Cheque on Delivery
                        </SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="status">Initial Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Set status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="ready">
                          Ready for Dispatch
                        </SelectItem>
                        <SelectItem value="confirmed">
                          Confirmed with Customer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Schedule Delivery
                </Button>
                <Button variant="outline" className="w-full">
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
