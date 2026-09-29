import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SafeImage } from '../components/SafeImage';

interface TrackingOrder {
  orderNumber: string;
  trackingGuide: string;
  carrier: 'Shalom Express' | 'Olva Courier' | 'Flota Local Nor Celis';
  createdDate: string;
  estimatedDelivery: string;
  status: 'confirmado' | 'preparando' | 'despachado' | 'en_ruta' | 'entregado';
  statusText: string;
  statusDescription: string;
  destination: string;
  deliveryType: string;
  recipientName: string;
  recipientPhone: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    priceSoles: number;
    image: string;
  }>;
  totalSoles: number;
  timeline: Array<{
    title: string;
    date: string;
    time: string;
    location: string;
    completed: boolean;
    current?: boolean;
  }>;
}

const SAMPLE_ORDERS: TrackingOrder[] = [
  {
    orderNumber: 'NC-2025-8842',
    trackingGuide: 'SHA-CAJ-592811',
    carrier: 'Shalom Express',
    createdDate: '27 de Septiembre, 2026',
    estimatedDelivery: '30 de Septiembre, 2026 (24-48 hrs)',
    status: 'en_ruta',
    statusText: 'En Ruta de Reparto Local',
    statusDescription: 'El envío llegó al centro logístico de destino y se encuentra en unidad móvil para entrega.',
    destination: 'Cajamarca - Agencia Central Av. Vía de Evitamiento Sur',
    deliveryType: 'Despacho a Domicilio con Guía Shalom',
    recipientName: 'Carlos Mendoza',
    recipientPhone: '987 654 321',
    items: [
      {
        name: 'Pastillas de Freno Brembo Delanteras Cerámicas OEM',
        sku: 'BRM-P04-021',
        quantity: 1,
        priceSoles: 345,
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Filtro de Aceite Mann-Filter Sintético W712',
        sku: 'MNN-W712-83',
        quantity: 2,
        priceSoles: 90,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
      },
    ],
    totalSoles: 525,
    timeline: [
      {
        title: 'Pedido Confirmado y Pago Verificado',
        date: '27 Sep 2026',
        time: '09:15 AM',
        location: 'Sede Central Nor Celis (Cajamarca)',
        completed: true,
      },
      {
        title: 'Preparación y Embalaje Técnico de Autopartes',
        date: '27 Sep 2026',
        time: '11:40 AM',
        location: 'Almacén Repuestos Nor Celis',
        completed: true,
      },
      {
        title: 'Entregado a Shalom Express con Guía SHA-CAJ-592811',
        date: '28 Sep 2026',
        time: '03:30 PM',
        location: 'Agencia Shalom Evitamiento',
        completed: true,
      },
      {
        title: 'En Unidad Móvil de Reparto Final',
        date: '29 Sep 2026',
        time: '08:20 AM',
        location: 'En Ruta - Cajamarca Ciudad',
        completed: true,
        current: true,
      },
      {
        title: 'Entrega Programada con Firma y DNI',
        date: '30 Sep 2026',
        time: 'Pendiente',
        location: 'Dirección del Comprador',
        completed: false,
      },
    ],
  },
  {
    orderNumber: 'NC-2025-4819',
    trackingGuide: 'SHA-LIM-812044',
    carrier: 'Shalom Express',
    createdDate: '29 de Septiembre, 2026',
    estimatedDelivery: '02 de Octubre, 2026',
    status: 'preparando',
    statusText: 'En Preparación y Control de Calidad',
    statusDescription: 'Piezas validadas por código OEM en almacén. En proceso de embalaje para entrega a courier.',
    destination: 'Lima Norte (Agencia Shalom Los Olivos)',
    deliveryType: 'Despacho Interprovincial Shalom',
    recipientName: 'Juan Diego Vásquez',
    recipientPhone: '951 884 102',
    items: [
      {
        name: 'Aceite de Motor Sintético Mobil 1 ESP 5W-30 (Galón)',
        sku: 'MBL-ESP-5W30',
        quantity: 1,
        priceSoles: 185,
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Batería Bosch S6 AGM 80Ah Libre Mantenimiento',
        sku: 'BSH-S6-AGM80',
        quantity: 1,
        priceSoles: 780,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
      },
    ],
    totalSoles: 965,
    timeline: [
      {
        title: 'Pedido Registrado en Nor Celis E-Commerce',
        date: '29 Sep 2026',
        time: '10:04 AM',
        location: 'Web Oficial Nor Celis',
        completed: true,
      },
      {
        title: 'Validación de Stock y Control Técnico OEM',
        date: '29 Sep 2026',
        time: '11:15 AM',
        location: 'Almacén Central Cajamarca',
        completed: true,
        current: true,
      },
      {
        title: 'Recepción en Agencia Shalom Express',
        date: 'Pendiente',
        time: 'Estimado 30 Sep',
        location: 'Cajamarca',
        completed: false,
      },
      {
        title: 'En Tránsito Interprovincial',
        date: 'Pendiente',
        time: 'Estimado 01 Oct',
        location: 'Ruta Cajamarca - Lima',
        completed: false,
      },
      {
        title: 'Listo para Retiro en Agencia Shalom Los Olivos',
        date: 'Pendiente',
        time: 'Estimado 02 Oct',
        location: 'Agencia Shalom Lima Norte',
        completed: false,
      },
    ],
  },
  {
    orderNumber: 'NC-2025-6710',
    trackingGuide: 'SED-CAJ-LOCAL',
    carrier: 'Flota Local Nor Celis',
    createdDate: '15 de Septiembre, 2026',
    estimatedDelivery: '15 de Septiembre, 2026',
    status: 'entregado',
    statusText: 'Entregado & Conforme',
    statusDescription: 'El pedido fue retirado e instalado en nuestras bahías de servicio con firma de conformidad.',
    destination: 'Concesionario Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003)',
    deliveryType: 'Retiro e Instalación en Taller Central',
    recipientName: 'Carlos Mendoza',
    recipientPhone: '987 654 321',
    items: [
      {
        name: 'Kit de Suspensión Lift TRAKKO® AUTORUS +2"',
        sku: 'TRK-LFT-HILUX',
        quantity: 1,
        priceSoles: 1650,
        image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=400&q=80',
      },
    ],
    totalSoles: 1650,
    timeline: [
      {
        title: 'Compra y Reserva de Instalación Confirmada',
        date: '15 Sep 2026',
        time: '08:30 AM',
        location: 'Taller Nor Celis',
        completed: true,
      },
      {
        title: 'Instalación en Elevador 3D por Técnico Master',
        date: '15 Sep 2026',
        time: '10:00 AM',
        location: 'Bahía 4 - Taller Mecánico',
        completed: true,
      },
      {
        title: 'Inspección de Seguridad y Prueba de Calce',
        date: '15 Sep 2026',
        time: '12:30 PM',
        location: 'Pista de Verificación',
        completed: true,
      },
      {
        title: 'Vehículo Entregado al Cliente con Garantía Sellada',
        date: '15 Sep 2026',
        time: '01:15 PM',
        location: 'Entregas Nor Celis Cajamarca',
        completed: true,
        current: true,
      },
    ],
  },
];

