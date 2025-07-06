"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getDelivery, updateDelivery } from "@/app/actions/deliveries";
import { DeliveryWithRelations } from "@/types/database";
import { ArrowLeft, Save, Loader2, Truck, MapPin, Phone, Calendar, Package } from "lucide-react";

export default function EditDeliveryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [delivery, setDelivery] = useState<DeliveryWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    delivery_date: "",
    delivery_address: "",
    contact_person: "",
    phone: "",
    status: "",
    notes: ""
  });

  useEffect(() => {
    loadDelivery();
  }, [params.id]);

  const loadDelivery = async () => {
    try {
      setLoading(true);
      const result = await getDelivery(params.id);
      if (result.success) {
        const deliveryData = result.data;
        setDelivery(deliveryData);
        setFormData({
          delivery_date: deliveryData.delivery_date,
          delivery_address: deliveryData.delivery_address || "",
          contact_person: deliveryData.contact_person || "",
          phone: deliveryData.phone || "",
          status: deliveryData.status,
          notes: deliveryData.notes || ""
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load delivery",
          variant: "destructive"
        });
        router.push("/dashboard/deliveries");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load delivery",
        variant: "destructive"
      });
      router.push("/dashboard/deliveries");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const result = await updateDelivery(params.id, formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Delivery updated successfully"
        });
        router.push(`/dashboard/deliveries/view/${params.id}`);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update delivery",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 pb-20">
        <Breadcrumb items={[
          { label: "Deliveries", href: "/dashboard/deliveries" },
          { label: "Edit Delivery" }
        ]} />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="space-y-6 p-6 pb-20">
        <Breadcrumb items={[
          { label: "Deliveries", href: "/dashboard/deliveries" },
          { label: "Edit Delivery" }
        ]} />
        <div className="text-center py-8">
          <p className="text-gray-500">Delivery not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Deliveries", href: "/dashboard/deliveries" },
        { label: delivery.delivery_number, href: `/dashboard/deliveries/view/${delivery.id}` },
        { label: "Edit" }
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Delivery</h1>
          <p className="text-muted-foreground">Update delivery information and status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/deliveries/view/${delivery.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Delivery
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delivery_number">Delivery Number</Label>
                    <Input
                      id="delivery_number"
                      value={delivery.delivery_number}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Delayed">Delayed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="delivery_date">Delivery Date</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      value={formData.delivery_date}
                      onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Customer Name</Label>
                    <Input
                      id="customer_name"
                      value={delivery.customer?.name || 'N/A'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_address">Delivery Address</Label>
                    <Textarea
                      id="delivery_address"
                      value={formData.delivery_address}
                      onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                      placeholder="Complete delivery address"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Delivery Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any additional notes about this delivery"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Items Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Delivery Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {delivery.items && delivery.items.length > 0 ? (
                  <div className="space-y-3">
                    {delivery.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-sm">{item.product?.name || 'Unknown Product'}</h4>
                            <p className="text-xs text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">Qty: {item.quantity}</p>
                            {item.area_covered && (
                              <p className="text-xs text-gray-500">{item.area_covered} sq ft</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No items in this delivery</p>
                )}
              </CardContent>
            </Card>

            {/* Save Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/deliveries/view/${delivery.id}`)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 