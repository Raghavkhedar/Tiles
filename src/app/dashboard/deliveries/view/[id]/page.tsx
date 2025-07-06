"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getDelivery } from "@/app/actions/deliveries";
import { DeliveryWithRelations } from "@/types/database";
import { ArrowLeft, Edit, Truck, MapPin, Phone, Calendar, Package, User, Car } from "lucide-react";

export default function ViewDeliveryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [delivery, setDelivery] = useState<DeliveryWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDelivery();
  }, [params.id]);

  const loadDelivery = async () => {
    try {
      setLoading(true);
      const result = await getDelivery(params.id);
      if (result.success) {
        setDelivery(result.data);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 pb-20">
        <Breadcrumb items={[
          { label: "Deliveries", href: "/dashboard/deliveries" },
          { label: "View Delivery" }
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
          { label: "View Delivery" }
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
        { label: delivery.delivery_number }
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Details</h1>
          <p className="text-muted-foreground">View delivery information and status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/deliveries")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deliveries
          </Button>
          <Button onClick={() => router.push(`/dashboard/deliveries/edit/${delivery.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Delivery
          </Button>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
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
                  <label className="text-sm font-medium text-gray-500">Delivery Number</label>
                  <p className="text-lg font-semibold">{delivery.delivery_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(delivery.status)}>
                      {delivery.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                  <p className="text-lg">{new Date(delivery.delivery_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-lg">{new Date(delivery.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {delivery.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-lg mt-1">{delivery.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-lg font-semibold">{delivery.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="text-lg">{delivery.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {delivery.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                  <p className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {delivery.delivery_address || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Delivery Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {delivery.items && delivery.items.length > 0 ? (
                <div className="space-y-4">
                  {delivery.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.product?.name || 'Unknown Product'}</h4>
                          <p className="text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Quantity: {item.quantity}</p>
                          {item.area_covered && (
                            <p className="text-sm text-gray-500">Area: {item.area_covered} sq ft</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items in this delivery</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge className={getStatusColor(delivery.status)}>
                    {delivery.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Scheduled: {new Date(delivery.delivery_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Last Updated: {new Date(delivery.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/deliveries/edit/${delivery.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Delivery
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/customers/view/${delivery.customer_id}`)}
              >
                <User className="mr-2 h-4 w-4" />
                View Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 