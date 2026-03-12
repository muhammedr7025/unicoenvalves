import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import { Quote, PaymentTerms, CustomPricingCharge } from '@/types';


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
    return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
};

// Helper: check if quote is for international (non-Indian) customer
const isInternationalQuote = (quote: Quote): boolean => {
    return !!(quote.currencyExchangeRate && quote.currencyExchangeRate > 0);
};

// Currency-aware format: shows $ (converted) for international, Rs. for Indian
const formatCurrency = (amount: number, quote: Quote): string => {
    if (isInternationalQuote(quote)) {
        const converted = Math.round(amount / quote.currencyExchangeRate!);
        return `$ ${converted.toLocaleString('en-US')}`;
    }
    return formatINR(amount);
};

// Tax label: IGST for Indian, Tax for international
const taxLabel = (quote: Quote): string => {
    return isInternationalQuote(quote) ? 'Tax' : 'IGST';
};

// Currency code: INR or USD
const currencyCode = (quote: Quote): string => {
    return isInternationalQuote(quote) ? 'USD' : 'INR';
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
        return '100% payment before despatch';
    }

    const { advancePercentage, approvalPercentage, beforeDespatchPercentage, customTerms } = paymentTerms;

    // Custom terms override everything (if provided and not empty)
    if (customTerms && customTerms.trim() !== '') {
        return customTerms.trim();
    }

    const advance = advancePercentage || 0;
    const approval = approvalPercentage || 0;
    const beforeDespatch = beforeDespatchPercentage || 0;

    // All are zero
    if (advance === 0 && approval === 0 && beforeDespatch === 0) {
        return '100% payment before despatch';
    }

    const parts: string[] = [];
    if (advance > 0) {
        parts.push(`${advance}% advance against PO`);
    }
    if (approval > 0) {
        parts.push(`${approval}% advance against approval`);
    }
    if (beforeDespatch > 0) {
        parts.push(`${beforeDespatch}% before despatch`);
    }
    return parts.join('\n');

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
        doc.setTextColor(0, 0, 0); // Black
        doc.text('Price Summary for Control Valves & Accessories', pageWidth / 2, 35, { align: 'center' });
    }

    // Horizontal line under header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(40, 55, pageWidth - 40, 55);
};


// Synchronous version for backward compatibility
const addHeaderSync = (doc: jsPDF, pageWidth: number) => {
    // Title - centered
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Price Summary for Control Valves & Accessories', pageWidth / 2, 35, { align: 'center' });

    // Horizontal line under header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(40, 55, pageWidth - 40, 55);
};

