// Commercial Terms UI Component for new-quote page
// Insert this after the packaging price section and before notes

{/* Commercial Terms & Conditions */ }
<div className="mb-6 bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
    <h3 className="text-lg font-bold mb-4 text-indigo-900">💼 Commercial Terms & Conditions</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price Type */}
        <div>
            <label className="block text-sm font-medium mb-2">Prices</label>
            <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
            >
                <option value="Ex-Works INR each net">Ex-Works INR each net</option>
                <option value="Ex-Works Coimbatore">Ex-Works Coimbatore</option>
                <option value="F.O.R sites">F.O.R sites</option>
                <option value="CIF">CIF</option>
            </select>
        </div>

        {/* Validity */}
        <div>
            <label className="block text-sm font-medium mb-2">Validity</label>
            <input
                type="text"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="30 days from the date of quote"
            />
        </div>

        {/* Delivery */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Delivery (Ex-Works)</label>
            <textarea
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="24 working weeks from the date of advance payment..."
            />
        </div>

        {/* Warranty */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Warranty</label>
            <textarea
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="UVPL Standard Warranty - 18 months from shipping..."
            />
        </div>

        {/* Payment */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Payment Terms</label>
            <textarea
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="20% with the order + 30% against drawings + Balance before shipping"
            />
        </div>
    </div>
</div>
