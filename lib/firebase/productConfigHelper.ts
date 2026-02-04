import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { Material, MaterialGroup } from '@/types';

// Helper to get material by ID
export async function getMaterialById(id: string): Promise<Material | null> {
  try {
    const docRef = doc(db, 'materials', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() } as Material;
  } catch (error) {
    console.error('Error fetching material:', error);
    return null;
  }
}

// NEW: Get materials by group
export async function getMaterialsByGroup(group: MaterialGroup): Promise<Material[]> {
  try {
    const materialsRef = collection(db, 'materials');
    const q = query(
      materialsRef,
      where('materialGroup', '==', group),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Material));
  } catch (error) {
    console.error('Error fetching materials by group:', error);
    return [];
  }
}

// Get body weight
export async function getBodyWeight(
  seriesId: string,
  size: string,
  rating: string,
  endConnectType: string
): Promise<number | null> {
  try {
    console.log('Looking for body weight:', { seriesId, size, rating, endConnectType });
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('endConnectType', '==', endConnectType)
    );
    const snapshot = await getDocs(q);

    console.log('Body weight results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().weight;
  } catch (error) {
    console.error('Error fetching body weight:', error);
    return null;
  }
}

// Get bonnet weight
export async function getBonnetWeight(
  seriesId: string,
  size: string,
  rating: string,
  bonnetType: string
): Promise<number | null> {
  try {
    console.log('Looking for bonnet weight:', { seriesId, size, rating, bonnetType });
    const weightsRef = collection(db, 'bonnetWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('bonnetType', '==', bonnetType)
    );
    const snapshot = await getDocs(q);

    console.log('Bonnet weight results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().weight;
  } catch (error) {
    console.error('Error fetching bonnet weight:', error);
    return null;
  }
}

// Get plug weight (from plugWeights collection) - REMOVED plugType dependency
export interface PlugWeightResult {
  weight: number;
  hasSealRing: boolean;
  sealRingPrice: number | null;
}

export async function getPlugWeight(
  seriesId: string,
  size: string,
  rating: string
): Promise<PlugWeightResult | null> {
  try {
    console.log('Looking for plug weight:', { seriesId, size, rating });
    const weightsRef = collection(db, 'plugWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const snapshot = await getDocs(q);

    console.log('Plug weight results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
      weight: data.weight,
      hasSealRing: data.hasSealRing || false,
      sealRingPrice: data.sealRingPrice || null,
    };
  } catch (error) {
    console.error('Error fetching plug weight:', error);
    return null;
  }
}

// Get seat weight (from seatWeights collection) - REMOVED seatType dependency
export interface SeatWeightResult {
  weight: number;
  hasCage: boolean;
  cageWeight: number | null;
}

export async function getSeatWeight(
  seriesId: string,
  size: string,
  rating: string
): Promise<SeatWeightResult | null> {
  try {
    console.log('Looking for seat weight:', { seriesId, size, rating });
    const weightsRef = collection(db, 'seatWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const snapshot = await getDocs(q);

    console.log('Seat weight results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
      weight: data.weight,
      hasCage: data.hasCage || false,
      cageWeight: data.cageWeight || null,
    };
  } catch (error) {
    console.error('Error fetching seat weight:', error);
    return null;
  }
}

// Get stem fixed price (based on series, size, rating, material name)
export async function getStemFixedPrice(
  seriesId: string,
  size: string,
  rating: string,
  materialName: string
): Promise<number | null> {
  try {
    console.log('Looking for stem fixed price:', { seriesId, size, rating, materialName });
    const pricesRef = collection(db, 'stemFixedPrices');
    const q = query(
      pricesRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('materialName', '==', materialName),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Stem fixed price results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().fixedPrice;
  } catch (error) {
    console.error('Error fetching stem fixed price:', error);
    return null;
  }
}

// Get cage weight (kept for backward compatibility, uses cageWeights collection)
export async function getCageWeight(
  seriesId: string,
  size: string,
  rating: string
): Promise<number | null> {
  try {
    console.log('Looking for cage weight:', { seriesId, size, rating });
    const weightsRef = collection(db, 'cageWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Cage weight results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().weight;
  } catch (error) {
    console.error('Error fetching cage weight:', error);
    return null;
  }
}

// NEW: Get seal ring fixed price - UPDATED to use sealType
export async function getSealRingPrice(
  seriesId: string,
  sealType: string,
  size: string,
  rating: string
): Promise<number | null> {
  try {
    console.log('Looking for seal ring price:', { seriesId, sealType, size, rating });
    const pricesRef = collection(db, 'sealRingPrices');
    const q = query(
      pricesRef,
      where('seriesId', '==', seriesId),
      where('sealType', '==', sealType),
      where('size', '==', size),
      where('rating', '==', rating),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Seal ring price results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().fixedPrice;
  } catch (error) {
    console.error('Error fetching seal ring price:', error);
    return null;
  }
}

// NEW: Get pilot plug weight (similar to plug/cage weight lookup)
export async function getPilotPlugWeight(
  seriesId: string,
  size: string,
  rating: string
): Promise<number | null> {
  try {
    console.log('Looking for pilot plug weight:', { seriesId, size, rating });
    const weightsRef = collection(db, 'pilotPlugWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Pilot plug weight results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().weight;
  } catch (error) {
    console.error('Error fetching pilot plug weight:', error);
    return null;
  }
}

// NEW: Get testing presets for a specific configuration
export interface TestingPresetResult {
  id: string;
  testName: string;
  price: number;
}

export async function getTestingPresetsForConfig(
  seriesId: string,
  size: string,
  rating: string
): Promise<TestingPresetResult[]> {
  try {
    console.log('Looking for testing presets:', { seriesId, size, rating });
    const presetsRef = collection(db, 'testingPresets');
    const q = query(
      presetsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Testing presets results:', snapshot.docs.length);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      testName: doc.data().testName,
      price: doc.data().price,
    }));
  } catch (error) {
    console.error('Error fetching testing presets:', error);
    return [];
  }
}

// NEW: Get tubing presets for a specific configuration
export interface TubingPresetResult {
  id: string;
  itemName: string;
  price: number;
}

export async function getTubingPresetsForConfig(
  seriesId: string,
  size: string,
  rating: string
): Promise<TubingPresetResult[]> {
  try {
    console.log('Looking for tubing presets:', { seriesId, size, rating });
    const presetsRef = collection(db, 'tubingPresets');
    const q = query(
      presetsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Tubing presets results:', snapshot.docs.length);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      itemName: doc.data().itemName,
      price: doc.data().price,
    }));
  } catch (error) {
    console.error('Error fetching tubing presets:', error);
    return [];
  }
}

// Get available sizes for a series
export async function getAvailableSizes(seriesId: string): Promise<string[]> {
  try {
    console.log('Looking for sizes for seriesId:', seriesId);
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(weightsRef, where('seriesId', '==', seriesId));
    const snapshot = await getDocs(q);

    console.log('Found body weight documents:', snapshot.docs.length);

    const sizes = new Set<string>();
    snapshot.docs.forEach(doc => {
      const size = doc.data().size;
      console.log('Found size:', size);
      sizes.add(size);
    });

    const sizesArray = Array.from(sizes).sort();
    console.log('Available sizes:', sizesArray);
    return sizesArray;
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return [];
  }
}

// Get available ratings for  a size
export async function getAvailableRatings(seriesId: string, size: string): Promise<string[]> {
  try {
    console.log('Looking for ratings for:', seriesId, size);
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size)
    );
    const snapshot = await getDocs(q);

    console.log('Found documents for ratings:', snapshot.docs.length);

    const ratings = new Set<string>();
    snapshot.docs.forEach(doc => {
      const rating = doc.data().rating;
      console.log('Found rating:', rating);
      ratings.add(rating);
    });

    const ratingsArray = Array.from(ratings).sort();
    console.log('Available ratings:', ratingsArray);
    return ratingsArray;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

// Get available end connect types
export async function getAvailableEndConnectTypes(
  seriesId: string,
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const snapshot = await getDocs(q);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().endConnectType));

    return Array.from(types);
  } catch (error) {
    console.error('Error fetching end connect types:', error);
    return [];
  }
}

