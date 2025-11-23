import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
import {
  Material,
  BodyWeight,
  BonnetWeight,
  ComponentWeight,
  CagePrice,
} from '@/types';

// Helper to get material by ID
export async function getMaterialById(id: string): Promise<Material | null> {
  try {
    const materialsRef = collection(db, 'materials');
    const q = query(materialsRef, where('__name__', '==', id));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Material;
  } catch (error) {
    console.error('Error fetching material:', error);
    return null;
  }
}

// Get body weight - NOW USING seriesNumber instead of seriesId
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
      where('seriesId', '==', seriesNumber), // This is actually seriesNumber in our data
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

// Get component weight (plug, seat, stem)
export async function getComponentWeight(
  seriesNumber: string,
  componentType: 'plug' | 'seat' | 'stem',
  size: string,
  rating: string,
  type: string
): Promise<number | null> {
  try {
    console.log('Looking for component weight:', { seriesNumber, componentType, size, rating, type });
    const weightsRef = collection(db, 'componentWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
      where('componentType', '==', componentType),
      where('size', '==', size),
      where('rating', '==', rating),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);
    
    console.log(`${componentType} weight results:`, snapshot.docs.length);
    
    if (snapshot.empty) return null;
    
    return snapshot.docs[0].data().weight;
  } catch (error) {
    console.error('Error fetching component weight:', error);
    return null;
  }
}

// Get cage price
export async function getCagePrice(
  seriesNumber: string,
  size: string
): Promise<number | null> {
  try {
    console.log('Looking for cage price:', { seriesNumber, size });
    const pricesRef = collection(db, 'cagePrices');
    const q = query(
      pricesRef,
      where('seriesId', '==', seriesNumber),
      where('size', '==', size)
    );
    const snapshot = await getDocs(q);
    
    console.log('Cage price results:', snapshot.docs.length);
    
    if (snapshot.empty) return null;
    
    return snapshot.docs[0].data().fixedPrice;
  } catch (error) {
    console.error('Error fetching cage price:', error);
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

// Get available component types (plug, seat, stem)
export async function getAvailableComponentTypes(
  seriesNumber: string,
  componentType: 'plug' | 'seat' | 'stem',
  size: string,
  rating: string
): Promise<string[]> {
  try {
    const weightsRef = collection(db, 'componentWeights');
    const q = query(
      weightsRef,
      where('seriesId', '==', seriesNumber),
      where('componentType', '==', componentType),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const snapshot = await getDocs(q);
    
    const types = new Set<string>();
    snapshot.docs.forEach(doc => types.add(doc.data().type));
    
    return Array.from(types);
  } catch (error) {
    console.error('Error fetching component types:', error);
    return [];
  }
}