import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HeroSlide, Vehicle, AutoPart } from '../types';
import { ImageUploadField } from '../components/admin/ImageUploadField';
import { AccountingExportCenter } from '../components/admin/AccountingExportCenter';
import { generateVehiclesCsv, generateAutoPartsCsv, downloadCsvFile } from '../utils/csvExportService';

type AdminTab = 'banners' | 'cars' | 'autoparts' | 'offers' | 'reports' | 'security';
type ViewModeDisplay = 'grid' | 'table';

interface CustomOffer {
  id: string;
  title: string;
  badge: string;
  description: string;
  discountText: string;
  active: boolean;
  targetView: 'cars' | 'parts' | 'services';
  categoryOrBrand?: string;
}

const PRESET_GRADIENTS = [
  { name: 'Azul & Naranja Nor Celis Oficial', class: 'from-[#212955]/95 via-[#181e40]/85 to-[#F07F00]/60' },
  { name: 'Naranja Empresarial Nor Celis', class: 'from-[#F07F00]/90 via-[#d97300]/85 to-[#212955]/85' },
  { name: 'Azul Marino Royal', class: 'from-[#212955]/95 via-[#181e40]/90 to-[#0f172a]/80' },
  { name: 'Verde Racing OEM', class: 'from-[#65a30d]/90 via-[#4d7c0f]/80 to-[#1e3a8a]/70' },
  { name: 'Naranja Fuego Comercial', class: 'from-[#ea580c]/90 via-[#c2410c]/80 to-[#18181b]/80' },
  { name: 'Dark Titanium 4x4', class: 'from-[#1e293b]/95 via-[#0f172a]/90 to-[#020617]/95' },
];

const INITIAL_OFFERS: CustomOffer[] = [
  {
    id: 'off-retoma',
    title: 'Plan Retoma Nor Celis',
    badge: 'Bono Hasta $2,500',
    description: 'Tasación técnica oficial en 30 min para dejar tu vehículo como parte de pago.',
    discountText: 'Bono Comercial de hasta $2,500 USD',
    active: true,
    targetView: 'cars',
  },
  {
    id: 'off-santander',
    title: 'Tasa Exclusiva Santander Consumer',
    badge: 'Desde 9.99% TEA',
    description: 'Financiamiento directo con cuotas mensuales accesibles en unidades 0 km.',
    discountText: 'Aprobación en 24 horas hábiles',
    active: true,
    targetView: 'cars',
  },
  {
    id: 'off-taller',
    title: '1er Servicio Preventivo Bonificado',
    badge: '1,000 KM Gratis',
    description: 'Mano de obra 100% bonificada en nuestro taller de alta tecnología en Cajamarca.',
    discountText: 'Mano de obra 0 soles',
    active: true,
    targetView: 'services',
  },
  {
    id: 'off-cyber-repuestos',
    title: 'Descuento en Pastillas & Frenos OEM',
    badge: '-20% Descuento',
    description: 'Kits de frenos Brembo y filtros originales con instalación certificada.',
    discountText: '20% OFF en repuestos seleccionados',
    active: true,
    targetView: 'parts',
    categoryOrBrand: 'frenos',
  },
];

