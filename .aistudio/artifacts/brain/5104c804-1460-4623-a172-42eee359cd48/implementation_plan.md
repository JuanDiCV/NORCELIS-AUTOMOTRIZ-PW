# Gestión Completa de Autopartes y Cambio de Imágenes en Panel de Administración

Diseño e integración de la pestaña dedicada de **Autopartes & Repuestos** en la consola de administración de Nor Celis Automotriz, permitiendo a los administradores actualizar fotografías (subida de archivos locales o enlace URL), precios (Soles y USD), stock en almacén, promociones y compatibilidad vehicular con sincronización en tiempo real con el catálogo web.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Decisiones confirmadas por el usuario durante la fase interactiva de clarificación:

- **Estructura y Organización**: Pestaña dedicada "Autopartes & Repuestos" dentro del panel de administración existente, con barra de búsqueda instantánea, filtros por categoría y marca, y alternancia entre vista de cuadrícula (cards visuales) y vista de tabla operativa.
- **Alcance de Edición**: Además de la fotografía principal (mediante drag & drop local o URL web con previsualización instantánea), se gestiona precio (Soles y USD), stock disponible en sede, descuento/promoción comercial y vehículos compatibles (modelo y años).
- **Acceso Directo y Rápido**: Botón de cambio rápido de imagen directamente en la tarjeta del repuesto para actualizar fotos en 1 clic sin tener que rellenar todo el formulario.

---

### 1. Overview & Core Concept

- **Qué hace**: Proporciona a los administradores una interfaz intuitiva y completa para gestionar el inventario de repuestos y autopartes: subir nuevas imágenes, cambiar precios en Soles y Dólares, ajustar el stock de piezas en Cajamarca, editar compatibilidades técnicas y dar de alta nuevos repuestos OEM y alternativos.
- **Audiencia objetivo**: Administradores del concesionario, encargados del área de repuestos y personal de marketing de Nor Celis Automotriz.
- **Valor clave**: Elimina la necesidad de tocar código para actualizar las fotos de las autopartes, permitiendo al equipo comercial cargar fotos reales de piezas que llegan al taller y reflejarlas al instante en el catálogo público y en la ficha de detalle del producto.

---

### 2. User Experience & Visual Design

#### Flujo de Usuario:
1. **Acceso al Panel**: El administrador ingresa mediante el enlace discreto en el pie de página con su PIN de seguridad de 4 dígitos.
2. **Navegación a la Pestaña**: Selecciona la pestaña **"Autopartes & Repuestos"** que muestra el contador total de productos y KPIs de inventario.
3. **Búsqueda y Filtros**:
   - Barra de búsqueda predictiva por nombre de pieza, marca (Brembo, Bosch, Denso, etc.), código OEM o modelo de auto compatible (ej: "RAV4", "Hilux").
   - Filtros rápidos por categoría (Frenos, Filtros, Suspensión, Motor, Eléctrico, Mantenimiento) y por fabricante.
4. **Cambio Rápido de Imagen**:
   - Al pasar el cursor sobre la foto del repuesto, aparece la opción flotante **"Cambiar Foto"**.
   - Modal compacto con el componente `ImageUploadField` para arrastrar un archivo desde el ordenador o pegar un enlace web, con recorte/previsualización en vivo.
5. **Edición Completa del Repuesto**:
   - Modal detallado con pestañas de Datos Generales, Fotografía, Precios & Descuentos, Stock & Compatibilidad.
   - Posibilidad de duplicar repuestos existentes para agilizar la carga de piezas similares.
6. **Sincronización Inmediata**: Al guardar, se actualiza el estado en `AppContext` y se almacena en `localStorage` (`norcelis_custom_parts`), actualizando inmediatamente el catálogo de clientes (`/repuestos`) y la ficha técnica del producto.

#### Lenguaje Visual & Sistema de Diseño:
- **Colores Corporativos**: Azul Marino Institucional (`#212955`), Naranja Automotriz (`#F07F00`), Gris Industrial (`#9D9D9C`) y fondos limpios `bg-gray-50`.
- **Badges de Estado**: Etiquetas distintivas de OEM Certificado, En Stock (verde esmeralda), Agotado (rojo) y Descuentos comerciales (naranja vibrante).
- **Tipografía**: Manrope para jerarquía de títulos y números de parte/SKU en fuente monoespaciada para facilitar la lectura técnica.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Modal Rápido de Imagen vs. Solo Formulario Completo**
  - *Enfoque*: Implementar tanto el botón de "Cambio Rápido de Imagen" directo en cada card/fila como la edición completa en el formulario.
  - *Por qué*: Si el administrador solo desea cambiar la fotografía de un producto existente, lo hace en menos de 5 segundos sin navegar por formularios extensos.
