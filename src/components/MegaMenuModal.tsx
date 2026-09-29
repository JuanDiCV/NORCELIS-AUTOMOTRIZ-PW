import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ViewMode } from '../types';
import { SITE_CONFIG } from '../config/siteConfig';
import {
  AutoPartsIcon,
  VehicleIcon,
  WorkshopServiceIcon,
  PlanRetomaIcon,
  MasterCatalogIcon,
  TireOffRoadIcon,
  Equip4x4Icon,
  LubricantOilIcon,
  DetailingPPFIcon,
  SuspensionHDIcon,
  BrakeDiscIcon,
  AppleIconBadge,
  AppleSearchIcon,
  AppleCloseIcon,
  AppleChevronRightIcon,
  AppleUserIcon,
} from './AutoIcons';

interface MegaMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubCategoryItem {
  name: string;
  query?: string;
  category?: string;
  brand?: string;
  view?: ViewMode;
  sku?: string;
  vehicleId?: string;
}

interface SubCategoryBlock {
  title: string;
  seeAllQuery?: { category?: string; brand?: string; query?: string; view?: ViewMode };
  items: SubCategoryItem[];
}

interface Department {
  id: string;
  name: string;
  iconName: string;
  bannerTitle: string;
  bannerSubtitle: string;
  grid: SubCategoryBlock[];
  quickBrands?: { name: string; category?: string; brand?: string }[];
}

