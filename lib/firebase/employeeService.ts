import {
    collection,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
  } from 'firebase/firestore';
  import { db } from './config';
  import { User } from '@/types';
  
  export async function createEmployee(
    email: string,
    password: string,
    name: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/employees/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create employee');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create employee');
    }
  }
  
  export async function getAllEmployees(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'employee'));
      const querySnapshot = await getDocs(q);
  
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          isActive: data.isActive,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }
  
  export async function updateEmployee(
    userId: string,
    name: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        name,
        isActive,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update employee');
    }
  }
  
  export async function toggleEmployeeStatus(
    userId: string,
    currentStatus: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: !currentStatus,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle employee status');
    }
  }