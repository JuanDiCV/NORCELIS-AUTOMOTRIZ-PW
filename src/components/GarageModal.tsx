import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveGarageVehicle } from '../types';

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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'switch' | 'add'>('switch');

  // Add form state
  const [customPlate, setCustomPlate] = useState('');
  const [customBrand, setCustomBrand] = useState('Toyota');
  const [customModel, setCustomModel] = useState('');
  const [customYear, setCustomYear] = useState('2025');
  const [customEngine, setCustomEngine] = useState('');

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

  const handleAddNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModel.trim()) {
      showToast('Por favor escribe el modelo de tu auto');
      return;
    }
    const newVehicle: Omit<ActiveGarageVehicle, 'id'> = {
      brand: customBrand,
      model: `${customModel.trim()} (${customYear})`,
      year: parseInt(customYear) || 2025,
      engine: customEngine.trim() || 'Motorización Estándar Gasolina / GLP',
      plate: customPlate.trim().toUpperCase() || `NC-${Math.floor(100 + Math.random() * 900)}`,
      vin: 'NC' + Date.now().toString().slice(-8),
    };

    addGarageVehicle(newVehicle);
    setCustomModel('');
    setCustomPlate('');
    setCustomEngine('');
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

  const POPULAR_BRANDS = [
    'Toyota', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Mitsubishi', 'Suzuki', 'BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen',
    'Geely', 'Jetour', 'Chery', 'Haval', 'BYD', 'Great Wall (GWM)', 'MG', 'Changan', 'JAC', 'DFSK', 'Baic'
  ];

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

        {/* Current Active Vehicle Banner */}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-outline">
                <span>Selecciona para cambiar o usa las opciones para editar o eliminar:</span>
              </div>

              {garageVehicles.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-surface-container-low rounded-2xl border border-surface-container p-6">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-outline">
                    <span className="material-symbols-outlined text-2xl">no_crash</span>
                  </div>
                  <h4 className="text-sm font-bold text-primary">No tienes vehículos registrados en tu garaje</h4>
                  <p className="text-xs text-outline max-w-xs mx-auto">
                    Registra tu auto para filtrar automáticamente repuestos compatibles.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
                  >
                    + Registrar mi primer vehículo
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {garageVehicles.map((veh, idx) => {
                    const isSelected =
                      (veh.id && veh.id === activeGarage.id) ||
                      veh.plate === activeGarage.plate ||
                      (veh.model === activeGarage.model && veh.year === activeGarage.year);

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
            </div>
          )}

          {/* TAB 2: ADD NEW VEHICLE */}
          {activeTab === 'add' && !editingVehicle && (
            <form onSubmit={handleAddNewVehicle} className="space-y-4">
              <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/15 text-xs text-primary flex items-start gap-2.5">
                <span className="material-symbols-outlined text-lg text-primary shrink-0 mt-0.5">info</span>
                <span>
                  Registra marcas oficiales o alternativas/chinas. Podrás editar o eliminar cualquier vehículo en todo momento.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Marca del Vehículo
                  </label>
                  <select
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
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
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
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
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Ej: RAV4 Hybrid / Coolray Turbo / Tucson GLS / Hilux 4x4"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Número de Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customPlate}
                    onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
                    placeholder="Ej: ABC-123"
                    maxLength={8}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium uppercase font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Motorización (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customEngine}
                    onChange={(e) => setCustomEngine(e.target.value)}
                    placeholder="Ej: 2.5L Híbrido / 1.5L Turbo / 2.8L Diésel"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

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
                  <span>Guardar y Activar Vehículo</span>
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
                    onChange={(e) => setEditBrand(e.target.value)}
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
                <input
                  type="text"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  placeholder="Ej: RAV4 Hybrid / Coolray Turbo"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  required
                />
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
                {(vehicleToDelete.plate === activeGarage.plate || vehicleToDelete.model === activeGarage.model) && (
                  <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-xl text-[11px] font-medium text-left mt-2">
                    ⚡ Este es tu vehículo activo. Al eliminarlo, se activará automáticamente el siguiente auto de tu lista.
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
