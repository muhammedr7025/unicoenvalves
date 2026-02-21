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
            {products.map((product, index) => (
                <div key={product.id} className="border-2 rounded-lg p-4 hover:border-green-300">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-lg">
                                    {product.seriesNumber} - {product.size}/{product.rating}
                                </h3>
                                {product.productTag && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                        {product.productTag}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 mt-2 space-y-1">

                            </div>
                        </div>
                        <div className="flex items-center space-x-4 ml-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Line Total</p>
                                <p className="font-bold text-2xl text-green-600">₹{product.lineTotal.toLocaleString('en-US')}</p>
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
            ))}
        </div>
    );
}