// Get available bonnet types
export async function getAvailableBonnetTypes(
  seriesId: string,
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const weightsRef = collection(db, 'bonnetWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const snapshot = await getDocs(q);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().bonnetType));

    return Array.from(types);
  } catch (error) {
    console.error('Error fetching bonnet types:', error);
    return [];
  }
}

// NEW: Get available seal types
export async function getAvailableSealTypes(
  seriesId: string,
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const pricesRef = collection(db, 'sealRingPrices');
    const q = query(
      pricesRef,
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().sealType));

    return Array.from(types);
  } catch (error) {
    console.error('Error fetching seal types:', error);
    return [];
  }
}

// Get actuator price by details
export async function getActuatorPrice(
  type: string,
  series: string,
  model: string,
  standard: 'standard' | 'special'
): Promise<number | null> {
  try {
    console.log('Looking for actuator price:', { type, series, model, standard });
    const modelsRef = collection(db, 'actuatorModels');
    const q = query(
      modelsRef,
      where('type', '==', type),
      where('series', '==', series),
      where('model', '==', model),
      where('standard', '==', standard),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Actuator price results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().fixedPrice;
  } catch (error) {
    console.error('Error fetching actuator price:', error);
    return null;
  }
}

// Get handwheel price for actuator model
// Get handwheel price by details
export async function getHandwheelPrice(
  type: string,
  series: string,
  model: string,
  standard: 'standard' | 'special'
): Promise<number | null> {
  try {
    console.log('Looking for handwheel price:', { type, series, model, standard });
    const pricesRef = collection(db, 'handwheelPrices');
    const q = query(
      pricesRef,
      where('type', '==', type),
      where('series', '==', series),
      where('model', '==', model),
      where('standard', '==', standard),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log('Handwheel price results:', snapshot.docs.length);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data().fixedPrice;
  } catch (error) {
    console.error('Error fetching handwheel price:', error);
    return null;
  }
}

// Get available actuator types
export async function getAvailableActuatorTypes(): Promise<string[]> {
  try {
    const modelsRef = collection(db, 'actuatorModels');
    const q = query(modelsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().type));

    return Array.from(types).sort();
  } catch (error) {
    console.error('Error fetching actuator types:', error);
    return [];
  }
}

// Get available actuator series for a type
export async function getAvailableActuatorSeries(type: string): Promise<string[]> {
  try {
    const modelsRef = collection(db, 'actuatorModels');
    const q = query(
      modelsRef,
      where('type', '==', type),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const seriesSet = new Set<string>();
    snapshot.docs.forEach(doc => seriesSet.add(doc.data().series));

    return Array.from(seriesSet).sort();
  } catch (error) {
    console.error('Error fetching actuator series:', error);
    return [];
  }
}

// Get available actuator models for type and series
export async function getAvailableActuatorModels(
  type: string,
  series: string
): Promise<string[]> {
  try {
    const modelsRef = collection(db, 'actuatorModels');
    const q = query(
      modelsRef,
      where('type', '==', type),
      where('series', '==', series),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const models = new Set<string>();
    snapshot.docs.forEach(doc => models.add(doc.data().model));

    return Array.from(models).sort();
  } catch (error) {
    console.error('Error fetching actuator models:', error);
    return [];
  }
}

// Get available handwheel types
export async function getAvailableHandwheelTypes(): Promise<string[]> {
  try {
    const pricesRef = collection(db, 'handwheelPrices');
    const q = query(pricesRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().type));

    return Array.from(types).sort();
  } catch (error) {
    console.error('Error fetching handwheel types:', error);
    return [];
  }
}

// Get available handwheel series for a type
export async function getAvailableHandwheelSeries(type: string): Promise<string[]> {
  try {
    const pricesRef = collection(db, 'handwheelPrices');
    const q = query(
      pricesRef,
      where('type', '==', type),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const seriesSet = new Set<string>();
    snapshot.docs.forEach(doc => seriesSet.add(doc.data().series));

    return Array.from(seriesSet).sort();
  } catch (error) {
    console.error('Error fetching handwheel series:', error);
    return [];
  }
}

// Get available handwheel models for type and series
export async function getAvailableHandwheelModels(
  type: string,
  series: string
): Promise<string[]> {
  try {
    const pricesRef = collection(db, 'handwheelPrices');
    const q = query(
      pricesRef,
      where('type', '==', type),
      where('series', '==', series),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const models = new Set<string>();
    snapshot.docs.forEach(doc => models.add(doc.data().model));

    return Array.from(models).sort();
  } catch (error) {
    console.error('Error fetching handwheel models:', error);
    return [];
  }
}
// ============================================
// MACHINING PRICE HELPERS (Fixed Price Lookups)
// ============================================

/**
 * Get available trim types from machiningPrices collection
 * Fetches unique typeKey values for Plug, Seat, Stem, Cage components
 */
export async function getAvailableTrimTypes(): Promise<string[]> {
  try {
    const { getAllMachiningPrices } = await import('./machiningPriceService');
    const allPrices = await getAllMachiningPrices();

    // Filter for trim-based components (Plug, Seat, Stem, Cage)
    const trimComponents = ['Plug', 'Seat', 'Stem', 'Cage'];
    const trimPrices = allPrices.filter(p => trimComponents.includes(p.component));

    // Get unique typeKey values
    const uniqueTrimTypes = [...new Set(trimPrices.map(p => p.typeKey))];

    // Return sorted unique values, or fallback if empty
    if (uniqueTrimTypes.length > 0) {
      return uniqueTrimTypes.sort();
    }

    // Fallback to hardcoded list if no data in Firestore
    console.warn('No trim types found in machiningPrices, using hardcoded fallback');
    return [
      'Metal Seated',
      'Soft Seated',
      'Hard Faced',
      'PTFE Seated',
      'Ceramic Seated',
    ];
  } catch (error) {
    console.error('Error fetching trim types:', error);
    // Return fallback on error
    return [
      'Metal Seated',
      'Soft Seated',
      'Hard Faced',
      'PTFE Seated',
      'Ceramic Seated',
    ];
  }
}

// ============================================
// FIXED MACHINING PRICE LOOKUPS
// These replace the old workHours × machineRate calculation
// ============================================

/**
 * Get machining cost for Body
 * Lookup: seriesId + size + rating + endConnectType + materialName
 */
export async function getMachiningCostForBody(
  seriesId: string,
  size: string,
  rating: string,
  endConnectType: string,
  materialName: string
): Promise<number | null> {
  try {
    const { getMachiningPriceForBody } = await import('./machiningPriceService');
    return getMachiningPriceForBody(seriesId, size, rating, endConnectType, materialName);
  } catch (error) {
    console.error('Error fetching Body machining cost:', error);
    return null;
  }
}

/**
 * Get machining cost for Bonnet
 * Lookup: seriesId + size + rating + bonnetType + materialName
 */
export async function getMachiningCostForBonnet(
  seriesId: string,
  size: string,
  rating: string,
  bonnetType: string,
  materialName: string
): Promise<number | null> {
  try {
    const { getMachiningPriceForBonnet } = await import('./machiningPriceService');
    return getMachiningPriceForBonnet(seriesId, size, rating, bonnetType, materialName);
  } catch (error) {
    console.error('Error fetching Bonnet machining cost:', error);
    return null;
  }
}

/**
 * Get machining cost for Plug
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningCostForPlug(
  seriesId: string,
  size: string,
  rating: string,
  trimType: string,
  materialName: string
): Promise<number | null> {
  try {
    const { getMachiningPriceForPlug } = await import('./machiningPriceService');
    return getMachiningPriceForPlug(seriesId, size, rating, trimType, materialName);
  } catch (error) {
    console.error('Error fetching Plug machining cost:', error);
    return null;
  }
}

/**
 * Get machining cost for Seat
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningCostForSeat(
  seriesId: string,
  size: string,
  rating: string,
  trimType: string,
  materialName: string
): Promise<number | null> {
  try {
    const { getMachiningPriceForSeat } = await import('./machiningPriceService');
    return getMachiningPriceForSeat(seriesId, size, rating, trimType, materialName);
  } catch (error) {
    console.error('Error fetching Seat machining cost:', error);
    return null;
  }
}

/**
 * Get machining cost for Stem
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningCostForStem(
  seriesId: string,
  size: string,
  rating: string,
  trimType: string,
  materialName: string
): Promise<number | null> {
  try {
    const { getMachiningPriceForStem } = await import('./machiningPriceService');
    return getMachiningPriceForStem(seriesId, size, rating, trimType, materialName);
  } catch (error) {
    console.error('Error fetching Stem machining cost:', error);
    return null;
  }
}

/**
 * Get machining cost for Cage
 * Lookup: seriesId + size + rating + trimType + materialName
 */
export async function getMachiningCostForCage(
  seriesId: string,
  size: string,
  rating: string,
  trimType: string,
  materialName: string
): Promise<number | null> {
  try {
    const { getMachiningPriceForCage } = await import('./machiningPriceService');
    return getMachiningPriceForCage(seriesId, size, rating, trimType, materialName);
  } catch (error) {
    console.error('Error fetching Cage machining cost:', error);
    return null;
  }
}

// Note: Seal Ring has NO machining cost - only fixed price