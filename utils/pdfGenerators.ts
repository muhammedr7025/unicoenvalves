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
    email: 'info@unicorn-valves.com',
    location: 'Coimbatore, INDIA',
};

// Helper function to format currency
const formatINR = (amount: number): string => {
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format date
const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

// Add company header to page
const addCompanyHeader = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add logo placeholder (purple box)
    doc.setFillColor(77, 45, 132);
    doc.rect(pageWidth - 150, 20, 120, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('UNICORN', pageWidth - 140, 45);
    doc.setFontSize(12);
    doc.text('VALVES', pageWidth - 135, 58);

    // Company address header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const headerLines = [
        COMPANY.name,
        COMPANY.address,
        COMPANY.city,
        `${COMPANY.phone} | ${COMPANY.email}`,
        COMPANY.website
    ];
    doc.text(headerLines, pageWidth / 2, 15, { align: 'center' });
};

// Add footer to page
const addFooter = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(8);
    doc.setTextColor(139, 0, 0);
    const footerText = [
        COMPANY.name,
        COMPANY.address,
        `${COMPANY.city} | ${COMPANY.phone}`,
        COMPANY.website
    ];
    doc.text(footerText, pageWidth / 2, pageHeight - 35, { align: 'center' });
};

// ==================== 1. OFFER COVER LETTER HEAD ====================
export function generateOfferCoverLetter(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 0;

    addCompanyHeader(doc);

    // Date and location
    yPos = 90;
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
    if (customerDetails.address) {
        doc.text(customerDetails.address, 50, yPos);
        yPos += 15;
    }
    if (customerDetails.city) {
        doc.text(customerDetails.city, 50, yPos);
        yPos += 15;
    }
    if (customerDetails.state) {
        doc.text(customerDetails.state, 50, yPos);
        yPos += 15;
    }
    if (customerDetails.country) {
        doc.text(customerDetails.country, 50, yPos);
        yPos += 15;
    }

    // Salutation
    yPos += 20;
    doc.text('Sir,', 50, yPos);

    // Reference
    yPos += 25;
    doc.setFont('helvetica', 'bold');
    doc.text('Ref:', 50, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.enquiryId || 'N/A', 80, yPos);

    // Project
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Project:', 50, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.projectName || 'N/A', 105, yPos);

    // Body text
    yPos += 30;
    const bodyText = `We thank you for the above referred RFQ, and are pleased to submit our offer with Reference: ${quote.quoteNumber}, Dt. ${formatDate(quote.createdAt)}.`;
    const bodyLines = doc.splitTextToSize(bodyText, pageWidth - 100);
    doc.text(bodyLines, 50, yPos);
    yPos += bodyLines.length * 15;

    // Offer comprises
    yPos += 30;
    doc.text('Our Offer comprises of the following:', 50, yPos);
    yPos += 25;
    doc.text('1.  Covering Letter', 70, yPos);
    yPos += 20;
    doc.text('2.  Priced Bid with Commercial Terms and Conditions', 70, yPos);
    yPos += 20;
    doc.text('3.  Technical Bid', 70, yPos);

    // Closing
    yPos += 35;
    const closingText = 'Trust our offer is in line with your requirement. Should you require any further clarification, please feel free to call on the undersigned.';
    const closingLines = doc.splitTextToSize(closingText, pageWidth - 100);
    doc.text(closingLines, 50, yPos);
    yPos += closingLines.length * 15;

    yPos += 30;
    doc.text('We now look forward to the pleasure of receiving the valuable order.', 50, yPos);

    // Signature
    yPos += 40;
    doc.setFont('helvetica', 'bold');
    doc.text('Thanking you,', 50, yPos);

    yPos += 30;
    doc.text(quote.createdByName || 'Sales Team', 50, yPos);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering | Internal Sales/Marketing Department', 50, yPos);
    yPos += 15;
    doc.text('Unicorn Valves Private Limited', 50, yPos);

    addFooter(doc);

    // Save PDF
    doc.save(`${quote.quoteNumber}_Cover_Letter.pdf`);
}

