import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import {
  Material,
  MaterialGroup,
  Series,
  BodyWeight,
  BonnetWeight,
} from '@/types';

// Materials
export async function getAllMaterials(): Promise<Material[]> {
  try {
    const materialsRef = collection(db, 'materials');
    const q = query(materialsRef, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      pricePerKg: doc.data().pricePerKg,
      materialGroup: doc.data().materialGroup || 'BodyBonnet',
      isActive: doc.data().isActive ?? true,
    })) as Material[];
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}

// Get materials by group
export async function getMaterialsByGroup(group: MaterialGroup): Promise<Material[]> {
  try {
    console.log('Fetching materials for group:', group); // DEBUG
    const materialsRef = collection(db, 'materials');
    const q = query(
      materialsRef,
      where('materialGroup', '==', group),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    console.log(`Found ${snapshot.docs.length} materials for group ${group}`); // DEBUG

    const materials = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      pricePerKg: doc.data().pricePerKg,
      materialGroup: doc.data().materialGroup,
      isActive: doc.data().isActive,
    })) as Material[];

    console.log('Materials:', materials); // DEBUG
    return materials;
  } catch (error) {
    console.error('Error fetching materials by group:', error);
    return [];
  }
}
// Series
export async function getAllSeries(): Promise<Series[]> {
  try {
    const seriesRef = collection(db, 'series');
    const snapshot = await getDocs(seriesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      productType: doc.data().productType,
      seriesNumber: doc.data().seriesNumber,
      name: doc.data().name,
      hasCage: doc.data().hasCage ?? false,
      hasSealRing: doc.data().hasSealRing ?? false,
      isActive: doc.data().isActive ?? true,
    })) as Series[];
  } catch (error) {
    console.error('Error fetching series:', error);
    return [];
  }
}

