import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: () => void;
    icon?: string;
  }[];
}

const INITIAL_SUGGESTIONS = [
  'Cuentas bancarias oficiales de la empresa',
  'Tarifas y cobertura de Shalom Express',
  'Métodos de pago Culqi y POS',
  '¿Cómo funciona el Plan Retoma?',
  'Simular cuotas de un 0 KM 2025',
  'Llantas Mickey Thompson M/T',
  'Agendar mantenimiento preventivo en taller',
  'Libro de Reclamaciones e INDECOPI',
];

export const AdvisorChatbox: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeGarage,
    setIsTestDriveModalOpen,
    setIsGarageModalOpen,
    navigateToPartsCatalog,
    showToast,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialGreeting: ChatMessage = {
    id: 'welcome-msg',
    role: 'model',
    content: `¡Hola! Soy **Don Celis**, tu Asesor Especializado de **NORCELIS AUTOMOTRIZ** (GRUPO MEVAC S.A.C.).

Estoy listo para orientarte en toda nuestra plataforma web:
• **Vehículos 0 KM 2025 & Seminuevos Certificados:** Toyota, Nissan, Hyundai, BMW y Ford.
• **Despachos Nacionales:** Envíos express a domicilio y agencias con **Shalom Express**.
• **Métodos de Pago:** Pasarela **Culqi** (tarjetas y Yape), POS inalámbrico y **Cuentas Bancarias Oficiales** (BCP, BBVA, Scotiabank).
• **Plan Retoma:** Tasación en 30 minutos y **Bono Exclusivo de hasta S/ 7,500**.
• **Repuestos Originales:** Mickey Thompson (M/T), LLumar, Mobil 1, Keko, Black Rhino, 3M y Trakko.
• **Taller Mecánico & Citas:** Mantenimiento preventivo, scanner computarizado y alineación 3D.
• **Garantías & Libro de Reclamaciones:** Cobertura de 5 años en nuevos y atención según INDECOPI.

¿En qué puedo orientarte hoy? Puedes elegir una sugerencia rápida o escribir tu consulta.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      {
        label: 'Catálogo de Autos 2025',
        action: () => setCurrentView('cars'),
        icon: 'directions_car',
      },
      {
        label: 'Repuestos Oficiales',
        action: () => setCurrentView('parts'),
        icon: 'shopping_bag',
      },
      {
        label: 'Cuentas y Pagos',
        action: () => setCurrentView('cart'),
        icon: 'account_balance',
      },
      {
        label: 'Despacho Shalom Express',
        action: () => setCurrentView('cart'),
        icon: 'local_shipping',
      },
      {
        label: 'Cita en Taller',
        action: () => setCurrentView('services'),
        icon: 'engineering',
      },
      {
        label: 'Plan Retoma (Bono)',
        action: () => setCurrentView('trade-in'),
        icon: 'published_with_changes',
      },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, isMinimized]);

  // Hide initial welcome tooltip after 10 seconds or when opened
  useEffect(() => {
    if (isOpen) {
      setShowWelcomeTooltip(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Build history for backend
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload.slice(0, -1),
          model: selectedModel,
          context: {
            activeGarage: activeGarage ? `${activeGarage.brand} ${activeGarage.model} (${activeGarage.year})` : null,
            currentView,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status})`);
      }

      const data = await response.json();
      const replyContent = data.reply || 'Disculpa, no pude procesar la respuesta en este momento. Por favor intenta nuevamente.';

      // Determine dynamic action buttons based on response keywords
      const suggestedActions = getDynamicActionsForReply(replyContent);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Advisor Chat Error:', err);
      setErrorMessage('Hubo un inconveniente al consultar con Don Celis. Puedes reintentar o comunicarte directamente por WhatsApp.');
      
      // Fallback response with helpful answers even if server fails
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'model',
        content: getSmartOfflineFallback(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            label: 'WhatsApp Atención Directa',
            action: () => window.open('https://wa.me/51965171717?text=Hola%20Nor%20Celis,%20tengo%20una%20consulta', '_blank'),
            icon: 'chat',
          },
          {
            label: 'Ver Catálogo 2025',
            action: () => setCurrentView('cars'),
            icon: 'directions_car',
          },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Smart local fallback if backend has API key latency or issues
  const getSmartOfflineFallback = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('cuenta') || q.includes('banco') || q.includes('bcp') || q.includes('bbva') || q.includes('detraccion') || q.includes('ruc')) {
      return `### Cuentas Bancarias Oficiales - GRUPO MEVAC S.A.C. (RUC 20610829318)
• **Soles BCP:** 245-9966172-0-49 (CCI: 002-245-00996617204992)
• **Soles BBVA:** 0011-0248-0100034831 (CCI: 011-248-00010003483125)
• **Soles Scotiabank:** 000-4949476
• **Dólares BCP:** 245-9964344-1-94 (CCI: 002-245-00996434419494)
• **Cuenta Detracciones Banco de la Nación:** 00-772-001053

Puedes adjuntar tu comprobante de pago vía WhatsApp oficial al **965171717** para validación inmediata.`;
    }

    if (q.includes('shalom') || q.includes('envio') || q.includes('despacho') || q.includes('provincia')) {
      return `### Envíos Nacionales Shalom Express
• **Cobertura:** 100% de agencias Shalom a nivel nacional.
• **Tiempos de entrega:** 24 a 48 horas en capitales de departamento.
• **Seguimiento:** Código de guía oficial generado automáticamente al confirmar tu compra.
• **Costo:** Gratuito en compras mayores a S/ 450 en autopartes seleccionadas.`;
    }

    if (q.includes('retoma') || q.includes('tasacion') || q.includes('mi auto') || q.includes('usado')) {
      return `### Plan Retoma Nor Celis (Tu Auto como Parte de Pago)
1. **Tasación Técnica Express:** Evaluamos tu vehículo en 30 minutos con escaneo láser.
2. **Bono Exclusivo:** Hasta **S/ 7,500 de bono** para aplicar a tu nuevo 0 KM 2025.
3. **Gestión Notarial Sunarp:** Nos encargamos de todo el trámite legal sin costos ocultos.`;
    }

    if (q.includes('mickey') || q.includes('llanta') || q.includes('aro') || q.includes('repuesto') || q.includes('keko') || q.includes('freno')) {
      return `### Repuestos y Autopartes Oficiales OEM
Contamos con stock en tiempo real de marcas líderes:
• **Mickey Thompson (M/T):** Llantas Baja Boss A/T y M/T.
• **Brembo:** Discos ventilados y pastillas cerámicas.
• **Mobil 1:** Aceites 100% sintéticos Dexos1 Gen3.
• **Keko / Ironman 4x4:** Barras antivuelco, defensas y winches 12,000 lbs.
• **LLumar / 3M:** Láminas de seguridad y polarizados con filtro UV.`;
    }

    if (q.includes('taller') || q.includes('mantenimiento') || q.includes('cita') || q.includes('aceite')) {
      return `### Taller Especializado Multimarca Nor Celis
• **Sede Principal:** Av. Vía de Evitamiento Sur 6003, Cajamarca.
• **Servicios:** Mantenimientos preventivos 10K / 20K / 40K, alineación 3D láser, escaneo electrónico con escáner oficial y cabina de pintura al horno.
• **Garantía:** 6 meses o 10,000 km en mano de obra y repuestos instalados.`;
    }

    return `¡Con gusto te ayudo! En **NORCELIS AUTOMOTRIZ** somos concesionario oficial y taller multimarcas líder en el norte del Perú. 

¿Deseas cotizar un vehículo 0 KM 2025, consultar compatibilidad de repuestos o conocer las opciones de financiamiento bancario (BCP, BBVA, Santander)?`;
  };

  const getDynamicActionsForReply = (text: string) => {
    const lower = text.toLowerCase();
    const actions: ChatMessage['suggestedActions'] = [];

    if (lower.includes('auto') || lower.includes('vehículo') || lower.includes('vehiculo') || lower.includes('0 km') || lower.includes('rav4') || lower.includes('hilux') || lower.includes('frontier')) {
      actions.push({
        label: 'Ver Catálogo de Autos',
        action: () => setCurrentView('cars'),
        icon: 'directions_car',
      });
      actions.push({
        label: 'Agendar Test Drive',
        action: () => setIsTestDriveModalOpen(true),
        icon: 'speed',
      });
    }

    if (lower.includes('repuesto') || lower.includes('autoparte') || lower.includes('llanta') || lower.includes('mickey') || lower.includes('aceite') || lower.includes('freno')) {
      actions.push({
        label: 'Ir a Catálogo de Repuestos',
        action: () => setCurrentView('parts'),
        icon: 'settings_suggest',
      });
      actions.push({
        label: 'Configurar Mi Garaje',
        action: () => setIsGarageModalOpen(true),
        icon: 'garage',
      });
    }

    if (lower.includes('taller') || lower.includes('mantenimiento') || lower.includes('cita') || lower.includes('servicio')) {
      actions.push({
        label: 'Reservar Turno en Taller',
        action: () => setCurrentView('services'),
        icon: 'calendar_month',
      });
    }

    if (lower.includes('retoma') || lower.includes('tasación') || lower.includes('tasacion') || lower.includes('usado')) {
      actions.push({
        label: 'Iniciar Plan Retoma',
        action: () => setCurrentView('trade-in'),
        icon: 'published_with_changes',
      });
    }

    if (lower.includes('cuenta') || lower.includes('banco') || lower.includes('pago') || lower.includes('shalom')) {
      actions.push({
        label: 'Ir al Carrito & Pagos',
        action: () => setCurrentView('cart'),
        icon: 'shopping_cart',
      });
    }

    // WhatsApp Direct option
    if (actions.length < 2) {
      actions.push({
        label: 'Asesor Humano WhatsApp',
        action: () => window.open('https://wa.me/51965171717?text=Hola%20Nor%20Celis,%20deseo%20asesoria', '_blank'),
        icon: 'chat',
      });
    }

    return actions.slice(0, 4);
  };

  const handleClearHistory = () => {
    setMessages([initialGreeting]);
    setErrorMessage(null);
    showToast('Conversación reiniciada con Don Celis');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to format simple markdown-like text with 100% visible typography
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className="h-2" />;
      }

      // Bullet points
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.replace(/^[\s•\-\*]+/, '').trim() : line;

      // Parse bold **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      const renderedText = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-[#212955]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 my-1 ml-1 text-slate-800">
            <span className="text-[#F07F00] font-black text-sm leading-none mt-0.5">•</span>
            <span className="flex-1 text-xs leading-relaxed text-slate-800 font-sans">{renderedText}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="text-xs leading-relaxed my-1.5 text-slate-800 font-sans">
          {renderedText}
        </p>
      );
    });
  };

  return (
    <>
      {/* FLOATING ADVISOR LAUNCHER & WHATSAPP DOCK */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Welcome Tooltip Popup on initial visit */}
        {showWelcomeTooltip && !isOpen && (
          <div className="relative bg-[#212955] text-white text-xs py-3 px-4 rounded-2xl shadow-2xl border border-[#F07F00]/50 max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
            <button
              onClick={() => setShowWelcomeTooltip(false)}
              className="absolute -top-2 -right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px] shadow cursor-pointer"
              title="Cerrar sugerencia"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-headline font-black text-[#F07F00] text-sm uppercase tracking-wider">
                Asesor en Línea
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-snug font-sans">
              ¿Deseas cotizar un 0 KM 2025, consultar repuestos <strong className="text-white font-bold">Mickey Thompson</strong> o simular cuotas? ¡Escríbeme!
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Direct WhatsApp Human Advisor */}
          <a
            href="https://wa.me/51965171717?text=Hola%20Nor%20Celis,%20deseo%20asesoria%20personalizada"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-3 rounded-full shadow-xl font-bold text-xs transition-transform hover:scale-105 group"
            title="Hablar con Asesor Humano en WhatsApp"
          >
            <span className="material-symbols-outlined text-xl">chat</span>
            <span className="hidden md:inline font-semibold">WhatsApp</span>
          </a>

          {/* AI Advisor Floating Button */}
          <button
            onClick={() => {
              setIsOpen((prev) => !prev);
              setIsMinimized(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 group border cursor-pointer ${
              isOpen
                ? 'bg-[#F07F00] text-white border-white/30 shadow-[#F07F00]/30 scale-105'
                : 'bg-[#212955] hover:bg-[#181e40] text-white border-white/20 shadow-2xl hover:scale-105'
            }`}
            title="Abrir Asesor Automotriz Virtual Nor Celis"
            aria-label="Abrir Chatbox Asesor Nor Celis"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-2xl group-hover:rotate-6 transition-transform text-white">
                {isOpen ? 'chat_bubble' : 'support_agent'}
              </span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#212955] rounded-full animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] uppercase font-headline font-black text-[#F07F00] leading-none tracking-wider">
                Asesor Virtual
              </div>
              <div className="text-xs font-black tracking-wide leading-tight text-white font-headline">
                Don Celis
              </div>
            </div>
            {isOpen ? (
              <span className="material-symbols-outlined text-sm opacity-90 text-white">expand_more</span>
            ) : (
              <span className="material-symbols-outlined text-sm opacity-90 group-hover:translate-x-0.5 transition-transform text-white">
                arrow_upward
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CHATBOX WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-w-[440px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isMinimized ? 'h-14' : 'h-[620px] max-h-[82vh]'
          }`}
          style={{ boxShadow: '0 25px 50px -12px rgba(33, 41, 85, 0.45)' }}
        >
          {/* HEADER */}
          <div className="bg-[#212955] text-white p-3.5 flex items-center justify-between border-b border-[#F07F00] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#F07F00] text-white flex items-center justify-center font-bold text-sm shadow-md">
                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#212955] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-headline font-bold text-base tracking-wide text-white">Don Celis</h3>
                  <span className="bg-[#F07F00] text-white text-[10px] font-black px-1.5 py-0.5 rounded font-headline uppercase tracking-wider shadow-2xs">
                    IA NORCELIS
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  En línea 24/7 • Asesor Automotriz Oficial
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 text-slate-300">
              {/* Reset History */}
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Reiniciar conversación"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
              >
                <span className="material-symbols-outlined text-lg">
                  {isMinimized ? 'expand_less' : 'remove'}
                </span>
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar chatbox"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* CONTEXT & MODEL BAR */}
              <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] shrink-0">
                {/* Active Garage context pill */}
                <div
                  onClick={() => setIsGarageModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-[#212955] cursor-pointer truncate max-w-[200px]"
                  title="Haz clic para cambiar el vehículo en tu Garaje Virtual"
                >
                  <span className="material-symbols-outlined text-sm text-[#F07F00]">garage</span>
                  <span className="truncate font-semibold text-slate-800">
                    Garaje: <strong className="text-[#212955]">{activeGarage.brand} {activeGarage.model}</strong>
                  </span>
                </div>

                {/* Model switcher */}
                <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs">
                  <button
                    onClick={() => setSelectedModel('gemini-3.8-flash')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      selectedModel === 'gemini-3.8-flash'
                        ? 'bg-[#212955] text-white'
                        : 'text-slate-600 hover:text-[#212955]'
                    }`}
                    title="Modelo Gemini 3.8 Flash: Especialista integral automotriz"
                  >
                    Integral
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      selectedModel === 'gemini-3.1-flash-lite'
                        ? 'bg-[#212955] text-white'
                        : 'text-slate-600 hover:text-[#212955]'
                    }`}
                    title="Modelo Gemini 3.1 Flash Lite: Respuesta ultra rápida"
                  >
                    Rápido
                  </button>
                </div>
              </div>

              {/* SCROLLABLE MESSAGES THREAD */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50 text-slate-800">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-[#212955] text-white flex items-center justify-center shrink-0 text-[11px] shadow-sm font-headline font-black">
                            NC
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                            isUser
                              ? 'bg-[#212955] text-white rounded-br-none shadow-md'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {isUser ? (
                            <p className="leading-relaxed whitespace-pre-wrap font-sans text-white text-xs">{msg.content}</p>
                          ) : (
                            <div className="text-slate-800">{renderFormattedContent(msg.content)}</div>
                          )}

                          <div
                            className={`text-[9px] mt-1 text-right font-medium ${
                              isUser ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>

                      {/* In-chat dynamic action buttons if suggested */}
                      {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-9 pt-1">
                          {msg.suggestedActions.map((act, actIdx) => (
                            <button
                              key={actIdx}
                              onClick={act.action}
                              className="flex items-center gap-1 bg-white hover:bg-[#212955] text-[#212955] hover:text-white border border-slate-300 hover:border-[#212955] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs transition-all cursor-pointer font-sans"
                            >
                              {act.icon && (
                                <span className="material-symbols-outlined text-xs text-[#F07F00]">{act.icon}</span>
                              )}
                              <span>{act.label}</span>
                              <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-[#212955] text-white flex items-center justify-center shrink-0 text-[11px] shadow-sm font-headline font-black">
                      NC
                    </div>
                    <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                      <span className="text-[11px] text-slate-600 font-medium">
                        Don Celis está respondiendo
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#F07F00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#F07F00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#F07F00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-red-600">warning</span>
                      <span>{errorMessage}</span>
                    </span>
                    <button
                      onClick={() => handleSendMessage()}
                      className="text-xs underline font-bold hover:opacity-80 cursor-pointer"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK SUGGESTION CHIPS */}
              <div className="bg-slate-100 px-3 py-2 border-t border-slate-200 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-[10px] font-black text-[#212955] uppercase tracking-wider pl-1 font-headline">
                    Sugerencias:
                  </span>
                  {INITIAL_SUGGESTIONS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      disabled={isLoading}
                      className="text-[11px] bg-white hover:bg-[#212955] text-slate-800 hover:text-white px-2.5 py-1 rounded-full border border-slate-300 hover:border-[#212955] transition-all font-semibold cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUT BAR */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 relative bg-slate-50 rounded-xl border border-slate-300 focus-within:border-[#212955] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#212955]/15 transition-all">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Pregunta sobre autos 2025, repuestos o cuotas..."
                      rows={1}
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent resize-none focus:outline-none max-h-24 min-h-[40px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-[#F07F00] hover:bg-[#d97300] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-colors shadow-md disabled:cursor-not-allowed shrink-0 cursor-pointer"
                    title="Enviar mensaje"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1 font-sans">
                  <span>Asesor Oficial Norcelis • Multimarca Perú</span>
                  <span className="text-[10px] text-[#F07F00] font-bold">NORCELIS IA</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
