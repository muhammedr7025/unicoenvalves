import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
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
  MachineRate,
  MachiningHour,
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

// Machine Rates
export async function getAllMachineRates(): Promise<MachineRate[]> {
  try {
    const snapshot = await getDocs(collection(db, 'machineRates'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MachineRate[];
  } catch (error) {
    console.error('Error fetching machine rates:', error);
    return [];
  }
}

// Machining Hours
export async function getAllMachiningHours(): Promise<MachiningHour[]> {
  try {
    const snapshot = await getDocs(collection(db, 'machiningHours'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MachiningHour[];
  } catch (error) {
    console.error('Error fetching machining hours:', error);
    return [];
  }
}

// Bulk Import from Excel - SMART MERGE MODE
export async function importPricingData(data: any): Promise<void> {
  try {
    console.log('Starting MERGE import process...');

    let stats = {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    console.log('Importing materials...');
    // Import materials (unique key: name)
    for (const item of data.materials) {
      try {
        const name = String(item['Material Name']).trim();

        // Check if exists
        const existingQuery = query(
          collection(db, 'materials'),
          where('name', '==', name)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
          name,
          pricePerKg: parseFloat(item['Price Per Kg (INR)']) || 0,
          materialGroup: String(item['Material Group']).trim() || 'BodyBonnet',
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
          // Update existing
          const docRef = doc(db, 'materials', existingDocs.docs[0].id);
          await updateDoc(docRef, newData);
          stats.updated++;
          console.log(`Updated material: ${name}`);
        } else {
          // Add new
          await addDoc(collection(db, 'materials'), newData);
          stats.added++;
          console.log(`Added new material: ${name}`);
        }
      } catch (error) {
        console.error('Error processing material:', error);
        stats.errors++;
      }
    }

    console.log('Importing series...');
    // Import series (unique key: seriesNumber)
    for (const item of data.series) {
      try {
        const seriesNumber = String(item['Series Number']).trim();

        const existingQuery = query(
          collection(db, 'series'),
          where('seriesNumber', '==', seriesNumber)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
          productType: String(item['Product Type']).trim(),
          seriesNumber,
          name: String(item['Series Name']).trim(),
          hasCage: String(item['Has Cage']).toUpperCase() === 'TRUE',
          hasSealRing: String(item['Has Seal Ring']).toUpperCase() === 'TRUE',
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
          const docRef = doc(db, 'series', existingDocs.docs[0].id);
          await updateDoc(docRef, newData);
          stats.updated++;
        } else {
          await addDoc(collection(db, 'series'), newData);
          stats.added++;
        }
      } catch (error) {
        console.error('Error processing series:', error);
        stats.errors++;
      }
    }

    console.log('Importing body weights...');
    // Import body weights (unique key: seriesId + size + rating + endConnectType)
    for (const item of data.bodyWeights) {
      try {
        const seriesId = String(item['Series Number']).trim();
        const size = String(item.Size).trim();
        const rating = String(item.Rating).trim();
        const endConnectType = String(item['End Connect Type']).trim();

        const existingQuery = query(
          collection(db, 'bodyWeights'),
          where('seriesId', '==', seriesId),
          where('size', '==', size),
          where('rating', '==', rating),
          where('endConnectType', '==', endConnectType)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
          seriesId,
          size,
          rating,
          endConnectType,
          weight: parseFloat(item['Weight (kg)']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
          const docRef = doc(db, 'bodyWeights', existingDocs.docs[0].id);
          await updateDoc(docRef, newData);
          stats.updated++;
        } else {
          await addDoc(collection(db, 'bodyWeights'), newData);
          stats.added++;
        }
      } catch (error) {
        console.error('Error processing body weight:', error);
        stats.errors++;
      }
    }

    console.log('Importing bonnet weights...');
    // Import bonnet weights (unique key: seriesId + size + rating + bonnetType)
    for (const item of data.bonnetWeights) {
      try {
        const seriesId = String(item['Series Number']).trim();
        const size = String(item.Size).trim();
        const rating = String(item.Rating).trim();
        const bonnetType = String(item['Bonnet Type']).trim();

        const existingQuery = query(
          collection(db, 'bonnetWeights'),
          where('seriesId', '==', seriesId),
          where('size', '==', size),
          where('rating', '==', rating),
          where('bonnetType', '==', bonnetType)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
          seriesId,
          size,
          rating,
          bonnetType,
          weight: parseFloat(item['Weight (kg)']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
          const docRef = doc(db, 'bonnetWeights', existingDocs.docs[0].id);
          await updateDoc(docRef, newData);
          stats.updated++;
        } else {
          await addDoc(collection(db, 'bonnetWeights'), newData);
          stats.added++;
        }
      } catch (error) {
        console.error('Error processing bonnet weight:', error);
        stats.errors++;
      }
    }

    console.log('Importing plug weights...');
    // Import plug weights (unique key: seriesId + size + rating) - UPDATED
    for (const item of data.plugWeights) {
      try {
        const seriesId = String(item['Series Number']).trim();
        const size = String(item.Size).trim();
        const rating = String(item.Rating).trim();

        const existingQuery = query(
          collection(db, 'plugWeights'),
          where('seriesId', '==', seriesId),
          where('size', '==', size),
          where('rating', '==', rating)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
          seriesId,
          size,
          rating,
          weight: parseFloat(item['Weight (kg)']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
          const docRef = doc(db, 'plugWeights', existingDocs.docs[0].id);
          await updateDoc(docRef, newData);
          stats.updated++;
        } else {
          await addDoc(collection(db, 'plugWeights'), newData);
          stats.added++;
        }
      } catch (error) {
        console.error('Error processing plug weight:', error);
        stats.errors++;
      }
    }

    console.log('Importing seat weights...');
    // Import seat weights (unique key: seriesId + size + rating + seatType)
    for (const item of data.seatWeights) {
      try {
        const seriesId = String(item['Series Number']).trim();
        const size = String(item.Size).trim();
        const rating = String(item.Rating).trim();

        const existingQuery = query(
          collection(db, 'seatWeights'),
          where('seriesId', '==', seriesId),
          where('size', '==', size),
          where('rating', '==', rating)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
          seriesId,
          size,
          rating,
          weight: parseFloat(item['Weight (kg)']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
          const docRef = doc(db, 'seatWeights', existingDocs.docs[0].id);
          await updateDoc(docRef, newData);
          stats.updated++;
        } else {
          await addDoc(collection(db, 'seatWeights'), newData);
          stats.added++;
        }
      } catch (error) {
        console.error('Error processing seat weight:', error);
        stats.errors++;
      }
    }

    console.log('Importing stem fixed prices...');
    // Import stem fixed prices (unique key: seriesId + size + rating + materialName)
    for (const item of data.stemFixedPrices) {
      try {
        const seriesId = String(item['Series Number']).trim();
        const size = String(item.Size).trim();
        const rating = String(item.Rating).trim();
        const materialName = String(item['Material Name']).trim();

        const existingQuery = query(
          collection(db, 'stemFixedPrices'),
          where('seriesId', '==', seriesId),
          where('size', '==', size),
          where('rating', '==', rating),
          where('materialName', '==', materialName)
        );
        const existingDocs = await getDocs(existingQuery);

        const newData = {
          seriesId,
          size,
          rating,
          materialName,
          fixedPrice: parseFloat(item['Fixed Price']) || 0,
          isActive: String(item.Active).toUpperCase() === 'TRUE',
        };

        if (!existingDocs.empty) {
          const docRef = doc(db, 'stemFixedPrices', existingDocs.docs[0].id);
          await updateDoc(docRef, newData);
          stats.updated++;
        } else {
          await addDoc(collection(db, 'stemFixedPrices'), newData);
          stats.added++;
        }
      } catch (error) {
        console.error('Error processing stem price:', error);
        stats.errors++;
      }
    }

    console.log('Importing cage weights...');
    // Import cage weights (unique key: seriesId + size + rating)
    if (data.cageWeights && data.cageWeights.length > 0) {
      for (const item of data.cageWeights) {
        try {
          const seriesId = String(item['Series Number']).trim();
          const size = String(item.Size).trim();
          const rating = String(item.Rating).trim();

          const existingQuery = query(
            collection(db, 'cageWeights'),
            where('seriesId', '==', seriesId),
            where('size', '==', size),
            where('rating', '==', rating)
          );
          const existingDocs = await getDocs(existingQuery);

          const newData = {
            seriesId,
            size,
            rating,
            weight: parseFloat(item['Weight (kg)']) || 0,
            isActive: String(item.Active).toUpperCase() === 'TRUE',
          };

          if (!existingDocs.empty) {
            const docRef = doc(db, 'cageWeights', existingDocs.docs[0].id);
            await updateDoc(docRef, newData);
            stats.updated++;
          } else {
            await addDoc(collection(db, 'cageWeights'), newData);
            stats.added++;
          }
        } catch (error) {
          console.error('Error processing cage weight:', error);
          stats.errors++;
        }
      }
    }

    console.log('Importing seal ring prices...');
    // Import seal ring prices (unique key: seriesId + sealType + size + rating) - UPDATED
    if (data.sealRingPrices && data.sealRingPrices.length > 0) {
      for (const item of data.sealRingPrices) {
        try {
          const seriesId = String(item['Series Number']).trim();
          const sealType = String(item['Seal Type']).trim();  // CHANGED from 'Plug Type'
          const size = String(item.Size).trim();
          const rating = String(item.Rating).trim();

          const existingQuery = query(
            collection(db, 'sealRingPrices'),
            where('seriesId', '==', seriesId),
            where('sealType', '==', sealType),  // CHANGED from plugType
            where('size', '==', size),
            where('rating', '==', rating)
          );
          const existingDocs = await getDocs(existingQuery);

          const newData = {
            seriesId,
            sealType,  // CHANGED from plugType
            size,
            rating,
            fixedPrice: parseFloat(item['Fixed Price']) || 0,
            isActive: String(item.Active).toUpperCase() === 'TRUE',
          };

          if (!existingDocs.empty) {
            const docRef = doc(db, 'sealRingPrices', existingDocs.docs[0].id);
            await updateDoc(docRef, newData);
            stats.updated++;
          } else {
            await addDoc(collection(db, 'sealRingPrices'), newData);
            stats.added++;
          }
        } catch (error) {
          console.error('Error processing seal ring price:', error);
          stats.errors++;
        }
      }
    }

    console.log('Importing actuator models...');
    // Import actuator models (unique key: type + series + model + standard)
    if (data.actuatorModels && data.actuatorModels.length > 0) {
      for (const item of data.actuatorModels) {
        try {
          const type = String(item.Type).trim();
          const series = String(item.Series).trim();
          const model = String(item.Model).trim();
          const standard = String(item['Standard/Special']).toLowerCase().trim();

          const existingQuery = query(
            collection(db, 'actuatorModels'),
            where('type', '==', type),
            where('series', '==', series),
            where('model', '==', model),
            where('standard', '==', standard)
          );
          const existingDocs = await getDocs(existingQuery);

          const newData = {
            type,
            series,
            model,
            standard,
            fixedPrice: parseFloat(item['Fixed Price']) || 0,
            isActive: String(item.Active).toUpperCase() === 'TRUE',
          };

          if (!existingDocs.empty) {
            const docRef = doc(db, 'actuatorModels', existingDocs.docs[0].id);
            await updateDoc(docRef, newData);
            stats.updated++;
          } else {
            await addDoc(collection(db, 'actuatorModels'), newData);
            stats.added++;
          }
        } catch (error) {
          console.error('Error processing actuator model:', error);
          stats.errors++;
        }
      }
    }

    console.log('Importing handwheel prices...');
    // Import handwheel prices (unique key: type + series + model + standard)
    if (data.handwheelPrices && data.handwheelPrices.length > 0) {
      for (const item of data.handwheelPrices) {
        try {
          const type = String(item.Type).trim();
          const series = String(item.Series).trim();
          const model = String(item.Model).trim();
          const standard = String(item['Standard/Special']).toLowerCase().trim();

          const existingQuery = query(
            collection(db, 'handwheelPrices'),
            where('type', '==', type),
            where('series', '==', series),
            where('model', '==', model),
            where('standard', '==', standard)
          );
          const existingDocs = await getDocs(existingQuery);

          const newData = {
            type,
            series,
            model,
            standard,
            fixedPrice: parseFloat(item['Fixed Price']) || 0,
            isActive: String(item.Active).toUpperCase() === 'TRUE',
          };

          if (!existingDocs.empty) {
            const docRef = doc(db, 'handwheelPrices', existingDocs.docs[0].id);
            await updateDoc(docRef, newData);
            stats.updated++;
          } else {
            await addDoc(collection(db, 'handwheelPrices'), newData);
            stats.added++;
          }
        } catch (error) {
          console.error('Error processing handwheel price:', error);
          stats.errors++;
        }
      }
    }

    console.log('Importing machine rates...');
    // Import machine rates (unique key: name)
    if (data.machineRates && data.machineRates.length > 0) {
      for (const item of data.machineRates) {
        try {
          const name = String(item['Machine Name']).trim();

          const existingQuery = query(
            collection(db, 'machineRates'),
            where('name', '==', name)
          );
          const existingDocs = await getDocs(existingQuery);

          const newData = {
            name,
            ratePerHour: parseFloat(item['Rate Per Hour']) || 0,
            isActive: String(item.Active).toUpperCase() === 'TRUE',
          };

          if (!existingDocs.empty) {
            const docRef = doc(db, 'machineRates', existingDocs.docs[0].id);
            await updateDoc(docRef, newData);
            stats.updated++;
          } else {
            await addDoc(collection(db, 'machineRates'), newData);
            stats.added++;
          }
        } catch (error) {
          console.error('Error processing machine rate:', error);
          stats.errors++;
        }
      }
    }

    console.log('Importing machining hours...');
    // Import machining hours (unique key: seriesId + size + rating + partType + trimType)
    if (data.machiningHours && data.machiningHours.length > 0) {
      for (const item of data.machiningHours) {
        try {
          const seriesId = String(item['Series Number']).trim();
          const size = String(item.Size).trim();
          const rating = String(item.Rating).trim();
          const partType = String(item['Part Type']).trim();
          const trimType = String(item['Trim Type'] || '').trim();

          const existingQuery = query(
            collection(db, 'machiningHours'),
            where('seriesId', '==', seriesId),
            where('size', '==', size),
            where('rating', '==', rating),
            where('partType', '==', partType),
            where('trimType', '==', trimType)
          );
          const existingDocs = await getDocs(existingQuery);

          const newData = {
            seriesId,
            size,
            rating,
            partType,
            trimType,
            hours: parseFloat(item.Hours) || 0,
            isActive: String(item.Active).toUpperCase() === 'TRUE',
          };

          if (!existingDocs.empty) {
            const docRef = doc(db, 'machiningHours', existingDocs.docs[0].id);
            await updateDoc(docRef, newData);
            stats.updated++;
          } else {
            await addDoc(collection(db, 'machiningHours'), newData);
            stats.added++;
          }
        } catch (error) {
          console.error('Error processing machining hour:', error);
          stats.errors++;
        }
      }
    }

    console.log('✅ MERGE Import completed successfully!');
    console.log(`📊 Statistics: ${stats.added} added, ${stats.updated} updated, ${stats.errors} errors`);

    // Return stats for UI display
    return stats as any;
  } catch (error) {
    console.error('❌ Error in merge import:', error);
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
      'machineRates',
      'machiningHours',
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