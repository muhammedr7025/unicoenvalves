import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import { Quote, PaymentTerms } from '@/types';


// Path to Terms and Conditions PDF
const TERMS_CONDITIONS_PDF_PATH = '/3. COMMERCIAL TERMS AND CONDITIONS(MK).pdf';

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

// Helper function to format currency - no decimals for whole numbers
// Using "Rs." because jsPDF default Helvetica font doesn't support ₹ symbol
const formatINR = (amount: number): string => {
    return `Rs. ${Math.round(amount).toLocaleString('en-IN')}`;
};

// Helper function to format date
const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Helper function to format payment terms based on quote data
// Handles all edge cases:
// - Custom terms override everything
// - Advance only: advance > 0, approval = 0
// - Approval only: approval > 0, advance = 0
// - Both zero: 100% payment before dispatch
// - Both have values: show advance + approval + balance
const formatPaymentTerms = (paymentTerms?: PaymentTerms): string => {
    // If no payment terms provided, use default
    if (!paymentTerms) {
        return '100% payment before dispatch';
    }

    const { advancePercentage, approvalPercentage, customTerms } = paymentTerms;
    
    // Custom terms override everything (if provided and not empty)
    if (customTerms && customTerms.trim() !== '') {
        return customTerms.trim();
    }
    
    
    const advance = advancePercentage || 0;
    const approval = approvalPercentage || 0;
    
    // Both are zero
    if (advance === 0 && approval === 0) {
        return '100% payment before dispatch';
    }
    
    // Only advance is specified (approval is 0)
    if (advance > 0 && approval === 0) {
        const balance = 100 - advance;
        if (balance > 0) {
            return `${advance}% advance with purchase order\n${balance}% before dispatch`;
        }
        return `${advance}% advance with purchase order`;
    }
    
    // Only approval is specified (advance is 0)
    if (approval > 0 && advance === 0) {
        const balance = 100 - approval;
        if (balance > 0) {
            return `${approval}% against approved drawings\n${balance}% before dispatch`;
        }
        return `${approval}% against approved drawings`;
    }
    
    // Both have values
    const balance = 100 - advance - approval;
    let terms = `${advance}% advance with purchase order\n${approval}% against approved drawings`;
    if (balance > 0) {
        terms += `\n${balance}% before dispatch`;
    }
    return terms;

};


// Function to add header with logo on top right
// showTitle: if false, only shows logo and line (for cover letter)
const addHeader = async (doc: jsPDF, pageWidth: number, logoBase64?: string, showTitle: boolean = true) => {
    // Add logo on top right if available
    if (logoBase64) {
        try {
            // Logo dimensions - adjust as needed
            const logoWidth = 80;
            const logoHeight = 40;
            const logoX = pageWidth - 40 - logoWidth; // 40pt from right edge
            const logoY = 15;
            doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (error) {
            console.error('Error adding logo to PDF:', error);
        }
    }

    // Title - centered (only for price summary and combined PDFs)
    if (showTitle) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 139); // Dark blue
        doc.text('Price Summary for Control Valves & Accessories', pageWidth / 2, 35, { align: 'center' });
    }

    // Horizontal line under header
    doc.setDrawColor(0, 0, 139);
    doc.setLineWidth(0.5);
    doc.line(40, 55, pageWidth - 40, 55);
};


// Synchronous version for backward compatibility
const addHeaderSync = (doc: jsPDF, pageWidth: number) => {
    // Title - centered
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark blue
    doc.text('Price Summary for Control Valves & Accessories', pageWidth / 2, 35, { align: 'center' });

    // Horizontal line under header
    doc.setDrawColor(0, 0, 139);
    doc.setLineWidth(0.5);
    doc.line(40, 55, pageWidth - 40, 55);
};

