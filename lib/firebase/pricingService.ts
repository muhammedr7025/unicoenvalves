import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    writeBatch,
  } from 'firebase/firestore';
  import { db } from './config';
  import {
    Material,
    Series,
    BodyWeight,
    BonnetWeight,
    ComponentWeight,
    CagePrice,
  } from '@/types';
  
  // Materials
  export async function getAllMaterials(): Promise<Material[]> {
    try {
      const materialsRef = collection(db, 'materials');
      const snapshot = await getDocs(materialsRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Material[];
    } catch (error) {
      console.error('Error fetching materials:', error);
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
        ...doc.data(),
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
  
  // Component Weights (Plug, Seat, Stem)
  export async function getAllComponentWeights(): Promise<ComponentWeight[]> {
    try {
      const weightsRef = collection(db, 'componentWeights');
      const snapshot = await getDocs(weightsRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ComponentWeight[];
    } catch (error) {
      console.error('Error fetching component weights:', error);
      return [];
    }
  }
  
  // Cage Prices
  export async function getAllCagePrices(): Promise<CagePrice[]> {
    try {
      const pricesRef = collection(db, 'cagePrices');
      const snapshot = await getDocs(pricesRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CagePrice[];
    } catch (error) {
      console.error('Error fetching cage prices:', error);
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
      // Import materials
      for (const item of data.materials) {
        await addDoc(collection(db, 'materials'), {
          name: String(item['Material Name']).trim(),
          pricePerKg: parseFloat(item['Price Per Kg']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        });
      }
  
      console.log('Importing series...');
      // Import series
      for (const item of data.series) {
        await addDoc(collection(db, 'series'), {
          productType: String(item['Product Type']).trim(),
          seriesNumber: String(item['Series Number']).trim(),
          name: String(item['Series Name']).trim(),
          hasCage: String(item['Has Cage']).toUpperCase() === 'TRUE',
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
        });
      }
  
      console.log('Importing plug weights...');
      // Import plug weights (componentWeights with type 'plug')
      for (const item of data.plugWeights) {
        await addDoc(collection(db, 'componentWeights'), {
          seriesId: String(item['Series Number']).trim(),
          componentType: 'plug',
          size: String(item.Size).trim(),
          rating: String(item.Rating).trim(),
          type: String(item['Plug Type']).trim(),
          weight: parseFloat(item['Weight (kg)']) || 0,
        });
      }
  
      console.log('Importing seat weights...');
      // Import seat weights (componentWeights with type 'seat')
      for (const item of data.seatWeights) {
        await addDoc(collection(db, 'componentWeights'), {
          seriesId: String(item['Series Number']).trim(),
          componentType: 'seat',
          size: String(item.Size).trim(),
          rating: String(item.Rating).trim(),
          type: String(item['Seat Type']).trim(),
          weight: parseFloat(item['Weight (kg)']) || 0,
        });
      }
  
      console.log('Importing stem weights...');
      // Import stem weights (NO TYPE - just size and rating)
      for (const item of data.stemWeights) {
        await addDoc(collection(db, 'stemWeights'), {
          seriesId: String(item['Series Number']).trim(),
          size: String(item.Size).trim(),
          rating: String(item.Rating).trim(),
          weight: parseFloat(item['Weight (kg)']) || 0,
        });
      }
  
      console.log('Importing cage prices...');
      // Import cage prices by seat type
      for (const item of data.cagePrices) {
        await addDoc(collection(db, 'cagePricesBySeat'), {
          seriesId: String(item['Series Number']).trim(),
          size: String(item.Size).trim(),
          seatType: String(item['Seat Type']).trim(),
          fixedPrice: parseFloat(item['Fixed Price']) || 0,
          isActive: true,
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
        'componentWeights',
        'stemWeights',
        'cagePricesBySeat',
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
  // Get actuator models
export async function getAllActuatorModels() {
  try {
    const snapshot = await getDocs(collection(db, 'actuatorModels'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching actuator models:', error);
    return [];
  }
}

// Get handwheel prices
export async function getAllHandwheelPrices() {
  try {
    const snapshot = await getDocs(collection(db, 'handwheelPrices'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching handwheel prices:', error);
    return [];
  }
}

// Get cage prices by seat
export async function getAllCagePricesBySeat() {
  try {
    const snapshot = await getDocs(collection(db, 'cagePricesBySeat'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching cage prices by seat:', error);
    return [];
  }
}