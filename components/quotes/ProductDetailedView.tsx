import { QuoteProduct } from '@/types';

interface ProductDetailedViewProps {
    product: QuoteProduct;
    index: number;
}

export default function ProductDetailedView({ product, index }: ProductDetailedViewProps) {
    return (
        <div className="mb-8 p-6 border-2 border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center space-x-3">
                        <h4 className="text-xl font-bold text-gray-900">
                            Product #{index + 1}: {product.productType} - Series {product.seriesNumber}
                        </h4>
                        {product.productTag && (
                            <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium">
                                {product.productTag}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 mt-1">
                        Size: {product.size} | Rating: {product.rating} | Quantity: {product.quantity}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Line Total</p>
                    <p className="text-2xl font-bold text-green-600">₹{product.lineTotal.toLocaleString('en-US')}</p>
                </div>
            </div>

            {/* Price Summary - Simplified */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <h5 className="font-bold text-lg mb-4 text-green-900 flex items-center">
                    <span className="mr-2">💰</span>
                    Price Summary
                </h5>

                {/* Body Sub-Assembly Specs */}
                <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Series:</span>
                                <span className="font-semibold ml-1">{product.seriesNumber}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Size:</span>
                                <span className="font-semibold ml-1">{product.size}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Rating:</span>
                                <span className="font-semibold ml-1">{product.rating}</span>
                            </div>
                            {product.trimType && (
                                <div>
                                    <span className="text-gray-600">Trim type:</span>
                                    <span className="font-semibold ml-1">{product.trimType}</span>
                                </div>
                            )}
                            {product.bodyEndConnectType && (
                                <div>
                                    <span className="text-gray-600">End connection:</span>
                                    <span className="font-semibold ml-1">{product.bodyEndConnectType}</span>
                                </div>
                            )}
                            {product.bonnetType && (
                                <div>
                                    <span className="text-gray-600">Bonnet Type:</span>
                                    <span className="font-semibold ml-1">{product.bonnetType}</span>
                                </div>
                            )}
                            {product.sealType && (
                                <div>
                                    <span className="text-gray-600">Seal:</span>
                                    <span className="font-semibold ml-1">{product.sealType}</span>
                                </div>
                            )}
                            {product.actuatorSeries && (
                                <div>
                                    <span className="text-gray-600">Actuator:</span>
                                    <span className="font-semibold ml-1">{product.actuatorSeries} / {product.actuatorModel}</span>
                                </div>
                            )}
                        </div>

                        {/* Materials Row */}
                        <div className="border-t border-blue-200 mt-3 pt-3">
                            <div className="text-xs text-gray-500 mb-2 font-medium">Materials:</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                {product.bodyBonnetMaterialName && (
                                    <div>
                                        <span className="text-gray-500">Body/Bonnet:</span>
                                        <span className="font-medium ml-1">{product.bodyBonnetMaterialName}</span>
                                    </div>
                                )}
                                {product.plugMaterialName && (
                                    <div>
                                        <span className="text-gray-500">Plug:</span>
                                        <span className="font-medium ml-1">{product.plugMaterialName}</span>
                                    </div>
                                )}
                                {product.seatMaterialName && (
                                    <div>
                                        <span className="text-gray-500">Seat:</span>
                                        <span className="font-medium ml-1">{product.seatMaterialName}</span>
                                    </div>
                                )}
                                {product.stemMaterialName && (
                                    <div>
                                        <span className="text-gray-500">Stem:</span>
                                        <span className="font-medium ml-1">{product.stemMaterialName}</span>
                                    </div>
                                )}
                                {product.cageMaterialName && (
                                    <div>
                                        <span className="text-gray-500">Cage:</span>
                                        <span className="font-medium ml-1">{product.cageMaterialName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Subtotals */}
                    <div className="space-y-2">
                        <div className="flex justify-between font-bold text-blue-900 text-lg">
                            <span>Body Sub-Assembly Total:</span>
                            <span>₹{(product.bodySubAssemblyTotal || 0).toLocaleString('en-US')}</span>
                        </div>
                        {(product.actuatorSubAssemblyTotal || 0) > 0 && (
                            <div className="flex justify-between font-bold text-purple-900 text-lg">
                                <span>Actuator Sub-Assembly Total:</span>
                                <span>₹{(product.actuatorSubAssemblyTotal || 0).toLocaleString('en-US')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Miscellaneous */}
                {product.tubingAndFitting && product.tubingAndFitting.length > 0 && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                        <h6 className="font-bold text-lg mb-3 text-orange-900">📦 Miscellaneous</h6>
                        <div className="space-y-2 text-sm">
                            {product.tubingAndFitting.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{item.title}</span>
                                    <span className="font-semibold">₹{item.price.toLocaleString('en-US')}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-orange-900">
                                <span>Subtotal</span>
                                <span>₹{(product.tubingAndFittingTotal || 0).toLocaleString('en-US')}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Testing */}
                {product.testing && product.testing.length > 0 && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                        <h6 className="font-bold text-lg mb-3 text-teal-900">🔬 Testing</h6>
                        <div className="space-y-2 text-sm">
                            {product.testing.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{item.title}</span>
                                    <span className="font-semibold">₹{item.price.toLocaleString('en-US')}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-teal-900">
                                <span>Subtotal</span>
                                <span>₹{(product.testingTotal || 0).toLocaleString('en-US')}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accessories */}
                {product.accessories && product.accessories.length > 0 && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                        <h6 className="font-bold text-lg mb-3 text-pink-900">🎯 Accessories (Bought-out Items)</h6>
                        <div className="space-y-2 text-sm">
                            {product.accessories.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>
                                        {item.title}
                                        {item.isDefault && <span className="ml-2 text-xs bg-pink-200 px-2 py-0.5 rounded">Default</span>}
                                        <span className="ml-2 text-xs text-gray-500">×{item.quantity}</span>
                                    </span>
                                    <span className="font-semibold">₹{item.price.toLocaleString('en-US')} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-US')}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-pink-900">
                                <span>Subtotal</span>
                                <span>₹{(product.accessoriesTotal || 0).toLocaleString('en-US')}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Price */}
                <div className="flex justify-between text-xl font-bold text-emerald-900 bg-emerald-200 px-4 py-3 rounded-lg">
                    <span>FINAL PRICE (Qty: {product.quantity || 1}):</span>
                    <span>₹{(product.lineTotal || 0).toLocaleString('en-US')}</span>
                </div>
            </div>
        </div>
    );
}
