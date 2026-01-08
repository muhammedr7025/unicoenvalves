#!/usr/bin/env node
/**
 * Database Cleanup Script for Unicorn Valves Quote System
 * This script clears all test data from Firestore to prepare for production.
 * 
 * Usage: node scripts/cleanup-database.js
 * 
 * IMPORTANT: This will DELETE all data from the following collections:
 * - materials
 * - series
 * - bodyWeights
 * - bonnetWeights
 * - plugWeights
 * - seatWeights
 * - stemFixedPrices
 * - cageWeights
 * - sealRingPrices
 * - actuatorModels
 * - handwheelPrices
 * - machiningPrices
 * - quotes (OPTIONAL - uncomment if needed)
 * - customers (OPTIONAL - uncomment if needed)
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const readline = require('readline');

// Collections to clean (pricing data)
const PRICING_COLLECTIONS = [
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
    'machiningPrices',
];

// Optional: Business data collections (uncomment if you want to clear these too)
// const BUSINESS_COLLECTIONS = [
//     'quotes',
//     'customers',
// ];

async function deleteCollection(db, collectionName) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log(`  ⏭️  ${collectionName}: No documents to delete`);
        return 0;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
    });

    await batch.commit();
    console.log(`  ✅ ${collectionName}: Deleted ${count} documents`);
    return count;
}

async function main() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║     UNICORN VALVES - DATABASE CLEANUP SCRIPT              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Check for service account key
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccountPath) {
        console.log('⚠️  GOOGLE_APPLICATION_CREDENTIALS environment variable not set.');
        console.log('');
        console.log('To use this script, you need to:');
        console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
        console.log('2. Click "Generate new private key"');
        console.log('3. Save the JSON file to a secure location');
        console.log('4. Set the environment variable:');
        console.log('   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"');
        console.log('');
        console.log('Alternatively, you can use the Admin panel in the application:');
        console.log('1. Go to Admin > Pricing');
        console.log('2. Select each collection');
        console.log('3. Click "Clear All Data" for each collection');
        process.exit(1);
    }

    // Initialize Firebase Admin
    try {
        initializeApp();
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error.message);
        process.exit(1);
    }

    const db = getFirestore();

    // Confirmation prompt
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('⚠️  WARNING: This will DELETE ALL PRICING DATA from the database!\n');
    console.log('Collections to be cleared:');
    PRICING_COLLECTIONS.forEach(c => console.log(`  - ${c}`));
    console.log('');

    const answer = await new Promise(resolve => {
        rl.question('Type "DELETE ALL" to confirm: ', resolve);
    });
    rl.close();

    if (answer !== 'DELETE ALL') {
        console.log('\n❌ Operation cancelled. No data was deleted.');
        process.exit(0);
    }

    console.log('\n🗑️  Starting cleanup...\n');

    let totalDeleted = 0;

    for (const collection of PRICING_COLLECTIONS) {
        try {
            const count = await deleteCollection(db, collection);
            totalDeleted += count;
        } catch (error) {
            console.error(`  ❌ ${collection}: Error - ${error.message}`);
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`✅ Cleanup complete! Deleted ${totalDeleted} documents total.`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. Go to Admin > Pricing in the application');
    console.log('2. Download the template for each collection');
    console.log('3. Fill in your production data');
    console.log('4. Import the data using "Import from File"');
    console.log('');
}

main().catch(console.error);
