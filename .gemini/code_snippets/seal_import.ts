// UPDATED SEAL RING PRICES IMPORT - Copy this to replace lines 561-602 in pricingService.ts

console.log('Importing seal ring prices...');
// Import seal ring prices (unique key: seriesId + sealType + size + rating)
if (data.sealRingPrices && data.sealRingPrices.length > 0) {
    for (const item of data.sealRingPrices) {
        try {
            const seriesId = String(item['Series Number']).trim();
            const sealType = String(item['Seal Type']).trim();  // CHANGED from 'Plug Type'
            const size = String(item.Size).trim();
            const rating = String(item.Rating).trim();

            const existingQuery = query(
                collection(db, 'sealRingPrices'),
                where('seriesId', '==', seriesId),
                where('sealType', '==', sealType),  // CHANGED from plugType
                where('size', '==', size),
                where('rating', '==', rating)
            );
            const existingDocs = await getDocs(existingQuery);

            const newData = {
                seriesId,
                sealType,  // CHANGED from plugType
                size,
                rating,
                fixedPrice: parseFloat(item['Fixed Price']) || 0,
                isActive: String(item.Active).toUpperCase() === 'TRUE',
            };

            if (!existingDocs.empty) {
                const docRef = doc(db, 'sealRingPrices', existingDocs.docs[0].id);
                await updateDoc(docRef, newData);
                stats.updated++;
            } else {
                await addDoc(collection(db, 'sealRingPrices'), newData);
                stats.added++;
            }
        } catch (error) {
            console.error('Error processing seal ring price:', error);
            stats.errors++;
        }
    }
}
