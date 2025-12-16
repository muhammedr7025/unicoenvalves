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
  seriesNumber: string,
  size: string,
  rating: string,
  endConnectType: string
): Promise<number | null> {
  try {
    console.log('Looking for body weight:', { seriesNumber, size, rating, endConnectType });
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
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
  seriesNumber: string,
  size: string,
  rating: string,
  bonnetType: string
): Promise<number | null> {
  try {
    console.log('Looking for bonnet weight:', { seriesNumber, size, rating, bonnetType });
    const weightsRef = collection(db, 'bonnetWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
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

// Get plug weight (from plugWeights collection) - now returns seal ring info as well
export interface PlugWeightResult {
  weight: number;
  hasSealRing: boolean;
  sealRingPrice: number | null;
}

export async function getPlugWeight(
  seriesNumber: string,
  size: string,
  rating: string,
  plugType: string
): Promise<PlugWeightResult | null> {
  try {
    console.log('Looking for plug weight:', { seriesNumber, size, rating, plugType });
    const weightsRef = collection(db, 'plugWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
      where('size', '==', size),
      where('rating', '==', rating),
      where('plugType', '==', plugType)
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

// Get seat weight (from seatWeights collection) - now returns cage info as well
export interface SeatWeightResult {
  weight: number;
  hasCage: boolean;
  cageWeight: number | null;
}

export async function getSeatWeight(
  seriesNumber: string,
  size: string,
  rating: string,
  seatType: string
): Promise<SeatWeightResult | null> {
  try {
    console.log('Looking for seat weight:', { seriesNumber, size, rating, seatType });
    const weightsRef = collection(db, 'seatWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
      where('size', '==', size),
      where('rating', '==', rating),
      where('seatType', '==', seatType)
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
  seriesNumber: string,
  size: string,
  rating: string,
  materialName: string
): Promise<number | null> {
  try {
    console.log('Looking for stem fixed price:', { seriesNumber, size, rating, materialName });
    const pricesRef = collection(db, 'stemFixedPrices');
    const q = query(
      pricesRef,
      where('seriesId', '==', seriesNumber),
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
  seriesNumber: string,
  size: string,
  rating: string
): Promise<number | null> {
  try {
    console.log('Looking for cage weight:', { seriesNumber, size, rating });
    const weightsRef = collection(db, 'cageWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
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

// NEW: Get seal ring fixed price
export async function getSealRingPrice(
  seriesNumber: string,
  plugType: string,
  size: string,
  rating: string
): Promise<number | null> {
  try {
    console.log('Looking for seal ring price:', { seriesNumber, plugType, size, rating });
    const pricesRef = collection(db, 'sealRingPrices');
    const q = query(
      pricesRef,
      where('seriesId', '==', seriesNumber),
      where('plugType', '==', plugType),
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

// Get available sizes for a series
export async function getAvailableSizes(seriesNumber: string): Promise<string[]> {
  try {
    console.log('Looking for sizes for series:', seriesNumber);
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(weightsRef, where('seriesId', '==', seriesNumber));
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

// Get available ratings for a size
export async function getAvailableRatings(seriesNumber: string, size: string): Promise<string[]> {
  try {
    console.log('Looking for ratings for:', seriesNumber, size);
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
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
  seriesNumber: string,
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const weightsRef = collection(db, 'bodyWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
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
  seriesNumber: string,
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const weightsRef = collection(db, 'bonnetWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
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

// Get available plug types
export async function getAvailablePlugTypes(
  seriesNumber: string,
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const weightsRef = collection(db, 'plugWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const snapshot = await getDocs(q);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().plugType));

    return Array.from(types);
  } catch (error) {
    console.error('Error fetching plug types:', error);
    return [];
  }
}

// Get available seat types
export async function getAvailableSeatTypes(
  seriesNumber: string,
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const weightsRef = collection(db, 'seatWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const snapshot = await getDocs(q);

    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().seatType));

    return Array.from(types);
  } catch (error) {
    console.error('Error fetching seat types:', error);
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
export async function getHandwheelPrice(actuatorModel: string): Promise<number | null> {
  try {
    console.log('Looking for handwheel price for:', actuatorModel);
    const pricesRef = collection(db, 'handwheelPrices');
    const q = query(
      pricesRef,
      where('actuatorModel', '==', actuatorModel),
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