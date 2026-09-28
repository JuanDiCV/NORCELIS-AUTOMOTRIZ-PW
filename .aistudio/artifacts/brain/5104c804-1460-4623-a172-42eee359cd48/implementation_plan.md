# Plan de Implementación: Hub de Canales Flotantes con Cotización Rápida

Implementaremos un sistema unificado y ordenado de accesos flotantes que integra:
1. **Asesor Virtual IA (Norcelis Assistant)**
2. **Atención Directa por WhatsApp**
3. **Nuevo Botón Flotante de Cotización Rápida (Naranja Norcelis con Modal y PDF / WhatsApp)**

Garantizando que nunca se superpongan ni obstruyan el contenido de la web o en dispositivos móviles.

---

### Componentes y Cambios Clave

#### 1. Nuevo Modal de Cotización Rápida (`src/components/QuickQuoteModal.tsx`)
- Selector inteligente del ítem a cotizar:
  - Vehículos 0km / Seminuevos (Toyota Hilux, Land Cruiser, Fortuner, Rav4, Corolla Cross, etc.)
  - Repuestos o autopartes (Líquidos de frenos DOT 4/5.1 Brembo, filtros OEM, amortiguadores, etc.)
  - Servicio de taller / mantenimiento preventivo
- Formulario ágil con validación de datos (Nombre, Teléfono / WhatsApp, DNI / RUC, Ciudad de entrega como Cajamarca o Jaén).
- Opciones de acción inmediata:
  - **Generar y descargar cotización formal en PDF** con membrete oficial de Norcelis Motors.
  - **Enviar cotización directa a un asesor por WhatsApp** con el desglose prellenado.

#### 2. Reorganización del Floating Hub (`src/components/AdvisorChatbox.tsx` o `src/components/FloatingActionsHub.tsx`)
- En lugar de 3 botones flotantes dispersos o apilados verticalmente que tapen el contenido:
  - Un **Hub Flotante Unificado / Speed Dial** en la esquina inferior derecha (`bottom-6 right-6`).
  - En estado compacto: Botón principal elegante o píldora accesible con micro-indicadores de estado ("Cotizar", "WhatsApp", "Asesor IA").
  - Al abrir o interactuar: Despliega ordenadamente las 3 acciones con sus etiquetas tooltips accesibles:
    - **Cotización Rápida** (Botón naranja ámbar distintivo `#ea580c` / `#f97316` con ícono de documento / cotización).
    - **WhatsApp Oficial** (Botón verde `#22c55e` con ícono de WhatsApp y enlace directo).
    - **Asesor Virtual IA** (Botón azul marino / índigo con el bot animado de Norcelis).
  - Al abrir el chat del asesor IA, los botones flotantes se minimizan o retraen automáticamente para no tapar la ventana del chat.

#### 3. Integración en `App.tsx` y Contexto
- Conexión del modal de cotización rápida con el estado global de la app (permitiendo cotizar desde cualquier vista o con el vehículo / repuesto preseleccionado si el usuario está viendo uno).

---

### Verificación
- Prueba en resoluciones móviles (`< 640px`) y desktop (`> 1024px`).
- Verificación de que no haya colisión visual con el footer, chats o modales.
- Ejecución de compilación y linter (`compile_applet` y `lint_applet`).
