import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote } from '@/types';

// Company information matching reference PDFs
const COMPANY = {
    name: 'UNICORN VALVES PRIVATE LIMITED',
    address: 'SF No: 100/2B, Valukkuparai P.O., Marichettipathy Road, Nachipalayam,',
    city: 'Madukkarai Taluk, Coimbatore - 641 032, Tamil Nadu, India.',
    phone: 'Ph No. +91-422-2901322',
    email: 'sales@unicorn-valves.com',
    website: 'www.unicorn-valves.com',
    gst: 'GSTIN: 33AAGCU9544D1ZT',
    cin: 'CIN: U29199TN2015PTC099699',
};

// Helper function to format currency
const formatINR = (amount: number): string => {
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format date
const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Function to add header to both types of PDFs
const addHeader = (doc: jsPDF, pageWidth: number) => {
    // Company name at top
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue
    doc.text(COMPANY.name, pageWidth / 2, 30, { align: 'center' });

    // Address details
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(COMPANY.address, pageWidth / 2, 40, { align: 'center' });
    doc.text(COMPANY.city, pageWidth / 2, 48, { align: 'center' });
    doc.text(`${COMPANY.phone} | ${COMPANY.email} | ${COMPANY.website}`, pageWidth / 2, 56, { align: 'center' });
    doc.text(`${COMPANY.gst} | ${COMPANY.cin}`, pageWidth / 2, 64, { align: 'center' });

    // Horizontal line under header
    doc.setDrawColor(0, 0, 139);
    doc.setLineWidth(1);
    doc.line(40, 70, pageWidth - 40, 70);
};

// Function to add footer
const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const footerY = pageHeight - 25;

    doc.text('This is a computer generated quotation and does not require signature', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`${COMPANY.name} | ${COMPANY.website}`, pageWidth / 2, footerY + 8, { align: 'center' });

    // Page number
    doc.setFontSize(8);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 50, footerY + 8);
};

