import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  AutoPartsIcon,
  VehicleIcon,
  WorkshopServiceIcon,
  PlanRetomaIcon,
  Showroom360Icon,
  MasterCatalogIcon,
  GarageLiftIcon,
  TireOffRoadIcon,
  Equip4x4Icon,
  LubricantOilIcon,
  SecurityFilmIcon,
  DetailingPPFIcon,
  SuspensionHDIcon,
} from './AutoIcons';

interface MegaMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubSection {
  title: string;
  items: {
    label: string;
    action: () => void;
    badge?: string;
  }[];
}

interface MenuCategory {
  id: string;
  name: string;
  group: 'destacados' | 'repuestos' | 'vehiculos' | 'servicios_financieros' | 'taller';
  icon: string;
  badge?: { text: string; bg: string };
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBg: string;
  viewAllAction: () => void;
  sections: SubSection[];
  featuredBrands?: {
    name: string;
    action: () => void;
  }[];
}

export const MegaMenuModal: React.FC<MegaMenuModalProps> = ({ isOpen, onClose }) => {
  const {
    setCurrentView,
    navigateToPartsCatalog,
    setSelectedVehicleId,
    setIsViewer360Open,
    setIsGarageModalOpen,
    setIsTestDriveModalOpen,
  } = useApp();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('oportunidades');
  const [filterQuery, setFilterQuery] = useState<string>('');

  if (!isOpen) return null;

  const handleNav = (fn: () => void) => {
    fn();
    onClose();
  };

  const CATEGORIES: MenuCategory[] = [
    {
      id: 'oportunidades',
      name: 'Oportunidades & Promos',
      group: 'destacados',
      icon: 'percent',
      badge: { text: 'SALE', bg: 'bg-[#0f172a] text-white' },
      bannerTitle: 'Oportunidades Únicas & Promociones de Temporada',
      bannerSubtitle: 'Precios especiales en Repuestos Oficiales, Llantas M/T, Aros, Bono de Retoma y Cuotas',
      bannerBg: 'bg-gradient-to-r from-[#84cc16] via-[#65a30d] to-[#4d7c0f]',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('todos', 'todos', '')),
      sections: [
        {
          title: 'Llantas & Aros Promo',
          items: [
            { label: 'Mickey Thompson Baja Boss A/T (-15%)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson')), badge: '-15%' },
            { label: 'Aros Black Rhino Boxer 17" Gunmetal (-13%)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO')), badge: 'PROMO' },
            { label: 'Llantas Mud-Terrain 285/70R17', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson')) },
            { label: 'Enllantado & Balanceo Láser 3D', action: () => handleNav(() => setCurrentView('services')), badge: 'TALLER' },
          ],
        },
        {
          title: 'Equipamiento 4x4 Off-Road',
          items: [
            { label: 'Barras Antivuelco KEKO K3 Black (-16%)', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')), badge: '-16%' },
            { label: 'Tapas Retráctiles de Tolva KEKO Roll Cover', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
            { label: 'Estribos Tubulares Hilux / Frontier Pro-4X', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
            { label: 'Kit Suspensión Trakko +2" Lift Heavy-Duty', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS')) },
          ],
        },
        {
          title: 'Mantenimiento & Fluidos',
          items: [
            { label: 'Aceite Mobil 1 ESP 5W-30 Galón (-13%)', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')), badge: '-13%' },
            { label: 'Mobil Delvac Turbo Diésel 15W-40', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
            { label: 'Kit Mantenimiento Toyota OEM 40k (-20%)', action: () => handleNav(() => navigateToPartsCatalog('filtros', 'TOYOTA Genuino')), badge: '-20%' },
            { label: 'Filtros de Aire K&N Lavables de Alto Flujo', action: () => handleNav(() => navigateToPartsCatalog('filtros', 'K&N')) },
          ],
        },
        {
          title: 'Protección & Car Care',
          items: [
            { label: 'Láminas LLumar CTX Nanocerámica (-20%)', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')), badge: '-20%' },
            { label: 'Tratamiento Cerámico 3M 9H (-15%)', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')), badge: '9H' },
            { label: 'PPF 3M Scotchgard Pro Auto-Regenerativo', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
            { label: 'Polarizado Antiasalto Homologado PNP', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'MICKEY THOMPSON (M/T)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson')) },
        { name: 'KEKO 4X4', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
        { name: 'Mobil 1', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
        { name: 'LLumar', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
        { name: 'BLACK RHINO', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO')) },
        { name: '3M Auto', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
        { name: 'TRAKKO® AUTORUS', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS')) },
        { name: 'TOYOTA Genuino', action: () => handleNav(() => navigateToPartsCatalog('todos', 'TOYOTA Genuino')) },
      ],
    },
    {
      id: 'marcas-repuestos-oficiales',
      name: 'Repuestos por Marca Oficial',
      group: 'repuestos',
      icon: 'stars',
      badge: { text: '8 MARCAS', bg: 'bg-primary text-white' },
      bannerTitle: 'Despiece y Catálogo por Fabricantes Autorizados',
      bannerSubtitle: 'Selecciona una marca oficial para ver sus componentes, kits de servicio y especificaciones',
      bannerBg: 'bg-gradient-to-r from-slate-900 via-primary to-slate-800',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('todos')),
      sections: [
        {
          title: 'MICKEY THOMPSON & BLACK RHINO',
          items: [
            { label: 'Mickey Thompson Baja Boss A/T (PowerPly)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson', 'Baja Boss')), badge: 'M/T' },
            { label: 'Mickey Thompson Baja Legend MTZ Mud-Terrain', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson', 'Legend')) },
            { label: 'Black Rhino Boxer 17x8.0 Gunmetal 6-Hole', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO', 'Boxer')) },
            { label: 'Black Rhino Armory 18x9.0 Desert Sand Militar', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO', 'Armory')) },
          ],
        },
        {
          title: 'KEKO 4X4 BRASIL',
          items: [
            { label: 'Barra Antivuelco KEKO K3 Black Hilux', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO', 'K3')), badge: 'KEKO' },
            { label: 'Tapa Retráctil Roll Cover de Aluminio', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO', 'Roll Cover')) },
            { label: 'Estribos Tubulares K1 Negro Mate', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO', 'Estribo')) },
            { label: 'Defensa Delantera Protectora & Enganches', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
          ],
        },
        {
          title: 'MOBIL & LLUMAR',
          items: [
            { label: 'Mobil 1 ESP Sintético 5W-30 (Galón 4L)', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'ESP')), badge: 'Mobil' },
            { label: 'Mobil Delvac Turbo Diésel 15W-40', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'Delvac')) },
            { label: 'LLumar CTX Nanocerámica 50µ Anti-Impacto', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar', 'CTX')), badge: 'LLumar' },
            { label: 'LLumar ATR IR Polarizado Homologado PNP', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar', 'ATR')) },
          ],
        },
        {
          title: '3M, TRAKKO & TOYOTA OEM',
          items: [
            { label: '3M Ceramic Coating 9H Kit Profesional', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M', 'Ceramic')), badge: '3M' },
            { label: 'TRAKKO® Kit Lift +2" Heavy-Duty Hilux', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS', 'Lift')), badge: 'TRAKKO' },
            { label: 'Toyota Genuino Pastillas Delanteras OEM', action: () => handleNav(() => navigateToPartsCatalog('frenos', 'TOYOTA Genuino', 'Pastillas')), badge: 'OEM' },
            { label: 'Brembo Discos Ranurados & Bosch Baterías AGM', action: () => handleNav(() => navigateToPartsCatalog('frenos', 'Brembo')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'MICKEY THOMPSON (M/T)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson')) },
        { name: 'KEKO 4X4', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
        { name: 'Mobil Lubricantes', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
        { name: 'LLumar Nanocerámica', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
        { name: 'BLACK RHINO', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO')) },
        { name: '3M Automotive', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
        { name: 'TRAKKO® AUTORUS', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS')) },
        { name: 'TOYOTA Genuino', action: () => handleNav(() => navigateToPartsCatalog('todos', 'TOYOTA Genuino')) },
      ],
    },
    {
      id: 'plan-retoma-finanzas',
      name: 'Plan Retoma & Financiamiento',
      group: 'servicios_financieros',
      icon: 'swap_horiz',
      badge: { text: 'BONO S/ 7,500', bg: 'bg-emerald-600 text-white' },
      bannerTitle: 'Soluciones Financieras, Tasación Online & Retoma de Autos',
      bannerSubtitle: 'Entrega tu vehículo usado como parte de pago y financia tu 0 KM con tasas preferenciales',
      bannerBg: 'bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900',
      viewAllAction: () => handleNav(() => setCurrentView('trade-in')),
      sections: [
        {
          title: 'Plan Retoma tu Auto',
          items: [
            { label: 'Tasación Online Inmediata de tu Auto', action: () => handleNav(() => setCurrentView('trade-in')), badge: 'RÁPIDO' },
            { label: 'Bono Exclusivo de Retoma hasta S/ 7,500', action: () => handleNav(() => setCurrentView('trade-in')), badge: 'BONO' },
            { label: 'Inspección Mecánica Gratuita en Taller', action: () => handleNav(() => setCurrentView('trade-in')) },
            { label: 'Requisitos y Trámite Notarial Simple', action: () => handleNav(() => setCurrentView('trade-in')) },
          ],
        },
        {
          title: 'Simulador de Crédito',
          items: [
            { label: 'Simulador de Cuotas a 12, 24, 36, 48 o 60 Meses', action: () => handleNav(() => setCurrentView('financing')), badge: 'SIMULAR' },
            { label: 'Crédito Vehicular BCP, BBVA, Santander', action: () => handleNav(() => setCurrentView('financing')) },
            { label: 'Tasa Preferencial desde 9.99% TEA Nor Celis', action: () => handleNav(() => setCurrentView('financing')), badge: 'TASA VIP' },
            { label: 'Pre-Aprobación Online en 24 Horas', action: () => handleNav(() => setCurrentView('financing')) },
          ],
        },
        {
          title: 'Mi Garaje Virtual',
          items: [
            { label: 'Configurar Mi Garaje (Auto Activo)', action: () => handleNav(() => setIsGarageModalOpen(true)), badge: 'ACTIVO' },
            { label: 'Validar Compatibilidad de Repuestos por VIN', action: () => handleNav(() => setIsGarageModalOpen(true)) },
            { label: 'Historial de Mantenimientos y Servicios', action: () => handleNav(() => setCurrentView('account')) },
            { label: 'Alertas de Cambio de Aceite y Frenos', action: () => handleNav(() => setCurrentView('account')) },
          ],
        },
        {
          title: 'Atención & Confianza',
          items: [
            { label: 'Concesionario Cajamarca (Av. Vía Evitamiento 6003)', action: () => handleNav(() => setCurrentView('locations')), badge: 'SEDE' },
            { label: 'Garantía Oficial Nor Celis de 1 a 5 Años', action: () => handleNav(() => setCurrentView('about')) },
            { label: 'Libro de Reclamaciones Directo', action: () => handleNav(() => setCurrentView('claims')), badge: 'INDECOPI' },
            { label: 'Solicitar Test Drive a Domicilio', action: () => handleNav(() => setIsTestDriveModalOpen(true)) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'Plan Retoma con Bono', action: () => handleNav(() => setCurrentView('trade-in')) },
        { name: 'Simulador Crédito', action: () => handleNav(() => setCurrentView('financing')) },
        { name: 'Mi Garaje Virtual', action: () => handleNav(() => setIsGarageModalOpen(true)) },
        { name: 'Showroom 360°', action: () => handleNav(() => setIsViewer360Open(true)) },
        { name: 'Libro Reclamaciones', action: () => handleNav(() => setCurrentView('claims')) },
      ],
    },
    {
      id: 'llantas-aros',
      name: 'Llantas & Aros Off-Road',
      group: 'repuestos',
      icon: 'tire_repair',
      badge: { text: 'M/T & BR', bg: 'bg-amber-600 text-white' },
      bannerTitle: 'Llantas Off-Road & Aros de Aleación Reforzados',
      bannerSubtitle: 'Distribuidor Autorizado MICKEY THOMPSON (M/T) y BLACK RHINO en Cajamarca',
      bannerBg: 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-900',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('llantas')),
      sections: [
        {
          title: 'Mickey Thompson (M/T)',
          items: [
            { label: 'Baja Boss A/T 265/65R17 (PowerPly XD)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson', 'Baja Boss')), badge: 'TOP' },
            { label: 'Baja Legend MTZ 285/70R17 (Mud Terrain)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson', 'Legend')) },
            { label: 'Llantas 4x4 para Hilux y Ranger', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson')) },
            { label: 'Llantas para Trocha Pesada y Minería', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson')) },
          ],
        },
        {
          title: 'Aros Black Rhino',
          items: [
            { label: 'Black Rhino Boxer 17x8.0 6x139.7 Gunmetal', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO', 'Boxer')), badge: '17"' },
            { label: 'Black Rhino Armory 18x9.0 Desert Sand', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO', 'Armory')), badge: '18"' },
            { label: 'Aros Tácticos Militares Heavy-Duty', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO')) },
            { label: 'Aros Forjados para Camionetas 6 Pernos', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO')) },
          ],
        },
        {
          title: 'Accesorios & Tuercas',
          items: [
            { label: 'Tuercas de Seguridad Antirrobo Spline', action: () => handleNav(() => navigateToPartsCatalog('llantas')) },
            { label: 'Espaciadores de Rueda en Aluminio', action: () => handleNav(() => navigateToPartsCatalog('llantas')) },
            { label: 'Válvulas Metálicas de Alta Presión', action: () => handleNav(() => navigateToPartsCatalog('llantas')) },
            { label: 'Sensores de Presión TPMS Inalámbricos', action: () => handleNav(() => navigateToPartsCatalog('llantas')) },
          ],
        },
        {
          title: 'Servicios de Llanta',
          items: [
            { label: 'Enllantado Láser Computarizado', action: () => handleNav(() => setCurrentView('services')), badge: 'LÁSER' },
            { label: 'Alineamiento 3D Multieje', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Balanceo Dinámico de Alta Velocidad', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Inflado con Nitrógeno Seco 99%', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'MICKEY THOMPSON (M/T)', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'Mickey Thompson')) },
        { name: 'BLACK RHINO', action: () => handleNav(() => navigateToPartsCatalog('llantas', 'BLACK RHINO')) },
      ],
    },
    {
      id: 'keko-4x4',
      name: 'Accesorios & Equipamiento 4x4',
      group: 'repuestos',
      icon: 'shield_with_heart',
      badge: { text: 'KEKO', bg: 'bg-red-700 text-white' },
      bannerTitle: 'Línea de Accesorios 4x4 Oficial KEKO Brasil',
      bannerSubtitle: 'Barras Antivuelco, Tapas Retráctiles de Tolva, Estribos y Defensas de Alta Resistencia',
      bannerBg: 'bg-gradient-to-r from-red-800 via-red-700 to-zinc-900',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')),
      sections: [
        {
          title: 'Barras Antivuelco KEKO',
          items: [
            { label: 'Barra Antivuelco KEKO K3 Black Hilux', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO', 'K3')), badge: 'K3' },
            { label: 'Barra Antivuelco KEKO K1 Frontier Pro-4X', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO', 'K1')), badge: 'K1' },
            { label: 'Rejillas Protectoras de Luna Trasera', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
            { label: 'Soportes de Barra para Faros LED', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
          ],
        },
        {
          title: 'Tapas de Tolva Retráctiles',
          items: [
            { label: 'Tapa Retráctil KEKO Roll Cover Aluminio', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO', 'Roll Cover')), badge: 'ROLL' },
            { label: 'Lona Marítima Tri-Fold KEKO', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
            { label: 'Cerradura Blindada y Drenaje Pluvial', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
            { label: 'Amortiguador de Portón de Tolva Suave', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
          ],
        },
        {
          title: 'Estribos & Defensas',
          items: [
            { label: 'Estribos Tubulares KEKO K1 Negro Mate', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO', 'Estribo')), badge: 'TUBULAR' },
            { label: 'Estribos Planos de Aluminio Anodizado', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
            { label: 'Defensa Delantera Protectora (Bullbar)', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
            { label: 'Protector de Cárter Duraluminio 5mm', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
          ],
        },
        {
          title: 'Equipamiento Especial',
          items: [
            { label: 'Enganches de Remolque Homologados', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4')) },
            { label: 'Snorkel 4x4 Sellado Anti-Polvo', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4')) },
            { label: 'Barras de Techo Portaequipaje', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4')) },
            { label: 'Equipamiento Minero D.S. 024', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'KEKO Official', action: () => handleNav(() => navigateToPartsCatalog('accesorios4x4', 'KEKO')) },
      ],
    },
    {
      id: 'mobil-lubricantes',
      name: 'Aceites & Lubricantes',
      group: 'repuestos',
      icon: 'oil_barrel',
      badge: { text: 'Mobil 1', bg: 'bg-blue-800 text-white' },
      bannerTitle: 'Lubricantes y Fluidos de Alto Desempeño Mobil',
      bannerSubtitle: 'Sintéticos Mobil 1 ESP, Mobil Super y Mobil Delvac para Motores Gasolina, Híbridos y Diésel',
      bannerBg: 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')),
      sections: [
        {
          title: 'Mobil 1™ 100% Sintético',
          items: [
            { label: 'Mobil 1 ESP 5W-30 (Galón 4 Litros)', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'ESP 5W-30')), badge: '5W-30' },
            { label: 'Mobil 1 0W-20 Advanced Fuel (Híbridos)', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', '0W-20')), badge: '0W-20' },
            { label: 'Mobil 1 FS 5W-40 Protección Extrema', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', '5W-40')) },
            { label: 'Mobil 1 Racing 10W-60', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
          ],
        },
        {
          title: 'Mobil Delvac™ Turbo Diésel',
          items: [
            { label: 'Mobil Delvac Modern 15W-40 Super Defense', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'Delvac 15W-40')), badge: '15W-40' },
            { label: 'Mobil Delvac 1 ESP 5W-40 Sintético Diésel', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'Delvac 1')) },
            { label: 'Aceite Diésel para Hilux, Frontier y Camiones', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
            { label: 'Fórmula Low-SAPS para DPF Euro 5/6', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
          ],
        },
        {
          title: 'Transmisión & Diferenciales',
          items: [
            { label: 'Mobil ATF Multi-Vehicle para Caja Automática', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'ATF')), badge: 'ATF' },
            { label: 'Mobilube HD Plus 80W-90 para Corona 4x4', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', '80W-90')) },
            { label: 'Fluido de Frenos Mobil DOT 4 Alta Temp.', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'DOT 4')) },
            { label: 'Refrigerante Larga Vida Concentrado 50/50', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
          ],
        },
        {
          title: 'Grasas & Servicios Express',
          items: [
            { label: 'Mobilgrease XHP 222 Azul Alta Carga', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil', 'XHP 222')), badge: 'XHP 222' },
            { label: 'Grasa Sintética para Crucetas y Cardanes', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
            { label: 'Servicio de Cambio de Aceite Express', action: () => handleNav(() => setCurrentView('services')), badge: 'EXPRESS' },
            { label: 'Análisis de Aceite Usado en Taller', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'Mobil 1', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
        { name: 'Mobil Delvac', action: () => handleNav(() => navigateToPartsCatalog('lubricantes', 'Mobil')) },
      ],
    },
    {
      id: 'llumar-seguridad',
      name: 'Seguridad & Polarizados',
      group: 'repuestos',
      icon: 'security',
      badge: { text: 'LLumar', bg: 'bg-emerald-800 text-white' },
      bannerTitle: 'Láminas de Seguridad & Películas Solares LLumar',
      bannerSubtitle: 'Protección Antiasalto de 50 Micras y Nanocerámica con Rechazo Térmico 96%',
      bannerBg: 'bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')),
      sections: [
        {
          title: 'Láminas de Seguridad',
          items: [
            { label: 'LLumar CTX Nanocerámica 50 Micras Anti-Impacto', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar', 'CTX')), badge: '50µ' },
            { label: 'Láminas Antiasalto 12 y 16 Micras Certificadas', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
            { label: 'Kit Completo 4 Puertas + Luneta Posterior', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
            { label: 'Protección Anti-Astillamiento de Parabrisas', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
          ],
        },
        {
          title: 'Polarizados Nanocerámicos',
          items: [
            { label: 'LLumar ATR IR 15% Homologado PNP', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar', 'ATR')), badge: 'PNP OK' },
            { label: 'LLumar AIR 80 para Parabrisas Transparente', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar', 'AIR')) },
            { label: 'Tonalidades 5%, 20%, 35%, 50% y 70%', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
            { label: 'Filtro UV 99.9% Contra Cáncer de Piel', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
          ],
        },
        {
          title: 'Seguridad Vehicular Electrónica',
          items: [
            { label: 'Alarmas con Sensor Volumétrico', action: () => handleNav(() => navigateToPartsCatalog('seguridad')) },
            { label: 'GPS Satelital con Bloqueo de Motor en App', action: () => handleNav(() => navigateToPartsCatalog('seguridad')), badge: 'GPS' },
            { label: 'Trabas de Timón y Pedales en Acero', action: () => handleNav(() => navigateToPartsCatalog('seguridad')) },
            { label: 'Cámaras Dashcam Delantera y Trasera', action: () => handleNav(() => navigateToPartsCatalog('seguridad')) },
          ],
        },
        {
          title: 'Instalación Homologada',
          items: [
            { label: 'Instalación en Cabina Limpia Presurizada', action: () => handleNav(() => setCurrentView('services')), badge: 'CABINA' },
            { label: 'Certificado Homologado para Trámite PNP', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Garantía Oficial LLumar de 10 Años', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Asesoría Técnica en Normativa de Lunas', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'LLumar Official', action: () => handleNav(() => navigateToPartsCatalog('seguridad', 'LLumar')) },
      ],
    },
    {
      id: '3m-detailing',
      name: 'Car Care, PPF & Detailing',
      group: 'repuestos',
      icon: 'auto_fix_high',
      badge: { text: '3M Auto', bg: 'bg-rose-700 text-white' },
      bannerTitle: 'Detailing Profesional, PPF y Cerámicos 3M',
      bannerSubtitle: 'Protección de Pintura Scotchgard Pro Series, Recubrimientos Cerámicos 9H y Cintas VHB',
      bannerBg: 'bg-gradient-to-r from-red-900 via-rose-800 to-zinc-900',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')),
      sections: [
        {
          title: 'Cerámicos & Selladores 3M',
          items: [
            { label: '3M Ceramic Coating Kit 39901 (Dureza 9H)', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M', 'Ceramic')), badge: '9H' },
            { label: 'Cera Líquida Sintética 3M Performance Finish', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
            { label: 'Sellador Hidrofóbico de Lunas y Parabrisas', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
            { label: 'Acondicionador de Cueros y Plásticos 3M', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
          ],
        },
        {
          title: 'PPF Paint Protection 3M',
          items: [
            { label: '3M Scotchgard Pro Series Auto-Regenerativo', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M', 'PPF')), badge: 'PPF' },
            { label: 'Kit PPF para Capot, Faros y Espejos', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
            { label: 'Protección de Manijas de Puerta y Borde', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
            { label: 'Film Protector de Pantallas Multimedia', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
          ],
        },
        {
          title: 'Adhesivos & Abrasivos 3M',
          items: [
            { label: 'Cinta Doble Contacto 3M VHB Heavy Duty 19mm', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M', 'VHB')), badge: 'VHB' },
            { label: 'Pastas de Pulir 3M Perfect-It Fases 1, 2 y 3', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
            { label: 'Lijas al Agua Microfinas 3M Trizact', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
            { label: 'Paños de Microfibra de Alto Gramaje 3M', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
          ],
        },
        {
          title: 'Servicios de Estética',
          items: [
            { label: 'Tratamiento Cerámico 9H en Taller (Cita)', action: () => handleNav(() => setCurrentView('services')), badge: 'TALLER' },
            { label: 'Lavado Premium de Motor a Vapor', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Restauración de Faros Opacos con Barniz UV', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Limpieza y Desinfección de Tapicería con Ozono', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
      ],
      featuredBrands: [
        { name: '3M Automotive', action: () => handleNav(() => navigateToPartsCatalog('detailing', '3M')) },
      ],
    },
    {
      id: 'trakko-suspension',
      name: 'Suspensión & Lift Kits',
      group: 'repuestos',
      icon: 'car_repair',
      badge: { text: 'TRAKKO®', bg: 'bg-yellow-600 text-black' },
      bannerTitle: 'Suspensión Heavy-Duty TRAKKO® AUTORUS & KYB',
      bannerSubtitle: 'Kits Lift +2 Pulgadas, Amortiguadores de Gas Nitrógeno Reforzados para Trocha y Carga',
      bannerBg: 'bg-gradient-to-r from-yellow-700 via-amber-600 to-zinc-900',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS')),
      sections: [
        {
          title: 'TRAKKO® AUTORUS HD',
          items: [
            { label: 'Kit Lift +2" Heavy-Duty Hilux / Fortuner', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS', 'Lift')), badge: '+2"' },
            { label: 'Amortiguadores Traseros Nitro Gas 54mm', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS', 'Amortiguador')) },
            { label: 'Muelles Helicoidales Reforzados +50kg', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS')) },
            { label: 'Bujes de Poliuretano para Ballestas y Muelles', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS')) },
          ],
        },
        {
          title: 'KYB Shocks & Struts',
          items: [
            { label: 'Amortiguadores Delanteros KYB Excel-G Gas', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'KYB')), badge: 'KYB' },
            { label: 'Amortiguadores KYB Gas-A-Just Monotubo', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'KYB')) },
            { label: 'Bases y Coperolas de Amortiguador Original', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'KYB')) },
            { label: 'Guardapolvos y Topes de Rebote', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'KYB')) },
          ],
        },
        {
          title: 'Performance & Geometría',
          items: [
            { label: 'Coilover Deportivo Regulable en Altura', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'Nor Celis')) },
            { label: 'Barra Estabilizadora y Terminales de Dirección', action: () => handleNav(() => navigateToPartsCatalog('suspension')) },
            { label: 'Rótulas de Suspensión Reforzadas 555 Japón', action: () => handleNav(() => navigateToPartsCatalog('suspension')) },
            { label: 'Trapecios Superiores Corregidos para Lift', action: () => handleNav(() => navigateToPartsCatalog('suspension')) },
          ],
        },
        {
          title: 'Diagnóstico & Taller',
          items: [
            { label: 'Inspección de Suspensión en Elevador', action: () => handleNav(() => setCurrentView('services')), badge: 'CHECK' },
            { label: 'Instalación de Kit Lift con Calibración', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Prensa Hidráulica de Bocinas y Rótulas', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Garantía 2 Años en Kits TRAKKO®', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'TRAKKO® AUTORUS', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS')) },
        { name: 'KYB Shocks', action: () => handleNav(() => navigateToPartsCatalog('suspension', 'KYB')) },
      ],
    },
    {
      id: 'toyota-oem',
      name: 'Repuestos Originales OEM',
      group: 'repuestos',
      icon: 'settings_suggest',
      badge: { text: 'TOYOTA', bg: 'bg-red-600 text-white' },
      bannerTitle: 'Repuestos Genuinos TOYOTA OEM, Brembo, Bosch & Denso',
      bannerSubtitle: 'Despiece Oficial Garantizado con Código OEM, Pastillas de Freno, Filtros y Bujías',
      bannerBg: 'bg-gradient-to-r from-red-700 via-rose-700 to-zinc-950',
      viewAllAction: () => handleNav(() => navigateToPartsCatalog('todos', 'TOYOTA Genuino')),
      sections: [
        {
          title: 'Toyota Genuino OEM',
          items: [
            { label: 'Filtro de Aceite Genuino 04152-YZZA6', action: () => handleNav(() => navigateToPartsCatalog('filtros', 'TOYOTA Genuino', '04152')), badge: 'OEM' },
            { label: 'Pastillas Delanteras Toyota 04465-0K360', action: () => handleNav(() => navigateToPartsCatalog('frenos', 'TOYOTA Genuino', 'Pastillas')) },
            { label: 'Bujías Iridium Toyota Denso SK16R11', action: () => handleNav(() => navigateToPartsCatalog('motor', 'TOYOTA Genuino', 'Bujías')) },
            { label: 'Filtro de Aire Toyota Denso 17801-0C010', action: () => handleNav(() => navigateToPartsCatalog('filtros', 'TOYOTA Genuino', '17801')) },
          ],
        },
        {
          title: 'Frenos Brembo & Aisin',
          items: [
            { label: 'Discos Ventilados Brembo X-Line Ranurados', action: () => handleNav(() => navigateToPartsCatalog('frenos', 'Brembo')), badge: 'BREMBO' },
            { label: 'Pastillas Cerámicas Brembo Low-Dust', action: () => handleNav(() => navigateToPartsCatalog('frenos', 'Brembo')) },
            { label: 'Discos Traseros Macizos Aisin Geomet', action: () => handleNav(() => navigateToPartsCatalog('frenos', 'Aisin')) },
            { label: 'Líquido de Frenos Brembo DOT 4 Racing', action: () => handleNav(() => navigateToPartsCatalog('frenos')) },
          ],
        },
        {
          title: 'Electricidad Bosch & Denso',
          items: [
            { label: 'Batería Bosch S5 Heavy Duty AGM 70Ah', action: () => handleNav(() => navigateToPartsCatalog('baterias', 'Bosch')), badge: 'AGM' },
            { label: 'Alternadores y Arrancadores Denso OEM', action: () => handleNav(() => navigateToPartsCatalog('motor', 'Denso')) },
            { label: 'Focos LED H4/H11 y Xenón Homologados', action: () => handleNav(() => navigateToPartsCatalog('iluminacion')) },
            { label: 'Sensores de Oxígeno y MAF Denso Japón', action: () => handleNav(() => navigateToPartsCatalog('motor', 'Denso')) },
          ],
        },
        {
          title: 'Kits de Mantenimiento',
          items: [
            { label: 'Kit Mayor 40,000 km Toyota RAV4', action: () => handleNav(() => navigateToPartsCatalog('filtros', 'Denso', '40k')), badge: 'COMBO' },
            { label: 'Kit Afinamiento Electrónico y Bujías', action: () => handleNav(() => navigateToPartsCatalog('motor')) },
            { label: 'Filtros de Cabina Antibacteriales Carbón', action: () => handleNav(() => navigateToPartsCatalog('filtros')) },
            { label: 'Faja de Distribución y Accesorios OEM', action: () => handleNav(() => navigateToPartsCatalog('motor')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'TOYOTA Genuino', action: () => handleNav(() => navigateToPartsCatalog('todos', 'TOYOTA Genuino')) },
        { name: 'Brembo', action: () => handleNav(() => navigateToPartsCatalog('frenos', 'Brembo')) },
        { name: 'Bosch', action: () => handleNav(() => navigateToPartsCatalog('baterias', 'Bosch')) },
        { name: 'Denso', action: () => handleNav(() => navigateToPartsCatalog('filtros', 'Denso')) },
      ],
    },
    {
      id: 'vehiculos-0km',
      name: 'Vehículos 2025 & Seminuevos',
      group: 'vehiculos',
      icon: 'directions_car',
      badge: { text: '0 KM', bg: 'bg-primary text-white' },
      bannerTitle: 'Showroom de Autos Nuevos 2025 y Seminuevos Certificados',
      bannerSubtitle: 'Garantía Nor Celis hasta 5 Años, Entrega Inmediata y Financiamiento Flexible',
      bannerBg: 'bg-gradient-to-r from-primary via-primary-container to-slate-900',
      viewAllAction: () => handleNav(() => setCurrentView('cars')),
      sections: [
        {
          title: 'Nuevos 2025 0 KM',
          items: [
            { label: 'Toyota RAV4 2.5L Hybrid Limited AWD', action: () => handleNav(() => { setSelectedVehicleId('veh-rav4-2025'); setCurrentView('vehicle-pdp'); }), badge: 'HÍBRIDO' },
            { label: 'Nissan Frontier Pro-4X 2.3L Bi-Turbo', action: () => handleNav(() => { setSelectedVehicleId('veh-frontier-2025'); setCurrentView('vehicle-pdp'); }), badge: '4X4' },
            { label: 'Hyundai Tucson Limited 2025 Smartstream', action: () => handleNav(() => { setSelectedVehicleId('veh-hyundai-tucson-2025'); setCurrentView('vehicle-pdp'); }) },
            { label: 'Volvo EX30 Ultra 100% Eléctrico', action: () => handleNav(() => { setSelectedVehicleId('veh-volvo-ex30-2024'); setCurrentView('vehicle-pdp'); }), badge: 'EV' },
          ],
        },
        {
          title: 'Seminuevos Certificados',
          items: [
            { label: 'BMW 520i Executive 2021 (38,000 km)', action: () => handleNav(() => { setSelectedVehicleId('veh-bmw-520i-2021'); setCurrentView('vehicle-pdp'); }), badge: 'BMW' },
            { label: 'Audi Q8 e-tron 2023 Quattro Eléctrico', action: () => handleNav(() => { setSelectedVehicleId('veh-audi-q8-2023'); setCurrentView('vehicle-pdp'); }) },
            { label: 'Toyota Hilux 2.4L D/C 4x4 SR 2020', action: () => handleNav(() => { setSelectedVehicleId('veh-hilux-diesel-2020'); setCurrentView('vehicle-pdp'); }), badge: 'DIÉSEL' },
            { label: 'Kia Sportage GT Line 2023 Turbo', action: () => handleNav(() => { setSelectedVehicleId('veh-kia-sportage-2023'); setCurrentView('vehicle-pdp'); }) },
          ],
        },
        {
          title: 'Servicios de Compra',
          items: [
            { label: 'Simulador de Crédito & Financiamiento', action: () => handleNav(() => setCurrentView('financing')), badge: 'CUOTAS' },
            { label: 'Tasación Online & Plan Retoma tu Auto', action: () => handleNav(() => setCurrentView('trade-in')), badge: 'BONO' },
            { label: 'Showroom Interactivo 360°', action: () => handleNav(() => setIsViewer360Open(true)), badge: '360°' },
            { label: 'Solicitar Test Drive a Domicilio', action: () => handleNav(() => setIsTestDriveModalOpen(true)) },
          ],
        },
        {
          title: 'Garantía & Confianza',
          items: [
            { label: '150 Puntos de Inspección Mecánica', action: () => handleNav(() => setCurrentView('about')) },
            { label: 'Garantía Oficial de 1 a 5 Años', action: () => handleNav(() => setCurrentView('about')) },
            { label: 'Historial 100% Verificado en Notaría y SAT', action: () => handleNav(() => setCurrentView('about')) },
            { label: 'Entrega en 48 Horas con Placa y SOAT', action: () => handleNav(() => setCurrentView('locations')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'Toyota', action: () => handleNav(() => setCurrentView('cars')) },
        { name: 'Nissan', action: () => handleNav(() => setCurrentView('cars')) },
        { name: 'Hyundai', action: () => handleNav(() => setCurrentView('cars')) },
        { name: 'BMW', action: () => handleNav(() => setCurrentView('cars')) },
        { name: 'Audi', action: () => handleNav(() => setCurrentView('cars')) },
        { name: 'Volvo', action: () => handleNav(() => setCurrentView('cars')) },
      ],
    },
    {
      id: 'taller-servicios',
      name: 'Taller, Citas & Car Care',
      group: 'taller',
      icon: 'build',
      badge: { text: 'CITAS ONLINE', bg: 'bg-purple-800 text-white' },
      bannerTitle: 'Taller Mecánico Multimarca & Centro de Detailing',
      bannerSubtitle: 'Mantenimiento preventivo, diagnóstico computarizado con escáner oficial y cabina de estética',
      bannerBg: 'bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950',
      viewAllAction: () => handleNav(() => setCurrentView('services')),
      sections: [
        {
          title: 'Mantenimiento Periódico',
          items: [
            { label: 'Mantenimiento Preventivo 5k, 10k, 20k, 40k', action: () => handleNav(() => setCurrentView('services')), badge: 'OBLIGATORIO' },
            { label: 'Cambio de Aceite Sintético Mobil 1 Express', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Revisión y Purga de Frenos ABS / ESP', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Cambio de Filtros y Afinamiento Electrónico', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
        {
          title: 'Servicios de Llanta & Chasis',
          items: [
            { label: 'Alineamiento Computarizado 3D Multieje', action: () => handleNav(() => setCurrentView('services')), badge: '3D' },
            { label: 'Balanceo Dinámico de Ruedas 4x4', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Instalación de Kit Lift y Suspensión HD', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Diagnóstico de Tren Delantero y Cajas', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
        {
          title: 'Cabina de Estética & Seguridad',
          items: [
            { label: 'Instalación de Láminas LLumar Nanocerámica', action: () => handleNav(() => setCurrentView('services')), badge: 'LLUMAR' },
            { label: 'Tratamiento Cerámico 3M 9H con Pulido', action: () => handleNav(() => setCurrentView('services')), badge: '3M 9H' },
            { label: 'Lavado Premium y Desinfección de Tapices', action: () => handleNav(() => setCurrentView('services')) },
            { label: 'Instalación de GPS Satelital con App Móvil', action: () => handleNav(() => setCurrentView('services')) },
          ],
        },
        {
          title: 'Agendamiento & Garantía',
          items: [
            { label: 'Reservar Cita de Taller Online Prioritaria', action: () => handleNav(() => setCurrentView('services')), badge: 'PRIORIDAD' },
            { label: 'Historial Digital de Reparaciones en Mi Garaje', action: () => handleNav(() => setCurrentView('account')) },
            { label: 'Inspección de 150 Puntos con Informe Técnico', action: () => handleNav(() => setCurrentView('about')) },
            { label: 'Concesionario & Taller en Av. Evitamiento Sur', action: () => handleNav(() => setCurrentView('locations')) },
          ],
        },
      ],
      featuredBrands: [
        { name: 'Reservar Cita Taller', action: () => handleNav(() => setCurrentView('services')) },
        { name: 'Cabina LLumar', action: () => handleNav(() => setCurrentView('services')) },
        { name: 'Detailing 3M 9H', action: () => handleNav(() => setCurrentView('services')) },
        { name: 'Enllantado 3D', action: () => handleNav(() => setCurrentView('services')) },
      ],
    },
  ];

  // Filtering based on search query inside the mega menu
  const filteredCategories = useMemo(() => {
    if (!filterQuery.trim()) return CATEGORIES;
    const query = filterQuery.toLowerCase();

    return CATEGORIES.map((cat) => {
      const matchCatName = cat.name.toLowerCase().includes(query);
      const filteredSections = cat.sections.map((sec) => {
        const filteredItems = sec.items.filter((item) =>
          item.label.toLowerCase().includes(query) || (item.badge && item.badge.toLowerCase().includes(query))
        );
        return { ...sec, items: filteredItems };
      }).filter((sec) => sec.items.length > 0);

      const brandMatches = cat.featuredBrands?.filter((b) => b.name.toLowerCase().includes(query)) || [];

      if (matchCatName || filteredSections.length > 0 || brandMatches.length > 0) {
        return {
          ...cat,
          sections: filteredSections.length > 0 ? filteredSections : cat.sections,
        };
      }
      return null;
    }).filter(Boolean) as MenuCategory[];
  }, [filterQuery]);

  const currentActiveCategory =
    filteredCategories.find((c) => c.id === activeCategoryId) ||
    filteredCategories[0] ||
    CATEGORIES[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-surface-container overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-surface-container-lowest px-5 sm:px-6 py-3.5 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <span className="material-symbols-outlined text-2xl">apps</span>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-mono text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>Automotriz Nor Celis</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Mega Menú Integral</span>
              </div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-primary">
                Explora el Catálogo, Marcas Oficiales &amp; Soluciones
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live In-Menu Filter Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filtrar secciones o marcas..."
                className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[38px]"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-base">
                search
              </span>
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary text-xs"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Cerrar mega menú"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Quick Critical Actions Shortcut Bar */}
        <div className="bg-surface-container-low px-4 sm:px-6 py-2 border-b border-surface-container flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs font-bold">
          <span className="text-[10px] uppercase font-mono text-outline shrink-0 pr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-secondary">bolt</span>
            Accesos Rápidos:
          </span>
          <button
            onClick={() => handleNav(() => setCurrentView('trade-in'))}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <PlanRetomaIcon size={14} className="text-white" />
            <span>Plan Retoma (Bono S/ 7,500)</span>
          </button>
          <button
            onClick={() => handleNav(() => setCurrentView('financing'))}
            className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[14px]">account_balance</span>
            <span>Simulador de Cuotas</span>
          </button>
          <button
            onClick={() => handleNav(() => setIsGarageModalOpen(true))}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-primary hover:text-white border border-surface-container transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <GarageLiftIcon size={14} />
            <span>Mi Garaje Virtual</span>
          </button>
          <button
            onClick={() => handleNav(() => setIsViewer360Open(true))}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-secondary hover:bg-secondary hover:text-white border border-surface-container transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Showroom360Icon size={14} />
            <span>Showroom 360°</span>
          </button>
          <button
            onClick={() => handleNav(() => setCurrentView('services'))}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-white border border-surface-container transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <WorkshopServiceIcon size={14} />
            <span>Cita de Taller Online</span>
          </button>
          <button
            onClick={() => handleNav(() => setCurrentView('claims'))}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-primary hover:text-white border border-surface-container transition-colors flex items-center gap-1 shrink-0 cursor-pointer ml-auto"
          >
            <span className="material-symbols-outlined text-[14px]">menu_book</span>
            <span>Libro de Reclamaciones</span>
          </button>
        </div>

        {/* Two-Column Body Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[460px]">
          {/* Left Sidebar: Categories Navigation */}
          <div className="w-full md:w-80 bg-surface-container-lowest border-r border-surface-container overflow-y-auto p-2.5 space-y-1 shrink-0">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-xs text-outline">
                No se encontraron categorías para "{filterQuery}"
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isActive = cat.id === currentActiveCategory.id;
                const iconColorClass = isActive ? 'text-secondary-fixed' : 'text-primary';

                const renderCatIcon = () => {
                  switch (cat.id) {
                    case 'vehiculos-2025':
                    case 'seminuevos':
                      return <VehicleIcon size={18} className={iconColorClass} />;
                    case 'mickey-thompson':
                      return <TireOffRoadIcon size={18} className={iconColorClass} />;
                    case 'keko-4x4':
                      return <Equip4x4Icon size={18} className={iconColorClass} />;
                    case 'mobil-lubricantes':
                      return <LubricantOilIcon size={18} className={iconColorClass} />;
                    case 'llumar-seguridad':
                      return <SecurityFilmIcon size={18} className={iconColorClass} />;
                    case 'detailing-3m':
                      return <DetailingPPFIcon size={18} className={iconColorClass} />;
                    case 'trakko-suspension':
                      return <SuspensionHDIcon size={18} className={iconColorClass} />;
                    case 'toyota-oem':
                      return <AutoPartsIcon size={18} className={iconColorClass} />;
                    case 'plan-retoma':
                      return <PlanRetomaIcon size={18} className={iconColorClass} />;
                    case 'taller-servicios':
                      return <WorkshopServiceIcon size={18} className={iconColorClass} />;
                    default:
                      return <MasterCatalogIcon size={18} className={iconColorClass} />;
                  }
                };

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                    className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-left transition-all cursor-pointer min-h-[46px] ${
                      isActive
                        ? 'bg-primary text-white font-bold shadow-md shadow-primary/10 ring-1 ring-primary'
                        : 'text-on-surface hover:bg-surface-container-low hover:text-primary font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <div className="shrink-0 flex items-center justify-center">
                        {renderCatIcon()}
                      </div>
                      <span className="text-xs sm:text-sm truncate">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {cat.badge && (
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${cat.badge.bg}`}>
                          {cat.badge.text}
                        </span>
                      )}
                      <span className={`material-symbols-outlined text-base ${isActive ? 'text-white' : 'text-outline'}`}>
                        chevron_right
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Main Pane: Dynamic Category Content */}
          <div className="flex-1 bg-surface-container-lowest overflow-y-auto p-4 sm:p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Category Top Banner */}
              <div className={`${currentActiveCategory.bannerBg} text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      {currentActiveCategory.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-base sm:text-lg text-white">
                      {currentActiveCategory.bannerTitle}
                    </h3>
                    <p className="text-xs text-white/90 font-medium mt-0.5">
                      {currentActiveCategory.bannerSubtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={currentActiveCategory.viewAllAction}
                  className="bg-white text-primary hover:bg-white/90 text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer min-h-[38px]"
                >
                  <span>Explorar sección</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Subcategories Grid (4 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {currentActiveCategory.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2.5 bg-surface-container-lowest/70 p-3 rounded-2xl border border-surface-container-low hover:border-surface-container transition-colors">
                    <h4 className="font-headline font-bold text-xs sm:text-sm text-primary pb-1.5 border-b border-surface-container flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                      <span className="line-clamp-1">{section.title}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <button
                            onClick={item.action}
                            className="w-full text-left text-on-surface-variant hover:text-primary hover:translate-x-1 transition-all py-1 font-medium flex items-center justify-between gap-1 group cursor-pointer"
                          >
                            <span className="group-hover:font-semibold transition-all line-clamp-1 text-[11px] sm:text-xs">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] bg-secondary-fixed text-primary px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Brands Bottom Strip */}
            {currentActiveCategory.featuredBrands && currentActiveCategory.featuredBrands.length > 0 && (
              <div className="pt-3 border-t border-surface-container">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">verified</span>
                    Accesos Directos y Marcas en {currentActiveCategory.name}:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {currentActiveCategory.featuredBrands.map((brand, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={brand.action}
                      className="px-3 py-1 rounded-xl bg-surface-container-low hover:bg-primary hover:text-white text-on-surface text-[11px] sm:text-xs font-bold border border-surface-container transition-all cursor-pointer shadow-2xs"
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