export const MegaMenuModal: React.FC<MegaMenuModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    setCurrentView,
    navigateToPartsCatalog,
    showToast,
    setSelectedPartSku,
    setSelectedVehicleId,
    setCatalogCategoryFilter,
    setCatalogBrandFilter,
    setCatalogSearchQuery,
  } = useApp();

  const [activeDeptId, setActiveDeptId] = useState<string>('automotriz');
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (item: SubCategoryItem) => {
    if (item.vehicleId) {
      setSelectedVehicleId(item.vehicleId);
      setCurrentView('vehicle-pdp');
      showToast(`Cargando ficha técnica de ${item.name}`);
    } else if (item.sku) {
      if (item.category !== undefined) setCatalogCategoryFilter(item.category);
      if (item.brand !== undefined) setCatalogBrandFilter(item.brand);
      setCatalogSearchQuery('');
      setSelectedPartSku(item.sku);
      setCurrentView('parts');
      showToast(`Destacando "${item.name}" en el catálogo`);
    } else if (item.view) {
      setCurrentView(item.view);
    } else {
      navigateToPartsCatalog(
        item.category || 'todos',
        item.brand || 'todos',
        item.query || ''
      );
    }
    onClose();
  };

  const handleSeeAll = (seeAll?: { category?: string; brand?: string; query?: string; view?: ViewMode }) => {
    if (!seeAll) {
      navigateToPartsCatalog('todos', 'todos', '');
    } else if (seeAll.view) {
      setCurrentView(seeAll.view);
    } else {
      navigateToPartsCatalog(
        seeAll.category || 'todos',
        seeAll.brand || 'todos',
        seeAll.query || ''
      );
    }
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuSearchQuery.trim()) {
      showToast('Ingresa un término de búsqueda');
      return;
    }
    navigateToPartsCatalog('todos', 'todos', menuSearchQuery.trim());
    onClose();
  };

  // Departamentos estructurados con el diseño exacto de Falabella en "Automotriz"
  const DEPARTMENTS: Department[] = [
    {
      id: 'automotriz',
      name: 'Automotriz',
      iconName: 'settings',
      bannerTitle: 'Automotriz',
      bannerSubtitle: 'Repuestos, Llantas, Detailing, Accesorios y Mantenimiento Nor Celis',
      quickBrands: [
        { name: 'Mickey Thompson', brand: 'Mickey Thompson', category: 'llantas' },
        { name: 'KEKO 4x4', brand: 'KEKO', category: 'accesorios4x4' },
        { name: 'Mobil 1', brand: 'Mobil', category: 'lubricantes' },
        { name: 'LLumar', brand: 'LLumar', category: 'seguridad' },
        { name: 'Black Rhino', brand: 'BLACK RHINO', category: 'llantas' },
        { name: '3M Auto', brand: '3M', category: 'detailing' },
        { name: 'Brembo', brand: 'Brembo', category: 'frenos' },
        { name: 'Toyota OEM', brand: 'TOYOTA Genuino', category: 'todos' },
      ],
      grid: [
        // Fila 1
        {
          title: 'Audio y video',
          seeAllQuery: { category: 'audio', query: '' },
          items: [
            { name: 'Autoradios', query: 'autoradio', category: 'audio', sku: 'PIO-DMH-8550' },
            { name: 'Cámaras', query: 'camara', category: 'seguridad', sku: 'CAM-SNY-1080' },
            { name: 'Manos libres', query: 'manos libres', category: 'audio', sku: 'BT-HF-PD30' },
            { name: 'Parlantes', query: 'parlante', category: 'audio', sku: 'JBL-STG-624' },
          ],
        },
        {
          title: 'Llantas y Aros',
          seeAllQuery: { category: 'llantas' },
          items: [
            { name: 'Accesorios', query: 'tuercas seguridad', category: 'llantas', sku: 'SEC-NUT-M12' },
            { name: 'Aros', query: 'aro black rhino', category: 'llantas', brand: 'BLACK RHINO', sku: 'BR-ARM-1795' },
            { name: 'Compresores', query: 'compresor', category: 'herramientas', sku: 'CMP-HD-150' },
            { name: 'Llantas', category: 'llantas', brand: 'Mickey Thompson', sku: 'MT-BOSS-265' },
          ],
        },
        {
          title: 'Accesorios de exterior',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Cubreautos', query: 'cubreauto', category: 'accesorios4x4', sku: 'CVR-TRIC-SUV' },
            { name: 'Otros accesorios exteriores', query: 'deflector', category: 'accesorios4x4', sku: 'DEF-EGR-HLX' },
            { name: 'Portaequipajes', query: 'barras techo', category: 'accesorios4x4', sku: 'BAR-AERO-ALU' },
            { name: 'Portabicicletas', query: 'portabicicletas', category: 'accesorios4x4', sku: 'BIK-RCK-3P' },
            { name: 'Amarres', query: 'eslinga cinetica', category: 'accesorios4x4', sku: 'REC-SLG-12T' },
          ],
        },
        {
          title: 'Repuestos y Autopartes',
          seeAllQuery: { category: 'motor' },
          items: [
            { name: 'Baterías', category: 'baterias', sku: 'BOS-S5-70' },
            { name: 'Cargadores', query: 'cargador bateria', category: 'baterias', sku: 'CHG-BAT-10A' },
            { name: 'Focos', query: 'foco led', category: 'iluminacion', sku: 'PHL-LED-H411' },
            { name: 'Plumillas', query: 'plumilla', category: 'filtros', sku: 'BSH-AERO-2616' },
            { name: 'Otros repuestos', query: 'bujias', category: 'motor', sku: 'NGK-LFR-04' },
          ],
        },

        // Fila 2
        {
          title: 'Limpieza y Detailing',
          seeAllQuery: { category: 'detailing' },
          items: [
            { name: 'Aromatizantes', query: 'aromatizante', category: 'detailing', sku: 'CAL-SCN-CHR' },
            { name: 'Brillo', query: 'cera rapida', category: 'detailing', sku: '3M-QCK-WAX' },
            { name: 'Hidrolavadoras', query: 'hidrolavadora', category: 'herramientas', sku: 'KRC-HYD-K2C' },
            { name: 'Lavado de carrocería', query: 'shampoo', category: 'detailing', sku: 'MEG-GLD-189' },
            { name: 'Lavado de llantas', query: 'desengrasante', category: 'detailing', sku: 'SNX-BST-100' },
            { name: 'Lavado de vidrios', query: 'rain-x', category: 'detailing', sku: 'RNX-GLS-500' },
            { name: 'Limpieza interior', query: 'limpiador interior', category: 'detailing', sku: '3M-QCK-WAX' },
            { name: 'Paños', query: 'microfibra', category: 'detailing', sku: 'MCF-EDG-450' },
          ],
        },
        {
          title: 'Accesorios de interior',
          seeAllQuery: { category: 'interior' },
          items: [
            { name: 'Cortinas', query: 'parasol', category: 'interior', sku: 'SOL-RET-SIL' },
            { name: 'Cubreasientos', query: 'fundas asiento', category: 'interior', sku: 'FND-ASNT-TC' },
            { name: 'Cubrevolantes', query: 'cubrevolante', category: 'interior', sku: 'VOL-ERG-RED' },
            { name: 'Pisos', query: 'pisos termoformados', category: 'interior', sku: 'MAT-3D-HLX' },
            { name: 'Organizadores', query: 'organizador', category: 'interior', sku: 'ORG-MLT-60L' },
            { name: 'Accesorios de celular', query: 'soporte celular', category: 'interior', sku: 'MAG-CHG-15W' },
            { name: 'Otros accesorios', query: 'interior', category: 'interior', sku: 'ORG-MLT-60L' },
          ],
        },
        {
          title: 'Motos y accesorios',
          seeAllQuery: { category: 'motos' },
          items: [
            { name: 'Motos', query: 'moto', category: 'motos', sku: 'MOT-HND-190' },
            { name: 'Cascos', query: 'casco integral', category: 'motos', sku: 'CSK-INT-ECE' },
            { name: 'Guantes', query: 'guantes moto', category: 'motos', sku: 'GNT-CRB-TC' },
            { name: 'Accesorios', query: 'soporte celular moto', category: 'motos', sku: 'SOP-MOT-ALU' },
            { name: 'Protectores', query: 'sliders moto', category: 'motos', sku: 'SLD-MOT-CNC' },
          ],
        },
        {
          title: 'Herramientas y equipos mecánicos',
          seeAllQuery: { category: 'herramientas' },
          items: [
            { name: 'Galoneras', query: 'galonera jerry can', category: 'herramientas', sku: 'JRY-CAN-20L' },
            { name: 'Gatas', query: 'gata hidraulica', category: 'herramientas', sku: 'GAT-HYD-3TN' },
            { name: 'Herramientas manuales', query: 'maletin herramientas', category: 'herramientas', sku: 'MAL-HRR-150' },
            { name: 'Herramientas neumáticas', query: 'pistola impacto', category: 'herramientas', sku: 'IMP-PST-850' },
            { name: 'Scanners', query: 'scanner launch', category: 'herramientas', sku: 'OBD-LNC-THK' },
          ],
        },

        // Fila 3
        {
          title: 'Baterías y Accesorios',
          seeAllQuery: { category: 'baterias' },
          items: [
            { name: 'Accesorios', query: 'cables pasacorriente', category: 'baterias', sku: 'CBL-PAS-1000' },
            { name: 'Baterías', query: 'bateria bosch', category: 'baterias', sku: 'BOS-S5-70' },
          ],
        },
        {
          title: 'Líquidos y lubricantes',
          seeAllQuery: { category: 'lubricantes' },
          items: [
            { name: 'Aceites', category: 'lubricantes', brand: 'Mobil', sku: 'MOB-ESP-5W30' },
            { name: 'Líquidos de Frenos DOT 4 / 5.1', query: 'frenos', category: 'frenos', sku: 'BRM-DOT4-500' },
            { name: 'Aditivos', query: 'aditivo', category: 'lubricantes', sku: 'LIQ-INJ-500' },
            { name: 'Anticorrosivos', query: 'anticorrosivo', category: 'lubricantes', sku: 'WD4-SPEC-400' },
            { name: 'Refrigerantes', query: 'refrigerante', category: 'lubricantes', sku: 'TOY-LLC-5050' },
          ],
        },
        {
          title: 'Seguridad',
          seeAllQuery: { category: 'seguridad' },
          items: [
            { name: 'Antirrobos', query: 'traba volante pedal', category: 'seguridad', sku: 'TRB-PED-SEC' },
            { name: 'Alarmas', query: 'alarma sensor', category: 'seguridad', sku: 'ALM-VIP-570' },
            { name: 'Botiquines', query: 'botiquin extintor', category: 'seguridad', sku: 'BOT-EXT-MTC' },
            { name: 'Seguro vehicular', view: 'financing' },
          ],
        },
        {
          title: 'Equipamiento 4x4 & Servicios',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Barras antivuelco KEKO', brand: 'KEKO', category: 'accesorios4x4', sku: 'KKO-BAR-K3' },
            { name: 'Tapas retráctiles de tolva', brand: 'KEKO', category: 'accesorios4x4', sku: 'KKO-ROL-ALU' },
            { name: 'Mantenimiento Preventivo Taller', view: 'services' },
            { name: 'Alineamiento Láser 3D', view: 'services' },
          ],
        },
      ],
    },
    {
      id: 'repuestos-autopartes',
      name: 'Repuestos y Autopartes',
      iconName: 'build_circle',
      bannerTitle: 'Repuestos y Autopartes Originales OEM',
      bannerSubtitle: 'Componentes certificados para Toyota, Nissan, Ford, Mitsubishi e Isuzu',
      quickBrands: [
        { name: 'Toyota OEM', brand: 'TOYOTA Genuino' },
        { name: 'Brembo', brand: 'Brembo' },
        { name: 'K&N Filtros', brand: 'K&N' },
        { name: 'TRAKKO® HD', brand: 'TRAKKO® AUTORUS' },
      ],
      grid: [
        {
          title: 'Frenos y Discos',
          seeAllQuery: { category: 'frenos' },
          items: [
            { name: 'Pastillas de freno cerámicas', category: 'frenos', brand: 'Brembo Official', sku: 'TOY-BRK-04465' },
            { name: 'Discos de freno ranurados / ventilados', category: 'frenos', sku: 'AIS-RT-42' },
            { name: 'Zapatas y tambores traseros', category: 'frenos', sku: 'BRM-ZAP-42' },
            { name: 'Líquido de frenos Brembo DOT 4', category: 'frenos', brand: 'Brembo Official', sku: 'BRM-DOT4-500' },
            { name: 'Líquido de frenos Racing DOT 5.1', category: 'frenos', brand: 'Brembo Official', sku: 'BRM-DOT51-500' },
          ],
        },
        {
          title: 'Suspensión y Dirección',
          seeAllQuery: { category: 'suspension' },
          items: [
            { name: 'Amortiguadores Heavy-Duty +2"', category: 'suspension', brand: 'TRAKKO® AUTORUS', sku: 'TRK-SHK-R02' },
            { name: 'Resortes reforzados y ballestas', category: 'suspension', sku: 'TRK-RES-HD2' },
            { name: 'Rótulas, terminales y bieletas', category: 'suspension', sku: '555-ROT-DIR' },
            { name: 'Bujes de poliuretano', category: 'suspension', sku: 'PU-BUJ-MIN' },
          ],
        },
        {
          title: 'Filtros y Afinamiento',
          seeAllQuery: { category: 'filtros' },
          items: [
            { name: 'Filtros de aceite OEM', category: 'filtros', brand: 'TOYOTA Genuino', sku: 'TOY-FLT-04152' },
            { name: 'Filtros de aire lavables de alto flujo', category: 'filtros', brand: 'K&N', sku: 'KN-FLT-3324' },
            { name: 'Filtros de combustible diesel racor', category: 'filtros', sku: 'DNS-FLT-RAC' },
            { name: 'Filtros de cabina antipolen', category: 'filtros', sku: 'TOY-CAB-CARB' },
          ],
        },
        {
          title: 'Encendido y Eléctrico',
          seeAllQuery: { category: 'baterias' },
          items: [
            { name: 'Baterías AGM Start-Stop 12V', category: 'baterias', sku: 'BOS-S5-70' },
            { name: 'Alternadores y arrancadores', category: 'motor', sku: 'DNS-ALT-130A' },
            { name: 'Bujías de iridio / precalentadores', category: 'motor', sku: 'TOY-SPK-90919' },
            { name: 'Fusibles y relés automotrices', category: 'motor', sku: 'LIT-FUS-120P' },
          ],
        },
      ],
    },
    {
      id: 'equipamiento-4x4',
      name: 'Equipamiento 4x4 & Off-Road',
      iconName: 'terrain',
      bannerTitle: 'Equipamiento 4x4 & Accesorios Off-Road',
      bannerSubtitle: 'Protección perimetral, capacidad de carga, rescate y expedición extrema',
      quickBrands: [
        { name: 'KEKO 4x4', brand: 'KEKO' },
        { name: 'TRAKKO® Suspensiones', brand: 'TRAKKO® AUTORUS' },
        { name: 'Black Rhino Wheels', brand: 'BLACK RHINO' },
      ],
      grid: [
        {
          title: 'Protección de Tolva',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Barras antivuelco KEKO K3', category: 'accesorios4x4', brand: 'KEKO', sku: 'KKO-BAR-K3' },
            { name: 'Tapas retráctiles de aluminio Roll Cover', category: 'accesorios4x4', brand: 'KEKO', sku: 'KKO-ROL-ALU' },
            { name: 'Lonas marítimas con cierre rápido', category: 'accesorios4x4', sku: 'KKO-LON-GRX' },
            { name: 'Protectores de tolva Bedliner', category: 'accesorios4x4', sku: 'BED-LIN-HLX' },
          ],
        },
        {
          title: 'Acceso y Protección Inferior',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Estribos laterales tubulares', category: 'accesorios4x4', brand: 'KEKO', sku: 'KKO-EST-TUB' },
            { name: 'Placas de protección de cárter (Skid Plates)', category: 'accesorios4x4', sku: 'SKD-PLT-6MM' },
            { name: 'Defensas delanteras Bull Bar', category: 'accesorios4x4', sku: 'BUL-BAR-FOR' },
            { name: 'Enganches y tiros de remolque', category: 'accesorios4x4', sku: 'ENG-TIR-350' },
          ],
        },
        {
          title: 'Rescate y Expedición',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Snorkels Safari sellados', category: 'accesorios4x4', sku: 'SNK-SAF-HLX' },
            { name: 'Winches de recuperación 12,000 lbs', category: 'accesorios4x4', sku: 'WNC-12K-PLS' },
            { name: 'Planchas de desatasco Maxtrax', category: 'accesorios4x4', sku: 'MAX-TRX-MK2' },
            { name: 'Compresores de aire On-Board', category: 'herramientas', sku: 'CMP-HD-150' },
          ],
        },
        {
          title: 'Iluminación Off-Road',
          seeAllQuery: { category: 'iluminacion' },
          items: [
            { name: 'Barras LED curvas de alta potencia', category: 'iluminacion', sku: 'HY-LED-180W' },
            { name: 'Faros neblineros de profundidad', category: 'iluminacion', sku: 'HLL-LMP-500' },
            { name: 'Luces de trabajo traseras y roca', category: 'iluminacion', sku: 'BAJ-RCK-4P' },
            { name: 'Soportes de montaje en techo', category: 'accesorios4x4', sku: 'BAR-AERO-ALU' },
          ],
        },
      ],
    },
    {
      id: 'llantas-aros',
      name: 'Llantas y Aros',
      iconName: 'tire_repair',
      bannerTitle: 'Llantas y Aros de Alta Performance',
      bannerSubtitle: 'All-Terrain, Mud-Terrain y Aros de aleación para caminos andinos y mineros',
      quickBrands: [
        { name: 'Mickey Thompson Baja Boss', brand: 'Mickey Thompson' },
        { name: 'Black Rhino Wheels', brand: 'BLACK RHINO' },
      ],
      grid: [
        {
          title: 'Llantas por Tipo de Terreno',
          seeAllQuery: { category: 'llantas' },
          items: [
            { name: 'All-Terrain (A/T) - Mixtas 50/50', category: 'llantas', brand: 'Mickey Thompson', sku: 'MT-BOSS-265' },
            { name: 'Mud-Terrain (M/T) - Barro y Rocas', category: 'llantas', brand: 'Mickey Thompson', sku: 'MT-LEGEND-285' },
            { name: 'Rugged Terrain (R/T) - Híbridas', category: 'llantas', brand: 'Mickey Thompson', sku: 'MT-RTX-275' },
            { name: 'Highway Terrain (H/T) - Carretera', category: 'llantas', sku: 'TRI-TR928-17' },
          ],
        },
        {
          title: 'Aros de Aleación Off-Road',
          seeAllQuery: { category: 'llantas' },
          items: [
            { name: 'Aros Black Rhino R17"', category: 'llantas', brand: 'BLACK RHINO', sku: 'BR-BOX-1780' },
            { name: 'Aros Black Rhino R18" / R20"', category: 'llantas', brand: 'BLACK RHINO', sku: 'BR-ARM-1890' },
            { name: 'Aros Beadlock simulados', category: 'llantas', brand: 'BLACK RHINO', sku: 'BR-ARM-1795' },
            { name: 'Tuercas de seguridad antirrobo', category: 'llantas', sku: 'SEC-NUT-M12' },
          ],
        },
        {
          title: 'Accesorios y Calibración',
          seeAllQuery: { category: 'herramientas' },
          items: [
            { name: 'Medidores de presión digital', category: 'herramientas', sku: 'ARB-MED-DIG' },
            { name: 'Desinfladores rápidos de neumáticos', category: 'herramientas', sku: 'DES-RAP-ARB' },
            { name: 'Kits de reparación de pinchazos', category: 'herramientas', sku: 'KIT-PIN-HD' },
            { name: 'Espaciadores de rueda certificados', category: 'llantas', sku: 'ESP-RUE-15' },
          ],
        },
        {
          title: 'Servicios en Taller',
          seeAllQuery: { view: 'services' },
          items: [
            { name: 'Enllantado y montaje profesional', view: 'services' },
            { name: 'Balanceo dinámico computarizado', view: 'services' },
            { name: 'Alineamiento láser tridimensional', view: 'services' },
            { name: 'Rotación y calibración con nitrógeno', view: 'services' },
          ],
        },
      ],
    },
    {
      id: 'limpieza-detailing',
      name: 'Limpieza y Detailing',
      iconName: 'cleaning_services',
      bannerTitle: 'Estética Automotriz, Detailing & PPF',
      bannerSubtitle: 'Protección cerámica 9H, corrección de barniz y car care profesional',
      quickBrands: [
        { name: '3M Auto Detailing', brand: '3M' },
        { name: 'LLumar Láminas', brand: 'LLumar' },
      ],
      grid: [
        {
          title: 'Lavado y Descontaminación',
          seeAllQuery: { category: 'detailing' },
          items: [
            { name: 'Shampoo pH Neutro con cera', category: 'detailing', sku: 'MEG-GLD-189' },
            { name: 'Descontaminante férrico de aros', category: 'detailing', sku: 'IRN-X-500' },
            { name: 'Barras de arcilla (Clay Bar)', category: 'detailing', sku: '3M-CLY-BAR' },
            { name: 'Lanza de espuma Snow Foam', category: 'herramientas', sku: 'SNO-FOM-LNC' },
          ],
        },
        {
          title: 'Pulido y Protección Cerámica',
          seeAllQuery: { category: 'detailing' },
          items: [
            { name: 'Sellador Cerámico 3M 9H', category: 'detailing', brand: '3M', sku: '3M-CER-9HKT' },
            { name: 'Compuestos pulidores de corte y acabado', category: 'detailing', sku: '3M-RUB-946' },
            { name: 'Pads de pulido de espuma y lana', category: 'detailing', sku: 'PAD-POL-5IN' },
            { name: 'Ceras en pasta carnauba premium', category: 'detailing', sku: '3M-QCK-WAX' },
          ],
        },
        {
          title: 'Cuidado Interior y Cueros',
          seeAllQuery: { category: 'detailing' },
          items: [
            { name: 'Acondicionador de cuero mate', category: 'detailing', sku: '3M-LTH-COND' },
            { name: 'Limpiador de plásticos y tablero UV', category: 'detailing', sku: '3M-QCK-WAX' },
            { name: 'Limpiador de tapices y alfombras', category: 'detailing', sku: 'SON-APC-500' },
            { name: 'Desinfectante antibacteriano de ozono', category: 'detailing', sku: 'OZO-GEN-12V' },
          ],
        },
        {
          title: 'Láminas y PPF',
          seeAllQuery: { category: 'seguridad' },
          items: [
            { name: 'Láminas de seguridad nanocerámica LLumar', category: 'seguridad', brand: 'LLumar', sku: 'LLM-SEC-12MIL' },
            { name: 'Film de protección de pintura PPF 3M', category: 'detailing', brand: '3M', sku: '3M-PPF-PRO' },
            { name: 'Polarizado con permiso PNP', view: 'services' },
            { name: 'Restauración de faros opacos', view: 'services' },
          ],
        },
      ],
    },
    {
      id: 'taller-servicios',
      name: 'Servicios de Taller & Detailing',
      iconName: 'car_repair',
      bannerTitle: 'Taller Mecánico Multimarca & Citas Online',
      bannerSubtitle: 'Mantenimiento preventivo oficial, alineamiento 3D y garantía de servicio',
      grid: [
        {
          title: 'Mantenimiento Preventivo',
          seeAllQuery: { view: 'services' },
          items: [
            { name: 'Mantenimiento 10,000 km (Aceite + Filtros)', view: 'services' },
            { name: 'Mantenimiento 20,000 km (Frenos + Afinamiento)', view: 'services' },
            { name: 'Mantenimiento Mayor 40,000 km (Fluidos completos)', view: 'services' },
            { name: 'Inspección de 25 Puntos de Seguridad', view: 'services' },
          ],
        },
        {
          title: 'Frenos y Dirección',
          seeAllQuery: { view: 'services' },
          items: [
            { name: 'Rectificado de discos de freno', view: 'services' },
            { name: 'Cambio de pastillas y purga de frenos', view: 'services' },
            { name: 'Alineamiento láser tridimensional 3D', view: 'services' },
            { name: 'Balanceo dinámico de ruedas', view: 'services' },
          ],
        },
        {
          title: 'Diagnóstico y Electrónica',
          seeAllQuery: { view: 'services' },
          items: [
            { name: 'Escaneo computarizado OBD2 multimarca', view: 'services' },
            { name: 'Diagnóstico de inyección y sensores', view: 'services' },
            { name: 'Prueba de carga y salud de batería', view: 'services' },
            { name: 'Recarga y desinfección de aire acondicionado', view: 'services' },
          ],
        },
        {
          title: 'Instalación y Retoma',
          seeAllQuery: { view: 'trade-in' },
          items: [
            { name: 'Instalación de accesorios 4x4 y suspensiones', view: 'services' },
            { name: 'Instalación de láminas de seguridad LLumar', view: 'services' },
            { name: 'Tasación presencial para Plan Retoma', view: 'trade-in' },
            { name: 'Peritaje técnico para compraventa', view: 'trade-in' },
          ],
        },
      ],
    },
    {
      id: 'vehiculos-catalogo',
      name: 'Vehículos 0 KM & Seminuevos',
      iconName: 'directions_car',
      bannerTitle: 'Catálogo de Vehículos 0 KM y Seminuevos',
      bannerSubtitle: 'Pickups, SUVs 4x4, híbridos y seminuevos certificados con garantía',
      grid: [
        {
          title: 'Pickups 4x4',
          seeAllQuery: { view: 'cars' },
          items: [
            { name: 'Toyota Hilux 2025 4x4 D-Cab', vehicleId: 'veh-hilux-2020', view: 'cars' },
            { name: 'Nissan Frontier PRO-4X', vehicleId: 'veh-frontier-2025', view: 'cars' },
            { name: 'Ford Ranger XLT / Wildtrak', view: 'cars' },
            { name: 'Mitsubishi L200 Triton', view: 'cars' },
          ],
        },
        {
          title: 'SUVs y Crossovers',
          seeAllQuery: { view: 'cars' },
          items: [
            { name: 'Toyota Land Cruiser Prado', view: 'cars' },
            { name: 'Toyota RAV4 Híbrida', vehicleId: 'veh-rav4-2025', view: 'cars' },
            { name: 'Nissan X-Trail e-POWER', view: 'cars' },
            { name: 'Ford Explorer 4WD', view: 'cars' },
          ],
        },
        {
          title: 'Seminuevos Certificados',
          seeAllQuery: { view: 'cars' },
          items: [
            { name: 'Seminuevos con inspección de 150 puntos', view: 'cars' },
            { name: 'Garantía mecánica de 1 año', view: 'cars' },
            { name: 'Historial de kilometraje verificado', view: 'cars' },
            { name: 'Transferencia notarial incluida', view: 'cars' },
          ],
        },
        {
          title: 'Herramientas de Compra',
          seeAllQuery: { view: 'financing' },
          items: [
            { name: 'Simulador de Crédito Vehicular', view: 'financing' },
            { name: 'Cotizar Tasación Plan Retoma (+S/ 7,500)', view: 'trade-in' },
            { name: 'Agendar Test Drive Presencial', view: 'cars' },
            { name: 'Showroom Virtual 360°', view: 'cars' },
          ],
        },
      ],
    },
  ];

  const currentDept =
    DEPARTMENTS.find((d) => d.id === activeDeptId) || DEPARTMENTS[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#212955]/70 backdrop-blur-xs flex flex-col justify-start items-start overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Target Container: Strictly aligned to the left edge of the screen, 0 margins, full required width */}
      <div
        className="w-full max-w-[1440px] xl:max-w-[1520px] 2xl:max-w-[1640px] m-0 p-0 ml-0 mr-auto flex flex-col items-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar: Flush to the left, #FFFFFF background, #9D9D9C borders, #F07F00 accents, #212955 text */}
        <div className="w-full bg-[#FFFFFF] border-b border-r border-[#9D9D9C] border-l-0 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
          {/* User Welcome Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#212955] text-[#FFFFFF] flex items-center justify-center font-bold text-xs shadow-xs border-2 border-[#F07F00]">
              <AppleUserIcon size={18} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#212955]">
                ¡Hola, {user?.name || 'Juan Diego'}!
              </div>
              <div className="text-[11px] text-[#9D9D9C] hidden sm:block">
                Explora el catálogo oficial de Nor Celis
              </div>
            </div>
          </div>

          {/* Central Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl relative"
          >
            <input
              type="text"
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              placeholder="Buscar en Nor Celis Automotriz / Repuestos, Marcas..."
              className="w-full bg-[#FFFFFF] border border-[#9D9D9C] rounded-full pl-10 pr-10 py-2 text-xs sm:text-sm text-[#212955] placeholder:text-[#9D9D9C] focus:outline-none focus:border-[#F07F00] focus:ring-1 focus:ring-[#F07F00] transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9D9D9C] pointer-events-none">
              <AppleSearchIcon size={18} />
            </div>
            {menuSearchQuery && (
              <button
                type="button"
                onClick={() => setMenuSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9D9D9C] hover:text-[#212955] cursor-pointer"
              >
                <AppleCloseIcon size={16} />
              </button>
            )}
          </form>

          {/* Corporate Close Button: X Menú */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-[#212955] hover:bg-[#1a2145] text-[#FFFFFF] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 border border-[#F07F00] group"
            title="Cerrar menú"
          >
            <span className="text-sm font-black text-[#F07F00] group-hover:rotate-90 transition-transform">✕</span>
            <span>Menú</span>
          </button>
        </div>

        {/* Main Mega Menu Card (Left Departments List + Right Multi-Column Grid) */}
        <div className="w-full bg-[#FFFFFF] border-r border-b border-[#9D9D9C] border-l-0 shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[580px] max-h-[82vh]">
          {/* Left Vertical Category List */}
          <div className="w-full md:w-72 lg:w-80 bg-[#FFFFFF] border-r border-[#9D9D9C] overflow-y-auto shrink-0 py-2">
            <div className="px-4 py-2 text-[11px] font-extrabold text-[#9D9D9C] uppercase tracking-wider">
              Departamentos
            </div>
            <div className="space-y-0.5">
              {DEPARTMENTS.map((dept) => {
                const isActive = dept.id === currentDept.id;
                const getDepartmentIcon = (id: string) => {
                  switch (id) {
                    case 'automotriz':
                      return AutoPartsIcon;
                    case 'repuestos-autopartes':
                      return BrakeDiscIcon;
                    case 'equipamiento-4x4':
                      return Equip4x4Icon;
                    case 'llantas-aros':
                      return TireOffRoadIcon;
                    case 'limpieza-detailing':
                      return DetailingPPFIcon;
                    case 'taller-servicios':
                      return WorkshopServiceIcon;
                    case 'vehiculos-catalogo':
                      return VehicleIcon;
                    default:
                      return MasterCatalogIcon;
                  }
                };
                const DeptIcon = getDepartmentIcon(dept.id);
                return (
                  <button
                    key={dept.id}
                    onClick={() => setActiveDeptId(dept.id)}
                    onMouseEnter={() => setActiveDeptId(dept.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer text-xs sm:text-sm group ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#F07F00] font-bold border-l-4 border-[#F07F00] shadow-2xs'
                        : 'text-[#212955] hover:bg-[#FFFFFF] hover:text-[#F07F00] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <AppleIconBadge
                        variant={isActive ? 'primary' : 'subtle-blue'}
                        size="xs"
                        className={isActive ? '' : 'opacity-80 group-hover:opacity-100'}
                      >
                        <DeptIcon size={14} className={isActive ? 'text-white' : 'text-[#212955]'} />
                      </AppleIconBadge>
                      <span className="truncate">{dept.name}</span>
                    </div>
                    <AppleChevronRightIcon
                      size={14}
                      className={isActive ? 'text-[#F07F00]' : 'text-[#9D9D9C]'}
                    />
                  </button>
                );
              })}
            </div>

            {/* Direct Shortcuts at bottom of list */}
            <div className="mt-4 pt-3 border-t border-[#9D9D9C] px-3 space-y-1">
              <button
                onClick={() => {
                  setCurrentView('trade-in');
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-[#212955] bg-[#FFFFFF] hover:bg-[#F07F00]/10 border border-[#F07F00] transition-colors text-left cursor-pointer"
              >
                <PlanRetomaIcon size={16} className="text-[#F07F00]" />
                <span>Plan Retoma (+S/ 7.5K)</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('services');
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-[#212955] bg-[#FFFFFF] hover:bg-[#212955]/10 border border-[#9D9D9C] transition-colors text-left cursor-pointer"
              >
                <WorkshopServiceIcon size={16} className="text-[#212955]" />
                <span>Cita de Taller Online</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Pane */}
          <div className="flex-1 bg-[#FFFFFF] flex flex-col overflow-y-auto">
            {/* Corporate Orange Header Bar */}
            <div className="bg-[#F07F00] text-[#FFFFFF] px-6 py-3.5 flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2.5">
                {(() => {
                  const getBannerDeptIcon = (id: string) => {
                    switch (id) {
                      case 'automotriz':
                        return AutoPartsIcon;
                      case 'repuestos-autopartes':
                        return BrakeDiscIcon;
                      case 'equipamiento-4x4':
                        return Equip4x4Icon;
                      case 'llantas-aros':
                        return TireOffRoadIcon;
                      case 'limpieza-detailing':
                        return DetailingPPFIcon;
                      case 'taller-servicios':
                        return WorkshopServiceIcon;
                      case 'vehiculos-catalogo':
                        return VehicleIcon;
                      default:
                        return MasterCatalogIcon;
                    }
                  };
                  const BannerIcon = getBannerDeptIcon(currentDept.id);
                  return (
                    <AppleIconBadge variant="frosted" size="md">
                      <BannerIcon size={20} className="text-[#F07F00]" />
                    </AppleIconBadge>
                  );
                })()}
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#FFFFFF] tracking-wide">
                    {currentDept.bannerTitle}
                  </h3>
                  <div className="text-[11px] text-[#FFFFFF]/90 font-medium hidden sm:block">
                    {currentDept.bannerSubtitle}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSeeAll()}
                className="text-xs sm:text-sm font-bold text-[#FFFFFF] hover:text-[#FFFFFF]/90 flex items-center gap-1 underline-offset-2 hover:underline cursor-pointer"
              >
                <span>Ver todo</span>
                <AppleChevronRightIcon size={14} />
              </button>
            </div>

            {/* Subcategories Grid: 4 Columns x Multi-Row */}
            <div className="p-6 flex-1 bg-[#FFFFFF]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                {currentDept.grid.map((block, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* Block Title + Ver todo link */}
                    <div className="flex items-center justify-between pb-1 border-b border-[#9D9D9C]">
                      <span className="text-xs font-extrabold text-[#212955] line-clamp-1">
                        {block.title}
                      </span>
                      <button
                        onClick={() => handleSeeAll(block.seeAllQuery)}
                        className="text-[11px] text-[#F07F00] hover:text-[#d47000] font-bold hover:underline hover:scale-105 opacity-90 hover:opacity-100 transition-all duration-200 shrink-0 ml-1 cursor-pointer"
                      >
                        Ver todo
                      </button>
                    </div>

                    {/* Sub-items list */}
                    <ul className="space-y-1 pt-0.5">
                      {block.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <button
                            onClick={() => handleItemClick(item)}
                            className="group/item flex items-center justify-between w-full text-left text-xs text-[#212955] opacity-80 hover:opacity-100 hover:scale-[1.03] hover:translate-x-1 origin-left hover:text-[#F07F00] hover:font-semibold py-1 px-1.5 rounded transition-all duration-200 ease-out cursor-pointer"
                          >
                            <span className="line-clamp-1">{item.name}</span>
                            <AppleChevronRightIcon
                              size={14}
                              className="text-[#F07F00] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 shrink-0"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Brands Strip at Bottom */}
            {currentDept.quickBrands && currentDept.quickBrands.length > 0 && (
              <div className="px-6 py-3 bg-[#FFFFFF] border-t border-[#9D9D9C] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                <span className="text-[#9D9D9C] font-bold text-[11px]">
                  Marcas oficiales en {currentDept.name}:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {currentDept.quickBrands.map((b, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => {
                        navigateToPartsCatalog(b.category || 'todos', b.brand || 'todos');
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#FFFFFF] border border-[#9D9D9C] hover:border-[#F07F00] hover:text-[#F07F00] hover:scale-105 opacity-90 hover:opacity-100 font-bold text-[11px] text-[#212955] transition-all duration-200 shadow-2xs cursor-pointer"
                    >
                      {b.name}
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
