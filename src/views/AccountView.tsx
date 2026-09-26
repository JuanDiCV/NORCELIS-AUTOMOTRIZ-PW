import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_GARAGE_VEHICLES } from '../data/mockData';
import {
  calculateNextMaintenance,
  getVehicleMaintenanceHistory,
  calculateAverageMonthlyKm,
  getBrandServiceConfig,
  INITIAL_MAINTENANCE_HISTORY,
  formatSpanishDate,
} from '../utils/maintenanceHelper';
import { MaintenanceRecord } from '../types';
import { generateMaintenanceCertificatePdf, generateWishlistQuotePdf } from '../utils/pdfGenerator';

export const AccountView: React.FC = () => {
  const { user, logoutUser, setCurrentView, showToast, setIsGarageModalOpen } = useApp();

  const [activeTab, setActiveTab] = useState<'vehicles' | 'appointments' | 'orders' | 'security'>('vehicles');

  // Garage vehicles list
  const [garageCars, setGarageCars] = useState([
    {
      id: 'car-1',
      brand: 'Toyota',
      model: 'RAV4 Hybrid 2.5L Limited AWD',
      year: 2025,
      plate: 'ABC-123',
      vin: '4T1B11HK5JU123456',
      mileage: 24500,
      warrantyStatus: 'Garantía de Fábrica Vigente (5 Años / 150,000 km)',
      warrantyColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      lastMaintenanceDate: '2026-05-15',
      image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'car-2',
      brand: 'Toyota',
      model: 'Hilux Revo 2.8L Turbo Diésel 4x4',
      year: 2023,
      plate: 'HLX-789',
      vin: 'MR0BA3CD201984210',
      mileage: 42100,
      warrantyStatus: 'Garantía Nor Celis Oro (3 Años)',
      warrantyColor: 'text-blue-700 bg-blue-50 border-blue-200',
      lastMaintenanceDate: '2026-04-10',
      image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'car-3',
      brand: 'Nissan',
      model: 'Frontier Pro-4X 2024 Bi-Turbo',
      year: 2024,
      plate: 'NFR-442',
      vin: '3N6DD23T4RK091244',
      mileage: 23400,
      warrantyStatus: 'Garantía Nissan Oficial (3 Años / 100,000 km)',
      warrantyColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      lastMaintenanceDate: '2026-03-20',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80',
    },
  ]);

  // Historial global de mantenimientos de los vehículos
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE_HISTORY);

  // Modal para consultar historial completo de un vehículo seleccionado
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<typeof garageCars[0] | null>(null);

  // Modal interactivo para actualizar odómetro con previsualización en vivo del helper
  const [mileageModalCar, setMileageModalCar] = useState<typeof garageCars[0] | null>(null);
  const [mileageInputValue, setMileageInputValue] = useState<number>(0);

  // Formulario para registrar un nuevo mantenimiento en el historial
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mileage: 25000,
    serviceType: 'Mantenimiento Preventivo Oficial',
    technician: 'Ing. Renzo Valdivia (Master Toyota)',
    workshop: 'Taller Central Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
    costSoles: 550,
    invoiceNumber: `B001-000${Math.floor(10000 + Math.random() * 90000)}`,
    workSummary: 'Cambio de Aceite Sintético de Motor y Filtro OEM\nRotación de neumáticos y calibración láser\nEscaneo computarizado de 25 puntos de seguridad',
    notes: 'Vehículo en óptimas condiciones de funcionamiento. Se sella garantía oficial.',
  });

  // Citas de taller
  const [appointments] = useState([
    {
      id: 'CITA-2025-098',
      vehicle: 'Toyota RAV4 Hybrid (ABC-123)',
      serviceName: 'Mantenimiento Preventivo 25,000 km + Escaneo Híbrido Techstream',
      branch: 'Taller Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
      date: '28 de Septiembre, 2026',
      time: '10:00 AM',
      advisor: 'Ing. Renzo Valdivia (Especialista Master Toyota)',
      status: 'Confirmada',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bayNumber: 'Bahía 4 - Elevador 3D',
      priceEstimate: 'S/ 580.00',
    },
    {
      id: 'CITA-2025-045',
      vehicle: 'Toyota Hilux Revo (HLX-789)',
      serviceName: 'Alineación Láser 3D de 4 Ruedas + Balanceo Dinámico de Neumáticos',
      branch: 'Taller Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
      date: '12 de Julio, 2026',
      time: '03:30 PM',
      advisor: 'Téc. Marco Quispe',
      status: 'Completado',
      statusColor: 'bg-surface-container text-outline border-surface-container',
      bayNumber: 'Bahía Láser 1',
      priceEstimate: 'S/ 195.00',
    },
  ]);

  // Pedidos
  const [orders] = useState([
    {
      id: 'ORD-2025-8842',
      invoiceNumber: 'B001-00084920',
      date: '18 de Septiembre, 2026',
      items: [
        { name: 'Pastillas de Freno Brembo Delanteras Cerámicas OEM', qty: 1, price: 345 },
        { name: 'Filtro de Aceite Mann-Filter Sintético W712', qty: 2, price: 90 },
      ],
      total: 435,
      deliveryType: 'Despacho Express a Domicilio (Cajamarca)',
      status: 'En Ruta de Entrega',
      statusBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      trackingCode: 'NC-COURIER-98214',
    },
    {
      id: 'ORD-2025-6710',
      invoiceNumber: 'F002-00019482',
      date: '02 de Agosto, 2026',
      items: [
        { name: 'Batería Bosch S6 AGM 80Ah Libre Mantenimiento', qty: 1, price: 780 },
        { name: 'Instalación y Configuración BMS en Taller', qty: 1, price: 0 },
      ],
      total: 780,
      deliveryType: 'Instalación en Taller (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
      status: 'Instalado con Éxito',
      statusBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      trackingCode: 'TALLER-CAJAMARCA-OK',
    },
  ]);

  // Datos de perfil
  const [profileData, setProfileData] = useState({
    fullName: user.name || 'Carlos Mendoza',
    email: user.email || 'carlos.mendoza@norcelis.pe',
    phone: '987 654 321',
    dni: '45892104',
    address: 'AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA',
    rucInvoice: '20601849201',
    businessName: 'Mendoza Logistics & Consulting S.A.C.',
  });

  // Abrir modal de odómetro
  const openMileageModal = (car: typeof garageCars[0]) => {
    setMileageModalCar(car);
    setMileageInputValue(car.mileage);
  };

  // Guardar nuevo kilometraje del odómetro
  const handleSaveMileage = () => {
    if (!mileageModalCar) return;
    const cleanKm = Number(mileageInputValue);
    if (isNaN(cleanKm) || cleanKm < 0) {
      showToast('Por favor ingresa un kilometraje válido');
      return;
    }

    setGarageCars((prev) =>
      prev.map((c) => (c.id === mileageModalCar.id ? { ...c, mileage: cleanKm } : c))
    );
    showToast(`Odómetro de ${mileageModalCar.brand} ${mileageModalCar.model} actualizado a ${cleanKm.toLocaleString()} km. Próxima fecha de servicio recalculada.`);
    setMileageModalCar(null);
  };

  // Registrar nuevo mantenimiento manual
  const handleCreateNewServiceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForHistory) return;

    const newRecord: MaintenanceRecord = {
      id: `MNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vehiclePlate: selectedVehicleForHistory.plate,
      date: newServiceForm.date,
      mileage: Number(newServiceForm.mileage),
      serviceType: newServiceForm.serviceType,
      workSummary: newServiceForm.workSummary
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      technician: newServiceForm.technician,
      workshop: newServiceForm.workshop,
      costSoles: Number(newServiceForm.costSoles),
      invoiceNumber: newServiceForm.invoiceNumber,
      warrantyCertified: true,
      notes: newServiceForm.notes,
    };

    // Agregar al historial global
    setMaintenanceHistory((prev) => [newRecord, ...prev]);

    // Actualizar también el kilometraje del vehículo si el servicio registrado es mayor
    setGarageCars((prev) =>
      prev.map((c) =>
        c.plate === selectedVehicleForHistory.plate
          ? {
              ...c,
              mileage: Math.max(c.mileage, newRecord.mileage),
              lastMaintenanceDate: newRecord.date,
            }
          : c
      )
    );

    setIsAddServiceModalOpen(false);
    showToast(`¡Mantenimiento de ${newRecord.mileage.toLocaleString()} km registrado con éxito! Fecha próxima recalculada.`);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('¡Datos personales y fiscales guardados con éxito!');
  };

  return (
    <div className="min-h-screen py-8 px-gutter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/70">
          <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors cursor-pointer">
            Inicio
          </button>
          <span>/</span>
          <span className="text-white font-semibold">Mi Cuenta &amp; Garaje</span>
        </nav>

        {/* User Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-headline font-black text-2xl shadow-lg ring-4 ring-primary/10">
              CM
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-headline font-extrabold text-primary">
                  {profileData.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary text-xs font-bold border border-secondary-container/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">stars</span>
                  Club VIP Oro
                </span>
              </div>
              <p className="text-xs text-outline flex items-center gap-3">
                <span>{profileData.email}</span>
                <span>•</span>
                <span>DNI: {profileData.dni}</span>
                <span>•</span>
                <span>Cliente desde 2022</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsGarageModalOpen(true)}
              className="flex-1 md:flex-none bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs px-4 py-2.5 rounded-xl border border-surface-container transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">directions_car</span>
              Cambiar Garaje Activo
            </button>
            <button
              onClick={() => {
                logoutUser();
                setCurrentView('login');
                showToast('Sesión cerrada correctamente');
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="bg-white rounded-2xl p-2 shadow-xs border border-surface-container flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'vehicles', label: 'Mis Vehículos & Mantenimiento', icon: 'directions_car', count: garageCars.length },
            { id: 'appointments', label: 'Mis Citas de Taller', icon: 'event', count: appointments.length },
            { id: 'orders', label: 'Mis Pedidos de Repuestos', icon: 'shopping_bag', count: orders.length },
            { id: 'security', label: 'Datos & Facturación', icon: 'manage_accounts', count: null },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Mis Vehículos */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-surface-container shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-headline font-extrabold text-primary">
                    Flota de Vehículos &amp; Plan Oficial de Mantenimiento
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    Cálculo Oficial Automatizado
                  </span>
                </div>
                <p className="text-xs text-outline leading-relaxed max-w-2xl">
                  Cada vehículo consulta su historial clínico de servicios. La fecha próxima es calculada en tiempo real mediante nuestra función inteligente basada en el odómetro actual, la frecuencia de la marca y la regla oficial: <em>«lo que ocurra primero: tiempo o kilometraje»</em>.
                </p>
              </div>
              <button
                onClick={() => setIsGarageModalOpen(true)}
                className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Registrar Vehículo
              </button>
            </div>

            {/* List of Vehicles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {garageCars.map((car) => {
                // Consultar el historial de mantenimiento oficial del vehículo
                const carHistory = getVehicleMaintenanceHistory(car.plate, maintenanceHistory);
                const lastRecord = carHistory[0];
                const userAvgKm = calculateAverageMonthlyKm(carHistory);
                const brandConfig = getBrandServiceConfig(car.brand);

                // Función helper principal para calcular la próxima fecha y kilometraje
                const forecast = calculateNextMaintenance({
                  currentMileage: car.mileage,
                  brand: car.brand,
                  lastServiceDate: lastRecord?.date || car.lastMaintenanceDate,
                  lastServiceMileage: lastRecord?.mileage,
                  averageMonthlyKm: userAvgKm,
                });

                // Progreso visual dentro del intervalo actual de la marca
                const intervalKm = brandConfig.intervalKm;
                const baseIntervalKm = lastRecord?.mileage || Math.max(0, forecast.nextServiceKm - intervalKm);
                const kmIntoInterval = Math.max(0, car.mileage - baseIntervalKm);
                const progressPct = Math.min(100, Math.round((kmIntoInterval / intervalKm) * 100));

                return (
                  <div
                    key={car.id}
                    className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs space-y-5 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    {/* Top Identity Row */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={car.image}
                        alt={car.model}
                        className="w-full sm:w-32 h-36 sm:h-24 object-cover rounded-2xl bg-surface-container-low shadow-xs shrink-0"
                      />
                      <div className="flex-1 space-y-1.5 min-w-0 w-full">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary px-2 py-0.5 rounded-md bg-secondary/10">
                            {car.brand} • Año {car.year}
                          </span>
                          <span className="font-mono text-xs font-black bg-surface-container-low text-primary px-2.5 py-0.5 rounded-md border border-surface-container shadow-2xs">
                            {car.plate}
                          </span>
                        </div>
                        <h3 className="font-headline font-bold text-base text-primary line-clamp-1">
                          {car.model}
                        </h3>
                        <p className="text-[10px] text-outline font-mono">VIN: {car.vin}</p>
                        
                        {/* Frecuencia Oficial de la Marca */}
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-outline bg-surface-container-lowest px-2 py-0.5 rounded-md border border-surface-container">
                          <span className="material-symbols-outlined text-[14px] text-primary shrink-0">published_with_changes</span>
                          <span className="break-words">Pauta {car.brand}: <strong>Cada {brandConfig.intervalKm.toLocaleString()} km o {brandConfig.intervalMonths} meses</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Odómetro Actual y Progreso */}
                    <div className="bg-surface-container-low/70 p-4 rounded-2xl border border-surface-container space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">speed</span>
                          <span className="font-bold text-on-surface">Odómetro Actual:</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-mono font-black text-primary text-base">
                            {car.mileage.toLocaleString()} km
                          </span>
                          <button
                            onClick={() => openMileageModal(car)}
                            className="bg-white hover:bg-primary hover:text-white text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg border border-surface-container shadow-2xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span className="material-symbols-outlined text-[13px]">edit</span>
                            Actualizar Odómetro
                          </button>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="space-y-1">
                        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              forecast.urgencyStatus === 'vencido' || forecast.urgencyStatus === 'urgente'
                                ? 'bg-red-500'
                                : forecast.urgencyStatus === 'proximo'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-outline">
                          <span>Último servicio: {lastRecord ? `${lastRecord.mileage.toLocaleString()} km (${formatSpanishDate(new Date(lastRecord.date))})` : car.lastMaintenanceDate}</span>
                          <span>Hito: {forecast.nextServiceKm.toLocaleString()} km ({progressPct}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* BOX DE CÁLCULO HELPER: Próximo Mantenimiento Calculado */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      forecast.urgencyStatus === 'vencido'
                        ? 'bg-red-50/70 border-red-200'
                        : forecast.urgencyStatus === 'urgente'
                        ? 'bg-amber-50/80 border-amber-200'
                        : 'bg-emerald-50/50 border-emerald-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-lg ${
                            forecast.urgencyStatus === 'vencido' || forecast.urgencyStatus === 'urgente'
                              ? 'text-red-600'
                              : 'text-emerald-700'
                          }`}>
                            event_upcoming
                          </span>
                          <span className="font-headline font-bold text-xs uppercase tracking-wide text-primary">
                            Próximo Servicio Recomendado
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border w-fit ${
                          forecast.urgencyStatus === 'vencido'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : forecast.urgencyStatus === 'urgente'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : forecast.urgencyStatus === 'proximo'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {forecast.urgencyStatus === 'vencido' && '⚠️ Servicio Vencido'}
                          {forecast.urgencyStatus === 'urgente' && '⚡ Atención Urgente'}
                          {forecast.urgencyStatus === 'proximo' && '⏱️ Próximo a Vencer'}
                          {forecast.urgencyStatus === 'al_dia' && '✓ Al Día con el Plan'}
                        </span>
                      </div>

                      {/* Main Calculation Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        {/* Fecha próxima calculada por el helper */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                            Fecha Estimada (Helper)
                          </span>
                          <div className="font-headline font-black text-sm text-primary flex items-center gap-1.5">
                            <span>{forecast.estimatedNextDateFormatted}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-secondary block">
                            {forecast.daysRemaining > 0
                              ? `En ~${forecast.daysRemaining} días aproximados`
                              : forecast.daysRemaining === 0
                              ? '¡Corresponde hoy!'
                              : `Excedido hace ${Math.abs(forecast.daysRemaining)} días`}
                          </span>
                        </div>

                        {/* Kilómetros faltantes o hito */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                            Hito de Servicio Objetivo
                          </span>
                          <div className="font-mono font-black text-sm text-primary">
                            {forecast.nextServiceKm.toLocaleString()} km
                          </div>
                          <span className="text-[11px] text-outline font-medium block">
                            {forecast.kmRemaining > 0
                              ? `Faltan ${forecast.kmRemaining.toLocaleString()} km de recorrido`
                              : `Excedido por ${Math.abs(forecast.kmRemaining).toLocaleString()} km`}
                          </span>
                        </div>
                      </div>

                      {/* Paquete oficial recomendado */}
                      <div className="mt-3 pt-2.5 border-t border-black/5 text-xs flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[11px] text-on-surface font-semibold">
                          <span className="material-symbols-outlined text-[15px] text-primary">build_circle</span>
                          <span>{forecast.servicePackageName}</span>
                        </div>

                        {/* Factor determinante explicativo */}
                        <div className="text-[10px] text-outline flex items-center gap-1 italic">
                          <span className="material-symbols-outlined text-[13px] text-secondary">info</span>
                          <span>
                            {forecast.determiningFactor === 'kilometraje'
                              ? `Fecha proyectada por tu consumo promedio de conducción (~${forecast.estimatedMonthlyKm.toLocaleString()} km/mes)`
                              : `Fecha proyectada por límite de tiempo de fabricante (${brandConfig.intervalMonths} meses tras último servicio)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Garantía Oficial */}
                    <div className={`p-2.5 rounded-xl border text-xs font-semibold ${car.warrantyColor} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">verified</span>
                        <span>{car.warrantyStatus}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider">Plan Nor Celis</span>
                    </div>

                    {/* Acciones del Vehículo */}
                    <div className="space-y-2 pt-2 border-t border-surface-container">
                      {/* Botón Principal para Consultar Historial */}
                      <button
                        onClick={() => setSelectedVehicleForHistory(car)}
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-base">history_edu</span>
                        <span>Consultar Historial de Mantenimiento ({carHistory.length} servicios)</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setCurrentView('services');
                            showToast(`Agendando turno para ${car.brand} ${car.model} (${forecast.nextServiceKm.toLocaleString()} km)`);
                          }}
                          className="bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-sm">calendar_add_on</span>
                          Agendar Cita
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('trade-in');
                            showToast(`Iniciando Plan Retoma para tu ${car.brand} ${car.model}`);
                          }}
                          className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">swap_horiz</span>
                          Tasar en Retoma
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Mis Citas de Taller */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-headline font-bold text-primary">
                  Citas de Taller &amp; Servicios de Ingeniería
                </h2>
                <p className="text-xs text-outline">
                  Seguimiento en tiempo real de recepción, elevador asignado y entrega de vehículo
                </p>
              </div>
              <button
                onClick={() => setCurrentView('services')}
                className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">calendar_add_on</span>
                Agendar Nueva Cita
              </button>
            </div>

            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">car_repair</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-outline">{apt.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${apt.statusColor}`}>
                            {apt.status}
                          </span>
                        </div>
                        <h3 className="font-headline font-bold text-sm text-primary">{apt.serviceName}</h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-outline">Presupuesto Estimado:</div>
                      <div className="font-bold text-sm text-primary">{apt.priceEstimate}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-outline block text-[10px]">Vehículo Asociado:</span>
                      <span className="font-bold text-on-surface">{apt.vehicle}</span>
                    </div>
                    <div>
                      <span className="text-outline block text-[10px]">Fecha &amp; Hora:</span>
                      <span className="font-bold text-on-surface">{apt.date} • {apt.time}</span>
                    </div>
                    <div>
                      <span className="text-outline block text-[10px]">Sede de Atención:</span>
                      <span className="font-bold text-on-surface">{apt.branch}</span>
                    </div>
                    <div>
                      <span className="text-outline block text-[10px]">Bahía &amp; Especialista:</span>
                      <span className="font-bold text-on-surface">{apt.bayNumber}</span>
                      <span className="text-[10px] text-outline block">{apt.advisor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        try {
                          const priceNum = parseFloat(apt.priceEstimate.replace(/[^0-9.]/g, '')) || 350;
                          const items = [
                            {
                              id: apt.id,
                              type: 'service' as const,
                              title: `Orden de Trabajo: ${apt.serviceName}`,
                              subtitle: `Vehículo: ${apt.vehicle} • Bahía: ${apt.bayNumber} • Asesor: ${apt.advisor} • Turno: ${apt.date} (${apt.time})`,
                              sku: apt.id,
                              priceSoles: priceNum,
                              quantity: 1,
                              image: '',
                              compatibleWithActiveGarage: true,
                              categoryBadge: 'Servicio Oficial Taller',
                            },
                          ];
                          const fileName = generateWishlistQuotePdf(items, user.name);
                          showToast(`Orden de Trabajo oficial en PDF descargada: ${fileName}`);
                        } catch (err) {
                          showToast(`Descargando Orden de Trabajo en PDF para la cita ${apt.id}...`);
                        }
                      }}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-red-600">picture_as_pdf</span>
                      Descargar Orden de Servicio
                    </button>
                    {apt.status === 'Confirmada' && (
                      <button
                        onClick={() => showToast('Solicitud de reprogramación enviada a tu asesor por WhatsApp')}
                        className="bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold px-3 py-1.5 rounded-xl border border-surface-container"
                      >
                        Reprogramar Turno
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Mis Pedidos de Repuestos */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-headline font-bold text-primary">
                  Historial de Pedidos de Repuestos OEM
                </h2>
                <p className="text-xs text-outline">
                  Comprobantes electrónicos de pago y seguimiento logístico de piezas garantizadas
                </p>
              </div>
              <button
                onClick={() => setCurrentView('parts')}
                className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                Ir al Catálogo de Repuestos
              </button>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-primary">{ord.id}</span>
                        <span>•</span>
                        <span className="text-xs text-outline">{ord.date}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ord.statusBadge}`}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-outline">
                        Comprobante: <strong className="text-on-surface">{ord.invoiceNumber}</strong> • Modalidad: {ord.deliveryType}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-outline">Total Pagado:</div>
                      <div className="font-headline font-black text-lg text-primary">
                        S/ {ord.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-outline uppercase tracking-wider">
                      Productos Incluidos:
                    </div>
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1">
                        <span className="text-on-surface">
                          {item.qty}x {item.name}
                        </span>
                        <span className="font-bold text-primary">S/ {(item.qty * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-container text-xs">
                    <div className="flex items-center gap-1.5 text-outline">
                      <span className="material-symbols-outlined text-sm">local_shipping</span>
                      <span>Código de Guía: <strong className="font-mono text-on-surface">{ord.trackingCode}</strong></span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          try {
                            const items = ord.items.map((it, i) => ({
                              id: `ord-it-${i}`,
                              type: 'part' as const,
                              title: it.name,
                              subtitle: `Comprobante Oficial SUNAT: ${ord.invoiceNumber}`,
                              sku: `FAC-${i + 1}`,
                              priceSoles: it.price,
                              quantity: it.qty,
                              image: '',
                              compatibleWithActiveGarage: true,
                              categoryBadge: 'Repuesto Original',
                            }));
                            const fileName = generateWishlistQuotePdf(items, user.name);
                            showToast(`Factura electrónica en PDF descargada: ${fileName}`);
                          } catch (err) {
                            showToast(`Descargando Factura Electrónica ${ord.invoiceNumber}...`);
                          }
                        }}
                        className="bg-surface-container-low hover:bg-surface-container text-primary font-bold px-3 py-1.5 rounded-xl border border-surface-container text-xs flex items-center gap-1 cursor-pointer"
                        title="Descargar Factura Oficial en PDF"
                      >
                        <span className="material-symbols-outlined text-sm text-red-600">picture_as_pdf</span>
                        Factura PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Datos y Facturación */}
        {activeTab === 'security' && (
          <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-6 md:p-10 border border-surface-container shadow-xs space-y-6">
            <div className="border-b border-surface-container pb-4">
              <h2 className="text-xl font-headline font-bold text-primary">
                Configuración de Perfil, Domicilio y Facturación
              </h2>
              <p className="text-xs text-outline">
                Mantén tus datos actualizados para agilizar la entrega de repuestos y la emisión de facturas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">DNI / CE</label>
                <input
                  type="text"
                  value={profileData.dni}
                  onChange={(e) => setProfileData({ ...profileData, dni: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Teléfono Móvil (WhatsApp)</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-1">Dirección de Entrega Predeterminada</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">RUC para Facturas Electrónicas (Opcional)</label>
                <input
                  type="text"
                  value={profileData.rucInvoice}
                  onChange={(e) => setProfileData({ ...profileData, rucInvoice: e.target.value })}
                  placeholder="20XXXXXXXXX"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-1">Razón Social de la Empresa</label>
                <input
                  type="text"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                  placeholder="Nombre de la empresa"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-surface-container pt-6 flex justify-end">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
              >
                Guardar Cambios de Perfil
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CONSULTAR HISTORIAL COMPLETO DE MANTENIMIENTO DEL VEHÍCULO       */}
      {/* ========================================================================= */}
      {selectedVehicleForHistory && (() => {
        const car = selectedVehicleForHistory;
        const carHistory = getVehicleMaintenanceHistory(car.plate, maintenanceHistory);
        const lastRecord = carHistory[0];
        const userAvgKm = calculateAverageMonthlyKm(carHistory);
        const brandConfig = getBrandServiceConfig(car.brand);
        const forecast = calculateNextMaintenance({
          currentMileage: car.mileage,
          brand: car.brand,
          lastServiceDate: lastRecord?.date || car.lastMaintenanceDate,
          lastServiceMileage: lastRecord?.mileage,
          averageMonthlyKm: userAvgKm,
        });
        const totalInvested = carHistory.reduce((acc, curr) => acc + curr.costSoles, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-surface-container my-auto animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-6 border-b border-surface-container flex items-start justify-between gap-4 bg-surface-container-lowest rounded-t-3xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-primary text-white px-2.5 py-0.5 rounded-md">
                      {car.plate}
                    </span>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {car.brand} • Año {car.year}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Garantía Oficial Nor Celis
                    </span>
                  </div>
                  <h3 className="text-xl font-headline font-extrabold text-primary">
                    Historial Clínico de Mantenimiento • {car.model}
                  </h3>
                  <p className="text-xs text-outline font-mono">
                    VIN: {car.vin} • Odómetro Actual: <strong className="text-on-surface font-bold">{car.mileage.toLocaleString()} km</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVehicleForHistory(null)}
                  className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* KPIs / Executive Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                      Pauta Oficial {car.brand}
                    </span>
                    <div className="font-headline font-extrabold text-xs text-primary">
                      Cada {brandConfig.intervalKm.toLocaleString()} km
                    </div>
                    <span className="text-[10px] text-outline block">o cada {brandConfig.intervalMonths} meses</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                      Servicios en Taller
                    </span>
                    <div className="font-headline font-black text-sm text-primary">
                      {carHistory.length} Registros
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">100% Sellados OEM</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                      Inversión Acumulada
                    </span>
                    <div className="font-headline font-black text-sm text-primary">
                      S/ {totalInvested.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-outline block">Repuestos &amp; Mano de Obra</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                      Ritmo de Conducción
                    </span>
                    <div className="font-headline font-black text-sm text-secondary">
                      ~{userAvgKm.toLocaleString()} km/mes
                    </div>
                    <span className="text-[10px] text-outline block">Promedio de Uso Real</span>
                  </div>
                </div>

                {/* Box de Próxima Cita Proyectada */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">auto_fix_high</span>
                      <span className="font-headline font-extrabold text-xs text-primary uppercase tracking-wide">
                        Próximo Mantenimiento Calculado por la Pauta Oficial
                      </span>
                    </div>
                    <div className="text-sm font-headline font-black text-on-surface">
                      Hito: {forecast.nextServiceKm.toLocaleString()} km • Fecha Estimada: <span className="text-primary underline decoration-secondary decoration-2">{forecast.estimatedNextDateFormatted}</span>
                    </div>
                    <p className="text-[11px] text-outline">
                      {forecast.servicePackageName} • {forecast.determiningFactor === 'kilometraje' ? `Basado en odómetro (${forecast.kmRemaining} km restantes)` : `Basado en intervalo de ${brandConfig.intervalMonths} meses`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVehicleForHistory(null);
                      setCurrentView('services');
                      showToast(`Agendando turno oficial para ${car.plate} (${forecast.nextServiceKm.toLocaleString()} km)`);
                    }}
                    className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    Agendar este Turno
                  </button>
                </div>

                {/* Historial Cronológico de Servicios */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-headline font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">verified</span>
                      Historial Detallado de Trabajos Realizados ({carHistory.length})
                    </h4>
                    <button
                      onClick={() => {
                        setNewServiceForm({
                          ...newServiceForm,
                          mileage: car.mileage,
                        });
                        setIsAddServiceModalOpen(true);
                      }}
                      className="text-xs font-bold text-secondary hover:text-secondary-container hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Registrar Servicio Adicional
                    </button>
                  </div>

                  {carHistory.length === 0 ? (
                    <div className="text-center py-8 bg-surface-container-lowest rounded-2xl border border-dashed border-surface-container text-outline text-xs">
                      No hay registros previos de mantenimiento para este vehículo.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {carHistory.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-2xs space-y-3 relative hover:border-primary/30 transition-colors"
                        >
                          {/* Record Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-2.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-primary">{rec.id}</span>
                                <span className="text-outline">•</span>
                                <span className="text-xs font-semibold text-on-surface">
                                  {formatSpanishDate(new Date(rec.date))}
                                </span>
                                <span className="font-mono text-xs font-black bg-primary/10 text-primary px-2 py-0.2 rounded">
                                  {rec.mileage.toLocaleString()} km
                                </span>
                              </div>
                              <h5 className="font-headline font-bold text-sm text-primary">
                                {rec.serviceType}
                              </h5>
                            </div>

                            <div className="text-left sm:text-right space-y-0.5">
                              <div className="font-headline font-black text-sm text-primary">
                                S/ {rec.costSoles.toFixed(2)}
                              </div>
                              <span className="text-[10px] text-outline font-mono block">
                                Comprobante: {rec.invoiceNumber}
                              </span>
                            </div>
                          </div>

                          {/* Work summary checklist */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                              Tareas Realizadas &amp; Repuestos Instalados:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              {rec.workSummary.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-on-surface">
                                  <span className="material-symbols-outlined text-emerald-600 text-[14px] shrink-0 mt-0.5">check_circle</span>
                                  <span className="text-[11px] leading-tight">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes and technician */}
                          {rec.notes && (
                            <div className="bg-surface-container-low/60 p-2.5 rounded-xl text-[11px] text-outline italic border border-surface-container flex items-start gap-2">
                              <span className="material-symbols-outlined text-[14px] text-secondary shrink-0 mt-0.5">rate_review</span>
                              <span>Nota de Taller: {rec.notes}</span>
                            </div>
                          )}

                          {/* Footer of card */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-surface-container text-[11px] text-outline">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-primary">engineering</span>
                              <span>Asesor: <strong className="text-on-surface font-semibold">{rec.technician}</strong></span>
                              <span>•</span>
                              <span>{rec.workshop}</span>
                            </div>

                            <button
                              onClick={() => {
                                try {
                                  const activeCar = garageCars.find((c) => c.plate === rec.vehiclePlate) || garageCars[0];
                                  const fileName = generateMaintenanceCertificatePdf(rec, activeCar as any);
                                  showToast(`Certificado Oficial en PDF descargado: ${fileName}`);
                                } catch (err) {
                                  showToast(`Descargando Certificado Oficial de Mantenimiento ${rec.id} (PDF)...`);
                                }
                              }}
                              className="text-primary hover:underline font-bold text-xs flex items-center gap-1 self-end sm:self-auto cursor-pointer"
                              title="Descargar Certificado Oficial de Mantenimiento con Garantía Nor Celis"
                            >
                              <span className="material-symbols-outlined text-[14px] text-red-600">picture_as_pdf</span>
                              Certificado PDF
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-surface-container bg-surface-container-lowest rounded-b-3xl flex justify-between items-center">
                <span className="text-[11px] text-outline font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-600">verified_user</span>
                  Registro auditado según estándar oficial Nor Celis Automotriz S.A.C.
                </span>
                <button
                  onClick={() => setSelectedVehicleForHistory(null)}
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar Historial
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 2: ACTUALIZAR ODÓMETRO CON PREVISUALIZACIÓN HELPER EN TIEMPO REAL   */}
      {/* ========================================================================= */}
      {mileageModalCar && (() => {
        const car = mileageModalCar;
        const carHistory = getVehicleMaintenanceHistory(car.plate, maintenanceHistory);
        const lastRecord = carHistory[0];
        const userAvgKm = calculateAverageMonthlyKm(carHistory);
        const brandConfig = getBrandServiceConfig(car.brand);

        // Previsualización interactiva con el helper usando el valor actual del input
        const previewForecast = calculateNextMaintenance({
          currentMileage: Math.max(0, Number(mileageInputValue) || 0),
          brand: car.brand,
          lastServiceDate: lastRecord?.date || car.lastMaintenanceDate,
          lastServiceMileage: lastRecord?.mileage,
          averageMonthlyKm: userAvgKm,
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-surface-container overflow-hidden animate-in fade-in duration-200 space-y-5 p-6">
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">speed</span>
                  <h3 className="font-headline font-extrabold text-base text-primary">
                    Actualizar Odómetro
                  </h3>
                </div>
                <button
                  onClick={() => setMileageModalCar(null)}
                  className="w-8 h-8 rounded-lg bg-surface-container text-outline hover:text-on-surface flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-on-surface">
                  {car.brand} {car.model}
                </div>
                <div className="text-[11px] text-outline font-mono">
                  Placa: {car.plate} • Odómetro Anterior: {car.mileage.toLocaleString()} km
                </div>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface">
                  Nuevo Kilometraje Registrado (km):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={mileageInputValue || ''}
                    onChange={(e) => setMileageInputValue(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-4 py-3 text-base font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ej. 25000"
                  />
                  <span className="absolute right-4 top-3 text-xs font-mono font-bold text-outline">
                    KM
                  </span>
                </div>

                {/* Botones de incremento rápido */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-outline">Sumar:</span>
                  {[500, 1000, 2500].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setMileageInputValue((prev) => (Number(prev) || car.mileage) + inc)}
                      className="bg-surface-container hover:bg-primary hover:text-white text-on-surface text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      +{inc.toLocaleString()} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Previsualización del cálculo Helper */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-primary text-[11px] uppercase tracking-wide">
                  <span className="material-symbols-outlined text-sm">insights</span>
                  <span>Recálculo Inmediato con Helper:</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-surface-container">
                  <div>
                    <span className="text-outline block text-[10px]">Próximo Hito:</span>
                    <strong className="text-primary font-mono">{previewForecast.nextServiceKm.toLocaleString()} km</strong>
                  </div>
                  <div>
                    <span className="text-outline block text-[10px]">Faltante:</span>
                    <strong className={previewForecast.kmRemaining <= 0 ? 'text-red-600' : 'text-emerald-700'}>
                      {previewForecast.kmRemaining <= 0
                        ? `¡Vencido (${Math.abs(previewForecast.kmRemaining)} km)!`
                        : `${previewForecast.kmRemaining.toLocaleString()} km`}
                    </strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-surface-container/60">
                    <span className="text-outline block text-[10px]">Nueva Fecha Estimada Calculada:</span>
                    <strong className="text-primary">{previewForecast.estimatedNextDateFormatted}</strong>
                    <span className="text-[10px] text-outline block italic">
                      ({previewForecast.determiningFactor === 'kilometraje' ? 'Por ritmo de kilometraje' : 'Por plazo semestral de tiempo'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setMileageModalCar(null)}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveMileage}
                  className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Guardar y Recalcular
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTRAR NUEVO MANTENIMIENTO EN EL HISTORIAL                    */}
      {/* ========================================================================= */}
      {isAddServiceModalOpen && selectedVehicleForHistory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-surface-container overflow-hidden animate-in fade-in duration-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">post_add</span>
                <h3 className="font-headline font-extrabold text-base text-primary">
                  Registrar Servicio en Historial
                </h3>
              </div>
              <button
                onClick={() => setIsAddServiceModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container text-outline hover:text-on-surface flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewServiceRecord} className="space-y-3.5 text-xs">
              <div className="text-[11px] text-outline bg-surface-container-low p-2 rounded-xl">
                Vehículo: <strong>{selectedVehicleForHistory.brand} {selectedVehicleForHistory.model} ({selectedVehicleForHistory.plate})</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Fecha del Servicio</label>
                  <input
                    type="date"
                    value={newServiceForm.date}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, date: e.target.value })}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Kilometraje al Servicio</label>
                  <input
                    type="number"
                    value={newServiceForm.mileage}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, mileage: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Tipo de Servicio Oficial</label>
                <input
                  type="text"
                  value={newServiceForm.serviceType}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, serviceType: e.target.value })}
                  placeholder="Ej. Mantenimiento Preventivo 25,000 km"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Costo Total (Soles)</label>
                  <input
                    type="number"
                    value={newServiceForm.costSoles}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, costSoles: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Comprobante / Factura</label>
                  <input
                    type="text"
                    value={newServiceForm.invoiceNumber}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, invoiceNumber: e.target.value })}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Detalle de Trabajos (un ítem por línea)</label>
                <textarea
                  rows={3}
                  value={newServiceForm.workSummary}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, workSummary: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Guardar en Historial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
