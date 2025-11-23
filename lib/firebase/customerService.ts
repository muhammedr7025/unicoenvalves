import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    Timestamp,
  } from 'firebase/firestore';
  import { db } from './config';
  import { Customer } from '@/types';
  
  export async function createCustomer(
    customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>,
    userId: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'customers'), {
        ...customer,
        createdBy: userId,
        createdAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create customer');
    }
  }
  
  export async function getAllCustomers(): Promise<Customer[]> {
    try {
      const customersRef = collection(db, 'customers');
      const querySnapshot = await getDocs(customersRef);
  
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          country: data.country,
          gst: data.gst,
          createdAt: data.createdAt?.toDate() || new Date(),
          createdBy: data.createdBy,
        };
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }
  
  export async function updateCustomer(
    customerId: string,
    customer: Omit<Customer, 'id' | 'createdAt' | 'createdBy'>
  ): Promise<void> {
    try {
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, { ...customer });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update customer');
    }
  }
  
  export async function deleteCustomer(customerId: string): Promise<void> {
    try {
      const customerRef = doc(db, 'customers', customerId);
      await deleteDoc(customerRef);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete customer');
    }
  }