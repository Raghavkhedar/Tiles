"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getInvoice } from "@/app/actions/billing";
import { InvoiceWithRelations } from "@/types/database";
import { ArrowLeft, Edit, Download, Printer, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInvoice } from "@/app/actions/billing";
import { downloadInvoicePDF, getBusinessSettingsForPDF } from "@/lib/pdf-generator";
import Link from "next/link";

export default function ViewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const invoiceId = params.id as string;

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const result = await getInvoice(invoiceId);
      if (result.success) {
        setInvoice(result.data);
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to load invoice", 
          variant: "destructive" 
        });
        router.push("/dashboard/billing");
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load invoice", 
        variant: "destructive" 
      });
      router.push("/dashboard/billing");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!invoice) return;
    
    try {
      // Get business settings for PDF header
      const businessOptions = await getBusinessSettingsForPDF();
      
      await downloadInvoicePDF(invoice, businessOptions);
      toast({ title: "Success", description: "Invoice PDF downloaded successfully" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to download PDF", 
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invoice Not Found</h2>
          <Button onClick={() => router.push("/dashboard/billing")}>
            Back to Billing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Billing", href: "/dashboard/billing" },
        { label: `Invoice ${invoice.invoice_number}` }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/billing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Billing
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invoice #{invoice.invoice_number}
            </h1>
            <p className="text-gray-600">
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select 
            value={invoice.status} 
            onValueChange={async (newStatus) => {
              try {
                const result = await updateInvoice(invoice.id, { status: newStatus });
                if (result.success) {
                  toast({ title: "Success", description: "Invoice status updated" });
                  loadInvoice(); // Reload the invoice data
                } else {
                  toast({ 
                    title: "Error", 
                    description: result.error || "Failed to update status", 
                    variant: "destructive" 
                  });
                }
              } catch (error) {
                toast({ 
                  title: "Error", 
                  description: "Failed to update status", 
                  variant: "destructive" 
                });
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => router.push(`/dashboard/billing/edit/${invoice.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{invoice.customer?.name}</h3>
                  <p className="text-gray-600">{invoice.customer?.contact_person}</p>
                  <p className="text-gray-600">{invoice.customer?.phone}</p>
                  <p className="text-gray-600">{invoice.customer?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Billing Address</h4>
                  <p className="text-gray-600">
                    {invoice.customer?.address}<br />
                    {invoice.customer?.city}, {invoice.customer?.state} - {invoice.customer?.pincode}
                  </p>
                  {invoice.customer?.gst_number && (
                    <p className="text-gray-600 mt-2">
                      <strong>GST:</strong> {invoice.customer.gst_number}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Rate</th>
                      <th className="text-right p-2">Discount</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            {item.product_sku && (
                              <div className="text-sm text-gray-600">SKU: {item.product_sku}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">₹{item.unit_price.toFixed(2)}</td>
                        <td className="p-2 text-right">
                          {item.discount_percent > 0 ? `${item.discount_percent}%` : '-'}
                        </td>
                        <td className="p-2 text-right font-medium">₹{item.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms_conditions) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-gray-600">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms_conditions && (
                  <div>
                    <h4 className="font-medium mb-2">Terms & Conditions</h4>
                    <p className="text-gray-600">{invoice.terms_conditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoice Summary */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </Badge>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Invoice Date:</span>
                  <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Terms:</span>
                  <span>{invoice.payment_terms}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Totals Card */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-₹{invoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span>₹{invoice.cgst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span>₹{invoice.sgst_amount.toFixed(2)}</span>
                </div>
                {invoice.igst_amount > 0 && (
                  <div className="flex justify-between">
                    <span>IGST (18%):</span>
                    <span>₹{invoice.igst_amount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 