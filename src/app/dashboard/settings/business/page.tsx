"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Breadcrumb from "@/components/breadcrumb";
import { getSettings, updateSettings } from "@/app/actions/settings";
import { Setting } from "@/types/database";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface BusinessFormData {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  gst_number: string;
  pan_number: string;
  gst_rate: number;
  invoice_prefix: string;
}

export default function BusinessSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Setting | null>(null);

  const [formData, setFormData] = useState<BusinessFormData>({
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    gst_number: "",
    pan_number: "",
    gst_rate: 18,
    invoice_prefix: "INV",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await getSettings();
      if (result.success && result.data) {
        setSettings(result.data);
        setFormData({
          business_name: result.data.business_name || "",
          business_address: result.data.business_address || "",
          business_phone: result.data.business_phone || "",
          business_email: result.data.business_email || "",
          gst_number: result.data.gst_number || "",
          pan_number: result.data.pan_number || "",
          gst_rate: result.data.gst_rate || 18,
          invoice_prefix: result.data.invoice_prefix || "INV",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const updateData = {
        business_name: formData.business_name,
        business_address: formData.business_address,
        business_phone: formData.business_phone,
        business_email: formData.business_email,
        gst_number: formData.gst_number,
        pan_number: formData.pan_number,
        gst_rate: formData.gst_rate,
        invoice_prefix: formData.invoice_prefix,
      };

      if (!settings) {
        toast({
          title: "Error",
          description: "Settings not found",
          variant: "destructive",
        });
        return;
      }
      
      const result = await updateSettings(settings.id, updateData);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Business settings updated successfully",
        });
        loadSettings(); // Reload settings
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update settings",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Settings", href: "/dashboard/settings" },
            { label: "Business Settings" }
          ]} />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Business Settings
              </h1>
              <p className="text-muted-foreground">
                Configure your business information for invoices and reports
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                        placeholder="Your Business Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="business_address">Business Address</Label>
                      <Textarea
                        id="business_address"
                        value={formData.business_address}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_address: e.target.value }))}
                        placeholder="Complete business address"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="business_phone">Phone Number</Label>
                        <Input
                          id="business_phone"
                          value={formData.business_phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, business_phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <Label htmlFor="business_email">Email Address</Label>
                        <Input
                          id="business_email"
                          type="email"
                          value={formData.business_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, business_email: e.target.value }))}
                          placeholder="info@yourbusiness.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gst_number">GST Number</Label>
                        <Input
                          id="gst_number"
                          value={formData.gst_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, gst_number: e.target.value }))}
                          placeholder="27AABCS1234C1Z5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pan_number">PAN Number</Label>
                        <Input
                          id="pan_number"
                          value={formData.pan_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
                          placeholder="ABCDE1234F"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gst_rate">Default GST Rate (%)</Label>
                      <Input
                        id="gst_rate"
                        type="number"
                        value={formData.gst_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, gst_rate: Number(e.target.value) }))}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Settings */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="invoice_prefix">Invoice Number Prefix</Label>
                      <Input
                        id="invoice_prefix"
                        value={formData.invoice_prefix}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                        placeholder="INV"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        This will be used as prefix for invoice numbers (e.g., INV000001)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* PDF Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>PDF Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-card">
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-lg">{formData.business_name || "Your Business Name"}</h3>
                        {formData.business_address && (
                          <p className="text-sm text-muted-foreground mt-1">{formData.business_address}</p>
                        )}
                        {(formData.business_phone || formData.business_email) && (
                          <p className="text-sm text-muted-foreground">
                            {[formData.business_phone, formData.business_email].filter(Boolean).join(" | ")}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>This is how your business information will appear on invoice PDFs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Card>
                  <CardContent className="pt-6">
                    <Button type="submit" className="w-full" disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Business Settings"}
                    </Button>
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