// Body Weights
export async function getAllBodyWeights(): Promise<BodyWeight[]> {
  try {
    const weightsRef = collection(db, 'bodyWeights');
    const snapshot = await getDocs(weightsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BodyWeight[];
  } catch (error) {
    console.error('Error fetching body weights:', error);
    return [];
  }
}

// Bonnet Weights
export async function getAllBonnetWeights(): Promise<BonnetWeight[]> {
  try {
    const weightsRef = collection(db, 'bonnetWeights');
    const snapshot = await getDocs(weightsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BonnetWeight[];
  } catch (error) {
    console.error('Error fetching bonnet weights:', error);
    return [];
  }
}

// Plug Weights
export async function getAllPlugWeights() {
  try {
    const weightsRef = collection(db, 'plugWeights');
    const snapshot = await getDocs(weightsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching plug weights:', error);
    return [];
  }
}

// Seat Weights
export async function getAllSeatWeights() {
  try {
    const weightsRef = collection(db, 'seatWeights');
    const snapshot = await getDocs(weightsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching seat weights:', error);
    return [];
  }
}

// Stem Fixed Prices
export async function getAllStemFixedPrices() {
  try {
    const pricesRef = collection(db, 'stemFixedPrices');
    const snapshot = await getDocs(pricesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching stem fixed prices:', error);
    return [];
  }
}

// Cage Weights
export async function getAllCageWeights() {
  try {
    const weightsRef = collection(db, 'cageWeights');
    const snapshot = await getDocs(weightsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching cage weights:', error);
    return [];
  }
}

// Seal Ring Prices
export async function getAllSealRingPrices() {
  try {
    const pricesRef = collection(db, 'sealRingPrices');
    const snapshot = await getDocs(pricesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching seal ring prices:', error);
    return [];
  }
}

// Actuator Models
export async function getAllActuatorModels() {
  try {
    const snapshot = await getDocs(collection(db, 'actuatorModels'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching actuator models:', error);
    return [];
  }
}

// Handwheel Prices
export async function getAllHandwheelPrices() {
  try {
    const snapshot = await getDocs(collection(db, 'handwheelPrices'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching handwheel prices:', error);
    return [];
  }
}

// Helper to generate unique keys for merging
const getMaterialKey = (m: any) => m.name;
const getSeriesKey = (s: any) => s.seriesNumber;
const getBodyWeightKey = (b: any) => `${b.seriesId}_${b.size}_${b.rating}_${b.endConnectType}`;
const getBonnetWeightKey = (b: any) => `${b.seriesId}_${b.size}_${b.rating}_${b.bonnetType}`;
const getPlugWeightKey = (p: any) => `${p.seriesId}_${p.size}_${p.rating}`;
const getSeatWeightKey = (s: any) => `${s.seriesId}_${s.size}_${s.rating}`;
const getStemPriceKey = (s: any) => `${s.seriesId}_${s.size}_${s.rating}_${s.materialName}`;
const getCageWeightKey = (c: any) => `${c.seriesId}_${c.size}_${c.rating}`;
const getSealRingPriceKey = (s: any) => `${s.seriesId}_${s.sealType}_${s.size}_${s.rating}`;
const getActuatorModelKey = (a: any) => `${a.type}_${a.series}_${a.model}_${a.standard}`;
const getHandwheelPriceKey = (h: any) => `${h.type}_${h.series}_${h.model}_${h.standard}`;

// Generic merge function
async function mergeCollection(
  collectionName: string,
  data: any[],
  getKey: (item: any) => string
) {
  console.log(`Merging ${collectionName}...`);
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);

  // Map existing docs by key
  const existingDocs = new Map();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    existingDocs.set(getKey(data), doc.ref);
  });

  const batchSize = 500;
  let batch = writeBatch(db);
  let count = 0;

  for (const item of data) {
    const key = getKey(item);
    const docRef = existingDocs.get(key);

    if (docRef) {
      batch.update(docRef, item);
    } else {
      const newDocRef = doc(colRef);
      batch.set(newDocRef, item);
    }

    count++;
    if (count >= batchSize) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
  console.log(`Merged ${data.length} items into ${collectionName}`);
}

// Bulk Import from Excel (Merge Mode)
export async function importPricingData(data: any): Promise<void> {
  try {
    console.log('Starting import (merge) process...');

    // 1. Materials - Import first
    const materials = data.materials.map((item: any) => ({
      name: String(item['Material Name']).trim(),
      pricePerKg: parseFloat(item['Price Per Kg (INR)']) || 0,
      materialGroup: String(item['Material Group']).trim() || 'BodyBonnet',
      isActive: String(item.Active).toUpperCase() === 'TRUE',
    }));
    await mergeCollection('materials', materials, getMaterialKey);

    // 2. Series - Import second and build lookup map
    const series = data.series.map((item: any) => ({
      productType: String(item['Product Type']).trim(),
      seriesNumber: String(item['Series Number']).trim(),
      name: String(item['Series Name']).trim(),
      hasCage: String(item['Has Cage']).toUpperCase() === 'TRUE',
      hasSealRing: String(item['Has Seal Ring']).toUpperCase() === 'TRUE',
      isActive: String(item.Active).toUpperCase() === 'TRUE',
    }));
    await mergeCollection('series', series, getSeriesKey);

    // Build series lookup map: seriesNumber -> seriesId
    const seriesSnapshot = await getDocs(collection(db, 'series'));
    const seriesMap = new Map<string, string>();
    seriesSnapshot.docs.forEach(doc => {
      seriesMap.set(doc.data().seriesNumber, doc.id);
    });

    // 3. Body Weights - Use actual series ID
    const bodyWeights = data.bodyWeights.map((item: any) => {
      const seriesNumber = String(item['Series Number']).trim();
      const seriesId = seriesMap.get(seriesNumber);
      if (!seriesId) {
        console.warn(`Series not found for number: ${seriesNumber}`);
      }
      return {
        seriesId: seriesId || seriesNumber, // Fallback to seriesNumber if not found
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        endConnectType: String(item['End Connect Type']).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      };
    });
    await mergeCollection('bodyWeights', bodyWeights, getBodyWeightKey);

    // 4. Bonnet Weights
    const bonnetWeights = data.bonnetWeights.map((item: any) => {
      const seriesNumber = String(item['Series Number']).trim();
      const seriesId = seriesMap.get(seriesNumber);
      return {
        seriesId: seriesId || seriesNumber,
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        bonnetType: String(item['Bonnet Type']).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      };
    });
    await mergeCollection('bonnetWeights', bonnetWeights, getBonnetWeightKey);

    // 5. Plug Weights
    const plugWeights = data.plugWeights.map((item: any) => {
      const seriesNumber = String(item['Series Number']).trim();
      const seriesId = seriesMap.get(seriesNumber);
      const hasSealRing = String(item['Has Seal Ring'] || '').toUpperCase() === 'TRUE';
      const sealRingPrice = hasSealRing ? (parseFloat(item['Seal Ring Price']) || 0) : null;
      return {
        seriesId: seriesId || seriesNumber,
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        hasSealRing: hasSealRing,
        sealRingPrice: sealRingPrice,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      };
    });
    await mergeCollection('plugWeights', plugWeights, getPlugWeightKey);

    // 6. Seat Weights
    const seatWeights = data.seatWeights.map((item: any) => {
      const seriesNumber = String(item['Series Number']).trim();
      const seriesId = seriesMap.get(seriesNumber);
      const hasCage = String(item['Has Cage'] || '').toUpperCase() === 'TRUE';
      const cageWeight = hasCage ? (parseFloat(item['Cage Weight']) || null) : null;
      return {
        seriesId: seriesId || seriesNumber,
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        hasCage: hasCage,
        cageWeight: cageWeight,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      };
    });
    await mergeCollection('seatWeights', seatWeights, getSeatWeightKey);

    // 7. Stem Fixed Prices
    const stemFixedPrices = data.stemFixedPrices.map((item: any) => {
      const seriesNumber = String(item['Series Number']).trim();
      const seriesId = seriesMap.get(seriesNumber);
      return {
        seriesId: seriesId || seriesNumber,
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        materialName: String(item['Material Name']).trim(),
        fixedPrice: parseFloat(item['Fixed Price']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      };
    });
    await mergeCollection('stemFixedPrices', stemFixedPrices, getStemPriceKey);

    // 8. Cage Weights
    if (data.cageWeights && data.cageWeights.length > 0) {
      const cageWeights = data.cageWeights.map((item: any) => {
        const seriesNumber = String(item['Series Number']).trim();
        const seriesId = seriesMap.get(seriesNumber);
        return {
          seriesId: seriesId || seriesNumber,
          size: String(item.Size).trim(),
          rating: String(item.Rating).trim(),
          weight: parseFloat(item['Weight (kg)']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };
      });
      await mergeCollection('cageWeights', cageWeights, getCageWeightKey);
    }

    // 9. Seal Ring Prices
    if (data.sealRingPrices && data.sealRingPrices.length > 0) {
      const sealRingPrices = data.sealRingPrices.map((item: any) => {
        const seriesNumber = String(item['Series Number']).trim();
        const seriesId = seriesMap.get(seriesNumber);
        return {
          seriesId: seriesId || seriesNumber,
          sealType: String(item['Seal Type']).trim(),
          size: String(item.Size).trim(),
          rating: String(item.Rating).trim(),
          fixedPrice: parseFloat(item['Fixed Price']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };
      });
      await mergeCollection('sealRingPrices', sealRingPrices, getSealRingPriceKey);
    }

    // 10. Actuator Models
    if (data.actuatorModels && data.actuatorModels.length > 0) {
      const actuatorModels = data.actuatorModels.map((item: any) => ({
        type: String(item.Type).trim(),
        series: String(item.Series).trim(),
        model: String(item.Model).trim(),
        standard: String(item['Standard/Special']).toLowerCase().trim(),
        fixedPrice: parseFloat(item['Fixed Price']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      }));
      await mergeCollection('actuatorModels', actuatorModels, getActuatorModelKey);
    }

    // 11. Handwheel Prices
    if (data.handwheelPrices && data.handwheelPrices.length > 0) {
      const handwheelPrices = data.handwheelPrices.map((item: any) => ({
        type: String(item.Type).trim(),
        series: String(item.Series).trim(),
        model: String(item.Model).trim(),
        standard: String(item['Standard/Special']).toLowerCase().trim(),
        fixedPrice: parseFloat(item['Fixed Price']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      }));
      await mergeCollection('handwheelPrices', handwheelPrices, (h: any) => `${h.type}_${h.series}_${h.model}_${h.standard}`);
    }

    console.log('Import (merge) completed successfully!');
  } catch (error) {
    console.error('Error importing pricing data:', error);
    throw error;
  }
}

// Delete all pricing data (with proper batch handling for large collections)
export async function clearAllPricingData(): Promise<void> {
  try {
    console.log('Clearing all pricing data...');

    const collections = [
      'materials',
      'series',
      'bodyWeights',
      'bonnetWeights',
      'plugWeights',
      'seatWeights',
      'stemFixedPrices',
      'cageWeights',
      'sealRingPrices',
      'actuatorModels',
      'handwheelPrices',
    ];

    for (const collectionName of collections) {
      console.log(`Clearing ${collectionName}...`);
      const snapshot = await getDocs(collection(db, collectionName));

      if (snapshot.docs.length === 0) {
        console.log(`${collectionName} is empty, skipping...`);
        continue;
      }

      // Process in batches of 450 (Firestore limit is 500)
      const batchSize = 450;
      let batch = writeBatch(db);
      let count = 0;
      let totalDeleted = 0;

      for (const docSnapshot of snapshot.docs) {
        batch.delete(docSnapshot.ref);
        count++;
        totalDeleted++;

        if (count >= batchSize) {
          await batch.commit();
          console.log(`Deleted batch of ${count} documents from ${collectionName}`);
          batch = writeBatch(db);
          count = 0;
        }
      }

      // Commit remaining
      if (count > 0) {
        await batch.commit();
        console.log(`Deleted remaining ${count} documents from ${collectionName}`);
      }

      console.log(`✅ Cleared ${totalDeleted} documents from ${collectionName}`);
    }

    console.log('All pricing data cleared successfully!');
  } catch (error) {
    console.error('Error clearing pricing data:', error);
    throw error;
  }
}

// Update a single document in any collection
export async function updatePricingDocument(
  collectionName: string,
  docId: string,
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    const batch = writeBatch(db);
    batch.update(docRef, data);
    await batch.commit();
    console.log(`Updated document ${docId} in ${collectionName}`);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}


// Delete a single document from any collection
export async function deletePricingDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`Deleted document ${docId} from ${collectionName}`);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}