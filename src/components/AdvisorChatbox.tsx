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
  '¿Cómo funciona el Plan Retoma?',
  '¿Qué llantas Mickey Thompson M/T tienen?',
  'Simular cuotas de un 0 KM 2025',
  'Láminas de seguridad LLumar para mi auto',
  '¿Tienen aceites sintéticos Mobil 1?',
  'Agendar mantenimiento preventivo de taller',
];

export const AdvisorChatbox: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeGarage,
    setIsTestDriveModalOpen,
    setIsGarageModalOpen,
    navigateToPartsCatalog,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialGreeting: ChatMessage = {
    id: 'welcome-msg',
    role: 'model',
    content: `¡Hola! Soy **Don Celis**, tu Asesor Especializado de **Automotriz Nor Celis**.

Estoy aquí para ayudarte en tiempo real con:
• **Vehículos Nuevos 2025 y Seminuevos Certificados** (Toyota, Nissan, Hyundai, BMW, Ford).
• **Plan Retoma:** Valora tu auto usado y llévate un **Bono de hasta S/ 7,500**.
• **Simulación de Financiamiento:** Cuotas a tu medida con BCP, BBVA y Santander.
• **Repuestos Oficiales:** Mickey Thompson (M/T), LLumar, Mobil 1, Keko, Black Rhino, 3M y Trakko.
• **Citas de Taller Mecánico:** Mantenimientos oficiales y scanner computarizado.

¿En qué puedo orientarte hoy?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          messages: historyPayload,
          model: selectedModel,
          context: {
            activeGarage,
            currentView,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status})`);
      }

      const data = await response.json();
      const replyContent = data.reply || 'Disculpa, no pude procesar la respuesta en este momento.';

      // Generate context-aware action shortcuts based on response text
      const suggestedActions = extractActions(replyContent);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage('No se pudo conectar con el servidor. Intenta de nuevo en unos momentos.');
      
      // Fallback friendly message
      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: `Disculpa la interrupción. Si necesitas atención inmediata, puedes contactar a nuestro equipo de ventas y taller por **WhatsApp al +51 987 654 321** o explorar directamente nuestras secciones de vehículos y repuestos.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            label: 'Ver Catálogo 2025',
            action: () => setCurrentView('cars'),
            icon: 'directions_car',
          },
          {
            label: 'Repuestos Oficiales',
            action: () => setCurrentView('parts'),
            icon: 'build',
          },
          {
            label: 'Contactar por WhatsApp',
            action: () => window.open('https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20deseo%20asesoria', '_blank'),
            icon: 'chat',
          },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractActions = (text: string) => {
    const actions: { label: string; action: () => void; icon?: string }[] = [];
    const lower = text.toLowerCase();

    if (lower.includes('retoma') || lower.includes('tasación') || lower.includes('parte de pago') || lower.includes('bono de s/ 7,500') || lower.includes('bono')) {
      actions.push({
        label: 'Ver Plan Retoma (Bono S/ 7,500)',
        action: () => setCurrentView('trade-in'),
        icon: 'published_with_changes',
      });
    }

    if (lower.includes('financiam') || lower.includes('cuota') || lower.includes('bcp') || lower.includes('bbva') || lower.includes('inicial')) {
      actions.push({
        label: 'Simular Financiamiento',
        action: () => setCurrentView('financing'),
        icon: 'payments',
      });
    }

    if (lower.includes('mickey thompson') || lower.includes('keko') || lower.includes('mobil') || lower.includes('llumar') || lower.includes('black rhino') || lower.includes('repuesto') || lower.includes('llanta') || lower.includes('trakko') || lower.includes('freno')) {
      actions.push({
        label: 'Ver Repuestos Oficiales',
        action: () => setCurrentView('parts'),
        icon: 'shopping_bag',
      });
    }

    if (lower.includes('taller') || lower.includes('mantenimiento') || lower.includes('scanner') || lower.includes('alineación') || lower.includes('cita')) {
      actions.push({
        label: 'Agendar Cita en Taller',
        action: () => setCurrentView('services'),
        icon: 'engineering',
      });
    }

    if (lower.includes('test drive') || lower.includes('prueba de manejo')) {
      actions.push({
        label: 'Solicitar Test Drive',
        action: () => setIsTestDriveModalOpen(true),
        icon: 'speed',
      });
    }

    if (lower.includes('rav4') || lower.includes('frontier') || lower.includes('tucson') || lower.includes('seminuevo') || lower.includes('0 km') || lower.includes('catálogo')) {
      actions.push({
        label: 'Explorar Catálogo de Autos',
        action: () => setCurrentView('cars'),
        icon: 'directions_car',
      });
    }

    return actions.slice(0, 3);
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Deseas reiniciar la conversación con Don Celis?')) {
      setMessages([initialGreeting]);
      setErrorMessage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to format simple markdown-like text
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
            <strong key={partIdx} className="font-bold text-on-surface">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 my-0.5 ml-1">
            <span className="text-secondary font-bold text-xs mt-0.5">•</span>
            <span className="flex-1 text-xs leading-relaxed">{renderedText}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="text-xs leading-relaxed my-1">
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
          <div className="relative bg-primary text-white text-xs py-2.5 px-4 rounded-2xl shadow-2xl border border-secondary/40 max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
            <button
              onClick={() => setShowWelcomeTooltip(false)}
              className="absolute -top-2 -right-2 bg-surface-container text-on-surface hover:text-error rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px] shadow"
              title="Cerrar sugerencia"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-secondary-fixed text-[11px] uppercase tracking-wider">Asesor en Línea</span>
            </div>
            <p className="text-surface-variant text-[11px] leading-snug">
              ¿Deseas cotizar un 0 KM 2025, consultar repuestos <strong>Mickey Thompson</strong> o simular cuotas? ¡Escríbeme!
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Direct WhatsApp Human Advisor */}
          <a
            href="https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20deseo%20asesoria%20personalizada"
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
            className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 group border ${
              isOpen
                ? 'bg-secondary text-white border-secondary-fixed shadow-secondary/25'
                : 'bg-primary hover:bg-primary-container text-white border-surface-container shadow-primary/30 hover:scale-105'
            }`}
            title="Abrir Asesor Automotriz Virtual Nor Celis"
            aria-label="Abrir Chatbox Asesor Nor Celis"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-2xl group-hover:rotate-6 transition-transform">
                {isOpen ? 'chat_bubble' : 'support_agent'}
              </span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-primary rounded-full animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-secondary-fixed-dim leading-none">
                Asesor Virtual
              </div>
              <div className="text-xs font-black tracking-wide leading-tight">
                Don Celis
              </div>
            </div>
            {isOpen ? (
              <span className="material-symbols-outlined text-sm opacity-80">expand_more</span>
            ) : (
              <span className="material-symbols-outlined text-sm opacity-80 group-hover:translate-x-0.5 transition-transform">
                arrow_upward
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CHATBOX WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-w-[440px] bg-surface rounded-2xl shadow-2xl border border-surface-container flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isMinimized ? 'h-14' : 'h-[620px] max-h-[82vh]'
          }`}
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 14, 40, 0.35)' }}
        >
          {/* HEADER */}
          <div className="bg-primary text-white p-3.5 flex items-center justify-between border-b border-primary-container shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shadow-inner border border-secondary-fixed">
                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">Don Celis</h3>
                  <span className="bg-secondary/30 text-secondary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded border border-secondary/40">
                    IA Nor Celis
                  </span>
                </div>
                <p className="text-[11px] text-surface-dim flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  En línea 24/7 • Asesor Automotriz Oficial
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 text-surface-dim">
              {/* Reset History */}
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-primary-container rounded-lg transition-colors"
                title="Reiniciar conversación"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 hover:text-white hover:bg-primary-container rounded-lg transition-colors"
                title={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
              >
                <span className="material-symbols-outlined text-lg">
                  {isMinimized ? 'expand_less' : 'remove'}
                </span>
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-primary-container rounded-lg transition-colors"
                title="Cerrar chatbox"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* CONTEXT & MODEL BAR */}
              <div className="bg-surface-container-low px-3.5 py-2 border-b border-surface-container flex items-center justify-between text-[11px] shrink-0">
                {/* Active Garage context pill */}
                <div
                  onClick={() => setIsGarageModalOpen(true)}
                  className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary cursor-pointer truncate max-w-[200px]"
                  title="Haz clic para cambiar el vehículo en tu Garaje Virtual"
                >
                  <span className="material-symbols-outlined text-sm text-secondary">garage</span>
                  <span className="truncate font-medium">
                    Garaje: <strong>{activeGarage.brand} {activeGarage.model}</strong>
                  </span>
                </div>

                {/* Model switcher */}
                <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5 border border-surface-container">
                  <button
                    onClick={() => setSelectedModel('gemini-3.5-flash')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      selectedModel === 'gemini-3.5-flash'
                        ? 'bg-primary text-white'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title="Modelo Gemini 3.5 Flash: Especialista integral automotriz"
                  >
                    Integral
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      selectedModel === 'gemini-3.1-flash-lite'
                        ? 'bg-primary text-white'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title="Modelo Gemini 3.1 Flash Lite: Respuesta ultra rápida"
                  >
                    Rápido
                  </button>
                </div>
              </div>

              {/* SCROLLABLE MESSAGES THREAD */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-background text-on-surface">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs shadow-sm font-bold">
                            NC
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                            isUser
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-surface-container-lowest text-on-surface border border-surface-container rounded-bl-none'
                          }`}
                        >
                          {isUser ? (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div>{renderFormattedContent(msg.content)}</div>
                          )}

                          <div
                            className={`text-[9px] mt-1 text-right ${
                              isUser ? 'text-primary-fixed-dim' : 'text-on-surface-variant'
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
                              className="flex items-center gap-1 bg-surface-container hover:bg-secondary/15 text-primary hover:text-secondary border border-surface-container-high hover:border-secondary/40 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs transition-colors"
                            >
                              {act.icon && (
                                <span className="material-symbols-outlined text-xs">{act.icon}</span>
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
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs shadow-sm font-bold">
                      NC
                    </div>
                    <div className="bg-surface-container-lowest text-on-surface border border-surface-container rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Don Celis está respondiendo
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-error/10 border border-error/20 text-error text-xs p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>{errorMessage}</span>
                    </span>
                    <button
                      onClick={() => handleSendMessage()}
                      className="text-xs underline font-bold hover:opacity-80"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK SUGGESTION CHIPS */}
              <div className="bg-surface-container-low px-3 py-2 border-t border-surface-container overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
                    Sugerencias:
                  </span>
                  {INITIAL_SUGGESTIONS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      disabled={isLoading}
                      className="text-[11px] bg-surface hover:bg-secondary/10 hover:text-secondary text-on-surface px-2.5 py-1 rounded-full border border-surface-container hover:border-secondary/40 transition-colors font-medium cursor-pointer disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUT BAR */}
              <div className="p-3 bg-surface border-t border-surface-container shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 relative bg-surface-container-lowest rounded-xl border border-surface-container-high focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Pregunta sobre autos 2025, repuestos o cuotas..."
                      rows={1}
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 bg-transparent resize-none focus:outline-none max-h-24 min-h-[40px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-secondary disabled:bg-surface-container disabled:text-outline text-white flex items-center justify-center transition-colors shadow-sm disabled:cursor-not-allowed shrink-0"
                    title="Enviar mensaje"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-on-surface-variant px-1">
                  <span>Asesor Oficial Nor Celis • Multimarca Perú</span>
                  <span className="text-[9px] text-secondary font-semibold">Gemini 3 Series</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
