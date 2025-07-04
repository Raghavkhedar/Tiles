import DashboardNavbar from "@/components/dashboard-navbar";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Calculator,
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

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock billing data
  const invoices = [
    {
      id: "INV-2024-001",
      customerName: "Sharma Construction",
      customerGST: "27AABCS1234C1Z5",
      date: "2024-01-15",
      dueDate: "2024-02-14",
      items: [
        {
          name: "Ceramic Floor Tiles",
          quantity: 10,
          area: 14.4,
          pricePerBox: 1200,
          gst: 18,
        },
      ],
      subtotal: 12000,
      gstAmount: 2160,
      total: 14160,
      status: "Paid",
      paymentMethod: "Bank Transfer",
    },
    {
      id: "INV-2024-002",
      customerName: "Modern Interiors",
      customerGST: "27DEFGH5678D2Z6",
      date: "2024-01-16",
      dueDate: "2024-02-15",
      items: [
        {
          name: "Vitrified Tiles",
          quantity: 8,
          area: 10.24,
          pricePerBox: 2500,
          gst: 18,
        },
        {
          name: "Wall Tiles",
          quantity: 5,
          area: 5.4,
          pricePerBox: 800,
          gst: 18,
        },
      ],
      subtotal: 24000,
      gstAmount: 4320,
      total: 28320,
      status: "Pending",
      paymentMethod: "",
    },
    {
      id: "INV-2024-003",
      customerName: "Elite Builders",
      customerGST: "27IJKLM9012E3Z7",
      date: "2024-01-17",
      dueDate: "2024-02-16",
      items: [
        {
          name: "Granite Tiles",
          quantity: 6,
          area: 8.64,
          pricePerBox: 3200,
          gst: 18,
        },
      ],
      subtotal: 19200,
      gstAmount: 3456,
      total: 22656,
      status: "Overdue",
      paymentMethod: "",
    },
  ];

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Billing & Invoices
              </h1>
              <p className="text-gray-600">
                GST compliant billing system for your tile business
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Area Calculator
              </Button>
              <Link href="/dashboard/billing/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Payments
                </CardTitle>
                <FileText className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{pendingAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Amount
                </CardTitle>
                <FileText className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{overdueAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Invoices
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices.length}</div>
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
                    placeholder="Search invoices by customer name, invoice number..."
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

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Manage your billing and track payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Details</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.id}</div>
                          <div className="text-sm text-gray-500">
                            Due:{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            GST: {invoice.customerGST}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            ₹{invoice.total.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Subtotal: ₹{invoice.subtotal.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        ₹{invoice.gstAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "Paid"
                              ? "default"
                              : invoice.status === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            invoice.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "Pending"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Area Calculator Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tile Area Calculator
              </CardTitle>
              <CardDescription>
                Calculate boxes needed from area measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Area (sq meters)
                  </label>
                  <Input placeholder="Enter area" type="number" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tile Size</label>
                  <Input placeholder="60x60 cm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tiles per Box</label>
                  <Input placeholder="4" type="number" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Calculate Boxes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
