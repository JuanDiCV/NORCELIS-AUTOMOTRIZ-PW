# Rediseño de Filtros Avanzados Estilo Falabella para Catálogo de Autopartes

Plan integral para reestructurar el panel de filtrado lateral en el catálogo de autopartes (`PartsCatalogView.tsx`), adoptando la jerarquía limpia y modular estilo Falabella (acordeones colapsables con insignias de conteo activo, casillas de selección múltiple y buscador rápido por marcas), manteniendo y potenciando las herramientas de grado técnico (validador de VIN y compatibilidad con vehículo activo) ancladas como tarjetas destacadas fijas en la cabecera del panel.

---

### Decisiones Críticas y Confirmaciones del Usuario

> [!IMPORTANT]
> Decisiones de diseño e interacción confirmadas en la fase de alineación:

- **Organización de Secciones**: Acordeones colapsables limpios estilo e-commerce retail con chevron indicador y contador de filtros activos por sección.
- **Mecanismo de Selección**: Casillas de verificación múltiple (checkboxes) para Categorías y Marcas (permitiendo seleccionar simultáneamente varias categorías como 'Frenos' + 'Suspensión' o marcas como 'Brembo' + 'Bosch'), complementado con un buscador instantáneo dentro del acordeón de marcas para localizar fabricantes en milisegundos.
- **Ubicación de Herramientas Especializadas**: Integradas como tarjetas prioritarias y visualmente destacadas en la parte superior del panel lateral (Validador de VIN oficial y Selector de Vehículo de Cochera), asegurando máxima visibilidad técnica antes del árbol de filtros por atributos.
- **Paleta Corporativa de Marca**: Aplicación estricta de colores empresariales:
  - Azul Corporativo Principal: `#212955` (títulos, encabezados, estados activos primarios)
  - Naranja Enérgico / Acento: `#F07F00` (badges de selección, alertas de compatibilidad, botones de acción)
  - Gris Neutro Técnico: `#9D9D9C` (bordes sutiles, líneas divisorias, etiquetas secundarias)
  - Blanco Puro: `#FFFFFF` (superficie de tarjetas y fondo limpio)

---

### 1. Visión General & Concepto Central

- **Qué Resuelve**: Reemplaza el menú lateral estático y denso por un sistema de filtrado facetado interactivo, sumamente intuitivo y fluido, inspirado en la experiencia de usuario de Falabella y marketplaces automotrices de clase mundial.
- **Audiencia Objetivo**: Conductores particulares y mecánicos que necesitan encontrar piezas compatibles sin frustración, filtrando rápidamente por marcas oficiales/alternativas, rangos de precio o compatibilidad exacta con su modelo.
- **Valor Agregado**: Reduce el tiempo de búsqueda a menos de 5 segundos, elimina compras erróneas gracias al validador de VIN destacado y permite combinaciones multicriterio transparentes.

---

### 2. Experiencia de Usuario & Diseño Visual

- **Flujo de Usuario**:
  1. *Fijación de Vehículo / VIN (Tope)*: El usuario observa de inmediato el asistente de compatibilidad para ingresar su VIN (17 caracteres) o activar el filtro de su vehículo guardado.
  2. *Exploración de Acordeones*: Las secciones (Categorías, Marcas, Rango de Precio, Tipo de Repuesto OEM/Aftermarket, y Promociones) se presentan plegadas/desplegadas ordenadamente con títulos limpios en `#212955`.
  3. *Búsqueda y Multi-Selección de Marcas*: Un campo de búsqueda compacto filtra la lista de más de 20 fabricantes en tiempo real con casillas de verificación rápida y conteo de piezas disponibles.
  4. *Chips de Filtros Aplicados*: Una barra superior de filtros activos permite remover criterios de forma individual o reiniciar todo con un solo clic.
  5. *Persistencia Responsiva*: En dispositivos móviles, un drawer deslizable reproduce exactamente la misma estructura de acordeones con botones de "Aplicar Filtros" y "Limpiar".

- **Identidad Visual & Estilizado**:
  - *Acordeones*: Encabezados con hover sutil, tipografía en peso semibold `#212955`, icono chevron animado (`rotate-180`), y badge numérico en `#F07F00` cuando hay opciones marcadas dentro.
  - *Casillas de Verificación*: Checkboxes personalizados con acento `#F07F00` y borde `#9D9D9C`, garantizando legibilidad y accesibilidad táctil ($min 40px$).
  - *Buscador de Marcas*: Input minimalista con icono de lupa, fondo neutro claro `#F8F9FA` y borde focalizado en `#212955`.
  - *Tarjetas Superiores*: Tarjeta de VIN en degradado sutil con borde `#9D9D9C`/30, micro-insignia de certificación OEM y botón de acción en contraste `#212955` y `#F07F00`.

