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

    // Dual currency display: shows ₹ always, plus $ equivalent for international
    const dualAmount = (inrValue: number, prefix: string = '') => (
        <>
            <span>{prefix}₹{Math.round(inrValue).toLocaleString('en-US')}</span>
            {rate && (
                <span className="text-xs text-blue-600 ml-2">
                    ({prefix}${Math.round(inrValue / rate).toLocaleString('en-US')})
                </span>
            )}
        </>
    );

    return (
        <div className="flex justify-end">
            <div className="w-full max-w-md space-y-3 text-lg">
                {rate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2 text-sm text-blue-700">
                        💱 Exchange Rate: 1 USD = ₹{rate} — Showing both ₹ (INR) and $ (USD)
                    </div>
                )}
                <div className="flex justify-between text-gray-700">
                    <span>Products Subtotal:</span>
                    <span className="font-semibold">{dualAmount(productsSubtotal)}</span>
                </div>

                {packagePrice > 0 && (
                    <div className="flex justify-between text-orange-600">
                        <span>📦 Packing Price:</span>
                        <span className="font-semibold">{dualAmount(packagePrice, '+')}</span>
                    </div>
                )}
                {(pricingType === 'F.O.R. Site' || pricingType === 'F.O.R.') && freightPrice > 0 && (
                    <div className="flex justify-between text-cyan-600">
                        <span>🚛 Freight Price:</span>
                        <span className="font-semibold">{dualAmount(freightPrice, '+')}</span>
                    </div>
                )}
                {pricingType === 'Custom' && customPricingCharges.map((charge, idx) => (
                    charge.price > 0 && (
                        <div key={idx} className="flex justify-between text-violet-600">
                            <span>📋 {charge.title || `Charge ${idx + 1}`}:</span>
                            <span className="font-semibold">{dualAmount(charge.price, '+')}</span>
                        </div>
                    )
                ))}

                {showDiscount && discount > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Discount ({discount}%):</span>
                        <span className="font-semibold">{dualAmount(discountAmount, '-')}</span>
                    </div>
                )}
                <div className="flex justify-between text-gray-700">
                    <span>{rate ? 'Tax' : 'IGST'} ({tax}%):</span>
                    <span className="font-semibold">{dualAmount(taxAmount)}</span>
                </div>
                <div className="flex flex-wrap justify-between items-baseline text-2xl font-bold text-gray-900 pt-4 border-t-4 border-green-600">
                    <span>Grand Total:</span>
                    <span className="text-green-600">
                        {dualAmount(total)}
                    </span>
                </div>
            </div>
        </div>
    );
}
