// This file is deprecated and kept for backwards compatibility
// Use utils/pdfExporter.ts instead

import { Quote } from '@/types';
import { generateCombinedPDF } from './pdfExporter';

/**
 * @deprecated Use exportQuotePDF from './pdfExporter' instead
 * This function is kept for backwards compatibility only
 */
export function generateQuotePDF(quote: Quote, customerDetails: any) {
  console.warn('generateQuotePDF is deprecated. Use exportQuotePDF from utils/pdfExporter instead.');
  generateCombinedPDF(quote, customerDetails);
}