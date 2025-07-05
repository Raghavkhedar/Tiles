"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getInvoice, updateInvoice } from "@/app/actions/billing";
import { getCustomers } from "@/app/actions/customers";
import { getProducts } from "@/app/actions/inventory";
import { InvoiceWithRelations, Customer, Product, InvoiceItemInsert } from "@/types/database";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface InvoiceFormData {
  customer_id: string;
  status: string;
  payment_terms: string;
  notes: string;
  terms_conditions: string;
}

interface InvoiceItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_price: number;
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    customer_id: '',
    status: 'Draft',
    payment_terms: '30 days',
    notes: '',
    terms_conditions: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);

  const invoiceId = params.id as string;

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load invoice
      const invoiceResult = await getInvoice(invoiceId);
      if (!invoiceResult.success) {
        toast({ 
          title: "Error", 
          description: invoiceResult.error || "Failed to load invoice", 
          variant: "destructive" 
        });
        router.push("/dashboard/billing");
        return;
      }

      const invoiceData = invoiceResult.data;
      setInvoice(invoiceData);

      // Set form data
      setInvoiceData({
        customer_id: invoiceData.customer_id,
        status: invoiceData.status,
        payment_terms: invoiceData.payment_terms,
        notes: invoiceData.notes || '',
        terms_conditions: invoiceData.terms_conditions || '',
      });

      // Set items
      if (invoiceData.items) {
        setItems(invoiceData.items.map((item: any) => ({
          product_id: item.product_id || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          total_price: item.total_price,
        })));
      }

      // Load customers and products
      const [customersResult, productsResult] = await Promise.all([
        getCustomers(),
        getProducts()
      ]);

      if (customersResult.success) {
        setCustomers(customersResult.data || []);
        const customer = customersResult.data?.find(c => c.id === invoiceData.customer_id);
        setSelectedCustomer(customer || null);
      }

      if (productsResult.success) {
        setProducts(productsResult.data || []);
      }

    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load data", 
        variant: "destructive" 
      });
      router.push("/dashboard/billing");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setInvoiceData(prev => ({ ...prev, customer_id: customerId }));
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      total_price: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItems(prev => prev.map((item, i) => 
        i === index 
          ? { ...item, product_id: productId, unit_price: product.price_per_box }
          : item
      ));
    }
  };

  const handleQuantityChange = (index: number, value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQuantity = value;
        const newTotal = (newQuantity * item.unit_price) * (1 - item.discount_percent / 100);
        return { ...item, quantity: newQuantity, total_price: newTotal };
      }
      return item;
    }));
  };

  const handleUnitPriceChange = (index: number, value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newUnitPrice = value;
        const newTotal = (item.quantity * newUnitPrice) * (1 - item.discount_percent / 100);
        return { ...item, unit_price: newUnitPrice, total_price: newTotal };
      }
      return item;
    }));
  };

  const handleDiscountChange = (index: number, value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newDiscount = Math.min(100, Math.max(0, value));
        const newTotal = (item.quantity * item.unit_price) * (1 - newDiscount / 100);
        return { ...item, discount_percent: newDiscount, total_price: newTotal };
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const totalDiscount = items.reduce((sum, item) => {
      const originalPrice = item.quantity * item.unit_price;
      return sum + (originalPrice - item.total_price);
    }, 0);
    const totalTax = subtotal * 0.18; // 18% GST
    const total = subtotal + totalTax;

    return { subtotal, totalTax, totalDiscount, total };
  };

  const validateForm = () => {
    if (!invoiceData.customer_id) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return false;
    }

    if (items.length === 0) {
      toast({ title: "Error", description: "Please add at least one item", variant: "destructive" });
      return false;
    }

    for (const item of items) {
      if (!item.product_id) {
        toast({ title: "Error", description: "Please select a product for all items", variant: "destructive" });
        return false;
      }
      if (item.quantity <= 0) {
        toast({ title: "Error", description: "Quantity must be greater than 0", variant: "destructive" });
        return false;
      }
      if (item.unit_price <= 0) {
        toast({ title: "Error", description: "Unit price must be greater than 0", variant: "destructive" });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      const { subtotal, totalTax, totalDiscount, total } = calculateTotals();

      const updateData = {
        customer_id: invoiceData.customer_id,
        status: invoiceData.status,
        subtotal: subtotal,
        cgst_amount: totalTax / 2,
        sgst_amount: totalTax / 2,
        igst_amount: 0,
        total_amount: total,
        discount_amount: totalDiscount,
        tax_rate: 18,
        payment_terms: invoiceData.payment_terms,
        notes: invoiceData.notes || '',
        terms_conditions: invoiceData.terms_conditions || '',
      };

      const result = await updateInvoice(invoiceId, updateData);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Invoice updated successfully",
        });
        router.push('/dashboard/billing');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update invoice",
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

  const { subtotal, totalTax, totalDiscount, total } = calculateTotals();

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
    <>
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Billing", href: "/dashboard/billing" },
            { label: `Edit Invoice ${invoice.invoice_number}` }
          ]} />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Billing
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Invoice #{invoice.invoice_number}
              </h1>
              <p className="text-gray-600">
                Update invoice details and items
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Invoice Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer">Select Customer *</Label>
                        <Select onValueChange={handleCustomerSelect} value={invoiceData.customer_id}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="gst">Customer GST Number</Label>
                        <Input 
                          id="gst" 
                          placeholder="27AABCS1234C1Z5" 
                          value={selectedCustomer?.gst_number || ''}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Billing Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter customer billing address"
                        rows={3}
                        value={selectedCustomer ? `${selectedCustomer.address || ''}, ${selectedCustomer.city || ''}, ${selectedCustomer.state || ''} - ${selectedCustomer.pincode || ''}` : ''}
                        readOnly
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Items</CardTitle>
                    <CardContent>
                      <Button type="button" onClick={addItem} className="mb-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Rate/Box</TableHead>
                            <TableHead>Discount %</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Select onValueChange={(value) => handleProductSelect(index, value)} value={item.product_id}>
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                  className="w-20"
                                  min="1"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.unit_price}
                                  onChange={(e) => handleUnitPriceChange(index, Number(e.target.value))}
                                  className="w-24"
                                  min="0"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.discount_percent}
                                  onChange={(e) => handleDiscountChange(index, Number(e.target.value))}
                                  className="w-20"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CardHeader>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Invoice Status</Label>
                      <Select onValueChange={(value) => setInvoiceData(prev => ({ ...prev, status: value }))} value={invoiceData.status || 'Draft'}>
                        <SelectTrigger>
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
                    </div>
                    <div>
                      <Label htmlFor="payment_terms">Payment Terms</Label>
                      <Select onValueChange={(value) => setInvoiceData(prev => ({ ...prev, payment_terms: value }))} value={invoiceData.payment_terms}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Immediate">Immediate</SelectItem>
                          <SelectItem value="7 days">7 days</SelectItem>
                          <SelectItem value="15 days">15 days</SelectItem>
                          <SelectItem value="30 days">30 days</SelectItem>
                          <SelectItem value="45 days">45 days</SelectItem>
                          <SelectItem value="60 days">60 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes for the invoice"
                        rows={3}
                        value={invoiceData.notes}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea
                        id="terms"
                        placeholder="Terms and conditions"
                        rows={3}
                        value={invoiceData.terms_conditions}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, terms_conditions: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-₹{totalDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>CGST (9%):</span>
                      <span>₹{(totalTax / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9%):</span>
                      <span>₹{(totalTax / 2).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Button type="submit" className="w-full" disabled={saving}>
                        {saving ? "Updating..." : "Update Invoice"}
                      </Button>
                      <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/dashboard/billing')}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 