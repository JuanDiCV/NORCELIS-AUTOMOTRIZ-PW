import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveGarageVehicle } from '../types';
import { ModelSelect } from './ModelSelect';
import { lookupPlate, type PlateLookupStatus } from '../services/vehicles/plateLookupService';
import { isValidPeruvianPlate, formatPlate } from '../utils/plateUtils';

export const GarageModal: React.FC = () => {
  const {
    isGarageModalOpen,
    setIsGarageModalOpen,
    activeGarage,
    setActiveGarage,
    garageVehicles,
    addGarageVehicle,
    updateGarageVehicle,
    deleteGarageVehicle,
    showToast,
    vehicles,
    setSelectedVehicleId,
    setCurrentView,
    alertsEnabled,
    permissionStatus,
    requestNotificationPermission,
    setPriceAlertsSubscription,
    checkGaragePriceChanges,
    sendTestPriceAlert,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'switch' | 'add'>('switch');
  const [isCheckingPrices, setIsCheckingPrices] = useState<boolean>(false);

  // Add form state
  const [customPlate, setCustomPlate] = useState('');
  const [customBrand, setCustomBrand] = useState('Toyota');
  const [customModel, setCustomModel] = useState('');
  const [customYear, setCustomYear] = useState('2025');
  const [customEngine, setCustomEngine] = useState('');
  const [lookupStatus, setLookupStatus] = useState<PlateLookupStatus | 'idle' | 'loading'>('idle');
  const [lookupMessage, setLookupMessage] = useState('');
  const [plateVerified, setPlateVerified] = useState(false);
  const [verifiedVin, setVerifiedVin] = useState<string | undefined>(undefined);
  const [verifiedColor, setVerifiedColor] = useState<string | undefined>(undefined);

  // Edit form state
  const [editingVehicle, setEditingVehicle] = useState<ActiveGarageVehicle | null>(null);
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('2025');
  const [editPlate, setEditPlate] = useState('');
  const [editEngine, setEditEngine] = useState('');

  // Delete confirmation state
  const [vehicleToDelete, setVehicleToDelete] = useState<ActiveGarageVehicle | null>(null);

  if (!isGarageModalOpen) return null;

  const handleSelectVehicle = (vehicle: ActiveGarageVehicle) => {
    setActiveGarage(vehicle);
    setIsGarageModalOpen(false);
    showToast(`Vehículo activo cambiado a ${vehicle.brand} ${vehicle.model}`);
  };

  const handlePlateChange = (value: string) => {
    setCustomPlate(value.toUpperCase());
    // Editar la placa invalida cualquier verificación previa
    if (plateVerified || lookupStatus !== 'idle') {
      setPlateVerified(false);
      setVerifiedVin(undefined);
      setVerifiedColor(undefined);
      setLookupStatus('idle');
      setLookupMessage('');
    }
  };

  const handleVerifyPlate = async () => {
    if (!isValidPeruvianPlate(customPlate)) {
      setLookupStatus('invalid');
      setLookupMessage('El formato de la placa no es válido. Ejemplo: ABC-123.');
      return;
    }
    setLookupStatus('loading');
    setLookupMessage('Consultando el Registro Vehicular...');

    const result = await lookupPlate(customPlate);
    setLookupStatus(result.status);
    setLookupMessage(result.message);

    if (result.status === 'verified' && result.vehicle) {
      const v = result.vehicle;
      if (v.brand) {
        const match = POPULAR_BRANDS.find(
          (b) => b.toLowerCase().includes(v.brand!.toLowerCase()) || v.brand!.toLowerCase().includes(b.toLowerCase())
        );
        setCustomBrand(match ?? v.brand.charAt(0) + v.brand.slice(1).toLowerCase());
      }
      if (v.model) setCustomModel(v.model);
      if (v.year) setCustomYear(String(v.year));
      if (v.engine && !customEngine.trim()) setCustomEngine(v.engine);
      setVerifiedVin(v.vin);
      setVerifiedColor(v.color);
      setPlateVerified(true);
    }
  };

  const handleAddNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPeruvianPlate(customPlate)) {
      showToast('Ingresa una placa válida (ej. ABC-123)');
      return;
    }
    if (!customModel.trim()) {
      showToast('Por favor escribe el modelo de tu auto');
      return;
    }
    const newVehicle: Omit<ActiveGarageVehicle, 'id'> = {
      brand: customBrand,
      model: `${customModel.trim()} (${customYear})`,
      year: parseInt(customYear, 10) || new Date().getFullYear(),
      engine: customEngine.trim() || 'Motorización no especificada',
      plate: formatPlate(customPlate),
      vin: verifiedVin,
      color: verifiedColor,
      verification: plateVerified
        ? { status: 'verified', source: 'sunarp', checkedAt: new Date().toISOString() }
        : { status: 'unverified', source: 'manual' },
    };

    addGarageVehicle(newVehicle);
    setCustomModel('');
    setCustomPlate('');
    setCustomEngine('');
    setPlateVerified(false);
    setVerifiedVin(undefined);
    setVerifiedColor(undefined);
    setLookupStatus('idle');
    setLookupMessage('');
    setActiveTab('switch');
    setIsGarageModalOpen(false);
  };

  const openEditModal = (vehicle: ActiveGarageVehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehicle(vehicle);
    setEditBrand(vehicle.brand);
    // Extract base model name if it has (year) at the end
    const cleanModel = vehicle.model.replace(/\s*\(\d{4}\)$/, '');
    setEditModel(cleanModel);
    setEditYear(vehicle.year.toString());
    setEditPlate(vehicle.plate);
    setEditEngine(vehicle.engine);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    if (!editModel.trim()) {
      showToast('Por favor escribe el modelo de tu auto');
      return;
    }

    const targetKey = editingVehicle.id || editingVehicle.plate || editingVehicle.vin || '';
    updateGarageVehicle(targetKey, {
      brand: editBrand,
      model: `${editModel.trim()} (${editYear})`,
      year: parseInt(editYear) || 2025,
      plate: editPlate.trim().toUpperCase() || editingVehicle.plate,
      engine: editEngine.trim() || editingVehicle.engine,
    });

    setEditingVehicle(null);
  };

  const openDeletePrompt = (vehicle: ActiveGarageVehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setVehicleToDelete(vehicle);
  };

  const handleConfirmDelete = () => {
    if (!vehicleToDelete) return;
    const targetKey = vehicleToDelete.id || vehicleToDelete.plate || vehicleToDelete.vin || '';
    deleteGarageVehicle(targetKey);
    setVehicleToDelete(null);
  };

  const handleToggleAlerts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const shouldEnable = e.target.checked;
    await setPriceAlertsSubscription(shouldEnable);
  };

  const handleManualPriceCheck = async () => {
    setIsCheckingPrices(true);
    if (permissionStatus !== 'granted') {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') {
        setIsCheckingPrices(false);
        return;
      }
    }

    const checkResult = checkGaragePriceChanges((targetVehId) => {
      setSelectedVehicleId(targetVehId);
      setCurrentView('vehicle-pdp');
      setIsGarageModalOpen(false);
    });

    if (checkResult.hasChanges) {
      showToast(`🚨 Se detectaron ${checkResult.alerts.length} cambios de precio. Notificación web enviada.`);
    } else {
      showToast(`✓ Precios verificados para tus ${garageVehicles.length} vehículos. Catálogo oficial al día.`);
    }
    setIsCheckingPrices(false);
  };

  const handleTestNotification = async () => {
    if (permissionStatus !== 'granted') {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') {
        return;
      }
    }

    const sent = sendTestPriceAlert((targetVehId) => {
      setSelectedVehicleId(targetVehId);
      setCurrentView('vehicle-pdp');
      setIsGarageModalOpen(false);
    });

    if (sent) {
      showToast(`✓ Notificación compacta de prueba enviada al navegador`);
    }
  };

  const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => String(new Date().getFullYear() + 1 - i));

  const POPULAR_BRANDS = [
    'Toyota', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Mitsubishi', 'Suzuki', 'BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen',
    'Geely', 'Jetour', 'Chery', 'Haval', 'BYD', 'Great Wall (GWM)', 'MG', 'Changan', 'JAC', 'DFSK', 'Baic'
  ];

  const POPULAR_SUGGESTIONS: Omit<ActiveGarageVehicle, 'id'>[] = [
    {
      brand: 'Toyota',
      model: 'Hilux Revo 2.8 TDI (2025)',
      year: 2025,
      engine: '2.8L 1GD-FTV Turbo Diésel 204 HP',
      plate: 'HLX-2025',
      vin: 'MR0BA3CD20250918',
    },
    {
      brand: 'Toyota',
      model: 'RAV4 Hybrid 2.5 (2025)',
      year: 2025,
      engine: '2.5L Dynamic Force Híbrido 219 HP',
      plate: 'RAV-2025',
      vin: '4T1B11HK5JU202588',
    },
    {
      brand: 'Toyota',
      model: 'Fortuner 2.8 TDI 4x4 (2024)',
      year: 2024,
      engine: '2.8L Turbo Diésel 4x4 204 HP',
      plate: 'FTN-2024',
      vin: 'MR0BA4CD20241102',
    },
    {
      brand: 'Nissan',
      model: 'Frontier Pro-4X 2.5 (2025)',
      year: 2025,
      engine: '2.5L Bi-Turbo Diésel 190 HP',
      plate: 'NFR-2025',
      vin: '3N6DD23T4RK202511',
    },
  ];

  const handleApplySuggestion = (sug: Omit<ActiveGarageVehicle, 'id'>) => {
    addGarageVehicle(sug);
    setIsGarageModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-primary text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">garage</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg">Mi Garaje Virtual</h3>
              <p className="text-xs text-white/80">
                Administra tus autos y filtra repuestos con compatibilidad de fábrica
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingVehicle(null);
              setVehicleToDelete(null);
              setIsGarageModalOpen(false);
            }}
            className="w-9 h-9 rounded-full hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Current Active Vehicle Banner or Empty Banner */}
        {activeGarage ? (
          <div className="p-4 bg-surface-container-low border-b border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                Vehículo Actualmente Seleccionado
              </span>
              <div className="font-bold text-sm text-primary flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="truncate">{activeGarage.brand} {activeGarage.model}</span>
              </div>
              <span className="text-xs text-outline block truncate">
                Placa: <strong className="text-on-surface font-mono">{activeGarage.plate}</strong> • {activeGarage.engine}
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 shrink-0 self-start sm:self-auto flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              Activo
            </span>
          </div>
        ) : (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                Garaje Sin Vehículo Activo
              </span>
              <div className="font-bold text-sm text-[#212955] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Aún no tienes ningún vehículo configurado</span>
              </div>
              <span className="text-xs text-slate-600 block">
                Agrega tu auto o elige una sugerencia rápida para verificar compatibilidad exacta.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className="bg-[#F07F00] hover:bg-[#d97200] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Registrar Auto
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-surface-container shrink-0 bg-surface-container-lowest">
          <button
            type="button"
            onClick={() => {
              setActiveTab('switch');
              setEditingVehicle(null);
              setVehicleToDelete(null);
            }}
            className={`flex-1 px-3 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'switch' && !editingVehicle
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">directions_car</span>
            <span>Mis Vehículos Guardados ({garageVehicles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('add');
              setEditingVehicle(null);
              setVehicleToDelete(null);
            }}
            className={`flex-1 px-3 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'add'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ Registrar Otro Vehículo</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: LIST OF VEHICLES */}
          {activeTab === 'switch' && !editingVehicle && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-outline">
                <span>{garageVehicles.length === 0 ? 'Vehículos en tu garaje:' : 'Selecciona para cambiar o usa las opciones para editar o eliminar:'}</span>
              </div>

              {garageVehicles.length === 0 ? (
                <div className="space-y-5">
                  {/* Empty State Card */}
                  <div className="text-center py-8 space-y-3 bg-surface-container-low rounded-2xl border border-surface-container p-6">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-[#F07F00]">
                      <span className="material-symbols-outlined text-3xl">garage_home</span>
                    </div>
                    <h4 className="text-base font-headline font-bold text-primary">Aún no tienes ningún vehículo en tu Garaje</h4>
                    <p className="text-xs text-outline max-w-sm mx-auto leading-relaxed">
                      Registra tu vehículo para verificar compatibilidad exacta con autopartes OEM, cotizaciones y servicios.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('add')}
                      className="bg-[#212955] hover:bg-[#1a2044] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">add_circle</span>
                      + Registrar mi primer vehículo
                    </button>
                  </div>

                  {/* Quick Suggestions Block */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#212955] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#F07F00]">bolt</span>
                        Sugerencias Rápidas Populares en Perú
                      </span>
                      <span className="text-[11px] text-gray-500">Haz clic para agregar</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {POPULAR_SUGGESTIONS.map((sug) => (
                        <div
                          key={sug.model}
                          onClick={() => handleApplySuggestion(sug)}
                          className="p-3 bg-white rounded-xl border border-surface-container hover:border-[#F07F00] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[#212955] group-hover:text-[#F07F00] transition-colors truncate">
                              {sug.brand} {sug.model}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">
                              {sug.engine}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="bg-[#F07F00]/10 group-hover:bg-[#F07F00] text-[#F07F00] group-hover:text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                          >
                            + Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {garageVehicles.map((veh, idx) => {
                    const isSelected = Boolean(
                      activeGarage && (
                        (veh.id && veh.id === activeGarage.id) ||
                        veh.plate === activeGarage.plate ||
                        (veh.model === activeGarage.model && veh.year === activeGarage.year)
                      )
                    );

                    return (
                      <div
                        key={veh.id || veh.plate || idx}
                        onClick={() => handleSelectVehicle(veh)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 group ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs ring-1.5 ring-primary'
                            : 'border-surface-container hover:border-outline bg-surface-container-lowest hover:bg-surface-container-low/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                              isSelected ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-on-surface'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl">directions_car</span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-on-surface flex items-center gap-2 flex-wrap">
                              <span className="truncate">{veh.brand} {veh.model}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-primary text-white px-2 py-0.2 rounded-full font-bold shrink-0">
                                  Activo
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                  veh.verification?.status === 'verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {veh.verification?.status === 'verified' ? 'Verificado' : 'No verificado'}
                              </span>
                            </div>
                            <div className="text-[11px] text-outline mt-0.5 truncate">
                              Placa: <span className="font-mono font-semibold text-on-surface">{veh.plate}</span> • {veh.engine}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Edit and Delete */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => openEditModal(veh, e)}
                            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                            title="Editar datos de este vehículo"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openDeletePrompt(veh, e)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Eliminar este vehículo de Mi Garaje"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                          <div
                            onClick={() => handleSelectVehicle(veh)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-primary cursor-pointer ml-1"
                            title={isSelected ? 'Vehículo activo' : 'Seleccionar como activo'}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notificaciones & Alertas de Precio Web */}
              <div className="bg-surface-container-low rounded-2xl border border-surface-container p-4 space-y-3 mt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">notifications_active</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface flex items-center gap-1.5 flex-wrap">
                        <span>Alertas de Precio en Navegador</span>
                        {permissionStatus === 'granted' && alertsEnabled && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Activo
                          </span>
                        )}
                        {permissionStatus === 'denied' && (
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Bloqueado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-outline">
                        Notificaciones compactas al detectar variaciones de precio en tus vehículos
                      </p>
                    </div>
                  </div>

                  {/* Switch toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={alertsEnabled && permissionStatus === 'granted'}
                      onChange={handleToggleAlerts}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F07F00]"></div>
                  </label>
                </div>

                {permissionStatus === 'denied' && (
                  <div className="text-[11px] bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">warning</span>
                    <span>
                      Las notificaciones están bloqueadas en la configuración de tu navegador. Haz clic en el ícono del candado junto a la URL para permitirlas.
                    </span>
                  </div>
                )}

                {/* Verification and test buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={handleManualPriceCheck}
                    disabled={isCheckingPrices || garageVehicles.length === 0}
                    className="flex-1 min-h-[38px] px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isCheckingPrices ? 'sync' : 'price_check'}
                    </span>
                    <span>{isCheckingPrices ? 'Verificando...' : 'Verificar Variaciones de Precio'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="min-h-[38px] px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-surface-container-high"
                    title="Enviar notificación compacta de prueba"
                  >
                    <span className="material-symbols-outlined text-sm text-[#F07F00]">campaign</span>
                    <span>Probar Alerta</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW VEHICLE */}
          {activeTab === 'add' && !editingVehicle && (
            <form onSubmit={handleAddNewVehicle} className="space-y-4">
              <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/15 text-xs text-primary flex items-start gap-2.5">
                <span className="material-symbols-outlined text-lg text-primary shrink-0 mt-0.5">info</span>
                <span>
                  Ingresa tu placa y verificaremos los datos de tu vehículo en el Registro Vehicular para recomendarte
                  repuestos que realmente calcen. No guardamos datos del propietario.
                </span>
              </div>

              {/* Placa + verificación */}
              <div>
                <label htmlFor="garage-plate" className="block text-xs font-bold text-on-surface mb-1">
                  Número de placa <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="garage-plate"
                    type="text"
                    value={customPlate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    placeholder="Ej: ABC-123"
                    maxLength={8}
                    autoComplete="off"
                    className="flex-1 bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPlate}
                    disabled={lookupStatus === 'loading' || plateVerified}
                    className="px-4 rounded-xl bg-[#212955] hover:bg-[#181e40] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
                  >
                    {lookupStatus === 'loading' ? 'Verificando...' : plateVerified ? 'Verificada' : 'Verificar placa'}
                  </button>
                </div>

                {lookupMessage && (
                  <div
                    role="status"
                    className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                      lookupStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : lookupStatus === 'idle' || lookupStatus === 'loading'
                          ? 'bg-surface-container text-on-surface'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base shrink-0">
                      {lookupStatus === 'verified' ? 'verified' : 'info'}
                    </span>
                    <span>{lookupMessage}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Marca del vehículo</label>
                  <select
                    value={customBrand}
                    onChange={(e) => {
                      setCustomBrand(e.target.value);
                      setCustomModel('');
                    }}
                    disabled={plateVerified}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {(POPULAR_BRANDS.includes(customBrand) ? POPULAR_BRANDS : [customBrand, ...POPULAR_BRANDS]).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Año de fabricación</label>
                  <select
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    disabled={plateVerified}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {(YEAR_OPTIONS.includes(customYear) ? YEAR_OPTIONS : [customYear, ...YEAR_OPTIONS]).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Modelo y versión <span className="text-red-500">*</span>
                </label>
                <ModelSelect id="garage-model" brand={customBrand} value={customModel} onChange={setCustomModel} />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Motorización (recomendado: mejora la compatibilidad)
                </label>
                <input
                  type="text"
                  value={customEngine}
                  onChange={(e) => setCustomEngine(e.target.value)}
                  placeholder="Ej: 2.5L Híbrido / 1.5L Turbo / 2.8L Diésel"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {!plateVerified && (
                <p className="text-[11px] text-outline leading-snug">
                  Si no verificas la placa, tu vehículo se guardará como <strong>no verificado</strong> y las
                  sugerencias serán orientativas.
                </p>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className="w-1/3 bg-surface-container hover:bg-surface-container-high text-on-surface py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>{plateVerified ? 'Guardar vehículo verificado' : 'Guardar sin verificar'}</span>
                </button>
              </div>
            </form>
          )}

          {/* EDIT VEHICLE VIEW */}
          {editingVehicle && (
            <form onSubmit={handleSaveEdit} className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-secondary">edit</span>
                  <span>Editar Datos del Vehículo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="text-xs text-outline hover:text-on-surface font-semibold cursor-pointer"
                >
                  Volver a la lista
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Marca del Vehículo
                  </label>
                  <select
                    value={editBrand}
                    onChange={(e) => {
                      setEditBrand(e.target.value);
                      setEditModel('');
                    }}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {POPULAR_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Año de Fabricación
                  </label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Modelo y Versión <span className="text-red-500">*</span>
                </label>
                <ModelSelect id="garage-edit-model" brand={editBrand} value={editModel} onChange={setEditModel} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Número de Placa
                  </label>
                  <input
                    type="text"
                    value={editPlate}
                    onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                    placeholder="Ej: ABC-123"
                    maxLength={8}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium uppercase font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Motorización
                  </label>
                  <input
                    type="text"
                    value={editEngine}
                    onChange={(e) => setEditEngine(e.target.value)}
                    placeholder="Ej: 2.5L Híbrido / 1.5L Turbo"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="w-1/3 bg-surface-container hover:bg-surface-container-high text-on-surface py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* DELETE CONFIRMATION DIALOG MODAL */}
        {vehicleToDelete && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-surface-container space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="font-headline font-bold text-base text-on-surface">
                  ¿Eliminar este vehículo?
                </h4>
                <p className="text-xs text-outline leading-relaxed">
                  ¿Seguro que deseas eliminar <strong className="text-on-surface">{vehicleToDelete.brand} {vehicleToDelete.model}</strong> ({vehicleToDelete.plate}) de tu garaje?
                </p>
                {(activeGarage && (vehicleToDelete.plate === activeGarage.plate || vehicleToDelete.model === activeGarage.model)) && (
                  <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-xl text-[11px] font-medium text-left mt-2">
                    ⚡ Este es tu vehículo activo. Al eliminarlo, se actualizará tu garaje automáticamente.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVehicleToDelete(null)}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer min-h-[42px]"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
