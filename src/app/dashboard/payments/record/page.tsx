"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getInvoices, createPayment, syncInvoiceStatuses } from "@/app/actions/billing";
import { InvoiceWithRelations } from "@/types/database";
import { ArrowLeft, Save, Loader2, DollarSign, CreditCard, Receipt } from "lucide-react";
import Link from "next/link";

export default function RecordPaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null);
  
  const [paymentData, setPaymentData] = useState({
    invoice_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_method: 'Cash',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // First, sync invoice statuses to ensure they match payment data
      console.log('Syncing invoice statuses before loading invoices...');
      const syncResult = await syncInvoiceStatuses();
      console.log('Sync result:', syncResult);
      
      const result = await getInvoices();
      if (result.success) {
        // Filter only invoices that are not fully paid based on actual payment data
        const unpaidInvoices = (result.data || []).filter(
          invoice => {
            const paidAmount = invoice.paid_amount || 0;
            const totalAmount = invoice.total_amount || 0;
            const remainingAmount = totalAmount - paidAmount;
            console.log(`Invoice ${invoice.invoice_number}: Total=${totalAmount}, Paid=${paidAmount}, Remaining=${remainingAmount}, Status=${invoice.status}`);
            return remainingAmount > 0;
          }
        );
        console.log('Unpaid invoices:', unpaidInvoices.map(inv => ({ 
          id: inv.id, 
          number: inv.invoice_number, 
          total: inv.total_amount, 
          paid: inv.paid_amount, 
          remaining: (inv.total_amount || 0) - (inv.paid_amount || 0),
          status: inv.status
        })));
        setInvoices(unpaidInvoices);
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
    setPaymentData(prev => ({ ...prev, invoice_id: invoiceId }));
    
    if (invoice) {
      const paidAmount = invoice.paid_amount || 0;
      const totalAmount = invoice.total_amount || 0;
      const remainingAmount = totalAmount - paidAmount;
      setPaymentData(prev => ({ ...prev, amount: remainingAmount }));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    console.log('Validating form with data:', paymentData);
    
    if (!paymentData.invoice_id) {
      console.log('Validation failed: No invoice selected');
      toast({ title: "Error", description: "Please select an invoice", variant: "destructive" });
      return false;
    }
    if (!paymentData.payment_date) {
      console.log('Validation failed: No payment date');
      toast({ title: "Error", description: "Please select a payment date", variant: "destructive" });
      return false;
    }
    if (paymentData.amount <= 0) {
      console.log('Validation failed: Invalid amount');
      toast({ title: "Error", description: "Payment amount must be greater than 0", variant: "destructive" });
      return false;
    }
    if (!paymentData.payment_method) {
      console.log('Validation failed: No payment method');
      toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
      return false;
    }
    
    console.log('Form validation passed');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', paymentData);
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const paymentPayload = {
        invoice_id: paymentData.invoice_id,
        payment_date: paymentData.payment_date,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number || null,
        notes: paymentData.notes || null,
      };

      console.log('Sending payment payload:', paymentPayload);

      const result = await createPayment(paymentPayload);
      
      console.log('Payment creation result:', result);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Payment recorded successfully",
        });
        router.push('/dashboard/payments');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to record payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  return (
    <>
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Payments", href: "/dashboard/payments" },
            { label: "Record Payment" }
          ]} />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/payments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payments
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Record Payment
              </h1>
              <p className="text-gray-600">
                Record a new payment for an invoice
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Invoice Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Invoice</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="invoice">Invoice *</Label>
                      <Select 
                        value={paymentData.invoice_id}
                        onValueChange={handleInvoiceSelect}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loading ? "Loading..." : "Select invoice"} />
                        </SelectTrigger>
                        <SelectContent>
                          {invoices.map((invoice) => {
                            const paidAmount = invoice.paid_amount || 0;
                            const totalAmount = invoice.total_amount || 0;
                            const remainingAmount = totalAmount - paidAmount;
                            return (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.invoice_number} - {invoice.customer?.name} 
                                (₹{remainingAmount.toLocaleString()} remaining)
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedInvoice && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Customer</Label>
                          <Input
                            value={selectedInvoice.customer?.name || ''}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Total Amount</Label>
                          <Input
                            value={`₹${selectedInvoice.total_amount?.toLocaleString() || '0'}`}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Paid Amount</Label>
                          <Input
                            value={`₹${selectedInvoice.paid_amount?.toLocaleString() || '0'}`}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Remaining Amount</Label>
                          <Input
                            value={`₹${((selectedInvoice.total_amount || 0) - (selectedInvoice.paid_amount || 0)).toLocaleString()}`}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentDate">Payment Date *</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          required
                          value={paymentData.payment_date}
                          onChange={(e) => handleInputChange('payment_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={paymentData.amount}
                          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select 
                          value={paymentData.payment_method}
                          onValueChange={(value) => handleInputChange('payment_method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Cash
                              </div>
                            </SelectItem>
                            <SelectItem value="Bank Transfer">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Bank Transfer
                              </div>
                            </SelectItem>
                            <SelectItem value="Cheque">
                              <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4" />
                                Cheque
                              </div>
                            </SelectItem>
                            <SelectItem value="UPI">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                UPI
                              </div>
                            </SelectItem>
                            <SelectItem value="Card">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Card
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="referenceNumber">Reference Number</Label>
                        <Input
                          id="referenceNumber"
                          placeholder="Transaction ID, Cheque number, etc."
                          value={paymentData.reference_number}
                          onChange={(e) => handleInputChange('reference_number', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional payment notes..."
                        rows={3}
                        value={paymentData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                      />
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
                      <div className="flex justify-between text-sm">
                        <span>Invoice:</span>
                        <span className="font-medium">
                          {selectedInvoice?.invoice_number || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Customer:</span>
                        <span className="font-medium">
                          {selectedInvoice?.customer?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Amount:</span>
                        <span className="font-medium">
                          ₹{selectedInvoice?.total_amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Paid Amount:</span>
                        <span className="font-medium">
                          ₹{selectedInvoice?.paid_amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remaining:</span>
                        <span className="font-medium">
                          ₹{selectedInvoice ? ((selectedInvoice.total_amount || 0) - (selectedInvoice.paid_amount || 0)).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Payment Amount:</span>
                          <span>₹{paymentData.amount.toLocaleString()}</span>
                        </div>
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
                        Recording Payment...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Record Payment
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      console.log('Test button clicked');
                      console.log('Current form data:', paymentData);
                      console.log('Selected invoice:', selectedInvoice);
                    }}
                    disabled={saving}
                  >
                    Test Form Data
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/payments')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 