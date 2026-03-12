import { CustomPricingCharge } from '@/types';

interface QuoteSummaryProps {
    subtotal: number;
    productsSubtotal: number; // Raw product subtotal before discount/package/freight
    discount: number;
    discountAmount: number;
    tax: number;
    taxAmount: number;
    total: number;
    packagePrice?: number;
    freightPrice?: number;
    pricingType?: string;
    customPricingCharges?: CustomPricingCharge[];
    showDiscount?: boolean;
    currencyExchangeRate?: number | null;
}

export default function QuoteSummary({
    subtotal,
    productsSubtotal,
    discount,
    discountAmount,
    tax,
    taxAmount,
    total,
    packagePrice = 0,
    freightPrice = 0,
    pricingType = 'Ex-Works',
    customPricingCharges = [],
    showDiscount = true,
    currencyExchangeRate,
}: QuoteSummaryProps) {
    const rate = currencyExchangeRate || null;
    const isInternational = !!rate;

    // Format helpers
    const inr = (v: number, prefix = '') => `${prefix}₹${Math.round(v).toLocaleString('en-US')}`;
    const usd = (v: number, prefix = '') => `${prefix}$${Math.round(v / rate!).toLocaleString('en-US')}`;

    // Row component for consistent formatting
    const SummaryRow = ({ label, inrVal, prefix = '', color = 'text-gray-700', bold = false }: {
        label: string; inrVal: number; prefix?: string; color?: string; bold?: boolean;
    }) => (
        <div className={`flex justify-between ${color} ${bold ? 'font-bold' : ''}`}>
            <span>{label}</span>
            <div className="flex items-center space-x-6">
                {isInternational && (
                    <span className={`${bold ? 'font-bold' : 'font-semibold'} text-blue-700 min-w-[100px] text-right`}>
                        {usd(inrVal, prefix)}
                    </span>
                )}
                <span className={`${bold ? 'font-bold' : 'font-semibold'} min-w-[120px] text-right`}>
                    {inr(inrVal, prefix)}
                </span>
            </div>
        </div>
    );

    return (
        <div className="flex justify-end">
            <div className={`w-full ${isInternational ? 'max-w-2xl' : 'max-w-md'} space-y-3 text-lg`}>
                {/* Column headers for international */}
                {isInternational && (
                    <div className="flex justify-end mb-2 border-b pb-2">
                        <div className="flex items-center space-x-6">
                            <span className="text-sm font-bold text-blue-700 min-w-[100px] text-right">USD ($)</span>
                            <span className="text-sm font-bold text-gray-700 min-w-[120px] text-right">INR (₹)</span>
                        </div>
                    </div>
                )}

                <SummaryRow label="Products Subtotal:" inrVal={productsSubtotal} />

                {packagePrice > 0 && (
                    <SummaryRow label="📦 Packing Price:" inrVal={packagePrice} prefix="+" color="text-orange-600" />
                )}
                {(pricingType === 'F.O.R. Site' || pricingType === 'F.O.R.') && freightPrice > 0 && (
                    <SummaryRow label="🚛 Freight Price:" inrVal={freightPrice} prefix="+" color="text-cyan-600" />
                )}
                {pricingType === 'Custom' && customPricingCharges.map((charge, idx) => (
                    charge.price > 0 && (
                        <SummaryRow key={idx} label={`📋 ${charge.title || `Charge ${idx + 1}`}:`} inrVal={charge.price} prefix="+" color="text-violet-600" />
                    )
                ))}

                {showDiscount && discountAmount > 0 && (
                    <SummaryRow label={`Discount:`} inrVal={discountAmount} prefix="-" color="text-red-600" />
                )}

                <SummaryRow label={`${isInternational ? 'Tax' : 'IGST'} (${tax}%):`} inrVal={taxAmount} />

                {/* Grand Total */}
                <div className="flex justify-between items-baseline text-2xl font-bold text-gray-900 pt-4 border-t-4 border-green-600">
                    <span>Grand Total:</span>
                    <div className="flex items-center space-x-6">
                        {isInternational && (
                            <span className="text-green-600 min-w-[100px] text-right">
                                ${Math.round(total / rate!).toLocaleString('en-US')}
                            </span>
                        )}
                        <span className="text-green-600 min-w-[120px] text-right">
                            ₹{Math.round(total).toLocaleString('en-US')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