export const AdminDashboardView: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    promoSlides,
    addPromoSlide,
    updatePromoSlide,
    deletePromoSlide,
    reorderPromoSlides,
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    autoParts,
    addAutoPart,
    updateAutoPart,
    deleteAutoPart,
    adminPin,
    setAdminPin,
    setIsAdminUnlocked,
    resetToDefaultData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('banners');
  const [vehicleViewMode, setVehicleViewMode] = useState<ViewModeDisplay>('grid');

  // --- STATE FOR BANNERS ---
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreatingSlide, setIsCreatingSlide] = useState(false);
  const [slideFormData, setSlideFormData] = useState<Partial<HeroSlide>>({
    campaignBadge: 'Cyber Nor Celis',
    categoryTitle: 'CAMIONETAS & EQUIPAMIENTO 4X4',
    categorySubtitle: 'DISPONIBILIDAD INMEDIATA CAJAMARCA',
    buttonText: '¡VER TODO!',
    targetView: 'cars',
    productBrand: 'NOR CELIS AUTOMOTRIZ',
    productTitle: 'Nuevos Modelos 2025 con Bono Exclusivo',
    productPrice: 280,
    offerPrice: 340,
    normalPrice: 420,
    productPng: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80',
    backgroundImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
    bgGradient: 'from-[#0284c7]/90 via-[#0369a1]/80 to-[#0f172a]/75',
    active: true,
  });

  // --- STATE FOR VEHICLES ---
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('todos');
  const [selectedConditionFilter, setSelectedConditionFilter] = useState<'todos' | 'nuevo' | 'seminuevo'>('todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | 'disponible' | 'separado' | 'vendido'>('todos');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState<Partial<Vehicle>>({
    name: 'Toyota Hilux 4x4 D/C SRV',
    subtitle: '2.8 Turbo Diésel Intercooler 4WD Automática',
    year: 2025,
    condition: 'nuevo',
    bodyType: 'Pick-Up',
    brand: 'Toyota',
    priceUsd: 46990,
    priceSoles: 178560,
    monthlyUsd: 590,
    monthlySoles: 2240,
    discountBonus: 'Bono $2,500',
    availability: 'Disponible en Sede Cajamarca',
    warranty: '5 años o 100,000 km Garantía Oficial',
    fuelType: 'Diésel',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    specs: {
      engine: '2.8L 1GD-FTV 204 HP',
      transmission: 'Automática Secuencial 6 Vel.',
      traction: '4x4 con Bloqueo de Diferencial Trasero',
      power: '204 HP @ 3,400 RPM',
      mileage: '0 km (Nuevo)',
    },
  });

  // --- STATE FOR COMMERCIAL OFFERS (PERSISTENT IN LOCALSTORAGE) ---
  const [offersList, setOffersList] = useState<CustomOffer[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_commercial_offers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_OFFERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_commercial_offers', JSON.stringify(offersList));
    } catch (e) {}
  }, [offersList]);

  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CustomOffer | null>(null);
  const [offerFormData, setOfferFormData] = useState<Omit<CustomOffer, 'id'>>({
    title: '',
    badge: 'Bono Especial',
    description: '',
    discountText: '',
    active: true,
    targetView: 'cars',
  });

  // --- IN-APP CONFIRMATION MODAL STATE (Zero native window.confirm) ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    isDestructive: false,
    onConfirm: () => {},
  });

  const requestConfirmation = (opts: {
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: opts.title,
      description: opts.description,
      confirmText: opts.confirmText || 'Confirmar',
      isDestructive: opts.isDestructive ?? true,
      onConfirm: opts.onConfirm,
    });
  };

  const closeConfirmation = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // --- STATE FOR AUTOPARTS ---
  const [partsSearchQuery, setPartsSearchQuery] = useState('');
  const [selectedPartsCategoryFilter, setSelectedPartsCategoryFilter] = useState('todos');
  const [selectedPartsBrandFilter, setSelectedPartsBrandFilter] = useState('todos');
  const [partsViewMode, setPartsViewMode] = useState<ViewModeDisplay>('grid');
  const [editingPart, setEditingPart] = useState<AutoPart | null>(null);
  const [isCreatingPart, setIsCreatingPart] = useState(false);
  const [partFormData, setPartFormData] = useState<Partial<AutoPart>>({
    name: 'Kit Discos de Freno Ventilados Brembo + Pastillas Cerámicas',
    brand: 'Brembo Racing',
    category: 'frenos',
    sku: 'NC-BRM-84920',
    oemCode: '04465-42200-OEM',
    priceSoles: 780,
    priceUsd: 205,
    oldPriceSoles: 920,
    rating: 4.9,
    reviewCount: 42,
    discount: '-15% OFF',
    badge: 'OEM Certificado',
    compatibleVehicle: 'Toyota RAV4 (2020 - 2025), Hilux Revo 4x4',
    stockText: 'Stock Central Cajamarca (12 unidades)',
    features: ['Compuesto cerámico premium', 'Cero chirridos', 'Bajo residuo de polvo'],
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80',
    brandType: 'oficial',
    brandOrigin: 'tradicional',
  });

  // Quick image change modal state
  const [quickImagePart, setQuickImagePart] = useState<AutoPart | null>(null);
  const [quickImageUrl, setQuickImageUrl] = useState('');

  const availablePartBrands = useMemo(() => {
    return Array.from(new Set(autoParts.map((p) => p.brand).filter(Boolean))).sort();
  }, [autoParts]);

  const filteredAutoParts = useMemo(() => {
    return autoParts.filter((p) => {
      const q = partsSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.oemCode.toLowerCase().includes(q) ||
        (p.compatibleVehicle && p.compatibleVehicle.toLowerCase().includes(q));

      const matchesCat =
        selectedPartsCategoryFilter === 'todos' ||
        p.category === selectedPartsCategoryFilter;

      const matchesBrand =
        selectedPartsBrandFilter === 'todos' ||
        p.brand.toLowerCase().includes(selectedPartsBrandFilter.toLowerCase());

      return matchesSearch && matchesCat && matchesBrand;
    });
  }, [autoParts, partsSearchQuery, selectedPartsCategoryFilter, selectedPartsBrandFilter]);

  // --- STATE FOR PIN CHANGE ---
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // --- KPI COMPUTATIONS ---
  const kpiStats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const newCarsCount = vehicles.filter((v) => v.condition === 'nuevo').length;
    const usedCarsCount = vehicles.filter((v) => v.condition === 'seminuevo').length;
    const totalInventoryValueUsd = vehicles.reduce((sum, v) => sum + (v.priceUsd || 0), 0);
    const activeBannersCount = promoSlides.filter((s) => s.active !== false).length;
    const activeOffersCount = offersList.filter((o) => o.active).length;
    const totalPartsCount = autoParts.length;

    return {
      totalVehicles,
      newCarsCount,
      usedCarsCount,
      totalInventoryValueUsd,
      activeBannersCount,
      totalBannersCount: promoSlides.length,
      activeOffersCount,
      totalPartsCount,
    };
  }, [vehicles, promoSlides, offersList, autoParts]);

  // --- FILTERED VEHICLES LIST ---
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = carSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.subtitle.toLowerCase().includes(q);

      const matchesBrand =
        selectedBrandFilter === 'todos' ||
        v.brand.toLowerCase() === selectedBrandFilter.toLowerCase();

      const matchesCondition =
        selectedConditionFilter === 'todos' || v.condition === selectedConditionFilter;

      const avail = (v.availability || '').toLowerCase();
      let matchesStatus = true;
      if (selectedStatusFilter === 'disponible') {
        matchesStatus = !avail.includes('vendido') && !avail.includes('separad');
      } else if (selectedStatusFilter === 'separado') {
        matchesStatus = avail.includes('separad');
      } else if (selectedStatusFilter === 'vendido') {
        matchesStatus = avail.includes('vendid');
      }

      return matchesSearch && matchesBrand && matchesCondition && matchesStatus;
    });
  }, [vehicles, carSearchQuery, selectedBrandFilter, selectedConditionFilter, selectedStatusFilter]);

  // --- BANNER HANDLERS ---
  const handleOpenCreateSlide = () => {
    setSlideFormData({
      campaignBadge: 'Gran Venta',
      categoryTitle: 'NUEVAS PROMOCIONES & OFERTAS',
      categorySubtitle: 'DISPONIBILIDAD INMEDIATA',
      buttonText: '¡VER TODO!',
      targetView: 'cars',
      productBrand: 'NOR CELIS',
      productTitle: 'Toyota Hilux & Seminuevos Garantizados',
      productPrice: 280,
      offerPrice: 340,
      normalPrice: 450,
      productPng: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80',
      backgroundImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
      bgGradient: 'from-[#0284c7]/90 via-[#0369a1]/80 to-[#0f172a]/75',
      active: true,
    });
    setEditingSlide(null);
    setIsCreatingSlide(true);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setSlideFormData({ ...slide });
    setEditingSlide(slide);
    setIsCreatingSlide(true);
  };

  const handleDuplicateSlide = (slide: HeroSlide) => {
    const copy: Omit<HeroSlide, 'id'> = {
      ...slide,
      campaignBadge: `${slide.campaignBadge} (Copia)`,
      productTitle: `${slide.productTitle} (Copia)`,
      active: true,
    };
    addPromoSlide(copy);
    showToast('Banner duplicado exitosamente');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= promoSlides.length) return;
    const reordered = [...promoSlides];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;
    reorderPromoSlides(reordered);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFormData.categoryTitle || !slideFormData.productTitle) {
      showToast('⚠️ Por favor completa el título de la categoría y el nombre del producto');
      return;
    }
    if (editingSlide) {
      updatePromoSlide(editingSlide.id, slideFormData);
      showToast('Banner promocional actualizado correctamente');
    } else {
      addPromoSlide(slideFormData as Omit<HeroSlide, 'id'>);
      showToast('Nuevo banner agregado al carrusel');
    }
    setIsCreatingSlide(false);
    setEditingSlide(null);
  };

  const handleToggleSlideActive = (slide: HeroSlide) => {
    const nextState = slide.active === false ? true : false;
    updatePromoSlide(slide.id, { active: nextState });
    showToast(`Banner "${slide.productTitle}" ${nextState ? 'activado' : 'pausado'}`);
  };

  // --- VEHICLE HANDLERS ---
  const handleOpenCreateVehicle = () => {
    setVehicleFormData({
      name: '',
      subtitle: '',
      year: 2025,
      condition: 'nuevo',
      bodyType: 'SUV',
      brand: 'Toyota',
      priceUsd: 29900,
      priceSoles: 113620,
      monthlyUsd: 380,
      monthlySoles: 1440,
      discountBonus: 'Bono $1,500',
      availability: 'Disponible en Sede Cajamarca',
      warranty: '5 años o 100,000 km',
      fuelType: 'Gasolina',
      image: '',
      specs: {
        engine: '2.0L Dual VVT-i 170 HP',
        transmission: 'Automática Secuencial CVT',
        traction: '4x2 Delantera',
        power: '170 HP @ 6,600 RPM',
        mileage: '0 km (Nuevo)',
      },
    });
    setEditingVehicle(null);
    setIsCreatingVehicle(true);
  };

  const handleEditVehicle = (veh: Vehicle) => {
    setVehicleFormData({
      ...veh,
      specs: { ...veh.specs },
    });
    setEditingVehicle(veh);
    setIsCreatingVehicle(true);
  };

  const handleDuplicateVehicle = (veh: Vehicle) => {
    const copy: Omit<Vehicle, 'id'> = {
      ...veh,
      name: `${veh.name} (Copia)`,
      availability: 'Disponible en Sede Cajamarca',
    };
    addVehicle(copy);
    showToast(`Vehículo duplicado con éxito`);
  };

  const handleQuickStatusChange = (veh: Vehicle, status: string) => {
    updateVehicle(veh.id, { availability: status });
    showToast(`Estado de ${veh.name} cambiado a: ${status}`);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleFormData.name || !vehicleFormData.brand || !vehicleFormData.image) {
      showToast('⚠️ Por favor ingresa nombre, marca y la fotografía principal del vehículo');
      return;
    }
    const payload = {
      ...vehicleFormData,
      year: Number(vehicleFormData.year) || 2025,
      priceUsd: Number(vehicleFormData.priceUsd) || 0,
      priceSoles: Number(vehicleFormData.priceSoles) || 0,
      monthlyUsd: Number(vehicleFormData.monthlyUsd) || 0,
      monthlySoles: Number(vehicleFormData.monthlySoles) || 0,
    };
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, payload);
      showToast(`Vehículo "${payload.name}" actualizado`);
    } else {
      addVehicle(payload as Omit<Vehicle, 'id'>);
      showToast(`Nuevo vehículo "${payload.name}" ingresado`);
    }
    setIsCreatingVehicle(false);
    setEditingVehicle(null);
  };

  // --- AUTOPART HANDLERS ---
  const handleOpenCreatePart = () => {
    setPartFormData({
      name: '',
      brand: 'Brembo',
      category: 'frenos',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      oemCode: '',
      priceSoles: 180,
      priceUsd: 48,
      oldPriceSoles: 220,
      rating: 5.0,
      reviewCount: 1,
      discount: '',
      badge: 'En Stock',
      compatibleVehicle: 'Multimarca',
      stockText: 'Disponible en Sede Cajamarca (10 unidades)',
      features: ['Garantía oficial 12 meses'],
      image: '',
      brandType: 'oficial',
    });
    setEditingPart(null);
    setIsCreatingPart(true);
  };

  const handleEditPart = (part: AutoPart) => {
    setPartFormData({ ...part });
    setEditingPart(part);
    setIsCreatingPart(true);
  };

  const handleDuplicatePart = (part: AutoPart) => {
    const copy: Omit<AutoPart, 'id'> = {
      ...part,
      sku: `${part.sku}-CP`,
      name: `${part.name} (Copia)`,
    };
    addAutoPart(copy);
    showToast(`Repuesto duplicado con éxito`);
  };

  const handleQuickPartStockChange = (part: AutoPart, newStockText: string) => {
    updateAutoPart(part.id, { stockText: newStockText });
    showToast(`Stock de "${part.name}" actualizado`);
  };

  const handleOpenQuickImage = (part: AutoPart) => {
    setQuickImagePart(part);
    setQuickImageUrl(part.image || '');
  };

  const handleSaveQuickImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickImagePart) return;
    if (!quickImageUrl) {
      showToast('⚠️ Por favor selecciona o ingresa una imagen válida');
      return;
    }
    updateAutoPart(quickImagePart.id, { image: quickImageUrl });
    showToast(`Fotografía de "${quickImagePart.name}" actualizada con éxito`);
    setQuickImagePart(null);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partFormData.name || !partFormData.brand || !partFormData.image) {
      showToast('⚠️ Por favor ingresa nombre, marca y la fotografía del repuesto');
      return;
    }
    const payload = {
      ...partFormData,
      priceSoles: Number(partFormData.priceSoles) || 0,
      priceUsd: Number(partFormData.priceUsd) || Math.round((Number(partFormData.priceSoles) || 0) / 3.8),
      rating: partFormData.rating || 5.0,
      reviewCount: partFormData.reviewCount || 1,
      features: Array.isArray(partFormData.features) ? partFormData.features : ['Garantía de calidad Nor Celis'],
    };
    if (editingPart) {
      updateAutoPart(editingPart.id, payload);
      showToast(`Repuesto "${payload.name}" actualizado`);
    } else {
      addAutoPart(payload as Omit<AutoPart, 'id'>);
      showToast(`Repuesto "${payload.name}" agregado al catálogo`);
    }
    setIsCreatingPart(false);
    setEditingPart(null);
  };

  // --- COMMERCIAL OFFER HANDLERS ---
  const handleOpenCreateOffer = () => {
    setEditingOffer(null);
    setOfferFormData({
      title: '',
      badge: 'Bono Especial',
      description: '',
      discountText: '',
      active: true,
      targetView: 'cars',
    });
    setIsCreatingOffer(true);
  };

  const handleEditOffer = (offer: CustomOffer) => {
    setEditingOffer(offer);
    setOfferFormData({
      title: offer.title,
      badge: offer.badge,
      description: offer.description,
      discountText: offer.discountText,
      active: offer.active,
      targetView: offer.targetView,
      categoryOrBrand: offer.categoryOrBrand,
    });
    setIsCreatingOffer(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerFormData.title || !offerFormData.badge) {
      showToast('⚠️ Por favor completa el título y la insignia de la oferta');
      return;
    }
    if (editingOffer) {
      setOffersList((prev) =>
        prev.map((o) => (o.id === editingOffer.id ? { ...o, ...offerFormData } : o))
      );
      showToast(`Campaña "${offerFormData.title}" actualizada`);
    } else {
      const newOffer: CustomOffer = {
        ...offerFormData,
        id: `off-${Date.now()}`,
      };
      setOffersList((prev) => [newOffer, ...prev]);
      showToast(`Nueva campaña "${newOffer.title}" creada`);
    }
    setIsCreatingOffer(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = (offer: CustomOffer) => {
    requestConfirmation({
      title: '¿Eliminar Campaña Comercial?',
      description: `¿Estás seguro de eliminar la campaña "${offer.title}"? Esta acción la removerá de las promociones activas.`,
      confirmText: 'Eliminar Campaña',
      isDestructive: true,
      onConfirm: () => {
        setOffersList((prev) => prev.filter((o) => o.id !== offer.id));
        showToast(`Campaña "${offer.title}" eliminada`);
      },
    });
  };

  const handleExportPartsCsv = () => {
    const { csvString, rowCount, filename } = generateAutoPartsCsv(autoParts);
    downloadCsvFile(csvString, filename);
    showToast(`Catálogo de autopartes exportado a CSV (${rowCount} registros con UTF-8 BOM)`);
  };

  // --- EXPORT & BACKUP HANDLERS ---
  const handleExportJson = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      dealership: 'Nor Celis Automotriz S.A.C.',
      vehicles,
      autoParts,
      promoSlides,
      offersList,
    };
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `norcelis_backup_inventario_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad JSON descargada correctamente');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.vehicles && Array.isArray(parsed.vehicles)) {
          parsed.vehicles.forEach((v: Vehicle) => {
            if (!vehicles.find((existing) => existing.id === v.id)) {
              addVehicle(v);
            }
          });
        }
        if (parsed.autoParts && Array.isArray(parsed.autoParts)) {
          parsed.autoParts.forEach((p: AutoPart) => {
            if (!autoParts.find((existing) => existing.id === p.id)) {
              addAutoPart(p);
            }
          });
        }
        if (parsed.promoSlides && Array.isArray(parsed.promoSlides)) {
          parsed.promoSlides.forEach((s: HeroSlide) => {
            if (!promoSlides.find((existing) => existing.id === s.id)) {
              addPromoSlide(s);
            }
          });
        }
        if (parsed.offersList && Array.isArray(parsed.offersList)) {
          setOffersList(parsed.offersList);
        }
        showToast('Datos de copia de seguridad importados satisfactoriamente');
      } catch (err) {
        showToast('❌ Archivo de copia de seguridad no válido o dañado');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCsv = () => {
    const { csvString, rowCount, filename } = generateVehiclesCsv(vehicles);
    downloadCsvFile(csvString, filename);
    showToast(`Inventario de vehículos exportado a CSV (${rowCount} autos con UTF-8 BOM)`);
  };

  // --- PIN CHANGE HANDLER ---
  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      showToast('⚠️ El PIN debe contener exactamente 4 dígitos numéricos');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('⚠️ Los códigos PIN ingresados no coinciden');
      return;
    }
    setAdminPin(newPin);
    setNewPin('');
    setConfirmPin('');
    showToast('✓ PIN de seguridad actualizado con éxito');
  };

  const handleLogout = () => {
    setIsAdminUnlocked(false);
    setCurrentView('home');
    showToast('Sesión de administración cerrada');
  };

  return (
    <div className="min-h-screen text-[#212955] pb-24">
      {/* Hidden File Input for JSON Backup Import */}
      <input
        ref={jsonImportRef}
        type="file"
        accept=".json"
        onChange={handleImportJson}
        className="hidden"
      />

      {/* Top Header Bar for Admin */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#9D9D9C]/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#212955] text-white flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[#F07F00] text-xl">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#F07F00]">
                  Consola de Operaciones
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sistema Activo en Tiempo Real" />
              </div>
              <h1 className="font-headline font-bold text-sm sm:text-base text-[#212955]">
                Panel de Administración Nor Celis
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-[#212955] bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Volver a la vista del cliente"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              <span className="hidden sm:inline">Ver Sitio Web</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer border border-red-200"
              title="Cerrar sesión de administración"
            >
              <span className="material-symbols-outlined text-base">lock</span>
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation with counts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 border-t border-gray-100 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('banners')}
            className={`min-h-[46px] px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'banners'
                ? 'border-[#F07F00] text-[#212955] bg-[#F07F00]/5'
                : 'border-transparent text-gray-500 hover:text-[#212955]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-[#F07F00]">view_carousel</span>
            <span>Banners &amp; Publicidad ({promoSlides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cars')}
            className={`min-h-[46px] px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cars'
                ? 'border-[#F07F00] text-[#212955] bg-[#F07F00]/5'
                : 'border-transparent text-gray-500 hover:text-[#212955]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-[#212955]">directions_car</span>
            <span>Inventario de Autos ({vehicles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('autoparts')}
            className={`min-h-[46px] px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'autoparts'
                ? 'border-[#F07F00] text-[#212955] bg-[#F07F00]/5'
                : 'border-transparent text-gray-500 hover:text-[#212955]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-[#F07F00]">settings_suggest</span>
            <span>Autopartes &amp; Repuestos ({autoParts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`min-h-[46px] px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'offers'
                ? 'border-[#F07F00] text-[#212955] bg-[#F07F00]/5'
                : 'border-transparent text-gray-500 hover:text-[#212955]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-[#F07F00]">local_offer</span>
            <span>Ofertas Destacadas ({offersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`min-h-[46px] px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'border-[#F07F00] text-[#212955] bg-[#F07F00]/5'
                : 'border-transparent text-gray-500 hover:text-[#212955]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-emerald-600">receipt_long</span>
            <span>Reportes &amp; Contabilidad CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`min-h-[46px] px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'border-[#F07F00] text-[#212955] bg-[#F07F00]/5'
                : 'border-transparent text-gray-500 hover:text-[#212955]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-gray-600">settings</span>
            <span>Seguridad &amp; Respaldos</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Autos Inventario
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-headline font-black text-2xl text-[#212955]">
                  {kpiStats.totalVehicles}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  ({kpiStats.newCarsCount} 0km · {kpiStats.usedCarsCount} semi)
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#212955]/10 text-[#212955] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">directions_car</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Autopartes &amp; OEM
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-headline font-black text-2xl text-[#F07F00]">
                  {kpiStats.totalPartsCount}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  piezas registradas
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F07F00]/10 text-[#F07F00] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">settings_suggest</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Valor Flota Autos
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline font-black text-2xl text-[#212955] font-mono">
                  ${(kpiStats.totalInventoryValueUsd / 1000).toFixed(0)}K
                </span>
                <span className="text-xs text-emerald-600 font-bold">USD</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Banners en Rotación
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-headline font-black text-2xl text-[#F07F00]">
                  {kpiStats.activeBannersCount}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  de {kpiStats.totalBannersCount}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F07F00]/10 text-[#F07F00] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">view_carousel</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Campañas Activas
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-headline font-black text-2xl text-purple-700">
                  {kpiStats.activeOffersCount}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  promociones en web
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">local_offer</span>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* TAB 1: BANNERS & PUBLICIDAD                                    */}
        {/* ============================================================== */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
              <div>
                <h2 className="font-headline font-bold text-base text-[#212955]">
                  Gestor de Banners Publicitarios (Carrusel Portada)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Edita fotografías de fondo, imágenes de productos, textos de impacto y enlaces del carrusel superior.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateSlide}
                className="bg-[#F07F00] hover:bg-[#d67200] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Crear Nuevo Banner</span>
              </button>
            </div>

            {/* List of current slides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {promoSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                    slide.active === false
                      ? 'border-gray-200 opacity-60 bg-gray-50/50'
                      : 'border-[#9D9D9C]/30 hover:border-[#212955]/40 hover:shadow-md'
                  }`}
                >
                  {/* Banner Image Preview Card */}
                  <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                    <img
                      src={slide.backgroundImage}
                      alt={slide.categoryTitle}
                      className="w-full h-full object-cover opacity-70"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#F07F00] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                          {slide.campaignBadge}
                        </span>
                        <div className="flex items-center gap-1 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                          <span>Posición #{idx + 1}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-300 block">
                          {slide.categoryTitle}
                        </span>
                        <h4 className="font-headline font-bold text-sm text-white line-clamp-1">
                          {slide.productTitle}
                        </h4>
                      </div>
                    </div>

                    {/* Product cutout preview */}
                    {slide.productPng && (
                      <div className="absolute right-3 bottom-3 w-16 h-16 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 p-1 flex items-center justify-center">
                        <img
                          src={slide.productPng}
                          alt="Recorte"
                          className="max-h-full max-w-full object-contain drop-shadow"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Body Content & Reorder buttons */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-500">
                        <span>Marca: <strong>{slide.productBrand}</strong></span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-[#212955]">
                          Destino: {slide.targetView}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 font-mono">
                        <span className="text-emerald-700 font-bold text-sm">
                          S/ {slide.productPrice}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          S/ {slide.normalPrice}
                        </span>
                        {slide.normalPrice > slide.productPrice && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                            -{Math.round(((slide.normalPrice - slide.productPrice) / slide.normalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reorder and Action Buttons */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSlide(idx, 'up')}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#212955] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                          title="Mover arriba"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          disabled={idx === promoSlides.length - 1}
                          onClick={() => handleMoveSlide(idx, 'down')}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#212955] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                          title="Mover abajo"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSlideActive(slide)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                            slide.active === false
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {slide.active === false ? 'Pausado' : '✓ Activo'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateSlide(slide)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                          title="Duplicar banner"
                        >
                          <span className="material-symbols-outlined text-base">content_copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditSlide(slide)}
                          className="p-1.5 rounded-lg bg-[#212955] hover:bg-[#181e40] text-white cursor-pointer"
                          title="Editar banner"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            requestConfirmation({
                              title: '¿Eliminar Banner Promocional?',
                              description: `¿Estás seguro de eliminar el banner "${slide.productTitle}" (${slide.categoryTitle}) del carrusel principal?`,
                              confirmText: 'Eliminar Banner',
                              isDestructive: true,
                              onConfirm: () => {
                                deletePromoSlide(slide.id);
                                showToast('Banner eliminado del carrusel');
                              },
                            });
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          title="Eliminar banner"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL TO CREATE / EDIT BANNER WITH LIVE PREVIEW */}
            {isCreatingSlide && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#9D9D9C]/30 space-y-5">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#F07F00] text-2xl">
                        {editingSlide ? 'edit_square' : 'add_photo_alternate'}
                      </span>
                      <h3 className="font-headline font-bold text-base text-[#212955]">
                        {editingSlide ? 'Editar Banner Publicitario' : 'Nuevo Banner Publicitario'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingSlide(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>

                  {/* LIVE PREVIEW OF THE BANNER */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Vista Previa en Vivo (Cómo se verá en la portada):
                    </span>
                    <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden shadow-md bg-slate-900">
                      {slideFormData.backgroundImage && (
                        <img
                          src={slideFormData.backgroundImage}
                          alt="Fondo preview"
                          className="w-full h-full object-cover opacity-75"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-r ${slideFormData.bgGradient || 'from-blue-900/90 to-transparent'} p-5 sm:p-6 flex items-center justify-between`}>
                        <div className="max-w-md space-y-2 text-white">
                          <span className="bg-[#F07F00] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow-xs inline-block">
                            {slideFormData.campaignBadge || 'Campaña'}
                          </span>
                          <h4 className="font-headline font-black text-sm sm:text-lg leading-tight">
                            {slideFormData.productTitle || 'Título del anuncio'}
                          </h4>
                          <p className="text-xs text-gray-200 line-clamp-1">
                            {slideFormData.categorySubtitle}
                          </p>
                          <div className="flex items-center gap-2 pt-1 font-mono">
                            <span className="bg-white text-[#212955] text-xs font-bold px-2 py-0.5 rounded">
                              S/ {slideFormData.productPrice || 0}
                            </span>
                            <span className="text-xs text-white/70 line-through">
                              S/ {slideFormData.normalPrice || 0}
                            </span>
                          </div>
                        </div>

                        {slideFormData.productPng && (
                          <div className="hidden sm:flex w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 p-2 items-center justify-center">
                            <img
                              src={slideFormData.productPng}
                              alt="Recorte"
                              className="max-h-full max-w-full object-contain drop-shadow"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSlide} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Insignia de Campaña *
                        </label>
                        <input
                          type="text"
                          required
                          value={slideFormData.campaignBadge || ''}
                          onChange={(e) =>
                            setSlideFormData({ ...slideFormData, campaignBadge: e.target.value })
                          }
                          placeholder="Ej: Cyber Nor Celis, Día del Repuesto"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Título de Categoría *
                        </label>
                        <input
                          type="text"
                          required
                          value={slideFormData.categoryTitle || ''}
                          onChange={(e) =>
                            setSlideFormData({ ...slideFormData, categoryTitle: e.target.value })
                          }
                          placeholder="Ej: CAMIONETAS 4X4, FRENOS OEM"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#212955] mb-1">
                        Título Principal del Anuncio / Producto *
                      </label>
                      <input
                        type="text"
                        required
                        value={slideFormData.productTitle || ''}
                        onChange={(e) =>
                          setSlideFormData({ ...slideFormData, productTitle: e.target.value })
                        }
                        placeholder="Ej: Toyota Hilux Revo 4x4 o Kit Frenos Brembo"
                        className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                      />
                    </div>

                    {/* Gradient selection chips */}
                    <div>
                      <label className="block text-xs font-bold text-[#212955] mb-1">
                        Estilo de Color / Gradiente de Fondo
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESET_GRADIENTS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => setSlideFormData({ ...slideFormData, bgGradient: p.class })}
                            className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                              slideFormData.bgGradient === p.class
                                ? 'border-[#F07F00] bg-[#F07F00]/10 text-[#212955]'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${p.class}`} />
                            <span className="text-[11px] truncate">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload 1: Background */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <ImageUploadField
                        label="Foto Panorámica de Fondo (16:9)"
                        value={slideFormData.backgroundImage || ''}
                        onChange={(url) =>
                          setSlideFormData({ ...slideFormData, backgroundImage: url })
                        }
                        helpText="Foto de fondo para el carrusel hero (Sube desde tu computadora o pega URL)"
                        aspectRatio="16:9"
                        required
                      />
                    </div>

                    {/* Image Upload 2: Cutout */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <ImageUploadField
                        label="Foto Destacada del Producto o Auto (Opcional)"
                        value={slideFormData.productPng || ''}
                        onChange={(url) =>
                          setSlideFormData({ ...slideFormData, productPng: url })
                        }
                        helpText="Recorte de auto, repuesto o accesorio (formato PNG o JPG)"
                        aspectRatio="4:3"
                      />
                    </div>

                    {/* Prices & Target */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Precio Promoción (S/)
                        </label>
                        <input
                          type="number"
                          value={slideFormData.productPrice || ''}
                          onChange={(e) =>
                            setSlideFormData({
                              ...slideFormData,
                              productPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Precio Normal (S/)
                        </label>
                        <input
                          type="number"
                          value={slideFormData.normalPrice || ''}
                          onChange={(e) =>
                            setSlideFormData({
                              ...slideFormData,
                              normalPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Sección Destino al Clic
                        </label>
                        <select
                          value={slideFormData.targetView || 'cars'}
                          onChange={(e) =>
                            setSlideFormData({
                              ...slideFormData,
                              targetView: e.target.value as any,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] min-h-[38px]"
                        >
                          <option value="cars">Catálogo de Autos</option>
                          <option value="parts">Catálogo de Repuestos OEM</option>
                          <option value="services">Citas en Taller Cajamarca</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsCreatingSlide(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-bold bg-[#F07F00] hover:bg-[#d67200] text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        {editingSlide ? 'Guardar Cambios' : 'Publicar Banner'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: INVENTARIO DE VEHÍCULOS & FOTOS                         */}
        {/* ============================================================== */}
        {activeTab === 'cars' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header controls bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
              <div>
                <h2 className="font-headline font-bold text-base text-[#212955]">
                  Gestión del Inventario de Autos &amp; Imágenes
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Publica autos nuevos, modifica precios (USD / S/), cambia fotografías de portada y actualiza disponibilidad.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="bg-gray-100 hover:bg-gray-200 text-[#212955] text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                  title="Descargar lista de inventario en Excel CSV"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span className="hidden sm:inline">Exportar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreateVehicle}
                  className="bg-[#212955] hover:bg-[#181e40] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-base text-[#F07F00]">add_circle</span>
                  <span>Publicar Nuevo Auto</span>
                </button>
              </div>
            </div>

            {/* Search, Filter bar & View Mode Toggle */}
            <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 space-y-3 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    search
                  </span>
                  <input
                    type="text"
                    value={carSearchQuery}
                    onChange={(e) => setCarSearchQuery(e.target.value)}
                    placeholder="Buscar por modelo, marca o versión..."
                    className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#212955] focus:outline-none focus:border-[#F07F00] min-h-[42px]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedBrandFilter}
                    onChange={(e) => setSelectedBrandFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2.5 text-xs text-[#212955] focus:outline-none min-h-[42px] cursor-pointer"
                  >
                    <option value="todos">Todas las Marcas ({vehicles.length})</option>
                    <option value="toyota">Toyota</option>
                    <option value="suzuki">Suzuki</option>
                    <option value="mitsubishi">Mitsubishi</option>
                    <option value="nissan">Nissan</option>
                    <option value="ford">Ford</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="kia">Kia</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                    className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2.5 text-xs text-[#212955] focus:outline-none min-h-[42px] cursor-pointer"
                  >
                    <option value="todos">Estado: Todos</option>
                    <option value="disponible">Solo Disponibles</option>
                    <option value="separado">En Separación</option>
                    <option value="vendido">Vendidos</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="sm:col-span-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setVehicleViewMode('grid')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      vehicleViewMode === 'grid'
                        ? 'bg-[#212955] text-white border-[#212955]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    title="Vista en Cuadrícula"
                  >
                    <span className="material-symbols-outlined text-base">grid_view</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleViewMode('table')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      vehicleViewMode === 'table'
                        ? 'bg-[#212955] text-white border-[#212955]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    title="Vista en Tabla"
                  >
                    <span className="material-symbols-outlined text-base">table_rows</span>
                  </button>
                </div>
              </div>

              {/* Status chips count */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-[11px] font-bold text-gray-400">Filtrar por condición:</span>
                {(['todos', 'nuevo', 'seminuevo'] as const).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setSelectedConditionFilter(cond)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      selectedConditionFilter === cond
                        ? 'bg-[#F07F00] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cond === 'todos' ? 'Todos los tipos' : cond}
                  </button>
                ))}
                <span className="text-gray-400 ml-auto font-medium text-[11px]">
                  Mostrando <strong>{filteredVehicles.length}</strong> de {vehicles.length} autos
                </span>
              </div>
            </div>

            {/* RENDER MODE: GRID */}
            {vehicleViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVehicles.map((veh) => {
                  const isSold = (veh.availability || '').toLowerCase().includes('vendid');
                  const isReserved = (veh.availability || '').toLowerCase().includes('separad');

                  return (
                    <div
                      key={veh.id}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                        isSold
                          ? 'border-gray-200 opacity-60'
                          : 'border-[#9D9D9C]/30 hover:border-[#212955]/40 hover:shadow-md'
                      }`}
                    >
                      {/* Photo Container with quick action overlay */}
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden group">
                        <img
                          src={veh.image}
                          alt={veh.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="bg-[#212955] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-xs">
                            {veh.brand}
                          </span>
                          <span className="bg-[#F07F00] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                            {veh.year}
                          </span>
                        </div>

                        {/* Status badge in top right */}
                        <div className="absolute top-2.5 right-2.5">
                          {isSold ? (
                            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-xs">
                              VENDIDO
                            </span>
                          ) : isReserved ? (
                            <span className="bg-amber-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-xs">
                              EN SEPARACIÓN
                            </span>
                          ) : (
                            <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-xs">
                              EN STOCK
                            </span>
                          )}
                        </div>

                        {/* Quick photo change button overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditVehicle(veh)}
                            className="bg-white text-[#212955] text-xs font-bold px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5 hover:bg-gray-100 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base text-[#F07F00]">add_a_photo</span>
                            <span>Editar Foto / Datos</span>
                          </button>
                        </div>
                      </div>

                      {/* Vehicle Body Data */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                            <span className="capitalize">{veh.bodyType} • {veh.condition}</span>
                            <span className="font-semibold text-emerald-700">{veh.fuelType}</span>
                          </div>
                          <h3 className="font-headline font-bold text-sm text-[#212955] line-clamp-1">
                            {veh.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {veh.subtitle}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-gray-400">Precio Venta:</span>
                            <div className="text-right">
                              <strong className="text-sm font-bold text-[#212955] font-mono block">
                                ${veh.priceUsd.toLocaleString()} USD
                              </strong>
                              <span className="text-[11px] text-gray-500 font-mono block">
                                (S/ {veh.priceSoles.toLocaleString()})
                              </span>
                            </div>
                          </div>

                          {/* Quick availability dropdown */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-gray-400 text-[11px]">Disponibilidad:</span>
                            <select
                              value={
                                isSold
                                  ? 'Vendido'
                                  : isReserved
                                  ? 'En Separación'
                                  : 'Disponible en Sede Cajamarca'
                              }
                              onChange={(e) => handleQuickStatusChange(veh, e.target.value)}
                              className="text-[11px] bg-gray-50 border border-gray-200 rounded-lg p-1 font-semibold text-[#212955] cursor-pointer"
                            >
                              <option value="Disponible en Sede Cajamarca">Disponible (Stock)</option>
                              <option value="En Separación">En Separación</option>
                              <option value="Vendido">Vendido</option>
                            </select>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateVehicle(veh)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                            title="Duplicar auto para crear variante"
                          >
                            <span className="material-symbols-outlined text-base">content_copy</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditVehicle(veh)}
                            className="flex-1 min-h-[38px] bg-[#212955] hover:bg-[#181e40] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              requestConfirmation({
                                title: '¿Retirar Vehículo del Catálogo?',
                                description: `¿Estás seguro de retirar el vehículo "${veh.name}" (${veh.brand}) del catálogo?`,
                                confirmText: 'Eliminar Vehículo',
                                isDestructive: true,
                                onConfirm: () => {
                                  deleteVehicle(veh.id);
                                  showToast(`Vehículo "${veh.name}" retirado del catálogo`);
                                },
                              });
                            }}
                            className="p-2 min-h-[38px] bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                            title="Eliminar auto"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* RENDER MODE: COMPACT HIGH-DENSITY TABLE */
              <div className="bg-white rounded-2xl border border-[#9D9D9C]/30 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#212955]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Vehículo</th>
                        <th className="p-3.5">Año / Tipo</th>
                        <th className="p-3.5 text-right">Precio USD</th>
                        <th className="p-3.5 text-right">Precio Soles</th>
                        <th className="p-3.5">Disponibilidad</th>
                        <th className="p-3.5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVehicles.map((veh) => (
                        <tr key={veh.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <img
                              src={veh.image}
                              alt={veh.name}
                              className="w-12 h-9 object-cover rounded-lg shrink-0 border"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <strong className="block font-bold text-xs">{veh.brand} {veh.name}</strong>
                              <span className="text-[11px] text-gray-400 block line-clamp-1">{veh.subtitle}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold">{veh.year}</span>
                            <span className="text-[11px] text-gray-500 block capitalize">{veh.condition} · {veh.bodyType}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-sm text-[#212955]">
                            ${veh.priceUsd.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono text-gray-500">
                            S/ {veh.priceSoles.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              veh.availability?.toLowerCase().includes('vendid')
                                ? 'bg-red-50 text-red-700'
                                : veh.availability?.toLowerCase().includes('separad')
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {veh.availability || 'En Stock'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditVehicle(veh)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#212955] hover:text-white transition-colors cursor-pointer"
                                title="Editar"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateVehicle(veh)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                                title="Duplicar"
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  requestConfirmation({
                                    title: '¿Retirar Vehículo del Catálogo?',
                                    description: `¿Estás seguro de retirar "${veh.name}" del catálogo?`,
                                    confirmText: 'Eliminar Vehículo',
                                    isDestructive: true,
                                    onConfirm: () => {
                                      deleteVehicle(veh.id);
                                      showToast(`Vehículo "${veh.name}" retirado`);
                                    },
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                title="Eliminar"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODAL TO ADD / EDIT VEHICLE */}
            {isCreatingVehicle && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#9D9D9C]/30 space-y-5">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#212955] text-2xl">
                        {editingVehicle ? 'drive_file_rename_outline' : 'directions_car'}
                      </span>
                      <h3 className="font-headline font-bold text-base text-[#212955]">
                        {editingVehicle ? 'Editar Auto & Fotografías' : 'Publicar Nuevo Auto en Catálogo'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingVehicle(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveVehicle} className="space-y-4">
                    {/* Basic details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Marca Oficial *
                        </label>
                        <input
                          type="text"
                          required
                          value={vehicleFormData.brand || ''}
                          onChange={(e) =>
                            setVehicleFormData({ ...vehicleFormData, brand: e.target.value })
                          }
                          placeholder="Toyota, Suzuki, Mitsubishi..."
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Modelo y Versión *
                        </label>
                        <input
                          type="text"
                          required
                          value={vehicleFormData.name || ''}
                          onChange={(e) =>
                            setVehicleFormData({ ...vehicleFormData, name: e.target.value })
                          }
                          placeholder="Ej: Hilux Revo 4x4 SRV"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Año *
                        </label>
                        <input
                          type="number"
                          required
                          value={vehicleFormData.year || 2025}
                          onChange={(e) =>
                            setVehicleFormData({
                              ...vehicleFormData,
                              year: parseInt(e.target.value) || 2025,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#212955] mb-1">
                        Subtítulo / Motorización
                      </label>
                      <input
                        type="text"
                        value={vehicleFormData.subtitle || ''}
                        onChange={(e) =>
                          setVehicleFormData({ ...vehicleFormData, subtitle: e.target.value })
                        }
                        placeholder="Ej: 2.8 Turbo Diésel Intercooler 4WD Automática"
                        className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                      />
                    </div>

                    {/* IMAGE UPLOAD FIELD (LOCAL DRAG & DROP OR URL) */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <ImageUploadField
                        label="Fotografía Principal del Auto (Archivo local o URL) *"
                        value={vehicleFormData.image || ''}
                        onChange={(url) =>
                          setVehicleFormData({ ...vehicleFormData, image: url })
                        }
                        helpText="Foto exterior del vehículo. Se mostrará en catálogo, ficha de detalle y portadas."
                        aspectRatio="16:9"
                        required
                      />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Precio USD ($) *
                        </label>
                        <input
                          type="number"
                          required
                          value={vehicleFormData.priceUsd || ''}
                          onChange={(e) => {
                            const usd = parseFloat(e.target.value) || 0;
                            setVehicleFormData({
                              ...vehicleFormData,
                              priceUsd: usd,
                              priceSoles: Math.round(usd * 3.8),
                            });
                          }}
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Precio Soles (S/)
                        </label>
                        <input
                          type="number"
                          value={vehicleFormData.priceSoles || ''}
                          onChange={(e) =>
                            setVehicleFormData({
                              ...vehicleFormData,
                              priceSoles: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Carrocería
                        </label>
                        <select
                          value={vehicleFormData.bodyType || 'SUV'}
                          onChange={(e) =>
                            setVehicleFormData({
                              ...vehicleFormData,
                              bodyType: e.target.value as any,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] min-h-[38px]"
                        >
                          <option value="Pick-Up">Pick-Up</option>
                          <option value="SUV">SUV</option>
                          <option value="Sedán">Sedán</option>
                          <option value="Hatchback">Hatchback</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Combustible
                        </label>
                        <select
                          value={vehicleFormData.fuelType || 'Gasolina'}
                          onChange={(e) =>
                            setVehicleFormData({
                              ...vehicleFormData,
                              fuelType: e.target.value as any,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] min-h-[38px]"
                        >
                          <option value="Gasolina">Gasolina</option>
                          <option value="Diésel">Diésel</option>
                          <option value="Híbrido">Híbrido</option>
                          <option value="100% Eléctrico">100% Eléctrico</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Bono / Promoción
                        </label>
                        <input
                          type="text"
                          value={vehicleFormData.discountBonus || ''}
                          onChange={(e) =>
                            setVehicleFormData({
                              ...vehicleFormData,
                              discountBonus: e.target.value,
                            })
                          }
                          placeholder="Ej: Bono $2,000 Santander"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Disponibilidad en Sede
                        </label>
                        <input
                          type="text"
                          value={vehicleFormData.availability || ''}
                          onChange={(e) =>
                            setVehicleFormData({
                              ...vehicleFormData,
                              availability: e.target.value,
                            })
                          }
                          placeholder="Ej: Entrega Inmediata Cajamarca"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                    </div>

                    {/* Mechanical Specs */}
                    <div className="pt-2 border-t">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                        Ficha Técnica &amp; Motorización
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Motor
                          </label>
                          <input
                            type="text"
                            value={vehicleFormData.specs?.engine || ''}
                            onChange={(e) =>
                              setVehicleFormData({
                                ...vehicleFormData,
                                specs: { ...vehicleFormData.specs!, engine: e.target.value },
                              })
                            }
                            placeholder="Ej: 2.8L 1GD-FTV 204 HP"
                            className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-1.5 text-xs text-[#212955]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Transmisión
                          </label>
                          <input
                            type="text"
                            value={vehicleFormData.specs?.transmission || ''}
                            onChange={(e) =>
                              setVehicleFormData({
                                ...vehicleFormData,
                                specs: { ...vehicleFormData.specs!, transmission: e.target.value },
                              })
                            }
                            placeholder="Ej: Automática Secuencial 6 Vel."
                            className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-1.5 text-xs text-[#212955]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Tracción
                          </label>
                          <input
                            type="text"
                            value={vehicleFormData.specs?.traction || ''}
                            onChange={(e) =>
                              setVehicleFormData({
                                ...vehicleFormData,
                                specs: { ...vehicleFormData.specs!, traction: e.target.value },
                              })
                            }
                            placeholder="Ej: 4x4 con Bloqueo Trasero"
                            className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-1.5 text-xs text-[#212955]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsCreatingVehicle(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-bold bg-[#212955] hover:bg-[#181e40] text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        {editingVehicle ? 'Actualizar Auto' : 'Guardar y Publicar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: AUTOPARTES & REPUESTOS                                 */}
        {/* ============================================================== */}
        {activeTab === 'autoparts' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
              <div>
                <h2 className="font-headline font-bold text-base text-[#212955] flex items-center gap-2">
                  <span>Inventario y Gestión de Autopartes &amp; Repuestos</span>
                  <span className="bg-[#212955] text-[#F07F00] text-[11px] font-mono px-2 py-0.5 rounded-md font-bold">
                    {autoParts.length} repuestos
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cambia fotografías de autopartes, actualiza precios en Soles y USD, ajusta stock en Cajamarca y gestiona compatibilidades.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportPartsCsv}
                  className="bg-gray-100 hover:bg-gray-200 text-[#212955] text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                  title="Exportar inventario de autopartes a Excel / CSV"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span className="hidden sm:inline">Exportar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreatePart}
                  className="bg-[#212955] hover:bg-[#181e40] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-base text-[#F07F00]">add_circle</span>
                  <span>Publicar Nuevo Repuesto</span>
                </button>
              </div>
            </div>

            {/* Search, Filter bar & View Mode Toggle */}
            <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 space-y-3 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    search
                  </span>
                  <input
                    type="text"
                    value={partsSearchQuery}
                    onChange={(e) => setPartsSearchQuery(e.target.value)}
                    placeholder="Buscar por repuesto, marca, SKU, OEM o modelo compatible..."
                    className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#212955] focus:outline-none focus:border-[#F07F00] min-h-[42px]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedPartsCategoryFilter}
                    onChange={(e) => setSelectedPartsCategoryFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2.5 text-xs text-[#212955] focus:outline-none min-h-[42px] cursor-pointer"
                  >
                    <option value="todos">Todas las Categorías</option>
                    <option value="frenos">Frenos y Discos</option>
                    <option value="filtros">Filtros y Mantenimiento</option>
                    <option value="suspension">Suspensión y Amortiguación</option>
                    <option value="motor">Motor y Componentes</option>
                    <option value="electrico">Eléctrico y Baterías</option>
                    <option value="accesorios">Accesorios y Exterior</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={selectedPartsBrandFilter}
                    onChange={(e) => setSelectedPartsBrandFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2.5 text-xs text-[#212955] focus:outline-none min-h-[42px] cursor-pointer"
                  >
                    <option value="todos">Todas las Marcas</option>
                    {availablePartBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="sm:col-span-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setPartsViewMode('grid')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      partsViewMode === 'grid'
                        ? 'bg-[#212955] text-white border-[#212955]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    title="Vista en Cuadrícula"
                  >
                    <span className="material-symbols-outlined text-base">grid_view</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartsViewMode('table')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      partsViewMode === 'table'
                        ? 'bg-[#212955] text-white border-[#212955]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    title="Vista en Tabla"
                  >
                    <span className="material-symbols-outlined text-base">table_rows</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-[11px] text-gray-400">
                  Tip: Pasa el cursor sobre la foto o pulsa <strong>&quot;Cambiar Foto&quot;</strong> para actualizar la imagen al instante desde tu equipo o por enlace web.
                </span>
                <span className="text-gray-500 font-medium text-[11px]">
                  Mostrando <strong>{filteredAutoParts.length}</strong> de {autoParts.length} repuestos
                </span>
              </div>
            </div>

            {/* RENDER MODE: GRID */}
            {partsViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredAutoParts.map((part) => {
                  const isOutOfStock = (part.stockText || '').toLowerCase().includes('agotad');

                  return (
                    <div
                      key={part.id}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs group ${
                        isOutOfStock
                          ? 'border-gray-200 opacity-70'
                          : 'border-[#9D9D9C]/30 hover:border-[#212955]/40 hover:shadow-md'
                      }`}
                    >
                      {/* Photo Container with quick action overlay */}
                      <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center p-3">
                        <img
                          src={part.image}
                          alt={part.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                          <span className="bg-[#212955] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                            {part.brand}
                          </span>
                          {part.badge && (
                            <span className="bg-[#F07F00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                              {part.badge}
                            </span>
                          )}
                        </div>

                        {/* Discount badge top right */}
                        {part.discount && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                              {part.discount}
                            </span>
                          </div>
                        )}

                        {/* Quick Change Photo Hover Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenQuickImage(part)}
                          className="absolute inset-0 bg-[#212955]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white cursor-pointer backdrop-blur-[2px]"
                          title="Cambiar fotografía del repuesto"
                        >
                          <span className="material-symbols-outlined text-2xl text-[#F07F00]">photo_camera</span>
                          <span className="text-xs font-bold px-3 py-1 bg-[#F07F00] text-white rounded-lg shadow-xs">
                            Cambiar Foto
                          </span>
                          <span className="text-[10px] text-gray-200">Subir archivo o URL</span>
                        </button>
                      </div>

                      {/* Part Information */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          {/* SKU and OEM info */}
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-[#212955]">
                              SKU: {part.sku}
                            </span>
                            {part.oemCode && (
                              <span title={`Código OEM: ${part.oemCode}`} className="truncate max-w-[120px]">
                                OEM: {part.oemCode}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3
                            className="font-headline font-bold text-xs sm:text-sm text-[#212955] line-clamp-2 leading-tight"
                            title={part.name}
                          >
                            {part.name}
                          </h3>

                          {/* Compatible Vehicle */}
                          {part.compatibleVehicle && (
                            <div className="flex items-start gap-1 text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                              <span className="material-symbols-outlined text-[13px] text-[#F07F00] shrink-0 mt-0.5">
                                directions_car
                              </span>
                              <span className="line-clamp-1">{part.compatibleVehicle}</span>
                            </div>
                          )}
                        </div>

                        {/* Price and Stock */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] text-gray-400 block font-semibold">Precio Venta:</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-headline font-black text-base text-[#F07F00]">
                                  S/ {part.priceSoles.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-gray-500 font-bold">
                                  (${part.priceUsd})
                                </span>
                              </div>
                            </div>
                            {part.oldPriceSoles && (
                              <span className="text-xs text-gray-400 line-through">
                                S/ {part.oldPriceSoles.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Stock Status Chip */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span
                              className={`font-semibold truncate max-w-[160px] ${
                                isOutOfStock ? 'text-red-600' : 'text-emerald-700'
                              }`}
                              title={part.stockText}
                            >
                              ● {part.stockText || 'En stock Cajamarca'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-4 gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickImage(part)}
                              className="col-span-2 min-h-[34px] px-2 py-1.5 bg-[#F07F00]/10 hover:bg-[#F07F00] text-[#F07F00] hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                              title="Cambiar fotografía"
                            >
                              <span className="material-symbols-outlined text-sm">photo_camera</span>
                              <span>Foto</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditPart(part)}
                              className="min-h-[34px] p-1.5 bg-gray-100 hover:bg-[#212955] text-gray-700 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                              title="Editar datos completos del repuesto"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                requestConfirmation({
                                  title: '¿Eliminar Autoparte del Catálogo?',
                                  description: `¿Estás seguro de eliminar el repuesto "${part.name}" (SKU: ${part.sku})?`,
                                  confirmText: 'Eliminar Repuesto',
                                  isDestructive: true,
                                  onConfirm: () => {
                                    deleteAutoPart(part.id);
                                    showToast(`Repuesto "${part.name}" eliminado`);
                                  },
                                });
                              }}
                              className="min-h-[34px] p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                              title="Eliminar repuesto"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* RENDER MODE: TABLE */
              <div className="bg-white rounded-2xl border border-[#9D9D9C]/30 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#212955]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <tr>
                        <th className="px-4 py-3">Foto / Imagen</th>
                        <th className="px-4 py-3">Repuesto &amp; Marca</th>
                        <th className="px-4 py-3">SKU &amp; OEM</th>
                        <th className="px-4 py-3">Compatibilidad</th>
                        <th className="px-4 py-3">Precios</th>
                        <th className="px-4 py-3">Disponibilidad</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAutoParts.map((part) => (
                        <tr key={part.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden p-1 border border-gray-200 group/img shrink-0">
                              <img
                                src={part.image}
                                alt={part.name}
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenQuickImage(part)}
                                className="absolute inset-0 bg-[#212955]/80 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                title="Cambiar foto"
                              >
                                <span className="material-symbols-outlined text-sm text-[#F07F00]">photo_camera</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-[240px]">
                            <div className="font-bold text-xs text-[#212955] line-clamp-2">
                              {part.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="bg-[#212955] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                {part.brand}
                              </span>
                              <span className="text-[10px] text-gray-400 capitalize">
                                {part.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px]">
                            <div className="font-bold text-[#212955]">{part.sku}</div>
                            {part.oemCode && (
                              <div className="text-gray-400 text-[10px] truncate max-w-[120px]">
                                {part.oemCode}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-600 max-w-[180px]">
                            <span className="line-clamp-2">{part.compatibleVehicle || 'Multimarca'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-bold text-sm text-[#F07F00]">
                              S/ {part.priceSoles.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-gray-500 font-semibold">
                              ${part.priceUsd} USD
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[11px]">
                            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                              {part.stockText || 'En stock'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenQuickImage(part)}
                                className="p-1.5 bg-[#F07F00]/10 hover:bg-[#F07F00] text-[#F07F00] hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Cambiar fotografía"
                              >
                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditPart(part)}
                                className="p-1.5 bg-gray-100 hover:bg-[#212955] text-gray-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Editar repuesto"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicatePart(part)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
                                title="Duplicar repuesto"
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  requestConfirmation({
                                    title: '¿Eliminar Autoparte del Catálogo?',
                                    description: `¿Estás seguro de eliminar el repuesto "${part.name}"?`,
                                    confirmText: 'Eliminar Repuesto',
                                    isDestructive: true,
                                    onConfirm: () => {
                                      deleteAutoPart(part.id);
                                      showToast(`Repuesto "${part.name}" eliminado`);
                                    },
                                  });
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Eliminar repuesto"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODAL: CAMBIO RÁPIDO DE FOTOGRAFÍA */}
            {quickImagePart && (
              <div className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full border border-[#9D9D9C]/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="bg-[#212955] p-5 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#F07F00] uppercase tracking-wider block">
                        Actualización Rápida
                      </span>
                      <h3 className="font-headline font-bold text-base">
                        Cambiar Fotografía de Repuesto
                      </h3>
                      <p className="text-xs text-gray-300 truncate max-w-sm mt-0.5">
                        {quickImagePart.name} ({quickImagePart.sku})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickImagePart(null)}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveQuickImage} className="p-6 space-y-4">
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                      <ImageUploadField
                        label="Nueva Fotografía del Repuesto (Archivo local o URL)"
                        value={quickImageUrl}
                        onChange={setQuickImageUrl}
                        helpText="Arrastra una imagen de tu equipo (PNG, JPG, WEBP) o escribe un enlace web directo."
                        aspectRatio="1:1"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setQuickImagePart(null)}
                        className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-bold bg-[#F07F00] hover:bg-[#d97300] text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Guardar Fotografía</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: CREAR / EDITAR REPUESTO COMPLETO */}
            {isCreatingPart && (
              <div className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#9D9D9C]/30 shadow-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="bg-[#212955] p-5 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#F07F00] uppercase tracking-wider block">
                        {editingPart ? 'Actualizar Repuesto' : 'Nuevo Repuesto en Catálogo'}
                      </span>
                      <h3 className="font-headline font-bold text-base">
                        {editingPart ? `Editar: ${editingPart.name}` : 'Publicar Nuevo Repuesto OEM / Alternativo'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingPart(false)}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <form onSubmit={handleSavePart} className="p-6 space-y-4 max-h-[calc(85vh-80px)] overflow-y-auto">
                    {/* General Information */}
                    <div>
                      <label className="block text-xs font-bold text-[#212955] mb-1">
                        Nombre Completo del Repuesto *
                      </label>
                      <input
                        type="text"
                        required
                        value={partFormData.name || ''}
                        onChange={(e) => setPartFormData({ ...partFormData, name: e.target.value })}
                        placeholder="Ej: Kit Discos de Freno Ventilados Brembo + Pastillas Cerámicas"
                        className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] focus:outline-none focus:border-[#F07F00]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Marca del Fabricante *
                        </label>
                        <input
                          type="text"
                          required
                          value={partFormData.brand || ''}
                          onChange={(e) => setPartFormData({ ...partFormData, brand: e.target.value })}
                          placeholder="Ej: Brembo, Bosch, Denso, K&N"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Categoría *
                        </label>
                        <select
                          value={partFormData.category || 'frenos'}
                          onChange={(e) => setPartFormData({ ...partFormData, category: e.target.value })}
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] min-h-[38px]"
                        >
                          <option value="frenos">Frenos y Discos</option>
                          <option value="filtros">Filtros y Mantenimiento</option>
                          <option value="suspension">Suspensión y Amortiguación</option>
                          <option value="motor">Motor y Componentes</option>
                          <option value="electrico">Eléctrico y Baterías</option>
                          <option value="accesorios">Accesorios y Exterior</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Tipo de Certificación
                        </label>
                        <select
                          value={partFormData.brandType || 'oficial'}
                          onChange={(e) => setPartFormData({ ...partFormData, brandType: e.target.value as any })}
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] min-h-[38px]"
                        >
                          <option value="oficial">OEM Original / Oficial</option>
                          <option value="homologado">Homologado Certificado</option>
                          <option value="aftermarket">Aftermarket Premium</option>
                        </select>
                      </div>
                    </div>

                    {/* Codes: SKU & OEM */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          SKU Interno *
                        </label>
                        <input
                          type="text"
                          required
                          value={partFormData.sku || ''}
                          onChange={(e) => setPartFormData({ ...partFormData, sku: e.target.value })}
                          placeholder="Ej: NC-BRM-84920"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Código OEM del Fabricante
                        </label>
                        <input
                          type="text"
                          value={partFormData.oemCode || ''}
                          onChange={(e) => setPartFormData({ ...partFormData, oemCode: e.target.value })}
                          placeholder="Ej: 04465-42200-OEM"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] font-mono"
                        />
                      </div>
                    </div>

                    {/* IMAGE UPLOAD FIELD (LOCAL FILE OR URL) */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <ImageUploadField
                        label="Fotografía del Repuesto (Archivo local o URL) *"
                        value={partFormData.image || ''}
                        onChange={(url) => setPartFormData({ ...partFormData, image: url })}
                        helpText="Foto nítida del repuesto. Se mostrará en catálogo de repuestos y vista de compra."
                        aspectRatio="1:1"
                        required
                      />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Precio Soles (S/) *
                        </label>
                        <input
                          type="number"
                          required
                          value={partFormData.priceSoles || ''}
                          onChange={(e) => {
                            const soles = parseFloat(e.target.value) || 0;
                            setPartFormData({
                              ...partFormData,
                              priceSoles: soles,
                              priceUsd: Math.round(soles / 3.8),
                            });
                          }}
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Precio USD ($)
                        </label>
                        <input
                          type="number"
                          value={partFormData.priceUsd || ''}
                          onChange={(e) =>
                            setPartFormData({
                              ...partFormData,
                              priceUsd: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Precio Anterior (S/)
                        </label>
                        <input
                          type="number"
                          value={partFormData.oldPriceSoles || ''}
                          onChange={(e) =>
                            setPartFormData({
                              ...partFormData,
                              oldPriceSoles: parseFloat(e.target.value) || undefined,
                            })
                          }
                          placeholder="Ej: 920"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Descuento / Promo
                        </label>
                        <input
                          type="text"
                          value={partFormData.discount || ''}
                          onChange={(e) => setPartFormData({ ...partFormData, discount: e.target.value })}
                          placeholder="Ej: -15% OFF"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                    </div>

                    {/* Compatibility and Stock */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Vehículos Compatibles
                        </label>
                        <input
                          type="text"
                          value={partFormData.compatibleVehicle || ''}
                          onChange={(e) =>
                            setPartFormData({ ...partFormData, compatibleVehicle: e.target.value })
                          }
                          placeholder="Ej: Toyota RAV4 (2020 - 2025), Hilux Revo 4x4"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Disponibilidad / Almacén
                        </label>
                        <input
                          type="text"
                          value={partFormData.stockText || ''}
                          onChange={(e) =>
                            setPartFormData({ ...partFormData, stockText: e.target.value })
                          }
                          placeholder="Ej: Stock Central Cajamarca (12 unidades)"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Distintivo / Badge
                        </label>
                        <input
                          type="text"
                          value={partFormData.badge || ''}
                          onChange={(e) => setPartFormData({ ...partFormData, badge: e.target.value })}
                          placeholder="Ej: OEM Certificado, Más Vendido, Top Ventas"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Garantía / Origen
                        </label>
                        <select
                          value={partFormData.brandOrigin || 'tradicional'}
                          onChange={(e) =>
                            setPartFormData({ ...partFormData, brandOrigin: e.target.value as any })
                          }
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] min-h-[38px]"
                        >
                          <option value="tradicional">Línea Tradicional Japonesa / Europea</option>
                          <option value="chino">Línea Alternativa / Marcas Chinas</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsCreatingPart(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-bold bg-[#212955] hover:bg-[#181e40] text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        {editingPart ? 'Actualizar Repuesto' : 'Guardar y Publicar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: OFERTAS DESTACADAS & CAMPAÑAS                           */}
        {/* ============================================================== */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
              <div>
                <h2 className="font-headline font-bold text-base text-[#212955]">
                  Gestor de Ofertas Destacadas &amp; Campañas Comerciales
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Activa, crea y personaliza bonos comerciales, planes de financiamiento y promociones de taller para la web.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateOffer}
                className="bg-[#F07F00] hover:bg-[#d97300] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Nueva Campaña Comercial</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {offersList.map((offer) => (
                <div
                  key={offer.id}
                  className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                    offer.active
                      ? 'border-[#9D9D9C]/40 hover:border-[#212955]'
                      : 'border-gray-200 opacity-60 bg-gray-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-[#F07F00] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow-xs">
                        {offer.badge}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setOffersList((prev) =>
                              prev.map((o) => (o.id === offer.id ? { ...o, active: !o.active } : o))
                            );
                            showToast(`Campaña "${offer.title}" ${!offer.active ? 'activada' : 'pausada'}`);
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
                            offer.active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {offer.active ? '✓ Activa' : 'Pausada'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditOffer(offer)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#212955] text-gray-600 hover:text-white transition-colors cursor-pointer"
                          title="Editar Campaña"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOffer(offer)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                          title="Eliminar Campaña"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-sm text-[#212955]">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {offer.description}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Detalle del beneficio:</span>
                      <strong className="text-[#212955]">{offer.discountText}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 mt-4">
                    <span className="capitalize flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-[#212955]">folder</span>
                      <span>Sección: {offer.targetView === 'cars' ? 'Vehículos' : offer.targetView === 'parts' ? 'Autopartes' : 'Taller'}</span>
                    </span>
                    <span className={`text-[11px] font-bold ${offer.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {offer.active ? '● Visible en Tienda' : '○ Oculta'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal para Crear / Editar Oferta Comercial */}
            {isCreatingOffer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-[#9D9D9C]/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-headline font-bold text-base text-[#212955]">
                      {editingOffer ? 'Editar Campaña Comercial' : 'Nueva Campaña Comercial'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsCreatingOffer(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveOffer} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#212955] mb-1">
                        Título de la Campaña *
                      </label>
                      <input
                        type="text"
                        required
                        value={offerFormData.title}
                        onChange={(e) => setOfferFormData({ ...offerFormData, title: e.target.value })}
                        placeholder="Ej: Bono Comercial Plan Retoma"
                        className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Insignia / Badge *
                        </label>
                        <input
                          type="text"
                          required
                          value={offerFormData.badge}
                          onChange={(e) => setOfferFormData({ ...offerFormData, badge: e.target.value })}
                          placeholder="Ej: Bono $2,500 o 20% OFF"
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#212955] mb-1">
                          Sección Destino
                        </label>
                        <select
                          value={offerFormData.targetView}
                          onChange={(e) => setOfferFormData({ ...offerFormData, targetView: e.target.value as any })}
                          className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955] min-h-[38px]"
                        >
                          <option value="cars">Catálogo de Vehículos</option>
                          <option value="parts">Autopartes &amp; Repuestos</option>
                          <option value="services">Servicios de Taller</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#212955] mb-1">
                        Detalle del Beneficio / Descuento *
                      </label>
                      <input
                        type="text"
                        required
                        value={offerFormData.discountText}
                        onChange={(e) => setOfferFormData({ ...offerFormData, discountText: e.target.value })}
                        placeholder="Ej: Bono Comercial de hasta $2,500 USD directo al precio"
                        className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#212955] mb-1">
                        Descripción Informativa
                      </label>
                      <textarea
                        rows={3}
                        value={offerFormData.description}
                        onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                        placeholder="Detalla los términos o alcance de la promoción comercial..."
                        className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-xs text-[#212955]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="offerActiveCheck"
                        checked={offerFormData.active}
                        onChange={(e) => setOfferFormData({ ...offerFormData, active: e.target.checked })}
                        className="w-4 h-4 text-[#F07F00] rounded accent-[#F07F00]"
                      />
                      <label htmlFor="offerActiveCheck" className="text-xs font-semibold text-gray-700">
                        Campaña activa inmediatamente en la portada
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setIsCreatingOffer(false)}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold bg-[#212955] hover:bg-[#181e40] text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        {editingOffer ? 'Guardar Cambios' : 'Crear Campaña'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: REPORTES & CONTABILIDAD CSV                             */}
        {/* ============================================================== */}
        {activeTab === 'reports' && <AccountingExportCenter />}

        {/* ============================================================== */}
        {/* TAB 6: SEGURIDAD & RESPALDOS                                   */}
        {/* ============================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
              <h2 className="font-headline font-bold text-base text-[#212955]">
                Seguridad de Acceso, Respaldos &amp; Mantenimiento
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Modifica el PIN de seguridad, exporta copias completas de la base de datos o restaura valores de fábrica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Change PIN Box */}
              <div className="bg-white p-6 rounded-2xl border border-[#9D9D9C]/30 space-y-4">
                <div className="flex items-center gap-2 text-[#212955]">
                  <span className="material-symbols-outlined text-[#F07F00]">pin</span>
                  <h3 className="font-headline font-bold text-sm">Cambiar PIN de Acceso</h3>
                </div>

                <form onSubmit={handleUpdatePin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Nuevo PIN (4 dígitos numéricos)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-[#212955]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Confirmar Nuevo PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-[#212955]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full min-h-[42px] bg-[#212955] hover:bg-[#181e40] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Actualizar PIN de Seguridad
                  </button>
                  <p className="text-[11px] text-gray-400 text-center">
                    PIN actual activo: <strong className="font-mono text-[#212955]">{adminPin}</strong>
                  </p>
                </form>
              </div>

              {/* Backup & Restore JSON */}
              <div className="bg-white p-6 rounded-2xl border border-[#9D9D9C]/30 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#212955]">
                    <span className="material-symbols-outlined text-[#212955]">cloud_sync</span>
                    <h3 className="font-headline font-bold text-sm">Copia de Seguridad (Backup)</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Exporta un archivo JSON con todos los autos, banners publicitarios y configuraciones para tener un respaldo seguro o transferirlos a otro equipo.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full min-h-[42px] bg-gray-100 hover:bg-gray-200 text-[#212955] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>Descargar Backup JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => jsonImportRef.current?.click()}
                    className="w-full min-h-[42px] bg-white border border-[#9D9D9C]/40 hover:bg-gray-50 text-[#212955] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    <span>Restaurar desde Archivo JSON</span>
                  </button>
                </div>
              </div>

              {/* Reset to Factory Defaults Box */}
              <div className="bg-white p-6 rounded-2xl border border-[#9D9D9C]/30 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#212955]">
                    <span className="material-symbols-outlined text-red-500">restart_alt</span>
                    <h3 className="font-headline font-bold text-sm">Restablecer Valores de Fábrica</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Si deseas volver al estado inicial del catálogo de autos y los banners originales de demostración, puedes reiniciar la base de datos local en cualquier momento.
                  </p>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      requestConfirmation({
                        title: '¿Restablecer Datos de Fábrica?',
                        description: 'Esta acción reiniciará todos los autos, autopartes OEM, banners publicitarios y ofertas comerciales al estado inicial de demostración. El PIN volverá a ser 1234.',
                        confirmText: 'Restablecer Todo',
                        isDestructive: true,
                        onConfirm: () => {
                          resetToDefaultData();
                          setOffersList(INITIAL_OFFERS);
                          try {
                            localStorage.removeItem('norcelis_commercial_offers');
                          } catch (e) {}
                          showToast('Valores de fábrica restablecidos correctamente');
                        },
                      });
                    }}
                    className="w-full min-h-[42px] bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">restore</span>
                    <span>Restablecer Datos de Fábrica</span>
                  </button>
                  <span className="text-[10px] text-gray-400 block text-center">
                    PIN volverá a ser 1234 y se recuperarán los autos y banners de muestra.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* IN-APP CONFIRMATION MODAL (Zero window.confirm)                */}
        {/* ============================================================== */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#9D9D9C]/30 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    confirmModal.isDestructive
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-[#212955]/10 text-[#212955]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {confirmModal.isDestructive ? 'warning' : 'help'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-[#212955]">
                    {confirmModal.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {confirmModal.description}
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeConfirmation}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmModal.onConfirm();
                    closeConfirmation();
                  }}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                    confirmModal.isDestructive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[#212955] hover:bg-[#181e40]'
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
