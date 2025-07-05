"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Truck,
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Package,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { getInvoices } from "@/app/actions/billing";
import { scheduleDelivery } from "@/app/actions/deliveries";
import { InvoiceWithRelations } from "@/types/database";

export default function ScheduleDeliveryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null);
  
  const [deliveryData, setDeliveryData] = useState({
    invoice_id: '',
    delivery_date: '',
    delivery_time: 'morning',
    driver_name: '',
    vehicle_number: '',
    notes: '',
  });

  // Load invoices on component mount
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await getInvoices();
      if (result.success) {
        // Filter only invoices that are not cancelled and have items
        const availableInvoices = (result.data || []).filter(
          invoice => invoice.status !== 'Cancelled' && invoice.items && invoice.items.length > 0
        );
        setInvoices(availableInvoices);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load invoices",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    setSelectedInvoice(invoice || null);
    setDeliveryData(prev => ({ ...prev, invoice_id: invoiceId }));
  };

  const handleInputChange = (field: string, value: string) => {
    setDeliveryData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!deliveryData.invoice_id) {
      toast({ title: "Error", description: "Please select an invoice", variant: "destructive" });
      return false;
    }
    if (!deliveryData.delivery_date) {
      toast({ title: "Error", description: "Please select a delivery date", variant: "destructive" });
      return false;
    }
    if (!deliveryData.driver_name) {
      toast({ title: "Error", description: "Please enter driver name", variant: "destructive" });
      return false;
    }
    if (!deliveryData.vehicle_number) {
      toast({ title: "Error", description: "Please enter vehicle number", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Prepare delivery items from invoice items
      const deliveryItems = selectedInvoice?.items?.map(item => ({
        product_id: item.product_id || '',
        quantity: item.quantity,
        area_covered: null, // Will be calculated if needed
        delivery_id: '', // Will be set by the server action
      })) || [];

      const deliveryPayload = {
        delivery_number: `DEL-${Date.now()}`, // Generate a temporary number
        customer_id: selectedInvoice?.customer_id || '',
        delivery_date: deliveryData.delivery_date,
        delivery_address: selectedInvoice?.customer?.address || '',
        contact_person: selectedInvoice?.customer?.contact_person || '',
        phone: selectedInvoice?.customer?.phone || '',
        status: 'Scheduled',
        notes: deliveryData.notes,
        user_id: '', // Will be set by the server action
      };

      const result = await scheduleDelivery(deliveryPayload, deliveryItems);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Delivery scheduled successfully",
        });
        router.push('/dashboard/deliveries');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to schedule delivery",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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

          <form onSubmit={handleSubmit}>
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
                        <Select 
                          value={deliveryData.invoice_id}
                          onValueChange={handleInvoiceSelect}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loading ? "Loading..." : "Select invoice"} />
                          </SelectTrigger>
                          <SelectContent>
                            {invoices.map((invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.invoice_number} - {invoice.customer?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="customer">Customer</Label>
                        <Input
                          id="customer"
                          value={selectedInvoice?.customer?.name || ''}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Invoice Items</Label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        {selectedInvoice?.items && selectedInvoice.items.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedInvoice.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.product_name}</TableCell>
                                  <TableCell>{item.quantity} boxes</TableCell>
                                  <TableCell>₹{item.unit_price}</TableCell>
                                  <TableCell>₹{item.total_price}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            Select an invoice to view items
                          </p>
                        )}
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
                        <Input 
                          id="deliveryDate" 
                          type="date" 
                          required
                          value={deliveryData.delivery_date}
                          onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryTime">Preferred Time *</Label>
                        <Select 
                          value={deliveryData.delivery_time}
                          onValueChange={(value) => handleInputChange('delivery_time', value)}
                        >
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
                        <Label htmlFor="driverName">Driver Name *</Label>
                        <Input
                          id="driverName"
                          placeholder="Enter driver name"
                          value={deliveryData.driver_name}
                          onChange={(e) => handleInputChange('driver_name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                        <Input
                          id="vehicleNumber"
                          placeholder="Enter vehicle number"
                          value={deliveryData.vehicle_number}
                          onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Delivery Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Special instructions, landmarks, etc."
                        rows={3}
                        value={deliveryData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                      />
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
                        <span className="font-medium">
                          ₹{selectedInvoice?.total_amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Items:</span>
                        <span className="font-medium">
                          {selectedInvoice?.items?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Boxes:</span>
                        <span className="font-medium">
                          {selectedInvoice?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Customer:</span>
                        <span className="font-medium">
                          {selectedInvoice?.customer?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Contact:</span>
                        <span className="font-medium">
                          {selectedInvoice?.customer?.phone || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling Delivery...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Schedule Delivery
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/deliveries')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
