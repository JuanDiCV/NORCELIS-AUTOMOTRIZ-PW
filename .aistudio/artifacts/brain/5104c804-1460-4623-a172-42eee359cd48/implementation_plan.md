# Plan de Implementación: Actualización y Sincronización del Panel de Administración de Banners y Contenidos

Se actualizará el Panel de Control de Administración para permitir la gestión centralizada y sincronizada de **todos los banners y piezas publicitarias** de la tienda Nor Celis (Carrusel Hero principal, Banner Panorámico 4x4 de sección intermedia y Tarjetas de Oferta en cuadrícula estilo retail).

---

## 1. Estructura de Datos y Estado Global (`types` y `AppContext`)
- **Nuevos Tipos de Contenido:**
  - `PanoramicBannerConfig`: Para el banner central de equipamiento 4x4 / overland (título, subtítulo, botón CTA, enlaces, tarjeta destacada izquierda y derecha con imágenes, precios y cuotas).
  - `ShowcaseOfferCard`: Para las cuadrículas de 4 tarjetas de ofertas (categoría, marca, nombre, precio de oferta, precio normal, cuota mensual, SKU y estado de stock).
- **Gestión en `AppContext`:**
  - Estados reactivos sincronizados con `localStorage` (`norcelis_promo_slides`, `norcelis_panoramic_banners`, `norcelis_showcase_cards`).
  - Métodos CRUD para actualizar banners individuales, restaurar a los últimos datos oficiales y sincronizar en tiempo real.

---

## 2. Rediseño y Potenciación del Gestor de Banners en `AdminDashboardView.tsx`
- **Sub-pestañas dentro del Gestor de Banners y Contenidos:**
  1. **Sliders Hero Principales:** Formulario con previsualización en vivo, gradientes preestablecidos oficiales (#212955, #F07F00, etc.), edición de textos de campaña, precios, cuotas y redirecciones.
  2. **Banner Panorámico 4x4 (Power Banner):** Edición directa del banner central con personalización del producto izquierdo (ej. Barra Antivuelco Keko), producto derecho (ej. Winche Warn) y botón de llamado a la acción.
  3. **Tarjetas de Oferta & Servicios (Top y Bottom Grids):** Edición de las 4 tarjetas superiores e inferiores con actualización de imágenes, cuotas bancarias, precios tachados y stock disponible.
  4. **Centro de Sincronización Rápida:** Botón para actualizar y sincronizar todos los banners a la última versión con un solo clic.

---

## 3. Integración en Tiempo Real en la Página de Inicio (`HomeView.tsx`)
- Conectar `HomeView.tsx` para consumir los banners panorámicos y las tarjetas de vitrina desde el contexto global, permitiendo que cualquier cambio guardado desde el panel de administración se refleje de inmediato en la tienda pública sin recargar.

---

## 4. Verificación y Disciplina de Diseño
- Aplicar esquinas rectas a 90° (`rounded-none`) en todos los controles y paneles nuevos del administrador.
- Validar la compilación mediante `lint_applet` y `compile_applet`.
