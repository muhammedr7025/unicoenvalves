import { QuoteProduct } from '@/types';

export interface ComponentCalculation {
  weight: number;
  materialPrice: number;
  totalCost: number;
}

/**
 * Calculate body price
 */
export function calculateBodyPrice(
  weight: number,
  materialPricePerKg: number
): ComponentCalculation {
  const totalCost = weight * materialPricePerKg;
  return {
    weight,
    materialPrice: materialPricePerKg,
    totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Calculate bonnet price
 */
export function calculateBonnetPrice(
  weight: number,
  materialPricePerKg: number
): ComponentCalculation {
  const totalCost = weight * materialPricePerKg;
  return {
    weight,
    materialPrice: materialPricePerKg,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Calculate component price (plug, seat, stem)
 */
export function calculateComponentPrice(
  weight: number,
  materialPricePerKg: number
): ComponentCalculation {
  const totalCost = weight * materialPricePerKg;
  return {
    weight,
    materialPrice: materialPricePerKg,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Calculate total product cost
 */
export function calculateProductTotal(product: QuoteProduct): number {
  let total = 0;
  
  total += product.bodyTotalCost;
  total += product.bonnetTotalCost;
  total += product.plugTotalCost;
  total += product.seatTotalCost;
  total += product.stemTotalCost;
  
  if (product.hasCage && product.cageTotalCost) {
    total += product.cageTotalCost;
  }
  
  return Math.round(total * 100) / 100;
}

/**
 * Calculate quote totals
 */
export function calculateQuoteTotals(
  products: QuoteProduct[],
  discountPercentage: number = 0,
  taxPercentage: number = 18 // Default GST 18%
): {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
} {
  // Calculate subtotal
  const subtotal = products.reduce((sum, product) => {
    return sum + (product.lineTotal || 0);
  }, 0);
  
  // Calculate discount
  const discountAmount = (subtotal * discountPercentage) / 100;
  
  // Calculate taxable amount
  const taxableAmount = subtotal - discountAmount;
  
  // Calculate tax
  const taxAmount = (taxableAmount * taxPercentage) / 100;
  
  // Calculate total
  const total = taxableAmount + taxAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}