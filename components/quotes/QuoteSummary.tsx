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
    pricingType?: 'Ex-Works' | 'F.O.R.';
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
}: QuoteSummaryProps) {
    return (
        <div className="flex justify-end">
            <div className="w-96 space-y-3 text-lg">
                <div className="flex justify-between text-gray-700">
                    <span>Products Subtotal:</span>
                    <span className="font-semibold">₹{productsSubtotal.toLocaleString('en-US')}</span>
                </div>

                {packagePrice > 0 && (
                    <div className="flex justify-between text-orange-600">
                        <span>📦 Packing Price:</span>
                        <span className="font-semibold">+₹{packagePrice.toLocaleString('en-US')}</span>
                    </div>
                )}
                {pricingType === 'F.O.R.' && freightPrice > 0 && (
                    <div className="flex justify-between text-cyan-600">
                        <span>🚛 Freight Price:</span>
                        <span className="font-semibold">+₹{freightPrice.toLocaleString('en-US')}</span>
                    </div>
                )}

                {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Discount ({discount}%):</span>
                        <span className="font-semibold">-₹{discountAmount.toLocaleString('en-US')}</span>
                    </div>
                )}
                <div className="flex justify-between text-gray-700">
                    <span>Tax ({tax}%):</span>
                    <span className="font-semibold">₹{taxAmount.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between text-3xl font-bold text-gray-900 pt-4 border-t-4 border-green-600">
                    <span>Grand Total:</span>
                    <span className="text-green-600">₹{total.toLocaleString('en-US')}</span>
                </div>
            </div>
        </div>
    );
}
