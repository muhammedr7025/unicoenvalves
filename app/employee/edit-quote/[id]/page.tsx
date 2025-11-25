'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllMaterials, getAllSeries } from '@/lib/firebase/pricingService';
import {
  getAvailableSizes,
  getAvailableRatings,
  getAvailableEndConnectTypes,
  getAvailableBonnetTypes,
  getAvailableComponentTypes,
  getBodyWeight,
  getBonnetWeight,
  getComponentWeight,
  getStemWeight,
  getCagePriceBySeat,
  getAvailableActuatorTypes,
  getAvailableActuatorSeries,
  getAvailableActuatorModels,
  getActuatorPrice,
  getHandwheelPrice,
} from '@/lib/firebase/productConfigHelper';
import { 
  Quote, 
  QuoteProduct, 
  Material, 
  Series,
  TubingAndFittingItem,
  TestingItem,
  AccessoryItem,
  DEFAULT_ACCESSORIES,
} from '@/types';
import { calculateQuoteTotals } from '@/utils/priceCalculator';
import Link from 'next/link';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Products
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  
  // Pricing data
  const [materials, setMaterials] = useState<Material[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  // Current product being edited/added
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<QuoteProduct>>({
    quantity: 1,
    hasCage: false,
    hasActuator: false,
    hasHandwheel: false,
    tubingAndFitting: [],
    testing: [],
    accessories: [],
  });

  // Dynamic options for body sub-assembly
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableRatings, setAvailableRatings] = useState<string[]>([]);
  const [availableEndConnectTypes, setAvailableEndConnectTypes] = useState<string[]>([]);
  const [availableBonnetTypes, setAvailableBonnetTypes] = useState<string[]>([]);
  const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
  const [availableSeatTypes, setAvailableSeatTypes] = useState<string[]>([]);

  // Dynamic options for actuator
  const [availableActuatorTypes, setAvailableActuatorTypes] = useState<string[]>([]);
  const [availableActuatorSeries, setAvailableActuatorSeries] = useState<string[]>([]);
  const [availableActuatorModels, setAvailableActuatorModels] = useState<string[]>([]);

  // Additional modules
  const [tubingAndFittingItems, setTubingAndFittingItems] = useState<TubingAndFittingItem[]>([]);
  const [testingItems, setTestingItems] = useState<TestingItem[]>([]);
  const [accessoryItems, setAccessoryItems] = useState<AccessoryItem[]>([]);

  // Temporary states for adding items
  const [newTubingTitle, setNewTubingTitle] = useState('');
  const [newTubingPrice, setNewTubingPrice] = useState(0);
  const [newTestingTitle, setNewTestingTitle] = useState('');
  const [newTestingPrice, setNewTestingPrice] = useState(0);
  const [newAccessoryTitle, setNewAccessoryTitle] = useState('');
  const [newAccessoryPrice, setNewAccessoryPrice] = useState(0);
  const [showAccessoryPriceInput, setShowAccessoryPriceInput] = useState<string | null>(null);
  const [customAccessoryPrice, setCustomAccessoryPrice] = useState<{[key: string]: number}>({});

  // Profit percentages
  const [manufacturingProfit, setManufacturingProfit] = useState(0);
  const [boughtoutProfit, setBoughtoutProfit] = useState(0);

  const [calculating, setCalculating] = useState(false);

  // Quote details
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (currentProduct.seriesNumber) {
      fetchAvailableSizes(currentProduct.seriesNumber);
    }
  }, [currentProduct.seriesNumber]);

  useEffect(() => {
    if (currentProduct.seriesNumber && currentProduct.size) {
      fetchAvailableRatings(currentProduct.seriesNumber, currentProduct.size);
    }
  }, [currentProduct.seriesNumber, currentProduct.size]);

  useEffect(() => {
    if (currentProduct.seriesNumber && currentProduct.size && currentProduct.rating) {
      fetchDependentOptions(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating);
    }
  }, [currentProduct.seriesNumber, currentProduct.size, currentProduct.rating]);

  useEffect(() => {
    if (currentProduct.actuatorType) {
      fetchActuatorSeries(currentProduct.actuatorType);
    }
  }, [currentProduct.actuatorType]);

  useEffect(() => {
    if (currentProduct.actuatorType && currentProduct.actuatorSeries) {
      fetchActuatorModels(currentProduct.actuatorType, currentProduct.actuatorSeries);
    }
  }, [currentProduct.actuatorType, currentProduct.actuatorSeries]);

  const fetchInitialData = async () => {
    const [materialsData, seriesData, actuatorTypes] = await Promise.all([
      getAllMaterials(),
      getAllSeries(),
      getAvailableActuatorTypes(),
    ]);
    setMaterials(materialsData.filter(m => m.isActive));
    setSeries(seriesData.filter(s => s.isActive));
    setAvailableActuatorTypes(actuatorTypes);
  };

  const fetchQuote = async (quoteId: string) => {
    setLoading(true);
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (quoteDoc.exists()) {
        const data = quoteDoc.data();
        const loadedQuote = {
          id: quoteDoc.id,
          quoteNumber: data.quoteNumber,
          customerId: data.customerId,
          customerName: data.customerName,
          products: data.products || [],
          subtotal: data.subtotal || 0,
          discount: data.discount || 0,
          discountAmount: data.discountAmount || 0,
          tax: data.tax || 0,
          taxAmount: data.taxAmount || 0,
          total: data.total || 0,
          status: data.status || 'draft',
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          notes: data.notes || '',
          isArchived: data.isArchived || false,
        } as Quote;

        setQuote(loadedQuote);
        setProducts(loadedQuote.products);
        setDiscount(loadedQuote.discount);
        setTax(loadedQuote.tax);
        setNotes(loadedQuote.notes || '');
        setStatus(loadedQuote.status);
      } else {
        alert('Quote not found');
        router.push('/employee');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      alert('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSizes = async (seriesNumber: string) => {
    const sizes = await getAvailableSizes(seriesNumber);
    setAvailableSizes(sizes);
  };

  const fetchAvailableRatings = async (seriesNumber: string, size: string) => {
    const ratings = await getAvailableRatings(seriesNumber, size);
    setAvailableRatings(ratings);
  };

  const fetchDependentOptions = async (seriesNumber: string, size: string, rating: string) => {
    const [endConnects, bonnets, plugs, seats] = await Promise.all([
      getAvailableEndConnectTypes(seriesNumber, size, rating),
      getAvailableBonnetTypes(seriesNumber, size, rating),
      getAvailableComponentTypes(seriesNumber, 'plug', size, rating),
      getAvailableComponentTypes(seriesNumber, 'seat', size, rating),
    ]);

    setAvailableEndConnectTypes(endConnects);
    setAvailableBonnetTypes(bonnets);
    setAvailablePlugTypes(plugs);
    setAvailableSeatTypes(seats);
  };

  const fetchActuatorSeries = async (type: string) => {
    const series = await getAvailableActuatorSeries(type);
    setAvailableActuatorSeries(series);
  };

  const fetchActuatorModels = async (type: string, series: string) => {
    const models = await getAvailableActuatorModels(type, series);
    setAvailableActuatorModels(models);
  };

  const handleSeriesChange = async (seriesId: string) => {
    const selectedSeries = series.find(s => s.id === seriesId);
    if (!selectedSeries) return;

    setCurrentProduct({
      quantity: currentProduct.quantity || 1,
      seriesId,
      seriesNumber: selectedSeries.seriesNumber,
      productType: selectedSeries.productType,
      hasCage: selectedSeries.hasCage,
      hasActuator: false,
      hasHandwheel: false,
      tubingAndFitting: [],
      testing: [],
      accessories: [],
    });
    
    setAvailableSizes([]);
    setAvailableRatings([]);
    setAvailableEndConnectTypes([]);
    setAvailableBonnetTypes([]);
    setAvailablePlugTypes([]);
    setAvailableSeatTypes([]);

    await fetchAvailableSizes(selectedSeries.seriesNumber);
  };

  const handleSizeChange = async (size: string) => {
    setCurrentProduct({ 
      ...currentProduct, 
      size,
      rating: undefined
    });
    
    setAvailableRatings([]);
    setAvailableEndConnectTypes([]);
    setAvailableBonnetTypes([]);
    setAvailablePlugTypes([]);
    setAvailableSeatTypes([]);

    if (currentProduct.seriesNumber) {
      await fetchAvailableRatings(currentProduct.seriesNumber, size);
    }
  };

  const handleRatingChange = async (rating: string) => {
    setCurrentProduct({ 
      ...currentProduct, 
      rating 
    });

    if (currentProduct.seriesNumber && currentProduct.size) {
      await fetchDependentOptions(currentProduct.seriesNumber, currentProduct.size, rating);
    }
  };

  // Tubing & Fitting functions
  const addTubingAndFittingItem = () => {
    if (!newTubingTitle.trim() || newTubingPrice <= 0) {
      alert('Please enter both title and price');
      return;
    }

    const newItem: TubingAndFittingItem = {
      id: `tubing-${Date.now()}`,
      title: newTubingTitle.trim(),
      price: newTubingPrice,
    };

    setTubingAndFittingItems([...tubingAndFittingItems, newItem]);
    setNewTubingTitle('');
    setNewTubingPrice(0);
  };

  const removeTubingAndFittingItem = (id: string) => {
    setTubingAndFittingItems(tubingAndFittingItems.filter(item => item.id !== id));
  };

  // Testing functions
  const addTestingItem = () => {
    if (!newTestingTitle.trim() || newTestingPrice <= 0) {
      alert('Please enter both title and price');
      return;
    }

    const newItem: TestingItem = {
      id: `testing-${Date.now()}`,
      title: newTestingTitle.trim(),
      price: newTestingPrice,
    };

    setTestingItems([...testingItems, newItem]);
    setNewTestingTitle('');
    setNewTestingPrice(0);
  };

  const removeTestingItem = (id: string) => {
    setTestingItems(testingItems.filter(item => item.id !== id));
  };

  // Accessories functions
  const addAccessoryItem = (title: string, price: number, isDefault: boolean = false) => {
    const newItem: AccessoryItem = {
      id: `accessory-${Date.now()}-${Math.random()}`,
      title: title.trim(),
      price: price,
      isDefault: isDefault,
    };

    setAccessoryItems([...accessoryItems, newItem]);
  };

  const addCustomAccessory = () => {
    if (!newAccessoryTitle.trim() || newAccessoryPrice <= 0) {
      alert('Please enter both title and price');
      return;
    }

    addAccessoryItem(newAccessoryTitle, newAccessoryPrice, false);
    setNewAccessoryTitle('');
    setNewAccessoryPrice(0);
  };

  const removeAccessoryItem = (id: string) => {
    setAccessoryItems(accessoryItems.filter(item => item.id !== id));
  };

  const toggleDefaultAccessory = (title: string, price?: number) => {
    const exists = accessoryItems.find(item => item.title === title);
    
    if (exists) {
      removeAccessoryItem(exists.id);
      const newPrices = { ...customAccessoryPrice };
      delete newPrices[title];
      setCustomAccessoryPrice(newPrices);
    } else {
      if (price !== undefined) {
        addAccessoryItem(title, price, true);
      } else {
        setShowAccessoryPriceInput(title);
      }
    }
  };

  const handleDefaultAccessoryPriceSubmit = (title: string) => {
    const price = customAccessoryPrice[title];
    if (!price || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    addAccessoryItem(title, price, true);
    setShowAccessoryPriceInput(null);
  };

  const calculateProductPrice = async () => {
    // Validation
    if (!currentProduct.seriesNumber || !currentProduct.size || !currentProduct.rating) {
      alert('Please select Series, Size, and Rating');
      return;
    }

    if (!currentProduct.bodyEndConnectType || !currentProduct.bonnetType ||
        !currentProduct.plugType || !currentProduct.seatType) {
      alert('Please select all body component types');
      return;
    }

    if (!currentProduct.bodyMaterialId || !currentProduct.bonnetMaterialId ||
        !currentProduct.plugMaterialId || !currentProduct.seatMaterialId ||
        !currentProduct.stemMaterialId) {
      alert('Please select materials for all components');
      return;
    }

    if (currentProduct.hasActuator) {
      if (!currentProduct.actuatorType || !currentProduct.actuatorSeries || 
          !currentProduct.actuatorModel || !currentProduct.actuatorStandard) {
        alert('Please complete actuator configuration');
        return;
      }
    }

    setCalculating(true);

    try {
      // Get weights
      const [bodyWeight, bonnetWeight, plugWeight, seatWeight, stemWeight] = await Promise.all([
        getBodyWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bodyEndConnectType),
        getBonnetWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bonnetType),
        getComponentWeight(currentProduct.seriesNumber, 'plug', currentProduct.size, currentProduct.rating, currentProduct.plugType),
        getComponentWeight(currentProduct.seriesNumber, 'seat', currentProduct.size, currentProduct.rating, currentProduct.seatType),
        getStemWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating),
      ]);

      const bodyMaterial = materials.find(m => m.id === currentProduct.bodyMaterialId);
      const bonnetMaterial = materials.find(m => m.id === currentProduct.bonnetMaterialId);
      const plugMaterial = materials.find(m => m.id === currentProduct.plugMaterialId);
      const seatMaterial = materials.find(m => m.id === currentProduct.seatMaterialId);
      const stemMaterial = materials.find(m => m.id === currentProduct.stemMaterialId);

      if (!bodyWeight || !bonnetWeight || !plugWeight || !seatWeight || !stemWeight) {
        alert('Weight data not found for selected configuration');
        setCalculating(false);
        return;
      }

      if (!bodyMaterial || !bonnetMaterial || !plugMaterial || !seatMaterial || !stemMaterial) {
        alert('Material data not found');
        setCalculating(false);
        return;
      }

      // Calculate body sub-assembly costs
      const bodyTotalCost = bodyWeight * bodyMaterial.pricePerKg;
      const bonnetTotalCost = bonnetWeight * bonnetMaterial.pricePerKg;
      const plugTotalCost = plugWeight * plugMaterial.pricePerKg;
      const seatTotalCost = seatWeight * seatMaterial.pricePerKg;
      const stemTotalCost = stemWeight * stemMaterial.pricePerKg;

      // Cage price
      let cageTotalCost = 0;
      let cageFixedPrice = 0;
      
      if (currentProduct.hasCage && currentProduct.seatType) {
        const cagePrice = await getCagePriceBySeat(
          currentProduct.seriesNumber, 
          currentProduct.size, 
          currentProduct.seatType
        );
        if (cagePrice) {
          cageFixedPrice = cagePrice;
          cageTotalCost = cagePrice;
        }
      }

      const bodySubAssemblyTotal = bodyTotalCost + bonnetTotalCost + plugTotalCost + 
                                    seatTotalCost + stemTotalCost + cageTotalCost;

      // Actuator sub-assembly
      let actuatorFixedPrice = 0;
      let handwheelFixedPrice = 0;
      let actuatorSubAssemblyTotal = 0;

      if (currentProduct.hasActuator && currentProduct.actuatorType && 
          currentProduct.actuatorSeries && currentProduct.actuatorModel && 
          currentProduct.actuatorStandard) {
        
        const actuatorPrice = await getActuatorPrice(
          currentProduct.actuatorType,
          currentProduct.actuatorSeries,
          currentProduct.actuatorModel,
          currentProduct.actuatorStandard
        );

        if (actuatorPrice) {
          actuatorFixedPrice = actuatorPrice;
          actuatorSubAssemblyTotal += actuatorPrice;
        }

        if (currentProduct.hasHandwheel && currentProduct.actuatorModel) {
          const handwheelPrice = await getHandwheelPrice(currentProduct.actuatorModel);
          if (handwheelPrice) {
            handwheelFixedPrice = handwheelPrice;
            actuatorSubAssemblyTotal += handwheelPrice;
          }
        }
      }

      // Additional modules
      const tubingAndFittingTotal = tubingAndFittingItems.reduce((sum, item) => sum + item.price, 0);
      const testingTotal = testingItems.reduce((sum, item) => sum + item.price, 0);
      const accessoriesTotal = accessoryItems.reduce((sum, item) => sum + item.price, 0);

      // Cost breakdown with profit
      const baseManufacturingCost = bodySubAssemblyTotal + 
                                   (actuatorSubAssemblyTotal || 0) + 
                                   tubingAndFittingTotal + 
                                   testingTotal;

      const baseBoughtoutItemCost = accessoriesTotal;

      const manufacturingProfitAmount = (baseManufacturingCost * manufacturingProfit) / 100;
      const boughtoutProfitAmount = (baseBoughtoutItemCost * boughtoutProfit) / 100;

      const manufacturingCostWithProfit = baseManufacturingCost + manufacturingProfitAmount;
      const boughtoutCostWithProfit = baseBoughtoutItemCost + boughtoutProfitAmount;

      const unitCost = manufacturingCostWithProfit + boughtoutCostWithProfit;
      const productTotalCost = unitCost;

      setCurrentProduct({
        ...currentProduct,
        bodyWeight,
        bodyMaterialPrice: bodyMaterial.pricePerKg,
        bodyTotalCost,
        bonnetWeight,
        bonnetMaterialPrice: bonnetMaterial.pricePerKg,
        bonnetTotalCost,
        plugWeight,
        plugMaterialPrice: plugMaterial.pricePerKg,
        plugTotalCost,
        seatWeight,
        seatMaterialPrice: seatMaterial.pricePerKg,
        seatTotalCost,
        stemWeight,
        stemMaterialPrice: stemMaterial.pricePerKg,
        stemTotalCost,
        cageFixedPrice: currentProduct.hasCage ? cageFixedPrice : undefined,
        cageTotalCost: currentProduct.hasCage ? cageTotalCost : undefined,
        bodySubAssemblyTotal,
        actuatorFixedPrice: currentProduct.hasActuator ? actuatorFixedPrice : undefined,
        handwheelFixedPrice: currentProduct.hasHandwheel ? handwheelFixedPrice : undefined,
        actuatorSubAssemblyTotal: currentProduct.hasActuator ? actuatorSubAssemblyTotal : undefined,
        tubingAndFitting: tubingAndFittingItems,
        tubingAndFittingTotal,
        testing: testingItems,
        testingTotal,
        accessories: accessoryItems,
        accessoriesTotal,
        manufacturingCost: baseManufacturingCost,
        manufacturingProfitPercentage: manufacturingProfit,
        manufacturingProfitAmount,
        manufacturingCostWithProfit,
        boughtoutItemCost: baseBoughtoutItemCost,
        boughtoutProfitPercentage: boughtoutProfit,
        boughtoutProfitAmount,
        boughtoutCostWithProfit,
        unitCost,
        productTotalCost,
        lineTotal: productTotalCost * (currentProduct.quantity || 1),
      });

      alert('Price calculated successfully!');
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate price');
    } finally {
      setCalculating(false);
    }
  };

  const handleAddProduct = () => {
    setShowProductForm(true);
    setEditingProductIndex(null);
    setCurrentProduct({ 
      quantity: 1, 
      hasCage: false,
      hasActuator: false,
      hasHandwheel: false,
      tubingAndFitting: [],
      testing: [],
      accessories: [],
    });
    setTubingAndFittingItems([]);
    setTestingItems([]);
    setAccessoryItems([]);
    setManufacturingProfit(0);
    setBoughtoutProfit(0);
    setAvailableSizes([]);
    setAvailableRatings([]);
  };

  const handleEditProduct = (index: number) => {
    const product = products[index];
    setShowProductForm(true);
    setEditingProductIndex(index);
    setCurrentProduct(product);
    
    // Set module items
    setTubingAndFittingItems(product.tubingAndFitting || []);
    setTestingItems(product.testing || []);
    setAccessoryItems(product.accessories || []);
    
    // Set profit percentages
    setManufacturingProfit(product.manufacturingProfitPercentage || 0);
    setBoughtoutProfit(product.boughtoutProfitPercentage || 0);
    
    // Fetch options
    if (product.seriesNumber) {
      fetchAvailableSizes(product.seriesNumber);
      if (product.size) {
        fetchAvailableRatings(product.seriesNumber, product.size);
        if (product.rating) {
          fetchDependentOptions(product.seriesNumber, product.size, product.rating);
        }
      }
    }
  };

  const handleSaveProduct = () => {
    if (!currentProduct.productTotalCost) {
      alert('Please calculate the price first');
      return;
    }

    const product: QuoteProduct = {
      ...currentProduct,
      id: editingProductIndex !== null ? products[editingProductIndex].id : `product-${Date.now()}`,
    } as QuoteProduct;

    if (editingProductIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts[editingProductIndex] = product;
      setProducts(updatedProducts);
    } else {
      setProducts([...products, product]);
    }

    setShowProductForm(false);
    setCurrentProduct({ 
      quantity: 1, 
      hasCage: false,
      hasActuator: false,
      hasHandwheel: false,
      tubingAndFitting: [],
      testing: [],
      accessories: [],
    });
    setTubingAndFittingItems([]);
    setTestingItems([]);
    setAccessoryItems([]);
    setManufacturingProfit(0);
    setBoughtoutProfit(0);
    setEditingProductIndex(null);
  };

  const handleCancelProduct = () => {
    setShowProductForm(false);
    setCurrentProduct({ 
      quantity: 1, 
      hasCage: false,
      hasActuator: false,
      hasHandwheel: false,
      tubingAndFitting: [],
      testing: [],
      accessories: [],
    });
    setTubingAndFittingItems([]);
    setTestingItems([]);
    setAccessoryItems([]);
    setManufacturingProfit(0);
    setBoughtoutProfit(0);
    setEditingProductIndex(null);
  };

  const handleRemoveProduct = (index: number) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuote = async () => {
    if (!quote || products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setSaving(true);

    try {
      const totals = calculateQuoteTotals(products, discount, tax);

      const quoteRef = doc(db, 'quotes', quote.id);
      await updateDoc(quoteRef, {
        products: products.map(p => ({
          id: p.id,
          productType: p.productType,
          seriesId: p.seriesId,
          seriesNumber: p.seriesNumber,
          size: p.size,
          rating: p.rating,
          quantity: p.quantity,
          // Body sub-assembly
          bodyEndConnectType: p.bodyEndConnectType,
          bodyMaterialId: p.bodyMaterialId,
          bodyWeight: p.bodyWeight,
          bodyMaterialPrice: p.bodyMaterialPrice,
          bodyTotalCost: p.bodyTotalCost,
          bonnetType: p.bonnetType,
          bonnetMaterialId: p.bonnetMaterialId,
          bonnetWeight: p.bonnetWeight,
          bonnetMaterialPrice: p.bonnetMaterialPrice,
          bonnetTotalCost: p.bonnetTotalCost,
          plugType: p.plugType,
          plugMaterialId: p.plugMaterialId,
          plugWeight: p.plugWeight,
          plugMaterialPrice: p.plugMaterialPrice,
          plugTotalCost: p.plugTotalCost,
          seatType: p.seatType,
          seatMaterialId: p.seatMaterialId,
          seatWeight: p.seatWeight,
          seatMaterialPrice: p.seatMaterialPrice,
          seatTotalCost: p.seatTotalCost,
          stemMaterialId: p.stemMaterialId,
          stemWeight: p.stemWeight,
          stemMaterialPrice: p.stemMaterialPrice,
          stemTotalCost: p.stemTotalCost,
          hasCage: p.hasCage,
          cageFixedPrice: p.cageFixedPrice || null,
          cageTotalCost: p.cageTotalCost || null,
          bodySubAssemblyTotal: p.bodySubAssemblyTotal,
          // Actuator sub-assembly
          hasActuator: p.hasActuator,
          actuatorType: p.actuatorType || null,
          actuatorSeries: p.actuatorSeries || null,
          actuatorModel: p.actuatorModel || null,
          actuatorStandard: p.actuatorStandard || null,
          actuatorFixedPrice: p.actuatorFixedPrice || null,
          hasHandwheel: p.hasHandwheel || false,
          handwheelFixedPrice: p.handwheelFixedPrice || null,
          actuatorSubAssemblyTotal: p.actuatorSubAssemblyTotal || 0,
          // Additional modules
          tubingAndFitting: p.tubingAndFitting || [],
          tubingAndFittingTotal: p.tubingAndFittingTotal || 0,
          testing: p.testing || [],
          testingTotal: p.testingTotal || 0,
          accessories: p.accessories || [],
          accessoriesTotal: p.accessoriesTotal || 0,
          // Cost breakdown
          manufacturingCost: p.manufacturingCost || 0,
          boughtoutItemCost: p.boughtoutItemCost || 0,
          // Profit data
          manufacturingProfitPercentage: p.manufacturingProfitPercentage || 0,
          manufacturingProfitAmount: p.manufacturingProfitAmount || 0,
          manufacturingCostWithProfit: p.manufacturingCostWithProfit || p.manufacturingCost || 0,
          boughtoutProfitPercentage: p.boughtoutProfitPercentage || 0,
          boughtoutProfitAmount: p.boughtoutProfitAmount || 0,
          boughtoutCostWithProfit: p.boughtoutCostWithProfit || p.boughtoutItemCost || 0,
          // Totals
          unitCost: p.unitCost || 0,
          productTotalCost: p.productTotalCost,
          lineTotal: p.lineTotal,
        })),
        subtotal: totals.subtotal,
        discount,
        discountAmount: totals.discountAmount,
        tax,
        taxAmount: totals.taxAmount,
        total: totals.total,
        status,
        notes,
        updatedAt: Timestamp.now(),
      });

      alert('Quote updated successfully!');
      router.push(`/employee/quotes/${quote.id}`);
    } catch (error: any) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const totals = products.length > 0 
    ? calculateQuoteTotals(products, discount, tax)
    : { subtotal: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, total: 0 };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Quote not found</p>
        <Link href="/employee" className="text-green-600 hover:underline mt-4 inline-block">
          Back to Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={`/employee/quotes/${quote.id}`} className="text-green-600 hover:underline text-sm mb-4 inline-block">
          ← Back to Quote
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quote - {quote.quoteNumber}</h1>
        <p className="text-gray-600">Customer: {quote.customerName}</p>
      </div>

      {/* CONTINUE IN NEXT MESSAGE - File is too long */}
      {/* Products List */}
      {!showProductForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Products ({products.length})</h2>
            <button
              onClick={handleAddProduct}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No products added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.id} className="border-2 rounded-lg p-4 hover:border-green-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {product.seriesNumber} - {product.size}/{product.rating}
                      </h3>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p>Quantity: {product.quantity}</p>
                        <p>Manufacturing: ₹{product.manufacturingCost?.toLocaleString('en-IN')} 
                          {product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0 && (
                            <span className="text-blue-600 ml-2">(+{product.manufacturingProfitPercentage}% profit)</span>
                          )}
                        </p>
                        <p>Boughtout: ₹{product.boughtoutItemCost?.toLocaleString('en-IN')}
                          {product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0 && (
                            <span className="text-pink-600 ml-2">(+{product.boughtoutProfitPercentage}% profit)</span>
                          )}
                        </p>
                        <p className="font-semibold text-green-700">Unit Cost: ₹{product.unitCost?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Line Total</p>
                        <p className="font-bold text-2xl text-green-600">₹{product.lineTotal.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleEditProduct(index)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded hover:bg-red-50 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Configuration Form */}
      {showProductForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">
            {editingProductIndex !== null ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          {/* Basic Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Series *</label>
              <select
                value={currentProduct.seriesId || ''}
                onChange={(e) => handleSeriesChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Series</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.productType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Size *</label>
              <select
                value={currentProduct.size || ''}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={!availableSizes.length}
              >
                <option value="">Select Size</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              <select
                value={currentProduct.rating || ''}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={!availableRatings.length}
              >
                <option value="">Select Rating</option>
                {availableRatings.map((rating) => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BODY SUB-ASSEMBLY */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-blue-200 rounded-lg p-6 mb-6 bg-blue-50">
              <h3 className="text-xl font-bold mb-4 text-blue-900">🔧 Body Sub-Assembly</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Body */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Body</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">End Connect Type *</label>
                      <select
                        value={currentProduct.bodyEndConnectType || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, bodyEndConnectType: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select</option>
                        {availableEndConnectTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Material *</label>
                      <select
                        value={currentProduct.bodyMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, bodyMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bonnet */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Bonnet</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Bonnet Type *</label>
                      <select
                        value={currentProduct.bonnetType || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, bonnetType: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select</option>
                        {availableBonnetTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Material *</label>
                      <select
                        value={currentProduct.bonnetMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, bonnetMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Plug */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Plug</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Plug Type *</label>
                      <select
                        value={currentProduct.plugType || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, plugType: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select</option>
                        {availablePlugTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Material *</label>
                      <select
                        value={currentProduct.plugMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, plugMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Seat */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Seat</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Seat Type *</label>
                      <select
                        value={currentProduct.seatType || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, seatType: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select</option>
                        {availableSeatTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Material *</label>
                      <select
                        value={currentProduct.seatMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, seatMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stem */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Stem</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Material *</label>
                      <select
                        value={currentProduct.stemMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, stemMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        * Stem price = Size × Rating × Material price
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cage */}
                {currentProduct.hasCage && currentProduct.seatType && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold mb-3 text-gray-900">Cage</h4>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-green-800">
                        ✓ Cage available for {currentProduct.seatType}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Price will be calculated based on seat type
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTUATOR SUB-ASSEMBLY */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-purple-200 rounded-lg p-6 mb-6 bg-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-900">⚙️ Actuator Sub-Assembly</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentProduct.hasActuator || false}
                    onChange={(e) => setCurrentProduct({ 
                      ...currentProduct, 
                      hasActuator: e.target.checked,
                      hasHandwheel: false,
                    })}
                    className="mr-2 w-5 h-5"
                  />
                  <span className="text-sm font-medium">Add Actuator</span>
                </label>
              </div>

              {currentProduct.hasActuator && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium mb-2">Actuator Type *</label>
                    <select
                      value={currentProduct.actuatorType || ''}
                      onChange={(e) => {
                        setCurrentProduct({ 
                          ...currentProduct, 
                          actuatorType: e.target.value,
                          actuatorSeries: undefined,
                          actuatorModel: undefined,
                        });
                        setAvailableActuatorSeries([]);
                        setAvailableActuatorModels([]);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select Type</option>
                      {availableActuatorTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium mb-2">Actuator Series *</label>
                    <select
                      value={currentProduct.actuatorSeries || ''}
                      onChange={(e) => {
                        setCurrentProduct({ 
                          ...currentProduct, 
                          actuatorSeries: e.target.value,
                          actuatorModel: undefined,
                        });
                        setAvailableActuatorModels([]);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={!availableActuatorSeries.length}
                    >
                      <option value="">Select Series</option>
                      {availableActuatorSeries.map((series) => (
                        <option key={series} value={series}>{series}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium mb-2">Actuator Model *</label>
                    <select
                      value={currentProduct.actuatorModel || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, actuatorModel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={!availableActuatorModels.length}
                    >
                      <option value="">Select Model</option>
                      {availableActuatorModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium mb-2">Configuration *</label>
                    <select
                      value={currentProduct.actuatorStandard || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, actuatorStandard: e.target.value as 'standard' | 'special' })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select Configuration</option>
                      <option value="standard">Standard</option>
                      <option value="special">Special</option>
                    </select>
                  </div>

                  {currentProduct.actuatorModel && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentProduct.hasHandwheel || false}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, hasHandwheel: e.target.checked })}
                          className="mr-2 w-5 h-5"
                        />
                        <span className="text-sm font-medium">Add Handwheel (Optional)</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Handwheel price depends on actuator model
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!currentProduct.hasActuator && (
                <div className="text-center py-8 text-gray-500">
                  <p>Enable "Add Actuator" to configure actuator options</p>
                </div>
              )}
            </div>
          )}

          {/* CONTINUE IN NEXT MESSAGE WITH OTHER MODULES */}
          {/* TUBING & FITTING MODULE */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-orange-200 rounded-lg p-6 mb-6 bg-orange-50">
              <h3 className="text-xl font-bold mb-4 text-orange-900">🔧 Tubing & Fitting</h3>
              
              {/* Add New Item */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={newTubingTitle}
                      onChange={(e) => setNewTubingTitle(e.target.value)}
                      placeholder="e.g., Stainless Steel Tubing 1/4 inch"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newTubingPrice}
                      onChange={(e) => setNewTubingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={addTubingAndFittingItem}
                  className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm"
                >
                  + Add Item
                </button>
              </div>

              {/* Items List */}
              {tubingAndFittingItems.length > 0 && (
                <div className="space-y-2">
                  {tubingAndFittingItems.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => removeTubingAndFittingItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="font-bold text-orange-900">
                      Tubing & Fitting Total: ₹{tubingAndFittingItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}

              {tubingAndFittingItems.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No items added yet</p>
                </div>
              )}
            </div>
          )}

          {/* TESTING MODULE */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-teal-200 rounded-lg p-6 mb-6 bg-teal-50">
              <h3 className="text-xl font-bold mb-4 text-teal-900">🔬 Testing</h3>
              
              {/* Add New Item */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Test Title</label>
                    <input
                      type="text"
                      value={newTestingTitle}
                      onChange={(e) => setNewTestingTitle(e.target.value)}
                      placeholder="e.g., Hydrostatic Pressure Test"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newTestingPrice}
                      onChange={(e) => setNewTestingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={addTestingItem}
                  className="mt-3 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
                >
                  + Add Test
                </button>
              </div>

              {/* Items List */}
              {testingItems.length > 0 && (
                <div className="space-y-2">
                  {testingItems.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => removeTestingItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <p className="font-bold text-teal-900">
                      Testing Total: ₹{testingItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}

              {testingItems.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No tests added yet</p>
                </div>
              )}
            </div>
          )}

          {/* ACCESSORIES MODULE */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-pink-200 rounded-lg p-6 mb-6 bg-pink-50">
              <h3 className="text-xl font-bold mb-4 text-pink-900">🎯 Accessories</h3>
              
              {/* Default Accessories - Checkboxes with Custom Price Input */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-3">Default Accessories (Optional - Enter Custom Price)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEFAULT_ACCESSORIES.map((title) => {
                    const isChecked = accessoryItems.some(item => item.title === title);
                    const showInput = showAccessoryPriceInput === title;
                    
                    return (
                      <div key={title}>
                        <label className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setShowAccessoryPriceInput(title);
                              } else {
                                toggleDefaultAccessory(title);
                              }
                            }}
                            className="mr-2 w-4 h-4"
                          />
                          <span className="text-sm">{title}</span>
                        </label>
                        
                        {showInput && (
                          <div className="ml-6 mt-2 flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              placeholder="Enter price"
                              value={customAccessoryPrice[title] || ''}
                              onChange={(e) => setCustomAccessoryPrice({
                                ...customAccessoryPrice,
                                [title]: parseFloat(e.target.value) || 0
                              })}
                              className="flex-1 px-3 py-1 border rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleDefaultAccessoryPriceSubmit(title)}
                              className="bg-pink-600 text-white px-3 py-1 rounded text-xs hover:bg-pink-700"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setShowAccessoryPriceInput(null);
                              }}
                              className="text-gray-600 hover:text-gray-800 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Accessory */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-3">Add Custom Accessory</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">Title</label>
                    <input
                      type="text"
                      value={newAccessoryTitle}
                      onChange={(e) => setNewAccessoryTitle(e.target.value)}
                      placeholder="e.g., Custom Mounting Bracket"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newAccessoryPrice}
                      onChange={(e) => setNewAccessoryPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={addCustomAccessory}
                  className="mt-3 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 text-sm"
                >
                  + Add Custom Accessory
                </button>
              </div>

              {/* Items List */}
              {accessoryItems.length > 0 && (
                <div className="space-y-2">
                  {accessoryItems.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {item.title}
                          {item.isDefault && <span className="ml-2 text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded">Default</span>}
                        </p>
                        <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => removeAccessoryItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <p className="font-bold text-pink-900">
                      Accessories Total: ₹{accessoryItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}

              {accessoryItems.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No accessories selected</p>
                </div>
              )}
            </div>
          )}

          {/* PROFIT PERCENTAGE SECTION */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-indigo-200 rounded-lg p-6 mb-6 bg-indigo-50">
              <h3 className="text-xl font-bold mb-4 text-indigo-900">💼 Profit Margin</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-semibold mb-2 text-blue-900">
                    Manufacturing Cost Profit (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={manufacturingProfit}
                    onChange={(e) => setManufacturingProfit(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border rounded-lg text-lg font-semibold"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Applied to: Body + Actuator + Tubing & Fitting + Testing
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-semibold mb-2 text-pink-900">
                    Boughtout Items Profit (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={boughtoutProfit}
                    onChange={(e) => setBoughtoutProfit(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border rounded-lg text-lg font-semibold"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Applied to: Accessories
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-indigo-100 p-4 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>Note:</strong> Profit percentages will be calculated after you click "Calculate Price"
                </p>
              </div>
            </div>
          )}

          {/* QUANTITY */}
          {currentProduct.size && currentProduct.rating && (
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300 mb-6">
              <label className="block text-sm font-medium mb-2">Product Quantity *</label>
              <input
                type="number"
                min="1"
                value={currentProduct.quantity || 1}
                onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border rounded-lg text-lg font-semibold"
              />
              <p className="text-xs text-gray-500 mt-2">
                * Quantity applies to the entire configured product with all modules
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleCancelProduct}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              onClick={calculateProductPrice}
              disabled={calculating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {calculating ? 'Calculating...' : 'Calculate Price'}
            </button>

            {currentProduct.productTotalCost && (
              <button
                onClick={handleSaveProduct}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingProductIndex !== null ? 'Update Product' : 'Add Product'} (₹{currentProduct.lineTotal?.toLocaleString('en-IN')})
              </button>
            )}
          </div>

          {/* Price Breakdown (same as new quote page) */}
          {currentProduct.productTotalCost && (
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <h4 className="font-bold text-xl mb-6 text-gray-900">💰 Complete Price Breakdown</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Body Sub-Assembly */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="text-lg mr-2">🔧</span>
                    Body Sub-Assembly
                  </h5>
                  <div className="text-sm space-y-1">
                    <p className="flex justify-between">
                      <span>Body:</span>
                      <span>₹{currentProduct.bodyTotalCost?.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Bonnet:</span>
                      <span>₹{currentProduct.bonnetTotalCost?.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Plug:</span>
                      <span>₹{currentProduct.plugTotalCost?.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Seat:</span>
                      <span>₹{currentProduct.seatTotalCost?.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Stem:</span>
                      <span>₹{currentProduct.stemTotalCost?.toFixed(2)}</span>
                    </p>
                    {currentProduct.cageTotalCost && (
                      <p className="flex justify-between">
                        <span>Cage:</span>
                        <span>₹{currentProduct.cageTotalCost?.toFixed(2)}</span>
                      </p>
                    )}
                    <p className="flex justify-between font-bold pt-2 border-t text-blue-900">
                      <span>Subtotal:</span>
                      <span>₹{currentProduct.bodySubAssemblyTotal?.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                {/* Actuator Sub-Assembly */}
                {currentProduct.hasActuator && currentProduct.actuatorSubAssemblyTotal && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-purple-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">⚙️</span>
                      Actuator Sub-Assembly
                    </h5>
                    <div className="text-sm space-y-1">
                      <p className="flex justify-between">
                        <span>Actuator:</span>
                        <span>₹{currentProduct.actuatorFixedPrice?.toFixed(2)}</span>
                      </p>
                      {currentProduct.hasHandwheel && currentProduct.handwheelFixedPrice && (
                        <p className="flex justify-between">
                          <span>Handwheel:</span>
                          <span>₹{currentProduct.handwheelFixedPrice?.toFixed(2)}</span>
                        </p>
                      )}
                      <p className="flex justify-between font-bold pt-2 border-t text-purple-900">
                        <span>Subtotal:</span>
                        <span>₹{currentProduct.actuatorSubAssemblyTotal?.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Tubing & Fitting */}
                {currentProduct.tubingAndFittingTotal && currentProduct.tubingAndFittingTotal > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-orange-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🔧</span>
                      Tubing & Fitting
                    </h5>
                    <div className="text-sm space-y-1">
                      {currentProduct.tubingAndFitting?.map((item) => (
                        <p key={item.id} className="flex justify-between">
                          <span className="truncate mr-2">{item.title}:</span>
                          <span>₹{item.price.toFixed(2)}</span>
                        </p>
                      ))}
                      <p className="flex justify-between font-bold pt-2 border-t text-orange-900">
                        <span>Subtotal:</span>
                        <span>₹{currentProduct.tubingAndFittingTotal?.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Testing */}
                {currentProduct.testingTotal && currentProduct.testingTotal > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-teal-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🔬</span>
                      Testing
                    </h5>
                    <div className="text-sm space-y-1">
                      {currentProduct.testing?.map((item) => (
                        <p key={item.id} className="flex justify-between">
                          <span className="truncate mr-2">{item.title}:</span>
                          <span>₹{item.price.toFixed(2)}</span>
                        </p>
                      ))}
                      <p className="flex justify-between font-bold pt-2 border-t text-teal-900">
                        <span>Subtotal:</span>
                        <span>₹{currentProduct.testingTotal?.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Accessories */}
                {currentProduct.accessoriesTotal && currentProduct.accessoriesTotal > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-pink-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🎯</span>
                      Accessories
                    </h5>
                    <div className="text-sm space-y-1">
                      {currentProduct.accessories?.map((item) => (
                        <p key={item.id} className="flex justify-between">
                          <span className="truncate mr-2">{item.title}:</span>
                          <span>₹{item.price.toFixed(2)}</span>
                        </p>
                      ))}
                      <p className="flex justify-between font-bold pt-2 border-t text-pink-900">
                        <span>Subtotal:</span>
                        <span>₹{currentProduct.accessoriesTotal?.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Summary */}
              <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg border-2 border-blue-300">
                <h5 className="font-bold text-lg mb-4 text-gray-900">📊 Cost Summary</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-base">
                    <span className="font-semibold text-gray-700">Manufacturing Cost:</span>
                    <span className="font-bold text-blue-700">
                      ₹{currentProduct.manufacturingCost?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-4">
                    (Body + Actuator + Tubing & Fitting + Testing)
                  </p>

                  {currentProduct.manufacturingProfitPercentage && currentProduct.manufacturingProfitPercentage > 0 && (
                    <>
                      <div className="flex justify-between text-blue-600 pl-4">
                        <span>+ Profit ({currentProduct.manufacturingProfitPercentage}%):</span>
                        <span>₹{currentProduct.manufacturingProfitAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-blue-800 pl-4">
                        <span>Manufacturing (with profit):</span>
                        <span>₹{currentProduct.manufacturingCostWithProfit?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center text-base pt-2 border-t">
                    <span className="font-semibold text-gray-700">Boughtout Item Cost:</span>
                    <span className="font-bold text-pink-700">
                      ₹{currentProduct.boughtoutItemCost?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-4">
                    (Accessories)
                  </p>

                  {currentProduct.boughtoutProfitPercentage && currentProduct.boughtoutProfitPercentage > 0 && (
                    <>
                      <div className="flex justify-between text-pink-600 pl-4">
                        <span>+ Profit ({currentProduct.boughtoutProfitPercentage}%):</span>
                        <span>₹{currentProduct.boughtoutProfitAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-pink-800 pl-4">
                        <span>Boughtout (with profit):</span>
                        <span>₹{currentProduct.boughtoutCostWithProfit?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center text-lg pt-4 border-t-2 border-gray-400">
                    <span className="font-bold text-gray-900">Unit Cost:</span>
                    <span className="font-bold text-green-700 text-xl">
                      ₹{currentProduct.unitCost?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xl pt-4 border-t-2 border-green-400">
                    <span className="font-bold text-gray-900">Quantity:</span>
                    <span className="font-bold text-gray-900">×{currentProduct.quantity}</span>
                  </div>

                  <div className="flex justify-between items-center text-2xl pt-4 border-t-4 border-green-600">
                    <span className="font-bold text-gray-900">Line Total:</span>
                    <span className="font-bold text-green-600">
                      ₹{currentProduct.lineTotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quote Summary and Save */}
      {!showProductForm && products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Quote Summary</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-1 font-medium">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Tax (%)</label>
              <input
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-1 font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Add any special instructions or notes..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-1 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-lg mb-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">₹{totals.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-lg text-red-600">
                  <span className="font-medium">Discount ({discount}%):</span>
                  <span className="font-semibold">-₹{totals.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg">
                <span className="font-medium">Tax ({tax}%):</span>
                <span className="font-semibold">₹{totals.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-4 border-t-2 text-green-700">
                <span>Grand Total:</span>
                <span>₹{totals.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveQuote}
            disabled={saving}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-lg"
          >
            {saving ? 'Saving...' : 'Save Quote'}
          </button>
        </div>
      )}
    </div>
  );
}