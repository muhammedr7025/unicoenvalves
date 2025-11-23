import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Generates quote number in format: UC-EN-YYZZ-####
 * YY = Current FY start year (last 2 digits)
 * ZZ = Current FY end year (last 2 digits)
 * #### = 4-digit sequential number
 */
export async function generateQuoteNumber(): Promise<string> {
  // Get current Indian Financial Year
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();
  
  // Indian FY runs from April 1 to March 31
  let fyStartYear: number;
  let fyEndYear: number;
  
  if (currentMonth >= 3) { // April (3) to December (11)
    fyStartYear = currentYear;
    fyEndYear = currentYear + 1;
  } else { // January (0) to March (2)
    fyStartYear = currentYear - 1;
    fyEndYear = currentYear;
  }
  
  // Get last 2 digits of years
  const fyStart2Digit = fyStartYear.toString().slice(-2);
  const fyEnd2Digit = fyEndYear.toString().slice(-2);
  const fyCode = `${fyStart2Digit}${fyEnd2Digit}`;
  
  // Get the last quote number for this FY
  const quotesRef = collection(db, 'quotes');
  const q = query(
    quotesRef,
    where('quoteNumber', '>=', `UC-EN-${fyCode}-0000`),
    where('quoteNumber', '<=', `UC-EN-${fyCode}-9999`),
    orderBy('quoteNumber', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  let nextSequence = 1;
  
  if (!querySnapshot.empty) {
    const lastQuoteNumber = querySnapshot.docs[0].data().quoteNumber;
    const lastSequence = parseInt(lastQuoteNumber.split('-')[3]);
    nextSequence = lastSequence + 1;
  }
  
  // Format sequence as 4-digit number
  const sequenceStr = nextSequence.toString().padStart(4, '0');
  
  return `UC-EN-${fyCode}-${sequenceStr}`;
}

/**
 * Get the current financial year string (e.g., "2025-2026")
 */
export function getCurrentFinancialYear(): string {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let fyStartYear: number;
  let fyEndYear: number;
  
  if (currentMonth >= 3) {
    fyStartYear = currentYear;
    fyEndYear = currentYear + 1;
  } else {
    fyStartYear = currentYear - 1;
    fyEndYear = currentYear;
  }
  
  return `${fyStartYear}-${fyEndYear}`;
}