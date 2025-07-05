import jsPDF from 'jspdf';

// Import autoTable separately
let autoTable: any = null;

// Dynamically import autoTable to ensure it's loaded
async function loadAutoTable() {
  if (!autoTable) {
    const autoTableModule = await import('jspdf-autotable');
    autoTable = autoTableModule.default;
  }
  return autoTable;
}

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface InvoiceItem {
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percent: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
}

interface Customer {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gst_number: string | null;
}

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst_number: string;
  pan_number: string;
  logo_url?: string;
}

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  payment_terms: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  customer: Customer;
  items: InvoiceItem[];
  notes?: string;
  terms_conditions?: string;
}

class ProfessionalInvoiceGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  // Modern blue/grey color scheme
  private colors = {
    primary: [41, 98, 255] as [number, number, number], // Modern blue
    secondary: [55, 71, 79] as [number, number, number], // Dark grey
    accent: [0, 184, 212] as [number, number, number], // Cyan accent
    gray: [120, 144, 156] as [number, number, number],
    lightGray: [236, 239, 241] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    black: [33, 33, 33] as [number, number, number],
    tableStripe: [245, 248, 250] as [number, number, number],
    totalBg: [41, 98, 255] as [number, number, number],
  };

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 18;
    this.currentY = this.margin;
  }

  public async generateInvoice(invoiceData: InvoiceData, businessInfo: BusinessInfo): Promise<void> {
    if (invoiceData.status === 'Draft') {
      this.addWatermark();
    }
    this.addHeader(businessInfo);
    this.addInvoiceTitle(invoiceData);
    this.addCustomerAndInvoiceInfo(invoiceData, businessInfo);
    await this.addItemsTable(invoiceData.items);
    this.addSummarySection(invoiceData);
    this.addFooter(invoiceData, businessInfo);
    this.addPageNumbers();
  }

  private addHeader(businessInfo: BusinessInfo): void {
    // Blue header bar
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 38, 'F');
    this.doc.setTextColor(...this.colors.white);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(businessInfo.name, this.margin, 22);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(businessInfo.address, this.margin, 30);
    // Right-aligned contact info
    const rightX = this.pageWidth - this.margin;
    let y = 15;
    [
      `Phone: ${businessInfo.phone}`,
      `Email: ${businessInfo.email}`,
      `GST: ${businessInfo.gst_number}`,
      `PAN: ${businessInfo.pan_number}`
    ].forEach(line => {
      this.doc.text(line, rightX, y, { align: 'right' });
      y += 5;
    });
    this.currentY = 44;
  }

  private addInvoiceTitle(invoiceData: InvoiceData): void {
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('TAX INVOICE', this.margin, this.currentY);
    // Status badge
    this.addStatusBadge(invoiceData.status, this.pageWidth - this.margin - 38, this.currentY - 10);
    this.currentY += 14;
  }

  private addStatusBadge(status: string, x: number, y: number): void {
    const statusColors: Record<string, [number, number, number]> = {
      'Draft': this.colors.gray,
      'Sent': this.colors.primary,
      'Paid': this.colors.accent,
      'Overdue': [229, 57, 53],
      'Cancelled': [120, 144, 156]
    };
    const color = statusColors[status] || this.colors.gray;
    this.doc.setFillColor(...color);
    this.doc.roundedRect(x, y, 38, 12, 2, 2, 'F');
    this.doc.setTextColor(...this.colors.white);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(status.toUpperCase(), x + 19, y + 8, { align: 'center' });
    this.doc.setTextColor(...this.colors.black);
  }

  private addCustomerAndInvoiceInfo(invoiceData: InvoiceData, businessInfo: BusinessInfo): void {
    // Two-column layout: left = invoice info, right = customer info
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.colors.black);
    const leftX = this.margin;
    const rightX = this.pageWidth / 2 + 5;
    let y = this.currentY + 6;
    // Left column
    [
      ['Invoice Number:', invoiceData.invoice_number],
      ['Invoice Date:', this.formatDate(invoiceData.invoice_date)],
      ['Due Date:', this.formatDate(invoiceData.due_date)],
      ['Payment Terms:', invoiceData.payment_terms],
      ['Status:', invoiceData.status],
      ['Currency:', 'INR']
    ].forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, leftX, y);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, leftX + 38, y);
      y += 6;
    });
    // Right column (Customer)
    y = this.currentY + 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BILL TO', rightX, y);
    y += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(invoiceData.customer.name, rightX, y);
    y += 5;
    this.doc.setFont('helvetica', 'normal');
    if (invoiceData.customer.contact_person)
      this.doc.text(`Contact: ${invoiceData.customer.contact_person}`, rightX, y), y += 5;
    if (invoiceData.customer.phone)
      this.doc.text(`Phone: ${invoiceData.customer.phone}`, rightX, y), y += 5;
    if (invoiceData.customer.email)
      this.doc.text(`Email: ${invoiceData.customer.email}`, rightX, y), y += 5;
    if (invoiceData.customer.address)
      this.doc.text(invoiceData.customer.address, rightX, y), y += 5;
    if (invoiceData.customer.city && invoiceData.customer.state)
      this.doc.text(`${invoiceData.customer.city}, ${invoiceData.customer.state} - ${invoiceData.customer.pincode || ''}`, rightX, y), y += 5;
    if (invoiceData.customer.gst_number)
      this.doc.text(`GST: ${invoiceData.customer.gst_number}`, rightX, y), y += 5;
    this.currentY += 48;
  }

  private async addItemsTable(items: InvoiceItem[]): Promise<void> {
    const tableData = items.map(item => [
      item.product_name,
      item.product_sku || '-',
      item.quantity.toString(),
      `₹${this.formatNumber(item.unit_price)}`,
      `${item.discount_percent}%`,
      `₹${this.formatNumber(item.total_price)}`
    ]);
    const autoTableFn = await loadAutoTable();
    autoTableFn(this.doc, {
      startY: this.currentY,
      head: [['Product Description', 'SKU', 'Qty', 'Rate', 'Discount', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: this.colors.white,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0
      },
      bodyStyles: {
        fontSize: 9,
        textColor: this.colors.black,
        valign: 'middle',
        lineWidth: 0
      },
      alternateRowStyles: {
        fillColor: this.colors.tableStripe
      },
      columnStyles: {
        0: { cellWidth: 60, halign: 'left' },
        1: { cellWidth: 28, halign: 'center' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 32, halign: 'right' }
      },
      margin: { left: this.margin, right: this.margin },
      didDrawPage: (data: any) => {
        this.currentY = data.cursor?.y || this.currentY;
      }
    });
    this.currentY += 8;
  }

  private addSummarySection(invoiceData: InvoiceData): void {
    // Place summary below the table, right-aligned, with a light background
    const boxWidth = 90;
    const boxX = this.pageWidth - this.margin - boxWidth;
    let y = this.currentY + 4;
    this.doc.setFillColor(...this.colors.lightGray);
    this.doc.roundedRect(boxX, y, boxWidth, 54, 4, 4, 'F');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.colors.black);
    const summaryItems = [
      ['Subtotal:', `₹${this.formatNumber(invoiceData.subtotal)}`],
      ['Discount:', `₹${this.formatNumber(invoiceData.discount_amount)}`],
      ['CGST (9%):', `₹${this.formatNumber(invoiceData.cgst_amount)}`],
      ['SGST (9%):', `₹${this.formatNumber(invoiceData.sgst_amount)}`],
      ...(invoiceData.igst_amount > 0 ? [['IGST (18%):', `₹${this.formatNumber(invoiceData.igst_amount)}`]] : []),
    ];
    let sy = y + 10;
    summaryItems.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(label, boxX + 6, sy);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(value, boxX + boxWidth - 6, sy, { align: 'right' });
      sy += 9;
    });
    // Total
    this.doc.setFillColor(...this.colors.totalBg);
    this.doc.roundedRect(boxX, sy, boxWidth, 16, 4, 4, 'F');
    this.doc.setFontSize(12);
    this.doc.setTextColor(...this.colors.white);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TOTAL AMOUNT:', boxX + 6, sy + 11);
    this.doc.text(`₹${this.formatNumber(invoiceData.total_amount)}`, boxX + boxWidth - 6, sy + 11, { align: 'right' });
    // Amount in words
    this.currentY = sy + 28;
    this.doc.setTextColor(...this.colors.black);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Amount in words: ${this.numberToWords(invoiceData.total_amount)} Rupees Only`, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addFooter(invoiceData: InvoiceData, businessInfo: BusinessInfo): void {
    // Notes and terms
    let y = this.currentY + 6;
    if (invoiceData.notes) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.colors.secondary);
      this.doc.text('Notes:', this.margin, y);
      y += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.black);
      const notesLines = this.doc.splitTextToSize(invoiceData.notes, this.pageWidth - (2 * this.margin));
      this.doc.text(notesLines, this.margin, y);
      y += notesLines.length * 5 + 4;
    }
    if (invoiceData.terms_conditions) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.colors.secondary);
      this.doc.text('Terms & Conditions:', this.margin, y);
      y += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.black);
      const termsLines = this.doc.splitTextToSize(invoiceData.terms_conditions, this.pageWidth - (2 * this.margin));
      this.doc.text(termsLines, this.margin, y);
      y += termsLines.length * 5 + 4;
    }
    // Signature
    const sigY = Math.max(y + 10, this.pageHeight - 50);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.black);
    this.doc.text('For ' + businessInfo.name, this.pageWidth - this.margin - 60, sigY);
    this.doc.line(this.pageWidth - this.margin - 60, sigY + 12, this.pageWidth - this.margin, sigY + 12);
    this.doc.text('Authorized Signature', this.pageWidth - this.margin - 60, sigY + 18);
    // Footer
    this.doc.setDrawColor(...this.colors.lightGray);
    this.doc.line(this.margin, this.pageHeight - 24, this.pageWidth - this.margin, this.pageHeight - 24);
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.colors.gray);
    this.doc.text('This is a computer generated invoice and does not require physical signature.', this.pageWidth / 2, this.pageHeight - 16, { align: 'center' });
  }

  private addWatermark(): void {
    const watermarkText = 'DRAFT';
    this.doc.setGState && this.doc.setGState(this.doc.GState({ opacity: 0.07 }));
    this.doc.setFontSize(70);
    this.doc.setTextColor(...this.colors.gray);
    this.doc.text(watermarkText, this.pageWidth / 2, this.pageHeight / 2, {
      angle: 45,
      align: 'center'
    });
    this.doc.setGState && this.doc.setGState(this.doc.GState({ opacity: 1 }));
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.colors.black);
  }

  private addPageNumbers(): void {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...this.colors.gray);
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 8, { align: 'right' });
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private numberToWords(num: number): string {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const convertThreeDigit = (n: number): string => {
      let result = '';
      const hundreds = Math.floor(n / 100);
      const remainder = n % 100;
      if (hundreds > 0) result += ones[hundreds] + ' Hundred ';
      if (remainder >= 20) result += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10];
      else if (remainder >= 10) result += teens[remainder - 10];
      else if (remainder > 0) result += ones[remainder];
      return result.trim();
    };
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = num % 1000;
    let result = '';
    if (crores > 0) result += convertThreeDigit(crores) + ' Crore ';
    if (lakhs > 0) result += convertThreeDigit(lakhs) + ' Lakh ';
    if (thousands > 0) result += convertThreeDigit(thousands) + ' Thousand ';
    if (hundreds > 0) result += convertThreeDigit(hundreds);
    return result.trim();
  }

  public save(filename: string): void {
    this.doc.save(filename);
  }

  public output(type: 'datauri' | 'dataurl' = 'datauri'): any {
    return this.doc.output(type);
  }
}

// Easy-to-use export functions
export { ProfessionalInvoiceGenerator }; 