import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
  } from 'firebase/firestore';
  import { db } from './config';
  import { Quote, QuoteProduct } from '@/types';
  import { generateQuoteNumber } from '@/utils/quoteNumber';
  
  export async function createQuote(
    quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      console.log('Creating quote with data:', quote);
      
      const quoteNumber = await generateQuoteNumber();
      console.log('Generated quote number:', quoteNumber);
      
      const quoteData = {
        quoteNumber,
        customerId: quote.customerId,
        customerName: quote.customerName,
        products: quote.products,
        subtotal: quote.subtotal,
        discount: quote.discount,
        discountAmount: quote.discountAmount,
        tax: quote.tax,
        taxAmount: quote.taxAmount,
        total: quote.total,
        status: quote.status,
        createdBy: quote.createdBy,
        createdByName: quote.createdByName,
        notes: quote.notes || '',
        isArchived: quote.isArchived,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      console.log('Final quote data to save:', quoteData);
  
      const docRef = await addDoc(collection(db, 'quotes'), quoteData);
      console.log('Quote created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error: any) {
      console.error('Create quote error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Failed to create quote');
    }
  }
  
  // ... rest of the functions stay the same
  
  export async function updateQuote(
    quoteId: string,
    quote: Partial<Quote>
  ): Promise<void> {
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      await updateDoc(quoteRef, {
        ...quote,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update quote');
    }
  }
  
  export async function getQuoteById(quoteId: string): Promise<Quote | null> {
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (!quoteDoc.exists()) {
        return null;
      }
  
      const data = quoteDoc.data();
      return {
        id: quoteDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Quote;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return null;
    }
  }
  
  export async function getQuotesByUser(userId: string): Promise<Quote[]> {
    try {
      const quotesRef = collection(db, 'quotes');
      const q = query(
        quotesRef,
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
  
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Quote;
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }
  
  export async function getAllQuotes(): Promise<Quote[]> {
    try {
      const quotesRef = collection(db, 'quotes');
      const q = query(quotesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
  
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Quote;
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }