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
export type PlugType = 'Type1' | 'Type2' | 'Type3';
export type SeatType = 'Type1' | 'Type2' | 'Type3';
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

export interface ComponentWeight {
  id: string;
  seriesId: string;
  componentType: 'plug' | 'seat';
  size: string;
  rating: string;
  type: string;
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

// Seal Ring Price (Independent from Plug - uses seal type)
export interface SealRingPrice {
  id: string;
  seriesId: string;
  sealType: string; // Changed from plugType - seal has its own type
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
  type: string; // Actuator type (e.g., Pneumatic, Electric)
  series: string; // Actuator series
  model: string; // Actuator model
  standard: 'standard' | 'special'; // Standard or special configuration
  fixedPrice: number;
  isActive: boolean;
}

export interface TubingAndFittingItem {
  id: string;
  title: string;
  price: number;
}

export interface MachineCostItem {
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

export interface MachineRate {
  id: string;
  name: string;
  ratePerHour: number;
  isActive: boolean;
}

export interface MachiningHour {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  partType: 'Body' | 'Bonnet' | 'Plug' | 'Seat' | 'Stem' | 'Cage' | 'SealRing';
  trimType?: string; // Only for Plug, Seat, Stem, Cage, SealRing
  hours: number;
  isActive: boolean;
}

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

  // NEW: Common Trim Type for internal parts
  trimType?: string;

  // Body Sub-Assembly - UPDATED with separate material groups
  bodyEndConnectType: EndConnectType;
  bodyBonnetMaterialId: string; // Shared material for body & bonnet
  bodyWeight: number;
  bodyMaterialPrice: number;
  // Machine Cost Fields
  bodyMachineTypeId?: string;
  bodyMachiningHours?: number;
  bodyMachineRate?: number;
  bodyMachineCost?: number;
  bodyTotalCost: number;

  bonnetType: BonnetType;
  bonnetWeight: number;
  bonnetMaterialPrice: number;
  // Machine Cost Fields
  bonnetMachineTypeId?: string;
  bonnetMachiningHours?: number;
  bonnetMachineRate?: number;
  bonnetMachineCost?: number;
  bonnetTotalCost: number;

  // Plug - NO TYPE, just weight lookup by series+size+rating
  plugMaterialId: string; // Material for plug
  plugWeight: number;
  plugMaterialPrice: number;
  // Machine Cost Fields
  plugMachineTypeId?: string;
  plugMachiningHours?: number;
  plugMachineRate?: number;
  plugMachineCost?: number;
  plugTotalCost: number;

  // Seat - NO TYPE, just weight lookup by series+size+rating
  seatMaterialId: string; // Separate material for seat
  seatWeight: number;
  seatMaterialPrice: number;
  // Machine Cost Fields
  seatMachineTypeId?: string;
  seatMachiningHours?: number;
  seatMachineRate?: number;
  seatMachineCost?: number;
  seatTotalCost: number;

  stemMaterialId: string; // Separate material for stem
  stemFixedPrice: number; // Fixed price lookup
  // Machine Cost Fields
  stemMachineTypeId?: string;
  stemMachiningHours?: number;
  stemMachineRate?: number;
  stemMachineCost?: number;
  stemTotalCost: number;

  // Cage - weight-based calculation
  hasCage: boolean;
  cageMaterialId?: string; // Separate material for cage
  cageWeight?: number;
  cageMaterialPrice?: number;
  // Machine Cost Fields
  cageMachineTypeId?: string;
  cageMachiningHours?: number;
  cageMachineRate?: number;
  cageMachineCost?: number;
  cageTotalCost?: number;

  // Seal Ring - Independent sub-assembly with its own type
  hasSealRing: boolean;
  sealType?: string; // NEW: Seal has its own type
  sealRingFixedPrice?: number;
  // Machine Cost Fields
  sealRingMachineTypeId?: string;
  sealRingMachiningHours?: number;
  sealRingMachineRate?: number;
  sealRingMachineCost?: number;
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
  handwheelFixedPrice?: number;
  actuatorSubAssemblyTotal?: number;

  // Additional Modules
  tubingAndFitting?: TubingAndFittingItem[];
  tubingAndFittingTotal?: number;
  machineCost?: MachineCostItem[]; // NOTE: This is for EXTRA machine cost, separate from manufacturing
  machineCostTotal?: number;
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
  packagingPrice: number;
  total: number;
  status: QuoteStatus;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  // Commercial Terms
  priceType: string; // e.g., "Ex-Works INR each net", "F.O.R sites"
  validity: string;
  delivery: string;
  warranty: string;
  payment: string;
  isArchived: boolean;
}

export interface DashboardStats {
  totalEmployees: number;
  totalCustomers: number;
  totalQuotes: number;
  quotesThisMonth: number;
  quotesThisYear: number;
}