// ==================== 2. PRICE SUMMARY ====================
export function generatePriceSummary(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 0;

    addCompanyHeader(doc);

    // Title
    yPos = 80;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Price Summary for Control Valves & Accessories', pageWidth / 2, yPos, { align: 'center' });

    // Quote details table
    yPos += 25;
    const quoteDetailsData = [
        ['Customer', customerDetails.name, 'Unicorn Ref', quote.quoteNumber],
        ['Enquiry Ref', quote.enquiryId || 'N/A', 'Date', formatDate(quote.createdAt)],
        ['Project', quote.projectName || '-', 'Revision', '0'],
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

    // Simplified Products table with comprehensive description
    const productsData = quote.products.map((product, index) => {
        // Build comprehensive description with all product details
        const descriptionLines = [
            `Series: ${product.seriesNumber}`,
            `Size: ${product.size}" | Rating: ${product.rating}`,
            `Product Type: ${product.productType || 'Control Valve'}`,
            `End Connection: ${product.bodyEndConnectType || 'N/A'}`,
            `Bonnet: ${product.bonnetType || 'N/A'}`,
            `Bonnet: ${product.bonnetType || 'N/A'}`,
        ];

        // Add optional features
        if (product.hasCage) {
            descriptionLines.push('With Cage');
        }
        if (product.hasSealRing) {
            descriptionLines.push('With Seal Ring');
        }
        if (product.hasActuator) {
            descriptionLines.push(`Actuator: ${product.actuatorType || 'Pneumatic'} - ${product.actuatorModel || ''}`);
        }

        const description = descriptionLines.join('\n');

        return [
            index + 1,
            product.productTag || '-',
            description,
            formatINR(product.unitCost || 0),
            product.quantity,
            formatINR(product.lineTotal)
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Tag No', 'Description / Specification', 'Unit Price (INR)', 'Qty', 'Total Price (INR)']],
        body: productsData,
        theme: 'grid',
        headStyles: {
            fillColor: [77, 45, 132],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            valign: 'middle'
        },
        styles: {
            fontSize: 8,
            cellPadding: 6,
            valign: 'top'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 35, valign: 'middle' },
            1: { cellWidth: 70, valign: 'middle' },
            2: { cellWidth: 210, valign: 'top' },
            3: { halign: 'right', cellWidth: 90, valign: 'middle' },
            4: { halign: 'center', cellWidth: 35, valign: 'middle' },
            5: { halign: 'right', cellWidth: 90, valign: 'middle' },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Summary table
    const packingCharges = quote.subtotal * 0.006; // 0.6% of subtotal
    const grandTotal = quote.total;

    const summaryData = [
        ['TOTAL', formatINR(quote.subtotal)],
        ['Ex-Works Price Coimbatore', ''],
        ['Packing Charges (0.6%)', formatINR(packingCharges)],
        ...(quote.packagingPrice > 0 ? [['Packaging', formatINR(quote.packagingPrice)]] : []),
        [`IGST (${quote.tax}%)`, formatINR(quote.taxAmount)],
        ['Total Ex-works Price (Excluding Freight/Insurance)', formatINR(grandTotal)],
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

    yPos = (doc as any).lastAutoTable.finalY + 25;

    // Commercial Terms
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;
    const termsData = [
        ['Prices', quote.priceType || 'Ex-Works INR each net'],
        ['Validity', quote.validity || '30 days from the date of quote'],
        ['Delivery', quote.delivery || '24 working weeks from the date of advance payment and approved technical documents (whichever comes later)'],
        ['Warranty', quote.warranty || 'UVPL Standard Warranty - 18 months from shipping or 12 months from installation (on material & workmanship)'],
        ['Payment', quote.payment || '20% with the order + 30% against drawings + Balance before shipping'],
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

    yPos = (doc as any).lastAutoTable.finalY + 35;

    // Signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('For Unicorn Valves,', 50, yPos);
    yPos += 30;
    doc.setFont('helvetica', 'bold');
    doc.text(quote.createdByName || 'Sales Team', 50, yPos);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering | Internal Sales/Marketing Department', 50, yPos);

    addFooter(doc);

    // Save PDF
    doc.save(`${quote.quoteNumber}_Price_Summary.pdf`);
}

// ==================== 3. MERGED PDF ====================
export function generateMergedPDF(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 0;

    // ==================== PAGE 1: COVER LETTER ====================
    addCompanyHeader(doc);

    // Date and location
    yPos = 90;
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
    if (customerDetails.address) {
        doc.text(customerDetails.address, 50, yPos);
        yPos += 15;
    }
    if (customerDetails.city) {
        doc.text(customerDetails.city, 50, yPos);
        yPos += 15;
    }
    if (customerDetails.state) {
        doc.text(customerDetails.state, 50, yPos);
        yPos += 15;
    }
    if (customerDetails.country) {
        doc.text(customerDetails.country, 50, yPos);
        yPos += 15;
    }

    // Salutation
    yPos += 20;
    doc.text('Sir,', 50, yPos);

    // Reference
    yPos += 25;
    doc.setFont('helvetica', 'bold');
    doc.text('Ref:', 50, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.enquiryId || 'N/A', 80, yPos);

    // Project
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Project:', 50, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.projectName || 'N/A', 105, yPos);

    // Body text
    yPos += 30;
    const bodyText = `We thank you for the above referred RFQ, and are pleased to submit our offer with Reference: ${quote.quoteNumber}, Dt. ${formatDate(quote.createdAt)}.`;
    const bodyLines = doc.splitTextToSize(bodyText, pageWidth - 100);
    doc.text(bodyLines, 50, yPos);
    yPos += bodyLines.length * 15;

    // Offer comprises
    yPos += 30;
    doc.text('Our Offer comprises of the following:', 50, yPos);
    yPos += 25;
    doc.text('1.  Covering Letter', 70, yPos);
    yPos += 20;
    doc.text('2.  Priced Bid with Commercial Terms and Conditions', 70, yPos);
    yPos += 20;
    doc.text('3.  Technical Bid', 70, yPos);

    // Closing
    yPos += 35;
    const closingText = 'Trust our offer is in line with your requirement. Should you require any further clarification, please feel free to call on the undersigned.';
    const closingLines = doc.splitTextToSize(closingText, pageWidth - 100);
    doc.text(closingLines, 50, yPos);
    yPos += closingLines.length * 15;

    yPos += 30;
    doc.text('We now look forward to the pleasure of receiving the valuable order.', 50, yPos);

    // Signature
    yPos += 40;
    doc.setFont('helvetica', 'bold');
    doc.text('Thanking you,', 50, yPos);

    yPos += 30;
    doc.text(quote.createdByName || 'Sales Team', 50, yPos);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering | Internal Sales/Marketing Department', 50, yPos);
    yPos += 15;
    doc.text('Unicorn Valves Private Limited', 50, yPos);

    addFooter(doc);

    // ==================== PAGE 2: PRICE SUMMARY ====================
    doc.addPage();
    yPos = 0;

    addCompanyHeader(doc);

    // Title
    yPos = 80;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Price Summary for Control Valves & Accessories', pageWidth / 2, yPos, { align: 'center' });

    // Quote details table
    yPos += 25;
    const quoteDetailsData = [
        ['Customer', customerDetails.name, 'Unicorn Ref', quote.quoteNumber],
        ['Enquiry Ref', quote.enquiryId || 'N/A', 'Date', formatDate(quote.createdAt)],
        ['Project', quote.projectName || '-', 'Revision', '0'],
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

    // Simplified Products table with comprehensive description
    const productsDataMerged = quote.products.map((product, index) => {
        // Build comprehensive description with all product details
        const descriptionLinesMerged = [
            `Series: ${product.seriesNumber}`,
            `Size: ${product.size}" | Rating: ${product.rating}`,
            `Product Type: ${product.productType || 'Control Valve'}`,
            `End Connection: ${product.bodyEndConnectType || 'N/A'}`,
            `Bonnet: ${product.bonnetType || 'N/A'}`,
            `Bonnet: ${product.bonnetType || 'N/A'}`,
        ];

        // Add optional features
        if (product.hasCage) {
            descriptionLinesMerged.push('With Cage');
        }
        if (product.hasSealRing) {
            descriptionLinesMerged.push('With Seal Ring');
        }
        if (product.hasActuator) {
            descriptionLinesMerged.push(`Actuator: ${product.actuatorType || 'Pneumatic'} - ${product.actuatorModel || ''}`);
        }

        const descriptionMerged = descriptionLinesMerged.join('\n');

        return [
            index + 1,
            product.productTag || '-',
            descriptionMerged,
            formatINR(product.unitCost || 0),
            product.quantity,
            formatINR(product.lineTotal)
        ];

    });

    autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Tag No', 'Description / Specification', 'Unit Price (INR)', 'Qty', 'Total Price (INR)']],
        body: productsDataMerged,
        theme: 'grid',
        headStyles: {
            fillColor: [77, 45, 132],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            valign: 'middle'
        },
        styles: {
            fontSize: 8,
            cellPadding: 6,
            valign: 'top'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 35, valign: 'middle' },
            1: { cellWidth: 70, valign: 'middle' },
            2: { cellWidth: 210, valign: 'top' },
            3: { halign: 'right', cellWidth: 90, valign: 'middle' },
            4: { halign: 'center', cellWidth: 35, valign: 'middle' },
            5: { halign: 'right', cellWidth: 90, valign: 'middle' },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Summary table
    const packingCharges = quote.subtotal * 0.006; // 0.6% of subtotal
    const grandTotal = quote.total;

    const summaryData = [
        ['TOTAL', formatINR(quote.subtotal)],
        ['Ex-Works Price Coimbatore', ''],
        ['Packing Charges (0.6%)', formatINR(packingCharges)],
        ...(quote.packagingPrice > 0 ? [['Packaging', formatINR(quote.packagingPrice)]] : []),
        [`IGST (${quote.tax}%)`, formatINR(quote.taxAmount)],
        ['Total Ex-works Price (Excluding Freight/Insurance)', formatINR(grandTotal)],
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

    yPos = (doc as any).lastAutoTable.finalY + 25;

    // Commercial Terms
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;
    const termsData = [
        ['Prices', quote.priceType || 'Ex-Works INR each net'],
        ['Validity', quote.validity || '30 days from the date of quote'],
        ['Delivery', quote.delivery || '24 working weeks from the date of advance payment and approved technical documents (whichever comes later)'],
        ['Warranty', quote.warranty || 'UVPL Standard Warranty - 18 months from shipping or 12 months from installation (on material & workmanship)'],
        ['Payment', quote.payment || '20% with the order + 30% against drawings + Balance before shipping'],
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

    yPos = (doc as any).lastAutoTable.finalY + 35;

    // Signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('For Unicorn Valves,', 50, yPos);
    yPos += 30;
    doc.setFont('helvetica', 'bold');
    doc.text(quote.createdByName || 'Sales Team', 50, yPos);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Assistant Manager - Application Engineering | Internal Sales/Marketing Department', 50, yPos);

    addFooter(doc);

    // Save merged PDF
    doc.save(`${quote.quoteNumber}_Complete.pdf`);
}
