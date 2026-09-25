# Gestión Completa de Mi Garaje Virtual (Eliminar y Editar Vehículos)

Permite a los usuarios gestionar su flota personal en el Garaje Virtual con capacidades completas para **eliminar vehículos obsoletos o erróneos** y **editar datos directamente** (marca, modelo, año, placa y motorización), con persistencia en tiempo real y selección automática de vehículo alternativo si se borra el vehículo activo.

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Confirmadas a través de la consulta previa:
> - **Comportamiento al eliminar el vehículo activo**: El sistema seleccionará de forma automática e inteligente el siguiente vehículo disponible en la lista del garaje virtual para mantener siempre activos los filtros de compatibilidad. Si se elimina el último vehículo, se creará o restaurará el vehículo base estándar.
> - **Gestión de corrección de errores**: Se incluye tanto el botón de **Eliminar con confirmación de seguridad** (evitando borrados accidentales) como la opción de **Editar datos del vehículo** (para corregir modelo, año o placa con 1 solo clic sin tener que reingresar todo).

---

## 1. Visión General & Flujo de Usuario

### Experiencia del Usuario
1. **Pestaña "Mis Vehículos Guardados"**:
   - Cada vehículo en la lista mostrará sus datos (marca, modelo, año, placa, motorización) junto con acciones rápidas:
     - **Seleccionar / Activar**: Pasa a ser el vehículo de referencia para filtros de repuestos y accesorios.
     - **Editar (Icono de Lápiz)**: Abre el editor en línea o formulario con los valores precargados para corregir errores rápidamente.
     - **Eliminar (Icono de Papelera)**: Muestra un diálogo de confirmación ("¿Deseas eliminar este vehículo de tu garaje?").
2. **Pestaña "Registrar / Editar Vehículo"**:
   - Permite agregar nuevos autos o guardar cambios del auto que se está editando.
   - Si se edita el auto activo, los filtros y compatibilidad se actualizan inmediatamente en toda la tienda (catálogos, fichas de producto y banner superior).
3. **Persistencia**:
   - La lista de vehículos del garaje y el vehículo activo se guardan en el estado global (`AppContext`) y se sincronizan con `localStorage` para que no se pierdan al recargar.

---

## 2. Arquitectura de Componentes & Flujo de Datos

```
┌────────────────────────────────────────────────────────────────────────┐
│ AppContext (garageVehicles, activeGarage, deleteVehicle, editVehicle)  │
│  ├─ localStorage ('norcelis_garage_vehicles', 'norcelis_active_garage')│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌────────────────────────────┐
    │ GarageModal.tsx           │           │ Header & Views             │
    │  ├─ List of Vehicles      │           │  ├─ Active Garage Pill     │
    │  │   ├─ Active Badge      │           │  ├─ Parts Compatibility    │
    │  │   ├─ Edit Trigger      │           │  └─ VIN Quick Check        │
    │  │   └─ Delete Confirm    │           └────────────────────────────┘
    │  └─ Add/Edit Form         │
    └───────────────────────────┘
```

---

## 3. Plan de Cambios Técnicos

1. **Estado en `src/context/AppContext.tsx`**:
   - Declarar `garageVehicles: ActiveGarageVehicle[]` inicializado desde `localStorage` o `AVAILABLE_GARAGE_VEHICLES`.
   - Añadir métodos:
     - `addGarageVehicle(vehicle: ActiveGarageVehicle)`
     - `updateGarageVehicle(indexOrVin: string, updated: Partial<ActiveGarageVehicle>)`
     - `deleteGarageVehicle(indexOrVin: string)` (con fallback inteligente para `activeGarage`).
2. **Interfaz en `src/components/GarageModal.tsx`**:
   - Acciones de tarjeta: botón de editar (`edit`) y eliminar (`delete_forever`).
   - Modal de confirmación de eliminación con nombre del auto.
   - Modo de edición con formulario reutilizable y botón "Actualizar Vehículo".
3. **Notificaciones & Toasts**:
   - Confirmación mediante `showToast` tras eliminar, editar o registrar.
