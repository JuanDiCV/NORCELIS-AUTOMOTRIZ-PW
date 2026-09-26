# Plan de Auditoría y Operatividad al 100% del Panel de Administración Nor Celis

Auditoría integral, resolución de advertencias de ejecución y optimización de operatividad en todos los módulos del Panel de Administración: **Banners & Carrusel**, **Catálogo de Vehículos**, **Autopartes OEM**, **Ofertas & Campañas Comerciales**, **Reportes & Contabilidad CSV**, y **Seguridad & Respaldos**. Se garantiza persistencia completa en almacenamiento local (`localStorage`) y capacidad de restauración a datos de demostración de fábrica.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas por el usuario:**
> 1. **Alcance**: Revisión integral y operativa de **todos los módulos** del panel (sin excepción).
> 2. **Persistencia**: Almacenamiento persistente en navegador (`localStorage`) con botón seguro para **restaurar datos originales de demostración** en cualquier momento.

---

### 1. Overview & Core Concept

- **Qué hace**: Provee un panel de control empresarial 100% interactivo y funcional donde el administrador puede gestionar el inventario de vehículos nuevos/seminuevos, catálogo de repuestos y accesorios, diapositivas del carrusel publicitario, campañas promocionales activas, reportes contables/Kardex y credenciales de acceso con PIN.
- **Público Objetivo**: Administradores de Nor Celis Automotriz, gestores de inventario y personal comercial que actualizan precios, promociones, stock y banners de la tienda virtual.
- **Valor Clave**: Garantizar que cada botón, modal, formulario, filtro, carga de imagen, importación/exportación y conmutador funcione de forma inmediata, persistente y sin errores en consola ni llamadas prohibidas a `window.alert`/`window.confirm`.

---

### 2. User Experience & Visual Design

#### A. Módulos Auditados y Optimizados

1. **Módulo 1: Banners & Carrusel Principal (`banners`)**:
   - Creación de nuevos slides con badges personalizados, titulares en Bebas Neue, selector de imagen de producto cutout PNG y gradientes de fondo empresariales (`#212955` y `#F07F00`).
   - Edición en caliente, duplicación rápida, reordenamiento arriba/abajo y conmutador instantáneo de activación.
   - Previsualización en vivo dentro del formulario para verificar contraste y legibilidad.

2. **Módulo 2: Catálogo de Vehículos (`cars`)**:
   - Formulario completo para alta y edición de vehículos (marca, modelo, año, condición nuevo/seminuevo, precios en USD y S/, kilometraje, motor, tracción, transmisión, colores, fotos y equipamiento).
   - Filtros dinámicos por texto de búsqueda, marca, condición y transmisión; conmutador de vista tabla compacta o cuadrícula visual de tarjetas.
   - Acciones rápidas de cambio de estado (*Disponible*, *Reservado*, *Vendido*), duplicación de ficha y exportación CSV.

3. **Módulo 3: Autopartes & Repuestos OEM (`autoparts`)**:
   - Creación y edición con campos de SKU, marca, categoría, precio regular y oferta, stock en tiempo real, compatibilidad vehicular y selector de imagen con previsualización.
   - Ajuste rápido de stock en línea y cambio rápido de imagen sin abrir el formulario completo.
   - Exportación de catálogo de partes en formato CSV.

4. **Módulo 4: Campañas & Ofertas Comerciales (`offers`)**:
   - *Mejora operativa clave*: Se incorpora persistencia en `localStorage` (`norcelis_commercial_offers`) y modal de **Crear/Editar Campaña Comercial** (título, insignia/badge de descuento, descripción, beneficio y sección destino), permitiendo crear y modificar campañas además de pausarlas o activarlas.

5. **Módulo 5: Centro de Reportes & Contabilidad (`reports`)**:
   - Verificación de la suite `AccountingExportCenter`: exportación en CSV con codificación UTF-8 BOM para Excel de ventas, órdenes de taller, leads de cotización, inventario de vehículos/repuestos y resumen contable consolidado.
   - Filtros de rango de fechas y estados.

6. **Módulo 6: Seguridad & Respaldos (`security`)**:
   - Actualización de PIN de acceso de 4 dígitos con validación y confirmación.
   - Descarga de copia de seguridad integral en JSON (vehículos, partes, banners y ofertas).
   - Restauración de copia desde archivo JSON con manejo de errores mediante notificaciones toast (sustituyendo cualquier llamada a `alert()`).
   - Botón de restablecimiento de datos de fábrica con modal de confirmación en UI corporativa (evitando `window.confirm`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Eliminar `window.alert()` y `window.confirm()`**:
  - *Enfoque*: Reemplazar diálogos nativos del navegador por el sistema de notificaciones `showToast()` y un modal de confirmación visual integrado con diseño corporativo Nor Celis.
  - *Por qué*: Cumple estrictamente con las directrices de entorno iFrame y evita bloqueos de hilo en el navegador.
- **Decisión 2: Sincronización bidireccional en `localStorage`**:
  - *Enfoque*: Centralizar todas las entidades mutables en `AppContext` y `localStorage` con claves prefijadas (`norcelis_*`), incluyendo la lista de ofertas comerciales.
  - *Por qué*: Los cambios persisten tras recargar la página, facilitando pruebas completas de administración sin requerir backend complejo.
- **Decisión 3: Limpieza y validación en importación JSON**:
  - *Enfoque*: La importación de copias de seguridad validará la estructura de los datos e integrará ofertas, banners, vehículos y partes, actualizando el estado de la aplicación de inmediato.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   AdminDashboardView                   │
│                                                        │
│  ┌────────────┬─────────────┬─────────────┬──────────┐ │
│  │  Banners   │  Vehículos  │  Autopartes │ Ofertas  │ │
│  │ (Carousel) │ (Inventory) │ (OEM Parts) │(Campaign)│ │
│  └──────┬─────┴──────┬──────┴──────┬──────┴────┬─────┘ │
│         │            │             │           │       │
│  ┌──────┴─────┬──────┴──────┬──────┴─────┬─────┴─────┐ │
│  │  Reportes  │  Seguridad  │ Modal Conf.│  Toasts   │ │
│  │ (CSV/Excel)│(PIN/Backup) │ (No alert) │Feedback UI│ │
│  └────────────┴─────────────┴────────────┴───────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │     AppContext Provider   │
              │  (Vehicles, Slides, Parts,│
              │   Offers, PIN, Re-seed)   │
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   Browser LocalStorage    │
              │   • norcelis_custom_*     │
              │   • norcelis_promo_slides │
              │   • norcelis_offers       │
              └───────────────────────────┘
```