// Function to add footer with company address (like reference PDF)
const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    const footerY = pageHeight - 40;

    // Company name and address
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black
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

    // Customer info - clean text layout (no table)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const leftX = 50;
    const rightX = pageWidth / 2 + 20;
    const labelOffset = 75;
    const rightLabelOffset = 80;

    // Row 1: Customer + Unicorn Ref
    doc.setFont('helvetica', 'bold');
    doc.text('Customer:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(customerDetails.name || quote.customerName, leftX + labelOffset, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text('Unicorn Ref:', rightX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.quoteNumber, rightX + rightLabelOffset, yPos);
    yPos += 15;

    // Row 2: Enquiry Ref + Date
    doc.setFont('helvetica', 'bold');
    doc.text('Enquiry Ref:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.enquiryId || 'N/A', leftX + labelOffset, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rightX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(quote.createdAt), rightX + rightLabelOffset, yPos);
    yPos += 15;

    // Row 3: Project
    doc.setFont('helvetica', 'bold');
    doc.text('Project:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.projectName || '-', leftX + labelOffset, yPos);
    yPos += 25;

    // Products Table Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM DETAILS', 50, yPos);

    yPos += 15;

    // Products Table
    const productsTableData = quote.products.map((product, index) => {
        // Build description - values only, comma separated
        const descParts: string[] = [];
        descParts.push(`${product.seriesNumber}`);
        if (product.size) descParts.push(`${product.size}`);
        if (product.rating) descParts.push(`${product.rating}`);
        if (product.bodyEndConnectType) descParts.push(`${product.bodyEndConnectType}`);
        if (product.bodyBonnetMaterialName) descParts.push(`${product.bodyBonnetMaterialName}`);
        if (product.actuatorSeries && product.actuatorModel) {
            descParts.push(`${product.actuatorSeries}/${product.actuatorModel}`);
        }
        // Add accessories short forms
        if (product.accessories && product.accessories.length > 0) {
            const accessoryNames = product.accessories.map(a => a.title).join(', ');
            descParts.push(accessoryNames);
        }

        // Calculate unit price as lineTotal / quantity to include accessories
        const unitPrice = product.quantity > 0 ? product.lineTotal / product.quantity : product.unitCost;

        return [
            (index + 1).toString(),
            product.productTag || `Item ${index + 1}`,
            descParts.join(', '),
            formatCurrency(unitPrice, quote),
            product.quantity.toString(),
            formatCurrency(product.lineTotal, quote),
        ];

    });

    autoTable(doc, {
        startY: yPos,
        head: [['S.No', 'Tag No.', 'Item Description', `Unit Price\n(${currencyCode(quote)})`, 'Qty', `Total Price\n(${currencyCode(quote)})`]],
        body: productsTableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
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
        // Add footer row with total quantity
        foot: [[
            '', '', '',
            'Total Qty:',
            quote.products.reduce((sum, p) => sum + (p.quantity || 0), 0).toString(),
            ''
        ]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
        },
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
    const isFOR = quote.pricingType === 'F.O.R. Site' || (quote.pricingType as string) === 'F.O.R.';
    const isCustom = quote.pricingType === 'Custom';
    const freightCharges = quote.freightPrice || 0;
    const customCharges: CustomPricingCharge[] = (quote as any).customPricingCharges || [];
    const customLabel = (quote as any).customPricingLabel || 'Custom';

    // Build summary rows based on pricing type
    const summaryRows: string[][] = [];

    // Calculate actual products subtotal (before any discount)
    const productsSubtotal = quote.products.reduce((sum, p) => sum + (p.lineTotal || 0), 0);

    // Show price label based on pricing type
    const priceLabel = isFOR ? 'F.O.R. Site Price' : isCustom ? `${customLabel} Price` : 'Ex-Works Price Coimbatore';

    summaryRows.push([priceLabel, formatCurrency(productsSubtotal, quote)]);


    // For F.O.R., add freight charges as a separate row
    if (isFOR && freightCharges > 0) {
        summaryRows.push(['Freight Charges', formatCurrency(freightCharges, quote)]);
    }

    // For Custom, add each custom charge as a separate row
    if (isCustom) {
        customCharges.forEach(c => {
            if (c.price > 0) summaryRows.push([c.title || 'Custom Charge', formatCurrency(c.price, quote)]);
        });
    }

    summaryRows.push(['Packing Charges', formatCurrency(packingCharges, quote)]);

    // Discount row removed as per request


    // Only show tax for Indian customers
    if (!isInternationalQuote(quote)) {
        summaryRows.push([`${taxLabel(quote)}(${quote.tax || 18} %)`, formatCurrency(quote.taxAmount, quote)]);
    }


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
            0: { cellWidth: 385, halign: 'left' },
            1: { cellWidth: 130, halign: 'right', fontStyle: 'bold' },
        },

        margin: { left: 40, right: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY;

    // Grand Total row - highlighted
    const grandTotalLabel = isFOR
        ? 'Total F.O.R. Site Price (Excluding Insurance)'
        : isCustom
            ? `Total ${customLabel} Price (Excluding Insurance)`
            : 'Total Ex-works Price(Excluding Freight/Insurance)';
    const grandTotalValue = quote.total;


    autoTable(doc, {
        startY: yPos,
        body: [[grandTotalLabel, formatCurrency(grandTotalValue, quote)]],
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
            0: { cellWidth: 385, halign: 'left', fillColor: [240, 240, 240] },
            1: { cellWidth: 130, halign: 'right', fillColor: [240, 240, 240] },
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
    doc.setTextColor(0, 0, 0);
    doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;

    // Build terms data based on pricing type
    const termsData: string[][] = [
        ['Prices', `${quote.pricingType === 'Custom' ? ((quote as any).customPricingLabel || 'Custom') : (quote.pricingType || 'Ex-Works')} ${currencyCode(quote)} each net`],
        ['Validity', `${quote.validity || '30 days'} from the date of quotation`],
        // For F.O.R., show just "Delivery"; for Ex-Works, show "Delivery (Ex-Works)"
        [isFOR ? 'Delivery' : 'Delivery\n(Ex-Works)', `${quote.deliveryDays || '4-6'} working weeks from the date of receipt of advance payment and approved technical documents (whichever comes later)`],

        ['Warranty', `UVPL Standard Warranty - ${quote.warrantyTerms?.shipmentDays || 18} months from shipping or ${quote.warrantyTerms?.installationDays || 12} months from installation, whichever is earlier (on material & workmanship)`],
        ['Payment Terms', formatPaymentTerms(quote.paymentTerms)],
    ];

    // Only show Freight row if NOT F.O.R. and NOT Custom (freight is included for F.O.R., not applicable for Custom)
    if (!isFOR && !isCustom) {
        termsData.push(['Freight', 'To be borne by buyer']);
    }

    // Only show Insurance if NOT Custom pricing
    if (!isCustom) {
        termsData.push(['Insurance', 'To be arranged by buyer']);
    }
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

    // Customer info - clean text layout (no table)
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.setFontSize(9);
    priceSummaryDoc.setTextColor(0, 0, 0);
    const leftXCombined = 50;
    const rightXCombined = pricePageWidth / 2 + 20;
    const labelOffsetCombined = 75;
    const rightLabelOffsetCombined = 80;

    // Row 1: Customer + Unicorn Ref
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text('Customer:', leftXCombined, yPos);
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.text(customerDetails.name || quote.customerName, leftXCombined + labelOffsetCombined, yPos);
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text('Unicorn Ref:', rightXCombined, yPos);
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.text(quote.quoteNumber, rightXCombined + rightLabelOffsetCombined, yPos);
    yPos += 15;

    // Row 2: Enquiry Ref + Date
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text('Enquiry Ref:', leftXCombined, yPos);
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.text(quote.enquiryId || 'N/A', leftXCombined + labelOffsetCombined, yPos);
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text('Date:', rightXCombined, yPos);
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.text(formatDate(quote.createdAt), rightXCombined + rightLabelOffsetCombined, yPos);
    yPos += 15;

    // Row 3: Project
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text('Project:', leftXCombined, yPos);
    priceSummaryDoc.setFont('helvetica', 'normal');
    priceSummaryDoc.text(quote.projectName || '-', leftXCombined + labelOffsetCombined, yPos);
    yPos += 25;

    // Products Table Header
    priceSummaryDoc.setFontSize(11);
    priceSummaryDoc.setFont('helvetica', 'bold');
    priceSummaryDoc.text('ITEM DETAILS', 50, yPos);

    yPos += 15;

    // Products Table
    const productsTableData = quote.products.map((product, index) => {
        // Build description - values only, comma separated
        const descParts: string[] = [];
        descParts.push(`${product.seriesNumber}`);
        if (product.size) descParts.push(`${product.size}`);
        if (product.rating) descParts.push(`${product.rating}`);
        if (product.bodyEndConnectType) descParts.push(`${product.bodyEndConnectType}`);
        if (product.bodyBonnetMaterialName) descParts.push(`${product.bodyBonnetMaterialName}`);
        if (product.actuatorSeries && product.actuatorModel) {
            descParts.push(`${product.actuatorSeries}/${product.actuatorModel}`);
        }
        // Add accessories short forms
        if (product.accessories && product.accessories.length > 0) {
            const accessoryNames = product.accessories.map(a => a.title).join(', ');
            descParts.push(accessoryNames);
        }

        // Calculate unit price as lineTotal / quantity to include accessories
        const unitPrice = product.quantity > 0 ? product.lineTotal / product.quantity : product.unitCost;

        return [
            (index + 1).toString(),
            product.productTag || `Item ${index + 1}`,
            descParts.join(', '),
            formatCurrency(unitPrice, quote),
            product.quantity.toString(),
            formatCurrency(product.lineTotal, quote),
        ];

    });

    autoTable(priceSummaryDoc, {
        startY: yPos,
        head: [['S.No', 'Tag No.', 'Item Description', `Unit Price\n(${currencyCode(quote)})`, 'Qty', `Total Price\n(${currencyCode(quote)})`]],
        body: productsTableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
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
        // Add footer row with total quantity
        foot: [[
            '', '', '',
            'Total Qty:',
            quote.products.reduce((sum, p) => sum + (p.quantity || 0), 0).toString(),
            ''
        ]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
        },
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

    // Summary rows - F.O.R. vs Ex-Works vs Custom pricing
    const isFORCombined = quote.pricingType === 'F.O.R. Site' || (quote.pricingType as string) === 'F.O.R.';
    const isCustomCombined = quote.pricingType === 'Custom';
    const freightChargesCombined = quote.freightPrice || 0;
    const customChargesCombined: CustomPricingCharge[] = (quote as any).customPricingCharges || [];
    const customLabelCombined = (quote as any).customPricingLabel || 'Custom';

    const summaryRowsCombined: string[][] = [];

    // Calculate actual products subtotal (before any discount)
    const productsSubtotalCombined = quote.products.reduce((sum, p) => sum + (p.lineTotal || 0), 0);

    // Show price label based on pricing type
    const priceLabelCombined = isFORCombined ? 'F.O.R. Site Price' : isCustomCombined ? `${customLabelCombined} Price` : 'Ex-Works Price Coimbatore';
    summaryRowsCombined.push([priceLabelCombined, formatCurrency(productsSubtotalCombined, quote)]);


    // For F.O.R., add freight charges as a separate row
    if (isFORCombined && freightChargesCombined > 0) {
        summaryRowsCombined.push(['Freight Charges', formatCurrency(freightChargesCombined, quote)]);
    }

    // For Custom, add each custom charge as a separate row
    if (isCustomCombined) {
        customChargesCombined.forEach(c => {
            if (c.price > 0) summaryRowsCombined.push([c.title || 'Custom Charge', formatCurrency(c.price, quote)]);
        });
    }

    summaryRowsCombined.push(['Packing Charges', formatCurrency(packingCharges, quote)]);

    // Discount row removed as per request


    // Only show tax for Indian customers
    if (!isInternationalQuote(quote)) {
        summaryRowsCombined.push([`${taxLabel(quote)}(${quote.tax || 18} %)`, formatCurrency(quote.taxAmount, quote)]);
    }




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
        ? 'Total F.O.R. Site Price (Excluding Insurance)'
        : isCustomCombined
            ? `Total ${customLabelCombined} Price (Excluding Insurance)`
            : 'Total Ex-works Price(Excluding Freight/Insurance)';
    const grandTotalValueCombined = quote.total;

    autoTable(priceSummaryDoc, {
        startY: yPos,
        body: [[grandTotalLabelCombined, formatCurrency(grandTotalValueCombined, quote)]],
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
    priceSummaryDoc.setTextColor(0, 0, 0);
    priceSummaryDoc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;

    // Build terms data based on pricing type
    const termsDataCombined: string[][] = [
        ['Prices', `${quote.pricingType === 'Custom' ? ((quote as any).customPricingLabel || 'Custom') : (quote.pricingType || 'Ex-Works')} ${currencyCode(quote)} each net`],
        ['Validity', `${quote.validity || '30 days'} from the date of quotation`],
        // For F.O.R., show just "Delivery"; for Ex-Works, show "Delivery (Ex-Works)"
        [isFORCombined ? 'Delivery' : 'Delivery\n(Ex-Works)', `${quote.deliveryDays || '4-6'} working weeks from the date of receipt of advance payment and approved technical documents (whichever comes later)`],

        ['Warranty', `UVPL Standard Warranty - ${quote.warrantyTerms?.shipmentDays || 18} months from shipping or ${quote.warrantyTerms?.installationDays || 12} months from installation, whichever is earlier (on material & workmanship)`],
        ['Payment Terms', formatPaymentTerms(quote.paymentTerms)],
    ];

    // Only show Freight row if NOT F.O.R. and NOT Custom
    if (!isFORCombined && !isCustomCombined) {
        termsDataCombined.push(['Freight', 'To be borne by buyer']);
    }

    // Only show Insurance if NOT Custom pricing
    if (!isCustomCombined) {
        termsDataCombined.push(['Insurance', 'To be arranged by buyer']);
    }
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
export type PDFExportType = 'cover' | 'pricing' | 'both' | 'unpriced';


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
        case 'unpriced':
            await generateUnpricedSummaryPDF(quote, customerDetails);
            break;
    }
}

// Generate Unpriced Summary PDF - shows 'Quoted' instead of prices
async function generateUnpricedSummaryPDF(quote: Quote, customerDetails: any) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load logo
    const logoBase64 = await loadLogoBase64();
    await addHeader(doc, pageWidth, logoBase64);

    let yPos = 70;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('PRICE SUMMARY (UNPRICED)', pageWidth / 2, yPos, { align: 'center' });

    yPos += 30;

    // Quote Info Box
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const quoteInfoData = [
        ['Quote No:', quote.quoteNumber],
        ['Date:', formatDate(quote.createdAt)],
        ['Customer:', customerDetails?.name || quote.customerName],
        ['Project:', quote.projectName || '-'],
        ['Enquiry Ref:', quote.enquiryId || '-'],
    ];

    autoTable(doc, {
        startY: yPos,
        body: quoteInfoData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 80 },
            1: { cellWidth: 200 },
        },
        margin: { left: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // ITEM DETAILS Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ITEM DETAILS', 50, yPos);

    yPos += 15;

    // Products Table - with 'Quoted' instead of prices
    const productsTableData = quote.products.map((product, index) => {
        const descParts: string[] = [];
        descParts.push(`${product.seriesNumber}`);
        if (product.size) descParts.push(`${product.size}`);
        if (product.rating) descParts.push(`${product.rating}`);
        if (product.bodyEndConnectType) descParts.push(`${product.bodyEndConnectType}`);
        if (product.bodyBonnetMaterialName) descParts.push(`${product.bodyBonnetMaterialName}`);
        if (product.actuatorSeries && product.actuatorModel) {
            descParts.push(`${product.actuatorSeries}/${product.actuatorModel}`);
        }
        if (product.accessories && product.accessories.length > 0) {
            const accessoryNames = product.accessories.map(a => a.title).join(', ');
            descParts.push(accessoryNames);
        }

        return [
            (index + 1).toString(),
            product.productTag || `Item ${index + 1}`,
            descParts.join(', '),
            'Quoted', // Instead of unit price
            product.quantity.toString(),
            'Quoted', // Instead of total price
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['S.No', 'Tag No.', 'Item Description', `Unit Price\n(${currencyCode(quote)})`, 'Qty', `Total Price\n(${currencyCode(quote)})`]],
        body: productsTableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
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
            3: { halign: 'center', cellWidth: 105 },
            4: { halign: 'center', cellWidth: 30 },
            5: { halign: 'center', cellWidth: 100 },
        },
        margin: { left: 40, right: 40 },
        foot: [[
            '', '', '',
            'Total Qty:',
            quote.products.reduce((sum, p) => sum + (p.quantity || 0), 0).toString(),
            ''
        ]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Summary section - unpriced
    autoTable(doc, {
        startY: yPos,
        body: [['TOTAL']],
        theme: 'grid',
        tableWidth: 515,
        styles: {
            fontSize: 8,
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
            halign: 'center',
            fontStyle: 'bold',
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY;

    // Summary rows - unpriced
    const isFOR = quote.pricingType === 'F.O.R. Site' || (quote.pricingType as string) === 'F.O.R.';
    const isCustom = quote.pricingType === 'Custom';
    const customChargesUnpriced: CustomPricingCharge[] = (quote as any).customPricingCharges || [];
    const customLabelUnpriced = (quote as any).customPricingLabel || 'Custom';
    const priceLabel = isFOR ? 'F.O.R. Site Price' : isCustom ? `${customLabelUnpriced} Price` : 'Ex-Works Price Coimbatore';
    const summaryRows: string[][] = [
        [priceLabel, 'Quoted'],
    ];

    if (isFOR) {
        summaryRows.push(['Freight Charges', 'Quoted']);
    }

    if (isCustom) {
        customChargesUnpriced.forEach(c => {
            if (c.title) summaryRows.push([c.title, 'Quoted']);
        });
    }

    summaryRows.push(['Packing Charges', 'Quoted']);

    if (quote.discount > 0) {
        summaryRows.push([`Discount (${quote.discount}%)`, 'Quoted']);
    }

    // Only show tax for Indian customers
    if (!isInternationalQuote(quote)) {
        summaryRows.push([`${taxLabel(quote)}(${quote.tax || 18} %)`, 'Quoted']);
    }

    autoTable(doc, {
        startY: yPos,
        body: summaryRows,
        theme: 'grid',
        tableWidth: 515,
        styles: {
            fontSize: 8,
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { cellWidth: 385, halign: 'left' },
            1: { cellWidth: 130, halign: 'center', fontStyle: 'bold' },
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY;

    // Grand Total row
    const grandTotalLabel = isFOR
        ? 'Total F.O.R. Site Price (Excluding Insurance)'
        : isCustom
            ? `Total ${customLabelUnpriced} Price (Excluding Insurance)`
            : 'Total Ex-works Price(Excluding Freight/Insurance)';

    autoTable(doc, {
        startY: yPos,
        body: [[grandTotalLabel, 'Quoted']],
        theme: 'grid',
        tableWidth: 515,
        styles: {
            fontSize: 8,
            cellPadding: 4,
            fontStyle: 'bold',
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { cellWidth: 385, halign: 'left', fillColor: [240, 240, 240] },
            1: { cellWidth: 130, halign: 'center', fillColor: [240, 240, 240] },
        },
        margin: { left: 40, right: 40 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 40;

    // Commercial Terms & Conditions - same as priced
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('COMMERCIAL TERMS & CONDITIONS', 50, yPos);

    yPos += 20;

    // Build terms data based on pricing type
    const unpricedTermsData: string[][] = [
        ['Prices', `${quote.pricingType === 'Custom' ? ((quote as any).customPricingLabel || 'Custom') : (quote.pricingType || 'Ex-Works')} ${currencyCode(quote)} each net`],
        ['Validity', `${quote.validity || '30 days'} from the date of quotation`],
        // For F.O.R., show just "Delivery"; for Ex-Works, show "Delivery (Ex-Works)"
        [isFOR ? 'Delivery' : 'Delivery\n(Ex-Works)', `${quote.deliveryDays || '4-6'} working weeks from the date of receipt of advance payment and approved technical documents (whichever comes later)`],

        ['Warranty', `UVPL Standard Warranty - ${quote.warrantyTerms?.shipmentDays || 18} months from shipping or ${quote.warrantyTerms?.installationDays || 12} months from installation, whichever is earlier (on material & workmanship)`],
        ['Payment Terms', formatPaymentTerms(quote.paymentTerms)],
    ];

    // Only show Freight row if NOT F.O.R. and NOT Custom
    if (!isFOR && !isCustom) {
        unpricedTermsData.push(['Freight', 'To be borne by buyer']);
    }

    // Only show Insurance if NOT Custom pricing
    if (!isCustom) {
        unpricedTermsData.push(['Insurance', 'To be arranged by buyer']);
    }
    unpricedTermsData.push(['Manufacturer', 'Unicorn Valves Private Limited']);

    autoTable(doc, {
        startY: yPos,
        body: unpricedTermsData,
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

    // Add footer
    addFooter(doc, pageWidth, pageHeight);

    // Merge with T&C and download
    const mergedPdfBytes = await mergePDFWithTermsConditions(doc);
    downloadPDFBytes(mergedPdfBytes, `${quote.quoteNumber}_Unpriced.pdf`);
}

