"use client";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  FileText,
  Calculator,
  Plus,
  Minus,
  Save,
  Send,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Product, Customer, InvoiceItemInsert, InvoiceInsert } from '@/types/database';
import { getProducts } from '@/app/actions/inventory';
import { getCustomers } from '@/app/actions/customers';
import { createInvoice, calculateInvoiceTotals, generateInvoiceNumber } from '@/app/actions/billing';
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceData, setInvoiceData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_terms: '30 days',
    notes: '',
    terms_conditions: '',
  });
  const [items, setItems] = useState([
    {
      product_id: '',
      product_name: '',
      product_sku: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      tax_rate: 18,
      tax_amount: 0,
      discount_percent: 0,
      discount_amount: 0,
    },
  ]);

  // Load products and customers
  useEffect(() => {
    async function loadData() {
      const [productsResult, customersResult] = await Promise.all([
        getProducts(),
        getCustomers()
      ]);
      
      if (productsResult.success) {
        setProducts((productsResult.data || []).sort((a, b) => a.name.localeCompare(b.name)));
      }
      
      if (customersResult.success) {
        setCustomers((customersResult.data || []).sort((a, b) => a.name.localeCompare(b.name)));
      }
    }
    loadData();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        product_name: '',
        product_sku: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        tax_rate: 18,
        tax_amount: 0,
        discount_percent: 0,
        discount_amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setInvoiceData(prev => ({ ...prev, customer_id: customerId }));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const updatedItems = [...items];
      const unitPrice = product.price_per_box;
      const quantity = updatedItems[index].quantity;
      const totalPrice = unitPrice * quantity;
      const taxAmount = (totalPrice * 18) / 100; // 18% GST
      
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: productId,
        product_name: product.name,
        product_sku: product.sku,
        unit_price: unitPrice,
        total_price: totalPrice,
        tax_amount: taxAmount,
      };
      setItems(updatedItems);
    }
  };

  const handleQuantityChange = (index: number, value: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    const totalPrice = value * item.unit_price;
    const taxAmount = (totalPrice * item.tax_rate) / 100;
    const discountAmount = (totalPrice * item.discount_percent) / 100;
    
    updatedItems[index] = {
      ...item,
      quantity: value,
      total_price: totalPrice,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
    };
    setItems(updatedItems);
  };

  const handleUnitPriceChange = (index: number, value: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    const totalPrice = item.quantity * value;
    const taxAmount = (totalPrice * item.tax_rate) / 100;
    const discountAmount = (totalPrice * item.discount_percent) / 100;
    
    updatedItems[index] = {
      ...item,
      unit_price: value,
      total_price: totalPrice,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
    };
    setItems(updatedItems);
  };

  const handleDiscountChange = (index: number, value: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    const discountAmount = (item.total_price * value) / 100;
    
    updatedItems[index] = {
      ...item,
      discount_percent: value,
      discount_amount: discountAmount,
    };
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const totalTax = items.reduce((sum, item) => sum + item.tax_amount, 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.discount_amount, 0);
    const total = subtotal + totalTax - totalDiscount;
    
    return { subtotal, totalTax, totalDiscount, total };
  };

  const validateForm = () => {
    if (!invoiceData.customer_id) {
      toast({
        title: "Validation Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return false;
    }

    if (items.some(item => !item.product_id)) {
      toast({
        title: "Validation Error",
        description: "Please select products for all items",
        variant: "destructive",
      });
      return false;
    }

    if (items.some(item => item.quantity <= 0)) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { subtotal, totalTax, totalDiscount, total } = calculateTotals();
      
      // Generate invoice number
      const invoiceNumberResult = await generateInvoiceNumber();
      if (!invoiceNumberResult.success) {
        throw new Error(invoiceNumberResult.error);
      }

      const invoicePayload = {
        invoice_number: invoiceNumberResult.data,
        customer_id: selectedCustomer!.id,
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: subtotal,
        cgst_amount: totalTax / 2, // Split GST into CGST and SGST
        sgst_amount: totalTax / 2,
        igst_amount: 0,
        total_amount: total,
        discount_amount: totalDiscount,
        tax_rate: 18,
        payment_terms: invoiceData.payment_terms,
        status: 'Draft',
        notes: invoiceData.notes || '',
        terms_conditions: invoiceData.terms_conditions || '',
      };

      const result = await createInvoice(invoicePayload as InvoiceInsert, items as InvoiceItemInsert[]);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Invoice created successfully",
        });
        router.push('/dashboard/billing');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create invoice",
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
      setLoading(false);
    }
  };

  const { subtotal, totalTax, totalDiscount, total } = calculateTotals();

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Billing", href: "/dashboard/billing" },
            { label: "Create Invoice" }
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
                Create New Invoice
              </h1>
              <p className="text-gray-600">
                Generate GST compliant invoice for tile sales
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
                    <CardDescription>
                      Add tile products with area calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                                disabled={items.length === 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button type="button" variant="outline" className="mt-4" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </CardContent>
                </Card>

                {/* Area Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Area to Box Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Room Length (m)</Label>
                        <Input type="number" placeholder="4.0" />
                      </div>
                      <div>
                        <Label>Room Width (m)</Label>
                        <Input type="number" placeholder="3.6" />
                      </div>
                      <div>
                        <Label>Tile Size</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60x60">60x60 cm</SelectItem>
                            <SelectItem value="80x80">80x80 cm</SelectItem>
                            <SelectItem value="30x45">30x45 cm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button type="button" className="w-full">Calculate</Button>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Total Area: <span className="font-medium">14.4 m²</span> |
                        Boxes Needed:{" "}
                        <span className="font-medium">10 boxes</span> | Extra:{" "}
                        <span className="font-medium">5%</span>
                      </p>
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
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CGST (9%):</span>
                        <span>₹{(totalTax / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (9%):</span>
                        <span>₹{(totalTax / 2).toFixed(2)}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-₹{totalDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Payment Terms</Label>
                      <Select value={invoiceData.payment_terms} onValueChange={(value) => setInvoiceData(prev => ({ ...prev, payment_terms: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7 days">7 days</SelectItem>
                          <SelectItem value="15 days">15 days</SelectItem>
                          <SelectItem value="30 days">30 days</SelectItem>
                          <SelectItem value="45 days">45 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea 
                        placeholder="Additional notes..." 
                        rows={3}
                        value={invoiceData.notes}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Invoice...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Save & Send
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
