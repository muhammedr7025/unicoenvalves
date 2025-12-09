import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    Timestamp,query, where
  } from 'firebase/firestore';
  import { db } from './config';
  import { Customer } from '@/types';
  import { ParsedCustomer } from '@/utils/customerExcelTemplate';
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
  // Bulk import customers
  export async function bulkImportCustomers(
    customers: ParsedCustomer[],
    createdBy: string,
    createdByName: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
  
    // Validate user data
    if (!createdBy || createdBy === '') {
      errors.push('Invalid user authentication. Please refresh and try again.');
      return { success: 0, failed: customers.length, errors };
    }
  
    // Check for existing emails in database
    const existingEmails = new Set<string>();
    const customersRef = collection(db, 'customers');
  
    try {
      const snapshot = await getDocs(customersRef);
      snapshot.docs.forEach(doc => {
        existingEmails.add(doc.data().email.toLowerCase());
      });
    } catch (error) {
      errors.push('Failed to check existing customers');
      return { success: 0, failed: customers.length, errors };
    }
  
    // Import customers one by one
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
  
      // DEBUG: Log customer data before import
      console.log(`=== Importing Customer ${i + 1} ===`);
      console.log('Customer data:', customer);
      console.log('GST Number:', customer.gstNumber);
      console.log('GST type:', typeof customer.gstNumber);
      console.log('GST length:', customer.gstNumber?.length);
  
      try {
        // Check if email already exists
        if (existingEmails.has(customer.email.toLowerCase())) {
          failed++;
          errors.push(`Row ${i + 2}: Email "${customer.email}" already exists in database`);
          continue;
        }
  
        // Prepare customer data for Firestore
        const customerData = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || '',
          company: customer.company || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          country: customer.country,
          postalCode: customer.postalCode || '',
          gstNumber: customer.gstNumber || '',
          panNumber: customer.panNumber || '',
          notes: customer.notes || '',
          createdAt: Timestamp.now(),
          createdBy,
          createdByName,
          isActive: true,
        };
  
        // DEBUG: Log what's being sent to Firestore
        console.log('Firestore data:', customerData);
        console.log('Firestore GST:', customerData.gstNumber);
  
        // Add customer
        const docRef = await addDoc(customersRef, customerData);
        
        console.log(`✅ Customer imported with ID: ${docRef.id}`);
        console.log('==============================\n');
  
        // Add to existing emails set to prevent duplicates in same import
        existingEmails.add(customer.email.toLowerCase());
        success++;
      } catch (error: any) {
        failed++;
        console.error(`❌ Import failed for customer ${i + 1}:`, error);
        errors.push(`Row ${i + 2}: Failed to import - ${error.message}`);
      }
    }
  
    return { success, failed, errors };
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