- **Decisión 2: Compatibilidad Dual de Imagen (Archivo Local Base64 y URL Externa)**
  - *Enfoque*: Reutilizar el componente `ImageUploadField` que soporta lectura local mediante `FileReader` (generando DataURL base64 persistible) y URLs directas (Unsplash, CDN de marcas, etc.).
  - *Por qué*: Da flexibilidad total sin requerir un servidor de subida de archivos o almacenamiento S3/Cloud Storage externo.
- **Decisión 3: Modo Cuadrícula y Modo Tabla**
  - *Enfoque*: Proveer selector de vista (Grid Cards para inspección visual de imágenes vs. Table Rows para cotejo rápido de inventario y precios).
  - *Por qué*: Maximiza la usabilidad tanto para personal de marketing (que busca estética visual de fotos) como para personal de almacén (que busca SKUs, precios y stock).

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AdminDashboardView                              │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Navegación de Pestañas: [Banners] [Autos] [Autopartes] [Ofertas] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ TAB AUTOPARTES: KPIs, Buscador, Filtros Cat/Marca, Toggle Grid/Tabla│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│         │                                        │                     │
│         ▼                                        ▼                     │
│  ┌─────────────────────────┐           ┌────────────────────────────┐  │
│  │  Vista Grid (Cards)     │           │  Vista Tabla (Rows)        │  │
│  │  - Foto con Hover Rápido│           │  - Miniatura interactiva   │  │
│  │  - Datos, Precios, Stock│           │  - SKU, OEM, Precio, Stock │  │
│  │  - Acciones: Edit/Delete│           │  - Acciones rápidas        │  │
│  └─────────────────────────┘           └────────────────────────────┘  │
│                 │                                     │                │
│                 └──────────────────┬──────────────────┘                │
│                                    ▼                                   │
│            ┌──────────────────────────────────────────────┐            │
│            │  Modal de Creación / Edición Completa        │            │
│            │  - ImageUploadField (Drag&Drop local + URL)  │            │
│            │  - Precios Soles & USD, Descuentos           │            │
│            │  - Stock Cajamarca, Compatibilidad Vehicular │            │
│            └──────────────────────────────────────────────┘            │
│                                    │                                   │
│                                    ▼                                   │
│            ┌──────────────────────────────────────────────┐            │
│            │ AppContext -> updateAutoPart / addAutoPart   │            │
│            │ -> Sync a localStorage ('norcelis_custom_parts')          │
│            │ -> Actualización reactiva en PartsCatalogView │            │
│            └──────────────────────────────────────────────┘            │
└────────────────────────────────────────────────────────────────────────┘
```

#### Estructura de Datos Mutada:
```typescript
interface AutoPart {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  oemCode: string;
  priceSoles: number;
  priceUsd: number;
  oldPriceSoles?: number;
  discount?: string;
  badge?: string;
  compatibleVehicle: string;
  stockText: string;
  features: string[];
  image: string; // Base64 Data URL o URL externa
  brandType?: 'oficial' | 'homologado' | 'aftermarket';
  brandOrigin?: 'tradicional' | 'chino';
}
```

#### Plan de Modificaciones:
1. **Actualizar `AdminDashboardView.tsx`**:
   - Renderizar la sección completa de `activeTab === 'autoparts'` con KPIs, buscador en tiempo real, filtros dinámicos por categoría y marca, y alternador de vista Grid/Tabla.
   - Implementar el modal de edición/creación con `ImageUploadField` completo para imágenes locales o URL.
   - Agregar modal o popover para "Cambio Rápido de Imagen" en 1 clic.
   - Añadir exportación de repuestos a CSV (Excel) para respaldo local.
2. **Validación e Integración**:
   - Asegurar que al cambiar la imagen o el precio de un repuesto, se refleje automáticamente en el catálogo de repuestos de clientes (`/repuestos`) y en la vista de detalle (`part-pdp`).
   - Ejecutar compilación y verificación de linter sin errores.
