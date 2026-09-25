# Plan de Implementación: Carrusel Promocional Minimalista Estilo Falabella

Transformaremos el carrusel principal (`PromoHeroCarousel.tsx`) para eliminar la sobrecarga de elementos, adoptando el diseño limpio, impactante y de alta legibilidad inspirado exactamente en el banner promocional de **Saga Falabella** enviado por el usuario.

---

## 1. Estructura Visual del Banner (Fórmula Falabella)

Cada diapositiva contará con una composición limpia de 3 zonas equilibradas:

1. **Zona Izquierda (Marca de Campaña & Botón de Acción)**:
   - **Insignia de Campaña**: Badge de alto impacto (ej. `DS Día del Shopping / Día del Repuesto`) con fondo azul eléctrico y tipografía limpia.
   - **Categoría Principal**: Título de campaña en tipografía extendida y nítida (ej. `HERRAMIENTAS & TALLER`, `FRENOS & DISCOS`, `MANTENIMIENTO`, `EQUIPAMIENTO 4X4`).
   - **Botón de Acción Directo**: Botón pill oscuro con texto en mayúsculas `¡VER TODO!` acompañado del círculo con flecha derecha (`>`).

2. **Zona Central / Fondo (Fotografía Nítida de Taller y Producto)**:
   - Imagen de fondo de alta definición con fondo de taller automotriz / mecánico experto.
   - Transición degradada suave hacia el color de campaña a la izquierda para garantizar 100% de contraste y legibilidad.

3. **Zona Derecha (Ficha de Precio de Oportunidad Única)**:
   - Título del producto destacado (ej. `PRETUL / Maletín 104 Herramientas`, `BREMBO / Kit Pastillas Cerámicas`, `MOBIL 1 / Pack Mantenimiento Sintético`).
   - **Caja de Precio Principal (Verde Lima / Amarillo Falabella)**:
     - Badge de promoción exclusiva (`Oportunidad Única` / `Oferta Nor Celis`).
     - Precio destacado en tamaño grande (ej. **S/ 99**, **S/ 280**, **S/ 189**).
   - **Comparador de Precios**:
     - `P. Oferta: S/ 119`
     - `P. Normal: S/ 181.70` (tachado).

4. **Navegación Inferior Minimalista**:
   - Cápsula oscura flotante en el centro inferior con puntos minimalistas (la diapositiva activa se expande en forma de píldora blanca, las inactivas en puntos circulares sutiles).
   - Flechas laterales flotantes sutiles con transición suave al pasar el cursor.
   - Eliminación de barras de progreso saturadas y múltiples bloques de texto redundantes.

---

## 2. Diapositivas Optimizadas

1. **Día del Shopping - Herramientas & Taller**:
   - **Categoría**: `HERRAMIENTAS`
   - **Producto**: Pretul / Juego de 104 Herramientas y Dados Mecánicos.
   - **Precios**: S/ 99 (Oportunidad Única) | P. Oferta: S/ 119 | P. Normal: S/ 181.70.
2. **Día del Repuesto - Frenos & Baterías OEM**:
   - **Categoría**: `FRENOS & DISCOS`
   - **Producto**: Brembo OEM / Pastillas Cerámicas + Líquido DOT4.
   - **Precios**: S/ 149 (Oportunidad Única) | P. Oferta: S/ 189 | P. Normal: S/ 250.00.
3. **Mantenimiento Express - Centro de Servicios**:
   - **Categoría**: `MANTENIMIENTO TALLER`
   - **Producto**: Nor Celis / Mantenimiento Preventivo 10k km + Escaneo 3D.
   - **Precios**: S/ 280 (Oportunidad Única) | P. Oferta: S/ 320 | P. Normal: S/ 420.00.
4. **Cyber 4x4 - Equipamiento Off-Road**:
   - **Categoría**: `EQUIPAMIENTO 4X4`
   - **Producto**: Keko / Barra Antivuelco & Lona Marítima Tri-Fold.
   - **Precios**: S/ 890 (Oportunidad Única) | P. Oferta: S/ 990 | P. Normal: S/ 1,350.00.

---

## 3. Verificación
- Compilación limpia con `npm run lint` y `compile_applet`.
- Verificación de adaptabilidad responsive en desktop, tablet y móviles.
