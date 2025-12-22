// UPDATED PLUG WEIGHTS IMPORT - Copy this to replace lines 390-433 in pricingService.ts

console.log('Importing plug weights...');
// Import plug weights (unique key: seriesId + size + rating)
for (const item of data.plugWeights) {
    try {
        const seriesId = String(item['Series Number']).trim();
        const size = String(item.Size).trim();
        const rating = String(item.Rating).trim();

        const existingQuery = query(
            collection(db, 'plugWeights'),
            where('seriesId', '==', seriesId),
            where('size', '==', size),
            where('rating', '==', rating)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
            seriesId,
            size,
            rating,
            weight: parseFloat(item['Weight (kg)']) || 0,
            isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
            const docRef = doc(db, 'plugWeights', existingDocs.docs[0].id);
            await updateDoc(docRef, newData);
            stats.updated++;
        } else {
            await addDoc(collection(db, 'plugWeights'), newData);
            stats.added++;
        }
    } catch (error) {
        console.error('Error processing plug weight:', error);
        stats.errors++;
    }
}
