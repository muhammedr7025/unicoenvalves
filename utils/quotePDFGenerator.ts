import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote } from '@/types';

// Company information
const COMPANY = {
  name: 'Unicorn Valves Private Limited',
  address: 'SF No : 100/2B, Valukkuparai P.O., Marichettipathy Road, Nachipalayam,',
  city: 'Madukkarai Taluk, Coimbatore – 641032, Tamil Nadu, India',
  phone: 'Ph No. +91-422-2901322',
  website: 'www.unicorn-valves.com',
  location: 'Coimbatore, INDIA',
};

// Helper function to format currency
const formatINR = (amount: number): string => {
  return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

export function generateQuotePDF(quote: Quote, customerDetails: any) {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 0;

  // ==================== PAGE 1: COVER LETTER ====================
  
  // Add logo placeholder (you can replace with actual logo)
  doc.setFillColor(77, 45, 132); // Purple color
  doc.rect(pageWidth - 150, 30, 120, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('UNICORN', pageWidth - 140, 55);
  doc.setFontSize(12);
  doc.text('VALVES', pageWidth - 135, 68);

  // Company address header
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const headerText = `${COMPANY.name}, ${COMPANY.address}\n${COMPANY.city}, ${COMPANY.phone}\n${COMPANY.website}`;
  doc.text(headerText, pageWidth / 2, 20, { align: 'center' });

  // Date and location
  yPos = 100;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY.location, 50, yPos);
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quote.createdAt), 50, yPos);

  // Customer details
  yPos += 30;
  doc.setFont('helvetica', 'bold');
  doc.text(customerDetails.name.toUpperCase(), 50, yPos);
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(customerDetails.address || '', 50, yPos);
  yPos += 15;
  doc.text(customerDetails.city || '', 50, yPos);
  yPos += 15;
  doc.text(customerDetails.country || '', 50, yPos);

  // Salutation
  yPos += 30;
  doc.text('Sir', 50, yPos);

  // Reference
  yPos += 30;
  doc.setFont('helvetica', 'bold');
  doc.text('Ref:', 50, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(customerDetails.enquiryRef || 'N/A', 80, yPos);

  // Project
  yPos += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Project:', 50, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.notes || 'N/A', 100, yPos);

  // Body text
  yPos += 30;
  const bodyText = `We thank you for the above referred RFQ, and are pleased to submit our offer with\nReference: ${quote.quoteNumber}, Dt. ${formatDate(quote.createdAt)}.`;
  doc.text(bodyText, 50, yPos, { maxWidth: pageWidth - 100 });

  // Offer comprises
  yPos += 50;
  doc.text('Our Offer comprises of the following', 50, yPos);
  yPos += 25;
  doc.text('1.  Covering Letter', 70, yPos);
  yPos += 20;
  doc.text('2.  Priced Bid with Commercial Terms and Conditions', 70, yPos);
  yPos += 20;
  doc.text('3.  Technical Bid', 70, yPos);

  // Closing
  yPos += 40;
  const closingText = 'Trust our offer is in line with your requirement. Should you require any further clarification, please feel free\nto call on the undersigned.';
  doc.text(closingText, 50, yPos, { maxWidth: pageWidth - 100 });

  yPos += 50;
  doc.text('We now look forward to the pleasure of receiving the valuable order.', 50, yPos);

  // Signature
  yPos += 40;
  doc.setFont('helvetica', 'bold');
  doc.text('Thanking you', 50, yPos);

  yPos += 30;
  doc.text(quote.createdByName, 50, yPos);
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Assistant Manager - Application Engineering | Internal Sales/Marketing Department', 50, yPos);
  yPos += 15;
  doc.text('Mobile No. : 9497471386', 50, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(139, 0, 0);
  const footerText = `${COMPANY.name}, ${COMPANY.address}\n${COMPANY.city}, ${COMPANY.phone}\n${COMPANY.website}`;
  doc.text(footerText, pageWidth / 2, pageHeight - 40, { align: 'center' });

  // ==================== PAGE 2: PRICE SUMMARY ====================
  
  doc.addPage();
  yPos = 40;

  // Header with logo
  doc.setFillColor(77, 45, 132);
  doc.rect(pageWidth - 150, 20, 120, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('UNICORN', pageWidth - 140, 45);
  doc.setFontSize(12);
  doc.text('VALVES', pageWidth - 135, 58);

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Price Summary for Control Valves & Accessories', pageWidth / 2, yPos, { align: 'center' });

  // Quote details table
  yPos += 30;
  const quoteDetailsData = [
    ['Customer', customerDetails.name, 'Unicorn Ref', quote.quoteNumber],
    ['Enquiry Ref', customerDetails.enquiryRef || 'N/A', 'Date', formatDate(quote.createdAt)],
    ['Project', quote.notes || '-', 'Revision', '0'],
  ];

  autoTable(doc, {
    startY: yPos,
    body: quoteDetailsData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 200 },
      2: { fontStyle: 'bold', cellWidth: 80 },
      3: { cellWidth: 130 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Products table
  const productsData = quote.products.map((product, index) => [
    index + 1,
    product.productTag || '-',
    product.seriesNumber || 'N/A',
    formatINR(product.unitCost),
    product.quantity,
    formatINR(product.lineTotal),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item No', 'Tag No', 'Item Description', 'Unit Price (INR)', 'Qty', 'Total Price (INR)']],
    body: productsData,
    theme: 'grid',
    headStyles: { fillColor: [77, 45, 132], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 50 },
      1: { cellWidth: 80 },
      2: { cellWidth: 150 },
      3: { halign: 'right', cellWidth: 100 },
      4: { halign: 'center', cellWidth: 40 },
      5: { halign: 'right', cellWidth: 110 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Summary table
  const packingCharges = quote.subtotal * 0.006; // 0.6% of subtotal
  const grandTotal = quote.total;

  const summaryData = [
    ['TOTAL', ''],
    ['Ex-Works Price Coimbatore', formatINR(quote.subtotal)],
    ['Packing Charges', formatINR(packingCharges)],
    ['IGST(18 %)', formatINR(quote.taxAmount)],
    ['Total Ex-works Price(Excluding Freight/Insurance)', formatINR(grandTotal)],
  ];

  autoTable(doc, {
    startY: yPos,
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 400 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 130 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 30;

  // Commercial Terms
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

  yPos += 20;
  const termsData = [
    ['Prices', 'Ex-Works INR each net'],
    ['Validity', '30 days'],
    ['Delivery (Ex-Works)', '24 working weeks from the date of advance payment and approved technical documents (whichever comes later).'],
    ['Warranty', 'UVPL Standard Warranty - (18) months from shipping or (12) months from installation (on material & workmanship)'],
    ['Payment', '20% with the order + 30% against drawings + Balance before shipping.'],
    ['Shipping Dim\'s', ''],
    ['Manufacturer', 'Unicorn Valves Pvt. Ltd'],
  ];

  autoTable(doc, {
    startY: yPos,
    body: termsData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 120 },
      1: { cellWidth: 410 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 40;

  // Signature
  doc.setFontSize(10);
  doc.text('For Unicorn Valves,', 50, yPos);
  yPos += 30;
  doc.setFont('helvetica', 'bold');
  doc.text(quote.createdByName, 50, yPos);
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Assistant Manager - Application Engineering | Internal Sales/Marketing Department', 50, yPos);
  yPos += 15;
  doc.text('Mobile No. : 9497471386', 50, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(139, 0, 0);
  const footerText2 = `${COMPANY.name}, ${COMPANY.address}\n${COMPANY.city}, ${COMPANY.phone}\n${COMPANY.website}`;
  doc.text(footerText2, pageWidth / 2, pageHeight - 40, { align: 'center' });

  // Save PDF
  doc.save(`${quote.quoteNumber}.pdf`);
}