// Function to add footer with company address (like reference PDF)
const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    const footerY = pageHeight - 40;

    // Company name and address in red/dark red
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 0, 0); // Dark red
    doc.text('Unicorn Valves Private Limited', pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.text(
        'SF No : 100/2B, Valukkuparai P.O., Marichettipathy Road, Nachipalayam,',
        pageWidth / 2,
        footerY + 10,
        { align: 'center' }
    );
    doc.text(
        'Madukkarai Taluk, Coimbatore – 641032, Tamil Nadu, India, Ph No. +91-422-2901322',
        pageWidth / 2,
        footerY + 18,
        { align: 'center' }
    );
    
    // Website
    doc.setTextColor(0, 0, 139); // Blue for website
    doc.text('www.unicorn-valves.com', pageWidth / 2, footerY + 26, { align: 'center' });
};

// Helper function to load logo as base64
const loadLogoBase64 = async (): Promise<string | undefined> => {
    try {
        // In browser environment, fetch the logo
        const response = await fetch('/unicorn-valves-logo.png');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(undefined);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading logo:', error);
        return undefined;
    }
};

// Helper function to load Terms & Conditions PDF as ArrayBuffer
const loadTermsConditionsPDF = async (): Promise<ArrayBuffer | undefined> => {
    try {
        const response = await fetch(TERMS_CONDITIONS_PDF_PATH);
        if (!response.ok) {
            console.error('Failed to load Terms & Conditions PDF:', response.statusText);
            return undefined;
        }
        return await response.arrayBuffer();
    } catch (error) {
        console.error('Error loading Terms & Conditions PDF:', error);
        return undefined;
    }
};

// Helper function to merge jsPDF document with Terms & Conditions PDF
const mergePDFWithTermsConditions = async (jsPdfDoc: jsPDF): Promise<Uint8Array> => {
    // Convert jsPDF to ArrayBuffer
    const jsPdfArrayBuffer = jsPdfDoc.output('arraybuffer');
    
    // Load the Terms & Conditions PDF
    const tcPdfArrayBuffer = await loadTermsConditionsPDF();
    
    if (!tcPdfArrayBuffer) {
        // If T&C PDF fails to load, return the original PDF
        console.warn('Terms & Conditions PDF not found, returning original PDF');
        return new Uint8Array(jsPdfArrayBuffer);
    }
    
    // Create PDFDocument instances
    const mainPdf = await PDFDocument.load(jsPdfArrayBuffer);
    const tcPdf = await PDFDocument.load(tcPdfArrayBuffer);
    
    // Copy all pages from T&C PDF to main PDF
    const tcPageCount = tcPdf.getPageCount();
    const copiedPages = await mainPdf.copyPages(tcPdf, Array.from({ length: tcPageCount }, (_, i) => i));
    
    copiedPages.forEach((page) => {
        mainPdf.addPage(page);
    });
    
    // Return merged PDF bytes
    return await mainPdf.save();
};

// Helper function to merge PDFs for combined document (Cover Letter + Price Summary + T&C)
const createCombinedPDFWithTermsConditions = async (
    coverLetterPdf: jsPDF,
    priceSummaryPdf: jsPDF
): Promise<Uint8Array> => {
    // Convert jsPDFs to ArrayBuffers
    const coverLetterArrayBuffer = coverLetterPdf.output('arraybuffer');
    const priceSummaryArrayBuffer = priceSummaryPdf.output('arraybuffer');
    
    // Load the Terms & Conditions PDF
    const tcPdfArrayBuffer = await loadTermsConditionsPDF();
    
    // Create final merged PDF
    const finalPdf = await PDFDocument.create();
    
    // Load cover letter PDF and add all its pages
    const coverPdf = await PDFDocument.load(coverLetterArrayBuffer);
    const coverPages = await finalPdf.copyPages(coverPdf, coverPdf.getPageIndices());
    coverPages.forEach((page) => finalPdf.addPage(page));
    
    // Load price summary PDF and add all its pages
    const pricePdf = await PDFDocument.load(priceSummaryArrayBuffer);
    const pricePages = await finalPdf.copyPages(pricePdf, pricePdf.getPageIndices());
    pricePages.forEach((page) => finalPdf.addPage(page));
    
    // Add Terms & Conditions PDF pages at the end (if available)
    if (tcPdfArrayBuffer) {
        const tcPdf = await PDFDocument.load(tcPdfArrayBuffer);
        const tcPages = await finalPdf.copyPages(tcPdf, tcPdf.getPageIndices());
        tcPages.forEach((page) => finalPdf.addPage(page));
    } else {
        console.warn('Terms & Conditions PDF not found for combined document');
    }
    
    return await finalPdf.save();
};

