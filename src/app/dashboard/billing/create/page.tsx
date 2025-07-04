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
import { Product } from '@/types/database';
import { getProducts } from '@/app/actions/inventory';

export default function CreateInvoicePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState([
    {
      product_id: '',
      product_name: '',
      purchase_type: 'boxes',
      quantity: 1,
      area: 0,
      unit_price: 0,
      total_price: 0,
    },
  ]);

  useEffect(() => {
    async function loadProducts() {
      const result = await getProducts();
      if (result.success) {
        // Sort products by name
        setProducts((result.data || []).sort((a, b) => a.name.localeCompare(b.name)));
      }
    }
    loadProducts();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        product_name: '',
        purchase_type: 'boxes',
        quantity: 1,
        area: 0,
        unit_price: 0,
        total_price: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const updatedItems = [...items];
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: productId,
        product_name: product.name,
        unit_price: product.price_per_box,
        quantity: 1,
        area: product.area_per_box,
        total_price: product.price_per_box,
      };
      setItems(updatedItems);
    }
  };

  const calculateQuantityFromArea = (area: number, areaPerBox: number): number => {
    return Math.ceil(area / areaPerBox);
  };

  const calculateAreaFromQuantity = (quantity: number, areaPerBox: number): number => {
    return quantity * areaPerBox;
  };

  const handlePurchaseTypeChange = (index: number, purchaseType: 'boxes' | 'area') => {
    const item = items[index];
    const product = products.find((p) => p.id === item.product_id);
    const updatedItems = [...items];
    if (product) {
      if (purchaseType === 'area') {
        const area = calculateAreaFromQuantity(item.quantity, product.area_per_box);
        updatedItems[index] = {
          ...updatedItems[index],
          purchase_type: purchaseType,
          area: area,
        };
      } else {
        const quantity = calculateQuantityFromArea(item.area, product.area_per_box);
        updatedItems[index] = {
          ...updatedItems[index],
          purchase_type: purchaseType,
          quantity: quantity,
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        purchase_type: purchaseType,
      };
    }
    setItems(updatedItems);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const item = items[index];
    const product = products.find((p) => p.id === item.product_id);
    const updatedItems = [...items];
    if (product) {
      const area = calculateAreaFromQuantity(value, product.area_per_box);
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: value,
        area: area,
        total_price: value * item.unit_price,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: value,
        total_price: value * item.unit_price,
      };
    }
    setItems(updatedItems);
  };

  const handleAreaChange = (index: number, value: number) => {
    const item = items[index];
    const product = products.find((p) => p.id === item.product_id);
    const updatedItems = [...items];
    if (product) {
      const quantity = calculateQuantityFromArea(value, product.area_per_box);
      updatedItems[index] = {
        ...updatedItems[index],
        area: value,
        quantity: quantity,
        total_price: quantity * item.unit_price,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        area: value,
        total_price: value * item.unit_price,
      };
    }
    setItems(updatedItems);
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
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
                      <Label htmlFor="customer">Select Customer</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sharma">
                            Sharma Construction
                          </SelectItem>
                          <SelectItem value="modern">
                            Modern Interiors
                          </SelectItem>
                          <SelectItem value="elite">Elite Builders</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gst">Customer GST Number</Label>
                      <Input id="gst" placeholder="27AABCS1234C1Z5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Billing Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter customer billing address"
                      rows={3}
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
                        <TableHead>Area (m²)</TableHead>
                        <TableHead>Boxes</TableHead>
                        <TableHead>Rate/Box</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Select>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ceramic">
                                Ceramic Floor Tiles
                              </SelectItem>
                              <SelectItem value="vitrified">
                                Vitrified Tiles
                              </SelectItem>
                              <SelectItem value="wall">Wall Tiles</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="14.4"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="10"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="1200"
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹12,000</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Minus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Button variant="outline" className="mt-4">
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
                      <Button className="w-full">Calculate</Button>
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
                      <span>₹12,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (9%):</span>
                      <span>₹1,080</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9%):</span>
                      <span>₹1,080</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹14,160</span>
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
                    <Label>Payment Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea placeholder="Additional notes..." rows={3} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Invoice
                </Button>
                <Button variant="outline" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Save & Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
