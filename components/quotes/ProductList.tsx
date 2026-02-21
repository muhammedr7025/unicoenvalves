import { QuoteProduct } from '@/types';

interface ProductListProps {
    products: QuoteProduct[];
    onEdit?: (index: number) => void;
    onRemove?: (index: number) => void;
    readOnly?: boolean;
}

export default function ProductList({ products, onEdit, onRemove, readOnly = false }: ProductListProps) {
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
                if (product.size) descParts.push(`${product.size}`);
                if (product.rating) descParts.push(`${product.rating}`);
                if (product.bodyEndConnectType) descParts.push(`${product.bodyEndConnectType}`);
                if (product.bodyBonnetMaterialName) descParts.push(`${product.bodyBonnetMaterialName}`);
                if (product.trimType) descParts.push(`Trim: ${product.trimType}`);
                if (product.plugMaterialName) descParts.push(`Plug: ${product.plugMaterialName}`);
                if (product.seatMaterialName) descParts.push(`Seat: ${product.seatMaterialName}`);
                if (product.stemMaterialName) descParts.push(`Stem: ${product.stemMaterialName}`);
                if (product.bonnetType) descParts.push(`${product.bonnetType}`);
                if (product.sealType) descParts.push(`${product.sealType}`);
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

                return (
                    <div key={product.id} className="border-2 rounded-lg p-4 hover:border-green-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold text-lg">
                                        {product.seriesNumber} - {product.size}/{product.rating}
                                    </h3>
                                    {product.productTag && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                            {product.productTag}
                                        </span>
                                    )}
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
                                        Qty: {product.quantity || 1}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {descParts.join(', ')}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Line Total</p>
                                    <p className="font-bold text-2xl text-green-600">₹{product.lineTotal.toLocaleString('en-US')}</p>
                                    {product.quantity > 1 && (
                                        <p className="text-xs text-gray-400">₹{Math.round(product.lineTotal / product.quantity).toLocaleString('en-US')} / unit</p>
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
