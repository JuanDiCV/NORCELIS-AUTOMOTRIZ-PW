import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HEAVY_MACHINERY_DATA } from '../data/machineryData';
import { MachineryItem } from '../types';
import { AppleCloseIcon, AppleSearchIcon } from '../components/AutoIcons';

export const MachineryRentalView: React.FC = () => {
  const { showToast, setCurrentView } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMachine, setSelectedMachine] = useState<MachineryItem | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [quoteForm, setQuoteForm] = useState({
    clientName: '',
    companyRuc: '',
    phone: '',
    location: 'Cajamarca Centro / Baños del Inca',
    durationDays: '15',
    includeOperator: true,
    includeFuel: false,
    message: '',
  });

  const categories = [
    { id: 'todos', label: 'Toda la Flota' },
    { id: 'excavacion', label: 'Excavación Pesada' },
    { id: 'movimiento_tierras', label: 'Movimiento de Tierras' },
    { id: 'carga_transporte', label: 'Carga y Volquetes' },
    { id: 'compactacion', label: 'Compactación y Suelos' },
  ];

  const brands = ['todos', 'Caterpillar', 'Komatsu', 'Volvo', 'Bobcat'];

  const filteredMachines = useMemo(() => {
    return HEAVY_MACHINERY_DATA.filter((m) => {
      const matchCategory = selectedCategory === 'todos' || m.category === selectedCategory;
      const matchBrand = selectedBrand === 'todos' || m.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchBrand && matchSearch;
    });
  }, [selectedCategory, selectedBrand, searchQuery]);

  const handleOpenQuote = (machine: MachineryItem) => {
    setSelectedMachine(machine);
    setIsQuoteModalOpen(true);
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.clientName || !quoteForm.phone) {
      showToast('Por favor completa tu nombre y teléfono de contacto');
      return;
    }

    showToast(`¡Solicitud enviada! Nuestro jefe de flota te contactará en breve con la cotización de ${selectedMachine?.name}`);
    setIsQuoteModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-gutter py-8 space-y-8 min-h-[70vh]">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-white/70 flex-wrap">
        <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors cursor-pointer">
          Inicio
        </button>
        <span>/</span>
        <span className="text-[#F07F00] font-bold">Alquiler de Maquinaria Pesada</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#181e40] via-[#212955] to-[#12162f] p-6 sm:p-10 border border-white/15 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80"
            alt="Maquinaria Pesada"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F07F00]/20 border border-[#F07F00]/40 text-[#F07F00] text-xs font-black uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
            Línea Amarilla Certificada en Cajamarca
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-headline tracking-tight uppercase leading-[1.05] text-white">
            Alquiler de Maquinaria Pesada
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
            Flota moderna de excavadoras, retroexcavadoras, cargadores y volquetes para minería, obras civiles y movimiento de tierras con soporte técnico 24/7 en toda la región norte.
          </p>

          {/* Quick guarantees badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-bold text-slate-200">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Operadores SCTR</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Telemetría GPS</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Póliza TREC Minera</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Lowboy a Obra</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4 text-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por equipo, modelo (CAT, Komatsu)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#212955] text-slate-800"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <AppleSearchIcon size={16} />
            </div>
          </div>

          {/* Brand select */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Marca:</span>
            <div className="flex flex-wrap gap-1">
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-[#212955] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {brand === 'todos' ? 'Todas' : brand}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#F07F00] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Machinery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-slate-800"
          >
            {/* Image and Badges */}
            <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
              <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="bg-[#212955] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                  {machine.brand}
                </span>
                <span className="bg-[#F07F00] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs">
                  {machine.categoryLabel}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {machine.availability}
                </span>
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
                <span>Año {machine.year}</span>
                <span>{machine.powerHp} HP</span>
                <span>{machine.operatingWeightTons} Toneladas</span>
              </div>
            </div>

            {/* Info and Specs */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h3 className="font-headline font-bold text-base text-[#212955] line-clamp-1 leading-tight group-hover:text-[#F07F00] transition-colors" title={machine.name}>
                  {machine.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {machine.shortDescription}
                </p>
              </div>

              {/* Technical specs pill summary */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Motorización:</span>
                  <span className="font-bold text-slate-700 truncate block">{machine.fullSpecs.engineModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Capacidad:</span>
                  <span className="font-bold text-slate-700">
                    {machine.bucketCapacityM3 ? `${machine.bucketCapacityM3} m³` : machine.payloadCapacityTons ? `${machine.payloadCapacityTons} Tn` : 'Estándar'}
                  </span>
                </div>
              </div>

              {/* Pricing table */}
              <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tarifa Referencial</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-[#212955]">
                      S/ {machine.hourlyRateSoles}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ hora</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Día (8h): S/ {machine.dailyRateSoles.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenQuote(machine)}
                  className="px-4 py-2 bg-[#F07F00] hover:bg-[#d97300] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Cotizar</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-600 space-y-3">
          <span className="material-symbols-outlined text-4xl text-slate-400">precision_manufacturing</span>
          <h3 className="text-base font-bold text-[#212955]">No encontramos maquinaria con esos filtros</h3>
          <p className="text-xs text-slate-500">Prueba cambiando la marca o la categoría seleccionada.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('todos');
              setSelectedBrand('todos');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#212955] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Ver toda la flota
          </button>
        </div>
      )}

      {/* Quote & Specs Modal */}
      {isQuoteModalOpen && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 relative shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <AppleCloseIcon size={18} />
            </button>

            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-extrabold uppercase text-[#F07F00] tracking-wider block">
                Solicitud de Cotización Oficial
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-headline text-[#212955] mt-1">
                {selectedMachine.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {selectedMachine.brand} • Modelo {selectedMachine.model} • Año {selectedMachine.year} • {selectedMachine.operatingWeightTons} Toneladas
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSendQuote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre o Empresa:</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.clientName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, clientName: e.target.value })}
                    placeholder="Ej: Minera / Consorcio Cajamarca"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#212955]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="tel"
                    required
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                    placeholder="Ej: 976 123 456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#212955]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ubicación de la Obra:</label>
                  <input
                    type="text"
                    value={quoteForm.location}
                    onChange={(e) => setQuoteForm({ ...quoteForm, location: e.target.value })}
                    placeholder="Ej: Yanacocha / Celendín / Bambamarca"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#212955]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duración Estimada (días):</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteForm.durationDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, durationDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#212955]"
                  />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quoteForm.includeOperator}
                    onChange={(e) => setQuoteForm({ ...quoteForm, includeOperator: e.target.checked })}
                    className="w-4 h-4 rounded text-[#212955] border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Incluir Operador Certificado</span>
                    <span className="text-[10px] text-slate-500">Con SCTR y pase médico para minería</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quoteForm.includeFuel}
                    onChange={(e) => setQuoteForm({ ...quoteForm, includeFuel: e.target.checked })}
                    className="w-4 h-4 rounded text-[#212955] border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Incluir Combustible en Obra</span>
                    <span className="text-[10px] text-slate-500">Abastecimiento con camión cisterna</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas del Proyecto / Requerimientos Especiales:</label>
                <textarea
                  rows={2}
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                  placeholder="Detalles sobre tipo de terreno, turnos de trabajo (día/noche), fecha requerida..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#212955]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#212955] hover:bg-[#181e40] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Enviar Solicitud Inmediata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
