import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Package,
  Calendar,
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

export default async function SuppliersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock supplier data
  const suppliers = [
    {
      id: 1,
      name: "ABC Ceramics Ltd",
      contactPerson: "Ramesh Gupta",
      phone: "+91 98765 43210",
      email: "ramesh@abcceramics.com",
      address: "Industrial Area, Phase 1, Morbi, Gujarat 363641",
      gstNumber: "24AABCA1234B1Z5",
      totalPurchases: 485000,
      outstandingAmount: 45000,
      lastOrderDate: "2024-01-18",
      status: "Active",
      creditLimit: 100000,
      paymentTerms: "30 days",
      products: ["Ceramic Floor Tiles", "Wall Tiles", "Bathroom Tiles"],
      rating: 4.5,
    },
    {
      id: 2,
      name: "Premium Tiles Co",
      contactPerson: "Suresh Patel",
      phone: "+91 87654 32109",
      email: "suresh@premiumtiles.com",
      address: "Tile Park, Sector 15, Rajkot, Gujarat 360001",
      gstNumber: "24DEFGH5678C2Z6",
      totalPurchases: 320000,
      outstandingAmount: 0,
      lastOrderDate: "2024-01-16",
      status: "Active",
      creditLimit: 75000,
      paymentTerms: "15 days",
      products: ["Vitrified Tiles", "Marble Finish Tiles"],
      rating: 4.8,
    },
    {
      id: 3,
      name: "Stone Masters",
      contactPerson: "Vikram Singh",
      phone: "+91 76543 21098",
      email: "vikram@stonemasters.com",
      address: "Granite Hub, Jalore Road, Udaipur, Rajasthan 313001",
      gstNumber: "08IJKLM9012D3Z7",
      totalPurchases: 275000,
      outstandingAmount: 22656,
      lastOrderDate: "2024-01-17",
      status: "Active",
      creditLimit: 80000,
      paymentTerms: "45 days",
      products: ["Granite Tiles", "Natural Stone Tiles"],
      rating: 4.2,
    },
    {
      id: 4,
      name: "Color Tiles Ltd",
      contactPerson: "Anjali Sharma",
      phone: "+91 65432 10987",
      email: "anjali@colortiles.com",
      address: "Export Promotion Zone, Morbi, Gujarat 363642",
      gstNumber: "24NOPQR3456E4Z8",
      totalPurchases: 195000,
      outstandingAmount: 8500,
      lastOrderDate: "2024-01-14",
      status: "Active",
      creditLimit: 50000,
      paymentTerms: "20 days",
      products: ["Designer Wall Tiles", "Decorative Tiles"],
      rating: 4.6,
    },
    {
      id: 5,
      name: "Tile World Industries",
      contactPerson: "Manoj Kumar",
      phone: "+91 54321 09876",
      email: "manoj@tileworld.com",
      address: "Industrial Estate, Thangadh, Gujarat 363530",
      gstNumber: "24STUVW7890F5Z9",
      totalPurchases: 125000,
      outstandingAmount: 15000,
      lastOrderDate: "2024-01-12",
      status: "Inactive",
      creditLimit: 40000,
      paymentTerms: "30 days",
      products: ["Floor Tiles", "Kitchen Tiles"],
      rating: 3.8,
    },
  ];

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "Active").length;
  const totalOutstanding = suppliers.reduce(
    (sum, s) => sum + s.outstandingAmount,
    0,
  );
  const totalPurchases = suppliers.reduce(
    (sum, s) => sum + s.totalPurchases,
    0,
  );

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Supplier Management
              </h1>
              <p className="text-gray-600">
                Manage supplier relationships and track purchase orders
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/dashboard/suppliers/add">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Suppliers
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSuppliers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Suppliers
                </CardTitle>
                <Truck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activeSuppliers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Payables
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{totalOutstanding.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Purchases
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalPurchases.toLocaleString()}
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
                    placeholder="Search suppliers by name, phone, or GST number..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>
                Complete list of your tile suppliers with purchase tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Details</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>GST & Location</TableHead>
                    <TableHead>Purchase History</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-gray-500">
                            {supplier.contactPerson}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xs ${
                                    i < Math.floor(supplier.rating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="ml-1">{supplier.rating}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-mono mb-1">
                            {supplier.gstNumber}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {supplier.address.split(",")[0]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            ₹{supplier.totalPurchases.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Last order:{" "}
                            {new Date(
                              supplier.lastOrderDate,
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Terms: {supplier.paymentTerms}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-medium ${
                            supplier.outstandingAmount > 0
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          ₹{supplier.outstandingAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Limit: ₹{supplier.creditLimit.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.products
                            .slice(0, 2)
                            .map((product, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {product}
                              </Badge>
                            ))}
                          {supplier.products.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{supplier.products.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            supplier.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Purchase Orders
                </CardTitle>
                <CardDescription>
                  Create and manage purchase orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Create Purchase Order
                  </Button>
                  <Button className="w-full" variant="outline">
                    View Pending Orders
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Payment Management
                </CardTitle>
                <CardDescription>
                  Track and manage supplier payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Record Payment
                  </Button>
                  <Button className="w-full" variant="outline">
                    Payment History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Supplier Reports
                </CardTitle>
                <CardDescription>
                  Generate supplier performance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Performance Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    Purchase Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
