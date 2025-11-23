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
  export async function importPricingData(data: {
    materials: any[];
    series: any[];
    bodyWeights: any[];
    bonnetWeights: any[];
    plugWeights: any[];
    seatWeights: any[];
    stemWeights: any[];
    cagePrices: any[];
  }): Promise<void> {
    try {
      const batch = writeBatch(db);
  
      // Clear existing data
      const collections = [
        'materials',
        'series',
        'bodyWeights',
        'bonnetWeights',
        'componentWeights',
        'cagePrices',
      ];
  
      for (const collectionName of collections) {
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        snapshot.docs.forEach((document) => {
          batch.delete(doc(db, collectionName, document.id));
        });
      }
  
      // Add Materials
      data.materials.forEach((item) => {
        const docRef = doc(collection(db, 'materials'));
        batch.set(docRef, {
          name: item['Material Name'],
          pricePerKg: parseFloat(item['Price Per Kg']),
          isActive: item['Active'] === 'TRUE' || item['Active'] === true,
        });
      });
  
      // Add Series
      data.series.forEach((item) => {
        const docRef = doc(collection(db, 'series'));
        batch.set(docRef, {
          productType: item['Product Type'],
          seriesNumber: item['Series Number'].toString(),
          name: item['Series Name'],
          hasCage: item['Has Cage'] === 'TRUE' || item['Has Cage'] === true,
          isActive: item['Active'] === 'TRUE' || item['Active'] === true,
        });
      });
  
      // Add Body Weights
      data.bodyWeights.forEach((item) => {
        const docRef = doc(collection(db, 'bodyWeights'));
        batch.set(docRef, {
          seriesId: item['Series Number'].toString(),
          size: item['Size'].toString(),
          rating: item['Rating'].toString(),
          endConnectType: item['End Connect Type'],
          weight: parseFloat(item['Weight (kg)']),
        });
      });
  
      // Add Bonnet Weights
      data.bonnetWeights.forEach((item) => {
        const docRef = doc(collection(db, 'bonnetWeights'));
        batch.set(docRef, {
          seriesId: item['Series Number'].toString(),
          size: item['Size'].toString(),
          rating: item['Rating'].toString(),
          bonnetType: item['Bonnet Type'],
          weight: parseFloat(item['Weight (kg)']),
        });
      });
  
      // Add Component Weights - Plug
      data.plugWeights.forEach((item) => {
        const docRef = doc(collection(db, 'componentWeights'));
        batch.set(docRef, {
          seriesId: item['Series Number'].toString(),
          componentType: 'plug',
          size: item['Size'].toString(),
          rating: item['Rating'].toString(),
          type: item['Plug Type'],
          weight: parseFloat(item['Weight (kg)']),
        });
      });
  
      // Add Component Weights - Seat
      data.seatWeights.forEach((item) => {
        const docRef = doc(collection(db, 'componentWeights'));
        batch.set(docRef, {
          seriesId: item['Series Number'].toString(),
          componentType: 'seat',
          size: item['Size'].toString(),
          rating: item['Rating'].toString(),
          type: item['Seat Type'],
          weight: parseFloat(item['Weight (kg)']),
        });
      });
  
      // Add Component Weights - Stem
      data.stemWeights.forEach((item) => {
        const docRef = doc(collection(db, 'componentWeights'));
        batch.set(docRef, {
          seriesId: item['Series Number'].toString(),
          componentType: 'stem',
          size: item['Size'].toString(),
          rating: item['Rating'].toString(),
          type: item['Stem Type'],
          weight: parseFloat(item['Weight (kg)']),
        });
      });
  
      // Add Cage Prices
      data.cagePrices.forEach((item) => {
        const docRef = doc(collection(db, 'cagePrices'));
        batch.set(docRef, {
          seriesId: item['Series Number'].toString(),
          size: item['Size'].toString(),
          fixedPrice: parseFloat(item['Fixed Price']),
        });
      });
  
      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to import pricing data');
    }
  }
  
  // Delete all pricing data
  export async function clearAllPricingData(): Promise<void> {
    try {
      const collections = [
        'materials',
        'series',
        'bodyWeights',
        'bonnetWeights',
        'componentWeights',
        'cagePrices',
      ];
  
      for (const collectionName of collections) {
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        const deletePromises = snapshot.docs.map((document) =>
          deleteDoc(doc(db, collectionName, document.id))
        );
        await Promise.all(deletePromises);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clear pricing data');
    }
  }