// Helper function to download PDF bytes
const downloadPDFBytes = (pdfBytes: Uint8Array, filename: string) => {
    // Convert Uint8Array to ArrayBuffer properly for Blob creation
    const blob = new Blob([pdfBytes.slice().buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Generate Cover Letter PDF
export async function generateCoverLetterPDF(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load logo
    const logoBase64 = await loadLogoBase64();

    // Add header with logo only (no title for cover letter)
    await addHeader(doc, pageWidth, logoBase64, false);

    let yPos = 70;

    // Date and Location (Left side) - no title for cover letter
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Coimbatore, INDIA', 50, yPos);
    yPos += 15;
    doc.text(`Date: ${formatDate(quote.createdAt)}`, 50, yPos);

    yPos += 30;


    // Customer Details (To Section)
    doc.setFont('helvetica', 'bold');
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

    // Merge with Terms & Conditions PDF and download
    const mergedPdfBytes = await mergePDFWithTermsConditions(doc);
    downloadPDFBytes(mergedPdfBytes, `${quote.quoteNumber}_CoverLetter.pdf`);
}

// Generate Price Summary PDF
export async function generatePriceSummaryPDF(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load logo
    const logoBase64 = await loadLogoBase64();

    // Add header with logo
    await addHeader(doc, pageWidth, logoBase64);

    let yPos = 70;

    // Quote Information Box (no separate title needed, header has it)
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
            fontSize: 8.5,
            cellPadding: 5,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            overflow: 'linebreak',
            cellWidth: 'wrap',
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 35 },
            1: { halign: 'left', cellWidth: 60 },
            2: { halign: 'left', cellWidth: 175 },
            3: { halign: 'left', cellWidth: 105 },
            4: { halign: 'left', cellWidth: 30 },
            5: { halign: 'left', cellWidth: 100 },
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Calculate pricing - use stored packagePrice from quote
    const packingCharges = quote.packagePrice || 0;

    // TOTAL row - centered header spanning full width
    // Using explicit tableWidth: 515 to match products table exactly (35+70+200+85+30+95)
    autoTable(doc, {
        startY: yPos,
        body: [['TOTAL']],
        theme: 'grid',
        tableWidth: 515, // Explicit width matching products table
        styles: {
            fontSize: 8,
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            fontStyle: 'bold',
            halign: 'center',
            fillColor: [240, 240, 240],
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY;

    // Summary rows - TRUE 2-column layout
    // Col 0: 420pt (matches first 5 product cols: 35+70+200+85+30)
    // Col 1: 95pt (matches Total Price column)
    // Total: 515pt
    const isFOR = quote.pricingType === 'F.O.R.';
    const freightCharges = quote.freightPrice || 0;
    
    // Build summary rows based on pricing type
    const summaryRows: string[][] = [];
    
    // Show price label based on pricing type
    const priceLabel = isFOR ? 'F.O.R. Price Coimbatore' : 'Ex-Works Price Coimbatore';
    summaryRows.push([priceLabel, formatINR(quote.subtotal)]);
    
    // For F.O.R., add freight charges as a separate row
    if (isFOR && freightCharges > 0) {
        summaryRows.push(['Freight Charges', formatINR(freightCharges)]);
    }
    
    summaryRows.push(['Packing Charges', formatINR(packingCharges)]);
    summaryRows.push([`IGST(${quote.tax || 18} %)`, formatINR(quote.taxAmount)]);



    autoTable(doc, {
        startY: yPos,
        body: summaryRows,
        theme: 'grid',
        tableWidth: 515, // Explicit width
        styles: {
            fontSize: 8,
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            overflow: 'ellipsize',
        },
        columnStyles: {
            0: { cellWidth: 405, halign: 'left' },
            1: { cellWidth: 110, halign: 'left', fontStyle: 'bold' },
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY;

    // Grand Total row - highlighted
    // For F.O.R., freight is included but insurance is excluded; for Ex-Works, both are excluded
    const grandTotalLabel = isFOR 
        ? 'Total F.O.R. Price (Excluding Insurance)' 
        : 'Total Ex-works Price(Excluding Freight/Insurance)';
    const grandTotalValue = isFOR ? quote.total + freightCharges : quote.total;

    
    autoTable(doc, {
        startY: yPos,
        body: [[grandTotalLabel, formatINR(grandTotalValue)]],
        theme: 'grid',
        tableWidth: 515, // Explicit width
        styles: {
            fontSize: 8,
            cellPadding: 4,
            fontStyle: 'bold',
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            overflow: 'ellipsize',
        },
        columnStyles: {
            0: { cellWidth: 405, halign: 'left', fillColor: [240, 240, 240] },
            1: { cellWidth: 110, halign: 'left', fillColor: [240, 240, 240] },
        },
        margin: { left: 40, right: 40 },
    });


    yPos = (doc as any).lastAutoTable.finalY + 30;

    // Check if we need a new page
    if (yPos > pageHeight - 250) {
        doc.addPage();
        await addHeader(doc, pageWidth, logoBase64);
        yPos = 70;
    }

    // Commercial Terms & Conditions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;

    // Build terms data based on pricing type
    const termsData: string[][] = [
        ['Prices', `${quote.pricingType || 'Ex-Works'} INR each net`],
        ['Validity', `${quote.validity || '30 days'} from the date of quotation`],
        // For F.O.R., show just "Delivery"; for Ex-Works, show "Delivery (Ex-Works)"
        [isFOR ? 'Delivery' : 'Delivery\n(Ex-Works)', quote.deliveryDays || '24 working weeks from the date of advance payment and approved technical documents (whichever comes later).'],
        ['Warranty', `UVPL Standard Warranty - ${quote.warrantyTerms?.shipmentDays || 18} months from shipping or ${quote.warrantyTerms?.installationDays || 12} months from installation, whichever is earlier (on material & workmanship)`],
        ['Payment Terms', formatPaymentTerms(quote.paymentTerms)],
    ];
    
    // Only show Freight row if NOT F.O.R. (since freight is included in F.O.R.)
    if (!isFOR) {
        termsData.push(['Freight', 'To be borne by buyer']);
    }
    
    termsData.push(['Insurance', 'To be arranged by buyer']);
    termsData.push(['Manufacturer', 'Unicorn Valves Private Limited']);



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
        await addHeader(doc, pageWidth, logoBase64);
        yPos = 70;
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

// Generate Combined PDF (Cover Letter + Terms & Conditions + Price Summary)
export async function generateCombinedPDF(quote: Quote, customerDetails: any) {
    // Load logo once for all pages
    const logoBase64 = await loadLogoBase64();
    
    // ==================== Create Cover Letter PDF ====================
    const coverLetterDoc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = coverLetterDoc.internal.pageSize.getWidth();
    const pageHeight = coverLetterDoc.internal.pageSize.getHeight();
    
    // Add header with logo only (no title for cover letter)
    await addHeader(coverLetterDoc, pageWidth, logoBase64, false);

    let yPos = 70;

    // Date and Location (Left side) - no title for cover letter
    coverLetterDoc.setFontSize(10);
    coverLetterDoc.setFont('helvetica', 'normal');
    coverLetterDoc.setTextColor(0, 0, 0);
    coverLetterDoc.text('Coimbatore, INDIA', 50, yPos);
    yPos += 15;
    coverLetterDoc.text(`Date: ${formatDate(quote.createdAt)}`, 50, yPos);

    yPos += 30;


    // Customer Details (To Section)
    coverLetterDoc.setFont('helvetica', 'bold');
    yPos += 15;
    coverLetterDoc.setFont('helvetica', 'normal');
    coverLetterDoc.text(customerDetails.name || quote.customerName, 50, yPos);
    yPos += 15;

    if (customerDetails.address) {
        const addressLines = coverLetterDoc.splitTextToSize(customerDetails.address, 400);
        addressLines.forEach((line: string) => {
            coverLetterDoc.text(line, 50, yPos);
            yPos += 12;
        });
    }

    if (customerDetails.country) {
        coverLetterDoc.text(customerDetails.country, 50, yPos);
        yPos += 15;
    }

    yPos += 20;

    // Salutation
    coverLetterDoc.text('Dear Sir/Madam,', 50, yPos);

    yPos += 30;

    // Body paragraph
    const bodyText = `We thank you for the above referred RFQ/Enquiry, and are pleased to submit our techno-commercial offer for your kind consideration.`;
    const bodyLines = coverLetterDoc.splitTextToSize(bodyText, pageWidth - 100);
    bodyLines.forEach((line: string) => {
        coverLetterDoc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 20;

    // Offer comprises section
    coverLetterDoc.setFont('helvetica', 'bold');
    coverLetterDoc.text('Our Offer comprises of the following:', 50, yPos);
    yPos += 20;

    coverLetterDoc.setFont('helvetica', 'normal');
    const offerItems = [
        '1.  Covering Letter',
        '2.  Priced Bid with Commercial Terms and Conditions',
        '3.  Technical Specifications'
    ];

    offerItems.forEach(item => {
        coverLetterDoc.text(item, 70, yPos);
        yPos += 18;
    });

    yPos += 20;

    // Closing paragraphs
    const closingText1 = 'We trust our offer meets your requirements. Should you require any further clarification or technical assistance, please feel free to contact the undersigned.';
    const closingLines1 = coverLetterDoc.splitTextToSize(closingText1, pageWidth - 100);
    closingLines1.forEach((line: string) => {
        coverLetterDoc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 20;

    const closingText2 = 'We look forward to receiving your valuable order and assure you of our best services at all times.';
    const closingLines2 = coverLetterDoc.splitTextToSize(closingText2, pageWidth - 100);
    closingLines2.forEach((line: string) => {
        coverLetterDoc.text(line, 50, yPos);
        yPos += 14;
    });

    yPos += 30;

    // Thanking you
    coverLetterDoc.setFont('helvetica', 'bold');
    coverLetterDoc.text('Thanking you,', 50, yPos);
    yPos += 15;
    coverLetterDoc.text('Yours faithfully,', 50, yPos);

    yPos += 30;

    // For company
    coverLetterDoc.setFont('helvetica', 'bold');
    coverLetterDoc.text(`For ${COMPANY.name}`, 50, yPos);

    yPos += 40;

    // Signature space
    coverLetterDoc.setFont('helvetica', 'normal');
    coverLetterDoc.setFontSize(9);
    coverLetterDoc.text('_________________________', 50, yPos);

    yPos += 15;

    // Employee details
    coverLetterDoc.setFont('helvetica', 'bold');
    coverLetterDoc.setFontSize(10);
    coverLetterDoc.text(quote.createdByName, 50, yPos);
    yPos += 13;
    coverLetterDoc.setFont('helvetica', 'normal');
    coverLetterDoc.setFontSize(9);
    coverLetterDoc.text('Assistant Manager - Application Engineering', 50, yPos);
    yPos += 12;
    coverLetterDoc.text('Internal Sales/Marketing Department', 50, yPos);
    yPos += 12;
    coverLetterDoc.text('Mobile: +91 9497471386', 50, yPos);
    yPos += 12;
    coverLetterDoc.text(`Email: ${COMPANY.email}`, 50, yPos);

    addFooter(coverLetterDoc, pageWidth, pageHeight);

    // ==================== Create Price Summary PDF ====================
    const priceSummaryDoc = new jsPDF('p', 'pt', 'a4');
    const pricePageWidth = priceSummaryDoc.internal.pageSize.getWidth();
    const pricePageHeight = priceSummaryDoc.internal.pageSize.getHeight();
    
    await addHeader(priceSummaryDoc, pricePageWidth, logoBase64);

    yPos = 70;

    // Quote Information Box (title is in header)
    priceSummaryDoc.setTextColor(0, 0, 0);
    priceSummaryDoc.setFontSize(9);

    const infoData = [
        ['Customer:', customerDetails.name || quote.customerName, 'Unicorn Ref:', quote.quoteNumber],
        ['Enquiry Ref:', quote.enquiryId || 'N/A', 'Date:', formatDate(quote.createdAt)],
        ['Project:', quote.projectName || '-', 'Revision:', '00'],
    ];

    autoTable(priceSummaryDoc, {
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

    yPos = (priceSummaryDoc as any).lastAutoTable.finalY + 25;

    // Products Table Header
    priceSummaryDoc.setFontSize(11);
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text('ITEM DETAILS', 50, yPos);

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

    autoTable(priceSummaryDoc, {
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
            fontSize: 8.5,
            cellPadding: 5,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            overflow: 'linebreak',
            cellWidth: 'wrap',
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 35 },
            1: { halign: 'left', cellWidth: 60 },
            2: { halign: 'left', cellWidth: 175 },
            3: { halign: 'right', cellWidth: 105 },
            4: { halign: 'center', cellWidth: 30 },
            5: { halign: 'right', cellWidth: 110 },
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (priceSummaryDoc as any).lastAutoTable.finalY + 20;

    // Calculate pricing - use stored packagePrice from quote
    const packingCharges = quote.packagePrice || 0;

    // TOTAL row - centered header spanning full width
    autoTable(priceSummaryDoc, {
        startY: yPos,
        body: [['TOTAL']],
        theme: 'grid',
        tableWidth: 515,
        styles: {
            fontSize: 8,
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            fontStyle: 'bold',
            halign: 'center',
            fillColor: [240, 240, 240],
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (priceSummaryDoc as any).lastAutoTable.finalY;

    // Summary rows - F.O.R. vs Ex-Works pricing
    const isFORCombined = quote.pricingType === 'F.O.R.';
    const freightChargesCombined = quote.freightPrice || 0;
    
    const summaryRowsCombined: string[][] = [];
    
    // Show price label based on pricing type
    const priceLabelCombined = isFORCombined ? 'F.O.R. Price' : 'Ex-Works Price Coimbatore';
    summaryRowsCombined.push([priceLabelCombined, formatINR(quote.subtotal)]);
    
    // For F.O.R., add freight charges as a separate row
    if (isFORCombined && freightChargesCombined > 0) {
        summaryRowsCombined.push(['Freight Charges', formatINR(freightChargesCombined)]);
    }
    
    summaryRowsCombined.push(['Packing Charges', formatINR(packingCharges)]);
    summaryRowsCombined.push([`IGST(${quote.tax || 18} %)`, formatINR(quote.taxAmount)]);



    autoTable(priceSummaryDoc, {
        startY: yPos,
        body: summaryRowsCombined,
        theme: 'grid',
        tableWidth: 515,
        styles: {
            fontSize: 8,
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            overflow: 'ellipsize',
        },
        columnStyles: {
            0: { cellWidth: 405, halign: 'left' },
            1: { cellWidth: 110, halign: 'left', fontStyle: 'bold' },
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (priceSummaryDoc as any).lastAutoTable.finalY;

    // Grand Total row - highlighted
    const grandTotalLabelCombined = isFORCombined 
        ? 'Total F.O.R. Price (Excluding Insurance)' 
        : 'Total Ex-works Price(Excluding Freight/Insurance)';
    const grandTotalValueCombined = isFORCombined ? quote.total + freightChargesCombined : quote.total;
    
    autoTable(priceSummaryDoc, {
        startY: yPos,
        body: [[grandTotalLabelCombined, formatINR(grandTotalValueCombined)]],
        theme: 'grid',
        tableWidth: 515,
        styles: {
            fontSize: 8,
            cellPadding: 4,
            fontStyle: 'bold',
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            overflow: 'ellipsize',
        },
        columnStyles: {
            0: { cellWidth: 405, halign: 'left', fillColor: [240, 240, 240] },
            1: { cellWidth: 110, halign: 'left', fillColor: [240, 240, 240] },
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (priceSummaryDoc as any).lastAutoTable.finalY + 30;

    // Check if we need a new page
    if (yPos > pricePageHeight - 250) {
        priceSummaryDoc.addPage();
        await addHeader(priceSummaryDoc, pricePageWidth, logoBase64);
        yPos = 70;
    }

    // Commercial Terms & Conditions
    priceSummaryDoc.setFontSize(12);
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.setTextColor(0, 0, 139);
    priceSummaryDoc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;

    // Build terms data based on pricing type
    const termsDataCombined: string[][] = [
        ['Prices', `${quote.pricingType || 'Ex-Works'} INR each net`],
        ['Validity', `${quote.validity || '30 days'} from the date of quotation`],
        // For F.O.R., show just "Delivery"; for Ex-Works, show "Delivery (Ex-Works)"
        [isFORCombined ? 'Delivery' : 'Delivery\n(Ex-Works)', quote.deliveryDays || '24 working weeks from the date of advance payment and approved technical documents (whichever comes later).'],
        ['Warranty', `UVPL Standard Warranty - ${quote.warrantyTerms?.shipmentDays || 18} months from shipping or ${quote.warrantyTerms?.installationDays || 12} months from installation, whichever is earlier (on material & workmanship)`],
        ['Payment Terms', formatPaymentTerms(quote.paymentTerms)],
    ];
    
    // Only show Freight row if NOT F.O.R. (since freight is included in F.O.R.)
    if (!isFORCombined) {
        termsDataCombined.push(['Freight', 'To be borne by buyer']);
    }
    
    termsDataCombined.push(['Insurance', 'To be arranged by buyer']);
    termsDataCombined.push(['Manufacturer', 'Unicorn Valves Private Limited']);



    autoTable(priceSummaryDoc, {
        startY: yPos,
        body: termsDataCombined,

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

    yPos = (priceSummaryDoc as any).lastAutoTable.finalY + 40;

    // Check if signature fits on this page
    if (yPos > pricePageHeight - 150) {
        priceSummaryDoc.addPage();
        await addHeader(priceSummaryDoc, pricePageWidth, logoBase64);
        yPos = 70;
    }

    // Signature Section
    priceSummaryDoc.setFontSize(10);
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.setTextColor(0, 0, 0);
    priceSummaryDoc.text('For Unicorn Valves Private Limited,', 50, yPos);

    yPos += 40;

    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text(quote.createdByName, 50, yPos);
    yPos += 13;
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.setFontSize(9);
    priceSummaryDoc.text('Assistant Manager - Application Engineering', 50, yPos);
    yPos += 12;
    priceSummaryDoc.text('Internal Sales/Marketing Department', 50, yPos);
    yPos += 12;
    priceSummaryDoc.text('Mobile: +91 9497471386', 50, yPos);
    yPos += 12;
    priceSummaryDoc.text(`Email: ${COMPANY.email}`, 50, yPos);

    addFooter(priceSummaryDoc, pricePageWidth, pricePageHeight);

    // ==================== Merge PDFs: Cover Letter + T&C + Price Summary ====================
    const mergedPdfBytes = await createCombinedPDFWithTermsConditions(coverLetterDoc, priceSummaryDoc);
    downloadPDFBytes(mergedPdfBytes, `${quote.quoteNumber}_Complete.pdf`);
}

// Export type for menu options
export type PDFExportType = 'cover' | 'pricing' | 'both';

// Main export function
export async function exportQuotePDF(
    quote: Quote,
    customerDetails: any,
    exportType: PDFExportType
) {
    switch (exportType) {
        case 'cover':
            await generateCoverLetterPDF(quote, customerDetails);
            break;
        case 'pricing':
            await generatePriceSummaryPDF(quote, customerDetails);
            break;
        case 'both':
            await generateCombinedPDF(quote, customerDetails);
            break;
    }
}
