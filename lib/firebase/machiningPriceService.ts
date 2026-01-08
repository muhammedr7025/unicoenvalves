import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
} from 'firebase/firestore';
import { db } from './config';
import { MachiningPrice, MachiningComponentType } from '@/types';

// ============================================
// MACHINING PRICES - Fixed Price Lookups
// ============================================

/**
 * Get machining price for Body component
 * Lookup: seriesId + size + rating + endConnectType + materialName
 */
export async function getMachiningPriceForBody(
    seriesId: string,
    size: string,
    rating: string,
    endConnectType: string,
    materialName: string
): Promise<number | null> {
    return getMachiningPrice('Body', seriesId, size, rating, endConnectType, materialName);
}

/**
 * Get machining price for Bonnet component
 * Lookup: seriesId + size + rating + bonnetType + materialName
 */
export async function getMachiningPriceForBonnet(
    seriesId: string,
    size: string,
    rating: string,
    bonnetType: string,
    materialName: string
): Promise<number | null> {
    return getMachiningPrice('Bonnet', seriesId, size, rating, bonnetType, materialName);
}

/**
 * Get machining price for Plug component
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningPriceForPlug(
    seriesId: string,
    size: string,
    rating: string,
    trimType: string,
    materialName: string
): Promise<number | null> {
    return getMachiningPrice('Plug', seriesId, size, rating, trimType, materialName);
}

/**
 * Get machining price for Seat component
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningPriceForSeat(
    seriesId: string,
    size: string,
    rating: string,
    trimType: string,
    materialName: string
): Promise<number | null> {
    return getMachiningPrice('Seat', seriesId, size, rating, trimType, materialName);
}

/**
 * Get machining price for Stem component
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningPriceForStem(
    seriesId: string,
    size: string,
    rating: string,
    trimType: string,
    materialName: string
): Promise<number | null> {
    return getMachiningPrice('Stem', seriesId, size, rating, trimType, materialName);
}

/**
 * Get machining price for Cage component
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningPriceForCage(
    seriesId: string,
    size: string,
    rating: string,
    trimType: string,
    materialName: string
): Promise<number | null> {
    return getMachiningPrice('Cage', seriesId, size, rating, trimType, materialName);
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Generic machining price lookup
 */
async function getMachiningPrice(
    component: MachiningComponentType,
    seriesId: string,
    size: string,
    rating: string,
    typeKey: string,
    materialName: string
): Promise<number | null> {
    try {
        console.log(`Looking for ${component} machining price:`, { seriesId, size, rating, typeKey, materialName });

        const q = query(
            collection(db, 'machiningPrices'),
            where('isActive', '==', true),
            where('component', '==', component),
            where('seriesId', '==', seriesId),
            where('size', '==', size),
            where('rating', '==', rating),
            where('typeKey', '==', typeKey),
            where('materialName', '==', materialName)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log(`No machining price found for ${component}`);
            return null;
        }

        const price = snapshot.docs[0].data().fixedPrice;
        console.log(`✅ ${component} machining price found: ₹${price}`);
        return price;
    } catch (error) {
        console.error(`Error fetching ${component} machining price:`, error);
        return null;
    }
}

/**
 * Get all machining prices (for admin)
 */
export async function getAllMachiningPrices(): Promise<MachiningPrice[]> {
    try {
        const q = query(
            collection(db, 'machiningPrices'),
            where('isActive', '==', true)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as MachiningPrice));
    } catch (error) {
        console.error('Error fetching machining prices:', error);
        return [];
    }
}

/**
 * Get all machining prices including inactive (for import merge)
 */
export async function getAllMachiningPricesIncludingInactive(): Promise<MachiningPrice[]> {
    try {
        const snapshot = await getDocs(collection(db, 'machiningPrices'));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as MachiningPrice));
    } catch (error) {
        console.error('Error fetching all machining prices:', error);
        return [];
    }
}

/**
 * Get machining prices by component (for admin filtering)
 */
export async function getMachiningPricesByComponent(component: MachiningComponentType): Promise<MachiningPrice[]> {
    try {
        const q = query(
            collection(db, 'machiningPrices'),
            where('isActive', '==', true),
            where('component', '==', component)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as MachiningPrice));
    } catch (error) {
        console.error('Error fetching machining prices by component:', error);
        return [];
    }
}

/**
 * Add a machining price
 */
export async function addMachiningPrice(data: Omit<MachiningPrice, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'machiningPrices'), {
            ...data,
            isActive: true,
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding machining price:', error);
        throw error;
    }
}

/**
 * Update a machining price
 */
export async function updateMachiningPrice(id: string, data: Partial<MachiningPrice>): Promise<void> {
    try {
        const cleanData: any = { ...data };
        Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === undefined) {
                delete cleanData[key];
            }
        });

        const docRef = doc(db, 'machiningPrices', id);
        await updateDoc(docRef, cleanData);
    } catch (error) {
        console.error('Error updating machining price:', error);
        throw error;
    }
}

/**
 * Soft delete a machining price
 */
export async function deleteMachiningPrice(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'machiningPrices', id);
        await updateDoc(docRef, { isActive: false });
    } catch (error) {
        console.error('Error deleting machining price:', error);
        throw error;
    }
}

/**
 * Bulk import machining prices with upsert logic
 */
export async function bulkImportMachiningPrices(dataArray: Omit<MachiningPrice, 'id'>[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
}> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Get all existing prices for merge logic
    const existingPrices = await getAllMachiningPricesIncludingInactive();

    for (const data of dataArray) {
        try {
            // Find existing record matching all key fields
            const existing = existingPrices.find(p =>
                p.component === data.component &&
                p.seriesId === data.seriesId &&
                p.size === data.size &&
                p.rating === data.rating &&
                p.typeKey === data.typeKey &&
                p.materialName === data.materialName
            );

            if (existing) {
                // Update existing
                await updateMachiningPrice(existing.id, {
                    fixedPrice: data.fixedPrice,
                    isActive: true
                });
            } else {
                // Add new
                await addMachiningPrice(data);
            }
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`Failed to import ${data.component} for ${data.seriesId}/${data.size}/${data.rating}: ${error.message}`);
        }
    }

    return { success, failed, errors };
}