// Generate Cover Letter PDF
export function generateCoverLetterPDF(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    addHeader(doc, pageWidth);

    let yPos = 90;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text('OFFER COVERING LETTER', pageWidth / 2, yPos, { align: 'center' });

    yPos += 30;

    // Date and Location (Left side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Coimbatore, INDIA', 50, yPos);
    yPos += 15;
    doc.text(`Date: ${formatDate(quote.createdAt)}`, 50, yPos);

    yPos += 30;

    // Customer Details (To Section)
    doc.setFont('helvetica', 'bold');
    doc.text('To:', 50, yPos);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.text(customerDetails.name || quote.customerName, 50, yPos);
    yPos += 15;

    if (customerDetails.address) {
        const addressLines = doc.splitTextToSize(customerDetails.address, 400);
        addressLines.forEach((line: string) => {
            doc.text(line, 50, yPos);
            yPos += 12;
        });
    }

    if (customerDetails.country) {
        doc.text(customerDetails.country, 50, yPos);
        yPos += 15;
    }

    yPos += 20;

    // Salutation
    doc.text('Dear Sir/Madam,', 50, yPos);

    yPos += 30;

    // Subject line
    doc.setFont('helvetica', 'bold');
    doc.text('Subject: Quotation for Control Valves & Accessories', 50, yPos);

    yPos += 25;

    // Reference Information
    doc.setFont('helvetica', 'normal');

    const refData = [
        ['Ref:', quote.enquiryId || 'N/A'],
        ['Quote No:', quote.quoteNumber],
        ['Project:', quote.projectName || 'N/A'],
        ['Date:', formatDate(quote.createdAt)]
    ];

    refData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 50, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 120, yPos);
        yPos += 15;
    });

    yPos += 15;

    // Body paragraph
    const bodyText = `We thank you for the above referred RFQ/Enquiry, and are pleased to submit our techno-commercial offer for your kind consideration.`;
    const bodyLines = doc.splitTextToSize(bodyText, pageWidth - 100);
    bodyLines.forEach((line: string) => {
        doc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 20;

    // Offer comprises section
    doc.setFont('helvetica', 'bold');
    doc.text('Our Offer comprises of the following:', 50, yPos);
    yPos += 20;

    doc.setFont('helvetica', 'normal');
    const offerItems = [
        '1.  Covering Letter',
        '2.  Priced Bid with Commercial Terms and Conditions',
        '3.  Technical Specifications'
    ];

    offerItems.forEach(item => {
        doc.text(item, 70, yPos);
        yPos += 18;
    });

    yPos += 20;

    // Closing paragraphs
    const closingText1 = 'We trust our offer meets your requirements. Should you require any further clarification or technical assistance, please feel free to contact the undersigned.';
    const closingLines1 = doc.splitTextToSize(closingText1, pageWidth - 100);
    closingLines1.forEach((line: string) => {
        doc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 20;

    const closingText2 = 'We look forward to receiving your valuable order and assure you of our best services at all times.';
    const closingLines2 = doc.splitTextToSize(closingText2, pageWidth - 100);
    closingLines2.forEach((line: string) => {
        doc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 30;

    // Thanking you
    doc.setFont('helvetica', 'bold');
    doc.text('Thanking you,', 50, yPos);
    yPos += 15;
    doc.text('Yours faithfully,', 50, yPos);

    yPos += 30;

    // For company
    doc.setFont('helvetica', 'bold');
    doc.text(`For ${COMPANY.name}`, 50, yPos);

    yPos += 40;

    // Signature space
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('_________________________', 50, yPos);

    yPos += 15;

    // Employee details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(quote.createdByName, 50, yPos);
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering', 50, yPos);
    yPos += 12;
    doc.text('Internal Sales/Marketing Department', 50, yPos);
    yPos += 12;
    doc.text('Mobile: +91 9497471386', 50, yPos);
    yPos += 12;
    doc.text(`Email: ${COMPANY.email}`, 50, yPos);

    addFooter(doc, pageWidth, pageHeight);

    doc.save(`${quote.quoteNumber}_CoverLetter.pdf`);
}

// Generate Price Summary PDF
export function generatePriceSummaryPDF(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    addHeader(doc, pageWidth);

    let yPos = 90;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text('PRICE SUMMARY', pageWidth / 2, yPos, { align: 'center' });
    doc.setFontSize(11);
    yPos += 18;
    doc.text('For Control Valves & Accessories', pageWidth / 2, yPos, { align: 'center' });

    yPos += 30;

    // Quote Information Box
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    const infoData = [
        ['Customer:', customerDetails.name || quote.customerName, 'Unicorn Ref:', quote.quoteNumber],
        ['Enquiry Ref:', quote.enquiryId || 'N/A', 'Date:', formatDate(quote.createdAt)],
        ['Project:', quote.projectName || '-', 'Revision:', '00'],
    ];

    autoTable(doc, {
        startY: yPos,
        body: infoData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 6,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 90, fillColor: [240, 240, 240] },
            1: { cellWidth: 190 },
            2: { fontStyle: 'bold', cellWidth: 90, fillColor: [240, 240, 240] },
            3: { cellWidth: 130 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 25;

    // Products Table Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM DETAILS', 50, yPos);

    yPos += 15;

    // Products Table
    const productsTableData = quote.products.map((product, index) => {
        // Build description
        const descParts = [];
        descParts.push(`${product.productType} Series ${product.seriesNumber}`);
        if (product.productTag) descParts.push(`Tag: ${product.productTag}`);
        descParts.push(`Size: ${product.size}, Rating: ${product.rating}`);

        return [
            (index + 1).toString(),
            product.productTag || `Item ${index + 1}`,
            descParts.join('\n'),
            formatINR(product.unitCost),
            product.quantity.toString(),
            formatINR(product.lineTotal),
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['S.No', 'Tag No.', 'Item Description', 'Unit Price\n(INR)', 'Qty', 'Total Price\n(INR)']],
        body: productsTableData,
        theme: 'grid',
        headStyles: {
            fillColor: [0, 0, 139],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            valign: 'middle',
        },
        styles: {
            fontSize: 9,
            cellPadding: 6,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 40 },
            1: { cellWidth: 80 },
            2: { cellWidth: 180 },
            3: { halign: 'right', cellWidth: 90 },
            4: { halign: 'center', cellWidth: 35 },
            5: { halign: 'right', cellWidth: 95 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Calculate pricing
    const packingCharges = quote.subtotal * 0.006; // 0.6% of subtotal

    // Summary Table (Right aligned)
    const summaryData = [
        ['Ex-Works Price (Coimbatore)', formatINR(quote.subtotal)],
        ['Packing Charges @ 0.6%', formatINR(packingCharges)],
        ['IGST @ 18%', formatINR(quote.taxAmount)],
    ];

    autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'plain',
        styles: {
            fontSize: 9.5,
            cellPadding: 5,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 400, halign: 'right' },
            1: { halign: 'right', cellWidth: 120, fontStyle: 'bold' },
        },
        margin: { left: 50 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    // Grand Total
    autoTable(doc, {
        startY: yPos,
        body: [['Total Ex-works Price (Excluding Freight/Insurance)', formatINR(quote.total)]],
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 6,
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 400, halign: 'right', fillColor: [240, 240, 240] },
            1: { halign: 'right', cellWidth: 120, fillColor: [240, 240, 240] },
        },
        margin: { left: 50 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 30;

    // Check if we need a new page
    if (yPos > pageHeight - 250) {
        doc.addPage();
        addHeader(doc, pageWidth);
        yPos = 90;
    }

    // Commercial Terms & Conditions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;

    const termsData = [
        ['Prices', 'Ex-Works INR each net'],
        ['Validity', '30 days from the date of quotation'],
        ['Delivery\n(Ex-Works)', '24 working weeks from the date of advance payment and approved technical documents (whichever comes later).'],
        ['Warranty', 'UVPL Standard Warranty - 18 months from shipping or 12 months from installation, whichever is earlier (on material & workmanship)'],
        ['Payment Terms', '20% advance with purchase order\n30% against approved drawings\nBalance before dispatch'],
        ['Freight', 'To be borne by buyer'],
        ['Insurance', 'To be arranged by buyer if required'],
        ['Manufacturer', 'Unicorn Valves Private Limited'],
    ];

    autoTable(doc, {
        startY: yPos,
        body: termsData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 5,
            lineColor: [220, 220, 220],
            lineWidth: 0.3,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 110, fillColor: [250, 250, 250] },
            1: { cellWidth: 410 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 40;

    // Check if signature fits on this page
    if (yPos > pageHeight - 150) {
        doc.addPage();
        addHeader(doc, pageWidth);
        yPos = 90;
    }

    // Signature Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('For Unicorn Valves Private Limited,', 50, yPos);

    yPos += 40;

    doc.setFont('helvetica', 'bold');
    doc.text(quote.createdByName, 50, yPos);
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering', 50, yPos);
    yPos += 12;
    doc.text('Internal Sales/Marketing Department', 50, yPos);
    yPos += 12;
    doc.text('Mobile: +91 9497471386', 50, yPos);
    yPos += 12;
    doc.text(`Email: ${COMPANY.email}`, 50, yPos);

    addFooter(doc, pageWidth, pageHeight);

    doc.save(`${quote.quoteNumber}_PriceSummary.pdf`);
}

// Generate Combined PDF (Cover Letter + Price Summary)
export function generateCombinedPDF(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ==================== PAGE 1: COVER LETTER ====================
    addHeader(doc, pageWidth);

    let yPos = 90;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text('OFFER COVERING LETTER', pageWidth / 2, yPos, { align: 'center' });

    yPos += 30;

    // Date and Location (Left side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Coimbatore, INDIA', 50, yPos);
    yPos += 15;
    doc.text(`Date: ${formatDate(quote.createdAt)}`, 50, yPos);

    yPos += 30;

    // Customer Details (To Section)
    doc.setFont('helvetica', 'bold');
    doc.text('To:', 50, yPos);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.text(customerDetails.name || quote.customerName, 50, yPos);
    yPos += 15;

    if (customerDetails.address) {
        const addressLines = doc.splitTextToSize(customerDetails.address, 400);
        addressLines.forEach((line: string) => {
            doc.text(line, 50, yPos);
            yPos += 12;
        });
    }

    if (customerDetails.country) {
        doc.text(customerDetails.country, 50, yPos);
        yPos += 15;
    }

    yPos += 20;

    // Salutation
    doc.text('Dear Sir/Madam,', 50, yPos);

    yPos += 30;

    // Subject line
    doc.setFont('helvetica', 'bold');
    doc.text('Subject: Quotation for Control Valves & Accessories', 50, yPos);

    yPos += 25;

    // Reference Information
    doc.setFont('helvetica', 'normal');

    const refData = [
        ['Ref:', quote.enquiryId || 'N/A'],
        ['Quote No:', quote.quoteNumber],
        ['Project:', quote.projectName || 'N/A'],
        ['Date:', formatDate(quote.createdAt)]
    ];

    refData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 50, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 120, yPos);
        yPos += 15;
    });

    yPos += 15;

    // Body paragraph
    const bodyText = `We thank you for the above referred RFQ/Enquiry, and are pleased to submit our techno-commercial offer for your kind consideration.`;
    const bodyLines = doc.splitTextToSize(bodyText, pageWidth - 100);
    bodyLines.forEach((line: string) => {
        doc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 20;

    // Offer comprises section
    doc.setFont('helvetica', 'bold');
    doc.text('Our Offer comprises of the following:', 50, yPos);
    yPos += 20;

    doc.setFont('helvetica', 'normal');
    const offerItems = [
        '1.  Covering Letter',
        '2.  Priced Bid with Commercial Terms and Conditions',
        '3.  Technical Specifications'
    ];

    offerItems.forEach(item => {
        doc.text(item, 70, yPos);
        yPos += 18;
    });

    yPos += 20;

    // Closing paragraphs
    const closingText1 = 'We trust our offer meets your requirements. Should you require any further clarification or technical assistance, please feel free to contact the undersigned.';
    const closingLines1 = doc.splitTextToSize(closingText1, pageWidth - 100);
    closingLines1.forEach((line: string) => {
        doc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 20;

    const closingText2 = 'We look forward to receiving your valuable order and assure you of our best services at all times.';
    const closingLines2 = doc.splitTextToSize(closingText2, pageWidth - 100);
    closingLines2.forEach((line: string) => {
        doc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 30;

    // Thanking you
    doc.setFont('helvetica', 'bold');
    doc.text('Thanking you,', 50, yPos);
    yPos += 15;
    doc.text('Yours faithfully,', 50, yPos);

    yPos += 30;

    // For company
    doc.setFont('helvetica', 'bold');
    doc.text(`For ${COMPANY.name}`, 50, yPos);

    yPos += 40;

    // Signature space
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('_________________________', 50, yPos);

    yPos += 15;

    // Employee details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(quote.createdByName, 50, yPos);
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering', 50, yPos);
    yPos += 12;
    doc.text('Internal Sales/Marketing Department', 50, yPos);
    yPos += 12;
    doc.text('Mobile: +91 9497471386', 50, yPos);
    yPos += 12;
    doc.text(`Email: ${COMPANY.email}`, 50, yPos);

    addFooter(doc, pageWidth, pageHeight);

    // ==================== PAGE 2: PRICE SUMMARY ====================
    doc.addPage();
    addHeader(doc, pageWidth);

    yPos = 90;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text('PRICE SUMMARY', pageWidth / 2, yPos, { align: 'center' });
    doc.setFontSize(11);
    yPos += 18;
    doc.text('For Control Valves & Accessories', pageWidth / 2, yPos, { align: 'center' });

    yPos += 30;

    // Quote Information Box
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    const infoData = [
        ['Customer:', customerDetails.name || quote.customerName, 'Unicorn Ref:', quote.quoteNumber],
        ['Enquiry Ref:', quote.enquiryId || 'N/A', 'Date:', formatDate(quote.createdAt)],
        ['Project:', quote.projectName || '-', 'Revision:', '00'],
    ];

    autoTable(doc, {
        startY: yPos,
        body: infoData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 6,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 90, fillColor: [240, 240, 240] },
            1: { cellWidth: 190 },
            2: { fontStyle: 'bold', cellWidth: 90, fillColor: [240, 240, 240] },
            3: { cellWidth: 130 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 25;

    // Products Table Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM DETAILS', 50, yPos);

    yPos += 15;

    // Products Table
    const productsTableData = quote.products.map((product, index) => {
        // Build description
        const descParts = [];
        descParts.push(`${product.productType} Series ${product.seriesNumber}`);
        if (product.productTag) descParts.push(`Tag: ${product.productTag}`);
        descParts.push(`Size: ${product.size}, Rating: ${product.rating}`);

        return [
            (index + 1).toString(),
            product.productTag || `Item ${index + 1}`,
            descParts.join('\n'),
            formatINR(product.unitCost),
            product.quantity.toString(),
            formatINR(product.lineTotal),
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['S.No', 'Tag No.', 'Item Description', 'Unit Price\n(INR)', 'Qty', 'Total Price\n(INR)']],
        body: productsTableData,
        theme: 'grid',
        headStyles: {
            fillColor: [0, 0, 139],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            valign: 'middle',
        },
        styles: {
            fontSize: 9,
            cellPadding: 6,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 40 },
            1: { cellWidth: 80 },
            2: { cellWidth: 180 },
            3: { halign: 'right', cellWidth: 90 },
            4: { halign: 'center', cellWidth: 35 },
            5: { halign: 'right', cellWidth: 95 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Calculate pricing
    const packingCharges = quote.subtotal * 0.006; // 0.6% of subtotal

    // Summary Table (Right aligned)
    const summaryData = [
        ['Ex-Works Price (Coimbatore)', formatINR(quote.subtotal)],
        ['Packing Charges @ 0.6%', formatINR(packingCharges)],
        ['IGST @ 18%', formatINR(quote.taxAmount)],
    ];

    autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'plain',
        styles: {
            fontSize: 9.5,
            cellPadding: 5,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 400, halign: 'right' },
            1: { halign: 'right', cellWidth: 120, fontStyle: 'bold' },
        },
        margin: { left: 50 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    // Grand Total
    autoTable(doc, {
        startY: yPos,
        body: [['Total Ex-works Price (Excluding Freight/Insurance)', formatINR(quote.total)]],
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 6,
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 400, halign: 'right', fillColor: [240, 240, 240] },
            1: { halign: 'right', cellWidth: 120, fillColor: [240, 240, 240] },
        },
        margin: { left: 50 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 30;

    // Check if we need a new page
    if (yPos > pageHeight - 250) {
        doc.addPage();
        addHeader(doc, pageWidth);
        yPos = 90;
    }

    // Commercial Terms & Conditions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;

    const termsData = [
        ['Prices', 'Ex-Works INR each net'],
        ['Validity', '30 days from the date of quotation'],
        ['Delivery\n(Ex-Works)', '24 working weeks from the date of advance payment and approved technical documents (whichever comes later).'],
        ['Warranty', 'UVPL Standard Warranty - 18 months from shipping or 12 months from installation, whichever is earlier (on material & workmanship)'],
        ['Payment Terms', '20% advance with purchase order\n30% against approved drawings\nBalance before dispatch'],
        ['Freight', 'To be borne by buyer'],
        ['Insurance', 'To be arranged by buyer if required'],
        ['Manufacturer', 'Unicorn Valves Private Limited'],
    ];

    autoTable(doc, {
        startY: yPos,
        body: termsData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 5,
            lineColor: [220, 220, 220],
            lineWidth: 0.3,
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 110, fillColor: [250, 250, 250] },
            1: { cellWidth: 410 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 40;

    // Check if signature fits on this page
    if (yPos > pageHeight - 150) {
        doc.addPage();
        addHeader(doc, pageWidth);
        yPos = 90;
    }

    // Signature Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('For Unicorn Valves Private Limited,', 50, yPos);

    yPos += 40;

    doc.setFont('helvetica', 'bold');
    doc.text(quote.createdByName, 50, yPos);
    yPos += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering', 50, yPos);
    yPos += 12;
    doc.text('Internal Sales/Marketing Department', 50, yPos);
    yPos += 12;
    doc.text('Mobile: +91 9497471386', 50, yPos);
    yPos += 12;
    doc.text(`Email: ${COMPANY.email}`, 50, yPos);

    addFooter(doc, pageWidth, pageHeight);

    doc.save(`${quote.quoteNumber}_Complete.pdf`);
}

// Export type for menu options
export type PDFExportType = 'cover' | 'pricing' | 'both';

// Main export function
export function exportQuotePDF(
    quote: Quote,
    customerDetails: any,
    exportType: PDFExportType
) {
    switch (exportType) {
        case 'cover':
            generateCoverLetterPDF(quote, customerDetails);
            break;
        case 'pricing':
            generatePriceSummaryPDF(quote, customerDetails);
            break;
        case 'both':
            generateCombinedPDF(quote, customerDetails);
            break;
    }
}
