# Plan de Optimización de Código y Rediseño CMS del Panel de Administración

Transformar el header y la barra del panel de administración en un **CMS profesional de gestión de contenidos web y operaciones comerciales** de Nor Celis Automotriz, agrupando sus funcionalidades de forma intuitiva, junto con una **optimización integral del rendimiento del código** (memoización, aligeramiento de renders y persistencia fluida).

---

## Decisiones Críticas Confirmadas

- **Estructura del Header**: Diseño tipo **CMS profesional** estructurado en dos grupos de navegación claramente diferenciados:
  1. **Contenidos Web (CMS)**: Banners & Publicidad, Marcas & Categorías de Portada, Ofertas & Campañas Comerciales.
  2. **Inventario & Operaciones**: Inventario de Autos, Autopartes & Repuestos OEM, Reportes Contables CSV, Seguridad & Respaldos JSON.
- **Optimización de Código**: Enfoque en **rendimiento integral**: memoización (`useMemo`, `useCallback`) de listas y filtros pesados, reducción de renderizados redundantes, optimización de persistencia en `localStorage` y limpieza de código residual.

---

## 1. Visión General del Rediseño del Header Admin (CMS Hub)

El panel actual reúne tanto herramientas de publicación visual (banners, marcas, categorías, ofertas) como herramientas operativas de negocio (inventario automotriz, repuestos, reportes contables, seguridad).

### Arquitectura de Navegación del Header CMS:
```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  NOR CELIS AUTOMOTRIZ  ·  CMS & Gestor Web    [● Sitio en Vivo]       [↗ Ver Tienda] [Cerrar]│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  CONTENIDO WEB & PORTADA (CMS)                │  INVENTARIO & OPERACIONES COMERCIALES       │
│  [Banners]  [Marcas & Categorías]  [Ofertas]  │  [Autos]  [Autopartes]  [Reportes] [Seguridad]│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Barra Superior Ejecutiva**:
   - Identidad corporativa clara: `NOR CELIS AUTOMOTRIZ · Portal de Contenidos & Operaciones`.
   - Indicador de estado del sitio en tiempo real con punto verde animado (`Sitio en Vivo · Cajamarca`).
   - Botón directo de acceso rápido con icono para previsualizar la tienda (`Ver Tienda Pública ↗`).
   - Botón de cierre de sesión seguro con protección de PIN.

2. **Navegación Segmentada en 2 Grupos Lógicos**:
   - **Bloque A — Contenido Web & Portada**:
     - *Banners & Publicidad*: Control del carrusel principal hero y campañas de marketing.
     - *Marcas & Categorías*: Gestión de la pasarela continua infinita de marcas y 6 tarjetas cinemáticas de inicio.
     - *Ofertas Destacadas*: Bonos comerciales, tasas de financiamiento y promociones.
   - **Bloque B — Inventario & Operaciones**:
     - *Inventario de Autos*: Unidades 0 km y seminuevos con precios USD/PEN y especificaciones.
     - *Autopartes & Repuestos*: Catálogo técnico OEM, compatibilidad por modelo/VIN y stock.
     - *Reportes & Contabilidad*: Centro de exportación de nómina de ventas, órdenes y catálogos en CSV.
     - *Seguridad & Respaldos*: Cambio de PIN de 4 dígitos, copias de seguridad JSON completas y reinicio.

3. **KPI Cards con Formato Numérico Tabular (`tabular-nums`)**:
   - Tarjetas de estadísticas de inventario, valor estimado en USD, banners activos y marcas registradas con alineación numérica precisa y microinteracciones de hover fluidas.

---

## 2. Optimización Integral del Código y Rendimiento

1. **Memoización Avanzada (`useMemo` y `useCallback`)**:
   - En `AdminDashboardView.tsx`: Optimizar los filtros de búsqueda de vehículos, autopartes y marcas para evitar recálculos en cada pulsación de tecla o cambio de estado ajeno.
   - En `HomeView.tsx`: Memoizar los cálculos de autopartes filtradas por pestaña rápida, listas de vehículos nuevos/seminuevos y marcas en rotación.
   - En `CatalogView.tsx` y `VehicleCatalogView.tsx`: Garantizar que el filtrado por marcas, categorías, años y precios no bloquee el hilo principal del navegador.

2. **Optimización de Lectura/Escritura en Almacenamiento Local (`localStorage`)**:
   - Reducir escrituras innecesarias en `AppContext.tsx` mediante debounce o comprobaciones de igualdad de estado antes de serializar estructuras JSON voluminosas.
   - Manejo seguro y tolerante a fallos ante cuotas de almacenamiento o datos corruptos.

3. **Limpieza y Pulido de Código**:
   - Depurar selectores o clases CSS redundantes.
   - Asegurar accesibilidad (`focus-visible`, contraste WCAG AA, textos de botones semánticos).
   - Verificación estricta de compilación (`compile_applet`) y tipado (`lint_applet`).

---

## 3. Plan de Ejecución por Fases

1. **Fase 1: Rediseño del Header y Navegación del Panel de Administración**:
   - Actualizar el encabezado en `AdminDashboardView.tsx` incorporando la barra ejecutiva y los dos grupos de pestañas ("Contenido Web" e "Inventario & Operaciones").
   - Añadir badges contadores visuales discretos y accesos directos de navegación rápida.
2. **Fase 2: Optimización de Rendimiento y Renders**:
   - Refactorizar y memoizar selectores y filtros clave en `AdminDashboardView.tsx` y `HomeView.tsx`.
   - Optimizar manejadores de eventos con `useCallback`.
3. **Fase 3: Verificación, Linting y Compilación**:
   - Ejecutar `lint_applet` para garantizar cero advertencias y errores de tipos.
   - Ejecutar `compile_applet` para confirmar una compilación impecable y validar la experiencia en vivo.