---

### 3. Decisiones de Producto & Compensaciones

- **Multi-selección (Conjuntos) vs Selección Única**:
  - *Enfoque*: Migrar `selectedCategory` y `selectedBrand` de strings individuales a arreglos (`string[]` o `Set<string>`), permitiendo que el cliente compare repuestos entre distintas categorías afines o varios fabricantes en la misma vista.
  - *Por qué*: Responde directamente a la solicitud del usuario ("Casillas de seleccion multiple") y previene recargas innecesarias al buscar piezas relacionadas.
- **Acordeones con Memoria de Estado**:
  - *Enfoque*: Manejar el estado abierto/cerrado de cada sección mediante un objeto `openSections` (con Categorías, Marcas y Precios abiertos por defecto).
  - *Por qué*: Mantiene el panel despejado en pantallas de laptop sin esconder opciones críticas para el usuario primerizo.
- **Sincronización con Catálogo Móvil**:
  - *Enfoque*: Reutilizar la lógica de estado y componentes entre la barra lateral de escritorio y el modal drawer móvil para evitar discrepancias de filtrado.

---

### 4. Arquitectura Técnica & Estrategia de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PARTS CATALOG VIEW                                │
│                                                                             │
│ ┌──────────────────────────────────────┐  ┌───────────────────────────────┐ │
│ │  PANEL LATERAL DE FILTROS            │  │  BARRA DE CONTROL SUPERIOR    │ │
│ │                                      │  │  • Contador de resultados     │ │
│ │ ┌──────────────────────────────────┐ │  │  • Selector de ordenamiento   │ │
│ │ │ 1. TARJETA DESTACADA VIN & AUTO  │ │  │  • Chips removibles activos   │ │
│ │ │  • Input VIN (17 caracteres)     │ │  └───────────────────────────────┘ │
│ │ │  • Switch compatibilidad activa  │ │  ┌───────────────────────────────┐ │
│ │ └──────────────────────────────────┘ │  │  GRILLA DE PRODUCTOS          │ │
│ │                                      │  │                               │ │
│ │ ┌──────────────────────────────────┐ │  │  [Card Repuesto 1] [Card 2]   │ │
│ │ │ 2. ACORDEÓN: CATEGORÍAS (Multi)  │ │  │  [Card Repuesto 3] [Card 4]   │ │
│ │ │  • Checkboxes + Conteo en vivo   │ │  │                               │ │
│ │ └──────────────────────────────────┘ │  └───────────────────────────────┘ │
│ │ ┌──────────────────────────────────┐ │                                    │
│ │ │ 3. ACORDEÓN: MARCAS & FABRICANTE │ │                                    │
│ │ │  • Buscador rápido de marcas     │ │                                    │
│ │ │  • Segmento OEM vs Alternativo   │ │                                    │
│ │ │  • Checkboxes + Insignias        │ │                                    │
│ │ └──────────────────────────────────┘ │                                    │
│ │ ┌──────────────────────────────────┐ │                                    │
│ │ │ 4. ACORDEÓN: PRECIO & OFERTAS    │ │                                    │
│ │ │  • Slider interactivo S/         │ │                                    │
│ │ │  • Switch solo con descuento     │ │                                    │
│ │ └──────────────────────────────────┘ │                                    │
│ └──────────────────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Mapeo de Estados de Filtrado**:
  - `selectedCategories: string[]` (por defecto `['todos']` o vacío para mostrar todas).
  - `selectedBrands: string[]` (marcas seleccionadas de forma aditiva).
  - `brandSearchTerm: string` (término reactivo para filtrar la lista visible de marcas).
  - `brandSegment: 'todos' | 'oficial' | 'alternativa'` (filtro por tipo de fabricante).
  - `openSections: { vin: boolean, categories: boolean, brands: boolean, price: boolean, offers: boolean }`.
  - `priceMax: number`, `onlyOffers: boolean`, `onlyCompatible: boolean`.
- **Lógica de Filtrado Eficiente**: Función de predicado memoizada (`useMemo`) que evalúa en tiempo real si un repuesto cumple con la intersección de categorías, marcas, compatibilidad VIN y techo de precio.
