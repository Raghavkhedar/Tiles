import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
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

export default async function CustomersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock customer data
  const customers = [
    {
      id: 1,
      name: "Sharma Construction",
      contactPerson: "Rajesh Sharma",
      phone: "+91 98765 43210",
      email: "rajesh@sharmaconstruction.com",
      address: "123 MG Road, Mumbai, Maharashtra 400001",
      gstNumber: "27AABCS1234C1Z5",
      totalPurchases: 245000,
      outstandingAmount: 15000,
      lastOrderDate: "2024-01-15",
      status: "Active",
      creditLimit: 50000,
      paymentTerms: "30 days",
    },
    {
      id: 2,
      name: "Modern Interiors",
      contactPerson: "Priya Patel",
      phone: "+91 87654 32109",
      email: "priya@moderninteriors.com",
      address: "456 Park Street, Delhi, Delhi 110001",
      gstNumber: "07DEFGH5678D2Z6",
      totalPurchases: 180000,
      outstandingAmount: 28320,
      lastOrderDate: "2024-01-16",
      status: "Active",
      creditLimit: 75000,
      paymentTerms: "15 days",
    },
    {
      id: 3,
      name: "Elite Builders",
      contactPerson: "Amit Kumar",
      phone: "+91 76543 21098",
      email: "amit@elitebuilders.com",
      address: "789 Commercial Complex, Bangalore, Karnataka 560001",
      gstNumber: "29IJKLM9012E3Z7",
      totalPurchases: 320000,
      outstandingAmount: 22656,
      lastOrderDate: "2024-01-17",
      status: "Overdue",
      creditLimit: 100000,
      paymentTerms: "45 days",
    },
    {
      id: 4,
      name: "Home Decor Solutions",
      contactPerson: "Sunita Reddy",
      phone: "+91 65432 10987",
      email: "sunita@homedecor.com",
      address: "321 Residency Road, Hyderabad, Telangana 500001",
      gstNumber: "36NOPQR3456F4Z8",
      totalPurchases: 95000,
      outstandingAmount: 0,
      lastOrderDate: "2024-01-10",
      status: "Active",
      creditLimit: 30000,
      paymentTerms: "20 days",
    },
  ];

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + c.outstandingAmount,
    0,
  );
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Customer Management
              </h1>
              <p className="text-gray-600">
                Manage customer relationships and track payments
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/dashboard/customers/add">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activeCustomers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Amount
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
                  Total Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalRevenue.toLocaleString()}
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
                    placeholder="Search customers by name, phone, or GST number..."
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

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>
                Complete list of your customers with payment tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Details</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead>Purchase History</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {customer.contactPerson}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {customer.address.split(",")[0]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {customer.gstNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            ₹{customer.totalPurchases.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Last order:{" "}
                            {new Date(
                              customer.lastOrderDate,
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Credit limit: ₹
                            {customer.creditLimit.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-medium ${
                            customer.outstandingAmount > 0
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          ₹{customer.outstandingAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Terms: {customer.paymentTerms}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "Active"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            customer.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {customer.status}
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
        </div>
      </main>
    </>
  );
}
