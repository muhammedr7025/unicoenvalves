import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';

export interface ActuatorModel {
  id: string;
  type: string;
  series: string;
  model: string;
  standard: 'standard' | 'special';
  fixedPrice: number;
  isActive: boolean;
}

export interface HandwheelPrice {
  id: string;
  actuatorModel: string;
  fixedPrice: number;
  isActive: boolean;
}

// Get all actuator models
export async function getAllActuatorModels(): Promise<ActuatorModel[]> {
  try {
    const snapshot = await getDocs(collection(db, 'actuatorModels'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActuatorModel));
  } catch (error) {
    console.error('Error fetching actuator models:', error);
    return [];
  }
}

// Get actuator types
export async function getActuatorTypes(): Promise<string[]> {
  try {
    const models = await getAllActuatorModels();
    const types = new Set(models.filter(m => m.isActive).map(m => m.type));
    return Array.from(types);
  } catch (error) {
    console.error('Error fetching actuator types:', error);
    return [];
  }
}

// Get actuator series by type
export async function getActuatorSeriesByType(type: string): Promise<string[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'actuatorModels'), where('type', '==', type), where('isActive', '==', true))
    );
    const series = new Set(snapshot.docs.map(doc => doc.data().series));
    return Array.from(series);
  } catch (error) {
    console.error('Error fetching actuator series:', error);
    return [];
  }
}

// Get actuator models by type and series
export async function getActuatorModelsByTypeAndSeries(type: string, series: string): Promise<ActuatorModel[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'actuatorModels'),
        where('type', '==', type),
        where('series', '==', series),
        where('isActive', '==', true)
      )
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActuatorModel));
  } catch (error) {
    console.error('Error fetching actuator models:', error);
    return [];
  }
}

// Get handwheel price for actuator model
export async function getHandwheelPrice(actuatorModel: string): Promise<number | null> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'handwheelPrices'),
        where('actuatorModel', '==', actuatorModel),
        where('isActive', '==', true)
      )
    );
    
    if (snapshot.empty) return null;
    
    return snapshot.docs[0].data().fixedPrice;
  } catch (error) {
    console.error('Error fetching handwheel price:', error);
    return null;
  }
}