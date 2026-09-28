# Plan de Implementación: Adaptación a Hostinger y Arquitectura Modular por Servicios para Nor Celis

Este plan estructura la base de código de la aplicación para que sea 100% adaptable a la infraestructura actual de Nor Celis Automotriz en Hostinger, reemplazando la web pública de WordPress y enlazando de forma transparente y segura con su Intranet corporativa preexistente.

---

## 1. Configuración Centralizada de Entornos y Hostinger (`src/config/siteConfig.ts`)
- **Propósito**: Desacoplar todas las URLs fijas, endpoints de API y enlaces corporativos para que el equipo técnico pueda modificarlos en un único archivo sin tener que buscar en múltiples componentes.
- **Detalle de configuración**:
  - `INTRANET_URL`: URL oficial de la Intranet en Hostinger (ej. `https://intranet.norcelis.pe` o `https://norcelis.pe/intranet`), editable y configurable.
  - `WORDPRESS_API_BASE`: Endpoint base para la API REST de WordPress (`/wp-json/wp/v2/` o `/wp-json/norcelis/v1/`) si se desea consumir publicaciones, vehículos o citas en el futuro.
  - `COMPANY_INFO`: Datos institucionales de Nor Celis (RUC, dirección fiscal en Cajamarca, teléfonos de central, WhatsApp oficial de soporte y ventas).
  - `HOSTINGER_DEPLOY_TARGET`: Configuración del `basePath` y modo de despliegue en `public_html`.

---

## 2. Capa Modular de Servicios (`src/services/`)
- **Propósito**: Ordenar el código separando la lógica de datos de la interfaz visual, permitiendo que la web funcione actualmente con almacenamiento reactivo local y pueda conectarse a la base de datos de Hostinger / WordPress con solo cambiar un interruptor en el servicio.
- **Módulos a crear**:
  1. `src/services/apiClient.ts`: Cliente HTTP estándar con gestión de peticiones, timeout y manejo uniforme de respuestas.
  2. `src/services/intranetService.ts`: Gestor de enlace y redirección segura hacia la Intranet corporativa en Hostinger, con validación de destino y registro de accesos.
  3. `src/services/vehiclesService.ts`: Capa de datos para vehículos seminuevos y 0km, preparada para alternar entre almacenamiento local o consulta a MySQL/REST API de Hostinger.
  4. `src/services/partsService.ts`: Capa de datos para repuestos OEM y accesorios.
  5. `src/services/workshopService.ts`: Capa de gestión para citas de taller, cotizaciones y estados de mantenimiento.
  6. `src/services/authService.ts`: Abstracción para control de sesiones, roles (`admin` / `customer`) y credenciales de acceso.

---

## 3. Botón de Acceso Seguro y Redirección Directa a la Intranet
- **Ubicación e Integración**:
  - **Header / Menú de Usuario**: Botón o ítem distinguido "Intranet Corporativa" con insignia institucional Nor Celis para personal autorizado y colaboradores.
  - **Footer**: Enlace formal en la columna institucional/técnica con tooltip explicativo.
  - **Modal de Redirección Segura (`IntranetRedirectModal`)**: Al hacer clic, ofrece un breve diálogo de confirmación corporativa ("Acceso a la Intranet Nor Celis en Hostinger") con apertura directa o redirección segura, asegurando que los colaboradores no pierdan su sesión y accedan al entorno privado de la empresa.

---

## 4. Archivos de Despliegue para Hostinger (`public/.htaccess` y Guía de Despliegue)
- **Soporte SPA en Hostinger (Apache / LiteSpeed)**:
  - Creación del archivo `public/.htaccess` que se compilará automáticamente en la carpeta `dist/` para resolver el error 404 común en servidores de Hostinger cuando un usuario recarga una ruta interna en React SPA (RewriteEngine on, RewriteRule ^index\.html$ - [L], RewriteCond %{REQUEST_FILENAME} !-f, RewriteRule . /index.html [L]).
  - Optimización de cabeceras de caché para assets estáticos (CSS, JS, imágenes SVG/WebP) y compresión GZIP.
- **Documentación de Despliegue (`DEPLOYMENT_HOSTINGER.md`)**:
  - Guía clara paso a paso para el administrador de sistemas de Nor Celis: cómo compilar con `npm run build`, subir el contenido de `dist/` al `public_html` de Hostinger sin sobreescribir la carpeta o subdominio de la Intranet, y conservar los correos corporativos y certificados SSL de Hostinger.

---

## 5. Verificación y Pruebas
- Validación de compilación (`compile_applet`) y análisis de sintaxis (`lint_applet`).
- Verificación del comportamiento del botón de acceso a la Intranet tanto para colaboradores como en el Footer.
- Comprobación del correcto aislamiento del carrito y favoritos según las reglas implementadas previamente.
