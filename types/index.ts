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

// ADD SeatType HERE:
export type EndConnectType = 'Type1' | 'Type2';
export type BonnetType = 'Type1' | 'Type2' | 'Type3';
export type PlugType = 'Type1' | 'Type2' | 'Type3';
export type SeatType = 'Type1' | 'Type2' | 'Type3'; // ADD THIS LINE
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

// UPDATE CagePrice to include seatType
export interface CagePrice {
  id: string;
  seriesId: string;
  size: string;
  seatType: string; // ADD THIS - Cage price depends on seat type
  fixedPrice: number;
}

// ADD Actuator interfaces
export interface ActuatorModel {
  id: string;
  type: string; // "Pneumatic", "Electric", "Manual"
  series: string; // "Series A", "Series B"
  model: string; // "PA-100", "EB-100"
  standard: 'standard' | 'special';
  fixedPrice: number;
  isActive: boolean;
}

export interface HandwheelPrice {
  id: string;
  actuatorModel: string; // Reference to actuator model
  fixedPrice: number;
  isActive: boolean;
}

// New interfaces for additional modules
export interface TubingAndFittingItem {
  id: string;
  title: string;
  price: number;
}

export interface TestingItem {
  id: string;
  title: string;
  price: number;
}

export interface AccessoryItem {
  id: string;
  title: string;
  price: number;
  isDefault?: boolean; // For default accessories
}

// Default accessories list
export const DEFAULT_ACCESSORIES = [
  'Airfilter regulator',
  'Positioner',
  'Solenoid valve',
  'Limit switch',
  'Airlock',
];

export interface QuoteProduct {
  id: string;
  productType: ProductType;
  seriesId: string;
  seriesNumber: string;
  size: string;
  rating: string;
  quantity: number;
  
  // Body Sub-Assembly
  bodyEndConnectType: EndConnectType;
  bodyMaterialId: string;
  bodyWeight: number;
  bodyMaterialPrice: number;
  bodyTotalCost: number;
  
  bonnetType: BonnetType;
  bonnetMaterialId: string;
  bonnetWeight: number;
  bonnetMaterialPrice: number;
  bonnetTotalCost: number;
  
  plugType: PlugType;
  plugMaterialId: string;
  plugWeight: number;
  plugMaterialPrice: number;
  plugTotalCost: number;
  
  seatType: SeatType;
  seatMaterialId: string;
  seatWeight: number;
  seatMaterialPrice: number;
  seatTotalCost: number;
  
  stemMaterialId: string;
  stemWeight: number;
  stemMaterialPrice: number;
  stemTotalCost: number;
  
  hasCage: boolean;
  cageFixedPrice?: number;
  cageTotalCost?: number;
  
  bodySubAssemblyTotal: number;
  
  // Actuator Sub-Assembly
  hasActuator: boolean;
  actuatorType?: string;
  actuatorSeries?: string;
  actuatorModel?: string;
  actuatorStandard?: 'standard' | 'special';
  actuatorFixedPrice?: number;
  
  hasHandwheel?: boolean;
  handwheelFixedPrice?: number;
  
  actuatorSubAssemblyTotal?: number;
  
  // Tubing & Fitting Module
  tubingAndFitting?: TubingAndFittingItem[];
  tubingAndFittingTotal?: number;
  
  // Testing Module
  testing?: TestingItem[];
  testingTotal?: number;
  
  // Accessories Module
  accessories?: AccessoryItem[];
  accessoriesTotal?: number;
  
  // Cost Breakdown (NEW)
  manufacturingCost: number; // Body + Actuator + Tubing + Testing
  boughtoutItemCost: number; // Accessories total
  unitCost: number; // Manufacturing + Boughtout
  
  // Product Totals
  productTotalCost: number; // Same as unitCost
  lineTotal: number; // unitCost × quantity
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