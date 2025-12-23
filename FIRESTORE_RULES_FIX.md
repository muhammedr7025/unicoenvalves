# 🔒 FIRESTORE SECURITY RULES - MACHINE PRICING

## ❌ **ERROR: Missing or insufficient permissions**

This error means you need to add Firestore security rules for the new collections.

---

## 🔧 **SOLUTION: Add These Rules**

### **Go to Firebase Console:**
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Rules** tab
5. Add the following rules

---

## 📋 **Rules to Add:**

Add these rules to your existing `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... your existing rules ...
    
    // ========================================
    // MACHINE PRICING COLLECTIONS
    // ========================================
    
    // Machine Types - Admin only
    match /machineTypes/{machineTypeId} {
      // Allow admins to read, write, update, delete
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Work Hours Data - Admin only
    match /workHours/{workHourId} {
      // Allow admins to read, write, update, delete
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 🎯 **Alternative: Allow Employees to Read**

If you want employees to also read machine pricing data (for quotes), use this:

```javascript
// Machine Types - Employees can read, Admin can write
match /machineTypes/{machineTypeId} {
  // Allow authenticated users to read
  allow read: if request.auth != null;
  // Allow only admins to write
  allow write, update, delete: if request.auth != null && 
                                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// Work Hours - Employees can read, Admin can write
match /workHours/{workHourId} {
  // Allow authenticated users to read
  allow read: if request.auth != null;
  // Allow only admins to write
  allow write, update, delete: if request.auth != null && 
                                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## ⚡ **Quick Fix for Testing (TEMPORARY)**

**⚠️ WARNING: Only use this for testing, NOT production!**

If you need to test quickly, you can temporarily allow all authenticated users:

```javascript
// TEMPORARY - FOR TESTING ONLY
match /machineTypes/{machineTypeId} {
  allow read, write: if request.auth != null;
}

match /workHours/{workHourId} {
  allow read, write: if request.auth != null;
}
```

---

## 📝 **Step-by-Step:**

### 1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project

### 2. **Navigate to Firestore Rules**
   - Click **Firestore Database** in left menu
   - Click **Rules** tab at top

### 3. **Add the Rules**
   - Copy one of the rule sets above
   - Paste into your existing rules
   - Make sure it's inside the `match /databases/{database}/documents { }` block

### 4. **Publish**
   - Click **Publish** button
   - Wait for deployment (usually 1-2 minutes)

### 5. **Test**
   - Refresh your app
   - Try the import/export buttons again
   - Should work now! ✅

---

## 🔍 **Verify Your Current Rules:**

Your current Firestore rules should look something like this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Quotes collection
    match /quotes/{quoteId} {
      allow read, write: if request.auth != null;
    }
    
    // Materials collection
    match /materials/{materialId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ... other collections ...
    
    // NEW: Machine Types
    match /machineTypes/{machineTypeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // NEW: Work Hours
    match /workHours/{workHourId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## ✅ **After Adding Rules:**

Once you've added the rules and published:

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. **Try the buttons again:**
   - Download Template → Should work
   - Export Data → Should work
   - Bulk Import → Should work
3. **Check console** - errors should be gone

---

## 🆘 **Still Having Issues?**

If you still get permission errors after adding rules:

1. **Check User Role:**
   - Make sure you're logged in as admin
   - Check Firestore `users` collection - your user document should have `role: 'admin'`

2. **Wait for Rules to Deploy:**
   - Rules can take 1-2 minutes to propagate
   - Try clearing browser cache
   - Hard refresh (Ctrl+Shift+R)

3. **Check Rule Syntax:**
   - Make sure there are no syntax errors in your rules
   - Firebase Console will show errors if syntax is wrong

---

## 📞 **Need Help?**

If you're not sure how to access Firebase Console or add rules, let me know and I can:
1. Guide you step-by-step with screenshots
2. Create a complete rules file for you
3. Help troubleshoot specific errors

**The import/export code is working correctly - it's just a permissions issue!** 🔒
