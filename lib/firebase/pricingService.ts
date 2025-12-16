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

// Bulk Import from Excel
export async function importPricingData(data: any): Promise<void> {
  try {
    console.log('Starting import process...');

    // Clear all existing data
    await clearAllPricingData();

    console.log('Importing materials...');
    // Import materials (without material code)
    for (const item of data.materials) {
      await addDoc(collection(db, 'materials'), {
        name: String(item['Material Name']).trim(),
        pricePerKg: parseFloat(item['Price Per Kg (INR)']) || 0,
        materialGroup: String(item['Material Group']).trim() || 'BodyBonnet',
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing series...');
    // Import series with hasSealRing
    for (const item of data.series) {
      await addDoc(collection(db, 'series'), {
        productType: String(item['Product Type']).trim(),
        seriesNumber: String(item['Series Number']).trim(),
        name: String(item['Series Name']).trim(),
        hasCage: String(item['Has Cage']).toUpperCase() === 'TRUE',
        hasSealRing: String(item['Has Seal Ring']).toUpperCase() === 'TRUE',
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing body weights...');
    // Import body weights
    for (const item of data.bodyWeights) {
      await addDoc(collection(db, 'bodyWeights'), {
        seriesId: String(item['Series Number']).trim(),
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        endConnectType: String(item['End Connect Type']).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing bonnet weights...');
    // Import bonnet weights
    for (const item of data.bonnetWeights) {
      await addDoc(collection(db, 'bonnetWeights'), {
        seriesId: String(item['Series Number']).trim(),
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        bonnetType: String(item['Bonnet Type']).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing plug weights...');
    // Import plug weights (now includes seal ring data)
    for (const item of data.plugWeights) {
      const hasSealRing = String(item['Has Seal Ring'] || '').toUpperCase() === 'TRUE';
      const sealRingPrice = hasSealRing ? (parseFloat(item['Seal Ring Price']) || 0) : null;

      await addDoc(collection(db, 'plugWeights'), {
        seriesId: String(item['Series Number']).trim(),
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        plugType: String(item['Plug Type']).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        hasSealRing: hasSealRing,
        sealRingPrice: sealRingPrice,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing seat weights...');
    // Import seat weights (now includes cage data)
    for (const item of data.seatWeights) {
      const hasCage = String(item['Has Cage'] || '').toUpperCase() === 'TRUE';
      const cageWeight = hasCage ? (parseFloat(item['Cage Weight']) || null) : null;

      await addDoc(collection(db, 'seatWeights'), {
        seriesId: String(item['Series Number']).trim(),
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        seatType: String(item['Seat Type']).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        hasCage: hasCage,
        cageWeight: cageWeight,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing stem fixed prices...');
    // Import stem fixed prices (uses material name for lookup)
    for (const item of data.stemFixedPrices) {
      await addDoc(collection(db, 'stemFixedPrices'), {
        seriesId: String(item['Series Number']).trim(),
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        materialName: String(item['Material Name']).trim(),
        fixedPrice: parseFloat(item['Fixed Price']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing cage weights...');
    // Import cage weights (changed from fixed prices)
    for (const item of data.cageWeights) {
      await addDoc(collection(db, 'cageWeights'), {
        seriesId: String(item['Series Number']).trim(),
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        weight: parseFloat(item['Weight (kg)']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing seal ring prices...');
    // Import seal ring prices (NEW)
    for (const item of data.sealRingPrices) {
      await addDoc(collection(db, 'sealRingPrices'), {
        seriesId: String(item['Series Number']).trim(),
        plugType: String(item['Plug Type']).trim(),
        size: String(item.Size).trim(),
        rating: String(item.Rating).trim(),
        fixedPrice: parseFloat(item['Fixed Price']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      });
    }

    console.log('Importing actuator models...');
    // Import actuator models
    if (data.actuatorModels && data.actuatorModels.length > 0) {
      for (const item of data.actuatorModels) {
        await addDoc(collection(db, 'actuatorModels'), {
          type: String(item.Type).trim(),
          series: String(item.Series).trim(),
          model: String(item.Model).trim(),
          standard: String(item['Standard/Special']).toLowerCase().trim(),
          fixedPrice: parseFloat(item['Fixed Price']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        });
      }
    }

    console.log('Importing handwheel prices...');
    // Import handwheel prices
    if (data.handwheelPrices && data.handwheelPrices.length > 0) {
      for (const item of data.handwheelPrices) {
        await addDoc(collection(db, 'handwheelPrices'), {
          actuatorModel: String(item['Actuator Model']).trim(),
          fixedPrice: parseFloat(item['Fixed Price']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        });
      }
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing pricing data:', error);
    throw error;
  }
}

// Delete all pricing data
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
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Cleared ${snapshot.docs.length} documents from ${collectionName}`);
      }
    }

    console.log('All pricing data cleared successfully!');
  } catch (error) {
    console.error('Error clearing pricing data:', error);
    throw error;
  }
}