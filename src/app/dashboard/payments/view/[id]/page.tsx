"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getPayments } from "@/app/actions/billing";
import { PaymentWithRelations } from "@/types/database";
import { ArrowLeft, Edit, Download, Printer, DollarSign, CreditCard, Receipt, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ViewPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = params.id as string;

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const result = await getPayments();
      if (result.success) {
        const foundPayment = result.data?.find(p => p.id === paymentId);
        if (foundPayment) {
          setPayment(foundPayment);
        } else {
          toast({ 
            title: "Error", 
            description: "Payment not found", 
            variant: "destructive" 
          });
          router.push("/dashboard/payments");
        }
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to load payment", 
          variant: "destructive" 
        });
        router.push("/dashboard/payments");
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load payment", 
        variant: "destructive" 
      });
      router.push("/dashboard/payments");
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <DollarSign className="w-4 h-4" />;
      case 'Bank Transfer': return <CreditCard className="w-4 h-4" />;
      case 'Cheque': return <Receipt className="w-4 h-4" />;
      case 'UPI': return <CreditCard className="w-4 h-4" />;
      case 'Card': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    toast({ title: "Info", description: "PDF download feature coming soon" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Payment Not Found</h2>
          <Button onClick={() => router.push("/dashboard/payments")}>
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Payments", href: "/dashboard/payments" },
        { label: `Payment ${payment.id.slice(0, 8)}` }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/payments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payments
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Details
            </h1>
            <p className="text-gray-600">
              {format(new Date(payment.payment_date), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => router.push(`/dashboard/payments/edit/${payment.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">₹{payment.amount.toLocaleString()}</h3>
                  <p className="text-gray-600">Payment Amount</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.payment_method)}
                    <span className="font-semibold">{payment.payment_method}</span>
                  </div>
                  <p className="text-gray-600">Payment Method</p>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                  </h3>
                  <p className="text-gray-600">Payment Date</p>
                </div>
                <div>
                  <h3 className="font-semibold">{payment.reference_number || 'N/A'}</h3>
                  <p className="text-gray-600">Reference Number</p>
                </div>
              </div>
              {payment.notes && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-gray-600">{payment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle>Related Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">{payment.invoice?.invoice_number}</h3>
                  <p className="text-gray-600">Invoice Number</p>
                </div>
                <div>
                  <h3 className="font-semibold">{payment.invoice?.customer?.name}</h3>
                  <p className="text-gray-600">Customer</p>
                </div>
                <div>
                  <h3 className="font-semibold">₹{payment.invoice?.total_amount?.toLocaleString()}</h3>
                  <p className="text-gray-600">Invoice Total</p>
                </div>
                <div>
                  <h3 className="font-semibold">₹{payment.invoice?.paid_amount?.toLocaleString()}</h3>
                  <p className="text-gray-600">Total Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Amount:</span>
                  <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">{payment.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Date:</span>
                  <span className="font-medium">
                    {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium">{payment.reference_number || 'N/A'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{payment.amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/dashboard/billing/view/${payment.invoice_id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/dashboard/payments/edit/${payment.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Payment
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 