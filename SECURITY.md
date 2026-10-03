# Seguridad — Nor Celis Automotriz

Ningún sitio es "imposible de vulnerar". Este documento explica qué protege hoy el proyecto, cómo
verificarlo y qué debes configurar al publicarlo.

## Cómo verificar (todo automatizado)

```bash
npm run test:security   # ataques HTTP reales, análisis estático, fuzzing, rutas y pantallas
npm test                # toda la suite
npm audit               # vulnerabilidades conocidas en dependencias
```

| Archivo de prueba | Qué hace |
|---|---|
| `security.http.test.ts` | Levanta el servidor de **producción** y lo ataca: recorrido de directorios, sesiones falsificadas, cuerpos malformados, contaminación de prototipos, evasión de límites con IP falsa, condiciones de carrera con cupones, inyección de cabeceras en correos, etc. |
| `security.static.test.ts` | Escanea el código: sin `eval`, sin `innerHTML`, enlaces con `noopener`, sin secretos, todas las rutas de escritura con límite de peticiones, todas las de administración con sesión. |
| `security.fuzz.test.ts` | Miles de entradas aleatorias y hostiles (con semilla fija) contra toda la lógica que procesa datos del cliente. |
| `routes.test.ts`, `views.render.test.tsx` | Cada pantalla tiene URL, cada URL abre su pantalla, enlaces maliciosos no tumban el sitio. |

## Lista de verificación antes de publicar

1. **`NODE_ENV=production`** y el servidor Node corriendo (`npm run build` y luego `npm start`). Sin Node,
   no existen `/api/claims`, `/api/coupons`, ni la verificación de placa: el Libro de Reclamaciones y los
   cupones no funcionarán.
2. **HTTPS obligatorio.** El servidor envía HSTS en producción; el certificado lo da tu hosting.
3. **`ADMIN_PASSWORD`** (mínimo 10 caracteres, larga y única) en el `.env` del servidor. Sin ella, el panel
   de cupones queda deshabilitado.
4. **`TRUST_PROXY`**:
   - Sin proxy delante del servidor, o proxy en la misma máquina: no definas nada (valor seguro por defecto).
   - Con un proxy/balanceador (Hostinger, Nginx, Cloudflare…): `TRUST_PROXY=1` (número de proxies).
   - **Nunca** lo dejes abierto: si el servidor confiara en `X-Forwarded-For` de cualquiera, un atacante
     evitaría todos los límites de peticiones (fuerza bruta de la clave de administrador, spam de reclamos).
5. **`.env` nunca en git** (ya está en `.gitignore`). Rota cualquier clave que alguna vez se haya compartido.
6. **Respaldo de `data/`** (cupones, canjes, reclamos). Contiene datos personales (Ley N° 29733): acceso
   restringido y fuera de carpetas públicas. Puedes moverla con `COUPONS_DATA_DIR` / `CLAIMS_DATA_DIR`.
7. **SMTP configurado** para que el Libro de Reclamaciones envíe la copia al consumidor.
8. **Repositorio privado** si no quieres que el código sea público, y revisa el flujo `static.yml` (publica
   el repositorio completo en GitHub Pages).
9. **Cuentas bancarias reales** en `src/data/bankAccountsData.ts` (los datos actuales son de ejemplo).

## Qué está protegido

- Cabeceras: CSP estricta en producción (sin scripts en línea ni `eval`), HSTS, `X-Frame-Options`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP; sin `X-Powered-By`; sin CORS abierto.
- Respuestas de la API sin caché (`no-store`) y errores genéricos (nunca trazas ni rutas internas).
- Límites de peticiones por IP real en todas las rutas de escritura; protección contra fuerza bruta del
  acceso de administrador; tope diario de reclamos por correo (anti-spam).
- Control de `Origin` en peticiones que modifican datos (evita que otra web las dispare).
- Sesión de administrador firmada (HMAC), de 8 horas, comparaciones en tiempo constante; el token vive solo en
  `sessionStorage`.
- Cupones: el servidor decide validez, vigencia, topes y límites de uso; canje atómico (sin carreras);
  entradas sanitizadas; no revela qué códigos existen.
- Chat con IA: entrada acotada, contexto limpiado contra inyección de instrucciones, sin secretos en el prompt.
- Reclamos/correos: validación estricta de destinatarios (sin inyección de cabeceras ni múltiples
  destinatarios), HTML escapado.

## Limitaciones conocidas (arquitectura actual)

- **Cuentas de clientes y administrador del panel viven en el navegador** (`localStorage`). El PIN del panel
  solo oculta pantallas; no protege datos. Para una seguridad real de cuentas se necesita un backend con
  base de datos. Mientras tanto, lo sensible (cupones) usa la clave del servidor.
- **Los pedidos y el pago están simulados en el navegador.** El servidor valida el cupón, pero el total del
  pedido lo arma el cliente. Para blindarlo, los pedidos y el cobro de Culqi deben pasar por el servidor.
- El límite de usos por cliente depende del correo o DNI que se escriba.
- Otras pestañas del panel (banners, ofertas, catálogo) guardan sus cambios solo en el navegador de quien edita.

## Reportar un problema

Escribe a gerencia@norcelis.com con el detalle y los pasos para reproducirlo.
