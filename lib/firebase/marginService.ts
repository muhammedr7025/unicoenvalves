import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface MarginSettings {
    manufacturingProfitPercentage: number;
    boughtoutProfitPercentage: number;
    negotiationMarginPercentage: number;
}

export interface GlobalMargins {
    standard: MarginSettings;
    project: MarginSettings;
}

const DEFAULT_MARGINS: GlobalMargins = {
    standard: {
        manufacturingProfitPercentage: 25,
        boughtoutProfitPercentage: 15,
        negotiationMarginPercentage: 5,
    },
    project: {
        manufacturingProfitPercentage: 20,
        boughtoutProfitPercentage: 10,
        negotiationMarginPercentage: 3,
    },
};

/**
 * Fetch global margin settings from Firestore.
 * Returns default margins if not yet configured.
 */
export async function getGlobalMargins(): Promise<GlobalMargins> {
    try {
        const docRef = doc(db, 'globalSettings', 'margins');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as GlobalMargins;
        }

        // First time: create with defaults
        await setDoc(docRef, DEFAULT_MARGINS);
        return DEFAULT_MARGINS;
    } catch (error) {
        console.error('Error fetching global margins:', error);
        return DEFAULT_MARGINS;
    }
}

/**
 * Update global margin settings (admin only).
 */
export async function updateGlobalMargins(margins: GlobalMargins): Promise<void> {
    const docRef = doc(db, 'globalSettings', 'margins');
    await setDoc(docRef, margins);
}

/**
 * Get margins for a specific pricing mode.
 */
export async function getMarginsForMode(mode: 'standard' | 'project'): Promise<MarginSettings> {
    const margins = await getGlobalMargins();
    return margins[mode];
}

/**
 * Fetch the admin-set currency exchange rate (1 USD = ₹X).
 * Returns null if not yet configured.
 */
export async function getExchangeRate(): Promise<number | null> {
    try {
        const docRef = doc(db, 'globalSettings', 'exchangeRate');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().rate || null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return null;
    }
}

/**
 * Update the currency exchange rate (admin only).
 */
export async function updateExchangeRate(rate: number): Promise<void> {
    const docRef = doc(db, 'globalSettings', 'exchangeRate');
    await setDoc(docRef, { rate, updatedAt: new Date().toISOString() });
}
