# Plan de Implementación: Notificaciones Web de Cambios de Precio para 'Mi Garaje'

Implementación de un servicio de notificaciones web mediante la API estándar de `Notification` del navegador para alertar sobre variaciones de precios en los vehículos guardados en **Mi Garaje**, con activación por interruptor, verificación manual y notificaciones compactas.

---

## 1. Arquitectura y Servicio de Notificaciones

### 1.1 Módulo `notificationService.ts`
- **Soporte y Detección**: Verificación de compatibilidad con `window.Notification` en el navegador.
- **Gestión de Permisos**:
  - Consulta de estado actual: `'default' | 'granted' | 'denied'`.
  - Solicitud explícita de permiso al activar el interruptor de alertas (`Notification.requestPermission()`).
- **Persistencia de Preferencias**:
  - Almacenamiento en `localStorage` del estado de suscripción de alertas (`norcelis_garage_price_alerts_enabled`).
  - Almacenamiento de snapshots de precios (`norcelis_garage_price_snapshots`) para detectar variaciones reales frente al catálogo oficial de Nor Celis.
- **Despacho de Notificación Compacta**:
  - Emisión de notificación nativa con título del vehículo, nuevo precio en Soles (S/) y logo/ícono institucional.
  - Manejo del evento `onclick` para enfocar la pestaña y abrir la ficha del vehículo correspondiente.

---

## 2. Integración en la Interfaz de Usuario (UI & UX)

### 2.1 Sección de Alertas en `GarageModal.tsx`
- **Interruptor de Alertas de Precio**:
  - Control tipo switch toggle intuitivo en el modal de Mi Garaje.
  - Al activarse, solicita de inmediato el permiso del navegador si aún no ha sido concedido.
  - Indicador de estado: *Activo*, *Inactivo* o *Bloqueado por el navegador* con guía para desbloquear.
- **Botón de Verificación Manual**:
  - Botón *"Verificar Variaciones de Precio"* según la preferencia del usuario.
  - Compara los precios actuales de los autos guardados frente al catálogo de vehículos de Nor Celis.
  - Si se detecta un cambio de precio o si se ejecuta la comprobación de prueba, dispara la notificación web compacta con el nuevo precio y muestra un feedback toast en la interfaz.

---

## 3. Pruebas y Validación

1. **Prueba de Permisos**:
   - Activar el interruptor en `GarageModal` y validar la solicitud de permiso del navegador.
   - Verificar persistencia en `localStorage` tras recargar o cambiar de sesión.
2. **Prueba de Notificación**:
   - Ejecutar la verificación manual y comprobar que la notificación web se muestre con formato compacto (marca, modelo y precio actualizado).
   - Verificar clic en la notificación para abrir la vista del vehículo.
3. **Verificación de Compilación y Linter**:
   - Ejecutar `compile_applet` y `lint_applet` para asegurar cero errores en TypeScript y React.
