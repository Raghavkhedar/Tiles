"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";
import { getDeliveries, deleteDelivery, updateDeliveryStatus } from "@/app/actions/deliveries";
import { DeliveryWithRelations } from "@/types/database";

export default function DeliveriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<DeliveryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const result = await getDeliveries();
      if (result.success) {
        setDeliveries(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load deliveries",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load deliveries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    try {
      const result = await deleteDelivery(id);
      if (result.success) {
        toast({ title: "Success", description: "Delivery deleted successfully" });
        loadDeliveries();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete delivery",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete delivery",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      setUpdatingStatus(deliveryId);
      const result = await updateDeliveryStatus(deliveryId, newStatus);
      if (result.success) {
        toast({ 
          title: "Success", 
          description: `Delivery status updated to ${newStatus}` 
        });
        loadDeliveries(); // Reload to get updated data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update delivery status",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDeliveries = deliveries.length;
  const completedDeliveries = deliveries.filter(
    (d) => d.status === "Delivered",
  ).length;
  const pendingDeliveries = deliveries.filter(
    (d) => d.status !== "Delivered",
  ).length;
  const inTransitDeliveries = deliveries.filter(
    (d) => d.status === "In Transit",
  ).length;

    if (loading) {
    return (
      <div className="space-y-6 p-6 pb-20">
        <Breadcrumb items={[{ label: "Delivery Management" }]} />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Delivery Management" }]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">Track and manage tile deliveries for your projects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Link href="/dashboard/deliveries/schedule">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 w-4 mr-2" />
              Schedule Delivery
            </Button>
          </Link>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedDeliveries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTransitDeliveries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingDeliveries}</div>
          </CardContent>
        </Card>
      </div>
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search deliveries by customer, delivery ID, or invoice..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Status
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Tracking</CardTitle>
          <CardDescription>
            Monitor all your tile deliveries and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{delivery.delivery_number}</div>
                      <div className="text-sm text-gray-500">ID: {delivery.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{delivery.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{delivery.contact_person || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{delivery.phone || 'N/A'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {delivery.delivery_address?.split(",")[0] || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {delivery.items?.map((item: any, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{item.product?.name || 'N/A'}</div>
                          <div className="text-gray-500">Qty: {item.quantity} | Area: {item.area_covered || 0} sq ft</div>
                        </div>
                      )) || <div className="text-sm text-gray-500">No items</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{new Date(delivery.delivery_date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">Status: {delivery.status}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={updatingStatus === delivery.id}
                            className="h-6 px-2"
                          >
                            {updatingStatus === delivery.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(delivery.id, 'Scheduled')}
                            disabled={delivery.status === 'Scheduled'}
                          >
                            Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(delivery.id, 'In Transit')}
                            disabled={delivery.status === 'In Transit'}
                          >
                            In Transit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(delivery.id, 'Delivered')}
                            disabled={delivery.status === 'Delivered'}
                          >
                            Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(delivery.id, 'Cancelled')}
                            disabled={delivery.status === 'Cancelled'}
                          >
                            Cancelled
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(delivery.id, 'Failed')}
                            disabled={delivery.status === 'Failed'}
                          >
                            Failed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/deliveries/view/${delivery.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/deliveries/edit/${delivery.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Delivery</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this delivery? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDelivery(delivery.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
