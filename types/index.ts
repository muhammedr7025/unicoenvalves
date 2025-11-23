
export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  gst?: string; // Only for Indian customers
  createdAt: Date;
  createdBy: string; // User ID who created this customer
}

export type ProductType = 'SV' | 'CV';

export interface Series {
  id: string;
  productType: ProductType;
  seriesNumber: string; // e.g., "91000", "92000"
  name: string;
  hasCage: boolean; // Whether this series supports cage option
  isActive: boolean;
}

export type EndConnectType = 'Type1' | 'Type2';
export type BonnetType = 'Type1' | 'Type2' | 'Type3';
export type PlugType = 'Type1' | 'Type2' | 'Type3';
export type StemType = 'Type1' | 'Type2';

export interface Material {
  id: string;
  name: string; // e.g., "Aluminum", "Steel", "Stainless Steel"
  pricePerKg: number;
  isActive: boolean;
}

// Weight data for different components
export interface BodyWeight {
  id: string;
  seriesId: string;
  size: string; // e.g., "1/2", "3/4", "1", "2"
  rating: string; // e.g., "150", "300", "600"
  endConnectType: EndConnectType;
  weight: number; // in kg
}

export interface BonnetWeight {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  bonnetType: BonnetType;
  weight: number;
}

export interface ComponentWeight {
  id: string;
  seriesId: string;
  componentType: 'plug' | 'seat' | 'stem';
  size: string;
  rating: string;
  type: string; // PlugType or StemType
  weight: number;
}

export interface CagePrice {
  id: string;
  seriesId: string;
  size: string;
  fixedPrice: number;
}

export interface QuoteProduct {
  id: string; // Unique ID for this product in the quote
  productType: ProductType;
  seriesId: string;
  seriesNumber: string;
  
  // Common specs
  size: string;
  rating: string;
  
  // Body
  bodyEndConnectType: EndConnectType;
  bodyMaterialId: string;
  bodyWeight: number;
  bodyMaterialPrice: number;
  bodyTotalCost: number;
  
  // Bonnet
  bonnetType: BonnetType;
  bonnetMaterialId: string;
  bonnetWeight: number;
  bonnetMaterialPrice: number;
  bonnetTotalCost: number;
  
  // Plug
  plugType: PlugType;
  plugMaterialId: string;
  plugWeight: number;
  plugMaterialPrice: number;
  plugTotalCost: number;
  
  // Seat
  seatType: PlugType;
  seatMaterialId: string;
  seatWeight: number;
  seatMaterialPrice: number;
  seatTotalCost: number;
  
  // Stem
  stemType: StemType;
  stemMaterialId: string;
  stemWeight: number;
  stemMaterialPrice: number;
  stemTotalCost: number;
  
  // Cage (optional)
  hasCage: boolean;
  cageFixedPrice?: number;
  cageTotalCost?: number;
  
  // Total for this product
  productTotalCost: number;
  quantity: number;
  lineTotal: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface Quote {
  id: string;
  quoteNumber: string; // UC-EN-2526-0001
  customerId: string;
  customerName: string;
  
  products: QuoteProduct[];
  
  subtotal: number;
  discount: number; // percentage
  discountAmount: number;
  tax: number; // percentage (GST)
  taxAmount: number;
  total: number;
  
  status: QuoteStatus;
  
  createdBy: string; // Employee User ID
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  
  notes?: string;
  isArchived: boolean;
}

export interface DashboardStats {
  totalEmployees: number;
  totalCustomers: number;
  totalQuotes: number;
  quotesThisMonth: number;
  quotesThisYear: number;
}