import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    writeBatch,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { QuoteProduct } from '@/types';

/**
 * Products are stored as a subcollection under each quote:
 * quotes/{quoteId}/products/{productId}
 * 
 * This allows unlimited products per quote (bypassing 1MB document limit)
 */

// Save products to subcollection (for new quotes)
export async function saveProductsToSubcollection(
    quoteId: string,
    products: QuoteProduct[]
): Promise<void> {
    const batch = writeBatch(db);
    const productsRef = collection(db, 'quotes', quoteId, 'products');

    for (const product of products) {
        const productDocRef = doc(productsRef);
        const productData = sanitizeProductForFirestore(product);
        batch.set(productDocRef, {
            ...productData,
            sortOrder: products.indexOf(product), // Maintain order
        });
    }

    await batch.commit();
    console.log(`Saved ${products.length} products to subcollection for quote ${quoteId}`);
}

// Get products from subcollection
export async function getProductsFromSubcollection(
    quoteId: string
): Promise<QuoteProduct[]> {
    const productsRef = collection(db, 'quotes', quoteId, 'products');
    const q = query(productsRef, orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
        } as QuoteProduct;
    });

    console.log(`Loaded ${products.length} products from subcollection for quote ${quoteId}`);
    return products;
}

// Update products in subcollection (delete all, then add new)
export async function updateProductsInSubcollection(
    quoteId: string,
    products: QuoteProduct[]
): Promise<void> {
    // First, delete all existing products
    await deleteAllProductsFromSubcollection(quoteId);

    // Then add new products
    await saveProductsToSubcollection(quoteId, products);
}

// Delete all products from subcollection
export async function deleteAllProductsFromSubcollection(
    quoteId: string
): Promise<void> {
    const productsRef = collection(db, 'quotes', quoteId, 'products');
    const snapshot = await getDocs(productsRef);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`Deleted ${snapshot.docs.length} products from subcollection for quote ${quoteId}`);
}

// Helper to sanitize product data for Firestore (undefined -> null)
function sanitizeProductForFirestore(product: QuoteProduct): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(product)) {
        if (value === undefined) {
            sanitized[key] = null;
        } else if (Array.isArray(value)) {
            sanitized[key] = value.length > 0 ? value : [];
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

// Calculate product count for quote metadata
export function getProductCount(products: QuoteProduct[]): number {
    return products.length;
}

// Batch operations for very large product lists (500+ products)
// Firestore batch limit is 500 operations
export async function saveProductsInBatches(
    quoteId: string,
    products: QuoteProduct[]
): Promise<void> {
    const BATCH_SIZE = 450; // Leave room for safety
    const productsRef = collection(db, 'quotes', quoteId, 'products');

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const batchProducts = products.slice(i, i + BATCH_SIZE);

        for (const product of batchProducts) {
            const productDocRef = doc(productsRef);
            const productData = sanitizeProductForFirestore(product);
            batch.set(productDocRef, {
                ...productData,
                sortOrder: products.indexOf(product),
            });
        }

        await batch.commit();
        console.log(`Saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchProducts.length} products)`);
    }

    console.log(`Total saved: ${products.length} products in batches`);
}

// Delete products in batches for very large collections
export async function deleteProductsInBatches(quoteId: string): Promise<void> {
    const BATCH_SIZE = 450;
    const productsRef = collection(db, 'quotes', quoteId, 'products');

    let snapshot = await getDocs(productsRef);

    while (!snapshot.empty) {
        const batch = writeBatch(db);
        const docsToDelete = snapshot.docs.slice(0, BATCH_SIZE);

        docsToDelete.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Deleted batch of ${docsToDelete.length} products`);

        // Check if more to delete
        snapshot = await getDocs(productsRef);
    }
}
