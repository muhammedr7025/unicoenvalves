interface QuoteSummaryProps {
    subtotal: number;
    discount: number;
    discountAmount: number;
    tax: number;
    taxAmount: number;
    total: number;
}

export default function QuoteSummary({
    subtotal,
    discount,
    discountAmount,
    tax,
    taxAmount,
    total,
}: QuoteSummaryProps) {
    return (
        <div className="flex justify-end">
            <div className="w-96 space-y-3 text-lg">
                <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Discount ({discount}%):</span>
                        <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                )}
                <div className="flex justify-between text-gray-700">
                    <span>Tax ({tax}%):</span>
                    <span className="font-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-3xl font-bold text-gray-900 pt-4 border-t-4 border-green-600">
                    <span>Grand Total:</span>
                    <span className="text-green-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    );
}
