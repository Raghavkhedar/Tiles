"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getPayments, updatePayment } from "@/app/actions/billing";
import { PaymentWithRelations } from "@/types/database";
import { ArrowLeft, Save, Loader2, DollarSign, CreditCard, Receipt } from "lucide-react";
import Link from "next/link";

export default function EditPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    payment_date: '',
    amount: 0,
    payment_method: 'Cash',
    reference_number: '',
    notes: '',
  });

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
          setPaymentData({
            payment_date: foundPayment.payment_date,
            amount: foundPayment.amount,
            payment_method: foundPayment.payment_method,
            reference_number: foundPayment.reference_number || '',
            notes: foundPayment.notes || '',
          });
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

  const handleInputChange = (field: string, value: string | number) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!paymentData.payment_date) {
      toast({ title: "Error", description: "Please select a payment date", variant: "destructive" });
      return false;
    }
    if (paymentData.amount <= 0) {
      toast({ title: "Error", description: "Payment amount must be greater than 0", variant: "destructive" });
      return false;
    }
    if (!paymentData.payment_method) {
      toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const updatePayload = {
        payment_date: paymentData.payment_date,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number || null,
        notes: paymentData.notes || null,
      };

      const result = await updatePayment(paymentId, updatePayload);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Payment updated successfully",
        });
        router.push('/dashboard/payments');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update payment",
          variant: "destructive",
        });
      }
    } catch (error) {
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
    <>
      <div className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Payments", href: "/dashboard/payments" },
            { label: `Edit Payment ${payment.id.slice(0, 8)}` }
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
              <h1 className="text-3xl font-bold text-foreground">
                Edit Payment
              </h1>
              <p className="text-muted-foreground">
                Update payment details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Invoice Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Related Invoice</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Invoice Number</Label>
                        <Input
                          value={payment.invoice?.invoice_number || ''}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label>Customer</Label>
                        <Input
                          value={payment.invoice?.customer?.name || ''}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label>Invoice Total</Label>
                        <Input
                          value={`₹${payment.invoice?.total_amount?.toLocaleString() || '0'}`}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label>Total Paid</Label>
                        <Input
                          value={`₹${payment.invoice?.paid_amount?.toLocaleString() || '0'}`}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
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
                          {payment.invoice?.invoice_number || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Customer:</span>
                        <span className="font-medium">
                          {payment.invoice?.customer?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Invoice Total:</span>
                        <span className="font-medium">
                          ₹{payment.invoice?.total_amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Paid:</span>
                        <span className="font-medium">
                          ₹{payment.invoice?.paid_amount?.toLocaleString() || '0'}
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
                        Updating Payment...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Payment
                      </>
                    )}
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