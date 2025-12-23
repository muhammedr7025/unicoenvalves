# 🎯 QUOTE FORM - COMPLETE CODE SECTIONS

## **File:** `/components/quotes/ProductConfigurationForm.tsx`

This guide provides ALL code sections you need to add machine selection dropdowns.

---

## **SECTION 1: Add State for Available Machines (Top of component)**

**FIND THIS (around line 20-30):**
```tsx
export default function ProductConfigurationForm({ ... }) {
    const { currentProduct, updateProduct, calculateProductPrice, ... } = useProductConfig();
```

**ADD THIS RIGHT AFTER the hook declarations:**
```tsx
    // Load available machines
    const [availableMachines, setAvailableMachines] = useState<MachineType[]>([]);

    useEffect(() => {
        async function loadMachines() {
            const machines = await getMachineTypes();
            setAvailableMachines(machines);
        }
        loadMachines();
    }, []);
```

**IMPORTS TO ADD at top of file:**
```tsx
import { MachineType } from '@/types';
import { getMachineTypes } from '@/lib/firebase/machinePricingService';
```

---

## **SECTION 2: Add Machine Change Handlers**

**ADD THESE FUNCTIONS (after the existing material change handlers):**

```tsx
    // Machine selection handlers
    const handleBodyMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const machineId = e.target.value;
        const machine = availableMachines.find(m => m.id === machineId);
        updateProduct({
            bodyMachineTypeId: machineId,
            bodyMachineName: machine?.name || '',
            bodyMachineRate: machine?.hourlyRate || 0,
        });
    };

    const handleBonnetMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const machineId = e.target.value;
        const machine = availableMachines.find(m => m.id === machineId);
        updateProduct({
            bonnetMachineTypeId: machineId,
            bonnetMachineName: machine?.name || '',
            bonnetMachineRate: machine?.hourlyRate || 0,
        });
    };

    const handlePlugMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const machineId = e.target.value;
        const machine = availableMachines.find(m => m.id === machineId);
        updateProduct({
            plugMachineTypeId: machineId,
            plugMachineName: machine?.name || '',
            plugMachineRate: machine?.hourlyRate || 0,
        });
    };

    const handleSeatMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const machineId = e.target.value;
        const machine = availableMachines.find(m => m.id === machineId);
        updateProduct({
            seatMachineTypeId: machineId,
            seatMachineName: machine?.name || '',
            seatMachineRate: machine?.hourlyRate || 0,
        });
    };

    const handleStemMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const machineId = e.target.value;
        const machine = availableMachines.find(m => m.id === machineId);
        updateProduct({
            stemMachineTypeId: machineId,
            stemMachineName: machine?.name || '',
            stemMachineRate: machine?.hourlyRate || 0,
        });
    };

    const handleCageMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const machineId = e.target.value;
        const machine = availableMachines.find(m => m.id === machineId);
        updateProduct({
            cageMachineTypeId: machineId,
            cageMachineName: machine?.name || '',
            cageMachineRate: machine?.hourlyRate || 0,
        });
    };

    const handleSealRingMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const machineId = e.target.value;
        const machine = availableMachines.find(m => m.id === machineId);
        updateProduct({
            sealRingMachineTypeId: machineId,
            sealRingMachineName: machine?.name || '',
            sealRingMachineRate: machine?.hourlyRate || 0,
        });
    };
```

---

## **SECTION 3: Add Machine Dropdowns to JSX**

Now you need to add machine dropdowns next to each material dropdown in the form.

### **PATTERN TO FOLLOW:**

For EACH component, find its material dropdown and add a machine dropdown right after it.

**EXAMPLE - Body Machine Dropdown:**

**FIND the Body Material dropdown (search for "Body Material"):**
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Body Material *</label>
    <select
        value={bodyMaterialId}
        onChange={handleBodyMaterialChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Material</option>
        {bodyBonnetMaterials.map((material) => (
            <option key={material.id} value={material.id}>
                {material.name} - ₹{material.pricePerKg}/kg
            </option>
        ))}
    </select>
</div>
```

**ADD THIS RIGHT AFTER IT:**
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Body Machine *</label>
    <select
        value={currentProduct.bodyMachineTypeId || ''}
        onChange={handleBodyMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

---

### **COPY-PASTE READY DROPDOWNS:**

Here are all 7 machine dropdowns ready to copy:

#### **1. Body Machine** (add after Body Material):
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Body Machine *</label>
    <select
        value={currentProduct.bodyMachineTypeId || ''}
        onChange={handleBodyMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

#### **2. Bonnet Machine** (add after Bonnet Material):
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Bonnet Machine *</label>
    <select
        value={currentProduct.bonnetMachineTypeId || ''}
        onChange={handleBonnetMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

#### **3. Plug Machine** (add after Plug Material):
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Plug Machine *</label>
    <select
        value={currentProduct.plugMachineTypeId || ''}
        onChange={handlePlugMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

#### **4. Seat Machine** (add after Seat Material):
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Seat Machine *</label>
    <select
        value={currentProduct.seatMachineTypeId || ''}
        onChange={handleSeatMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

#### **5. Stem Machine** (add after Stem Material):
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Stem Machine *</label>
    <select
        value={currentProduct.stemMachineTypeId || ''}
        onChange={handleStemMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

#### **6. Cage Machine** (add after Cage Material, if hasCage):
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Cage Machine *</label>
    <select
        value={currentProduct.cageMachineTypeId || ''}
        onChange={handleCageMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

#### **7. Seal Ring Machine** (add after Seal Ring section, if hasSealRing):
```tsx
<div>
    <label className="block text-sm font-medium mb-2">Seal Ring Machine *</label>
    <select
        value={currentProduct.sealRingMachineTypeId || ''}
        onChange={handleSealRingMachineChange}
        className="w-full p-2 border rounded-lg"
    >
        <option value="">Select Machine</option>
        {availableMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
                {machine.name} - ₹{machine.hourlyRate}/hr
            </option>
        ))}
    </select>
</div>
```

---

## **SUMMARY OF CHANGES:**

### **1. Add imports:**
```tsx
import { MachineType } from '@/types';
import { getMachineTypes } from '@/lib/firebase/machinePricingService';
```

### **2. Add state & useEffect** (after hooks):
```tsx
const [availableMachines, setAvailableMachines] = useState<MachineType[]>([]);

useEffect(() => {
    async function loadMachines() {
        const machines = await getMachineTypes();
        setAvailableMachines(machines);
    }
    loadMachines();
}, []);
```

### **3. Add 7 change handlers** (after existing handlers)

### **4. Add 7 machine dropdowns** (after each material dropdown)

---

## **Next Steps After This:**

Once you've added all the dropdowns, we need to update the **calculation logic** in `/hooks/useProductConfig.ts` to:
- Get work hours from database
- Use selected machine rate
- Calculate: hours × rate

**Let me know when dropdowns are added and I'll create the calculation update!** 🚀
