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
                    <p className="text-2xl font-bold text-green-600">₹{product.lineTotal.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">Manufacturing</p>
                    <p className="text-lg font-bold text-blue-900">₹{product.manufacturingCost?.toLocaleString('en-IN')}</p>
                    {product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0 && (
                        <p className="text-xs text-blue-600">+{product.manufacturingProfitPercentage}% profit</p>
                    )}
                </div>

                <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                    <p className="text-xs text-pink-700 font-medium">Boughtout Items</p>
                    <p className="text-lg font-bold text-pink-900">₹{product.boughtoutItemCost?.toLocaleString('en-IN')}</p>
                    {product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0 && (
                        <p className="text-xs text-pink-600">+{product.boughtoutProfitPercentage}% profit</p>
                    )}
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 font-medium">Unit Cost</p>
                    <p className="text-lg font-bold text-green-900">₹{product.unitCost?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-green-600">with profit</p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-700 font-medium">Total Profit</p>
                    <p className="text-lg font-bold text-yellow-900">
                        ₹{((product.manufacturingProfitAmount || 0) + (product.boughtoutProfitAmount || 0)).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-yellow-600">on this item</p>
                </div>
            </div>

            {/* Body Sub-Assembly */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="text-lg mr-2">🔧</span>
                    Body Sub-Assembly
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-gray-600 font-medium mb-1">Body</p>
                        <p className="font-semibold">{product.bodyEndConnectType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Weight: {product.bodyWeight}kg × ₹{product.bodyMaterialPrice}/kg
                        </p>
                        <p className="text-green-700 font-semibold mt-1">₹{product.bodyTotalCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-gray-600 font-medium mb-1">Bonnet</p>
                        <p className="font-semibold">{product.bonnetType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Weight: {product.bonnetWeight}kg × ₹{product.bonnetMaterialPrice}/kg
                        </p>
                        <p className="text-green-700 font-semibold mt-1">₹{product.bonnetTotalCost.toFixed(2)}</p>
                        <p className="text-xs text-blue-600 mt-1">
                            ℹ️ Same material as Body (Group 1)
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-200">
                        <p className="text-gray-600 font-medium mb-1">Plug</p>
                        {/* Removed plugType display */}
                        <p className="text-xs text-gray-500 mt-1">
                            Weight: {product.plugWeight}kg × ₹{product.plugMaterialPrice}/kg
                        </p>
                        <p className="text-green-700 font-semibold mt-1">₹{product.plugTotalCost.toFixed(2)}</p>
                        <p className="text-xs text-purple-600 mt-1">Material Group 2</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-pink-200">
                        <p className="text-gray-600 font-medium mb-1">Seat</p>
                        {/* Removed seatType display */}
                        <p className="text-xs text-gray-500 mt-1">
                            Weight: {product.seatWeight}kg × ₹{product.seatMaterialPrice}/kg
                        </p>
                        <p className="text-green-700 font-semibold mt-1">₹{product.seatTotalCost.toFixed(2)}</p>
                        <p className="text-xs text-pink-600 mt-1">Material Group 3</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-orange-200">
                        <p className="text-gray-600 font-medium mb-1">Stem</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Fixed Price (Series, Size, Rating, Material)
                        </p>
                        <p className="text-green-700 font-semibold mt-1">₹{product.stemTotalCost.toFixed(2)}</p>
                        <p className="text-xs text-orange-600 mt-1">Material Group 4</p>
                    </div>
                    {product.hasCage && product.cageTotalCost && (
                        <div className="bg-white p-3 rounded border border-green-200">
                            <p className="text-gray-600 font-medium mb-1">Cage</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Weight: {product.cageWeight}kg × ₹{product.cageMaterialPrice}/kg
                            </p>
                            <p className="text-green-700 font-semibold mt-1">₹{product.cageTotalCost.toFixed(2)}</p>
                            <p className="text-xs text-green-600 mt-1">Material Group 5</p>
                        </div>
                    )}
                    {product.hasSealRing && product.sealRingTotalCost && (
                        <div className="bg-white p-3 rounded border border-indigo-200">
                            <p className="text-gray-600 font-medium mb-1">Seal Ring</p>
                            {product.sealType && <p className="font-semibold">{product.sealType}</p>}
                            <p className="text-xs text-gray-500 mt-1">
                                Fixed Price (Seal Type, Size, Rating)
                            </p>
                            <p className="text-green-700 font-semibold mt-1">₹{product.sealRingTotalCost.toFixed(2)}</p>
                        </div>
                    )}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="font-bold text-blue-900">Body Sub-Assembly Total: ₹{product.bodySubAssemblyTotal.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Machine Costs Section */}
            {(product.bodyMachineCost || product.bonnetMachineCost || product.plugMachineCost ||
                product.seatMachineCost || product.stemMachineCost || product.cageMachineCost ||
                product.sealRingMachineCost) && (
                    <div className="bg-indigo-50 p-4 rounded-lg mb-4 border-2 border-indigo-200">
                        <h5 className="font-semibold text-indigo-900 mb-3 flex items-center">
                            <span className="text-lg mr-2">⚙️</span>
                            Machine Costs Breakdown
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            {product.bodyWorkHours && product.bodyMachineCost && (
                                <div className="bg-white p-3 rounded border border-indigo-200">
                                    <p className="text-gray-600 font-medium mb-1">Body Machining</p>
                                    <p className="text-xs text-gray-500">Machine: {product.bodyMachineTypeName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.bodyWorkHours} hrs × ₹{product.bodyMachineRate}/hr
                                    </p>
                                    <p className="text-indigo-700 font-semibold mt-1">₹{product.bodyMachineCost.toFixed(2)}</p>
                                </div>
                            )}
                            {product.bonnetWorkHours && product.bonnetMachineCost && (
                                <div className="bg-white p-3 rounded border border-indigo-200">
                                    <p className="text-gray-600 font-medium mb-1">Bonnet Machining</p>
                                    <p className="text-xs text-gray-500">Machine: {product.bonnetMachineTypeName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.bonnetWorkHours} hrs × ₹{product.bonnetMachineRate}/hr
                                    </p>
                                    <p className="text-indigo-700 font-semibold mt-1">₹{product.bonnetMachineCost.toFixed(2)}</p>
                                </div>
                            )}
                            {product.plugWorkHours && product.plugMachineCost && (
                                <div className="bg-white p-3 rounded border border-indigo-200">
                                    <p className="text-gray-600 font-medium mb-1">Plug Machining</p>
                                    <p className="text-xs text-gray-500">Machine: {product.plugMachineTypeName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.plugWorkHours} hrs × ₹{product.plugMachineRate}/hr
                                    </p>
                                    <p className="text-indigo-700 font-semibold mt-1">₹{product.plugMachineCost.toFixed(2)}</p>
                                </div>
                            )}
                            {product.seatWorkHours && product.seatMachineCost && (
                                <div className="bg-white p-3 rounded border border-indigo-200">
                                    <p className="text-gray-600 font-medium mb-1">Seat Machining</p>
                                    <p className="text-xs text-gray-500">Machine: {product.seatMachineTypeName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.seatWorkHours} hrs × ₹{product.seatMachineRate}/hr
                                    </p>
                                    <p className="text-indigo-700 font-semibold mt-1">₹{product.seatMachineCost.toFixed(2)}</p>
                                </div>
                            )}
                            {product.stemWorkHours && product.stemMachineCost && (
                                <div className="bg-white p-3 rounded border border-indigo-200">
                                    <p className="text-gray-600 font-medium mb-1">Stem Machining</p>
                                    <p className="text-xs text-gray-500">Machine: {product.stemMachineTypeName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.stemWorkHours} hrs × ₹{product.stemMachineRate}/hr
                                    </p>
                                    <p className="text-indigo-700 font-semibold mt-1">₹{product.stemMachineCost.toFixed(2)}</p>
                                </div>
                            )}
                            {product.cageWorkHours && product.cageMachineCost && (
                                <div className="bg-white p-3 rounded border border-indigo-200">
                                    <p className="text-gray-600 font-medium mb-1">Cage Machining</p>
                                    <p className="text-xs text-gray-500">Machine: {product.cageMachineTypeName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.cageWorkHours} hrs × ₹{product.cageMachineRate}/hr
                                    </p>
                                    <p className="text-indigo-700 font-semibold mt-1">₹{product.cageMachineCost.toFixed(2)}</p>
                                </div>
                            )}
                            {product.sealRingWorkHours && product.sealRingMachineCost && (
                                <div className="bg-white p-3 rounded border border-indigo-200">
                                    <p className="text-gray-600 font-medium mb-1">Seal Ring Machining</p>
                                    <p className="text-xs text-gray-500">Machine: {product.sealRingMachineTypeName}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.sealRingWorkHours} hrs × ₹{product.sealRingMachineRate}/hr
                                    </p>
                                    <p className="text-indigo-700 font-semibold mt-1">₹{product.sealRingMachineCost.toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                            <p className="font-bold text-indigo-900">
                                Total Machine Costs: ₹{(
                                    (product.bodyMachineCost || 0) +
                                    (product.bonnetMachineCost || 0) +
                                    (product.plugMachineCost || 0) +
                                    (product.seatMachineCost || 0) +
                                    (product.stemMachineCost || 0) +
                                    (product.cageMachineCost || 0) +
                                    (product.sealRingMachineCost || 0)
                                ).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                )}

            {/* Actuator Sub-Assembly */}
            {product.hasActuator && product.actuatorSubAssemblyTotal && (
                <div className="bg-purple-50 p-4 rounded-lg mb-4 border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">⚙️</span>
                        Actuator Sub-Assembly
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white p-3 rounded">
                            <p className="text-gray-600">Type:</p>
                            <p className="font-semibold">{product.actuatorType}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <p className="text-gray-600">Series:</p>
                            <p className="font-semibold">{product.actuatorSeries}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <p className="text-gray-600">Model:</p>
                            <p className="font-semibold">{product.actuatorModel}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <p className="text-gray-600">Configuration:</p>
                            <p className="font-semibold capitalize">{product.actuatorStandard}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <p className="text-gray-600">Actuator Price:</p>
                            <p className="text-green-700 font-semibold">₹{product.actuatorFixedPrice?.toLocaleString('en-IN')}</p>
                        </div>
                        {product.hasHandwheel && product.handwheelFixedPrice && (
                            <div className="bg-white p-3 rounded">
                                <p className="text-gray-600">Handwheel:</p>
                                <p className="text-green-700 font-semibold">₹{product.handwheelFixedPrice.toLocaleString('en-IN')}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="font-bold text-purple-900">Actuator Sub-Assembly Total: ₹{product.actuatorSubAssemblyTotal.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            )}

            {/* Tubing & Fitting */}
            {product.tubingAndFitting && product.tubingAndFitting.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                    <h5 className="font-semibold text-orange-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🔧</span>
                        Tubing & Fitting
                    </h5>
                    <div className="space-y-2 text-sm">
                        {product.tubingAndFitting.map((item) => (
                            <div key={item.id} className="flex justify-between bg-white p-2 rounded">
                                <span>{item.title}</span>
                                <span className="font-semibold text-green-700">₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-orange-200">
                        <p className="font-bold text-orange-900">Tubing & Fitting Total: ₹{product.tubingAndFittingTotal?.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            )}

            {/* Testing */}
            {product.testing && product.testing.length > 0 && (
                <div className="bg-teal-50 p-4 rounded-lg mb-4 border-2 border-teal-200">
                    <h5 className="font-semibold text-teal-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🔬</span>
                        Testing
                    </h5>
                    <div className="space-y-2 text-sm">
                        {product.testing.map((item) => (
                            <div key={item.id} className="flex justify-between bg-white p-2 rounded">
                                <span>{item.title}</span>
                                <span className="font-semibold text-green-700">₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-teal-200">
                        <p className="font-bold text-teal-900">Testing Total: ₹{product.testingTotal?.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            )}

            {/* Accessories */}
            {product.accessories && product.accessories.length > 0 && (
                <div className="bg-pink-50 p-4 rounded-lg mb-4 border-2 border-pink-200">
                    <h5 className="font-semibold text-pink-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🎯</span>
                        Accessories
                    </h5>
                    <div className="space-y-2 text-sm">
                        {product.accessories.map((item) => (
                            <div key={item.id} className="flex justify-between bg-white p-2 rounded">
                                <span>
                                    {item.title}
                                    {item.isDefault && <span className="ml-2 text-xs bg-pink-200 px-2 py-1 rounded">Default</span>}
                                </span>
                                <span className="font-semibold text-green-700">₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-pink-200">
                        <p className="font-bold text-pink-900">Accessories Total: ₹{product.accessoriesTotal?.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            )}

            {/* Product Cost Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border-2 border-green-200">
                <h5 className="font-bold text-lg mb-4 text-gray-900">📊 Product Cost Summary</h5>

                {/* Manufacturing Cost Section */}
                <div className="bg-white p-4 rounded-lg mb-4 border border-blue-200">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Manufacturing Cost (Base):</span>
                            <span className="font-bold text-blue-700">₹{product.manufacturingCost?.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-xs text-gray-500 pl-4">
                            (Body + Actuator + Tubing & Fitting + Testing)
                        </p>

                        {product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0 ? (
                            <>
                                <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                                    <span className="text-blue-700">
                                        <span className="font-semibold">Profit Margin:</span> {product.manufacturingProfitPercentage}%
                                    </span>
                                    <span className="font-semibold text-blue-700">+₹{product.manufacturingProfitAmount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between font-bold text-blue-900 pt-2 border-t border-blue-200">
                                    <span>Manufacturing Cost (with profit):</span>
                                    <span>₹{product.manufacturingCostWithProfit?.toLocaleString('en-IN')}</span>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="text-xs text-gray-500">No profit margin applied</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Boughtout Item Cost Section */}
                <div className="bg-white p-4 rounded-lg mb-4 border border-pink-200">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Boughtout Item Cost (Base):</span>
                            <span className="font-bold text-pink-700">₹{product.boughtoutItemCost?.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-xs text-gray-500 pl-4">
                            (Accessories)
                        </p>

                        {product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0 ? (
                            <>
                                <div className="flex justify-between items-center bg-pink-50 p-2 rounded">
                                    <span className="text-pink-700">
                                        <span className="font-semibold">Profit Margin:</span> {product.boughtoutProfitPercentage}%
                                    </span>
                                    <span className="font-semibold text-pink-700">+₹{product.boughtoutProfitAmount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between font-bold text-pink-900 pt-2 border-t border-pink-200">
                                    <span>Boughtout Cost (with profit):</span>
                                    <span>₹{product.boughtoutCostWithProfit?.toLocaleString('en-IN')}</span>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="text-xs text-gray-500">No profit margin applied</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Totals */}
                <div className="space-y-3">
                    <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-green-400">
                        <span>Unit Cost:</span>
                        <span className="text-green-700">₹{product.unitCost?.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-4">
                        (Manufacturing Cost + Boughtout Cost with profit margins)
                    </p>

                    <div className="flex justify-between text-lg font-bold bg-gray-50 p-3 rounded">
                        <span>Quantity:</span>
                        <span>×{product.quantity}</span>
                    </div>

                    <div className="flex justify-between text-2xl font-bold pt-2 border-t-4 border-green-600 bg-green-50 p-4 rounded-lg">
                        <span>Line Total:</span>
                        <span className="text-green-600">₹{product.lineTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* Profit Summary Badge */}
                {((product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0) ||
                    (product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0)) && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-green-50 border-2 border-yellow-300 rounded-lg">
                            <p className="text-sm font-semibold text-gray-800 mb-2">💰 Profit Summary:</p>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                {product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0 && (
                                    <div>
                                        <p className="text-gray-600">Manufacturing Profit:</p>
                                        <p className="font-bold text-blue-700">
                                            {product.manufacturingProfitPercentage}% = ₹{product.manufacturingProfitAmount?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                )}
                                {product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0 && (
                                    <div>
                                        <p className="text-gray-600">Boughtout Profit:</p>
                                        <p className="font-bold text-pink-700">
                                            {product.boughtoutProfitPercentage}% = ₹{product.boughtoutProfitAmount?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-yellow-300">
                                <p className="text-sm font-bold text-green-700">
                                    Total Profit: ₹{((product.manufacturingProfitAmount || 0) + (product.boughtoutProfitAmount || 0)).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}
