import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ViewMode } from '../types';
import {
  AutoPartsIcon,
  VehicleIcon,
  WorkshopServiceIcon,
  PlanRetomaIcon,
  MasterCatalogIcon,
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

interface SubCategoryItem {
  name: string;
  query?: string;
  category?: string;
  brand?: string;
  view?: ViewMode;
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
    if (item.view) {
      setCurrentView(item.view);
    } else {
      navigateToPartsCatalog(
        item.category || 'todos',
        item.brand || 'todos',
        item.query || item.name
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
          seeAllQuery: { category: 'todos', query: 'audio' },
          items: [
            { name: 'Autoradios', query: 'autoradio', category: 'todos' },
            { name: 'Cámaras', query: 'camara', category: 'seguridad' },
            { name: 'Manos libres', query: 'manos libres', category: 'todos' },
            { name: 'Parlantes', query: 'parlante', category: 'todos' },
          ],
        },
        {
          title: 'Llantas y Aros',
          seeAllQuery: { category: 'llantas' },
          items: [
            { name: 'Accesorios', query: 'accesorio aro', category: 'llantas' },
            { name: 'Aros', query: 'aro', category: 'llantas', brand: 'BLACK RHINO' },
            { name: 'Compresores', query: 'compresor', category: 'herramientas' },
            { name: 'Llantas', category: 'llantas', brand: 'Mickey Thompson' },
          ],
        },
        {
          title: 'Accesorios de exterior',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Cubreautos', query: 'cubreauto', category: 'accesorios4x4' },
            { name: 'Otros accesorios exteriores', query: 'exterior', category: 'accesorios4x4' },
            { name: 'Portaequipajes', query: 'portaequipaje', category: 'accesorios4x4' },
            { name: 'Portabicicletas', query: 'portabicicleta', category: 'accesorios4x4' },
            { name: 'Amarres', query: 'amarre eslinga', category: 'accesorios4x4' },
          ],
        },
        {
          title: 'Repuestos y Autopartes',
          seeAllQuery: { category: 'repuestos' },
          items: [
            { name: 'Baterías', category: 'baterias' },
            { name: 'Cargadores', query: 'cargador bateria', category: 'baterias' },
            { name: 'Focos', query: 'foco led', category: 'iluminacion' },
            { name: 'Plumillas', query: 'plumilla', category: 'repuestos' },
            { name: 'Otros repuestos', category: 'repuestos' },
          ],
        },

        // Fila 2
        {
          title: 'Limpieza y Detailing',
          seeAllQuery: { category: 'detailing' },
          items: [
            { name: 'Aromatizantes', query: 'aromatizante', category: 'detailing' },
            { name: 'Brillo', query: 'brillo cera', category: 'detailing' },
            { name: 'Hidrolavadoras', query: 'hidrolavadora', category: 'herramientas' },
            { name: 'Lavado de carrocería', query: 'shampoo', category: 'detailing' },
            { name: 'Lavado de llantas', query: 'desengrasante llantas', category: 'detailing' },
            { name: 'Lavado de vidrios', query: 'limpiavidrios', category: 'detailing' },
            { name: 'Limpieza interior', query: 'limpiador interior', category: 'detailing' },
            { name: 'Paños', query: 'microfibra pano', category: 'detailing' },
          ],
        },
        {
          title: 'Accesorios de interior',
          seeAllQuery: { category: 'todos', query: 'interior' },
          items: [
            { name: 'Cortinas', query: 'cortina parasol', category: 'todos' },
            { name: 'Cubreasientos', query: 'funda asiento', category: 'todos' },
            { name: 'Cubrevolantes', query: 'cubrevolante', category: 'todos' },
            { name: 'Pisos', query: 'piso termoformado', category: 'todos' },
            { name: 'Organizadores', query: 'organizador maletera', category: 'todos' },
            { name: 'Accesorios de celular', query: 'soporte celular cargador', category: 'todos' },
            { name: 'Otros accesorios', query: 'accesorio interior', category: 'todos' },
          ],
        },
        {
          title: 'Motos y accesorios',
          seeAllQuery: { category: 'todos', query: 'moto' },
          items: [
            { name: 'Motos', query: 'moto', category: 'todos' },
            { name: 'Cascos', query: 'casco', category: 'todos' },
            { name: 'Guantes', query: 'guantes moto', category: 'todos' },
            { name: 'Accesorios', query: 'accesorios moto', category: 'todos' },
            { name: 'Protectores', query: 'protector moto', category: 'todos' },
          ],
        },
        {
          title: 'Herramientas y equipos mecánicos',
          seeAllQuery: { category: 'herramientas' },
          items: [
            { name: 'Galoneras', query: 'galonera bidon', category: 'herramientas' },
            { name: 'Gatas', query: 'gata hidraulica', category: 'herramientas' },
            { name: 'Herramientas manuales', query: 'maletin llaves', category: 'herramientas' },
            { name: 'Herramientas neumáticas', query: 'pistola impacto', category: 'herramientas' },
            { name: 'Scanners', query: 'scanner obd2', category: 'herramientas' },
          ],
        },

        // Fila 3
        {
          title: 'Baterías y Accesorios',
          seeAllQuery: { category: 'baterias' },
          items: [
            { name: 'Accesorios', query: 'bornes cables bateria', category: 'baterias' },
            { name: 'Baterías', query: 'bateria agm 12v', category: 'baterias' },
          ],
        },
        {
          title: 'Líquidos y lubricantes',
          seeAllQuery: { category: 'lubricantes' },
          items: [
            { name: 'Aceites', category: 'lubricantes', brand: 'Mobil' },
            { name: 'Aditivos', query: 'aditivo motor', category: 'lubricantes' },
            { name: 'Anticorrosivos', query: 'anticorrosivo', category: 'lubricantes' },
            { name: 'Refrigerantes', query: 'refrigerante oat', category: 'lubricantes' },
          ],
        },
        {
          title: 'Seguridad',
          seeAllQuery: { category: 'seguridad' },
          items: [
            { name: 'Antirrobos', query: 'traba volante pedal', category: 'seguridad' },
            { name: 'Alarmas', query: 'alarma sensor', category: 'seguridad' },
            { name: 'Botiquines', query: 'botiquin extintor', category: 'seguridad' },
            { name: 'Seguro vehicular', view: 'financing' },
          ],
        },
        {
          title: 'Equipamiento 4x4 & Servicios',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Barras antivuelco KEKO', brand: 'KEKO', category: 'accesorios4x4' },
            { name: 'Tapas retráctiles de tolva', brand: 'KEKO', category: 'accesorios4x4' },
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
            { name: 'Pastillas de freno cerámicas', category: 'frenos', brand: 'Brembo' },
            { name: 'Discos de freno ranurados / ventilados', category: 'frenos' },
            { name: 'Zapatas y tambores traseros', category: 'frenos' },
            { name: 'Líquido de frenos DOT 4 / DOT 5.1', category: 'lubricantes' },
          ],
        },
        {
          title: 'Suspensión y Dirección',
          seeAllQuery: { category: 'suspension' },
          items: [
            { name: 'Amortiguadores Heavy-Duty +2"', category: 'suspension', brand: 'TRAKKO® AUTORUS' },
            { name: 'Resortes reforzados y ballestas', category: 'suspension' },
            { name: 'Rótulas, terminales y bieletas', category: 'suspension' },
            { name: 'Bujes de poliuretano', category: 'suspension' },
          ],
        },
        {
          title: 'Filtros y Afinamiento',
          seeAllQuery: { category: 'filtros' },
          items: [
            { name: 'Filtros de aceite OEM', category: 'filtros', brand: 'TOYOTA Genuino' },
            { name: 'Filtros de aire lavables de alto flujo', category: 'filtros', brand: 'K&N' },
            { name: 'Filtros de combustible diesel racor', category: 'filtros' },
            { name: 'Filtros de cabina antipolen', category: 'filtros' },
          ],
        },
        {
          title: 'Encendido y Eléctrico',
          seeAllQuery: { category: 'baterias' },
          items: [
            { name: 'Baterías AGM Start-Stop 12V', category: 'baterias' },
            { name: 'Alternadores y arrancadores', category: 'repuestos' },
            { name: 'Bujías de iridio / precalentadores', category: 'repuestos' },
            { name: 'Fusibles y relés automotrices', category: 'repuestos' },
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
            { name: 'Barras antivuelco KEKO K3', category: 'accesorios4x4', brand: 'KEKO' },
            { name: 'Tapas retráctiles de aluminio Roll Cover', category: 'accesorios4x4', brand: 'KEKO' },
            { name: 'Lonas marítimas con cierre rápido', category: 'accesorios4x4' },
            { name: 'Protectores de tolva Bedliner', category: 'accesorios4x4' },
          ],
        },
        {
          title: 'Acceso y Protección Inferior',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Estribos laterales tubulares', category: 'accesorios4x4', brand: 'KEKO' },
            { name: 'Placas de protección de cárter (Skid Plates)', category: 'accesorios4x4' },
            { name: 'Defensas delanteras Bull Bar', category: 'accesorios4x4' },
            { name: 'Enganches y tiros de remolque', category: 'accesorios4x4' },
          ],
        },
        {
          title: 'Rescate y Expedición',
          seeAllQuery: { category: 'accesorios4x4' },
          items: [
            { name: 'Snorkels Safari sellados', category: 'accesorios4x4' },
            { name: 'Winches de recuperación 12,000 lbs', category: 'accesorios4x4' },
            { name: 'Planchas de desatasco Maxtrax', category: 'accesorios4x4' },
            { name: 'Compresores de aire On-Board', category: 'herramientas' },
          ],
        },
        {
          title: 'Iluminación Off-Road',
          seeAllQuery: { category: 'iluminacion' },
          items: [
            { name: 'Barras LED curvas de alta potencia', category: 'iluminacion' },
            { name: 'Faros neblineros de profundidad', category: 'iluminacion' },
            { name: 'Luces de trabajo traseras y roca', category: 'iluminacion' },
            { name: 'Soportes de montaje en techo', category: 'iluminacion' },
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
            { name: 'All-Terrain (A/T) - Mixtas 50/50', category: 'llantas', brand: 'Mickey Thompson' },
            { name: 'Mud-Terrain (M/T) - Barro y Rocas', category: 'llantas', brand: 'Mickey Thompson' },
            { name: 'Rugged Terrain (R/T) - Híbridas', category: 'llantas', brand: 'Mickey Thompson' },
            { name: 'Highway Terrain (H/T) - Carretera', category: 'llantas' },
          ],
        },
        {
          title: 'Aros de Aleación Off-Road',
          seeAllQuery: { category: 'llantas' },
          items: [
            { name: 'Aros Black Rhino R17"', category: 'llantas', brand: 'BLACK RHINO' },
            { name: 'Aros Black Rhino R18" / R20"', category: 'llantas', brand: 'BLACK RHINO' },
            { name: 'Aros Beadlock simulados', category: 'llantas', brand: 'BLACK RHINO' },
            { name: 'Tuercas de seguridad antirrobo', category: 'llantas' },
          ],
        },
        {
          title: 'Accesorios y Calibración',
          seeAllQuery: { category: 'herramientas' },
          items: [
            { name: 'Medidores de presión digital', category: 'herramientas' },
            { name: 'Desinfladores rápidos de neumáticos', category: 'herramientas' },
            { name: 'Kits de reparación de pinchazos', category: 'herramientas' },
            { name: 'Espaciadores de rueda certificados', category: 'llantas' },
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
            { name: 'Shampoo pH Neutro con cera', category: 'detailing' },
            { name: 'Descontaminante férrico de aros', category: 'detailing' },
            { name: 'Barras de arcilla (Clay Bar)', category: 'detailing' },
            { name: 'Lanza de espuma Snow Foam', category: 'herramientas' },
          ],
        },
        {
          title: 'Pulido y Protección Cerámica',
          seeAllQuery: { category: 'detailing' },
          items: [
            { name: 'Sellador Cerámico 3M 9H', category: 'detailing', brand: '3M' },
            { name: 'Compuestos pulidores de corte y acabado', category: 'detailing' },
            { name: 'Pads de pulido de espuma y lana', category: 'detailing' },
            { name: 'Ceras en pasta carnauba premium', category: 'detailing' },
          ],
        },
        {
          title: 'Cuidado Interior y Cueros',
          seeAllQuery: { category: 'detailing' },
          items: [
            { name: 'Acondicionador de cuero mate', category: 'detailing' },
            { name: 'Limpiador de plásticos y tablero UV', category: 'detailing' },
            { name: 'Limpiador de tapices y alfombras', category: 'detailing' },
            { name: 'Desinfectante antibacteriano de ozono', category: 'detailing' },
          ],
        },
        {
          title: 'Láminas y PPF',
          seeAllQuery: { category: 'seguridad' },
          items: [
            { name: 'Láminas de seguridad nanocerámica LLumar', category: 'seguridad', brand: 'LLumar' },
            { name: 'Film de protección de pintura PPF 3M', category: 'detailing', brand: '3M' },
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
            { name: 'Toyota Hilux 2025 4x4 D-Cab', view: 'cars' },
            { name: 'Nissan Frontier PRO-4X', view: 'cars' },
            { name: 'Ford Ranger XLT / Wildtrak', view: 'cars' },
            { name: 'Mitsubishi L200 Triton', view: 'cars' },
          ],
        },
        {
          title: 'SUVs y Crossovers',
          seeAllQuery: { view: 'cars' },
          items: [
            { name: 'Toyota Land Cruiser Prado', view: 'cars' },
            { name: 'Toyota RAV4 Híbrida', view: 'cars' },
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
              <span className="material-symbols-outlined text-lg">person</span>
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
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9D9D9C] text-lg">
              search
            </span>
            {menuSearchQuery && (
              <button
                type="button"
                onClick={() => setMenuSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9D9D9C] hover:text-[#212955] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
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
                return (
                  <button
                    key={dept.id}
                    onClick={() => setActiveDeptId(dept.id)}
                    onMouseEnter={() => setActiveDeptId(dept.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer text-xs sm:text-sm ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#F07F00] font-bold border-l-4 border-[#F07F00] shadow-2xs'
                        : 'text-[#212955] hover:bg-[#FFFFFF] hover:text-[#F07F00] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span
                        className={`material-symbols-outlined text-lg ${
                          isActive ? 'text-[#F07F00]' : 'text-[#9D9D9C]'
                        }`}
                      >
                        {dept.iconName}
                      </span>
                      <span className="truncate">{dept.name}</span>
                    </div>
                    <span
                      className={`material-symbols-outlined text-sm shrink-0 ${
                        isActive ? 'text-[#F07F00]' : 'text-[#9D9D9C]'
                      }`}
                    >
                      chevron_right
                    </span>
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
                <span className="material-symbols-outlined text-xl text-[#FFFFFF]">
                  {currentDept.iconName}
                </span>
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
                <span className="material-symbols-outlined text-sm">chevron_right</span>
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
                            <span className="material-symbols-outlined text-[14px] text-[#F07F00] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 shrink-0">
                              chevron_right
                            </span>
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