export const OrderTrackingView: React.FC = () => {
  const { setCurrentView, showToast, trackingOrderCode, setTrackingOrderCode, navigateToTerms } = useApp();
  const [searchCode, setSearchCode] = useState(trackingOrderCode || 'NC-2025-8842');
  const [placedOrders] = useState<TrackingOrder[]>(() => {
    try {
      const stored = localStorage.getItem('norcelis_placed_orders');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return [];
  });

  const allOrders = [...placedOrders, ...SAMPLE_ORDERS];
  const [searchedOrder, setSearchedOrder] = useState<TrackingOrder | null>(SAMPLE_ORDERS[0]);
  const [hasSearched, setHasSearched] = useState(true);

  // Sync with trackingOrderCode if passed from Cart or Account
  useEffect(() => {
    if (trackingOrderCode) {
      setSearchCode(trackingOrderCode);
      const query = trackingOrderCode.trim().toUpperCase();
      const found = allOrders.find(
        (o) =>
          o.orderNumber.toUpperCase().includes(query) ||
          o.trackingGuide.toUpperCase().includes(query) ||
          o.recipientPhone?.includes(query)
      );
      if (found) {
        setSearchedOrder(found);
      } else {
        setSearchedOrder({
          orderNumber: query.startsWith('NC-') ? query : `NC-${query}`,
          trackingGuide: `SHA-CAJ-${Math.floor(100000 + Math.random() * 900000)}`,
          carrier: 'Shalom Express',
          createdDate: 'Hoy, 2026',
          estimatedDelivery: 'En 24-48 hrs hábiles',
          status: 'confirmado',
          statusText: 'Pedido Registrado en Sistema',
          statusDescription: 'Estamos procesando tu orden y asignando los repuestos originales para su empaque.',
          destination: 'Agencia Shalom / Envío Nacional',
          deliveryType: 'Despacho Shalom Express',
          recipientName: 'Cliente Nor Celis',
          recipientPhone: 'En trámite',
          items: [
            {
              name: 'Repuestos & Accesorios Homologados Nor Celis',
              sku: query,
              quantity: 1,
              priceSoles: 350,
              image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
            },
          ],
          totalSoles: 350,
          timeline: [
            {
              title: 'Pedido Confirmado',
              date: 'Hoy',
              time: 'Reciente',
              location: 'Nor Celis E-Commerce',
              completed: true,
              current: true,
            },
            {
              title: 'Embalaje y Preparación en Almacén',
              date: 'En progreso',
              time: 'Pendiente',
              location: 'Almacén Central',
              completed: false,
            },
            {
              title: 'Despacho en Courier Shalom / Olva',
              date: 'Pendiente',
              time: 'Pendiente',
              location: 'Agencia de Envíos',
              completed: false,
            },
            {
              title: 'En Ruta de Entrega',
              date: 'Pendiente',
              time: 'Pendiente',
              location: 'Ruta Destino',
              completed: false,
            },
          ],
        });
      }
      setHasSearched(true);
    }
  }, [trackingOrderCode]);

  // Auto-search if code changed from quick select
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchCode.trim().toUpperCase();
    if (!query) {
      showToast('Ingresa un número de pedido o guía Shalom');
      return;
    }

    const found = allOrders.find(
      (o) =>
        o.orderNumber.toUpperCase().includes(query) ||
        o.trackingGuide.toUpperCase().includes(query) ||
        o.recipientPhone?.includes(query)
    );

    if (found) {
      setSearchedOrder(found);
      setHasSearched(true);
      showToast(`✓ Mostrando seguimiento para el pedido ${found.orderNumber}`);
    } else {
      // Create dynamic tracking record for freshly placed orders
      const dynamicOrder: TrackingOrder = {
        orderNumber: query.startsWith('NC-') ? query : `NC-${query}`,
        trackingGuide: `SHA-CAJ-${Math.floor(100000 + Math.random() * 900000)}`,
        carrier: 'Shalom Express',
        createdDate: 'Hoy, 2026',
        estimatedDelivery: 'En 24-48 hrs hábiles',
        status: 'confirmado',
        statusText: 'Pedido Registrado en Sistema',
        statusDescription: 'Estamos procesando tu orden y asignando los repuestos originales para su empaque.',
        destination: 'Agencia Shalom / Envío Nacional',
        deliveryType: 'Despacho Shalom Express',
        recipientName: 'Cliente Nor Celis',
        recipientPhone: 'En trámite',
        items: [
          {
            name: 'Repuestos & Accesorios Homologados Nor Celis',
            sku: query,
            quantity: 1,
            priceSoles: 350,
            image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
          },
        ],
        totalSoles: 350,
        timeline: [
          {
            title: 'Pedido Confirmado',
            date: 'Hoy',
            time: 'Reciente',
            location: 'Nor Celis E-Commerce',
            completed: true,
            current: true,
          },
          {
            title: 'Embalaje y Preparación en Almacén',
            date: 'En progreso',
            time: 'Pendiente',
            location: 'Almacén Central',
            completed: false,
          },
          {
            title: 'Despacho en Courier Shalom / Olva',
            date: 'Pendiente',
            time: 'Pendiente',
            location: 'Agencia de Envíos',
            completed: false,
          },
          {
            title: 'En Ruta de Entrega',
            date: 'Pendiente',
            time: 'Pendiente',
            location: 'Ruta Destino',
            completed: false,
          },
        ],
      };

      setSearchedOrder(dynamicOrder);
      setHasSearched(true);
      showToast(`Consultando datos para "${query}"`);
    }
  };

  const getStatusColor = (status: TrackingOrder['status']) => {
    switch (status) {
      case 'confirmado':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'preparando':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'despachado':
      case 'en_ruta':
        return 'bg-[#F07F00]/10 text-[#F07F00] border-[#F07F00]/30';
      case 'entregado':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-gutter py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#212955] via-[#1a2145] to-[#212955] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/15">
            <span className="material-symbols-outlined text-sm text-[#F07F00]">local_shipping</span>
            <span>Rastreo Oficial en Tiempo Real</span>
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-4xl text-white">
            Seguimiento de Pedidos y Envíos Shalom
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            Ingresa tu código de pedido (ej. <strong>NC-2025-8842</strong>) o tu número de guía de remisión Shalom (ej. <strong>SHA-CAJ-592811</strong>) para conocer el estado exacto de tu despacho a nivel nacional.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Ej. NC-2025-8842 o SHA-CAJ-592811..."
                className="w-full bg-white text-[#212955] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F07F00] shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-[#F07F00] hover:bg-[#d97200] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Consultar Estado</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-300 font-medium">Ejemplos para probar:</span>
            {SAMPLE_ORDERS.map((sample) => (
              <button
                key={sample.orderNumber}
                type="button"
                onClick={() => {
                  setSearchCode(sample.orderNumber);
                  setSearchedOrder(sample);
                  setHasSearched(true);
                  showToast(`Cargando orden ${sample.orderNumber}`);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border ${
                  searchedOrder?.orderNumber === sample.orderNumber
                    ? 'bg-[#F07F00] text-white border-[#F07F00]'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                {sample.orderNumber} ({sample.carrier.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tracking Details */}
      {hasSearched && searchedOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Progress Timeline */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9D9D9C] block">
                  Orden #{searchedOrder.orderNumber}
                </span>
                <h3 className="font-headline font-bold text-xl text-[#212955]">
                  {searchedOrder.statusText}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {searchedOrder.statusDescription}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${getStatusColor(searchedOrder.status)} shrink-0`}>
                {searchedOrder.carrier}
              </span>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="space-y-6 py-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#212955] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F07F00] text-base">route</span>
                Línea de Tiempo del Despacho
              </div>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {searchedOrder.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step Icon */}
                    <div
                      className={`absolute -left-6 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                        step.completed
                          ? step.current
                            ? 'bg-[#F07F00] border-[#F07F00] text-white ring-4 ring-[#F07F00]/20'
                            : 'bg-[#212955] border-[#212955] text-white'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {step.completed && (
                        <span className="material-symbols-outlined text-[10px] font-black">check</span>
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 space-y-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4
                          className={`text-xs sm:text-sm font-bold ${
                            step.current ? 'text-[#F07F00]' : step.completed ? 'text-[#212955]' : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <div className="text-[11px] font-mono text-gray-500">
                          {step.date} • {step.time}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-gray-400">location_on</span>
                        <span>{step.location}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products inside the order */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#212955]">
                Artículos en este paquete ({searchedOrder.items.length})
              </div>
              <div className="space-y-2">
                {searchedOrder.items.map((it, iIdx) => (
                  <div key={iIdx} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <SafeImage src={it.image} alt={it.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#212955] truncate">{it.name}</h5>
                      <span className="text-[11px] text-gray-500 font-mono">
                        SKU: {it.sku} • Cantidad: {it.quantity}
                      </span>
                    </div>
                    <div className="text-right shrink-0 font-bold text-xs text-primary">
                      S/ {(it.priceSoles * it.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Info & Assistance */}
          <div className="lg:col-span-4 space-y-6">
            {/* Courier & Waybill Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#212955]">
                  Datos de Envío
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  100% Asegurado
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Guía de Transporte:</span>
                  <div className="font-mono font-black text-sm text-[#212955] flex items-center justify-between mt-0.5">
                    <span>{searchedOrder.trackingGuide}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(searchedOrder.trackingGuide);
                        showToast(`Guía ${searchedOrder.trackingGuide} copiada`);
                      }}
                      className="text-[#F07F00] hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Operador Logístico:</span>
                  <span className="font-bold text-[#212955]">{searchedOrder.carrier}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Destino / Agencia:</span>
                  <span className="font-bold text-[#212955]">{searchedOrder.destination}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Consignatario:</span>
                  <span className="font-bold text-[#212955]">{searchedOrder.recipientName} ({searchedOrder.recipientPhone})</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Fecha de Compra:</span>
                  <span className="font-medium text-gray-700">{searchedOrder.createdDate}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Entrega Estimada:</span>
                  <span className="font-bold text-[#F07F00]">{searchedOrder.estimatedDelivery}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-600">Total Facturado:</span>
                <span className="font-extrabold text-base text-primary font-mono">
                  S/ {searchedOrder.totalSoles.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Direct Support Card */}
            <div className="bg-[#212955] text-white rounded-3xl p-6 shadow-md border border-[#212955]/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F07F00] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">support_agent</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-white">¿Dudas con tu Despacho?</h4>
                  <p className="text-[11px] text-gray-300">Coordinación de despacho y entrega</p>
                </div>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed">
                Comunícate con nuestra central de envíos de Av. Vía de Evitamiento Sur 6003, Cajamarca o solicita soporte directo vía WhatsApp oficial.
              </p>

              <div className="space-y-2 pt-1">
                <a
                  href={`https://wa.me/51976868695?text=Hola%20Nor%20Celis,%20deseo%20consultar%20el%20estado%20de%20mi%20pedido%20${searchedOrder.orderNumber}%20con%20guia%20${searchedOrder.trackingGuide}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Consultar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setCurrentView('locations')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">storefront</span>
                  <span>Ver Agencias y Almacén</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTerms('shipping')}
                  className="w-full bg-[#F07F00]/20 hover:bg-[#F07F00]/30 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#F07F00]/30"
                >
                  <span className="material-symbols-outlined text-sm text-[#F07F00]">policy</span>
                  <span>Políticas de Envío &amp; Despacho</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
