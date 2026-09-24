import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_GARAGE_VEHICLES } from '../data/mockData';

export const GarageModal: React.FC = () => {
  const {
    isGarageModalOpen,
    setIsGarageModalOpen,
    activeGarage,
    setActiveGarage,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'switch' | 'add'>('switch');
  const [customPlate, setCustomPlate] = useState('');
  const [customBrand, setCustomBrand] = useState('Toyota');
  const [customModel, setCustomModel] = useState('');
  const [customYear, setCustomYear] = useState('2024');

  if (!isGarageModalOpen) return null;

  const handleSelectVehicle = (vehicle: typeof AVAILABLE_GARAGE_VEHICLES[0]) => {
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
    const newVehicle = {
      brand: customBrand,
      model: `${customModel} (${customYear})`,
      year: parseInt(customYear) || 2024,
      engine: 'Motorización Estándar Gasolina / GLP',
      plate: customPlate.toUpperCase() || 'NEW-001',
      vin: 'CUSTOM' + Date.now().toString().slice(-8),
    };
    setActiveGarage(newVehicle);
    setIsGarageModalOpen(false);
    showToast(`¡${newVehicle.brand} ${newVehicle.model} agregado a Mi Garaje con éxito!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full shadow-2xl border border-surface-container overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">garage</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg">Mi Garaje Virtual</h3>
              <p className="text-xs text-surface-container-highest/80">
                Filtra y valida compatibilidad OEM automática
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGarageModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Current Active Vehicle Banner */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
              Vehículo Actualmente Seleccionado
            </span>
            <span className="font-bold text-sm text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="break-words">{activeGarage.brand} {activeGarage.model} ({activeGarage.year})</span>
            </span>
            <span className="text-xs text-outline block mt-0.5 break-words">
              Placa: <strong className="text-on-surface font-mono">{activeGarage.plate}</strong> • {activeGarage.engine}
            </span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-300 shrink-0 self-start sm:self-auto">
            100% Validado
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-container">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 px-2 py-3 text-xs font-bold text-center border-b-2 transition-all leading-tight cursor-pointer ${
              activeTab === 'switch'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Mis Vehículos Guardados ({AVAILABLE_GARAGE_VEHICLES.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-2 py-3 text-xs font-bold text-center border-b-2 transition-all leading-tight cursor-pointer ${
              activeTab === 'add'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            + Registrar Otro Vehículo
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {activeTab === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs text-outline mb-2">
                Selecciona tu auto para que la tienda filtre automáticamente los repuestos y accesorios 100% compatibles.
              </p>
              {AVAILABLE_GARAGE_VEHICLES.map((veh, idx) => {
                const isSelected = veh.model === activeGarage.model && veh.year === activeGarage.year;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectVehicle(veh)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-surface-container-low shadow-sm ring-1 ring-primary'
                        : 'border-surface-container hover:border-outline-variant hover:bg-surface-container-low/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
                      }`}>
                        <span className="material-symbols-outlined text-lg">directions_car</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface flex items-center gap-2">
                          <span>{veh.brand} {veh.model}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-primary text-white px-1.5 py-0.2 rounded font-bold">
                              Activo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-outline mt-0.5">
                          Placa: {veh.plate} • {veh.engine}
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-primary text-lg">
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleAddNewVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Marca
                  </label>
                  <select
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="BMW">BMW</option>
                    <option value="Audi">Audi</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Ford">Ford</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Año
                  </label>
                  <select
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Modelo y Versión
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Ej: Yaris XLS 1.5L / Hilux 2.8L"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Número de Placa (Opcional)
                </label>
                <input
                  type="text"
                  value={customPlate}
                  onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
                  placeholder="Ej: B1X-740"
                  maxLength={7}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Guardar y Activar Vehículo
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
