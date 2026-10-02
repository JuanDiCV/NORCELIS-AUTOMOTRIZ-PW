# Cross-Selling "Comprados Juntos Frecuentemente" (Estilo Falabella)

Módulo interactivo de venta cruzada (*frequently bought together*) inspirado fielmente en el diseño y arquitectura de Falabella para la página de detalle de repuestos (`PartPdpView`), vinculando productos complementarios por categoría y compatibilidad vehicular con un 5% de descuento promocional por compra en combo.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Se han incorporado las preferencias confirmadas en la etapa de clarificación interactiva:
> - **Criterio de recomendación**: Los productos complementarios se seleccionan dinámicamente según la categoría de la pieza y la compatibilidad vehicular del auto/modelo (frenos con líquido/pastillas, suspensión con kits de levante/bujes, aceites con filtros y aditivos).
> - **Incentivo de compra (Combo)**: Se aplica un 5% de descuento adicional al paquete cuando se adquieren 2 o más productos juntos.
> - **Ubicación en la vista**: Se posiciona directamente debajo de las especificaciones técnicas y la tabla de compatibilidad OEM de la ficha de producto.

---

## 1. Overview & Core Concept

- **Qué hace**: Al ingresar a la vista de detalle de cualquier repuesto, se presenta una cadena horizontal de artículos frecuentemente adquiridos juntos, conectados con signos `+`. El primer elemento es el producto actual (etiquetado como *"Este producto"*), seguido de 2 a 3 complementos específicos y compatibles.
- **Público objetivo**: Propietarios de vehículos, talleres mecánicos y entusiastas del 4x4 que buscan la solución completa para su mantenimiento o equipamiento sin tener que buscar cada componente por separado.
- **Valor agregado**: Incrementa el ticket promedio (AOV), simplifica la decisión de compra garantizando compatibilidad y recompensa al cliente con un 5% de descuento automático en el combo.

---

## 2. User Experience & Visual Design

### 2.1 Flujo del Usuario
1. El usuario navega en la ficha de producto (`PartPdpView`) y desciende hasta el bloque situado bajo las especificaciones técnicas.
2. Encuentra la sección con el ícono de carrito y el titular `Comprados juntos frecuentemente`.
3. Observa los artículos enlazados con signos `+`, cada uno con su imagen en alta resolución, marca en negrita, nombre comercial, precios (oferta y regular) y un checkbox activo por defecto.
4. Puede desmarcar o marcar cualquier producto del combo: los montos se recalculan instantáneamente en tiempo real.
5. El panel lateral/inferior de resumen muestra:
   - Número de piezas seleccionadas (ej. *Precio total por 3 productos*).
   - Precio regular tachado y precio final con el 5% de descuento por combo.
   - Badge distintivo de ahorro (ej. *Ahorras S/ 48.50 comprando en combo*).
   - Botón de acción principal: `Agregar seleccionados al carro`.
6. Al presionar el botón, todos los artículos seleccionados se añaden al carrito de compras en una sola transacción fluida con notificación toast de confirmación.

### 2.2 Identidad Visual y Estilo Falabella
- **Contenedor Principal (`btr-m-container`)**: Fondo blanco limpio (`bg-white`), borde sutil (`border border-slate-200/90`), esquinas redondeadas institucionales (`rounded-2xl`) y sombra suave (`shadow-sm`).
- **Encabezado (`btr-h-container`)**: Ícono de carrito corporativo en azul marino institucional (`#212955`) o naranja (`#F07F00`), titular tipográfico `Comprados juntos frecuentemente` en peso bold/black.
- **Fichas de Producto (`btr-pods`)**:
  - Badge `"Este producto"` en gris oscuro o azul para el artículo en visualización.
  - Checkbox interactivo estilo Falabella con tilde verde/azul para activar o desactivar cada ítem.
  - Imagen en contenedor cuadrado con fondo neutro y efecto hover zoom sutil.
  - Tipografía clara: Marca en mayúsculas pequeñas, nombre de repuesto limitado a 2 líneas y precio de oferta destacado en rojo/naranja Falabella (`text-[#F07F00]` / `text-rose-600`) y precio normal tachado.
  - Conector `+`: Círculo gris/azul con símbolo de adición centrado entre cada tarjeta.
- **Bloque de Compra en Combo (`btr-f-container`)**:
  - Caja de totalización destacada con cálculo dinámico.
  - Botón prominente `btn-primary` en azul marino corporativo (`bg-[#212955] hover:bg-[#181e40]`) o naranja oficial (`#F07F00`), de mínimo 48px de altura y feedback de click.

---

## 3. Key Product Decisions & Trade-Offs

- **Generador Inteligente de Complementos vs Lista Estática**:
  - *Decisión*: Implementar una función algorítmica `getCrossSellingComplements(currentPart, catalog)` que prioriza repuestos del mismo sistema vehicular (ej. Frenos -> Líquido de frenos Brembo DOT4 + Discos ranurados; Suspensión -> Kit de bujes + Amortiguadores complementarios; Aceites -> Filtro de aceite OEM + Filtro de aire), garantizando que todo producto del catálogo cuente siempre con complementos reales y funcionales sin excepciones.
  - *Razón*: Escalable, automático para los repuestos existentes y futuros, y altamente coherente para el comprador automotriz.
- **Cálculo de Descuento en Carrito**:
  - *Decisión*: El 5% de descuento por combo se aplica proporcionalmente a los artículos seleccionados al agregarse al carrito o como precio de combo especial, con desglose transparente de cuánto ahorró el cliente.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       PartPdpView                           │
│  (Ficha Técnica / Compatibilidad / Galería / Acción Compra) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FrequentlyBoughtTogether                    │
│      Componente Cross-Selling (Estilo Falabella btr-*)      │
├─────────────────────────────────────────────────────────────┤
│ • getCrossSellingComplements(currentPart, autoParts)        │
│ • State: selectedBundleSkus (Set<string>)                   │
│ • Checkbox toggle handler con recalculo reactivo            │
├─────────────────────────────────────────────────────────────┤
│  [Este producto]   [+]   [Complemento 1]   [+]   [Comp. 2]  │
│      [✓]                     [✓]                    [✓]     │
├─────────────────────────────────────────────────────────────┤
│ Resumen Combo: Subtotal S/ XXX | -5% OFF | Total S/ YYY     │
│ [ Botón: Agregar seleccionados al carro (3 productos) ]    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    AppContext / CartStore                   │
│           addToCart (iterativo / batch de ítems)            │
│               Notificación Toast de Confirmación            │
└─────────────────────────────────────────────────────────────┘
```

### Componentes y Archivos Clave:
1. `src/components/FrequentlyBoughtTogether.tsx`: Nuevo componente modular reutilizable que implementa la UI exacta mostrada en las capturas de pantalla de Falabella (incluyendo estructura de clases, tarjetas pod, conectores `+`, checkboxes y barra de totalización).
2. `src/utils/crossSellingHelper.ts`: Función de búsqueda heurística que extrae de `autoParts` los mejores 2 a 3 repuestos complementarios basados en compatibilidad vehicular y subsistemas automotrices relacionados.
3. `src/views/PartPdpView.tsx`: Inserción del componente debajo de la sección de especificaciones técnicas y compatibilidad multimarca.
