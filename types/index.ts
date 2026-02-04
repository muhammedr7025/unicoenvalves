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

// NEW: Pilot Plug Weight
export interface PilotPlugWeight {
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

// Machine Pricing System
export interface MachineType {
  id: string;
  name: string;              // e.g., "CNC Lathe", "Milling Machine"
  hourlyRate: number;        // ₹ per hour
  isActive: boolean;
}

export type ComponentType = 'Body' | 'Bonnet' | 'Plug' | 'Seat' | 'Stem' | 'Cage' | 'SealRing';

// Components that have machining cost (Seal Ring excluded)
export type MachiningComponentType = 'Body' | 'Bonnet' | 'Plug' | 'Seat' | 'Stem' | 'Cage';

export interface WorkHourData {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  trimType?: string;         // Only for Plug, Seat, Cage, Seal Ring, Stem (not for Body, Bonnet)
  component: ComponentType;
  workHours: number;         // Just hours - machine selected during quote creation
  isActive: boolean;
}

// NEW: Fixed Machining Price (replaces dynamic workHours × machineRate calculation)
export interface MachiningPrice {
  id: string;
  component: MachiningComponentType;
  seriesId: string;
  size: string;
  rating: string;
  // Body uses endConnectType, Bonnet uses bonnetType, others use trimType
  typeKey: string;
  materialName: string;      // Material name for lookup (matches material.name)
  fixedPrice: number;        // The fixed machining cost
  isActive: boolean;
}

export interface TubingAndFittingItem {
  id: string;
  title: string;
  price: number;
  isPreset?: boolean; // NEW: Flag for preset items
  seriesId?: string; // NEW: For preset reference
}

export interface TestingItem {
  id: string;
  title: string;
  price: number;
  isPreset?: boolean; // NEW: Flag for preset items
  seriesId?: string; // NEW: For preset reference
}

// NEW: Testing Preset (price varies by series/size/rating)
export interface TestingPreset {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  testName: string;
  price: number;
  isActive: boolean;
}

// NEW: Tubing Preset (price varies by series/size/rating)
export interface TubingPreset {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  itemName: string;
  price: number;
  isActive: boolean;
}

export interface AccessoryItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
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

  // NEW: Trim Type - used for machine hour calculations
  trimType?: string; // For Plug, Seat, Stem, Cage, Seal Ring (not for Body, Bonnet)

  // Body Sub-Assembly - UPDATED with separate material groups
  bodyEndConnectType: EndConnectType;
  bodyBonnetMaterialId: string; // NEW: Shared material for body & bonnet
  bodyBonnetMaterialName?: string; // Material name for display
  bodyWeight: number;
  bodyMaterialPrice: number;
  bodyTotalCost: number;
  // Machine costs for Body
  bodyWorkHours?: number;
  bodyMachineTypeId?: string;
  bodyMachineTypeName?: string;
  bodyMachineRate?: number;
  bodyMachineCost?: number;

  bonnetType: BonnetType;
  bonnetWeight: number;
  bonnetMaterialPrice: number;
  bonnetTotalCost: number;
  // Machine costs for Bonnet
  bonnetWorkHours?: number;
  bonnetMachineTypeId?: string;
  bonnetMachineTypeName?: string;
  bonnetMachineRate?: number;
  bonnetMachineCost?: number;

  // Removed plugType
  plugMaterialId: string; // NEW: Separate material for plug
  plugMaterialName?: string; // Material name for display
  plugWeight: number;
  plugMaterialPrice: number;
  plugTotalCost: number;
  // Machine costs for Plug
  plugWorkHours?: number;
  plugMachineTypeId?: string;
  plugMachineTypeName?: string;
  plugMachineRate?: number;
  plugMachineCost?: number;

  // Removed seatType
  seatMaterialId: string; // NEW: Separate material for seat
  seatMaterialName?: string; // Material name for display
  seatWeight: number;
  seatMaterialPrice: number;
  seatTotalCost: number;
  // Machine costs for Seat
  seatWorkHours?: number;
  seatMachineTypeId?: string;
  seatMachineTypeName?: string;
  seatMachineRate?: number;
  seatMachineCost?: number;

  stemMaterialId: string; // NEW: Separate material for stem
  stemMaterialName?: string; // Material name for display
  stemFixedPrice: number; // NEW: Fixed price lookup
  stemTotalCost: number;
  // Machine costs for Stem
  stemWorkHours?: number;
  stemMachineTypeId?: string;
  stemMachineTypeName?: string;
  stemMachineRate?: number;
  stemMachineCost?: number;

  // Cage - UPDATED to weight-based calculation
  hasCage: boolean;
  cageMaterialId?: string; // NEW: Separate material for cage
  cageMaterialName?: string; // Material name for display
  cageWeight?: number; // NEW
  cageMaterialPrice?: number; // NEW
  cageTotalCost?: number;
  // Machine costs for Cage
  cageWorkHours?: number;
  cageMachineTypeId?: string;
  cageMachineTypeName?: string;
  cageMachineRate?: number;
  cageMachineCost?: number;

  // NEW: Seal Ring
  hasSealRing: boolean;
  sealType?: string; // NEW: Seal Type selection
  sealRingFixedPrice?: number;
  sealRingTotalCost?: number;
  // Machine costs for Seal Ring
  sealRingWorkHours?: number;
  sealRingMachineTypeId?: string;
  sealRingMachineTypeName?: string;
  sealRingMachineRate?: number;
  sealRingMachineCost?: number;

  // NEW: Pilot Plug
  hasPilotPlug: boolean;
  pilotPlugMaterialId?: string;
  pilotPlugMaterialName?: string;
  pilotPlugWeight?: number;
  pilotPlugMaterialPrice?: number;
  pilotPlugTotalCost?: number;

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

  // Negotiation Margin (buffer applied on top of grand total)
  negotiationMarginPercentage?: number;
  negotiationMarginAmount?: number;

  // Product Totals
  productTotalCost: number; // Grand total before negotiation margin
  lineTotal: number; // Final total including negotiation margin × quantity
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

// Validity Period Options
export type ValidityPeriod = '15 days' | '30 days' | '45 days' | '50 days' | '60 days' | '90 days';

// Pricing Type Options
export type PricingType = 'Ex-Works' | 'F.O.R.';

// Payment Terms Structure
export interface PaymentTerms {
  advancePercentage: number;      // Percentage for advance payment
  approvalPercentage: number;     // Percentage on approval
  customTerms?: string;           // Optional custom payment terms
}

// Warranty Terms Structure
export interface WarrantyTerms {
  shipmentDays: number;           // Warranty days for shipment
  installationDays: number;       // Warranty days for installation
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customQuoteNumber?: string;     // NEW: Custom quote number override
  customerId: string;
  customerName: string;
  projectName?: string;
  enquiryId?: string;

  // NEW: Quote Settings for PDF Generation
  validity?: ValidityPeriod;      // Quote validity period dropdown
  warrantyTerms?: WarrantyTerms;  // Warranty for shipment and installation
  deliveryDays?: string;          // Delivery timeline (custom value)
  paymentTerms?: PaymentTerms;    // Payment terms with percentages
  currencyExchangeRate?: number;  // For international customers (non-India)
  pricingType?: PricingType;      // Ex-Works or F.O.R. pricing
  freightPrice?: number;          // Freight charges (only for F.O.R. pricing)

  products: QuoteProduct[];
  subtotal: number;
  packagePrice?: number; // Packaging charges
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