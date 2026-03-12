import { QuoteProduct } from '@/types';

interface ProductListProps {
    products: QuoteProduct[];
    onEdit?: (index: number) => void;
    onRemove?: (index: number) => void;
    onDiscountChange?: (index: number, discountPercentage: number) => void;
    readOnly?: boolean;
    showDiscount?: boolean;
}

export default function ProductList({
    products,
    onEdit,
    onRemove,
    onDiscountChange,
    readOnly = false,
    showDiscount = true,
}: ProductListProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No products added yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {products.map((product, index) => {
                // Build rich description matching quote detail page
                const descParts: string[] = [];
                descParts.push(`${product.seriesNumber}`);
                if (product.size) descParts.push(`${product.size}"`);
                if (product.rating) descParts.push(`${product.rating}`);
                if (product.bodyEndConnectType) descParts.push(`${product.bodyEndConnectType}`);
                if (product.bodyBonnetMaterialName) descParts.push(`${product.bodyBonnetMaterialName}`);
                if (product.hasActuator && product.actuatorSeries && product.actuatorModel) {
                    descParts.push(`Actuator: ${product.actuatorSeries}/${product.actuatorModel}`);
                }
                if (product.hasHandwheel && product.handwheelSeries && product.handwheelModel) {
                    descParts.push(`Handwheel: ${product.handwheelSeries}/${product.handwheelModel}`);
                }
                if (product.accessories && product.accessories.length > 0) {
                    const accessoryNames = product.accessories.map(a => a.title).join(', ');
                    if (accessoryNames) descParts.push(accessoryNames);
                }

                const discountPct = product.discountPercentage || 0;
                const baseLineTotal = product.lineTotal || 0;
                // Calculate the "original" lineTotal (before any per-product discount was applied)
                // If discount was already baked into lineTotal, we need the pre-discount value
                const originalLineTotal = discountPct > 0 && product.discountAmount
                    ? baseLineTotal + (product.discountAmount * product.quantity)
                    : baseLineTotal;
                const discountedLineTotal = originalLineTotal * (1 - discountPct / 100);

                return (
                    <div key={product.id} className="border-2 rounded-lg p-4 hover:border-green-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold text-lg">
                                        {product.seriesNumber} - {product.size}"/{product.rating}
                                    </h3>
                                    {product.productTag && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                            {product.productTag}
                                        </span>
                                    )}
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
                                        Qty: {product.quantity || 1}
                                    </span>
                                    {discountPct > 0 && (
                                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded font-medium">
                                            🏷️ {discountPct}% off
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {descParts.join(', ')}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                                {/* Per-product discount input */}
                                {showDiscount && !readOnly && onDiscountChange && (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 mb-1">Discount %</p>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={discountPct || ''}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                onDiscountChange(index, isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
                                            }}
                                            className="w-16 px-2 py-1 border rounded-lg text-center text-sm border-orange-300 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Line Total</p>
                                    {discountPct > 0 ? (
                                        <>
                                            <p className="text-xs text-gray-400 line-through">
                                                ₹{Math.round(originalLineTotal).toLocaleString('en-US')}
                                            </p>
                                            <p className="font-bold text-2xl text-green-600">
                                                ₹{Math.round(discountedLineTotal).toLocaleString('en-US')}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="font-bold text-2xl text-green-600">
                                            ₹{Math.round(baseLineTotal).toLocaleString('en-US')}
                                        </p>
                                    )}
                                    {product.quantity > 1 && (
                                        <p className="text-xs text-gray-400">
                                            ₹{Math.round((discountPct > 0 ? discountedLineTotal : baseLineTotal) / product.quantity).toLocaleString('en-US')} / unit
                                        </p>
                                    )}
                                </div>
                                {!readOnly && (
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            onClick={() => onEdit?.(index)}
                                            className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onRemove?.(index)}
                                            className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded hover:bg-red-50 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
