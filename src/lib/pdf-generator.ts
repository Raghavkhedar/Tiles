import { InvoiceWithRelations } from '@/types/database';

interface PDFGeneratorOptions {
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessGST?: string;
  businessPAN?: string;
}

export async function generateInvoicePDF(
  invoice: InvoiceWithRelations,
  options: PDFGeneratorOptions = {}
) {
  // Convert InvoiceWithRelations to InvoiceData format
  const invoiceData = {
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    payment_terms: invoice.payment_terms,
    status: invoice.status,
    subtotal: invoice.subtotal,
    discount_amount: invoice.discount_amount,
    cgst_amount: invoice.cgst_amount,
    sgst_amount: invoice.sgst_amount,
    igst_amount: invoice.igst_amount,
    total_amount: invoice.total_amount,
    customer: invoice.customer || {
      name: '',
      contact_person: null,
      phone: null,
      email: null,
      address: null,
      city: null,
      state: null,
      pincode: null,
      gst_number: null
    },
    items: invoice.items || [],
    notes: invoice.notes || undefined,
    terms_conditions: invoice.terms_conditions || undefined
  };

  // Create business info from options or use default config
  const businessInfo = {
    name: options.businessName || 'TileManager Pro',
    address: options.businessAddress || '123 Business Street, Commercial Area, Your City - 123456',
    phone: options.businessPhone || '+91 98765 43210',
    email: options.businessEmail || 'info@tilemanagerpro.com',
    gst_number: options.businessGST || '27ABCDE1234F1Z5',
    pan_number: options.businessPAN || 'ABCDE1234F'
  };

  // Generate the professional invoice
  const module = await import('./invoice-generator');
  const generator = new module.ProfessionalInvoiceGenerator();
  await generator.generateInvoice(invoiceData, businessInfo);
  return generator;
}

export async function downloadInvoicePDF(
  invoice: InvoiceWithRelations,
  options: PDFGeneratorOptions = {}
) {
  try {
    // Convert InvoiceWithRelations to InvoiceData format
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      payment_terms: invoice.payment_terms,
      status: invoice.status,
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      cgst_amount: invoice.cgst_amount,
      sgst_amount: invoice.sgst_amount,
      igst_amount: invoice.igst_amount,
      total_amount: invoice.total_amount,
      customer: invoice.customer || {
        name: '',
        contact_person: null,
        phone: null,
        email: null,
        address: null,
        city: null,
        state: null,
        pincode: null,
        gst_number: null
      },
      items: invoice.items || [],
      notes: invoice.notes || undefined,
      terms_conditions: invoice.terms_conditions || undefined
    };

    // Create business info from options or use default config
    const businessInfo = {
      name: options.businessName || 'TileManager Pro',
      address: options.businessAddress || '123 Business Street, Commercial Area, Your City - 123456',
      phone: options.businessPhone || '+91 98765 43210',
      email: options.businessEmail || 'info@tilemanagerpro.com',
      gst_number: options.businessGST || '27ABCDE1234F1Z5',
      pan_number: options.businessPAN || 'ABCDE1234F'
    };

    // Generate and download the professional invoice
    const module = await import('./invoice-generator');
    const generator = new module.ProfessionalInvoiceGenerator();
    await generator.generateInvoice(invoiceData, businessInfo);
    generator.save(`Invoice-${invoice.invoice_number}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Function to get business settings for PDF generation
export async function getBusinessSettingsForPDF() {
  try {
    const { getSettings } = await import('@/app/actions/settings');
    const result = await getSettings();
    
    if (result.success && result.data) {
      return {
        businessName: result.data.business_name || 'TileManager Pro',
        businessAddress: result.data.business_address || '',
        businessPhone: result.data.business_phone || '',
        businessEmail: result.data.business_email || '',
        businessGST: result.data.gst_number || '',
        businessPAN: result.data.pan_number || ''
      };
    }
    
    return {
      businessName: 'TileManager Pro',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      businessGST: '',
      businessPAN: ''
    };
  } catch (error) {
    console.error('Error getting business settings:', error);
    return {
      businessName: 'TileManager Pro',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      businessGST: '',
      businessPAN: ''
    };
  }
} 