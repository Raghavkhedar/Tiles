import DashboardNavbar from "@/components/dashboard-navbar";
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
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
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
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";

export default async function DeliveriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock delivery data
  const deliveries = [
    {
      id: "DEL-2024-001",
      invoiceId: "INV-2024-001",
      customerName: "Sharma Construction",
      customerAddress: "123 MG Road, Mumbai, Maharashtra 400001",
      contactPerson: "Rajesh Sharma",
      contactPhone: "+91 98765 43210",
      items: [
        { name: "Ceramic Floor Tiles - White", quantity: 10, weight: "250 kg" },
      ],
      scheduledDate: "2024-01-20",
      scheduledTime: "10:00 AM",
      actualDeliveryDate: "2024-01-20",
      driverName: "Ramesh Kumar",
      vehicleNumber: "MH-01-AB-1234",
      status: "Delivered",
      deliveryNotes: "Delivered successfully. Customer satisfied.",
      totalAmount: 14160,
    },
    {
      id: "DEL-2024-002",
      invoiceId: "INV-2024-002",
      customerName: "Modern Interiors",
      customerAddress: "456 Park Street, Delhi, Delhi 110001",
      contactPerson: "Priya Patel",
      contactPhone: "+91 87654 32109",
      items: [
        { name: "Vitrified Tiles", quantity: 8, weight: "320 kg" },
        { name: "Wall Tiles", quantity: 5, weight: "100 kg" },
      ],
      scheduledDate: "2024-01-21",
      scheduledTime: "2:00 PM",
      actualDeliveryDate: null,
      driverName: "Suresh Patel",
      vehicleNumber: "DL-02-CD-5678",
      status: "In Transit",
      deliveryNotes: "Out for delivery",
      totalAmount: 28320,
    },
    {
      id: "DEL-2024-003",
      invoiceId: "INV-2024-003",
      customerName: "Elite Builders",
      customerAddress: "789 Commercial Complex, Bangalore, Karnataka 560001",
      contactPerson: "Amit Kumar",
      contactPhone: "+91 76543 21098",
      items: [
        { name: "Granite Tiles - Black Pearl", quantity: 6, weight: "480 kg" },
      ],
      scheduledDate: "2024-01-22",
      scheduledTime: "11:00 AM",
      actualDeliveryDate: null,
      driverName: "Vikram Singh",
      vehicleNumber: "KA-03-EF-9012",
      status: "Scheduled",
      deliveryNotes: "Ready for dispatch",
      totalAmount: 22656,
    },
    {
      id: "DEL-2024-004",
      invoiceId: "INV-2024-004",
      customerName: "Home Decor Solutions",
      customerAddress: "321 Residency Road, Hyderabad, Telangana 500001",
      contactPerson: "Sunita Reddy",
      contactPhone: "+91 65432 10987",
      items: [{ name: "Designer Wall Tiles", quantity: 12, weight: "180 kg" }],
      scheduledDate: "2024-01-19",
      scheduledTime: "3:00 PM",
      actualDeliveryDate: null,
      driverName: "Ravi Sharma",
      vehicleNumber: "TS-04-GH-3456",
      status: "Delayed",
      deliveryNotes: "Customer requested reschedule",
      totalAmount: 18500,
    },
  ];

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

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Delivery Management" }]} />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Delivery Management
              </h1>
              <p className="text-gray-600">
                Track and manage tile deliveries for your projects
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/dashboard/deliveries/schedule">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Delivery
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Deliveries
                </CardTitle>
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
                <div className="text-2xl font-bold text-green-600">
                  {completedDeliveries}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Transit
                </CardTitle>
                <Truck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {inTransitDeliveries}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {pendingDeliveries}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
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
                    <TableHead>Delivery Details</TableHead>
                    <TableHead>Customer & Location</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Driver & Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{delivery.id}</div>
                          <div className="text-sm text-gray-500">
                            Invoice: {delivery.invoiceId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Amount: ₹{delivery.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {delivery.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.contactPerson}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.contactPhone}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {delivery.customerAddress.split(",")[0]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {delivery.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-gray-500">
                                Qty: {item.quantity} | {item.weight}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(
                              delivery.scheduledDate,
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.scheduledTime}
                          </div>
                          {delivery.actualDeliveryDate && (
                            <div className="text-sm text-green-600">
                              Delivered:{" "}
                              {new Date(
                                delivery.actualDeliveryDate,
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {delivery.driverName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.vehicleNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            delivery.status === "Delivered"
                              ? "default"
                              : delivery.status === "In Transit"
                                ? "secondary"
                                : delivery.status === "Scheduled"
                                  ? "outline"
                                  : "destructive"
                          }
                          className={
                            delivery.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : delivery.status === "In Transit"
                                ? "bg-blue-100 text-blue-800"
                                : delivery.status === "Scheduled"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                          }
                        >
                          {delivery.status}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {delivery.deliveryNotes}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Package className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
