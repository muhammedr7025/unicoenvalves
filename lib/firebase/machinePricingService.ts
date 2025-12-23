import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { MachineType, WorkHourData, ComponentType } from '@/types';

// ============================================
// MACHINE TYPES
// ============================================

export async function getMachineTypes(): Promise<MachineType[]> {
    try {
        const q = query(
            collection(db, 'machineTypes'),
            where('isActive', '==', true),
            orderBy('name', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as MachineType));
    } catch (error) {
        console.error('Error fetching machine types:', error);
        return [];
    }
}

export async function getMachineTypeById(id: string): Promise<MachineType | null> {
    try {
        const docRef = doc(db, 'machineTypes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as MachineType;
        }
        return null;
    } catch (error) {
        console.error('Error fetching machine type:', error);
        return null;
    }
}

export async function addMachineType(data: Omit<MachineType, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'machineTypes'), {
            ...data,
            isActive: true,
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding machine type:', error);
        throw error;
    }
}

export async function updateMachineType(id: string, data: Partial<MachineType>): Promise<void> {
    try {
        const docRef = doc(db, 'machineTypes', id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error updating machine type:', error);
        throw error;
    }
}

export async function deleteMachineType(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'machineTypes', id);
        await updateDoc(docRef, { isActive: false });
    } catch (error) {
        console.error('Error deleting machine type:', error);
        throw error;
    }
}

// ============================================
// WORK HOURS DATA
// ============================================

export async function getWorkHours(): Promise<WorkHourData[]> {
    try {
        const q = query(
            collection(db, 'workHours'),
            where('isActive', '==', true)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as WorkHourData));
    } catch (error) {
        console.error('Error fetching work hours:', error);
        return [];
    }
}

export async function getWorkHoursByComponent(component: ComponentType): Promise<WorkHourData[]> {
    try {
        const q = query(
            collection(db, 'workHours'),
            where('isActive', '==', true),
            where('component', '==', component)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as WorkHourData));
    } catch (error) {
        console.error('Error fetching work hours by component:', error);
        return [];
    }
}

/**
 * Get specific work hour data for a component
 * For Body and Bonnet: trimType should be null/undefined
 * For Plug, Seat, Stem, Cage, SealRing: trimType is required
 */
export async function getWorkHourData(
    seriesId: string,
    size: string,
    rating: string,
    component: ComponentType,
    trimType?: string
): Promise<WorkHourData | null> {
    try {
        let q;

        if (component === 'Body' || component === 'Bonnet') {
            // Body and Bonnet don't use trimType
            q = query(
                collection(db, 'workHours'),
                where('isActive', '==', true),
                where('component', '==', component),
                where('seriesId', '==', seriesId),
                where('size', '==', size),
                where('rating', '==', rating)
            );
        } else {
            // Other components use trimType
            if (!trimType) {
                console.warn(`Trim type required for component: ${component}`);
                return null;
            }
            q = query(
                collection(db, 'workHours'),
                where('isActive', '==', true),
                where('component', '==', component),
                where('seriesId', '==', seriesId),
                where('size', '==', size),
                where('rating', '==', rating),
                where('trimType', '==', trimType)
            );
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log(`No work hour data found for ${component}: Series ${seriesId}, Size ${size}, Rating ${rating}${trimType ? `, Trim ${trimType}` : ''}`);
            return null;
        }

        const data = snapshot.docs[0].data();
        return {
            id: snapshot.docs[0].id,
            ...data,
        } as WorkHourData;
    } catch (error) {
        console.error('Error fetching work hour data:', error);
        return null;
    }
}

export async function addWorkHourData(data: Omit<WorkHourData, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'workHours'), {
            ...data,
            isActive: true,
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding work hour data:', error);
        throw error;
    }
}

export async function updateWorkHourData(id: string, data: Partial<WorkHourData>): Promise<void> {
    try {
        const docRef = doc(db, 'workHours', id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error updating work hour data:', error);
        throw error;
    }
}

export async function deleteWorkHourData(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'workHours', id);
        await updateDoc(docRef, { isActive: false });
    } catch (error) {
        console.error('Error deleting work hour data:', error);
        throw error;
    }
}

/**
 * Bulk import work hours data
 * Useful for Excel imports
 */
export async function bulkImportWorkHours(dataArray: Omit<WorkHourData, 'id'>[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
}> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const data of dataArray) {
        try {
            await addWorkHourData(data);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`Failed to import ${data.component} for Series ${data.seriesId}: ${error.message}`);
        }
    }

    return { success, failed, errors };
}

/**
 * Bulk import machine types
 * Useful for Excel imports
 */
export async function bulkImportMachineTypes(dataArray: Omit<MachineType, 'id'>[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
}> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const data of dataArray) {
        try {
            await addMachineType(data);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`Failed to import machine type ${data.name}: ${error.message}`);
        }
    }

    return { success, failed, errors };
}

// ============================================
// TRIM TYPES
// ============================================

/**
 * Get available trim types
 * For Phase 1, we'll use a hardcoded list
 * In Phase 2, this can be made dynamic from Firestore
 */
export async function getAvailableTrimTypes(): Promise<string[]> {
    // Hardcoded list for Phase 1
    return [
        'Metal Seated',
        'Soft Seated',
        'Hard Faced',
        'PTFE Seated',
        'Ceramic Seated',
    ];
}
