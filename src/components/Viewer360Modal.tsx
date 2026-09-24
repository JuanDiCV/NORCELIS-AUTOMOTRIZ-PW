import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';

interface ShowroomHotspot {
  id: string;
  category: 'faros' | 'aros' | 'motor' | 'techo';
  label: string;
  x: string;
  y: string;
  title: string;
  desc: string;
  code: string;
  minAngle?: number;
  maxAngle?: number;
}

export const Viewer360Modal: React.FC = () => {
  const {
    isViewer360Open,
    setIsViewer360Open,
    showToast,
    setIsTestDriveModalOpen,
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
  } = useApp();

  // Vehículo actual seleccionado para el Showroom
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Modos y Filtros
  const [mode, setMode] = useState<'exterior' | 'interior'>('exterior');
  const [environment, setEnvironment] = useState<'day' | 'night' | 'sunset'>('day');
  const [selectedColor, setSelectedColor] = useState<string>('blanco');
  const [componentFilter, setComponentFilter] = useState<'todos' | 'faros' | 'aros' | 'motor' | 'techo'>('todos');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Ángulo de Rotación 360° (0° a 360°)
  const [rotationAngle, setRotationAngle] = useState<number>(45);
  const [activeHotspot, setActiveHotspot] = useState<string | null>('faros');

  // Dragging state con pointer tracking seguro
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(45);
  const stageRef = useRef<HTMLDivElement>(null);

  // Panorama interior panning
  const [interiorPanX, setInteriorPanX] = useState<number>(0);

  // Colores disponibles con acabados realistas
  const colorOptions = useMemo(() => [
    {
      id: 'blanco',
      name: 'Blanco Perlado Premium (070)',
      hex: '#F4F4F6',
      badge: 'Acabado Perlado',
      filterStyle: 'brightness(1.06) contrast(1.02)',
      overlayTint: 'rgba(255, 255, 255, 0.15)',
    },
    {
      id: 'gris',
      name: 'Gris Grafito Metálico (1G3)',
      hex: '#585C63',
      badge: 'Metálico Brillante',
      filterStyle: 'contrast(1.1) brightness(0.88) grayscale(0.55)',
      overlayTint: 'rgba(50, 55, 65, 0.35)',
    },
    {
      id: 'azul',
      name: 'Azul Cosmos Profundo (8X8)',
      hex: '#1C2C4A',
      badge: 'Perla Zafiro',
      filterStyle: 'hue-rotate(185deg) saturate(1.7) brightness(0.72) contrast(1.15)',
      overlayTint: 'rgba(28, 44, 74, 0.45)',
    },
    {
      id: 'negro',
      name: 'Negro Mica Ébano (218)',
      hex: '#151618',
      badge: 'Mica Obsidiana',
      filterStyle: 'brightness(0.48) contrast(1.3) grayscale(0.4)',
      overlayTint: 'rgba(10, 12, 15, 0.55)',
    },
    {
      id: 'rojo',
      name: 'Rojo Emoción Vulcano (3T3)',
      hex: '#8F141B',
      badge: 'Multicapa Deportivo',
      filterStyle: 'hue-rotate(330deg) saturate(2.4) brightness(0.82) contrast(1.1)',
      overlayTint: 'rgba(143, 20, 27, 0.4)',
    },
  ], []);

  const currentColorObj = colorOptions.find((c) => c.id === selectedColor) || colorOptions[0];

  // Hotspots específicos según vehículo seleccionado
  const exteriorHotspots = useMemo<ShowroomHotspot[]>(() => [
    {
      id: 'faros',
      category: 'faros',
      label: 'Faros Bi-LED Projector',
      x: '24%',
      y: '58%',
      title: 'Ópticas Bi-LED Projector con DRL',
      desc: 'Luces altas automáticas (AHB), ajuste dinámico de haz y DRL LED aerodinámicas con proyector angular.',
      code: 'TSS 3.0 / OEM TOY-81110',
      minAngle: 300,
      maxAngle: 90, // Visible principalmente en frontal y 3/4 frontal
    },
    {
      id: 'aros',
      category: 'aros',
      label: 'Aros 18" Dark Graphite',
      x: '32%',
      y: '78%',
      title: 'Aros de Aleación 18" Dark Graphite',
      desc: 'Neumáticos 225/60 R18 diseñados para baja resistencia a la rodadura y frenos de disco ventilados en las 4 ruedas.',
      code: 'DIM: 18x7J 5x114.3',
      minAngle: 30,
      maxAngle: 330,
    },
    {
      id: 'sunroof',
      category: 'techo',
      label: 'Techo Panorámico',
      x: '55%',
      y: '28%',
      title: 'Sunroof Panorámico Eléctrico',
      desc: 'Apertura de un solo toque con cortinilla deslizable y vidrio laminado con protección UV 99%.',
      code: 'Confort Sky Pack',
      minAngle: 0,
      maxAngle: 360,
    },
    {
      id: 'motor',
      category: 'motor',
      label: 'Motor Dynamic Force Híbrido',
      x: '18%',
      y: '48%',
      title: `${currentVehicle.specs.engine} • ${currentVehicle.specs.power}`,
      desc: `Sistema híbrido autorecargable de alta eficiencia. Rendimiento homologado de ${currentVehicle.specs.consumption || '70 km/gal'} y transmisión ${currentVehicle.specs.transmission}.`,
      code: `TREN: ${currentVehicle.specs.traction}`,
      minAngle: 280,
      maxAngle: 100,
    },
    {
      id: 'posterior',
      category: 'techo',
      label: 'Portón & Ópticas LED Traseras',
      x: '78%',
      y: '56%',
      title: 'Maletera Eléctrica con Sensor de Pie',
      desc: 'Capacidad de 580 Litros, apertura manos libres y faros posteriores LED con firma lumínica tridimensional.',
      code: 'Smart Cargo 580L',
      minAngle: 90,
      maxAngle: 270, // Visible principalmente en la parte trasera
    },
  ], [currentVehicle]);

  const interiorHotspots = useMemo<ShowroomHotspot[]>(() => [
    {
      id: 'pantalla',
      category: 'techo',
      label: 'Pantalla 10.5" HD',
      x: '50%',
      y: '44%',
      title: 'Sistema Multimedia Táctil 10.5" HD',
      desc: 'Apple CarPlay inalámbrico, Android Auto, navegación GPS satelital nativa y sonido envolvente JBL.',
      code: 'Toyota Audio Plus HD',
    },
    {
      id: 'cluster',
      category: 'motor',
      label: 'Clúster Digital 12.3"',
      x: '35%',
      y: '48%',
      title: 'Panel de Instrumentos Digital 12.3"',
      desc: 'Cuatro modos de visualización (Casual, Smart, Tough, Sport) con flujo de energía híbrida en tiempo real.',
      code: 'Multi-Information Display',
    },
    {
      id: 'asientos',
      category: 'aros',
      label: 'Butacas Cuero SoftTex',
      x: '58%',
      y: '65%',
      title: 'Asientos Ergonómicos Cuero SoftTex',
      desc: 'Ajuste eléctrico de 8 posiciones con memoria para piloto y calefacción/ventilación para piloto y copiloto.',
      code: 'Acolchado Ortopédico',
    },
  ], []);

  // Hotspots filtrados por la categoría seleccionada
  const activeHotspotsList = useMemo(() => {
    const list = mode === 'exterior' ? exteriorHotspots : interiorHotspots;
    if (componentFilter === 'todos') return list;
    return list.filter((h) => h.category === componentFilter);
  }, [mode, exteriorHotspots, interiorHotspots, componentFilter]);

  const currentHotspotData = useMemo(() => {
    return (
      activeHotspotsList.find((h) => h.id === activeHotspot) ||
      activeHotspotsList[0] ||
      null
    );
  }, [activeHotspotsList, activeHotspot]);

  // Auto-rotación 360° en plataforma
  useEffect(() => {
    if (!isAutoRotating || !isViewer360Open || isDragging) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating, isViewer360Open, isDragging]);

  // Manejo de eventos de Drag globales
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (mode === 'exterior') {
      // Arrastrar hacia la derecha gira el auto hacia la derecha (rotación continua 0-360)
      const newAngle = Math.round(startAngleRef.current + deltaX * 0.75 + 3600) % 360;
      setRotationAngle(newAngle);
    } else {
      // Paneo interior panorámico
      setInteriorPanX((prev) => Math.max(-100, Math.min(100, prev + deltaX * 0.05)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignorar si el pointer ya no está capturado
      }
    }
  };

  // Cálculo de Transformación 3D según ángulo de visión
  const { currentAnglePerspective, rotationTransform, carShadowTransform, isMirrored } = useMemo(() => {
    // Normalizar ángulo en rango 0 a 360
    const normalized = ((rotationAngle % 360) + 360) % 360;

    // Determinar sector de visión
    let perspectiveName = '3/4 Frontal';
    if (normalized >= 340 || normalized < 20) {
      perspectiveName = 'Frontal Directo (0°)';
    } else if (normalized >= 20 && normalized < 70) {
      perspectiveName = '3/4 Frontal Derecho (45°)';
    } else if (normalized >= 70 && normalized < 115) {
      perspectiveName = 'Perfil Lateral Derecho (90°)';
    } else if (normalized >= 115 && normalized < 160) {
      perspectiveName = '3/4 Posterior Derecho (135°)';
    } else if (normalized >= 160 && normalized < 205) {
      perspectiveName = 'Posterior Directo (180°)';
    } else if (normalized >= 205 && normalized < 250) {
      perspectiveName = '3/4 Posterior Izquierdo (225°)';
    } else if (normalized >= 250 && normalized < 295) {
      perspectiveName = 'Perfil Lateral Izquierdo (270°)';
    } else {
      perspectiveName = '3/4 Frontal Izquierdo (315°)';
    }

    // Efecto espejo horizontal para ángulos izquierdos (180° a 360°)
    const mirror = normalized > 180;

    // Ángulo de inclinación 3D suave (yaw de -25deg a +25deg para realismo)
    const rad = (normalized * Math.PI) / 180;
    const yaw = Math.sin(rad) * 22;
    const pitch = Math.cos(rad) * 3;

    // Transformación del vehículo
    const transform = `perspective(1200px) rotateY(${yaw}deg) rotateX(${pitch}deg) scale(${
      (mirror ? -1 : 1) * zoomLevel
    }, ${zoomLevel})`;

    // Sombra dinámica en la plataforma giratoria
    const shadowTransform = `perspective(1000px) rotateX(65deg) rotateZ(${-normalized}deg) scale(${
      1.1 * zoomLevel
    })`;

    return {
      currentAnglePerspective: perspectiveName,
      rotationTransform: transform,
      carShadowTransform: shadowTransform,
      isMirrored: mirror,
    };
  }, [rotationAngle, zoomLevel]);

  if (!isViewer360Open) return null;

  // Imagen del vehículo según modo
  const exteriorImage = currentVehicle.image;
  const interiorImage =
    'https://lh3.googleusercontent.com/aida/AEtjO1XEuPkJsQpOvlK2Jy--9q8WzwHcyqD1bpxcM5VcHzeuflBkEc4yoRUaRUC8Ru8dnWEI_72-6IvqWbDALk6LipFJxvVR12_cqvQJ0BErTQ54HZ58LXrp7O0XJzjbxSgUqI865NYZwlQpC9gMYMWxt5p2AcQdHaeTNIjRJ81jYL5xSwW5LNDA8A2OsIH4rtS963XIHXcDnfbGwoWAdVL4ANqjDGB5eXET1TSgG6dZ00VY9k9QY85SXu9xzw';

  // Mensaje para WhatsApp con la configuración armada en el 360
  const whatsappConfigMessage = encodeURIComponent(
    `Hola Carlos Mendoza, configuré en el Showroom Virtual 360° el vehículo: ` +
    `${currentVehicle.name} (${currentColorObj.name}) con vista ${currentAnglePerspective}. ` +
    `Deseo agendar una visita presencial para verlo en concesionario.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-5 overflow-hidden">
      <div className="relative w-full h-full max-w-7xl max-h-[96vh] bg-[#070b14] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* BARRA SUPERIOR: Selector de Vehículo, Filtros de Iluminación y Modo */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-30 bg-[#070b14]/95 backdrop-blur-md">
          {/* Identidad del Showroom y Selector de Vehículo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">360</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Showroom Virtual 360°
                </span>
                <span className="text-[10px] bg-secondary-container text-white px-2 py-0.5 rounded-full font-bold">
                  Interactivo
                </span>
              </div>

              {/* Filtro Dropdown de Vehículo en Showroom */}
              <div className="relative mt-0.5">
                <select
                  value={currentVehicle.id}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    showToast(`Cargando modelo en Showroom 360°...`);
                  }}
                  className="bg-white/10 hover:bg-white/15 text-white font-headline font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1 pr-7 border border-white/20 focus:outline-none focus:border-secondary cursor-pointer max-w-[190px] xs:max-w-[250px] sm:max-w-none truncate"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id} className="bg-slate-900 text-white font-normal">
                      {v.name} ({v.year}) - {v.brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filtros Centrales de Modo & Entorno de Iluminación */}
          <div className="flex items-center gap-2">
            {/* Selector de Modo: Exterior / Cabina Interior */}
            <div className="flex bg-white/10 p-1 rounded-2xl text-xs font-semibold border border-white/10">
              <button
                onClick={() => setMode('exterior')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'exterior'
                    ? 'bg-secondary-container text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                <span>Exterior 360°</span>
              </button>
              <button
                onClick={() => setMode('interior')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'interior'
                    ? 'bg-secondary-container text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">airline_seat_recline_extra</span>
                <span>Cabina VR</span>
              </button>
            </div>

            {/* Filtro de Ambiente / Iluminación del Showroom */}
            <div className="hidden md:flex items-center bg-white/10 p-1 rounded-2xl border border-white/10 text-xs">
              <button
                onClick={() => setEnvironment('day')}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  environment === 'day'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
                title="Iluminación Estudio Día (5500K)"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-500">light_mode</span>
                <span>Día</span>
              </button>

              <button
                onClick={() => setEnvironment('night')}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  environment === 'night'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
                title="Modo Nocturno con Faros Bi-LED Encendidos"
              >
                <span className="material-symbols-outlined text-[15px] text-cyan-300">nightlight</span>
                <span>Noche LED</span>
              </button>

              <button
                onClick={() => setEnvironment('sunset')}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  environment === 'sunset'
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
                title="Iluminación Golden Hour Sunset"
              >
                <span className="material-symbols-outlined text-[15px] text-orange-300">wb_twilight</span>
                <span>Sunset</span>
              </button>
            </div>

            {/* Botón Cerrar */}
            <button
              onClick={() => setIsViewer360Open(false)}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cerrar Showroom"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* SUB-BARRA DE FILTROS DE INSPECCIÓN (Componentes del vehículo) */}
        <div className="px-4 sm:px-6 py-2 border-b border-white/10 bg-[#0a0f1d] flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none z-20">
          <div className="flex items-center gap-1.5 text-white/70 whitespace-nowrap">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1 mr-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">filter_alt</span>
              Filtro Puntos:
            </span>

            {[
              { id: 'todos', label: 'Todos los Puntos', icon: 'visibility' },
              { id: 'faros', label: 'Faros & Luces', icon: 'flare' },
              { id: 'aros', label: 'Aros & Frenos', icon: 'trip_origin' },
              { id: 'motor', label: 'Motor & Híbrido', icon: 'electric_bolt' },
              { id: 'techo', label: 'Carrocería & Techo', icon: 'roofing' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setComponentFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  componentFilter === f.id
                    ? 'bg-white/20 text-white font-bold border border-white/30 shadow-xs'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Ángulo Actual & Controles de Zoom */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="hidden sm:inline text-[11px] font-mono font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg border border-secondary/20">
              {currentAnglePerspective}
            </span>

            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                title="Reducir Zoom"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="px-1.5 text-[10px] font-mono text-white/80 font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.45, z + 0.15))}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                title="Aumentar Zoom"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* ESCENARIO 360° INTERACTIVO */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none transition-colors duration-700 ${
            environment === 'night'
              ? 'bg-[#03060c]'
              : environment === 'sunset'
              ? 'bg-[#140b08]'
              : 'bg-[#090e1a]'
          }`}
        >
          {/* Fondo de Estudio Automotriz con Iluminación Ambiental */}
          {environment === 'night' ? (
            <div className="absolute inset-0 pointer-events-none">
              {/* Halos de luz de estudio oscuro */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
              {/* Haces de luz LED proyectados según ángulo */}
              <div
                className="absolute top-1/2 left-12 -translate-y-1/2 w-[550px] h-[220px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent blur-2xl pointer-events-none opacity-90 transition-all duration-300"
                style={{
                  transform: `rotate(${(rotationAngle - 45) * 0.25}deg)`,
                  opacity: rotationAngle < 120 || rotationAngle > 240 ? 0.9 : 0.2,
                }}
              ></div>
            </div>
          ) : environment === 'sunset' ? (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-amber-600/20 via-orange-900/10 to-transparent"></div>
              <div className="absolute bottom-10 left-1/3 w-[500px] h-32 bg-amber-500/15 rounded-full blur-3xl"></div>
            </div>
          ) : (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
              <div className="absolute bottom-12 inset-x-0 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>
          )}

          {/* Plataforma Giratoria (Turntable 3D) */}
          {mode === 'exterior' && (
            <div
              className="absolute bottom-8 w-[580px] sm:w-[720px] h-[220px] rounded-full border-2 border-white/10 pointer-events-none transition-transform duration-150 flex items-center justify-center"
              style={{
                transform: carShadowTransform,
                boxShadow:
                  environment === 'night'
                    ? '0 0 50px rgba(6, 182, 212, 0.15), inset 0 0 30px rgba(255, 255, 255, 0.05)'
                    : '0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Marcas de grados en el plato giratorio */}
              <div className="absolute inset-0 rounded-full border border-dashed border-white/20"></div>
              <div className="w-[85%] h-[85%] rounded-full border border-white/10"></div>
              {/* Indicador de rumbo giratorio */}
              <div
                className="w-full h-0.5 bg-gradient-to-r from-secondary-container via-transparent to-secondary-container absolute"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              ></div>
            </div>
          )}

          {/* REPRESENTACIÓN VISUAL DEL VEHÍCULO */}
          <div className="relative max-w-4xl w-full px-6 flex items-center justify-center">
            {mode === 'exterior' ? (
              <div
                className="relative transition-transform duration-100 ease-out select-none"
                style={{
                  transform: rotationTransform,
                  filter: currentColorObj.filterStyle,
                }}
              >
                <img
                  src={exteriorImage}
                  alt={`${currentVehicle.name} 360`}
                  className="w-full max-h-[52vh] object-contain drop-shadow-[0_28px_35px_rgba(0,0,0,0.85)] pointer-events-none"
                  draggable={false}
                />

                {/* Filtro de color de carrocería superpuesto con modo de mezcla */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl"
                  style={{
                    backgroundColor: currentColorObj.overlayTint,
                    mixBlendMode: 'color',
                    opacity: selectedColor === 'blanco' ? 0.1 : 0.65,
                  }}
                />

                {/* Faros Bi-LED encendidos dinámicamente en Modo Nocturno */}
                {environment === 'night' && (rotationAngle < 110 || rotationAngle > 250) && (
                  <>
                    <div
                      className="absolute top-[52%] left-[23%] w-8 h-8 rounded-full bg-cyan-300/90 blur-xs animate-pulse shadow-[0_0_30px_#22d3ee] pointer-events-none"
                      style={{ opacity: isMirrored ? 0.4 : 1 }}
                    />
                    <div
                      className="absolute top-[50%] right-[32%] w-7 h-7 rounded-full bg-cyan-300/80 blur-xs animate-pulse shadow-[0_0_25px_#22d3ee] pointer-events-none"
                      style={{ opacity: isMirrored ? 1 : 0.4 }}
                    />
                  </>
                )}

                {/* Luces traseras rojas encendidas dinámicamente si el auto mira hacia atrás */}
                {environment === 'night' && rotationAngle >= 110 && rotationAngle <= 250 && (
                  <div className="absolute top-[48%] right-[18%] w-12 h-6 rounded-full bg-rose-600/90 blur-xs shadow-[0_0_35px_#e11d48] pointer-events-none animate-pulse" />
                )}
              </div>
            ) : (
              /* MODO CABINA INTERIOR VR PANORÁMICO */
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                <div
                  className="transition-transform duration-200 ease-out"
                  style={{ transform: `scale(${zoomLevel}) translateX(${interiorPanX}px)` }}
                >
                  <img
                    src={interiorImage}
                    alt="Cabina Interior 360 VR"
                    className="w-full max-h-[52vh] object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                <div className="absolute bottom-5 left-6 text-white pointer-events-none">
                  <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded text-white/80 font-bold">
                    Cabina Digital VR 360°
                  </span>
                  <h4 className="font-headline font-bold text-lg sm:text-xl text-white">
                    {currentVehicle.name} • Acabados SoftTex &amp; Pantalla Dual
                  </h4>
                  <p className="text-xs text-white/70">
                    Arrastra lateralmente para explorar la cabina y el puesto de conducción.
                  </p>
                </div>
              </div>
            )}

            {/* PUNTOS DE INSPECCIÓN INTERACTIVOS (HOTSPOTS) */}
            {activeHotspotsList.map((hotspot) => {
              const isActive = activeHotspot === hotspot.id;
              // Si el hotspot tiene rango de ángulos, solo mostrar si está dentro del ángulo visible
              if (
                mode === 'exterior' &&
                hotspot.minAngle !== undefined &&
                hotspot.maxAngle !== undefined
              ) {
                const inRange =
                  hotspot.minAngle > hotspot.maxAngle
                    ? rotationAngle >= hotspot.minAngle || rotationAngle <= hotspot.maxAngle
                    : rotationAngle >= hotspot.minAngle && rotationAngle <= hotspot.maxAngle;
                if (!inRange && componentFilter === 'todos') {
                  return null; // Ocultar si el ángulo actual mira hacia el lado opuesto
                }
              }

              return (
                <div
                  key={hotspot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(hotspot.id);
                  }}
                  className="absolute cursor-pointer group z-20"
                  style={{
                    top: hotspot.y,
                    left: isMirrored ? `${100 - parseFloat(hotspot.x)}%` : hotspot.x,
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-secondary-container/40 animate-ping pointer-events-none"></span>
                    <button
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary-container text-white scale-125 ring-4 ring-secondary-container/40'
                          : 'bg-white/90 text-primary hover:bg-white hover:scale-110'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">info</span>
                    </button>

                    {/* Etiqueta flotante */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                      {hotspot.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TARJETA DETALLE DEL PUNTO ACTIVO */}
          {currentHotspotData && (
            <div className="absolute bottom-5 left-5 max-w-sm bg-[#0f172a]/95 border border-white/20 backdrop-blur-md p-4 rounded-2xl shadow-2xl text-white z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-secondary-fixed uppercase font-bold tracking-wider">
                  {currentHotspotData.code}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h5 className="font-headline font-bold text-sm text-white mb-1">
                {currentHotspotData.title}
              </h5>
              <p className="text-xs text-white/70 leading-relaxed mb-3">
                {currentHotspotData.desc}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsViewer360Open(false);
                    setIsTestDriveModalOpen(true);
                  }}
                  className="bg-secondary-container hover:bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">speed</span>
                  <span>Probar en Test Drive</span>
                </button>
                <a
                  href={`https://wa.me/51987654321?text=Hola,%20quisiera%20detalles%20sobre%20${encodeURIComponent(
                    currentHotspotData.title
                  )}%20del%20${currentVehicle.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
                >
                  Consultar WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* INDICADOR DE CONTROL 360° Y COMPÁS */}
          <div className="absolute bottom-5 right-5 hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl text-white/80 text-xs">
            <span className="material-symbols-outlined text-secondary text-base">swipe</span>
            <span>Arrastra para rotar</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
              {rotationAngle}°
            </span>
          </div>
        </div>

        {/* BARRA INFERIOR DE CONFIGURACIÓN: Colores Oficiales, Presets de Ángulos y Acciones */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-[#070b14]/95 z-30 flex flex-wrap items-center justify-between gap-3">
          {/* Selector de Colores con Visualización de Acabado */}
          {mode === 'exterior' ? (
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider hidden sm:inline">
                Color de Carrocería:
              </span>
              <div className="flex items-center gap-1.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedColor(c.id);
                      showToast(`Pintura aplicada: ${c.name}`);
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative ${
                      selectedColor === c.id
                        ? 'border-secondary-container scale-125 ring-2 ring-white/60 shadow-md'
                        : 'border-white/30 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.id && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-primary font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <span className="text-xs text-secondary-fixed font-bold hidden md:inline">
                {currentColorObj.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span className="material-symbols-outlined text-emerald-400">vr180</span>
              <span>Modo Inmersivo Cabina Interior 360°</span>
            </div>
          )}

          {/* SELECTORES DE ÁNGULOS DE VISIÓN DIRECTOS (0°, 45°, 90°, 135°, 180°, 270°) */}
          {mode === 'exterior' && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full py-0.5">
              {/* Botón de Auto-Giro */}
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  isAutoRotating
                    ? 'bg-secondary-container text-white border-secondary-container shadow-xs animate-pulse'
                    : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                }`}
                title="Activar/Desactivar Rotación Automática en Plataforma"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isAutoRotating ? 'pause' : 'autorenew'}
                </span>
                <span className="hidden sm:inline">
                  {isAutoRotating ? 'Pausar' : 'Girar 360°'}
                </span>
              </button>

              {[
                { angle: 0, label: 'Frontal (0°)' },
                { angle: 45, label: '3/4 Frontal (45°)' },
                { angle: 90, label: 'Perfil (90°)' },
                { angle: 135, label: '3/4 Posterior (135°)' },
                { angle: 180, label: 'Posterior (180°)' },
                { angle: 270, label: 'Perfil Izq. (270°)' },
              ].map((btn) => {
                const isActive =
                  Math.abs(rotationAngle - btn.angle) < 15 ||
                  (btn.angle === 0 && rotationAngle > 345);
                return (
                  <button
                    key={btn.angle}
                    onClick={() => {
                      setRotationAngle(btn.angle);
                      setIsAutoRotating(false);
                      showToast(`Ángulo cambiado a: ${btn.label}`);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-slate-900 border-white shadow-sm'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Botones de Acción Comercial */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://wa.me/51987654321?text=${whatsappConfigMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span className="hidden sm:inline">Compartir por WhatsApp</span>
            </a>

            <button
              onClick={() => {
                setIsViewer360Open(false);
                setIsTestDriveModalOpen(true);
              }}
              className="bg-secondary-container hover:bg-secondary text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">speed</span>
              <span>Test Drive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
