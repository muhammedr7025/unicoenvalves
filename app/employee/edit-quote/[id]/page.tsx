'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllCustomers } from '@/lib/firebase/customerService';
import { getAllMaterials, getAllSeries } from '@/lib/firebase/pricingService';
import {
  getAvailableSizes,
  getAvailableRatings,
  getAvailableEndConnectTypes,
  getAvailableBonnetTypes,
  getAvailablePlugTypes,
  getAvailableSeatTypes,
  getBodyWeight,
  getBonnetWeight,
  getPlugWeight,
  getSeatWeight,
  getStemFixedPrice,
  getAvailableActuatorTypes,
  getAvailableActuatorSeries,
  getAvailableActuatorModels,
  getActuatorPrice,
  getHandwheelPrice,
} from '@/lib/firebase/productConfigHelper';
import {
  Customer,
  Material,
  Series,
  Quote,
  QuoteProduct,
  TubingAndFittingItem,
  TestingItem,
  AccessoryItem,
  DEFAULT_ACCESSORIES,
} from '@/types';
import { calculateQuoteTotals } from '@/utils/priceCalculator';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);

  // Materials by group
  const [bodyBonnetMaterials, setBodyBonnetMaterials] = useState<Material[]>([]);
  const [plugMaterials, setPlugMaterials] = useState<Material[]>([]);
  const [seatMaterials, setSeatMaterials] = useState<Material[]>([]);
  const [stemMaterials, setStemMaterials] = useState<Material[]>([]);
  const [cageMaterials, setCageMaterials] = useState<Material[]>([]);

  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<QuoteProduct[]>([]);

  const [currentProduct, setCurrentProduct] = useState<Partial<QuoteProduct>>({
    quantity: 1,
    hasCage: false,
    hasSealRing: false,
    hasActuator: false,
    hasHandwheel: false,
    tubingAndFitting: [],
    testing: [],
    accessories: [],
  });

  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Dynamic options
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableRatings, setAvailableRatings] = useState<string[]>([]);
  const [availableEndConnectTypes, setAvailableEndConnectTypes] = useState<string[]>([]);
  const [availableBonnetTypes, setAvailableBonnetTypes] = useState<string[]>([]);
  const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
  const [availableSeatTypes, setAvailableSeatTypes] = useState<string[]>([]);
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
  const [customAccessoryPrice, setCustomAccessoryPrice] = useState<{ [key: string]: number }>({});

  // Profit percentages
  const [manufacturingProfit, setManufacturingProfit] = useState(0);
  const [boughtoutProfit, setBoughtoutProfit] = useState(0);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState('');
  const [projectName, setProjectName] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft');
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  const fetchInitialData = async () => {
    const [customersData, allMaterials, seriesData, actuatorTypes] = await Promise.all([
      getAllCustomers(),
      getAllMaterials(),
      getAllSeries(),
      getAvailableActuatorTypes(),
    ]);

    setCustomers(customersData);
    setBodyBonnetMaterials(allMaterials.filter(m => m.materialGroup === 'BodyBonnet' && m.isActive));
    setPlugMaterials(allMaterials.filter(m => m.materialGroup === 'Plug' && m.isActive));
    setSeatMaterials(allMaterials.filter(m => m.materialGroup === 'Seat' && m.isActive));
    setStemMaterials(allMaterials.filter(m => m.materialGroup === 'Stem' && m.isActive));
    setCageMaterials(allMaterials.filter(m => m.materialGroup === 'Cage' && m.isActive));
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
          projectName: data.projectName || '',
          enquiryId: data.enquiryId || '',
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
        setProjectName(loadedQuote.projectName || '');
        setEnquiryId(loadedQuote.enquiryId || '');
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

  const handleAddProduct = () => {
    setCurrentProduct({
      quantity: 1,
      hasCage: false,
      hasSealRing: false,
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
    setShowProductForm(true);
  };

  const handleEditProduct = async (index: number) => {
    const product = products[index];
    setCurrentProduct(product);
    setTubingAndFittingItems(product.tubingAndFitting || []);
    setTestingItems(product.testing || []);
    setAccessoryItems(product.accessories || []);
    setManufacturingProfit(product.manufacturingProfitPercentage || 0);
    setBoughtoutProfit(product.boughtoutProfitPercentage || 0);
    setEditingProductIndex(index);
    setShowProductForm(true);

    // Fetch options for the selected product
    if (product.seriesNumber) {
      const sizes = await getAvailableSizes(product.seriesNumber);
      setAvailableSizes(sizes);

      if (product.size) {
        const ratings = await getAvailableRatings(product.seriesNumber, product.size);
        setAvailableRatings(ratings);

        if (product.rating) {
          const [endConnects, bonnets, plugs, seats] = await Promise.all([
            getAvailableEndConnectTypes(product.seriesNumber, product.size, product.rating),
            getAvailableBonnetTypes(product.seriesNumber, product.size, product.rating),
            getAvailablePlugTypes(product.seriesNumber, product.size, product.rating),
            getAvailableSeatTypes(product.seriesNumber, product.size, product.rating),
          ]);

          setAvailableEndConnectTypes(endConnects);
          setAvailableBonnetTypes(bonnets);
          setAvailablePlugTypes(plugs);
          setAvailableSeatTypes(seats);
        }
      }
    }

    // Fetch actuator options if has actuator
    if (product.hasActuator && product.actuatorType) {
      const actuatorSeriesList = await getAvailableActuatorSeries(product.actuatorType);
      setAvailableActuatorSeries(actuatorSeriesList);

      if (product.actuatorSeries) {
        const models = await getAvailableActuatorModels(product.actuatorType, product.actuatorSeries);
        setAvailableActuatorModels(models);
      }
    }
  };

  const handleRemoveProduct = (index: number) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleCancelProduct = () => {
    setShowProductForm(false);
    setCurrentProduct({
      quantity: 1,
      hasCage: false,
      hasSealRing: false,
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
  const handleSeriesChange = async (seriesId: string) => {
    const selectedSeries = series.find(s => s.id === seriesId);
    if (!selectedSeries) return;

    setCurrentProduct({
      ...currentProduct,
      seriesId,
      seriesNumber: selectedSeries.seriesNumber,
      productType: selectedSeries.productType,
      hasCage: selectedSeries.hasCage,
      hasSealRing: selectedSeries.hasSealRing,
      size: undefined,
      rating: undefined,
    });

    setAvailableSizes([]);
    setAvailableRatings([]);
    await fetchAvailableSizes(selectedSeries.seriesNumber);
  };

  const handleSizeChange = async (size: string) => {
    setCurrentProduct({
      ...currentProduct,
      size,
      rating: undefined
    });

    setAvailableRatings([]);
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
      getAvailablePlugTypes(seriesNumber, size, rating),
      getAvailableSeatTypes(seriesNumber, size, rating),
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

  // Calculate product price (same as new quote page with NEW structure)
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

    if (!currentProduct.bodyBonnetMaterialId || !currentProduct.plugMaterialId ||
      !currentProduct.seatMaterialId || !currentProduct.stemMaterialId) {
      alert('Please select materials for all components');
      return;
    }

    if (currentProduct.hasCage && !currentProduct.cageMaterialId) {
      alert('Please select cage material');
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
      // Get weights for body components
      const [bodyWeight, bonnetWeight, plugWeightResult, seatWeightResult] = await Promise.all([
        getBodyWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bodyEndConnectType),
        getBonnetWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bonnetType),
        getPlugWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.plugType),
        getSeatWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.seatType),
      ]);

      // Get materials
      const bodyBonnetMaterial = bodyBonnetMaterials.find(m => m.id === currentProduct.bodyBonnetMaterialId);
      const plugMaterial = plugMaterials.find(m => m.id === currentProduct.plugMaterialId);
      const seatMaterial = seatMaterials.find(m => m.id === currentProduct.seatMaterialId);
      const stemMaterial = stemMaterials.find(m => m.id === currentProduct.stemMaterialId);

      if (!bodyWeight || !bonnetWeight || !plugWeightResult || !seatWeightResult) {
        alert('Weight data not found for selected configuration');
        setCalculating(false);
        return;
      }

      if (!bodyBonnetMaterial || !plugMaterial || !seatMaterial || !stemMaterial) {
        alert('Material data not found');
        setCalculating(false);
        return;
      }

      // Extract weights from results
      const plugWeight = plugWeightResult.weight;
      const seatWeight = seatWeightResult.weight;

      // Calculate body sub-assembly costs
      const bodyTotalCost = bodyWeight * bodyBonnetMaterial.pricePerKg;
      const bonnetTotalCost = bonnetWeight * bodyBonnetMaterial.pricePerKg;
      const plugTotalCost = plugWeight * plugMaterial.pricePerKg;
      const seatTotalCost = seatWeight * seatMaterial.pricePerKg;

      // Get stem fixed price (based on material name)
      const stemFixedPrice = await getStemFixedPrice(
        currentProduct.seriesNumber,
        currentProduct.size,
        currentProduct.rating,
        stemMaterial.name
      );

      if (!stemFixedPrice) {
        alert('Stem price not found for selected configuration');
        setCalculating(false);
        return;
      }

      const stemTotalCost = stemFixedPrice;

      // Cage calculation - now from seat weight data
      let cageTotalCost = 0;
      let cageWeight = 0;
      let cageMaterialPrice = 0;
      const hasCage = seatWeightResult.hasCage;

      if (hasCage && seatWeightResult.cageWeight && currentProduct.cageMaterialId) {
        const cageMaterial = cageMaterials.find(m => m.id === currentProduct.cageMaterialId);

        if (cageMaterial) {
          cageWeight = seatWeightResult.cageWeight;
          cageMaterialPrice = cageMaterial.pricePerKg;
          cageTotalCost = cageWeight * cageMaterialPrice;
        }
      }

      // Seal ring calculation - now from plug weight data
      let sealRingTotalCost = 0;
      let sealRingFixedPrice = 0;
      const hasSealRing = plugWeightResult.hasSealRing;

      if (hasSealRing && plugWeightResult.sealRingPrice) {
        sealRingFixedPrice = plugWeightResult.sealRingPrice;
        sealRingTotalCost = plugWeightResult.sealRingPrice;
      }

      const bodySubAssemblyTotal = bodyTotalCost + bonnetTotalCost + plugTotalCost +
        seatTotalCost + stemTotalCost + cageTotalCost + sealRingTotalCost;

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
        // Body sub-assembly
        bodyWeight,
        bodyMaterialPrice: bodyBonnetMaterial.pricePerKg,
        bodyTotalCost,
        bonnetWeight,
        bonnetMaterialPrice: bodyBonnetMaterial.pricePerKg,
        bonnetTotalCost,
        plugWeight,
        plugMaterialPrice: plugMaterial.pricePerKg,
        plugTotalCost,
        seatWeight,
        seatMaterialPrice: seatMaterial.pricePerKg,
        seatTotalCost,
        stemFixedPrice,
        stemTotalCost,
        hasCage: hasCage,
        cageWeight: hasCage ? cageWeight : undefined,
        cageMaterialPrice: hasCage ? cageMaterialPrice : undefined,
        cageTotalCost: hasCage ? cageTotalCost : undefined,
        hasSealRing: hasSealRing,
        sealRingFixedPrice: hasSealRing ? sealRingFixedPrice : undefined,
        sealRingTotalCost: hasSealRing ? sealRingTotalCost : undefined,
        bodySubAssemblyTotal,
        // Actuator sub-assembly
        actuatorFixedPrice: currentProduct.hasActuator ? actuatorFixedPrice : undefined,
        handwheelFixedPrice: currentProduct.hasHandwheel ? handwheelFixedPrice : undefined,
        actuatorSubAssemblyTotal: currentProduct.hasActuator ? actuatorSubAssemblyTotal : undefined,
        // Additional modules
        tubingAndFitting: tubingAndFittingItems,
        tubingAndFittingTotal,
        testing: testingItems,
        testingTotal,
        accessories: accessoryItems,
        accessoriesTotal,
        // Cost breakdown
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
  const handleSaveProduct = () => {
    if (!currentProduct.productTotalCost) {
      alert('Please calculate the price first');
      return;
    }

    const product: QuoteProduct = {
      ...currentProduct,
      id: currentProduct.id || `product-${Date.now()}`,
    } as QuoteProduct;

    if (editingProductIndex !== null) {
      // Update existing product
      const updatedProducts = [...products];
      updatedProducts[editingProductIndex] = product;
      setProducts(updatedProducts);
    } else {
      // Add new product
      setProducts([...products, product]);
    }

    // Reset form
    handleCancelProduct();
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
          productTag: p.productTag || null,
          // Body sub-assembly
          bodyEndConnectType: p.bodyEndConnectType,
          bodyBonnetMaterialId: p.bodyBonnetMaterialId,
          bodyWeight: p.bodyWeight,
          bodyMaterialPrice: p.bodyMaterialPrice,
          bodyTotalCost: p.bodyTotalCost,
          bonnetType: p.bonnetType,
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
          stemFixedPrice: p.stemFixedPrice,
          stemTotalCost: p.stemTotalCost,
          hasCage: p.hasCage,
          cageMaterialId: p.cageMaterialId || null,
          cageWeight: p.cageWeight || null,
          cageMaterialPrice: p.cageMaterialPrice || null,
          cageTotalCost: p.cageTotalCost || null,
          hasSealRing: p.hasSealRing,
          sealRingFixedPrice: p.sealRingFixedPrice || null,
          sealRingTotalCost: p.sealRingTotalCost || null,
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
        projectName: projectName || '',
        enquiryId: enquiryId || '',
        notes: notes || '',
        updatedAt: Timestamp.now(),
      });

      alert('Quote updated successfully!');
      router.push('/employee');
    } catch (error: any) {
      console.error('Save error:', error);
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
            <p className="text-gray-600 mt-1">{quote.quoteNumber}</p>
          </div>
          <button
            onClick={() => router.push('/employee')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Customer:</strong> {quote.customerName}
        </p>
      </div>

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
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">
                          {product.seriesNumber} - {product.size}/{product.rating}
                        </h3>
                        {product.productTag && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                            {product.productTag}
                          </span>
                        )}
                      </div>
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

          {/* Product Tag/Name */}
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Product Tag/Name (Optional)</label>
            <input
              type="text"
              value={currentProduct.productTag || ''}
              onChange={(e) => setCurrentProduct({ ...currentProduct, productTag: e.target.value })}
              placeholder="e.g., Main Control Valve, Backup Unit, Emergency System"
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-xs text-gray-600 mt-2">
              Add a custom identifier to easily distinguish this product in the quote
            </p>
          </div>

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

          {/* BODY SUB-ASSEMBLY with 5 Material Groups */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-blue-200 rounded-lg p-6 mb-6 bg-blue-50">
              <h3 className="text-xl font-bold mb-4 text-blue-900">🔧 Body Sub-Assembly</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Body */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">Material Group 1</span>
                    Body
                  </h4>
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
                      <label className="block text-sm mb-1">Material (Body & Bonnet) *</label>
                      <select
                        value={currentProduct.bodyBonnetMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, bodyBonnetMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {bodyBonnetMaterials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        * This material is shared for both Body and Bonnet
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bonnet */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">Material Group 1</span>
                    Bonnet
                  </h4>
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
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-blue-800">
                        ℹ️ Uses the same material as Body (Material Group 1)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plug */}
                <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">Material Group 2</span>
                    Plug
                  </h4>
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
                      <label className="block text-sm mb-1">Plug Material *</label>
                      <select
                        value={currentProduct.plugMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, plugMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {plugMaterials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Seat */}
                <div className="bg-white rounded-lg p-4 border-2 border-pink-300">
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs mr-2">Material Group 3</span>
                    Seat
                  </h4>
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
                      <label className="block text-sm mb-1">Seat Material *</label>
                      <select
                        value={currentProduct.seatMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, seatMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {seatMaterials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stem */}
                <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs mr-2">Material Group 4</span>
                    Stem
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Stem Material *</label>
                      <select
                        value={currentProduct.stemMaterialId || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, stemMaterialId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {stemMaterials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        * Stem price = Fixed price based on series, size, rating, and material
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cage (conditional) */}
                {currentProduct.hasCage && (
                  <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">Material Group 5</span>
                      Cage
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-800">
                          ✓ Cage available for this series
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Cage Material *</label>
                        <select
                          value={currentProduct.cageMaterialId || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, cageMaterialId: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="">Select Material</option>
                          {cageMaterials.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          * Cage price = Weight × Material price
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seal Ring (conditional) */}
                {currentProduct.hasSealRing && currentProduct.plugType && (
                  <div className="bg-white rounded-lg p-4 border-2 border-indigo-300">
                    <h4 className="font-semibold mb-3 text-gray-900">Seal Ring</h4>
                    <div className="bg-indigo-50 p-3 rounded">
                      <p className="text-sm text-indigo-800">
                        ✓ Seal Ring available for this series
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        Fixed price based on plug type, size, and rating
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
                        if (e.target.value) {
                          fetchActuatorSeries(e.target.value);
                        }
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
                        if (e.target.value && currentProduct.actuatorType) {
                          fetchActuatorModels(currentProduct.actuatorType, e.target.value);
                        }
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
          {/* TUBING & FITTING MODULE */}
          {currentProduct.size && currentProduct.rating && (
            <div className="border-2 border-orange-200 rounded-lg p-6 mb-6 bg-orange-50">
              <h3 className="text-xl font-bold mb-4 text-orange-900">🔧 Tubing & Fitting</h3>

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

          {/* Price Breakdown Display - Same as New Quote Page */}
          {currentProduct.productTotalCost && (
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <h4 className="font-bold text-xl mb-6 text-gray-900">💰 Complete Price Breakdown</h4>

              {/* Module Cards Grid - Same as New Quote Page */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Copy the price breakdown cards from new quote page Part 5 */}
                {/* Body, Actuator, Tubing, Testing, Accessories cards */}
              </div>

              {/* Cost Summary - Same structure as New Quote */}
              <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg border-2 border-blue-300">
                <h5 className="font-bold text-lg mb-4 text-gray-900">📊 Cost Summary</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg pt-4 border-t-2 border-gray-400">
                    <span className="font-bold text-gray-900">Unit Cost:</span>
                    <span className="font-bold text-green-700 text-xl">
                      ₹{currentProduct.unitCost?.toLocaleString('en-IN')}
                    </span>
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

          {/* Project & Enquiry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-900">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-900">
                Enquiry ID / Reference
              </label>
              <input
                type="text"
                value={enquiryId}
                onChange={(e) => setEnquiryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter enquiry reference..."
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