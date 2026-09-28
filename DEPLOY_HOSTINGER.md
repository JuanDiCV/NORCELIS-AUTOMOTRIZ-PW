# Guía de Adaptación y Despliegue en Hostinger: Nor Celis Automotriz

Esta guía explica cómo publicar la nueva plataforma web de **Nor Celis Automotriz** en tu servidor de **Hostinger**, reemplazando la web pública anterior de WordPress y **conservando intacta la intranet corporativa existente**.

---

## 1. Arquitectura de Integración

- **Frontend Público:** Aplicación web moderna (React + TypeScript + Tailwind CSS).
- **Servidor:** Hostinger (LiteSpeed / Apache) con PHP y MySQL.
- **Intranet Existente:** Ubicada en la subcarpeta `/intranet` o en el subdominio `intranet.norcelis.pe`.
- **Enrutamiento:** El archivo `.htaccess` incluido redirige las rutas del sitio web público sin tocar ni alterar la carpeta de la intranet.

---

## 2. Configuración Centralizada (`src/config/siteConfig.ts`)

Todos los parámetros clave están centralizados en un único archivo:
- `intranetUrl`: Enlace directo al acceso de colaboradores (ej. `https://norcelis.pe/intranet`).
- `apiBaseUrl`: URL de la API de WordPress o PHP si deseas consumir datos dinámicos.
- `enableRemoteApi`: Alterna entre datos locales (alta velocidad) y consultas a base de datos remota.
- Datos de contacto: RUC, teléfono, WhatsApp corporativo, dirección en Cajamarca y horarios de atención.

---

## 3. Pasos para Compilar y Desplegar en Hostinger

### Paso 1: Generar los archivos de producción
En la terminal del proyecto, ejecuta:
```bash
npm run build
```
Esto creará una carpeta llamada `dist/` con todos los archivos optimizados (HTML, CSS, JS, imágenes y el archivo `.htaccess`).

### Paso 2: Conectarse a Hostinger
1. Inicia sesión en tu cuenta de [Hostinger hPanel](https://hpanel.hostinger.com).
2. Ve a **Sitios Web** -> Selecciona `norcelis.pe` -> Haz clic en **Administrar**.
3. Abre el **Administrador de Archivos (File Manager)** y entra a la carpeta `public_html`.

### Paso 3: Resguardar la Intranet existente
1. Verifica que la carpeta `intranet` (o subdominio correspondiente) esté presente en `public_html`.
2. **NO borres** la carpeta `intranet/`, ni las bases de datos asociadas en MySQL.
3. Puedes hacer una copia de seguridad o renombrar los archivos antiguos de la web anterior (excepto la intranet).

### Paso 4: Subir los nuevos archivos
1. Sube todo el contenido de la carpeta `dist/` directamente a `public_html/`.
   - `index.html`
   - `.htaccess`
   - Carpeta `assets/`
   - Logo y recursos estáticos
2. Asegúrate de que el archivo `.htaccess` esté en la raíz de `public_html/`.

---

## 4. Reglas del archivo `.htaccess`

El archivo `.htaccess` ya viene configurado para:
1. **Ignorar `/intranet/`**: Cualquier solicitud a `norcelis.pe/intranet` se transfiere directamente al sistema existente de Hostinger sin interferencia de la SPA.
2. **Soportar rutas React**: Permite recargar páginas como `/cars`, `/parts`, `/services` sin que Hostinger devuelva error 404.
3. **Optimización**: Aplica compresión GZIP/Brotli y cabeceras de seguridad.

---

## 5. Acceso a la Intranet desde la Web

Se han habilitado accesos directos elegantes e institucionales:
1. **Header (Barra superior):** Botón "Intranet" en el menú de usuario / colaboradores.
2. **Footer (Pie de página):** Enlace destacado en la sección institucional con tooltip explicativo.
3. Ambos enlaces redirigen de manera segura con `target="_blank"` y atributos de protección `noopener,noreferrer`.
