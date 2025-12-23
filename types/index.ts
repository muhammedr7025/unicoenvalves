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
  gst?: string;
  createdAt: Date;
  createdBy: string;
}

export type ProductType = 'SV' | 'CV';

export interface Series {
  id: string;
  productType: ProductType;
  seriesNumber: string;
  name: string;
  hasCage: boolean;
  hasSealRing: boolean; // NEW
  isActive: boolean;
}

export type EndConnectType = 'Type1' | 'Type2';
export type BonnetType = 'Type1' | 'Type2' | 'Type3';
export type StemType = 'Type1' | 'Type2';

// NEW: Material Groups
export type MaterialGroup = 'BodyBonnet' | 'Plug' | 'Seat' | 'Stem' | 'Cage';

export interface Material {
  id: string;
  name: string;
  pricePerKg: number;
  materialGroup: MaterialGroup;
  isActive: boolean;
}

export interface BodyWeight {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  endConnectType: EndConnectType;
  weight: number;
}

export interface BonnetWeight {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  bonnetType: BonnetType;
  weight: number;
}

// Stem Fixed Price (uses material name for lookup)
export interface StemFixedPrice {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  materialName: string;
  fixedPrice: number;
  isActive: boolean;
}

// NEW: Cage Weight (changed from fixed price to weight-based)
export interface CageWeight {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  weight: number;
  isActive: boolean;
}

// NEW: Seal Ring Price
export interface SealRingPrice {
  id: string;
  seriesId: string;
  sealType: string; // Changed from plugType
  size: string;
  rating: string;
  fixedPrice: number;
  isActive: boolean;
}

export interface ActuatorModel {
  id: string;
  type: string;
  series: string;
  model: string;
  standard: 'standard' | 'special';
  fixedPrice: number;
  isActive: boolean;
}

export interface HandwheelPrice {
  id: string;
  type: string;
  series: string;
  model: string;
  standard: 'standard' | 'special';
  fixedPrice: number;
  isActive: boolean;
}

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
  isDefault?: boolean;
}

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

  // NEW: Product Identification
  productTag?: string; // Custom name/identifier for this product

  // Body Sub-Assembly - UPDATED with separate material groups
  bodyEndConnectType: EndConnectType;
  bodyBonnetMaterialId: string; // NEW: Shared material for body & bonnet
  bodyWeight: number;
  bodyMaterialPrice: number;
  bodyTotalCost: number;

  bonnetType: BonnetType;
  bonnetWeight: number;
  bonnetMaterialPrice: number;
  bonnetTotalCost: number;

  // Removed plugType
  plugMaterialId: string; // NEW: Separate material for plug
  plugWeight: number;
  plugMaterialPrice: number;
  plugTotalCost: number;

  // Removed seatType
  seatMaterialId: string; // NEW: Separate material for seat
  seatWeight: number;
  seatMaterialPrice: number;
  seatTotalCost: number;

  stemMaterialId: string; // NEW: Separate material for stem
  stemFixedPrice: number; // NEW: Fixed price lookup
  stemTotalCost: number;

  // Cage - UPDATED to weight-based calculation
  hasCage: boolean;
  cageMaterialId?: string; // NEW: Separate material for cage
  cageWeight?: number; // NEW
  cageMaterialPrice?: number; // NEW
  cageTotalCost?: number;

  // NEW: Seal Ring
  hasSealRing: boolean;
  sealType?: string; // NEW: Seal Type selection
  sealRingFixedPrice?: number;
  sealRingTotalCost?: number;

  bodySubAssemblyTotal: number;

  // Actuator Sub-Assembly
  hasActuator: boolean;
  actuatorType?: string;
  actuatorSeries?: string;
  actuatorModel?: string;
  actuatorStandard?: 'standard' | 'special';
  actuatorFixedPrice?: number;

  hasHandwheel?: boolean;
  handwheelType?: string;
  handwheelSeries?: string;
  handwheelModel?: string;
  handwheelStandard?: 'standard' | 'special';
  handwheelFixedPrice?: number;

  actuatorSubAssemblyTotal?: number;

  // Additional Modules
  tubingAndFitting?: TubingAndFittingItem[];
  tubingAndFittingTotal?: number;
  testing?: TestingItem[];
  testingTotal?: number;
  accessories?: AccessoryItem[];
  accessoriesTotal?: number;

  // Cost Breakdown
  manufacturingCost: number;
  manufacturingProfitPercentage?: number;
  manufacturingProfitAmount?: number;
  manufacturingCostWithProfit?: number;

  boughtoutItemCost: number;
  boughtoutProfitPercentage?: number;
  boughtoutProfitAmount?: number;
  boughtoutCostWithProfit?: number;

  unitCost: number;

  // Product Totals
  productTotalCost: number;
  lineTotal: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  projectName?: string;
  enquiryId?: string;
  products: QuoteProduct[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  taxAmount: number;
  total: number;
  status: QuoteStatus;
  createdBy: string;
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