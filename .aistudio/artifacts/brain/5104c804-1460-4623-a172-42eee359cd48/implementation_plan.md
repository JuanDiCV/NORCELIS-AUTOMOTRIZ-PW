# Plan de Implementación: Administración de Categorías Cinemáticas y Marcas Oficiales en Panel Admin

Habilitar la gestión completa, interactiva y persistente de las tarjetas de categorías (fondos, nombres, subtítulos) y de la pasarela de marcas oficiales (logos, nombres, especialidades, creación y eliminación) desde una nueva pestaña dedicada **"Marcas & Categorías"** en `AdminDashboardView`.

---

## 1. Arquitectura de Estado y Persistencia (`AppContext.tsx`)

1. **Tipos e Interfaces**:
   - `CinematicCategory`: `code`, `name`, `subtitle`, `image`, `tag`, `badge`, `count`.
   - `OfficialBrand`: `code`, `name`, `iconText`, `logoUrl?`, `tag`, `origin`.

2. **Estados en `AppContext`**:
   - `homeCategories`: Arreglo de categorías persistido en `localStorage` (`norcelis_home_categories`), con respaldo en las 6 líneas predeterminadas.
   - `officialBrands`: Arreglo de marcas oficiales persistido en `localStorage` (`norcelis_official_brands`), con respaldo en las 12 marcas oficiales predeterminadas.

3. **Métodos Expuestos**:
   - `updateHomeCategory(code: string, updated: Partial<CinematicCategory>)`: Actualiza fotos de fondo, textos y tags de cada categoría.
   - `resetHomeCategories()`: Restablece las categorías a sus valores originales.
   - `addOfficialBrand(brand: OfficialBrand)`: Agrega una nueva marca a la pasarela continua.
   - `updateOfficialBrand(code: string, updated: Partial<OfficialBrand>)`: Modifica una marca existente.
   - `deleteOfficialBrand(code: string)`: Elimina una marca de la pasarela.
   - `resetOfficialBrands()`: Restablece la lista oficial de marcas predeterminadas.

---

## 2. Nueva Pestaña en el Panel de Administración (`AdminDashboardView.tsx`)

1. **Nueva Pestaña en Barra de Navegación**:
   - Pestaña: **"Marcas & Categorías"** (`activeTab === 'brands_categories'`).
   - Icono representativo: `branding_watermark` o `category`.

2. **Sección A: Gestión de Tarjetas de Categorías Cinemáticas**:
   - Cuadrícula visual con previsualización en vivo de cada tarjeta.
   - Botón **"Editar Tarjeta"** que abre modal con:
     - Nombre de la categoría (ej: "SUSPENSIÓN OFF-ROAD")
     - Subtítulo descriptivo
     - URL de la Imagen de Fondo (con previsualizador instantáneo, botón para probar URLs de Unsplash / CDN y presets de alta definición)
     - Tag superior (ej: "LÍNEA COMPETICIÓN")
     - Badge técnico (ej: "Fox & Trakko")
     - Conteo de repuestos vinculados
   - Botón de restablecer valores de fábrica.

3. **Sección B: Gestión de la Pasarela de Marcas Oficiales (Marquee)**:
   - Botón destacado **"+ Agregar Nueva Marca Oficial"**.
   - Tabla y tarjetas de marcas con:
     - Logotipo / Sigla gráfica (`iconText` o imagen)
     - Nombre comercial (ej: "TOYOTA GENUINO", "BREMBO")
     - Código de filtro del catálogo
     - Especialidad automotriz
     - País de procedencia (con bandera / origen)
     - Botones de acción: **Editar** y **Eliminar**.
   - Modal para crear / editar marcas con validación en tiempo real.
   - Botón para restaurar la lista oficial de marcas de fábrica.

---

## 3. Conexión en Tiempo Real con la Página Principal (`HomeView.tsx`)

- Reemplazar las constantes locales en `HomeView.tsx` para que consuman `homeCategories` y `officialBrands` directamente de `useApp()`.
- Cualquier cambio realizado en el panel Admin (por ejemplo, cambiar la foto de suspensión o agregar una nueva marca deportiva a la pasarela) se reflejará al instante en la página principal sin recargar la aplicación.

---

## 4. Verificación y Pruebas
1. Acceder al panel de administración (usuario Administrador).
2. Entrar a la nueva pestaña **"Marcas & Categorías"**.
3. Cambiar la imagen de fondo de una categoría (ej. Frenos Deportivos) y verificar que en la página principal cambie de inmediato.
4. Agregar una nueva marca oficial (ej. "SPARCO Racing", "K&N Engineering") y verificar que se integre a la pasarela continua infinita.
5. Ejecutar `lint_applet` y `compile_applet` para garantizar cero errores de tipos y compilación.
